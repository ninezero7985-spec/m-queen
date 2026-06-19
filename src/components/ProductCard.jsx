import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import '../styles/ProductCard.css'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const isOutOfStock = product.stock <= 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (isOutOfStock) return
    const firstVariant = product.variants?.[0]
    const defaultSize = firstVariant?.size || ''
    const defaultColor = firstVariant?.colors?.[0] || ''
    const price = product.price + (firstVariant?.price || 0)
    addToCart({ ...product, price }, defaultSize, defaultColor)
  }

  return (
    <Link to={`/shop/${product.id}`} className="product-card">
      <div className="product-card-img">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div className="product-card-no-img">Rasm yo'q</div>
        )}
        {isOutOfStock && (
          <div className="out-of-stock-badge">Tez orada keladi</div>
        )}
      </div>

      <div className="product-card-info">
        <h3>{product.name}</h3>
        <p className="product-card-category">{product.category}</p>
        <div className="product-card-price">
          <span className="price">{product.price.toLocaleString()} so'm</span>
          {product.old_price && (
            <span className="old-price">{product.old_price.toLocaleString()} so'm</span>
          )}
        </div>
        <button
          className={`btn-primary full ${isOutOfStock ? 'btn-disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? '⏳ Tez orada keladi' : "Savatga qo'shish"}
        </button>
      </div>
    </Link>
  )
}

export default ProductCard