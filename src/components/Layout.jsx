import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

function Layout() {
  const { pathname } = useLocation()

  // Har safar sahifa almashganda — eng yuqoriga qaytarish
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
