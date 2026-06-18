import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import '../styles/Shop.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const PER_PAGE = 6

function Shop() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['Barchasi'])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || 'Barchasi'
  const minPrice = searchParams.get('min') || ''
  const maxPrice = searchParams.get('max') || ''

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`)
        const data = await res.json()
        setCategories(['Barchasi', ...data])
      } catch {
        setCategories(['Barchasi'])
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setPage(1)
      const res = await fetch(`${API_URL}/api/products`)
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

  const totalPages = Math.ceil(products.length / PER_PAGE)
  const currentProducts = products.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const goToPage = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="shop-page">
      <aside className="shop-filter">
        <h3>Kategoriya</h3>
        <ul>
          {categories.map(cat => (
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
          <input name="min" type="number" placeholder="dan" defaultValue={minPrice} min="0" />
          <input name="max" type="number" placeholder="gacha" defaultValue={maxPrice} min="0" />
          <button type="submit" className="btn-primary full">Filtrlash</button>
        </form>
      </aside>

      <div className="shop-products">
        <h2>{category === 'Barchasi' ? 'Barcha mahsulotlar' : category}</h2>

        {loading ? (
          <p className="loading">Yuklanmoqda...</p>
        ) : products.length === 0 ? (
          <p className="empty">Mahsulot topilmadi</p>
        ) : (
          <>
            <div className="products-grid">
              {currentProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`pagination-btn ${page === p ? 'active' : ''}`}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Shop