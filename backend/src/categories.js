const express = require('express')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

const router = express.Router()
const CATEGORIES_FILE = path.join(__dirname, '../data/categories.json')

const getCategories = () => {
  if (!fs.existsSync(CATEGORIES_FILE)) {
    const defaults = ["Ko'ylaklar", 'Shimlar', 'Kurtalar', 'Sport', 'Aksessuarlar']
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(defaults, null, 2))
    return defaults
  }
  return JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf-8'))
}
const saveCategories = (cats) => fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(cats, null, 2))

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token kerak' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'mqueen_secret')
    next()
  } catch {
    res.status(401).json({ message: "Token noto'g'ri" })
  }
}

// Barcha kategoriyalar (hamma ko'ra oladi)
router.get('/', (req, res) => {
  res.json(getCategories())
})

// Kategoriya qo'shish (admin)
router.post('/', authMiddleware, (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ message: 'Nom kerak' })
  const cats = getCategories()
  if (cats.includes(name)) return res.status(400).json({ message: 'Bu kategoriya allaqachon bor' })
  cats.push(name)
  saveCategories(cats)
  res.json(cats)
})

// Kategoriya o'chirish (admin)
router.delete('/', authMiddleware, (req, res) => {
  const { name } = req.body
  const cats = getCategories().filter(c => c !== name)
  saveCategories(cats)
  res.json(cats)
})

module.exports = router