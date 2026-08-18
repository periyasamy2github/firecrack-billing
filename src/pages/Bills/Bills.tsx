import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { Mono } from '../../components/Mono'
import { StatusPill, BILL_STATUS_TONE } from '../../components/StatusPill'
import { SearchField } from '../../components/SearchField'
import { TableCard, TableEmptyRow } from '../../components/TableCard'
import { TablePaginationBar } from '../../components/TablePaginationBar'
import { Toast } from '../../components/Toast'
import { getBillTotals } from '../../utils/billing'
import { formatCurrency } from '../../utils/format'
import { BILL_FILTERS, matchesFilter, matchesSearch, type BillFilter } from '../../utils/billFilters'
import { ROUTES, billPrintPath } from '../../utils/routes'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useKeyShortcuts } from '../../hooks/useKeyShortcuts'
import { usePagination } from '../../hooks/usePagination'
import type { Bill } from '../../types'
import styles from './Bills.module.css'

export const Bills = () => {
  const navigate = useNavigate()
  const { currentBranchId, scopedBills, cancelBill } = useStoreScope()
  const viewingAll = currentBranchId === 'all'
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<BillFilter>('All')
  const [cancellingBill, setCancellingBill] = useState<Bill | null>(null)
  const [snackbar, setSnackbar] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const confirmCancel = () => {
    if (!cancellingBill) return
    const billNo = cancellingBill.billNo
    // Cancelling also puts the stock back — that lives in the store, not here.
    cancelBill(billNo)
    setSnackbar(`Bill ${billNo} cancelled`)
    setCancellingBill(null)
  }

  useKeyShortcuts({
    '/': () => searchInputRef.current?.focus(),
    ...Object.fromEntries(BILL_FILTERS.map((key, i) => [String(i + 1), () => setFilter(key)])),
  })

  const filterCounts = useMemo(() => {
    const counts: Record<BillFilter, number> = { All: scopedBills.length, Cash: 0, UPI: 0, Card: 0, Cancelled: 0 }
    scopedBills.forEach((b) => {
      if (b.status === 'Cancelled') counts.Cancelled += 1
      else if (b.paymentMethod && b.paymentMethod in counts) counts[b.paymentMethod as BillFilter] += 1
    })
    return counts
  }, [scopedBills])

  const filtered = useMemo(
    () => scopedBills.filter((b) => matchesFilter(b, filter) && matchesSearch(b, search)),
    [scopedBills, search, filter],
  )

  const { page, rowsPerPage, pageRows, changePage, changeRowsPerPage } = usePagination(filtered)

  const paidTotals = filtered.filter((b) => b.status === 'Paid').reduce(
    (acc, b) => {
      const t = getBillTotals(b)
      acc.discount += t.discount
      acc.gst += t.cgst + t.sgst
      acc.grand += t.grandTotal
      return acc
    },
    { discount: 0, gst: 0, grand: 0 },
  )

  const tableFooter = (
    <>
      <div className={styles.footerBar}>
        <Typography variant="caption">{filtered.length} bills shown · {filterCounts.Cancelled} cancelled</Typography>
        <div className={styles.footerSpacer} />
        <Typography variant="caption">Discount <Mono sx={{ fontWeight: 650, color: 'text.primary' }}>{formatCurrency(paidTotals.discount)}</Mono></Typography>
        <Typography variant="caption">GST <Mono sx={{ fontWeight: 650, color: 'text.primary' }}>{formatCurrency(paidTotals.gst)}</Mono></Typography>
        <Typography variant="caption">Total <Mono sx={{ fontWeight: 700, color: 'text.primary', fontSize: 13 }}>{formatCurrency(paidTotals.grand)}</Mono></Typography>
      </div>
      <TablePaginationBar count={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={changePage} onRowsPerPageChange={changeRowsPerPage} />
    </>
  )

  return (
    <>
      <PageHeader
        title="Bills"
        crumb={viewingAll ? `${scopedBills.length} bills · all counters` : `${scopedBills.length} bills`}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate(ROUTES.newBill)}>New Bill</Button>
        }
      />
      <PageContent>
        <Card className={styles.filterCard}>
          <div className={styles.filterRow}>
            <SearchField placeholder="Bill number or customer mobile… (/)" value={search} onChange={setSearch} inputRef={searchInputRef} sx={{ flex: 1, minWidth: 260 }} />
            {BILL_FILTERS.map((key) => (
              <Chip
                key={key}
                label={`${key} ${filterCounts[key]}`}
                size="small"
                onClick={() => setFilter(key)}
                color={filter === key ? 'primary' : undefined}
                variant={filter === key ? 'filled' : 'outlined'}
              />
            ))}
          </div>
        </Card>

        <TableCard footer={tableFooter}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Bill no.</TableCell>
                  {viewingAll && <TableCell>Counter</TableCell>}
                  <TableCell>Time</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Discount</TableCell>
                  <TableCell align="right">GST</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((bill) => {
                  const totals = getBillTotals(bill)
                  const isFinalised = bill.status === 'Paid'
                  return (
                    <TableRow key={bill.billNo} hover>
                      <TableCell><Mono sx={{ fontWeight: 600 }}>{bill.billNo}</Mono></TableCell>
                      {viewingAll && <TableCell><Typography className={styles.counterCell}>{bill.counter}</Typography></TableCell>}
                      <TableCell><Mono sx={{ color: 'text.secondary' }}>{bill.time}</Mono></TableCell>
                      <TableCell>
                        <Typography className={styles.customerName}>{bill.customerName || 'Walk-in'}</Typography>
                        {bill.customerMobile && <Mono sx={{ fontSize: 10.5, color: 'text.secondary' }}>{bill.customerMobile}</Mono>}
                      </TableCell>
                      <TableCell align="right"><Mono>{totals.itemCount}</Mono></TableCell>
                      <TableCell align="right"><Mono>{totals.qtyCount}</Mono></TableCell>
                      <TableCell align="right">
                        {isFinalised ? <Mono sx={{ color: 'warning.dark' }}>{formatCurrency(totals.discount)}</Mono> : <Typography className={styles.mutedCell}>—</Typography>}
                      </TableCell>
                      <TableCell align="right">
                        {isFinalised && bill.gstApplicable ? <Mono>{formatCurrency(totals.cgst + totals.sgst)}</Mono> : <Typography className={styles.mutedCell}>—</Typography>}
                      </TableCell>
                      <TableCell align="right">
                        <Mono sx={{ fontWeight: 600, textDecoration: bill.status === 'Cancelled' ? 'line-through' : 'none', color: bill.status === 'Cancelled' ? 'text.secondary' : 'text.primary' }}>
                          {formatCurrency(totals.grandTotal)}
                        </Mono>
                      </TableCell>
                      <TableCell>
                        {bill.paymentMethod ? <StatusPill tone="paid" dot={false} label={bill.paymentMethod} /> : <StatusPill tone="mut" dot={false} label="—" />}
                      </TableCell>
                      <TableCell>
                        <div className={styles.statusRow}>
                          <StatusPill tone={BILL_STATUS_TONE[bill.status]} label={bill.status === 'Paid' && bill.reprintCount > 0 ? `Reprinted ×${bill.reprintCount}` : bill.status} />
                          {bill.status === 'Paid' && !bill.gstApplicable && <StatusPill tone="mut" dot={false} label="No GST" />}
                        </div>
                      </TableCell>
                      <TableCell align="right">
                        <div className={styles.actionsRow}>
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => navigate(billPrintPath(bill.billNo))}>
                              <VisibilityOutlinedIcon className={styles.actionIcon} />
                            </IconButton>
                          </Tooltip>
                          {bill.status === 'Paid' && (
                            <Tooltip title="Reprint">
                              <IconButton size="small" onClick={() => navigate(billPrintPath(bill.billNo))}>
                                <PrintOutlinedIcon className={styles.actionIcon} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {bill.status === 'Paid' && (
                            <Tooltip title="Cancel bill">
                              <IconButton size="small" onClick={() => setCancellingBill(bill)}>
                                <CancelOutlinedIcon className={styles.actionIcon} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && <TableEmptyRow colSpan={viewingAll ? 12 : 11} message="No bills match this search." />}
              </TableBody>
            </Table>
        </TableCard>
      </PageContent>

      <Dialog open={Boolean(cancellingBill)} onClose={() => setCancellingBill(null)} fullWidth maxWidth="xs">
        <DialogTitle>Cancel bill?</DialogTitle>
        {cancellingBill && (
          <DialogContent>
            <Typography color="text.secondary">
              Cancel bill <b>{cancellingBill.billNo}</b> for {formatCurrency(getBillTotals(cancellingBill).grandTotal)}? This can't be undone.
            </Typography>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setCancellingBill(null)}>Keep bill</Button>
          <Button variant="contained" color="error" onClick={confirmCancel}>Cancel bill</Button>
        </DialogActions>
      </Dialog>
      <Toast open={Boolean(snackbar)} severity="info" message={snackbar} onClose={() => setSnackbar('')} />
    </>
  )
}

export default Bills
