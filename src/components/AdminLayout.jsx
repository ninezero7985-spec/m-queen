import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import '../styles/Admin.css'

function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
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