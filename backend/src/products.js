const express = require('express')
const db = require('./database')

const router = express.Router()

// Barcha mahsulotlar
router.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all()
  const parsed = products.map(p => ({
    ...p,
    sizes: JSON.parse(p.sizes || '[]'),
    colors: JSON.parse(p.colors || '[]'),
    images: JSON.parse(p.images || '[]'),
    is_active: p.is_active === 1,
  }))
  res.json(parsed)
})

// Mahsulot qo'shish
router.post('/', (req, res) => {
  const { name, description, price, old_price, category, sizes, colors, stock, images, is_active } = req.body
  const result = db.prepare(`
    INSERT INTO products (name, description, price, old_price, category, sizes, colors, stock, images, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, description, price, old_price, category, JSON.stringify(sizes), JSON.stringify(colors), stock, JSON.stringify(images), is_active ? 1 : 0)

  res.json({ id: result.lastInsertRowid, ...req.body })
})

// Mahsulot yangilash
router.put('/:id', (req, res) => {
  const id = req.params.id
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ message: 'Topilmadi' })

  const data = { ...existing, ...req.body }

  db.prepare(`
    UPDATE products SET name=?, description=?, price=?, old_price=?, category=?, sizes=?, colors=?, stock=?, images=?, is_active=?
    WHERE id=?
  `).run(
    data.name,
    data.description,
    data.price,
    data.old_price,
    data.category,
    typeof data.sizes === 'string' ? data.sizes : JSON.stringify(data.sizes),
    typeof data.colors === 'string' ? data.colors : JSON.stringify(data.colors),
    data.stock,
    typeof data.images === 'string' ? data.images : JSON.stringify(data.images),
    data.is_active === true || data.is_active === 1 ? 1 : 0,
    id
  )

  res.json({ message: 'Yangilandi' })
})

// Mahsulot o'chirish
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id)
  res.json({ message: 'O\'chirildi' })
})

module.exports = router