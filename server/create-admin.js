// Create an admin login, or reset the password of an existing one.
// Usage: node create-admin.js <email> <password>
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./db');

async function createAdmin() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: node create-admin.js <email> <password>');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  await db.query(
    `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email, hash]
  );
  console.log(`Admin login ready for ${email}`);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Could not create admin:', err.message);
  process.exit(1);
});
