const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

app.use(cors({
  origin: [
    'https://m-queen.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use('/api/auth', require('./auth'))
app.use('/api/products', require('./products'))
app.use('/api/orders', require('./orders'))
app.use('/api/categories', require('./categories'))

app.get('/', (req, res) => {
  res.json({ status: 'Server ishlayapti!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server ${PORT} portda ishlamoqda`))