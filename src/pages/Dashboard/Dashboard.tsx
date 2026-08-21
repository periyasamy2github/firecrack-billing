import { useSession } from '../../hooks/useSession'
import { StaffDashboard } from './StaffDashboard'
import { SuperAdminDashboard } from './SuperAdminDashboard'

export const Dashboard = () => {
  const { isSuperAdmin } = useSession()
  return isSuperAdmin ? <SuperAdminDashboard /> : <StaffDashboard />
}

export default Dashboard
