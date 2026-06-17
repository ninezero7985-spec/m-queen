import { useState, useEffect, useRef } from 'react'
import emailjs from '@emailjs/browser'
import '../styles/Contact.css'

const SERVICE_ID = 'service_zuowvdw'
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID || 'template_equwy6e'
const PUBLIC_KEY = 'VKSoQPUSwsD4O759x'

function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => e.target.classList.add('visible'))
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        name: form.name,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      }, PUBLIC_KEY)

      setSent(true)
      setForm({ name: '', phone: '', subject: '', message: '' })
      setTimeout(() => setSent(false), 6000)
    } catch (err) {
      setError('Xabar yuborishda xatolik. Iltimos qayta urinib ko\'ring.')
    } finally {
      setLoading(false)
    }
  }

  const contacts = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.1-1.1a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        </svg>
      ),
      label: 'Telefon',
      value: '+998 90 123 45 67',
      href: 'tel:+998901234567',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      label: 'Email',
      value: 'mqueen7257755@gmail.com',
      href: 'mailto:mqueen7257755@gmail.com',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      label: 'Manzil',
      value: "Toshkent, O'zbekiston",
      href: null,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      ),
      label: 'Ish vaqti',
      value: 'Dush–Shan: 9:00 – 20:00',
      href: null,
    },
  ]

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-bg">
          <div className="contact-blob blob-1" />
          <div className="contact-blob blob-2" />
        </div>
        <div className="contact-hero-content">
          <span className="contact-eyebrow">Bog'lanish</span>
          <h1>Biz bilan <span className="contact-gradient-text">aloqaga</span> chiqing</h1>
          <p>Savollaringiz, takliflaringiz yoki buyurtma bo'yicha murojaat qiling — biz doim yordamga tayyormiz.</p>
        </div>
      </section>

      <div className="contact-main">
        <div className="contact-cards reveal">
          {contacts.map((c, i) => (
            <div className="contact-card" key={i} style={{ '--delay': `${i * 0.1}s` }}>
              <div className="contact-card-icon">{c.icon}</div>
              <div>
                <p className="contact-card-label">{c.label}</p>
                {c.href
                  ? <a className="contact-card-value" href={c.href}>{c.value}</a>
                  : <p className="contact-card-value">{c.value}</p>
                }
              </div>
            </div>
          ))}
        </div>

        <div className="contact-grid">
          <div className="contact-form-wrap reveal">
            <h2>Xabar jo'natish</h2>
            <p className="contact-form-subtitle">24 soat ichida javob beramiz</p>

            {sent && (
              <div className="contact-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Xabaringiz muvaffaqiyatli yuborildi!
              </div>
            )}

            {error && (
              <div className="contact-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              {[
                { name: 'name', label: 'Ismingiz', type: 'text', placeholder: 'Ism Familiya' },
                { name: 'phone', label: 'Telefon raqam', type: 'tel', placeholder: '+998 90 123 45 67' },
                { name: 'subject', label: 'Mavzu', type: 'text', placeholder: 'Savol mavzusi' },
              ].map(field => (
                <div className={`cf-group ${focused === field.name || form[field.name] ? 'active' : ''}`} key={field.name}>
                  <label>{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    onFocus={() => setFocused(field.name)}
                    onBlur={() => setFocused(null)}
                    required
                  />
                </div>
              ))}

              <div className={`cf-group ${focused === 'message' || form.message ? 'active' : ''}`}>
                <label>Xabar</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Xabaringizni yozing..."
                  rows={5}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>

              <button type="submit" className="contact-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span style={{
                      width: '18px', height: '18px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite'
                    }} />
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <span>Yuborish</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22,2 15,22 11,13 2,9"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="contact-side reveal">
            <div className="contact-social-wrap">
              <h3>Ijtimoiy tarmoqlar</h3>
              <p>Bizni kuzatib boring va yangiliklarda birinchi bo'ling</p>
              <div className="contact-social-list">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-item">
                  <div className="social-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="2" width="20" height="20" rx="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                  </div>
                  <div>
                    <p className="social-name">Instagram</p>
                    <p className="social-handle">@mqueen_uz</p>
                  </div>
                  <svg className="social-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="7" y1="17" x2="17" y2="7"/>
                    <polyline points="7,7 17,7 17,17"/>
                  </svg>
                </a>
                <a href="https://t.me" target="_blank" rel="noreferrer" className="social-item">
                  <div className="social-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.01 9.47c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.4 14.49l-2.96-.924c-.643-.204-.657-.643.136-.953l11.55-4.453c.537-.194 1.006.131.836.088z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="social-name">Telegram</p>
                    <p className="social-handle">@mqueen_uz</p>
                  </div>
                  <svg className="social-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="7" y1="17" x2="17" y2="7"/>
                    <polyline points="7,7 17,7 17,17"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="contact-faq">
              <h3>Tez-tez so'raladigan savollar</h3>
              {[
                { q: 'Yetkazib berish necha kun?', a: "1–3 ish kuni ichida Toshkent bo'ylab yetkazamiz." },
                { q: 'Qaytarish mumkinmi?', a: 'Ha, 7 kun ichida kamchilik bo\'lsa qaytarish mumkin.' },
                { q: 'Optom buyurtma qabul qilinadi?', a: 'Ha, 10+ dona uchun alohida narx beramiz.' },
              ].map((item, i) => (
                <details key={i} className="faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Contact