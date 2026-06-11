import { useRouteError, Link } from 'react-router-dom'

function ErrorPage() {
  const error = useRouteError()

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1>404</h1>
      <p>Sahifa topilmadi</p>
      <p style={{ color: '#999', fontSize: '14px' }}>{error?.statusText || error?.message}</p>
      <Link to="/" style={{ marginTop: '20px', display: 'inline-block' }}>
        Bosh sahifaga qaytish
      </Link>
    </div>
  )
}

export default ErrorPage