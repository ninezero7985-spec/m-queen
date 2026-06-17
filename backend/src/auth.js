const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

const router = express.Router()
const USERS_FILE = path.join(__dirname, '../data/users.json')

const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))

// Admin yaratish (birinchi ishga tushganda)
const initAdmin = () => {
  const users = getUsers()
  if (users.length === 0) {
    const hash = bcrypt.hashSync('admin123', 10)
    users.push({
      id: 1,
      full_name: 'Admin',
      email: 'admin@mqueen.uz',
      password: hash,
      role: 'admin'
    })
    saveUsers(users)
    console.log('Admin yaratildi: admin@mqueen.uz / admin123')
  }
}
initAdmin()

// Kirish
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const users = getUsers()
  const user = users.find(u => u.email === email)

  if (!user) return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri' })

  const isMatch = bcrypt.compareSync(password, user.password)
  if (!isMatch) return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri' })

  if (user.role !== 'admin') return res.status(403).json({ message: 'Sizda admin huquqi yo\'q' })

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'mqueen_secret',
    { expiresIn: '7d' }
  )

  res.json({ token, user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } })
})

module.exports = router