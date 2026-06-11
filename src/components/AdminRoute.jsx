import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

function AdminRoute({ children }) {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return setStatus('denied')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      setStatus(profile?.role === 'admin' ? 'allowed' : 'denied')
    }
    check()
  }, [])

  if (status === 'loading') return null
  if (status === 'denied') return <Navigate to="/" replace />

  return children
}

export default AdminRoute