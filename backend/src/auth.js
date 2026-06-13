const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const users = require('./db')

const router = express.Router()

// Ro'yxatdan o'tish
router.post('/register', async (req, res) => {
  const { full_name, email, password } = req.body

  const exists = users.find(u => u.email === email)
  if (exists) return res.status(400).json({ message: 'Bu email allaqachon mavjud' })

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = { id: Date.now(), full_name, email, password: hashedPassword, role: 'user' }
  users.push(user)

  res.json({ message: 'Ro\'yxatdan o\'tdingiz!' })
})

// Kirish
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  const user = users.find(u => u.email === email)
  if (!user) return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri' })

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri' })

  if (user.role !== 'admin') return res.status(403).json({ message: 'Sizda admin huquqi yo\'q' })

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' })

  res.json({ token, user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } })
})

module.exports = router