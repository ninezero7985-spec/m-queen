import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.message || 'Xatolik yuz berdi')
      setLoading(false)
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    navigate('/admin')
  } catch (err) {
    setError('Server bilan aloqa yo\'q')
    setLoading(false)
  }
}

  return (
  <div className="auth-page">
    <div className="auth-card">
      <h2>Admin kirish</h2>

      {error && <p className="auth-error">{error}</p>}

      <div className="form-group">
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="admin@example.com" required />
      </div>

      <div className="form-group">
        <label>Parol</label>
        <div className="input-password">
          <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <button onClick={handleSubmit} className="btn-primary full" disabled={loading}>
        {loading ? 'Kirish...' : 'Kirish'}
      </button>
    </div>
  </div>
)
}

export default Login