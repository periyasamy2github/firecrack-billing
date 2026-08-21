import { Typography } from '@mui/material'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Panel } from '../../components/Panel'
import { Mono } from '../../components/Mono'
import { useTokens } from '../../theme/ThemeModeContext'
import { formatCurrency } from '../../utils/format'
import type { DashboardStats } from '../../types'
import styles from '../../css/pages/SuperAdminDashboard.module.css'

interface PaymentMixPanelProps {
  paymentMix: DashboardStats['paymentMix']
  billCount: number
}

export const PaymentMixPanel = ({ paymentMix, billCount }: PaymentMixPanelProps) => {
  const t = useTokens()
  const pieColors = [t.primary, t.paid, t.ember]
  const paymentTotal = paymentMix.reduce((sum, p) => sum + p.amount, 0)

  return (
    <Panel title="Payment mix" subtitle={formatCurrency(paymentTotal)}>
      <div className={styles.paymentPanelRow}>
        <div className={styles.pieWrap}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={paymentMix} dataKey="amount" nameKey="method" innerRadius={36} outerRadius={54} startAngle={90} endAngle={-270} stroke="none">
                {paymentMix.map((entry, i) => (
                  <Cell key={entry.method} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.pieCenter}>
            <Mono sx={{ fontSize: 16, fontWeight: 650 }}>{billCount}</Mono>
            <Typography className={styles.pieCenterLabel}>bills</Typography>
          </div>
        </div>
        <div className={styles.paymentList}>
          {paymentMix.map((payment, i) => (
            <div key={payment.method} className={styles.paymentRow}>
              <div className={styles.paymentDot} style={{ backgroundColor: pieColors[i % pieColors.length] }} />
              <Typography className={styles.paymentMethod}>{payment.method}</Typography>
              <div className={styles.paymentSpacer} />
              <Mono sx={{ fontSize: 11.5, fontWeight: 650 }}>{formatCurrency(payment.amount)}</Mono>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}
