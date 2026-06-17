const express = require('express')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')

const router = express.Router()
const ORDERS_FILE = path.join(__dirname, '../data/orders.json')

const getOrders = () => JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'))
const saveOrders = (orders) => fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2))

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

// Buyurtma berish (hamma)
router.post('/', (req, res) => {
  const orders = getOrders()
  const newOrder = {
    id: uuidv4(),
    ...req.body,
    status: 'new',
    created_at: new Date().toISOString()
  }
  orders.unshift(newOrder)
  saveOrders(orders)
  res.json(newOrder)
})

// Barcha buyurtmalar (admin)
router.get('/', authMiddleware, (req, res) => {
  res.json(getOrders())
})

// Buyurtma statusini yangilash (admin)
router.put('/:id', authMiddleware, (req, res) => {
  const orders = getOrders()
  const index = orders.findIndex(o => o.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Topilmadi' })
  orders[index] = { ...orders[index], ...req.body }
  saveOrders(orders)
  res.json(orders[index])
})

module.exports = router