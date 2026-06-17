const express = require('express')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')

const router = express.Router()
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json')

const getProducts = () => JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'))
const saveProducts = (products) => fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2))

// Token tekshirish
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token kerak' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'mqueen_secret')
    next()
  } catch {
    res.status(401).json({ message: 'Token noto\'g\'ri' })
  }
}

// Barcha mahsulotlar (hamma ko'ra oladi)
router.get('/', (req, res) => {
  const products = getProducts()
  res.json(products.filter(p => p.is_active))
})

// Admin - barcha mahsulotlar
router.get('/all', authMiddleware, (req, res) => {
  res.json(getProducts())
})

// Bitta mahsulot
router.get('/:id', (req, res) => {
  const products = getProducts()
  const product = products.find(p => p.id === req.params.id)
  if (!product) return res.status(404).json({ message: 'Topilmadi' })
  res.json(product)
})

// Mahsulot qo'shish (admin)
router.post('/', authMiddleware, (req, res) => {
  const products = getProducts()
  const newProduct = {
    id: uuidv4(),
    ...req.body,
    created_at: new Date().toISOString()
  }
  products.unshift(newProduct)
  saveProducts(products)
  res.json(newProduct)
})

// Mahsulot yangilash (admin)
router.put('/:id', authMiddleware, (req, res) => {
  const products = getProducts()
  const index = products.findIndex(p => p.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Topilmadi' })
  products[index] = { ...products[index], ...req.body }
  saveProducts(products)
  res.json(products[index])
})

// Mahsulot o'chirish (admin)
router.delete('/:id', authMiddleware, (req, res) => {
  const products = getProducts()
  const filtered = products.filter(p => p.id !== req.params.id)
  saveProducts(filtered)
  res.json({ message: 'O\'chirildi' })
})

module.exports = router