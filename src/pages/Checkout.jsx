import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useCart } from '../context/CartContext'
import '../styles/Checkout.css'

function Checkout() {
  const navigate = useNavigate()
  const { cart, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    delivery_type: 'delivery',
    city: '',
    street: '',
    house: '',
    payment_method: 'cash',
    note: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const delivery_fee = form.delivery_type === 'delivery' ? 15000 : 0

    const { error } = await supabase.from('orders').insert({
      user_id: null,
      full_name: form.full_name,
      phone: form.phone,
      delivery_type: form.delivery_type,
      city: form.delivery_type === 'delivery' ? form.city : null,
      street: form.delivery_type === 'delivery' ? form.street : null,
      house: form.delivery_type === 'delivery' ? form.house : null,
      payment_method: form.payment_method,
      items: cart,
      subtotal: total,
      delivery_fee,
      total: total + delivery_fee,
      note: form.note,
    })

    if (error) {
      setError('Xatolik yuz berdi, qayta urinib ko\'ring')
      setLoading(false)
      return
    }

    const itemsList = cart
      .map(item => `${item.name} x${item.quantity} — ${(item.price * item.quantity).toLocaleString()} so'm`)
      .join('\n')

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        order_id: Date.now(),
        customer_name: form.full_name,
        customer_phone: form.phone,
        delivery_type: form.delivery_type === 'delivery' ? 'Yetkazib berish' : "O'zi olib ketish",
        address: form.delivery_type === 'delivery'
          ? `${form.city}, ${form.street}, ${form.house}`
          : '—',
        payment_method: form.payment_method === 'cash' ? 'Naqt pul' : 'Karta',
        items: itemsList,
        total: (total + delivery_fee).toLocaleString(),
        date: new Date().toLocaleString('uz-UZ'),
      },
      'VKSoQPUSwsD4O759x'
    )

    clearCart()
    navigate('/order-success')
  }

  return (
    <div className="checkout-page">
      <h1>Buyurtma berish</h1>

      {error && <p className="auth-error">{error}</p>}

      <form onSubmit={handleSubmit} className="checkout-form">

        <div className="checkout-section">
          <h3>Shaxsiy ma'lumot</h3>
          <div className="form-group">
            <label>Ism familiya</label>
            <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Telefon</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+998901234567" required />
          </div>
        </div>

        <div className="checkout-section">
          <h3>Yetkazib berish</h3>
          <div className="radio-group">
            <label>
              <input type="radio" name="delivery_type" value="delivery" checked={form.delivery_type === 'delivery'} onChange={handleChange} />
              Yetkazib berish (+15 000 so'm)
            </label>
            <label>
              <input type="radio" name="delivery_type" value="pickup" checked={form.delivery_type === 'pickup'} onChange={handleChange} />
              O'zi olib ketish (bepul)
            </label>
          </div>

          {form.delivery_type === 'delivery' && (
            <>
              <div className="form-group">
                <label>Shahar</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Ko'cha</label>
                <input type="text" name="street" value={form.street} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Uy raqami</label>
                <input type="text" name="house" value={form.house} onChange={handleChange} required />
              </div>
            </>
          )}
        </div>

        <div className="checkout-section">
          <h3>To'lov usuli</h3>
          <div className="radio-group">
            <label>
              <input type="radio" name="payment_method" value="cash" checked={form.payment_method === 'cash'} onChange={handleChange} />
              Naqt pul
            </label>
            <label>
              <input type="radio" name="payment_method" value="card" checked={form.payment_method === 'card'} onChange={handleChange} />
              Karta
            </label>
          </div>
        </div>

        <div className="checkout-section">
          <div className="form-group">
            <label>Izoh (ixtiyoriy)</label>
            <textarea name="note" value={form.note} onChange={handleChange} rows={3} />
          </div>
        </div>

        <div className="checkout-summary">
          <p>Mahsulotlar: {total.toLocaleString()} so'm</p>
          <p>Yetkazib berish: {form.delivery_type === 'delivery' ? '15 000 so\'m' : 'Bepul'}</p>
          <h3>Jami: {(total + (form.delivery_type === 'delivery' ? 15000 : 0)).toLocaleString()} so'm</h3>
        </div>

        <button type="submit" className="btn-primary full" disabled={loading}>
          {loading ? 'Yuklanmoqda...' : 'Buyurtmani tasdiqlash'}
        </button>
      </form>
    </div>
  )
}

export default Checkout