import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function RequireAuth({ children, role, redirectTo = '/login' }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }
  if (role && user?.role !== role) {
    return <Navigate to={redirectTo} replace />
  }
  return children
}

export default RequireAuth
