import { useEffect, useRef, useState } from 'react'
import '../../styles/Admin.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  old_price: '',
  category: '',
  variants: [],
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

const MAX_IMAGES = 3

function Notification({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div style={{
      position: 'fixed', top: '80px', right: '24px',
      background: type === 'error' ? 'var(--danger)' : '#1a1a1a',
      color: 'white', padding: '12px 20px', borderRadius: 'var(--radius)',
      fontSize: '14px', fontWeight: '600', zIndex: 9999,
      boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center',
      gap: '10px', animation: 'slideDown 0.3s ease',
    }}>
      {message}
      <button onClick={onClose} style={{ color: 'white', opacity: 0.7, fontSize: '18px' }}>×</button>
    </div>
  )
}

function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [savedImages, setSavedImages] = useState([])
  const [pendingFiles, setPendingFiles] = useState([])
  const [pendingPreviews, setPendingPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [notification, setNotification] = useState(null)
  const fileInputRef = useRef(null)

  // Variant inputs
  const [sizeInput, setSizeInput] = useState('')
  const [priceInput, setPriceInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(null)

  const token = localStorage.getItem('token')
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  const showNotif = (message, type = 'success') => setNotification({ message, type })

  useEffect(() => {
    fetchProducts()
    fetch(`${API_URL}/api/categories`).then(r => r.json()).then(data => setCategories(data))
  }, [])

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/api/products/all`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  // Variant qo'shish
  const addVariant = () => {
    if (!sizeInput) return
    const exists = form.variants.find(v => v.size === sizeInput)
    if (exists) { showNotif('Bu o\'lcham allaqachon bor', 'error'); return }
    setForm({
      ...form,
      variants: [...form.variants, { size: sizeInput, price: Number(priceInput) || 0, colors: [] }]
    })
    setSizeInput('')
    setPriceInput('')
    setSelectedVariantIdx(form.variants.length)
  }

  const removeVariant = (idx) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) })
    if (selectedVariantIdx === idx) setSelectedVariantIdx(null)
  }

  // Tanlangan variant ga rang qo'shish
  const addColorToVariant = () => {
    if (selectedVariantIdx === null || !colorInput) return
    const variants = [...form.variants]
    if (variants[selectedVariantIdx].colors.includes(colorInput)) return
    variants[selectedVariantIdx].colors = [...variants[selectedVariantIdx].colors, colorInput]
    setForm({ ...form, variants })
    setColorInput('')
  }

  const removeColorFromVariant = (variantIdx, color) => {
    const variants = [...form.variants]
    variants[variantIdx].colors = variants[variantIdx].colors.filter(c => c !== color)
    setForm({ ...form, variants })
  }

  const totalImages = savedImages.length + pendingFiles.length

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files)
    const allowed = MAX_IMAGES - totalImages
    if (allowed <= 0) return
    const selected = files.slice(0, allowed)
    const newPreviews = []
    const newRawFiles = []
    for (const file of selected) {
      newPreviews.push(URL.createObjectURL(file))
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
    if (totalImages === 0) { showNotif('❌ Kamida 1 ta rasm qo\'shing', 'error'); return }
    setUploading(true)
    if (pendingFiles.length > 0) showNotif('⏳ Rasmlar siqilmoqda...')

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
      await fetch(`${API_URL}/api/products/${editId}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(payload) })
      showNotif('✅ Mahsulot yangilandi')
    } else {
      await fetch(`${API_URL}/api/products`, { method: 'POST', headers: authHeaders, body: JSON.stringify(payload) })
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
    setSelectedVariantIdx(null)
  }

  const handleEdit = (product) => {
    setForm({
      name: product.name, description: product.description || '',
      price: product.price, old_price: product.old_price || '',
      category: product.category,
      variants: product.variants || [],
      stock: product.stock, is_active: product.is_active,
    })
    setSavedImages(product.images || [])
    setPendingFiles([])
    setPendingPreviews([])
    setEditId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Mahsulotni o\'chirasizmi?')) return
    await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE', headers: authHeaders })
    showNotif('🗑️ Mahsulot o\'chirildi')
    fetchProducts()
  }

  const handleToggleActive = async (id, is_active) => {
    await fetch(`${API_URL}/api/products/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ is_active: !is_active }) })
    showNotif(is_active ? '🙈 Yashirildi' : '👁️ Ko\'rsatildi')
    fetchProducts()
  }

  if (loading) return <p className="loading">Yuklanmoqda...</p>

  return (
    <div className="admin-page">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <style>{`
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .variant-card { border: 1.5px solid var(--gray-2); border-radius: 8px; padding: 12px; margin-bottom: 8px; cursor: pointer; }
        .variant-card.selected { border-color: var(--primary); background: var(--primary-light); }
        .variant-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .variant-size { font-weight: 700; font-size: 15px; }
        .variant-price { color: var(--primary); font-weight: 600; }
        .variant-colors { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .variant-color-tag { background: var(--gray-1); border: 1px solid var(--gray-2); border-radius: 20px; padding: 2px 10px; font-size: 12px; display: flex; align-items: center; gap: 4px; }
      `}</style>

      <div className="admin-page-header">
        <h1>Mahsulotlar</h1>
        <button className="btn-primary" onClick={() => {
          setForm({...EMPTY_FORM, category: categories[0] || ''}); setSavedImages([]); setPendingFiles([]); setPendingPreviews([]); setEditId(null); setSelectedVariantIdx(null); setShowForm(true)
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
                  <label>Asosiy narx (so'm)</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" />
                </div>
                <div className="form-group">
                  <label>Eski narx</label>
                  <input type="number" name="old_price" value={form.old_price} onChange={handleChange} min="0" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kategoriya</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Soni</label>
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0" />
                </div>
              </div>

              {/* O'lcham va narx qo'shish */}
              <div className="form-group">
                <label>O'lchamlar va narxlar</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={e => setSizeInput(e.target.value)}
                    placeholder="O'lcham (S, M, L...)"
                    style={{ flex: 1, padding: '8px 12px', border: '1.5px solid var(--gray-2)', borderRadius: '8px' }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVariant())}
                  />
                  <input
                    type="number"
                    value={priceInput}
                    onChange={e => setPriceInput(e.target.value)}
                    placeholder="Qo'shimcha narx (so'm)"
                    min="0"
                    style={{ flex: 1, padding: '8px 12px', border: '1.5px solid var(--gray-2)', borderRadius: '8px' }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVariant())}
                  />
                  <button type="button" className="btn-primary" onClick={addVariant} style={{ padding: '8px 16px' }}>+</button>
                </div>

                {/* Variantlar listi */}
                {form.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className={`variant-card ${selectedVariantIdx === idx ? 'selected' : ''}`}
                    onClick={() => setSelectedVariantIdx(idx)}
                  >
                    <div className="variant-card-header">
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span className="variant-size">{variant.size}</span>
                        <span className="variant-price">+{variant.price.toLocaleString()} so'm</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeVariant(idx) }}
                        style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '16px' }}>×</button>
                    </div>
                    <div className="variant-colors">
                      {variant.colors.map(color => (
                        <span key={color} className="variant-color-tag">
                          {color}
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeColorFromVariant(idx, color) }}
                            style={{ color: 'var(--danger)', fontSize: '12px' }}>×</button>
                        </span>
                      ))}
                      {variant.colors.length === 0 && <span style={{ fontSize: '12px', color: 'var(--gray-4)' }}>Rang qo'shing ↓</span>}
                    </div>
                  </div>
                ))}

                {/* Rang qo'shish (tanlangan variantga) */}
                {selectedVariantIdx !== null && form.variants[selectedVariantIdx] && (
                  <div style={{ marginTop: '8px', padding: '12px', background: 'var(--gray-1)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                      "{form.variants[selectedVariantIdx].size}" uchun rang qo'shish:
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={colorInput}
                        onChange={e => setColorInput(e.target.value)}
                        placeholder="Rang nomi (Qizil, Ko'k...)"
                        style={{ flex: 1, padding: '8px 12px', border: '1.5px solid var(--gray-2)', borderRadius: '8px' }}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColorToVariant())}
                      />
                      <button type="button" className="btn-primary" onClick={addColorToVariant} style={{ padding: '8px 16px' }}>+</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Rasmlar */}
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
                        <span>+</span><small>Rasm</small>
                      </button>
                    )}
                  </div>
                  {totalImages >= MAX_IMAGES && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '8px' }}>Maksimum 3 ta rasm</p>}
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
                      <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
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
              {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : <div className="product-card-no-img">Rasm yo'q</div>}
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