import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import '../../styles/Admin.css'

const STATUS_LABELS = {
  new: '🆕 Yangi',
  confirmed: '✅ Tasdiqlangan',
  shipped: '🚚 Yo\'lda',
  delivered: '📦 Yetkazildi',
  cancelled: '❌ Bekor qilindi',
}

const STATUS_OPTIONS = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled']

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (loading) return <p className="loading">Yuklanmoqda...</p>

  return (
    <div className="admin-page">
      <h1>Buyurtmalar</h1>

      <div className="filter-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          Barchasi ({orders.length})
        </button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} className={filter === s ? 'active' : ''} onClick={() => setFilter(s)}>
            {STATUS_LABELS[s]} ({orders.filter(o => o.status === s).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty">Buyurtma yo'q</p>
      ) : (
        <div className="orders-list">
          {filtered.map(order => (
            <div key={order.id} className="order-card admin-order-card">
              <div className="order-card-header">
                <div>
                  <h3>{order.full_name}</h3>
                  <p>{order.phone}</p>
                </div>
                <div>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="status-select"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item, i) => (
                  <div key={i} className="order-item">
                    <span>{item.name} {item.size && `(${item.size})`} {item.color && `- ${item.color}`}</span>
                    <span>{item.quantity} x {item.price.toLocaleString()} so'm</span>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div>
                  <p>{order.delivery_type === 'delivery' ? `🚚 ${order.city}, ${order.street}, ${order.house}` : '🏪 O\'zi olib ketish'}</p>
                  <p>{order.payment_method === 'cash' ? '💵 Naqt' : '💳 Karta'}</p>
                  {order.note && <p>📝 {order.note}</p>}
                </div>
                <div>
                  <p>{new Date(order.created_at).toLocaleDateString('uz-UZ')}</p>
                  <strong>{order.total.toLocaleString()} so'm</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders