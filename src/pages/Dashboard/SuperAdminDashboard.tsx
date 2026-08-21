import { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { PageSkeleton } from '../../components/PageSkeleton'
import { PageMessage } from '../../components/PageMessage'
import { errorMessage } from '../../utils/errorMessage'
import { useSession } from '../../hooks/useSession'
import { api } from '../../services/api'
import type { DashboardStats } from '../../types'
import { formatLongDate } from '../../utils/format'
import { ROUTES } from '../../utils/routes'
import styles from '../../css/pages/SuperAdminDashboard.module.css'

import { DashboardKpis } from './DashboardKpis'
import { SeasonTargetPanel } from './SeasonTargetPanel'
import { CountersPanel } from './CountersPanel'
import { DailySalesChart } from './DailySalesChart'
import { PaymentMixPanel } from './PaymentMixPanel'
import { TopItemsPanel } from './TopItemsPanel'
import { RecentBillsPanel } from './RecentBillsPanel'

export const SuperAdminDashboard = () => {
  const navigate = useNavigate()
  const { shop, counters, counterScope, setCounterScope } = useSession()
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

  const viewingAll = counterScope === 'all'
  const seasonSales = stats.seasonSales ?? 0

  return (
    <>
      <PageHeader
        title="Dashboard"
        crumb={viewingAll ? `${formatLongDate(new Date())} · all ${counters.length} counters` : `${formatLongDate(new Date())} · ${counters.find((b) => b.id === counterScope)?.name}`}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate(ROUTES.newBill)}>
            New Bill
          </Button>
        }
      />
      <PageContent>
        <DashboardKpis stats={stats} viewingAll={viewingAll} />

        {viewingAll && <SeasonTargetPanel seasonSales={seasonSales} target={shop.seasonTarget} shopName={shop.name} />}

        <CountersPanel
          perCounter={stats.perCounter ?? []}
          seasonSales={seasonSales}
          counterScope={counterScope}
          viewingAll={viewingAll}
          onSelect={setCounterScope}
        />

        <div className={styles.chartsGrid}>
          <DailySalesChart trend={stats.trend} />
          <PaymentMixPanel paymentMix={stats.paymentMix} billCount={stats.billCount} />
        </div>

        <div className={styles.bottomGrid}>
          <TopItemsPanel items={stats.topItems} />
          <RecentBillsPanel bills={stats.recentBills} showCounter={viewingAll} />
        </div>
      </PageContent>
    </>
  )
}
