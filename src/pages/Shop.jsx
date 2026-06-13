import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import '../styles/Shop.css'

const CATEGORIES = ['Barchasi', "Ko'ylaklar", 'Yubkalar', 'Shimlar', 'Kurtalar', 'Sport', 'Aksessuarlar']

function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || 'Barchasi'
  const minPrice = searchParams.get('min') || ''
  const maxPrice = searchParams.get('max') || ''

  useEffect(() => {
  const fetchProducts = async () => {
    setLoading(true)
    const res = await fetch('http://localhost:5000/api/products')
    const data = await res.json()

    let filtered = data.filter(p => p.is_active)
    if (category !== 'Barchasi') filtered = filtered.filter(p => p.category === category)
    if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice))
    if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice))

    setProducts(filtered)
    setLoading(false)
  }
  fetchProducts()
}, [category, minPrice, maxPrice])

  const setCategory = (cat) => {
    const params = {}
    if (cat !== 'Barchasi') params.category = cat
    if (minPrice) params.min = minPrice
    if (maxPrice) params.max = maxPrice
    setSearchParams(params)
  }

  const applyPrice = (e) => {
    e.preventDefault()
    const params = {}
    if (category !== 'Barchasi') params.category = category
    const min = e.target.min.value
    const max = e.target.max.value
    if (min) params.min = min
    if (max) params.max = max
    setSearchParams(params)
  }

  return (
    <div className="shop-page">
      {/* Filter sidebar */}
      <aside className="shop-filter">
        <h3>Kategoriya</h3>
        <ul>
          {CATEGORIES.map(cat => (
            <li key={cat}>
              <button
                className={category === cat ? 'active' : ''}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>

        <h3>Narx (so'm)</h3>
        <form onSubmit={applyPrice} className="price-filter">
          <input name="min" type="number" placeholder="dan" defaultValue={minPrice} />
          <input name="max" type="number" placeholder="gacha" defaultValue={maxPrice} />
          <button type="submit" className="btn-primary full">Filtrlash</button>
        </form>
      </aside>

      {/* Mahsulotlar */}
      <div className="shop-products">
        <h2>{category === 'Barchasi' ? 'Barcha mahsulotlar' : category}</h2>
        {loading ? (
          <p className="loading">Yuklanmoqda...</p>
        ) : products.length === 0 ? (
          <p className="empty">Mahsulot topilmadi</p>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop