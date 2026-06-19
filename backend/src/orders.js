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

// Buyurtma berish (hamma)
router.post('/', async (req, res) => {
  const { items } = req.body

  // Stock tekshirish
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

  // Stock kamaytirish
  const updatedProducts = products.map(product => {
    const item = items.find(i => i.id === product.id)
    if (item) {
      return { ...product, stock: Math.max(0, product.stock - item.quantity) }
    }
    return product
  })
  saveProducts(updatedProducts)

  // Buyurtma saqlash
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

  // GitHub ga push
  await gitPush('products.json')
  await gitPush('orders.json')
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