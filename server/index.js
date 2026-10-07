const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const db = require('./db');
const { mailConfigured, sendMail, buildCourseReceipt } = require('./mailer');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Add it to server/.env');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;

// CORS_ORIGIN can be a comma-separated list (e.g. https://skillifyme.co.in). Defaults to allowing all.
const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : true;
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

// Ensure uploads dir exists
['resumes', 'gallery'].forEach(dir => {
  const dirPath = path.join(__dirname, `uploads/${dir}`);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

const sendError = (res, status, message) => res.status(status).json({ data: null, error: { message } });

// --- TABLE ACCESS RULES ---
// publicRead: anyone can list rows. publicInsert: anyone can add rows. Everything else needs an admin token.
const TABLES = {
  courses: { publicRead: true },
  internships: { publicRead: true },
  reviews: { publicRead: true },
  contact_info: { publicRead: true },
  gallery_items: { publicRead: true },
  contacts: { publicInsert: true },
  students: {},
  applications: {},
  payments: {},
};

// Column names are looked up from the database so only real columns ever reach a query.
const columnCache = {};
async function getColumns(table) {
  if (!columnCache[table]) {
    const result = await db.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      [table]
    );
    columnCache[table] = new Map(result.rows.map(c => [c.column_name, c.data_type]));
  }
  return columnCache[table];
}

async function assertColumns(table, keys) {
  let columns = await getColumns(table);
  // A column may have been added since the list was cached (e.g. after running init-db), so re-check once
  if (keys.some(k => !columns.has(k))) {
    delete columnCache[table];
    columns = await getColumns(table);
  }
  const bad = keys.find(k => !columns.has(k));
  if (bad) {
    const err = new Error(`Unknown column "${bad}" on ${table}`);
    err.status = 400;
    throw err;
  }
  return columns;
}

// pg sends JS arrays as Postgres arrays, so JSON columns need explicit serialisation.
// Empty form fields ('') become NULL for non-text columns such as numbers and dates.
const toDbValue = (value, dataType) => {
  if (value === undefined) return null;
  if (value === '' && dataType !== 'text') return null;
  if ((dataType === 'jsonb' || dataType === 'json') && value !== null) return JSON.stringify(value);
  return value;
};

// --- AUTH MIDDLEWARE ---
const readUser = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

const authenticateToken = (req, res, next) => {
  const user = readUser(req);
  if (!user) return sendError(res, 401, 'Not authorised. Please log in again.');
  req.user = user;
  next();
};

const validateTable = (req, res, next) => {
  if (!TABLES[req.params.table]) return sendError(res, 400, 'Invalid table');
  next();
};

// --- AUTHENTICATION ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return sendError(res, 400, 'Email and password are required');
  try {
    const result = await db.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    const user = result.rows[0];
    const match = user && await bcrypt.compare(password, user.password_hash);
    if (!match) return sendError(res, 401, 'Invalid credentials');

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ data: { session: { access_token: token, user: { id: user.id, email: user.email } } }, error: null });
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ data: { user: req.user } });
});

// --- UPLOADS ---
const makeUploader = (folder, allowed, maxMb) => multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, `uploads/${folder}`)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: maxMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowed(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error('File type not allowed'), { status: 400 }));
  },
});

const resumeUpload = makeUploader('resumes', (type) => type === 'application/pdf', 5);
const imageUpload = makeUploader('gallery', (type) => /^image\/(jpeg|png|webp|gif)$/.test(type), 5);

const handleUpload = (uploader, folder) => (req, res) => {
  uploader.single('file')(req, res, (err) => {
    if (err) return sendError(res, err.status || 400, err.message);
    if (!req.file) return sendError(res, 400, 'No file uploaded');
    const url = `${req.protocol}://${req.get('host')}/uploads/${folder}/${req.file.filename}`;
    res.json({ data: { path: req.file.filename, publicUrl: url }, error: null });
  });
};

app.post('/api/upload/resumes', handleUpload(resumeUpload, 'resumes'));
app.post('/api/upload/gallery', authenticateToken, handleUpload(imageUpload, 'gallery'));

// --- ROLL NUMBERS (course enrollments) ---
// Format: 2-digit year + course code + 6-digit counter, e.g. 26DEV000001.
// There is one counter per year and course code, so each course starts at 000001 every year.
const rollYear = () => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', year: '2-digit' }).format(new Date());
const codeFromTitle = (title) => (String(title || '').toUpperCase().replace(/[^A-Z0-9]/g, '') + 'XXX').slice(0, 3);

// Gives an enrolled course application its roll number (once); returns it, or null for internships
async function assignRollNumber(applicationId) {
  const appRes = await db.query(
    `SELECT a.roll_number, a.course_id, c.code, c.title
     FROM applications a LEFT JOIN courses c ON c.id = a.course_id
     WHERE a.id = $1`,
    [applicationId]
  );
  const application = appRes.rows[0];
  if (!application || !application.course_id) return null;
  if (application.roll_number) return application.roll_number;

  const prefix = rollYear() + (application.code || codeFromTitle(application.title));
  const counterRes = await db.query(
    `INSERT INTO roll_counters (prefix, last_value) VALUES ($1, 1)
     ON CONFLICT (prefix) DO UPDATE SET last_value = roll_counters.last_value + 1
     RETURNING last_value`,
    [prefix]
  );
  const rollNumber = prefix + String(counterRes.rows[0].last_value).padStart(6, '0');

  // Only set it if no other request got there first
  const updated = await db.query(
    `UPDATE applications SET roll_number = $1 WHERE id = $2 AND roll_number IS NULL RETURNING roll_number`,
    [rollNumber, applicationId]
  );
  if (updated.rows[0]) return rollNumber;
  const current = await db.query('SELECT roll_number FROM applications WHERE id = $1', [applicationId]);
  return current.rows[0]?.roll_number || null;
}

// Emails the student a receipt (course + amount paid) once per course enrollment.
// Runs in the background: a mail problem never affects the checkout response.
async function sendCourseReceipt(applicationId) {
  if (!mailConfigured()) {
    console.warn('Receipt not emailed: SMTP is not configured in server/.env');
    return;
  }
  // Claim the receipt first so it is sent only once, even if the payment is verified twice
  const claim = await db.query(
    `UPDATE applications SET receipt_sent_at = now()
     WHERE id = $1 AND course_id IS NOT NULL AND receipt_sent_at IS NULL RETURNING id`,
    [applicationId]
  );
  if (!claim.rows[0]) return;

  try {
    const result = await db.query(
      `SELECT s.name, s.email, c.title,
              COALESCE((SELECT p.amount FROM payments p
                        WHERE p.application_id = a.id AND p.status = 'paid'
                        ORDER BY p.created_at DESC LIMIT 1), 0) AS amount
       FROM applications a
       JOIN students s ON s.id = a.student_id
       JOIN courses c ON c.id = a.course_id
       WHERE a.id = $1`,
      [applicationId]
    );
    const row = result.rows[0];
    if (!row) return;
    await sendMail({ to: row.email, ...buildCourseReceipt({ name: row.name, courseTitle: row.title, amount: row.amount }) });
  } catch (error) {
    // Release the claim so a later attempt can send it
    await db.query('UPDATE applications SET receipt_sent_at = NULL WHERE id = $1', [applicationId]).catch(() => {});
    console.error(`Receipt email failed for application ${applicationId}:`, error.message);
  }
}

const sendReceiptInBackground = (applicationId) => {
  sendCourseReceipt(applicationId).catch((error) => console.error('Receipt email failed:', error.message));
};

// Course codes are 3 capital letters / digits; a blank code is stored as NULL
function normaliseCourseCode(item) {
  if (!('code' in item)) return;
  const code = String(item.code || '').trim().toUpperCase();
  if (!code) {
    item.code = null;
    return;
  }
  if (!/^[A-Z0-9]{3}$/.test(code)) {
    throw Object.assign(new Error('Course code must be exactly 3 letters or digits, e.g. DEV'), { status: 400 });
  }
  item.code = code;
}

// Friendlier messages for unique-constraint errors
function describeDbError(error) {
  if (error.code === '23505' && error.constraint === 'courses_code_key') {
    return Object.assign(new Error('That course code is already used by another course'), { status: 409 });
  }
  return error;
}

// --- CHECKOUT (students buying a course or internship) ---
const razorpayConfigured = () => process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

app.post('/api/checkout/start', async (req, res) => {
  const { student = {}, program_type, program_id } = req.body || {};
  const programTable = program_type === 'course' ? 'courses' : program_type === 'internship' ? 'internships' : null;
  if (!programTable || !program_id) return sendError(res, 400, 'Please choose a course or internship');
  if (!student.name || !student.email || !student.phone) return sendError(res, 400, 'Name, email and phone are required');

  try {
    // Price always comes from the database, never from the browser
    const programRes = await db.query(`SELECT id, title, price FROM ${programTable} WHERE id = $1`, [program_id]);
    const program = programRes.rows[0];
    if (!program) return sendError(res, 404, 'That program no longer exists');
    const price = Number(program.price || 0);

    const studentRes = await db.query(
      `INSERT INTO students (name, email, phone, college, degree, branch, passout_year, resume_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email, phone) DO UPDATE SET
         name = EXCLUDED.name, college = EXCLUDED.college, degree = EXCLUDED.degree,
         branch = EXCLUDED.branch, passout_year = EXCLUDED.passout_year,
         resume_url = COALESCE(EXCLUDED.resume_url, students.resume_url)
       RETURNING id`,
      [student.name, student.email, student.phone, student.college || null, student.degree || null,
        student.branch || null, student.passout_year ? String(student.passout_year) : null, student.resume_url || null]
    );
    const studentId = studentRes.rows[0].id;

    const programColumn = program_type === 'course' ? 'course_id' : 'internship_id';
    const appRes = await db.query(
      `INSERT INTO applications (student_id, ${programColumn}, status, payment_status)
       VALUES ($1, $2, 'applied', 'pending') RETURNING id`,
      [studentId, program.id]
    );
    const applicationId = appRes.rows[0].id;

    if (price <= 0) {
      await db.query(`UPDATE applications SET status = 'enrolled', payment_status = 'paid' WHERE id = $1`, [applicationId]);
      const rollNumber = await assignRollNumber(applicationId);
      sendReceiptInBackground(applicationId);
      return res.json({ data: { free: true, application_id: applicationId, roll_number: rollNumber }, error: null });
    }

    if (!razorpayConfigured()) return sendError(res, 503, 'Online payments are not set up yet. Please contact us.');

    const amountPaise = Math.round(price * 100);
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt: applicationId, notes: { application_id: applicationId } }),
    });
    const order = await orderRes.json();
    if (!orderRes.ok) return sendError(res, 502, order.error?.description || 'Could not start payment');

    await db.query(
      `INSERT INTO payments (student_id, ${programColumn}, application_id, amount, order_id, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [studentId, program.id, applicationId, price, order.id]
    );

    res.json({
      data: {
        free: false,
        application_id: applicationId,
        order_id: order.id,
        amount: amountPaise,
        currency: 'INR',
        key_id: process.env.RAZORPAY_KEY_ID,
        title: program.title,
      },
      error: null,
    });
  } catch (error) {
    console.error('Checkout start failed:', error);
    sendError(res, 500, 'Something went wrong. Please try again.');
  }
});

app.post('/api/checkout/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return sendError(res, 400, 'Missing payment details');
  if (!razorpayConfigured()) return sendError(res, 503, 'Online payments are not set up');

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  const valid = expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
  if (!valid) return sendError(res, 400, 'Payment could not be verified');

  try {
    const paymentRes = await db.query(
      `UPDATE payments SET status = 'paid', payment_id = $1 WHERE order_id = $2 RETURNING application_id`,
      [razorpay_payment_id, razorpay_order_id]
    );
    const payment = paymentRes.rows[0];
    if (!payment) return sendError(res, 404, 'Order not found');
    await db.query(`UPDATE applications SET status = 'enrolled', payment_status = 'paid' WHERE id = $1`, [payment.application_id]);
    const rollNumber = await assignRollNumber(payment.application_id);
    sendReceiptInBackground(payment.application_id);
    res.json({ data: { success: true, roll_number: rollNumber }, error: null });
  } catch (error) {
    console.error('Checkout verify failed:', error);
    sendError(res, 500, 'Payment received but could not be recorded. Please contact support.');
  }
});

app.post('/api/checkout/failed', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id } = req.body || {};
  if (!razorpay_order_id) return sendError(res, 400, 'Missing order id');
  try {
    // Only a still-pending payment can be marked failed
    await db.query(
      `UPDATE payments SET status = 'failed', payment_id = COALESCE($1, payment_id) WHERE order_id = $2 AND status = 'pending'`,
      [razorpay_payment_id || null, razorpay_order_id]
    );
    res.json({ data: { success: true }, error: null });
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

// Special endpoints for Dashboard Stats
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    const [courses, internships, students, applications, payments, gallery] = await Promise.all([
      db.query('SELECT count(*) FROM courses'),
      db.query('SELECT count(*) FROM internships'),
      db.query('SELECT count(*) FROM students'),
      db.query('SELECT count(*) FROM applications'),
      db.query("SELECT amount FROM payments WHERE status = 'paid'"),
      db.query('SELECT count(*) FROM gallery_items'),
    ]);
    res.json({
      data: {
        courses: parseInt(courses.rows[0].count),
        internships: parseInt(internships.rows[0].count),
        students: parseInt(students.rows[0].count),
        applications: parseInt(applications.rows[0].count),
        payments: payments.rows,
        gallery: parseInt(gallery.rows[0].count)
      },
      error: null
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

// --- GENERIC CRUD ---
// Basic implementation to replace Supabase .from() logic.

// Applications and payments are shown with the related student / internship / course attached
const RELATIONS = {
  applications: true,
  payments: true,
};

async function attachRelations(rows) {
  const lookup = async (table, columns, ids) => {
    const unique = [...new Set(ids.filter(Boolean))];
    if (unique.length === 0) return new Map();
    const result = await db.query(`SELECT ${columns} FROM ${table} WHERE id = ANY($1)`, [unique]);
    return new Map(result.rows.map(r => [r.id, r]));
  };
  const [students, internships, courses] = await Promise.all([
    lookup('students', '*', rows.map(r => r.student_id)),
    lookup('internships', 'id, title', rows.map(r => r.internship_id)),
    lookup('courses', 'id, title', rows.map(r => r.course_id)),
  ]);
  return rows.map(r => ({
    ...r,
    student: students.get(r.student_id) || null,
    internship: internships.get(r.internship_id) || null,
    course: courses.get(r.course_id) || null,
  }));
}

app.get('/api/:table', validateTable, async (req, res) => {
  const { table } = req.params;
  if (!TABLES[table].publicRead && !readUser(req)) return sendError(res, 401, 'Not authorised');

  try {
    const columns = await getColumns(table);
    const filters = Object.entries(req.query).filter(([key]) => !['limit', 'order', 'count'].includes(key));
    await assertColumns(table, filters.map(([key]) => key));

    const values = filters.map(([, val]) => val);
    const where = filters.length > 0
      ? ' WHERE ' + filters.map(([key], i) => `"${key}" = $${i + 1}`).join(' AND ')
      : '';

    let query = `SELECT * FROM ${table}${where}`;

    const orders = [].concat(req.query.order || []);
    const orderSql = orders.map(o => {
      const [col, dir] = String(o).split('.');
      if (!columns.has(col)) throw Object.assign(new Error(`Unknown column "${col}"`), { status: 400 });
      return `"${col}" ${dir === 'desc' ? 'DESC' : 'ASC'}`;
    });
    if (orderSql.length > 0) query += ` ORDER BY ${orderSql.join(', ')}`;

    const limit = parseInt(req.query.limit);
    if (limit > 0) query += ` LIMIT ${Math.min(limit, 1000)}`;

    const result = await db.query(query, values);
    let rows = result.rows;
    if (RELATIONS[table]) rows = await attachRelations(rows);

    let count = null;
    if (req.query.count === 'exact') {
      const countRes = await db.query(`SELECT count(*) FROM ${table}${where}`, values);
      count = parseInt(countRes.rows[0].count);
    }
    res.json({ data: rows, count, error: null });
  } catch (error) {
    sendError(res, error.status || 500, error.message);
  }
});

app.post('/api/:table', validateTable, async (req, res) => {
  const { table } = req.params;
  if (!TABLES[table].publicInsert && !readUser(req)) return sendError(res, 401, 'Not authorised');

  const isArray = Array.isArray(req.body);
  const items = isArray ? req.body : [req.body];
  if (items.length === 0) return res.json({ data: [], error: null });

  try {
    if (table === 'courses') items.forEach(normaliseCourseCode);
    const keys = Object.keys(items[0]).filter(k => k !== 'id');
    const columns = await assertColumns(table, keys);

    const placeholders = items.map((item, i) => `(${keys.map((_, j) => `$${i * keys.length + j + 1}`).join(', ')})`).join(', ');
    const values = items.flatMap(item => keys.map(k => toDbValue(item[k], columns.get(k))));
    const query = `INSERT INTO ${table} (${keys.map(k => `"${k}"`).join(', ')}) VALUES ${placeholders} RETURNING *`;

    const result = await db.query(query, values);
    res.json({ data: isArray ? result.rows : result.rows[0], error: null });
  } catch (error) {
    const err = describeDbError(error);
    sendError(res, err.status || 500, err.message);
  }
});

app.put('/api/:table/:id', authenticateToken, validateTable, async (req, res) => {
  const { table, id } = req.params;
  try {
    // Relation objects added by GET are not real columns
    const body = { ...(req.body || {}) };
    if (table === 'courses') normaliseCourseCode(body);
    const keys = Object.keys(body).filter(k => !['id', 'student', 'internship', 'course'].includes(k));
    if (keys.length === 0) return sendError(res, 400, 'Nothing to update');
    const columns = await assertColumns(table, keys);

    const values = keys.map(k => toDbValue(body[k], columns.get(k)));
    const setString = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const result = await db.query(`UPDATE ${table} SET ${setString} WHERE id = $${keys.length + 1} RETURNING *`, [...values, id]);

    // An admin enrolling a course application (e.g. after an offline payment) also issues a roll number
    if (table === 'applications') {
      for (const row of result.rows) {
        if (row.status === 'enrolled') row.roll_number = await assignRollNumber(row.id);
      }
    }
    res.json({ data: result.rows, error: null });
  } catch (error) {
    const err = describeDbError(error);
    sendError(res, err.status || 500, err.message);
  }
});

app.delete('/api/:table/:id', authenticateToken, validateTable, async (req, res) => {
  const { table, id } = req.params;
  try {
    const result = await db.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
    res.json({ data: result.rows, error: null });
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
