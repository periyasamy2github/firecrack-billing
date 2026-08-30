import { useSession } from '../../hooks/useSession'
import { StaffDashboard } from './StaffDashboard'
import { SuperAdminDashboard } from './SuperAdminDashboard'
import { usePageTitle } from '../../hooks/usePageTitle'

export const Dashboard = () => {
  usePageTitle('Dashboard')
  const { isSuperAdmin } = useSession()
  return isSuperAdmin ? <SuperAdminDashboard /> : <StaffDashboard />
}

export default Dashboard
