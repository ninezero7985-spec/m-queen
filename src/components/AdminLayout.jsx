import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import '../styles/Admin.css'

function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">Admin Panel</div>
        <nav>
          <NavLink to="/admin" end>📊 Dashboard</NavLink>
          <NavLink to="/admin/products">👗 Mahsulotlar</NavLink>
          <NavLink to="/admin/orders">📦 Buyurtmalar</NavLink>
          <NavLink to="/admin/categories">🏷️ Kategoriyalar</NavLink>
        </nav>
        <div className="admin-sidebar-logout">
          <button onClick={handleLogout}>🚪 Chiqish</button>
        </div>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout