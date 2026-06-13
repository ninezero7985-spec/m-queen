import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import '../styles/ProductDetail.css'

function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [activeImg, setActiveImg] = useState(0)
  const [added, setAdded] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
  const fetchProduct = async () => {
    const res = await fetch('http://localhost:5000/api/products')
    const data = await res.json()
    const found = data.find(p => String(p.id) === String(id))
    setProduct(found || null)
    setSelectedSize(found?.sizes?.[0] || '')
    setSelectedColor(found?.colors?.[0] || '')
    setLoading(false)
  }
  fetchProduct()
}, [id])

  // ESC bilan yopish
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) return alert("O'lchamni tanlang")
    if (!selectedColor && product.colors?.length > 0) return alert('Rangni tanlang')
    addToCart(product, selectedSize, selectedColor)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return <p className="loading">Yuklanmoqda...</p>
  if (!product) return <p className="empty">Mahsulot topilmadi</p>

  return (
    <div className="product-detail">
      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <button className="lightbox-close" onClick={() => setLightbox(false)}>×</button>
          <img
            src={product.images[activeImg]}
            alt={product.name}
            onClick={e => e.stopPropagation()}
          />
          {product.images?.length > 1 && (
            <div className="lightbox-thumbs" onClick={e => e.stopPropagation()}>
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className={activeImg === i ? 'active' : ''}
                  onClick={() => setActiveImg(i)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rasmlar */}
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
              <img
                key={i}
                src={img}
                alt=""
                className={activeImg === i ? 'active' : ''}
                onClick={() => setActiveImg(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="product-detail-info">
        <p className="product-card-category">{product.category}</p>
        <h1>{product.name}</h1>

        <div className="product-card-price">
          <span className="price">{product.price.toLocaleString()} so'm</span>
          {product.old_price && (
            <span className="old-price">{product.old_price.toLocaleString()} so'm</span>
          )}
        </div>

        <p className="product-description">{product.description}</p>

        {product.sizes?.length > 0 && (
          <div className="selector">
            <p>O'lcham:</p>
            <div className="selector-options">
              {product.sizes.map(size => (
                <button key={size} className={selectedSize === size ? 'active' : ''} onClick={() => setSelectedSize(size)}>
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors?.length > 0 && (
          <div className="selector">
            <p>Rang:</p>
            <div className="selector-options">
              {product.colors.map(color => (
                <button key={color} className={selectedColor === color ? 'active' : ''} onClick={() => setSelectedColor(color)}>
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="btn-primary full" onClick={handleAddToCart}>
          {added ? "✅ Savatga qo'shildi" : "Savatga qo'shish"}
        </button>
      </div>
    </div>
  )
}

export default ProductDetail