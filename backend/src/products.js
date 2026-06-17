const express = require('express')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')

const router = express.Router()
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json')

const getProducts = () => JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'))
const saveProducts = (products) => fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2))

// GitHub API orqali avtomatik push
const gitPush = async () => {
  try {
    const token = process.env.GITHUB_TOKEN
    const repo = process.env.GITHUB_REPO
    const username = process.env.GITHUB_USERNAME

    if (!token || !repo || !username) {
      console.log('⚠️ GitHub credentials yo\'q')
      return
    }

    const filePath = 'backend/data/products.json'
    const content = fs.readFileSync(PRODUCTS_FILE, 'utf-8')
    const base64Content = Buffer.from(content).toString('base64')

    // Avval mavjud faylning SHA sini olish
    const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': username
      }
    })

    let sha = null
    if (getRes.ok) {
      const getData = await getRes.json()
      sha = getData.sha
    }

    // Faylni yangilash
    const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': username,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'mahsulot yangilandi',
        content: base64Content,
        sha: sha
      })
    })

    if (updateRes.ok) {
      console.log('✅ GitHub ga push qilindi')
    } else {
      const err = await updateRes.json()
      console.log('❌ GitHub push xatolik:', err.message)
    }
  } catch (err) {
    console.log('❌ Git push xatolik:', err.message)
  }
}

// Token tekshirish
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
router.post('/', authMiddleware, async (req, res) => {
  const products = getProducts()
  const newProduct = {
    id: uuidv4(),
    ...req.body,
    created_at: new Date().toISOString()
  }
  products.unshift(newProduct)
  saveProducts(products)
  res.json(newProduct)
  await gitPush()
})

// Mahsulot yangilash (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  const products = getProducts()
  const index = products.findIndex(p => p.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Topilmadi' })
  products[index] = { ...products[index], ...req.body }
  saveProducts(products)
  res.json(products[index])
  await gitPush()
})

// Mahsulot o'chirish (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  const products = getProducts()
  const filtered = products.filter(p => p.id !== req.params.id)
  saveProducts(filtered)
  res.json({ message: "O'chirildi" })
  await gitPush()
})

module.exports = router