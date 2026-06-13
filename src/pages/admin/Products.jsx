import { useEffect, useRef, useState } from 'react'
import '../../styles/Admin.css'

const CATEGORIES = ["Ko'ylaklar", 'Yubkalar', 'Shimlar', 'Kurtalar', 'Sport', 'Aksessuarlar']

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  old_price: '',
  category: "Ko'ylaklar",
  sizes: [],
  colors: [],
  stock: '',
  is_active: true,
}

const compressImage = (file) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1200
      let w = img.width
      let h = img.height
      if (w > MAX) { h = (h * MAX) / w; w = MAX }
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: 'image/webp' }))
        URL.revokeObjectURL(url)
      }, 'image/webp', 0.8)
    }
    img.src = url
  })
}

const getFileNameFromUrl = (url) => {
  try { return url.split('/').pop().split('?')[0] } catch { return null }
}

const MAX_IMAGES = 3

function Notification({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '24px',
      background: type === 'error' ? 'var(--danger)' : '#1a1a1a',
      color: 'white',
      padding: '12px 20px',
      borderRadius: 'var(--radius)',
      fontSize: '14px',
      fontWeight: '600',
      zIndex: 9999,
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'slideDown 0.3s ease',
    }}>
      {message}
      <button onClick={onClose} style={{ color: 'white', opacity: 0.7, fontSize: '18px' }}>×</button>
    </div>
  )
}

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [savedImages, setSavedImages] = useState([])
  const [pendingFiles, setPendingFiles] = useState([])
  const [pendingPreviews, setPendingPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [sizeInput, setSizeInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const [notification, setNotification] = useState(null)
  const fileInputRef = useRef(null)

  const showNotif = (message, type = 'success') => setNotification({ message, type })

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
  const res = await fetch('http://localhost:5000/api/products')
  const data = await res.json()
  setProducts(data)
  setLoading(false)
}

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const addSize = () => {
    if (sizeInput && !form.sizes.includes(sizeInput)) setForm({ ...form, sizes: [...form.sizes, sizeInput] })
    setSizeInput('')
  }
  const removeSize = (s) => setForm({ ...form, sizes: form.sizes.filter(x => x !== s) })

  const addColor = () => {
    if (colorInput && !form.colors.includes(colorInput)) setForm({ ...form, colors: [...form.colors, colorInput] })
    setColorInput('')
  }
  const removeColor = (c) => setForm({ ...form, colors: form.colors.filter(x => x !== c) })

  const totalImages = savedImages.length + pendingFiles.length

  // Rasm tanlaganda — faqat preview, siqish yo'q
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files)
    const allowed = MAX_IMAGES - totalImages
    if (allowed <= 0) return

    const selected = files.slice(0, allowed)
    const newPreviews = []
    const newRawFiles = []

    for (const file of selected) {
      const previewUrl = URL.createObjectURL(file)
      newPreviews.push(previewUrl)
      newRawFiles.push(file)
    }

    setPendingPreviews(prev => [...prev, ...newPreviews])
    setPendingFiles(prev => [...prev, ...newRawFiles])
    e.target.value = ''
  }

  const removeSavedImage = (index) => setSavedImages(prev => prev.filter((_, i) => i !== index))

  const removePendingImage = (index) => {
    URL.revokeObjectURL(pendingPreviews[index])
    setPendingPreviews(prev => prev.filter((_, i) => i !== index))
    setPendingFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Saqlash bosilganda — siqish + yuklash
  const uploadPendingFiles = async () => {
  const urls = []
  for (const file of pendingFiles) {
    const compressed = await compressImage(file)
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(compressed)
    })
    urls.push(base64)
  }
  return urls
}

  const handleSubmit = async (e) => {
  e.preventDefault()

  if (totalImages === 0) {
    showNotif('❌ Kamida 1 ta rasm qo\'shing', 'error')
    return
  }

  setUploading(true)

  if (pendingFiles.length > 0) {
    showNotif('⏳ Rasmlar siqilmoqda...')
  }

  const newUrls = await uploadPendingFiles()
  const allImages = [...savedImages, ...newUrls]

  const payload = {
    ...form,
    price: Number(form.price),
    old_price: form.old_price ? Number(form.old_price) : null,
    stock: Number(form.stock),
    images: allImages,
  }

  if (editId) {
    await fetch(`http://localhost:5000/api/products/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    showNotif('✅ Mahsulot yangilandi')
  } else {
    await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    showNotif('✅ Mahsulot qo\'shildi')
  }

  setUploading(false)
  fetchProducts()
  closeForm()
}

  const closeForm = () => {
    pendingPreviews.forEach(url => URL.revokeObjectURL(url))
    setShowForm(false)
    setForm(EMPTY_FORM)
    setSavedImages([])
    setPendingFiles([])
    setPendingPreviews([])
    setEditId(null)
  }

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      old_price: product.old_price || '',
      category: product.category,
      sizes: product.sizes || [],
      colors: product.colors || [],
      stock: product.stock,
      is_active: product.is_active,
    })
    setSavedImages(product.images || [])
    setPendingFiles([])
    setPendingPreviews([])
    setEditId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
  if (!confirm('Mahsulotni o\'chirasizmi?')) return
  await fetch(`http://localhost:5000/api/products/${id}`, {
    method: 'DELETE'
  })
  showNotif('🗑️ Mahsulot o\'chirildi')
  fetchProducts()
}

  const handleToggleActive = async (id, is_active) => {
  await fetch(`http://localhost:5000/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active: !is_active })
  })
  showNotif(is_active ? '🙈 Yashirildi' : '👁️ Ko\'rsatildi')
  fetchProducts()
}

  if (loading) return <p className="loading">Yuklanmoqda...</p>

  return (
    <div className="admin-page">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="admin-page-header">
        <h1>Mahsulotlar</h1>
        <button className="btn-primary" onClick={() => {
          setForm(EMPTY_FORM); setSavedImages([]); setPendingFiles([]); setPendingPreviews([]); setEditId(null); setShowForm(true)
        }}>+ Qo'shish</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editId ? 'Tahrirlash' : 'Yangi mahsulot'}</h2>
            <form onSubmit={handleSubmit} className="product-form">

              <div className="form-group">
                <label>Nomi</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Tavsif</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Narx (so'm)</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Eski narx</label>
                  <input type="number" name="old_price" value={form.old_price} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kategoriya</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Soni</label>
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>O'lchamlar</label>
                <div className="tag-input">
                  <input type="text" value={sizeInput} onChange={e => setSizeInput(e.target.value)} placeholder="S, M, L, XL..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())} />
                  <button type="button" onClick={addSize}>+</button>
                </div>
                <div className="tags">
                  {form.sizes.map(s => (
                    <span key={s} className="tag">{s} <button type="button" onClick={() => removeSize(s)}>×</button></span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Ranglar</label>
                <div className="tag-input">
                  <input type="text" value={colorInput} onChange={e => setColorInput(e.target.value)} placeholder="Qizil, Ko'k..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())} />
                  <button type="button" onClick={addColor}>+</button>
                </div>
                <div className="tags">
                  {form.colors.map(c => (
                    <span key={c} className="tag">{c} <button type="button" onClick={() => removeColor(c)}>×</button></span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Rasmlar ({totalImages}/{MAX_IMAGES}) <span style={{color:'var(--danger)'}}>*</span></label>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display: 'none' }} />
                <div className="image-upload-area">
                  <div className="image-previews">
                    {savedImages.map((url, i) => (
                      <div key={`saved-${i}`} className="image-preview">
                        <img src={url} alt="" />
                        <button type="button" onClick={() => removeSavedImage(i)}>×</button>
                      </div>
                    ))}
                    {pendingPreviews.map((url, i) => (
                      <div key={`pending-${i}`} className="image-preview image-preview-new">
                        <img src={url} alt="" />
                        <button type="button" onClick={() => removePendingImage(i)}>×</button>
                      </div>
                    ))}
                    {totalImages < MAX_IMAGES && (
                      <button type="button" className="image-add-btn" onClick={() => fileInputRef.current?.click()}>
                        <span>+</span>
                        <small>Rasm</small>
                      </button>
                    )}
                  </div>
                  {totalImages >= MAX_IMAGES && (
                    <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '8px' }}>Maksimum 3 ta rasm</p>
                  )}
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                  Faol (saytda ko'rinadi)
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={closeForm}>Bekor qilish</button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite'
                      }} />
                      Siqilmoqda...
                    </span>
                  ) : editId ? 'Saqlash' : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-admin-grid">
        {products.map(product => (
          <div key={product.id} className={`product-admin-card ${!product.is_active ? 'inactive' : ''}`}>
            <div className="product-admin-img">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <div className="product-card-no-img">Rasm yo'q</div>
              )}
            </div>
            <div className="product-admin-info">
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <p>{product.price.toLocaleString()} so'm</p>
              <p>Soni: {product.stock}</p>
            </div>
            <div className="product-admin-actions">
              <button className="btn-outline" onClick={() => handleEdit(product)}>✏️</button>
              <button className="btn-outline" onClick={() => handleToggleActive(product.id, product.is_active)}>
                {product.is_active ? '🙈' : '👁️'}
              </button>
              <button className="btn-danger" onClick={() => handleDelete(product.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products