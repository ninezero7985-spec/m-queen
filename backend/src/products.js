const express = require('express')
const router = express.Router()

let products = []

// Barcha mahsulotlar
router.get('/', (req, res) => {
  res.json(products)
})

// Mahsulot qo'shish
router.post('/', (req, res) => {
  const product = {
    id: Date.now(),
    ...req.body,
    created_at: new Date().toISOString()
  }
  products.push(product)
  res.json(product)
})

// Mahsulot yangilash
router.put('/:id', (req, res) => {
  const id = Number(req.params.id)
  products = products.map(p => p.id === id ? { ...p, ...req.body } : p)
  res.json({ message: 'Yangilandi' })
})

// Mahsulot o'chirish
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  products = products.filter(p => p.id !== id)
  res.json({ message: 'O\'chirildi' })
})

module.exports = router