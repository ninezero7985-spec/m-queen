import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase/client'
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
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (category !== 'Barchasi') query = query.eq('category', category)
      if (minPrice) query = query.gte('price', minPrice)
      if (maxPrice) query = query.lte('price', maxPrice)

      const { data } = await query
      setProducts(data || [])
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