import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/About.css'

function About() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.about-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const stats = [
    { num: '2000+', label: 'Mamnun mijozlar' },
    { num: '500+', label: 'Mahsulotlar' },
    { num: '3', label: 'Yillik tajriba' },
    { num: '14', label: 'Viloyatga yetkazish' },
  ]

  const values = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6z" />
        </svg>
      ),
      title: 'Sifat kafolati',
      text: "Har bir mahsulot diqqat bilan tanlanadi. Faqat sifatli mato va zamonaviy bichim.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="1" y="3" width="15" height="13" rx="1" />
          <path d="M16 8h4l3 3v5h-7z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      title: 'Tezkor yetkazib berish',
      text: "O'zbekiston bo'ylab 1–3 ish kuni ichida tez va ishonchli yetkazib beramiz.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
      title: 'Ishonch va xavfsizlik',
      text: "Ro'yxatdan o'tish shart emas. To'lov mahsulot yetib borgach amalga oshiriladi.",
    },
  ]

  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <div className="about-blob ab-1" />
          <div className="about-blob ab-2" />
        </div>
        <div className="about-hero-content">
          <span className="about-eyebrow">Biz haqimizda</span>
          <h1>Zamonaviy <span className="about-gradient">ayollar</span> uchun uslub</h1>
          <p>
            M-Queen — har bir ayolning go'zalligini ta'kidlovchi zamonaviy kiyimlar do'koni.
            Biz uslub, sifat va qulaylikni bir joyda taklif etamiz.
          </p>
        </div>
      </section>

      {/* Hikoya */}
      <section className="about-story about-reveal">
        <div className="about-story-text">
          <h2>Bizning hikoyamiz</h2>
          <p>
            M-Queen kichik bir orzudan boshlangan: har bir ayol o'ziga ishongan, chiroyli va
            qulay his qilishi kerak. Shu maqsadda biz eng so'nggi va sifatli kolleksiyalarni
            tanlab, ularni hammabop narxda taklif etamiz.
          </p>
          <p>
            Bugun biz minglab mijozlarning ishonchini qozonganmiz. Bizning vazifamiz —
            onlayn xaridni oddiy, tez va xavfsiz qilish. Siz tanlaysiz, qolganini biz bajaramiz.
          </p>
        </div>
        <div className="about-story-img">
          <span>M-Queen</span>
        </div>
      </section>

      {/* Statistika */}
      <section className="about-stats about-reveal">
        {stats.map((s, i) => (
          <div className="about-stat" key={i}>
            <p className="about-stat-num">{s.num}</p>
            <p className="about-stat-label">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Qadriyatlar */}
      <section className="about-values">
        <h2 className="about-reveal">Nega aynan biz?</h2>
        <div className="about-values-grid">
          {values.map((v, i) => (
            <div className="about-value-card about-reveal" key={i} style={{ '--delay': `${i * 0.1}s` }}>
              <div className="about-value-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chaqiruv */}
      <section className="about-cta about-reveal">
        <h2>Kolleksiyamizni ko'rishni xohlaysizmi?</h2>
        <p>Eng so'nggi mahsulotlar siz uchun tayyor.</p>
        <Link to="/shop" className="btn-primary">Do'konga o'tish</Link>
      </section>
    </div>
  )
}

export default About
