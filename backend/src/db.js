const bcrypt = require('bcryptjs')
const db = require('./database')

// Admin foydalanuvchi mavjud bo'lmasa yaratish
const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@mqueen.com')
if (!admin) {
  const hashedPassword = bcrypt.hashSync('admin123', 10)
  db.prepare('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin', 'admin@mqueen.com', hashedPassword, 'admin')
}

module.exports = db