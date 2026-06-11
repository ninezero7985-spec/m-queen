import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import '../styles/ProductCard.css'

function ProductCard({ product }) {
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    const defaultSize = product.sizes?.[0] || ''
    const defaultColor = product.colors?.[0] || ''
    addToCart(product, defaultSize, defaultColor)
  }

  return (
    <Link to={`/shop/${product.id}`} className="product-card">
      <div className="product-card-img">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div className="product-card-no-img">Rasm yo'q</div>
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
        <button className="btn-primary full" onClick={handleAddToCart}>
          Savatga qo'shish
        </button>
      </div>
    </Link>
  )
}

export default ProductCard