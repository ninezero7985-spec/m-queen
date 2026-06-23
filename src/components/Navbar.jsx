import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import '../styles/Navbar.css'

function Navbar() {
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">M-Queen</Link>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Bosh sahifa</Link>
        <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
        <Link to="/about" onClick={() => setMenuOpen(false)}>Biz haqimizda</Link>
        <Link to="/contact" onClick={() => setMenuOpen(false)}>Kontakt</Link>
      </div>

      <div className="navbar-actions">
        <Link to="/cart" className="cart-btn">
          🛒 {count > 0 && <span className="cart-count">{count}</span>}
        </Link>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
