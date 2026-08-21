import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from '../redux/store'
import { loadSession } from '../redux/sessionSlice'
import { getToken, setToken } from '../services/api'
import { useSession } from '../hooks/useSession'
import { PageLoader } from './RouteProgress'
import { ROUTES } from '../utils/routes'

export const RequireAuth = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const status = useSelector((state) => state.session.status)
  const { currentUser } = useSession()
  const token = getToken()

  // On a fresh load / refresh with a live token, hydrate the store before rendering.
  useEffect(() => {
    if (token && status === 'idle') void dispatch(loadSession())
  }, [token, status, dispatch])

  if (!token) return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  if (status === 'error') {
    setToken(null)
    return <Navigate to={ROUTES.login} replace />
  }
  if (status !== 'ready') return <PageLoader />
  if (!currentUser) return <Navigate to={ROUTES.login} replace />
  return <Outlet />
}

export const RequireSuperAdmin = () => {
  const { isSuperAdmin } = useSession()
  return isSuperAdmin ? <Outlet /> : <Navigate to={ROUTES.unauthorized} replace />
}
