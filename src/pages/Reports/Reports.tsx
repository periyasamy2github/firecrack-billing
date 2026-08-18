import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, IconButton, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { Mono } from '../../components/Mono'
import { StatusPill, BILL_STATUS_TONE } from '../../components/StatusPill'
import { SearchField } from '../../components/SearchField'
import { TableCard, TableEmptyRow } from '../../components/TableCard'
import { TablePaginationBar } from '../../components/TablePaginationBar'
import { getBillTotals } from '../../utils/billing'
import { formatCurrency } from '../../utils/format'
import { BILL_FILTERS, matchesFilter, matchesSearch, type BillFilter } from '../../utils/billFilters'
import { billPrintPath } from '../../utils/routes'
import { downloadCsv } from '../../utils/csv'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useKeyShortcuts } from '../../hooks/useKeyShortcuts'
import { usePagination } from '../../hooks/usePagination'
import styles from './Reports.module.css'

const MONTH_NUM: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}

// '10-Nov-2026' ? '2026-11-10', same shape as the date-input values, so plain string compare works.
const toIsoDate = (billDate: string): string => {
  const [day, month, year] = billDate.split('-')
  return `${year}-${MONTH_NUM[month] ?? '01'}-${day.padStart(2, '0')}`
}

export const Reports = () => {
  const navigate = useNavigate()
  const { currentBranchId, isSuperAdmin, scopedBills, branches } = useStoreScope()
  const viewingAll = currentBranchId === 'all'
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<BillFilter>('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [counterFilter, setCounterFilter] = useState('All')
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  const filtered = useMemo(() => {
    return scopedBills.filter((b) => {
      if (!matchesFilter(b, filter)) return false
      const iso = toIsoDate(b.date)
      if (dateFrom && iso < dateFrom) return false
      if (dateTo && iso > dateTo) return false
      if (isSuperAdmin && counterFilter !== 'All' && b.counter !== counterFilter) return false
      return matchesSearch(b, search)
    })
  }, [scopedBills, search, filter, dateFrom, dateTo, counterFilter, isSuperAdmin])

  const { page, rowsPerPage, pageRows, changePage, changeRowsPerPage } = usePagination(filtered)

  const totalCollected = filtered.filter((b) => b.status === 'Paid').reduce((sum, b) => sum + getBillTotals(b).grandTotal, 0)

  const handleExport = () => {
    const headers = viewingAll
      ? ['Bill no.', 'Counter', 'Date', 'Customer', 'Mobile', 'Total', 'Payment', 'Status']
      : ['Bill no.', 'Date', 'Customer', 'Mobile', 'Total', 'Payment', 'Status']

    const rows = filtered.map((bill) => {
      const row = [bill.billNo, bill.date, bill.customerName || 'Walk-in', bill.customerMobile, formatCurrency(getBillTotals(bill).grandTotal), bill.paymentMethod ?? '—', bill.status]
      return viewingAll ? [row[0], bill.counter, ...row.slice(1)] : row
    })

    downloadCsv(`bills-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows])
  }

  const tableFooter = (
    <>
      <div className={styles.footerBar}>
        <Typography variant="caption">{filtered.length} bills shown</Typography>
        <div className={styles.footerSpacer} />
        <Typography variant="caption">Total <Mono sx={{ fontWeight: 700, color: 'text.primary', fontSize: 13 }}>{formatCurrency(totalCollected)}</Mono></Typography>
      </div>
      <TablePaginationBar count={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={changePage} onRowsPerPageChange={changeRowsPerPage} />
    </>
  )

  return (
    <>
      <PageHeader
        title="Reports"
        crumb={viewingAll ? `${scopedBills.length} bills · all counters` : `${scopedBills.length} bills this season`}
        actions={<Button size="small" startIcon={<FileDownloadOutlinedIcon />} onClick={handleExport} disabled={filtered.length === 0}>Export</Button>}
      />
      <PageContent>
        <Card className={styles.filterCard}>
          <div className={styles.filterRow}>
            <SearchField placeholder="Bill number or customer mobile… (/)" value={search} onChange={setSearch} inputRef={searchInputRef} sx={{ flex: 1, minWidth: 260 }} />
            <TextField
              label="From"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              className={styles.dateField}
            />
            <TextField
              label="To"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              className={styles.dateField}
            />
            {isSuperAdmin && (
              <TextField
                label="Counter"
                select
                value={counterFilter}
                onChange={(e) => setCounterFilter(e.target.value)}
                size="small"
                className={styles.counterField}
              >
                <MenuItem value="All">All counters</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.name}>{branch.name}</MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              label="Payment"
              select
              value={filter}
              onChange={(e) => setFilter(e.target.value as BillFilter)}
              size="small"
              className={styles.paymentField}
            >
              {BILL_FILTERS.map((key) => (
                <MenuItem key={key} value={key}>{key} ({filterCounts[key]})</MenuItem>
              ))}
            </TextField>
          </div>
        </Card>

        <TableCard footer={tableFooter}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Bill no.</TableCell>
                  {viewingAll && <TableCell>Counter</TableCell>}
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((bill) => (
                  <TableRow key={bill.branchId + bill.billNo} hover>
                    <TableCell><Mono sx={{ fontWeight: 600 }}>{bill.billNo}</Mono></TableCell>
                    {viewingAll && <TableCell className={styles.counterCell}>{bill.counter}</TableCell>}
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
                        <IconButton size="small" onClick={() => navigate(billPrintPath(bill.billNo))}>
                          <VisibilityOutlinedIcon className={styles.actionIcon} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableEmptyRow colSpan={viewingAll ? 8 : 7} message="No bills match this search." />}
              </TableBody>
            </Table>
        </TableCard>
      </PageContent>
    </>
  )
}

export default Reports
