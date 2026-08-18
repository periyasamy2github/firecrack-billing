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
import { useStoreScope } from '../../hooks/useStoreScope'
import { formatCurrency, formatInt, formatLongDate } from '../../utils/format'
import { dashboardKpis, recentBills as latestBills } from '../../utils/dashboard'
import { ROUTES } from '../../utils/routes'
import { RecentBillsPanel } from './RecentBillsPanel'
import styles from './StaffDashboard.module.css'

export const StaffDashboard = () => {
  const navigate = useNavigate()
  const { activeCounter, scopedBills } = useStoreScope()

  const kpis = dashboardKpis(scopedBills)
  const recentBills = latestBills(scopedBills, 6)

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
          <KpiCard label="Sales" value={formatCurrency(kpis.sales)} icon={PaymentsOutlinedIcon} />
          <KpiCard label="Bills" value={formatInt(kpis.billCount)} icon={ReceiptLongOutlinedIcon} tone="info" />
          <KpiCard label="Average bill" value={formatCurrency(kpis.avgBill)} icon={ShoppingBagOutlinedIcon} tone="ember" />
          <KpiCard label="GST collected" value={formatCurrency(kpis.gstCollected)} icon={AccountBalanceOutlinedIcon} tone="paid" />
        </div>

        <RecentBillsPanel bills={recentBills} showCounter={false} />
      </PageContent>
    </>
  )
}
