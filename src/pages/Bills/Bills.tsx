import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Chip, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
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
import { ListFooter } from '../../components/ListFooter'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { getBillTotals } from '../../utils/billing'
import { formatCurrency } from '../../utils/format'
import { BILL_FILTERS, matchesFilter, matchesSearch, type BillFilter } from '../../utils/billFilters'
import { ROUTES, billPrintPath } from '../../utils/routes'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useListPage } from '../../hooks/useListPage'
import { useToast } from '../../hooks/useToast'
import type { Bill } from '../../types'
import styles from './Bills.module.css'

export const Bills = () => {
  const navigate = useNavigate()
  const { currentBranchId, scopedBills, cancelBill, billReprinted } = useStoreScope()
  const viewingAll = currentBranchId === 'all'
  const [cancellingBill, setCancellingBill] = useState<Bill | null>(null)
  const showToast = useToast()

  const { query, setQuery, searchInputRef, filter, setFilter, counts, filtered, page, rowsPerPage, pageRows, changePage, changeRowsPerPage } =
    useListPage<Bill, BillFilter>({
      rows: scopedBills,
      matchesSearch,
      filters: BILL_FILTERS,
      matchesFilter,
    })

  const confirmCancel = async () => {
    if (!cancellingBill) return
    const billNo = cancellingBill.billNo
    setCancellingBill(null)
    await cancelBill(billNo)
    showToast(`Bill ${billNo} cancelled`, 'warning')
  }

  const paidTotals = filtered.filter((b) => b.status === 'Paid').reduce(
    (acc, b) => {
      const t = getBillTotals(b)
      acc.discount += t.billDiscountAmount
      acc.gst += t.cgst + t.sgst
      acc.grand += t.grandTotal
      return acc
    },
    { discount: 0, gst: 0, grand: 0 },
  )

  const tableFooter = (
    <ListFooter
      count={filtered.length}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={changePage}
      onRowsPerPageChange={changeRowsPerPage}
      summary={
        <>
          <Typography variant="caption">{filtered.length} bills shown · {counts.Cancelled} cancelled</Typography>
          <div className={styles.footerSpacer} />
          <Typography variant="caption">Discount <Mono sx={{ fontWeight: 650, color: 'text.primary' }}>{formatCurrency(paidTotals.discount)}</Mono></Typography>
          <Typography variant="caption">GST <Mono sx={{ fontWeight: 650, color: 'text.primary' }}>{formatCurrency(paidTotals.gst)}</Mono></Typography>
          <Typography variant="caption">Total <Mono sx={{ fontWeight: 700, color: 'text.primary', fontSize: 13 }}>{formatCurrency(paidTotals.grand)}</Mono></Typography>
        </>
      }
    />
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
            <SearchField placeholder="Bill number or customer mobile… (/)" value={query} onChange={setQuery} inputRef={searchInputRef} sx={{ flex: 1, minWidth: 260 }} />
            {BILL_FILTERS.map((key) => (
              <Chip
                key={key}
                label={`${key} ${counts[key]}`}
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
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Created by</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((bill) => {
                  const totals = getBillTotals(bill)
                  return (
                    <TableRow key={bill.billNo} hover>
                      <TableCell>
                        <div className={styles.billNoCell}>
                          <Mono sx={{ fontWeight: 600 }}>{bill.billNo}</Mono>
                          {bill.gstApplicable && (
                            <Tooltip title={`GST ${formatCurrency(totals.cgst + totals.sgst)}`}>
                              <span><StatusPill tone="paid" dot={false} label="GST" /></span>
                            </Tooltip>
                          )}
                          {totals.billDiscountAmount > 0 && (
                            <Tooltip title={`Bill discount ${formatCurrency(totals.billDiscountAmount)}`}>
                              <span><StatusPill tone="hold" dot={false} label="Disc" /></span>
                            </Tooltip>
                          )}
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
                        {bill.paymentMethod ? <StatusPill tone="paid" dot={false} label={bill.paymentMethod} /> : <StatusPill tone="mut" dot={false} label="—" />}
                      </TableCell>
                      <TableCell>
                        <div className={styles.statusRow}>
                          <StatusPill tone={BILL_STATUS_TONE[bill.status]} label={bill.status === 'Paid' && bill.reprintCount > 0 ? `Reprinted ×${bill.reprintCount}` : bill.status} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Mono sx={{ fontSize: 11.5 }}>{bill.date}</Mono>
                        <Mono sx={{ display: 'block', fontSize: 10.5, color: 'text.secondary' }}>{bill.time}</Mono>
                      </TableCell>
                      <TableCell><Typography className={styles.counterCell}>{bill.billedBy}</Typography></TableCell>
                      <TableCell align="right">
                        <div className={styles.actionsRow}>
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => navigate(billPrintPath(bill.billNo))}>
                              <VisibilityOutlinedIcon className={styles.actionIcon} />
                            </IconButton>
                          </Tooltip>
                          {bill.status === 'Paid' && (
                            <Tooltip title="Reprint">
                              <IconButton
                                size="small"
                                onClick={async () => { await billReprinted(bill.billNo); navigate(billPrintPath(bill.billNo)) }}
                              >
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
                {filtered.length === 0 && <TableEmptyRow colSpan={viewingAll ? 11 : 10} message="No bills match this search." />}
              </TableBody>
            </Table>
        </TableCard>
      </PageContent>

      <ConfirmDialog
        open={Boolean(cancellingBill)}
        title="Cancel bill?"
        confirmLabel="Cancel bill"
        cancelLabel="Keep bill"
        onConfirm={confirmCancel}
        onClose={() => setCancellingBill(null)}
      >
        {cancellingBill && (
          <>Cancel bill <b>{cancellingBill.billNo}</b> for {formatCurrency(getBillTotals(cancellingBill).grandTotal)}? This can't be undone.</>
        )}
      </ConfirmDialog>
    </>
  )
}

export default Bills
