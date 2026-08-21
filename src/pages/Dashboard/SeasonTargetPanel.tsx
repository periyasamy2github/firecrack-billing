import { Typography } from '@mui/material'
import { Panel } from '../../components/Panel'
import { Mono } from '../../components/Mono'
import { formatCurrency } from '../../utils/format'
import styles from '../../css/pages/SuperAdminDashboard.module.css'

interface SeasonTargetPanelProps {
  seasonSales: number
  target: number
  shopName: string
}

export const SeasonTargetPanel = ({ seasonSales, target, shopName }: SeasonTargetPanelProps) => {
  const seasonPct = Math.round((seasonSales / target) * 100)

  return (
    <Panel title="Season target" subtitle={`${shopName} · goal ${formatCurrency(target)}`}>
      <div className={styles.seasonRow}>
        <div className={styles.seasonTrack}>
          <div className={styles.seasonFill} style={{ width: `${Math.min(seasonPct, 100)}%` }} />
        </div>
        <Mono sx={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>{seasonPct}%</Mono>
        <Typography className={styles.seasonMeta}>
          {formatCurrency(seasonSales)} of {formatCurrency(target)}
        </Typography>
      </div>
    </Panel>
  )
}
