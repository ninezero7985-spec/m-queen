import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabase/client'
import '../../styles/Admin.css'

function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, products: 0, newOrders: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: orders }, { count: products }, { data: newOrds }, { data: allOrds }] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*').eq('status', 'new').order('created_at', { ascending: false }).limit(5),
        supabase.from('orders').select('total'),
      ])

      const revenue = allOrds?.reduce((sum, o) => sum + o.total, 0) || 0

      setStats({ orders, products, newOrders: newOrds?.length || 0, revenue })
      setRecentOrders(newOrds || [])
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) return <p className="loading">Yuklanmoqda...</p>

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Jami buyurtmalar</h3>
          <p>{stats.orders}</p>
        </div>
        <div className="stat-card new">
          <h3>Yangi buyurtmalar</h3>
          <p>{stats.newOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Mahsulotlar</h3>
          <p>{stats.products}</p>
        </div>
        <div className="stat-card">
          <h3>Umumiy daromad</h3>
          <p>{stats.revenue.toLocaleString()} so'm</p>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Yangi buyurtmalar</h2>
          <Link to="/admin/orders" className="btn-outline">Hammasini ko'rish</Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="empty">Yangi buyurtma yo'q</p>
        ) : (
          <div className="orders-table">
            <div className="orders-table-head">
              <span>Ism</span>
              <span>Telefon</span>
              <span>Jami</span>
              <span>Sana</span>
            </div>
            {recentOrders.map(order => (
              <div key={order.id} className="orders-table-row">
                <span>{order.full_name}</span>
                <span>{order.phone}</span>
                <span>{order.total.toLocaleString()} so'm</span>
                <span>{new Date(order.created_at).toLocaleDateString('uz-UZ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-links">
        <Link to="/admin/products" className="btn-primary">Mahsulotlar</Link>
        <Link to="/admin/orders" className="btn-primary">Buyurtmalar</Link>
      </div>
    </div>
  )
}

export default Dashboard