import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Icon from '../components/Icon'
import '../styles/Home.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Home() {
  const [newProducts, setNewProducts] = useState([])
  const [saleProducts, setSaleProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/categories`)
      ])
      const products = await productsRes.json()
      const cats = await categoriesRes.json()

      const active = products.filter(p => p.is_active)
      setNewProducts(active.slice(0, 8))
      setSaleProducts(active.filter(p => p.old_price && p.old_price > p.price).slice(0, 8))
      setCategories(cats)
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Yangi 2026 kolleksiyasi</span>
          <h1>Ayollar kiyimi</h1>
          <p>Eng yangi kolleksiyalar — faqat siz uchun</p>
          <div className="hero-actions">
            <Link to="/shop" className="btn-primary">Do'konga o'tish</Link>
            <Link to="/about" className="btn-hero-ghost">Biz haqimizda</Link>
          </div>
        </div>
        <div className="hero-line" />
      </section>

      {/* Ishonch belgilari */}
      <section className="trust-bar">
        <div className="trust-item">
          <span className="trust-icon"><Icon name="truck" size={24} /></span>
          <div className="trust-text">
            <p>Tez yetkazib berish</p>
            <span>1–3 ish kuni ichida</span>
          </div>
        </div>
        <div className="trust-item">
          <span className="trust-icon"><Icon name="shield" size={24} /></span>
          <div className="trust-text">
            <p>Original mahsulot</p>
            <span>100% sifat kafolati</span>
          </div>
        </div>
        <div className="trust-item">
          <span className="trust-icon"><Icon name="chat" size={24} /></span>
          <div className="trust-text">
            <p>24/7 qo'llab-quvvatlash</p>
            <span>Har doim aloqadamiz</span>
          </div>
        </div>
      </section>

      {/* Kategoriyalar */}
      <section className="categories">
        <h2>Kategoriyalar</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link key={cat} to={`/shop?category=${cat}`} className="category-card">
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Chegirmalar */}
      {saleProducts.length > 0 && (
        <section className="sale-products">
          <div className="section-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#ff7a00', display: 'inline-flex' }}><Icon name="flame" size={24} /></span>
              Chegirmalar
            </h2>
            <Link to="/shop" className="see-all-link">Hammasini ko'rish →</Link>
          </div>
          <div className="products-grid">
            {saleProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Yangi mahsulotlar */}
      <section className="new-products">
        <div className="section-header">
          <h2>Yangi kelganlar</h2>
          <Link to="/shop" className="see-all-link">Hammasini ko'rish →</Link>
        </div>
        {loading ? (
          <p className="loading">Yuklanmoqda...</p>
        ) : (
          <div className="products-grid">
            {newProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="see-all">
          <Link to="/shop" className="btn-outline">Hammasini ko'rish</Link>
        </div>
      </section>
    </div>
  )
}

export default Home
