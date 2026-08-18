import { Button } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { KpiCard } from '../../components/KpiCard'
import { useStoreScope } from '../../hooks/useStoreScope'
import { dashboardByBranch } from '../../data/mockDashboard'
import { formatCurrency, formatInt, formatLongDate } from '../../utils/format'
import { ROUTES } from '../../utils/routes'
import { RecentBillsPanel } from './RecentBillsPanel'
import styles from './StaffDashboard.module.css'

export const StaffDashboard = () => {
  const navigate = useNavigate()
  const { branches, currentBranchId, activeCounter, scopedBills } = useStoreScope()

  const data = dashboardByBranch[currentBranchId] ?? dashboardByBranch[branches[0].id]
  const recentBills = [...scopedBills].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 6)

  return (
    <>
      <PageHeader
        title="Dashboard"
        crumb={`${formatLongDate(new Date())}${activeCounter ? ` · ${activeCounter}` : ''}`}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate(ROUTES.newBill)}>
            New Bill
          </Button>
        }
      />
      <PageContent>
        <div className={styles.kpiGrid}>
          <KpiCard label="Sales today" value={formatCurrency(data.kpis.salesToday)} />
          <KpiCard label="Bills today" value={formatInt(data.kpis.billsToday)} />
          <KpiCard label="Average bill" value={formatCurrency(data.kpis.avgBill)} />
          <KpiCard label="GST collected" value={formatCurrency(data.kpis.gstCollected)} />
        </div>

        <RecentBillsPanel bills={recentBills} showCounter={false} />
      </PageContent>
    </>
  )
}
