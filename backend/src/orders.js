const express = require('express')
const router = express.Router()

let orders = []

// Barcha buyurtmalar
router.get('/', (req, res) => {
  res.json(orders)
})

// Buyurtma qo'shish
router.post('/', (req, res) => {
  const order = {
    id: Date.now(),
    ...req.body,
    created_at: new Date().toISOString()
  }
  orders.push(order)
  res.json(order)
})

// Buyurtma statusini yangilash
router.put('/:id', (req, res) => {
  const id = Number(req.params.id)
  orders = orders.map(o => o.id === id ? { ...o, ...req.body } : o)
  res.json({ message: 'Yangilandi' })
})

module.exports = router