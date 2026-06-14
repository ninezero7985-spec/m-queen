require('./db')

const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./auth')
const productRoutes = require('./products')
const orderRoutes = require('./orders')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server ${PORT} portda ishlamoqda`))