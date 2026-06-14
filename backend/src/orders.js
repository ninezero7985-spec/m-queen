const express = require('express')
const db = require('./database')

const router = express.Router()

// Barcha buyurtmalar
router.get('/', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
  const parsed = orders.map(o => ({
    ...o,
    items: JSON.parse(o.items || '[]'),
  }))
  res.json(parsed)
})

// Buyurtma qo'shish
router.post('/', (req, res) => {
  const { full_name, phone, delivery_type, city, street, house, payment_method, items, subtotal, delivery_fee, total, note, status } = req.body

  const result = db.prepare(`
    INSERT INTO orders (full_name, phone, delivery_type, city, street, house, payment_method, items, subtotal, delivery_fee, total, note, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(full_name, phone, delivery_type, city, street, house, payment_method, JSON.stringify(items), subtotal, delivery_fee, total, note, status || 'new')

  res.json({ id: result.lastInsertRowid, ...req.body })
})

// Buyurtma statusini yangilash
router.put('/:id', (req, res) => {
  const id = req.params.id
  const { status } = req.body
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id)
  res.json({ message: 'Yangilandi' })
})

module.exports = router