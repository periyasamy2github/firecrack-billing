import { Typography } from '@mui/material'
import { Panel } from '../../components/Panel'
import { Mono } from '../../components/Mono'
import { formatCurrency } from '../../utils/format'
import type { DashboardStats } from '../../types'
import styles from '../../css/pages/SuperAdminDashboard.module.css'

interface TopItemsPanelProps {
  items: DashboardStats['topItems']
}

export const TopItemsPanel = ({ items }: TopItemsPanelProps) => {
  const maxAmount = Math.max(1, ...items.map((item) => item.amount))

  return (
    <Panel title="Top items" subtitle="by value">
      <div className={styles.itemsList}>
        {items.map((item) => (
          <div key={item.name} className={styles.itemRow}>
            <div>
              <Typography className={styles.itemName}>{item.name}</Typography>
              <div className={styles.itemTrack}>
                <div className={styles.itemFill} style={{ width: `${(item.amount / maxAmount) * 100}%` }} />
              </div>
            </div>
            <Mono sx={{ fontSize: 11.5, textAlign: 'right', color: 'text.secondary' }}>{formatCurrency(item.amount)}</Mono>
          </div>
        ))}
      </div>
    </Panel>
  )
}
