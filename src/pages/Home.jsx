import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import '../styles/Home.css'

function Home() {
  const [newProducts, setNewProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  const fetchProducts = async () => {
    const res = await fetch('http://localhost:5000/api/products')
    const data = await res.json()
    const filtered = data.filter(p => p.is_active).slice(0, 8)
    setNewProducts(filtered)
    setLoading(false)
  }
  fetchProducts()
}, [])

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Ayollar kiyimi</h1>
          <p>Eng yangi kolleksiyalar — faqat siz uchun</p>
          <Link to="/shop" className="btn-primary">Do'konga o'tish</Link>
        </div>
      </section>

      {/* Kategoriyalar */}
      <section className="categories">
        <h2>Kategoriyalar</h2>
        <div className="categories-grid">
          {['Ko\'ylaklar', 'Yubkalar', 'Shimlar', 'Kurtalar', 'Sport', 'Aksessuarlar'].map(cat => (
            <Link key={cat} to={`/shop?category=${cat}`} className="category-card">
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Yangi mahsulotlar */}
      <section className="new-products">
        <h2>Yangi kelganlar</h2>
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