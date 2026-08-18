import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useStoreScope } from '../hooks/useStoreScope'
import { ROUTES } from '../utils/routes'

export const RequireAuth = () => {
  const { currentUser } = useStoreScope()
  const location = useLocation()
  return currentUser ? <Outlet /> : <Navigate to={ROUTES.login} replace state={{ from: location }} />
}

export const RequireSuperAdmin = () => {
  const { isSuperAdmin } = useStoreScope()
  return isSuperAdmin ? <Outlet /> : <Navigate to={ROUTES.unauthorized} replace />
}
