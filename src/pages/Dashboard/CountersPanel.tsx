import { Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { Panel } from '../../components/Panel'
import { Mono } from '../../components/Mono'
import { formatCurrency } from '../../utils/format'
import type { DashboardStats } from '../../types'
import styles from '../../css/pages/SuperAdminDashboard.module.css'

interface CountersPanelProps {
  perCounter: NonNullable<DashboardStats['perCounter']>
  seasonSales: number
  counterScope: string
  viewingAll: boolean
  onSelect: (counterId: string) => void
}

export const CountersPanel = ({ perCounter, seasonSales, counterScope, viewingAll, onSelect }: CountersPanelProps) => (
  <Panel
    title="Branches"
    subtitle={viewingAll ? `${perCounter.length} branches · tap one to drill in` : 'tap a branch to switch · showing one branch'}
    action={
      <div className={styles.superAdminBadge}>
        <ShieldOutlinedIcon className={styles.superAdminBadgeIcon} />
        <Typography className={styles.superAdminBadgeLabel}>SUPER ADMIN VIEW</Typography>
      </div>
    }
    flush
  >
    <Table size="small">
      <TableBody>
        {perCounter.map((counter) => {
          const pct = seasonSales === 0 ? 0 : Math.round((counter.sales / seasonSales) * 100)
          const selected = counter.id === counterScope
          return (
            <TableRow
              key={counter.id}
              hover
              onClick={() => onSelect(counter.id)}
              className={selected ? `${styles.counterRow} ${styles.counterRowSelected}` : styles.counterRow}
            >
              <TableCell>
                <Typography className={styles.counterName}>{counter.name}</Typography>
              </TableCell>
              <TableCell align="right"><Mono sx={{ fontSize: 12.5, fontWeight: 650 }}>{formatCurrency(counter.sales)}</Mono></TableCell>
              <TableCell align="right"><Mono sx={{ fontSize: 12 }}>{counter.billCount} bills</Mono></TableCell>
              <TableCell className={styles.counterProgressCell}>
                <div className={styles.counterProgressTrack}>
                  <div className={styles.counterProgressFill} style={{ width: `${pct}%` }} />
                </div>
                <Typography variant="caption" className={styles.counterProgressCaption}>{pct}% of shop takings</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography className={styles.counterView}>{selected ? 'Viewing' : 'View →'}</Typography>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  </Panel>
)
