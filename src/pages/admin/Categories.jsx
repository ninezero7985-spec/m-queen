import { useEffect, useState } from 'react'
import '../../styles/Admin.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Categories() {
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  const token = localStorage.getItem('token')
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    const res = await fetch(`${API_URL}/api/categories`)
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    const res = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: newCategory.trim() })
    })
    const data = await res.json()
    if (!res.ok) { showMsg(data.message, 'error'); return }
    setCategories(data)
    setNewCategory('')
    showMsg("✅ Kategoriya qo'shildi")
  }

  const handleDelete = async (name) => {
    if (!confirm(`"${name}" kategoriyasini o'chirasizmi?`)) return
    const res = await fetch(`${API_URL}/api/categories`, {
      method: 'DELETE',
      headers: authHeaders,
      body: JSON.stringify({ name })
    })
    const data = await res.json()
    setCategories(data)
    showMsg("🗑️ Kategoriya o'chirildi")
  }

  if (loading) return <p className="loading">Yuklanmoqda...</p>

  return (
    <div className="admin-page">
      {message && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px',
          background: message.type === 'error' ? '#e53e3e' : '#1a1a1a',
          color: 'white', padding: '12px 20px', borderRadius: '8px',
          fontSize: '14px', fontWeight: '600', zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {message.text}
        </div>
      )}

      <div className="admin-page-header">
        <h1>Kategoriyalar</h1>
      </div>

      {/* Yangi kategoriya qo'shish */}
      <div className="categories-add-box">
        <h3>Yangi kategoriya</h3>
        <form onSubmit={handleAdd} className="categories-add-form">
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="Kategoriya nomi..."
          />
          <button type="submit" className="btn-primary">+ Qo'shish</button>
        </form>
      </div>

      {/* Kategoriyalar listi */}
      <div className="categories-list-box">
        <h3>Mavjud kategoriyalar ({categories.length})</h3>
        {categories.length === 0 ? (
          <p className="empty">Kategoriya yo'q</p>
        ) : (
          <div className="categories-list">
            {categories.map((cat, i) => (
              <div key={i} className="category-item">
                <span>{cat}</span>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(cat)}
                >
                  🗑️ O'chirish
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Categories