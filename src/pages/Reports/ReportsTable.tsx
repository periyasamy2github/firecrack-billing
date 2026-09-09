import type { ReactNode } from 'react'
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Tooltip, Typography } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Mono } from '../../components/Mono'
import { StatusPill, BILL_STATUS_TONE } from '../../components/StatusPill'
import { TableCard, TableEmptyRow, TableLoadingRow } from '../../components/TableCard'
import { getBillTotals } from '../../utils/billing'
import { formatAmount, formatCurrency } from '../../utils/format'
import { useBillSort } from '../../hooks/useBillSort'
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
  const colSpan = showCounterColumn ? 9 : 8
  const { sortedBills, sortKey, sortDir, toggleSort } = useBillSort(bills)

  return (
    <TableCard footer={footer}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><TableSortLabel active={sortKey === 'billNo'} direction={sortKey === 'billNo' ? sortDir : 'asc'} onClick={() => toggleSort('billNo')}>Bill no.</TableSortLabel></TableCell>
            {showCounterColumn && <TableCell><TableSortLabel active={sortKey === 'counter'} direction={sortKey === 'counter' ? sortDir : 'asc'} onClick={() => toggleSort('counter')}>Branch</TableSortLabel></TableCell>}
            <TableCell><TableSortLabel active={sortKey === 'date'} direction={sortKey === 'date' ? sortDir : 'asc'} onClick={() => toggleSort('date')}>Date</TableSortLabel></TableCell>
            <TableCell><TableSortLabel active={sortKey === 'customer'} direction={sortKey === 'customer' ? sortDir : 'asc'} onClick={() => toggleSort('customer')}>Customer</TableSortLabel></TableCell>
            <TableCell><TableSortLabel active={sortKey === 'billedBy'} direction={sortKey === 'billedBy' ? sortDir : 'asc'} onClick={() => toggleSort('billedBy')}>Created by</TableSortLabel></TableCell>
            <TableCell align="right"><TableSortLabel active={sortKey === 'total'} direction={sortKey === 'total' ? sortDir : 'asc'} onClick={() => toggleSort('total')}>Total</TableSortLabel></TableCell>
            <TableCell><TableSortLabel active={sortKey === 'payment'} direction={sortKey === 'payment' ? sortDir : 'asc'} onClick={() => toggleSort('payment')}>Payment</TableSortLabel></TableCell>
            <TableCell><TableSortLabel active={sortKey === 'status'} direction={sortKey === 'status' ? sortDir : 'asc'} onClick={() => toggleSort('status')}>Status</TableSortLabel></TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading && sortedBills.map((bill) => (
            <TableRow key={bill.counterId + bill.billNo} hover>
              <TableCell><Mono sx={{ fontWeight: 600 }}>{bill.billNo}</Mono></TableCell>
              {showCounterColumn && <TableCell className={styles.counterCell}>{bill.counter}</TableCell>}
              <TableCell><Mono sx={{ color: 'text.secondary' }}>{bill.date}</Mono></TableCell>
              <TableCell>
                <Typography className={styles.customerName}>{bill.customerName || 'Walk-in'}</Typography>
                {bill.customerMobile && <Mono sx={{ fontSize: 10.5, color: 'text.secondary' }}>{bill.customerMobile}</Mono>}
              </TableCell>
              <TableCell><Typography className={styles.counterCell}>{bill.billedBy}</Typography></TableCell>
              <TableCell align="right">
                <Mono sx={{ fontWeight: 600, textDecoration: bill.status === 'Cancelled' ? 'line-through' : 'none', color: bill.status === 'Cancelled' ? 'text.secondary' : 'text.primary' }}>
                  {formatCurrency(getBillTotals(bill).grandTotal)}
                </Mono>
              </TableCell>
              <TableCell>
                {bill.payments.length > 1 ? (
                  <>
                    <StatusPill tone="paid" dot={false} label="Mixed" />
                    <Mono sx={{ display: 'block', fontSize: 10, color: 'text.secondary' }}>
                      {bill.payments.map((payment) => `${payment.type} ₹${formatAmount(payment.amount)}`).join(' · ')}
                    </Mono>
                  </>
                ) : bill.paymentMethod ? <StatusPill tone="paid" dot={false} label={bill.paymentMethod} /> : <StatusPill tone="mut" dot={false} label="—" />}
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
