import { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { KpiCard } from '../../components/KpiCard'
import { PageSkeleton } from '../../components/PageSkeleton'
import { PageMessage } from '../../components/PageMessage'
import { errorMessage } from '../../utils/errorMessage'
import { useSession } from '../../hooks/useSession'
import { api } from '../../services/api'
import type { DashboardStats } from '../../types'
import { formatCurrency, formatInt, formatLongDate } from '../../utils/format'
import { ROUTES } from '../../utils/routes'
import { RecentBillsPanel } from './RecentBillsPanel'
import styles from '../../css/pages/StaffDashboard.module.css'

export const StaffDashboard = () => {
  const navigate = useNavigate()
  const { currentUser, counterScope } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    setLoadError('')
    api.loadDashboard(counterScope)
      .then(setStats)
      // Otherwise the skeleton spins forever.
      .catch((err) => setLoadError(errorMessage(err, 'Could not load your dashboard')))
  }, [counterScope])

  if (loadError) return <PageMessage message={loadError} />
  if (!stats) return <PageSkeleton />

  return (
    <>
      <PageHeader
        title="Dashboard"
        crumb={`${formatLongDate(new Date())}${currentUser?.counter ? ` · ${currentUser.counter}` : ''}`}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate(ROUTES.newBill)}>
            New Bill
          </Button>
        }
      />
      <PageContent>
        <div className={styles.kpiGrid}>
          <KpiCard label="Sales" value={formatCurrency(stats.sales)} icon={PaymentsOutlinedIcon} />
          <KpiCard label="Bills" value={formatInt(stats.billCount)} icon={ReceiptLongOutlinedIcon} tone="info" />
          <KpiCard label="Average bill" value={formatCurrency(stats.avgBill)} icon={ShoppingBagOutlinedIcon} tone="ember" />
          <KpiCard label="GST collected" value={formatCurrency(stats.gstCollected)} icon={AccountBalanceOutlinedIcon} tone="paid" />
        </div>

        <RecentBillsPanel bills={stats.recentBills} showCounter={false} />
      </PageContent>
    </>
  )
}
