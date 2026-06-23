import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const showToast = (message, type = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Bitta mahsulotning yangi stock'ini olish (butun ro'yxatni emas)
  const fetchStock = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`)
      if (!res.ok) return null
      const fresh = await res.json()
      return fresh?.stock ?? 0
    } catch {
      return null // internet yo'q
    }
  }

  // true qaytarsa — qo'shildi, false — qo'shilmadi
  const addToCart = async (product, size, color) => {
    const freshStock = await fetchStock(product.id)

    // Internet bor va mahsulot tugagan
    if (freshStock !== null && freshStock <= 0) {
      showToast('Mahsulot tugagan!')
      return false
    }

    const existing = cart.find(
      item => item.id === product.id && item.size === size && item.color === color
    )
    if (existing && freshStock !== null && existing.quantity >= freshStock) {
      showToast(`Maksimal miqdor: ${freshStock} ta`)
      return false
    }

    setCart(prev => {
      const ex = prev.find(
        item => item.id === product.id && item.size === size && item.color === color
      )
      if (ex) {
        return prev.map(item =>
          item.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1, ...(freshStock !== null ? { stock: freshStock } : {}) }
            : item
        )
      }
      return [...prev, { ...product, size, color, quantity: 1, ...(freshStock !== null ? { stock: freshStock } : {}) }]
    })
    return true
  }

  const removeFromCart = (id, size, color) => {
    setCart(prev => prev.filter(
      item => !(item.id === id && item.size === size && item.color === color)
    ))
  }

  const updateQuantity = async (id, size, color, quantity) => {
    if (quantity < 1) return removeFromCart(id, size, color)

    // Bitta mahsulotning fresh stock'ini tekshirish
    const freshStock = await fetchStock(id)
    if (freshStock !== null && quantity > freshStock) {
      showToast(`Maksimal miqdor: ${freshStock} ta`)
      return
    }

    setCart(prev => prev.map(item =>
      item.id === id && item.size === size && item.color === color
        ? { ...item, quantity }
        : item
    ))
  }

  const clearCart = () => setCart([])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const count = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, count }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 99999,
          background: toast.type === 'error' ? '#e53e3e' : '#38a169',
          color: 'white', padding: '12px 20px', borderRadius: '10px',
          fontSize: '14px', fontWeight: '600',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <style>{`@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.message}
        </div>
      )}
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
