import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import '../styles/Cart.css'

function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart()

  if (cart.length === 0) return (
    <div className="empty-page">
      <h2>Savat bo'sh</h2>
      <Link to="/shop" className="btn-primary">Xarid qilish</Link>
    </div>
  )

  return (
    <div className="cart-page">
      <h1>Savat</h1>

      <div className="cart-items">
        {cart.map((item, i) => (
          <div key={i} className="cart-item">
            <div className="cart-item-img">
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.name} />
              ) : (
                <div className="product-card-no-img">Rasm yo'q</div>
              )}
            </div>

            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p>{item.category}</p>
              {item.size && <p>O'lcham: {item.size}</p>}
              {item.color && <p>Rang: {item.color}</p>}
              <p className="price">{item.price.toLocaleString()} so'm</p>
            </div>

            <div className="cart-item-actions">
              <div className="quantity-control">
                <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}>+</button>
              </div>
              <p className="item-total">{(item.price * item.quantity).toLocaleString()} so'm</p>
              <button className="remove-btn" onClick={() => removeFromCart(item.id, item.size, item.color)}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3>Jami: {total.toLocaleString()} so'm</h3>
        <Link to="/checkout" className="btn-primary">Buyurtma berish</Link>
      </div>
    </div>
  )
}

export default Cart