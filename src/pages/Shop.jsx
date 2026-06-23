import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import '../styles/Shop.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const PER_PAGE = 6
const STEP = 50000
const MAX_PRICE = 30000000

function Shop() {
  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState(['Barchasi'])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(MAX_PRICE)
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || 'Barchasi'

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
      try {
        const res = await fetch(`${API_URL}/api/products`)
        const data = await res.json()
        setAllProducts(data.filter(p => p.is_active))
      } catch {
        setAllProducts([])
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const bounds = useMemo(() => {
    if (!allProducts.length) return { min: 0, max: MAX_PRICE }
    const prices = allProducts.map(p => p.price)
    const lo = Math.floor(Math.min(...prices) / STEP) * STEP
    return { min: lo, max: MAX_PRICE }
  }, [allProducts])

  useEffect(() => {
    setPriceMin(bounds.min)
    setPriceMax(bounds.max)
  }, [bounds.min, bounds.max])

  const filtered = useMemo(() => {
    let list = allProducts
    if (category !== 'Barchasi') list = list.filter(p => p.category === category)
    list = list.filter(p => p.price >= priceMin && p.price <= priceMax)
    return list
  }, [allProducts, category, priceMin, priceMax])

  const visibleProducts = useMemo(() => {
    let list = [...filtered]
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q))
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'new') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return list
  }, [filtered, search, sort])

  useEffect(() => { setPage(1) }, [category, priceMin, priceMax, search, sort])

  const setCategory = (cat) => {
    const params = {}
    if (cat !== 'Barchasi') params.category = cat
    setSearchParams(params)
  }

  const pct = (v) => bounds.max === bounds.min ? 0 : ((v - bounds.min) / (bounds.max - bounds.min)) * 100
  const onMinChange = (e) => setPriceMin(Math.min(Number(e.target.value), priceMax - STEP))
  const onMaxChange = (e) => setPriceMax(Math.max(Number(e.target.value), priceMin + STEP))

  const totalPages = Math.ceil(visibleProducts.length / PER_PAGE)
  const currentProducts = visibleProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE)

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
        <div className="price-slider">
          <div className="price-slider-track">
            <div
              className="price-slider-fill"
              style={{ left: pct(priceMin) + '%', right: (100 - pct(priceMax)) + '%' }}
            />
          </div>
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={STEP}
            value={priceMin}
            onChange={onMinChange}
            aria-label="Eng past narx"
          />
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={STEP}
            value={priceMax}
            onChange={onMaxChange}
            aria-label="Eng yuqori narx"
          />
        </div>
        <div className="price-slider-values">
          <span>{priceMin.toLocaleString()}</span>
          <span>{priceMax.toLocaleString()}</span>
        </div>
      </aside>

      <div className="shop-products">
        <div className="shop-products-head">
          <h2>{category === 'Barchasi' ? 'Barcha mahsulotlar' : category}</h2>
          <div className="shop-toolbar">
            <div className="shop-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Mahsulot qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="shop-search-clear" onClick={() => setSearch('')} aria-label="Tozalash">✕</button>
              )}
            </div>
            <select className="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Saralash</option>
              <option value="price-asc">Arzondan qimmatga</option>
              <option value="price-desc">Qimmatdan arzonga</option>
              <option value="new">Yangi qo'shilganlar</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="loading">Yuklanmoqda...</p>
        ) : visibleProducts.length === 0 ? (
          <p className="empty">Mahsulot topilmadi</p>
        ) : (
          <>
            <p className="shop-count">{visibleProducts.length} ta mahsulot</p>
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
