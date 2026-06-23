const express = require('express')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')

const router = express.Router()
const ORDERS_FILE = path.join(__dirname, '../data/orders.json')
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json')

const getOrders = () => JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'))
const saveOrders = (orders) => fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2))
const getProducts = () => JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'))
const saveProducts = (products) => fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2))

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

// GitHub ga avtomatik push
const gitPush = async (filename) => {
  try {
    const token = process.env.GITHUB_TOKEN
    const repo = process.env.GITHUB_REPO
    const username = process.env.GITHUB_USERNAME
    if (!token || !repo || !username) return

    const filePath = `backend/data/${filename}`
    const fileToRead = filename === 'products.json' ? PRODUCTS_FILE : ORDERS_FILE
    const content = fs.readFileSync(fileToRead, 'utf-8')
    const base64Content = Buffer.from(content).toString('base64')

    const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      headers: { Authorization: `token ${token}`, 'User-Agent': username }
    })
    let sha = null
    if (getRes.ok) { const d = await getRes.json(); sha = d.sha }

    await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: { Authorization: `token ${token}`, 'User-Agent': username, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `${filename} yangilandi`, content: base64Content, sha })
    })
    console.log(`✅ ${filename} GitHub ga push qilindi`)
  } catch (err) {
    console.log('❌ Git push xatolik:', err.message)
  }
}

// Buyurtma berish (hamma) — STOCK KAMAYMAYDI, faqat buyurtma saqlanadi
router.post('/', async (req, res) => {
  const { items } = req.body

  // Oddiy tekshiruv: umuman yetarli mahsulot bormi (kamaytirilmaydi)
  const products = getProducts()
  for (const item of items) {
    const product = products.find(p => p.id === item.id)
    if (!product) continue
    if (product.stock < item.quantity) {
      return res.status(400).json({
        message: `"${product.name}" mahsulotidan faqat ${product.stock} ta qolgan`
      })
    }
  }

  // Buyurtma saqlash (status: new, stock hali kamaymagan)
  const orders = getOrders()
  const newOrder = {
    id: uuidv4(),
    ...req.body,
    status: 'new',
    stock_deducted: false,   // stock hali kamaytirilmagan
    created_at: new Date().toISOString()
  }
  orders.unshift(newOrder)
  saveOrders(orders)

  res.json(newOrder)

  // Faqat buyurtma fayli o'zgardi (products emas)
  await gitPush('orders.json')
})

// Barcha buyurtmalar (admin)
router.get('/', authMiddleware, (req, res) => {
  res.json(getOrders())
})

// Buyurtma statusini yangilash (admin) — TASDIQLAGANDA stock kamayadi
router.put('/:id', authMiddleware, async (req, res) => {
  const orders = getOrders()
  const index = orders.findIndex(o => o.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Topilmadi' })

  const order = orders[index]
  const newStatus = req.body.status
  const wasDeducted = order.stock_deducted === true
  // Bu bosqichlarda stock kamaygan bo'lishi kerak
  const deductStatuses = ['confirmed', 'shipped', 'delivered']
  let productsChanged = false

  // 1) Tasdiqlanganda (yoki keyingi bosqichda) — stockni BIR MARTA kamaytirish
  if (!wasDeducted && deductStatuses.includes(newStatus)) {
    const products = getProducts()

    // Avval yetarli stock bormi tekshirish
    for (const item of order.items) {
      const p = products.find(pr => pr.id === item.id)
      if (p && p.stock < item.quantity) {
        return res.status(400).json({
          message: `"${p.name}" mahsulotidan faqat ${p.stock} ta qolgan — tasdiqlab bo'lmaydi`
        })
      }
    }

    // Endi kamaytirish
    const updated = products.map(p => {
      const item = order.items.find(i => i.id === p.id)
      return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p
    })
    saveProducts(updated)
    order.stock_deducted = true
    productsChanged = true
  }

  // 2) Tasdiqlangan buyurtma BEKOR qilinsa — stockni qaytarish
  if (wasDeducted && newStatus === 'cancelled') {
    const products = getProducts()
    const restored = products.map(p => {
      const item = order.items.find(i => i.id === p.id)
      return item ? { ...p, stock: p.stock + item.quantity } : p
    })
    saveProducts(restored)
    order.stock_deducted = false
    productsChanged = true
  }

  orders[index] = { ...order, ...req.body }
  saveOrders(orders)
  res.json(orders[index])

  if (productsChanged) await gitPush('products.json')
  await gitPush('orders.json')
})

module.exports = router
