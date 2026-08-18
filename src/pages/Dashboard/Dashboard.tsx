import { useStoreScope } from '../../hooks/useStoreScope'
import { StaffDashboard } from './StaffDashboard'
import { SuperAdminDashboard } from './SuperAdminDashboard'

export const Dashboard = () => {
  const { isSuperAdmin } = useStoreScope()
  return isSuperAdmin ? <SuperAdminDashboard /> : <StaffDashboard />
}

export default Dashboard
