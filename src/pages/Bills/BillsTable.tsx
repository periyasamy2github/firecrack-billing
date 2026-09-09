import type { ReactNode } from 'react'
import { CircularProgress, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Tooltip, Typography } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { Mono } from '../../components/Mono'
import { StatusPill, BILL_STATUS_TONE } from '../../components/StatusPill'
import { TableCard, TableEmptyRow, TableLoadingRow } from '../../components/TableCard'
import { getBillTotals } from '../../utils/billing'
import { formatAmount, formatCurrency } from '../../utils/format'
import { useBillSort } from '../../hooks/useBillSort'
import type { Bill } from '../../types'
import styles from '../../css/pages/Bills.module.css'

interface BillsTableProps {
  bills: Bill[]
  loading: boolean
  error?: string
  viewingAll: boolean
  isPending: (billNo: string) => boolean
  onView: (bill: Bill) => void
  onEdit: (bill: Bill) => void
  onReprint: (bill: Bill) => void
  onCancel: (bill: Bill) => void
  footer: ReactNode
}

export const BillsTable = ({ bills, loading, error, viewingAll, isPending, onView, onEdit, onReprint, onCancel, footer }: BillsTableProps) => {
  const colSpan = viewingAll ? 11 : 10
  const { sortedBills, sortKey, sortDir, toggleSort } = useBillSort(bills)

  return (
    <TableCard footer={footer}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><TableSortLabel active={sortKey === 'billNo'} direction={sortKey === 'billNo' ? sortDir : 'asc'} onClick={() => toggleSort('billNo')}>Bill no.</TableSortLabel></TableCell>
            {viewingAll && <TableCell><TableSortLabel active={sortKey === 'counter'} direction={sortKey === 'counter' ? sortDir : 'asc'} onClick={() => toggleSort('counter')}>Branch</TableSortLabel></TableCell>}
            <TableCell><TableSortLabel active={sortKey === 'customer'} direction={sortKey === 'customer' ? sortDir : 'asc'} onClick={() => toggleSort('customer')}>Customer</TableSortLabel></TableCell>
            <TableCell align="right"><TableSortLabel active={sortKey === 'items'} direction={sortKey === 'items' ? sortDir : 'asc'} onClick={() => toggleSort('items')}>Items</TableSortLabel></TableCell>
            <TableCell align="right"><TableSortLabel active={sortKey === 'qty'} direction={sortKey === 'qty' ? sortDir : 'asc'} onClick={() => toggleSort('qty')}>Qty</TableSortLabel></TableCell>
            <TableCell align="right"><TableSortLabel active={sortKey === 'total'} direction={sortKey === 'total' ? sortDir : 'asc'} onClick={() => toggleSort('total')}>Total</TableSortLabel></TableCell>
            <TableCell><TableSortLabel active={sortKey === 'payment'} direction={sortKey === 'payment' ? sortDir : 'asc'} onClick={() => toggleSort('payment')}>Payment</TableSortLabel></TableCell>
            <TableCell><TableSortLabel active={sortKey === 'status'} direction={sortKey === 'status' ? sortDir : 'asc'} onClick={() => toggleSort('status')}>Status</TableSortLabel></TableCell>
            <TableCell><TableSortLabel active={sortKey === 'date'} direction={sortKey === 'date' ? sortDir : 'asc'} onClick={() => toggleSort('date')}>Created</TableSortLabel></TableCell>
            <TableCell><TableSortLabel active={sortKey === 'billedBy'} direction={sortKey === 'billedBy' ? sortDir : 'asc'} onClick={() => toggleSort('billedBy')}>Created by</TableSortLabel></TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading && sortedBills.map((bill) => {
            const totals = getBillTotals(bill)
            return (
              <TableRow key={bill.billNo} hover>
                <TableCell>
                  <div className={styles.billNoCell}>
                    <Mono sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{bill.billNo}</Mono>
                    <div className={styles.billTags}>
                    {bill.gstApplicable && (
                      <Tooltip title={`GST ${formatCurrency(totals.cgst + totals.sgst)}`}>
                        <span><StatusPill tone="info" dot={false} label="GST" /></span>
                      </Tooltip>
                    )}
                    {totals.billDiscountAmount > 0 && (
                      <Tooltip title={`Bill discount ${formatCurrency(totals.billDiscountAmount)}`}>
                        <span><StatusPill tone="hold" dot={false} label="Disc" /></span>
                      </Tooltip>
                    )}
                    {bill.editedAt && (
                      <Tooltip title={`Edited ${bill.editedAt}${bill.editedBy ? ` by ${bill.editedBy}` : ''}`}>
                        <span><StatusPill tone="mut" dot={false} label="Edited" /></span>
                      </Tooltip>
                    )}
                    </div>
                  </div>
                </TableCell>
                {viewingAll && <TableCell><Typography className={styles.counterCell}>{bill.counter}</Typography></TableCell>}
                <TableCell>
                  <Typography className={styles.customerName}>{bill.customerName || 'Walk-in'}</Typography>
                  {bill.customerMobile && <Mono sx={{ fontSize: 10.5, color: 'text.secondary' }}>{bill.customerMobile}</Mono>}
                </TableCell>
                <TableCell align="right"><Mono>{totals.itemCount}</Mono></TableCell>
                <TableCell align="right"><Mono>{totals.qtyCount}</Mono></TableCell>
                <TableCell align="right">
                  <Mono sx={{ fontWeight: 600, textDecoration: bill.status === 'Cancelled' ? 'line-through' : 'none', color: bill.status === 'Cancelled' ? 'text.secondary' : 'text.primary' }}>
                    {formatCurrency(totals.grandTotal)}
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
                <TableCell>
                  <div className={styles.statusRow}>
                    <StatusPill tone={BILL_STATUS_TONE[bill.status]} label={bill.status} />
                  </div>
                </TableCell>
                <TableCell>
                  <Mono sx={{ fontSize: 11.5 }}>{bill.date}</Mono>
                  <Mono sx={{ display: 'block', fontSize: 10.5, color: 'text.secondary' }}>{bill.time}</Mono>
                </TableCell>
                <TableCell><Typography className={styles.counterCell}>{bill.billedBy}</Typography></TableCell>
                <TableCell align="right">
                  <div className={styles.actionsRow}>
                    {isPending(bill.billNo) ? (
                      <CircularProgress size={16} />
                    ) : (
                      <>
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => onView(bill)}>
                            <VisibilityOutlinedIcon className={styles.actionIcon} />
                          </IconButton>
                        </Tooltip>
                        {bill.status === 'Paid' && (
                          <>
                            <Tooltip title="Edit bill">
                              <IconButton size="small" onClick={() => onEdit(bill)}>
                                <EditOutlinedIcon className={styles.actionIcon} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reprint">
                              <IconButton size="small" onClick={() => onReprint(bill)}>
                                <PrintOutlinedIcon className={styles.actionIcon} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel bill">
                              <IconButton size="small" onClick={() => onCancel(bill)}>
                                <CancelOutlinedIcon className={styles.actionIcon} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {loading && <TableLoadingRow colSpan={colSpan} />}
          {!loading && bills.length === 0 && <TableEmptyRow colSpan={colSpan} message={error || 'No bills match this search.'} />}
        </TableBody>
      </Table>
    </TableCard>
  )
}
