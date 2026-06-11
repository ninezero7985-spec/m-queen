import { Link } from 'react-router-dom'
import '../styles/OrderSuccess.css'

function OrderSuccess() {
  return (
    <div className="order-success">
      <div className="order-success-icon">✅</div>
      <h1>Buyurtma qabul qilindi!</h1>
      <p>Tez orada siz bilan bog'lanamiz.</p>
      <div className="order-success-actions">
        <Link to="/shop" className="btn-primary">Xarid davom ettirish</Link>
        <Link to="/" className="btn-outline">Bosh sahifa</Link>
      </div>
    </div>
  )
}

export default OrderSuccess