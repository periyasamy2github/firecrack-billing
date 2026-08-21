import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import { KpiCard } from '../../components/KpiCard'
import { formatCurrency, formatInt } from '../../utils/format'
import type { DashboardStats } from '../../types'
import styles from '../../css/pages/SuperAdminDashboard.module.css'

interface DashboardKpisProps {
  stats: DashboardStats
  viewingAll: boolean
}

export const DashboardKpis = ({ stats, viewingAll }: DashboardKpisProps) => (
  <div className={styles.kpiGrid}>
    <KpiCard label={viewingAll ? 'Total sales' : 'Sales'} value={formatCurrency(stats.sales)} icon={PaymentsOutlinedIcon} />
    <KpiCard label="Bills" value={formatInt(stats.billCount)} icon={ReceiptLongOutlinedIcon} tone="info" />
    <KpiCard label="Average bill" value={formatCurrency(stats.avgBill)} icon={ShoppingBagOutlinedIcon} tone="ember" />
    <KpiCard label="GST collected" value={formatCurrency(stats.gstCollected)} icon={AccountBalanceOutlinedIcon} tone="paid" />
  </div>
)
