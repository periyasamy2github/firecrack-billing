import { Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Panel } from '../../components/Panel'
import { StatusPill, BILL_STATUS_TONE } from '../../components/StatusPill'
import { Mono } from '../../components/Mono'
import { getBillTotals } from '../../utils/billing'
import { formatCurrency } from '../../utils/format'
import { ROUTES } from '../../utils/routes'
import type { Bill } from '../../types'
import styles from '../../css/pages/RecentBillsPanel.module.css'

interface RecentBillsPanelProps {
  bills: Bill[]
  showCounter: boolean
}

export const RecentBillsPanel = ({ bills, showCounter }: RecentBillsPanelProps) => {
  const navigate = useNavigate()
  return (
    <Panel title="Recent bills" action={<Typography className={styles.viewAll} onClick={() => navigate(ROUTES.bills)}>View all →</Typography>} flush>
      <Table size="small">
        <TableBody>
          {bills.map((b) => (
            <TableRow key={b.billNo} hover>
              <TableCell>
                <Mono sx={{ fontSize: 11.5, fontWeight: 600 }}>{b.billNo}</Mono>
                {showCounter && <Typography variant="caption" className={styles.counterCaption}>{b.counter}</Typography>}
              </TableCell>
              <TableCell align="right">
                <Mono sx={{ fontSize: 11.5 }}>{formatCurrency(getBillTotals(b).grandTotal)}</Mono>
              </TableCell>
              <TableCell align="right">
                <StatusPill tone={BILL_STATUS_TONE[b.status]} label={b.status === 'Paid' ? (b.paymentMethod ?? 'Paid') : b.status} dot={false} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  )
}
