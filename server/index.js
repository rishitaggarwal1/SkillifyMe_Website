const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads dir exists
const fs = require('fs');
['resumes', 'gallery'].forEach(dir => {
  const dirPath = path.join(__dirname, `uploads/${dir}`);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = req.url.includes('gallery') ? 'gallery' : 'resumes';
    cb(null, path.join(__dirname, `uploads/${folder}`));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ data: { session: { access_token: token, user: { id: user.id, email: user.email } } }, error: null });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ data: { user: req.user } });
});

// --- UPLOADS ---
app.post('/api/upload/resumes', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: 'No file uploaded' } });
  const url = `${req.protocol}://${req.get('host')}/uploads/resumes/${req.file.filename}`;
  res.json({ data: { path: req.file.filename, publicUrl: url }, error: null });
});

app.post('/api/upload/gallery', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: 'No file uploaded' } });
  const url = `${req.protocol}://${req.get('host')}/uploads/gallery/${req.file.filename}`;
  res.json({ data: { path: req.file.filename, publicUrl: url }, error: null });
});

// --- GENERIC CRUD ---
// Basic implementation to replace Supabase .from() logic.

app.get('/api/:table', async (req, res) => {
  const { table } = req.params;
  const validTables = ['courses', 'internships', 'reviews', 'contact_info', 'contacts', 'students', 'applications', 'payments', 'gallery_items'];
  if (!validTables.includes(table)) return res.status(400).json({ error: { message: 'Invalid table' } });

  let query = `SELECT * FROM ${table}`;
  let values = [];
  let whereClauses = [];

  // Handling query params (like eq, order, limit)
  for (const [key, val] of Object.entries(req.query)) {
    if (key === 'limit') {
      // handled later
    } else if (key === 'order') {
      // handled later
    } else if (key === 'count') {
      // handled later
    } else {
      whereClauses.push(`${key} = $${values.length + 1}`);
      values.push(val);
    }
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ` + whereClauses.join(' AND ');
  }

  if (req.query.order) {
    const [col, desc] = req.query.order.split('.');
    query += ` ORDER BY ${col} ${desc === 'desc' ? 'DESC' : 'ASC'}`;
  }

  if (req.query.limit) {
    query += ` LIMIT $${values.length + 1}`;
    values.push(parseInt(req.query.limit));
  }

  try {
    const result = await db.query(query, values);
    let count = null;
    if (req.query.count === 'exact') {
      const countRes = await db.query(`SELECT count(*) FROM ${table} ${whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''}`, values.slice(0, whereClauses.length));
      count = parseInt(countRes.rows[0].count);
    }
    res.json({ data: result.rows, count, error: null });
  } catch (error) {
    res.status(500).json({ data: null, error: { message: error.message } });
  }
});

app.post('/api/:table', async (req, res) => {
  const { table } = req.params;
  const validTables = ['courses', 'internships', 'reviews', 'contact_info', 'contacts', 'students', 'applications', 'payments', 'gallery_items'];
  if (!validTables.includes(table)) return res.status(400).json({ error: { message: 'Invalid table' } });

  const isArray = Array.isArray(req.body);
  const items = isArray ? req.body : [req.body];
  if (items.length === 0) return res.json({ data: [], error: null });

  const keys = Object.keys(items[0]);
  const placeholders = items.map((item, i) => `(${keys.map((_, j) => `$${i * keys.length + j + 1}`).join(', ')})`).join(', ');
  const values = items.reduce((acc, item) => acc.concat(keys.map(k => item[k])), []);

  const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES ${placeholders} RETURNING *`;

  try {
    const result = await db.query(query, values);
    res.json({ data: isArray ? result.rows : result.rows[0], error: null });
  } catch (error) {
    // Handling UPSERT specifically for contact_info
    if (table === 'contact_info' && req.body.id) {
       const setCols = keys.map((k, i) => `${k} = $${i+1}`).join(', ');
       try {
         const updateRes = await db.query(`UPDATE contact_info SET ${setCols} WHERE id = $${keys.length + 1} RETURNING *`, [...values, req.body.id]);
         return res.json({ data: updateRes.rows[0], error: null });
       } catch (err2) {
         return res.status(500).json({ data: null, error: { message: err2.message } });
       }
    }
    // Handling UPSERT for students
    if (table === 'students' && error.code === '23505') {
       // Unique violation
       const { email, phone } = items[0];
       try {
         let setStr = keys.map((k, i) => `${k} = $${i+1}`).join(', ');
         const updateQuery = `UPDATE students SET ${setStr} WHERE email = $${keys.length + 1} RETURNING *`;
         const updateRes = await db.query(updateQuery, [...values, email]);
         return res.json({ data: updateRes.rows[0], error: null });
       } catch (err2) {
         return res.status(500).json({ data: null, error: { message: err2.message } });
       }
    }
    res.status(500).json({ data: null, error: { message: error.message } });
  }
});

app.put('/api/:table/:id', authenticateToken, async (req, res) => {
  const { table, id } = req.params;
  const keys = Object.keys(req.body);
  const values = Object.values(req.body);
  const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  
  try {
    const result = await db.query(`UPDATE ${table} SET ${setString} WHERE id = $${keys.length + 1} RETURNING *`, [...values, id]);
    res.json({ data: result.rows, error: null });
  } catch (error) {
    res.status(500).json({ data: null, error: { message: error.message } });
  }
});

app.delete('/api/:table/:id', authenticateToken, async (req, res) => {
  const { table, id } = req.params;
  try {
    const result = await db.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
    res.json({ data: result.rows, error: null });
  } catch (error) {
    res.status(500).json({ data: null, error: { message: error.message } });
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
    res.status(500).json({ data: null, error: { message: error.message } });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
