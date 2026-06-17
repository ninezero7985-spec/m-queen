import { Link } from 'react-router-dom'
import '../styles/Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Logo va tavsif */}
        <div className="footer-brand">
          <div className="footer-logo">M-Queen</div>
          <p>Eng yangi ayollar kiyimlari kolleksiyasi. Sifat va uslub — faqat siz uchun.</p>
          <div className="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="https://t.me" target="_blank" rel="noreferrer" aria-label="Telegram">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.01 9.47c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.4 14.49l-2.96-.924c-.643-.204-.657-.643.136-.953l11.55-4.453c.537-.194 1.006.131.836.088z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Navigatsiya */}
        <div className="footer-nav">
          <h4>Sahifalar</h4>
          <ul>
            <li><Link to="/">Bosh sahifa</Link></li>
            <li><Link to="/shop">Do'kon</Link></li>
            <li><Link to="/cart">Savat</Link></li>
          </ul>
        </div>

        {/* Kategoriyalar */}
        <div className="footer-nav">
          <h4>Kategoriyalar</h4>
          <ul>
            <li><Link to="/shop?category=Ko'ylaklar">Ko'ylaklar</Link></li>
            <li><Link to="/shop?category=Yubkalar">Yubkalar</Link></li>
            <li><Link to="/shop?category=Shimlar">Shimlar</Link></li>
            <li><Link to="/shop?category=Kurtalar">Kurtalar</Link></li>
            <li><Link to="/shop?category=Sport">Sport</Link></li>
          </ul>
        </div>

        {/* Kontakt */}
        <div className="footer-contact">
          <h4>Bog'lanish</h4>
          <ul>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.1-1.1a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              <a href="tel:+998901234567">+998 90 123 45 67</a>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <a href="mailto:mqueen7257755@gmail.com">mqueen7257755@gmail.com</a>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Toshkent, O'zbekiston</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} M-Queen. Barcha huquqlar himoyalangan.</p>
        <p>Ishlab chiqilgan ❤️ bilan</p>
      </div>
    </footer>
  )
}

export default Footer