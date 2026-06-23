import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import '../styles/ProductDetail.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function ProductDetail() {
  const { id } = useParams()
  const { addToCart, toast } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [activeImg, setActiveImg] = useState(0)
  const [added, setAdded] = useState(false)
  const isOutOfStock = product ? product.stock <= 0 : false
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        // Faqat BITTA mahsulotni so'raymiz (butun ro'yxatni emas)
        const res = await fetch(`${API_URL}/api/products/${id}`)
        if (!res.ok) {
          setProduct(null)
          setLoading(false)
          return
        }
        const found = await res.json()
        setProduct(found)
        if (found?.variants?.length > 0) {
          setSelectedVariant(found.variants[0])
          setSelectedColor(found.variants[0].colors?.[0] || '')
        }
      } catch {
        setProduct(null)
      }
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant)
    setSelectedColor(variant.colors?.[0] || '')
  }

  // Joriy narx: asosiy narx + variant qo'shimcha narxi
  const currentPrice = product ? (product.price + (selectedVariant?.price || 0)) : 0

  const handleAddToCart = async () => {
    if (!selectedVariant && product.variants?.length > 0) { alert("O'lchamni tanlang"); return }
    if (!selectedColor && selectedVariant?.colors?.length > 0) { alert('Rangni tanlang'); return }

    // Stock tekshirish endi CartContext ichida (bitta so'rov bilan) bajariladi
    const ok = await addToCart(
      { ...product, price: currentPrice },
      selectedVariant?.size || '',
      selectedColor
    )
    if (ok) {
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  if (loading) return <p className="loading">Yuklanmoqda...</p>
  if (!product) return <p className="empty">Mahsulot topilmadi</p>

  return (
    <div className="product-detail">
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <button className="lightbox-close" onClick={() => setLightbox(false)}>×</button>
          <img src={product.images[activeImg]} alt={product.name} onClick={e => e.stopPropagation()} />
          {product.images?.length > 1 && (
            <div className="lightbox-thumbs" onClick={e => e.stopPropagation()}>
              {product.images.map((img, i) => (
                <img key={i} src={img} alt="" className={activeImg === i ? 'active' : ''} onClick={() => setActiveImg(i)} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="product-detail-images">
        <div className="product-detail-main-img" onClick={() => setLightbox(true)} style={{ cursor: 'zoom-in' }}>
          {product.images?.[activeImg] ? (
            <img src={product.images[activeImg]} alt={product.name} />
          ) : (
            <div className="product-card-no-img">Rasm yo'q</div>
          )}
        </div>
        {product.images?.length > 1 && (
          <div className="product-detail-thumbs">
            {product.images.map((img, i) => (
              <img key={i} src={img} alt="" className={activeImg === i ? 'active' : ''} onClick={() => setActiveImg(i)} />
            ))}
          </div>
        )}
      </div>

      <div className="product-detail-info">
        <p className="product-card-category">{product.category}</p>
        <h1>{product.name}</h1>

        <div className="product-card-price">
          <span className="price">{currentPrice?.toLocaleString()} so'm</span>
          {product.old_price && (
            <span className="old-price">{product.old_price.toLocaleString()} so'm</span>
          )}
        </div>

        <p className="product-description">{product.description}</p>

        {/* O'lchamlar */}
        {product.variants?.length > 0 && (
          <div className="selector">
            <p>O'lcham:</p>
            <div className="selector-options">
              {product.variants.map((variant, i) => (
                <button
                  key={i}
                  className={selectedVariant?.size === variant.size ? 'active' : ''}
                  onClick={() => handleSelectVariant(variant)}
                >
                  {variant.size}
                  {variant.price !== product.price && (
                    <span style={{ fontSize: '11px', display: 'block', opacity: 0.8 }}>
                      {variant.price.toLocaleString()}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ranglar */}
        {selectedVariant?.colors?.length > 0 && (
          <div className="selector">
            <p>Rang:</p>
            <div className="selector-options">
              {selectedVariant.colors.map(color => (
                <button
                  key={color}
                  className={selectedColor === color ? 'active' : ''}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {isOutOfStock ? (
          <div className="out-of-stock-msg">
            ⏳ Bu mahsulot vaqtincha tugagan. Tez orada keladi!
          </div>
        ) : (
          <button className="btn-primary full" onClick={handleAddToCart}>
            {added ? "✅ Savatga qo'shildi" : "Savatga qo'shish"}
          </button>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
