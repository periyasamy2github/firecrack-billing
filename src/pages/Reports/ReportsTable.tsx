import type { ReactNode } from 'react'
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Mono } from '../../components/Mono'
import { StatusPill, BILL_STATUS_TONE } from '../../components/StatusPill'
import { TableCard, TableEmptyRow, TableLoadingRow } from '../../components/TableCard'
import { getBillTotals } from '../../utils/billing'
import { formatCurrency } from '../../utils/format'
import type { Bill } from '../../types'
import styles from '../../css/pages/Reports.module.css'

interface ReportsTableProps {
  bills: Bill[]
  loading: boolean
  error?: string
  showCounterColumn: boolean
  onView: (bill: Bill) => void
  footer: ReactNode
}

export const ReportsTable = ({ bills, loading, error, showCounterColumn, onView, footer }: ReportsTableProps) => {
  const colSpan = showCounterColumn ? 8 : 7

  return (
    <TableCard footer={footer}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Bill no.</TableCell>
            {showCounterColumn && <TableCell>Counter</TableCell>}
            <TableCell>Date</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading && bills.map((bill) => (
            <TableRow key={bill.counterId + bill.billNo} hover>
              <TableCell><Mono sx={{ fontWeight: 600 }}>{bill.billNo}</Mono></TableCell>
              {showCounterColumn && <TableCell className={styles.counterCell}>{bill.counter}</TableCell>}
              <TableCell><Mono sx={{ color: 'text.secondary' }}>{bill.date}</Mono></TableCell>
              <TableCell>
                <Typography className={styles.customerName}>{bill.customerName || 'Walk-in'}</Typography>
                {bill.customerMobile && <Mono sx={{ fontSize: 10.5, color: 'text.secondary' }}>{bill.customerMobile}</Mono>}
              </TableCell>
              <TableCell align="right">
                <Mono sx={{ fontWeight: 600, textDecoration: bill.status === 'Cancelled' ? 'line-through' : 'none', color: bill.status === 'Cancelled' ? 'text.secondary' : 'text.primary' }}>
                  {formatCurrency(getBillTotals(bill).grandTotal)}
                </Mono>
              </TableCell>
              <TableCell>
                {bill.paymentMethod ? <StatusPill tone="paid" dot={false} label={bill.paymentMethod} /> : <StatusPill tone="mut" dot={false} label="—" />}
              </TableCell>
              <TableCell><StatusPill tone={BILL_STATUS_TONE[bill.status]} label={bill.status} /></TableCell>
              <TableCell align="right">
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => onView(bill)}>
                    <VisibilityOutlinedIcon className={styles.actionIcon} />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {loading && <TableLoadingRow colSpan={colSpan} />}
          {!loading && bills.length === 0 && <TableEmptyRow colSpan={colSpan} message={error || 'No bills match this search.'} />}
        </TableBody>
      </Table>
    </TableCard>
  )
}
