import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, CircularProgress, Typography } from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { Mono } from '../../components/Mono'
import { KpiCard } from '../../components/KpiCard'
import { ListFooter } from '../../components/ListFooter'
import { getBillTotals } from '../../utils/billing'
import { formatCurrency, formatInt } from '../../utils/format'
import { ROUTES, billPrintPath } from '../../utils/routes'
import { downloadXlsx } from '../../utils/xlsx'
import { api } from '../../services/api'
import { useSession } from '../../hooks/useSession'
import { useBillsPage } from '../../hooks/useBillsPage'
import { useKeyShortcuts } from '../../hooks/useKeyShortcuts'
import { useToast } from '../../hooks/useToast'
import { ReportFilterBar, type ReportFilters } from './ReportFilterBar'
import { ReportsTable } from './ReportsTable'
import styles from '../../css/pages/Reports.module.css'

export const Reports = () => {
  const navigate = useNavigate()
  const { counterScope, isSuperAdmin, counters } = useSession()
  const showToast = useToast()
  const [range, setRange] = useState({ dateFrom: '', dateTo: '', counterId: 'all' })

  // Only narrow here when the sidebar is on all counters, or the two would disagree.
  const canPickCounter = isSuperAdmin && counterScope === 'all'
  const scope = canPickCounter ? range.counterId : counterScope
  const showCounterColumn = scope === 'all'
  const scopeName = showCounterColumn ? 'all branches' : (counters.find((b) => b.id === scope)?.name ?? '')

  const { query, setQuery, filter, setFilter, page, rowsPerPage, changePage, changeRowsPerPage, result } =
    useBillsPage({ scope, from: range.dateFrom || undefined, to: range.dateTo || undefined })

  // Search and payment live in useBillsPage; dates and counter are this page's own.
  const filters: ReportFilters = { ...range, query, payment: filter }
  const updateFilters = ({ query: nextQuery, payment, ...nextRange }: Partial<ReportFilters>) => {
    if (nextQuery !== undefined) setQuery(nextQuery)
    if (payment !== undefined) setFilter(payment)
    setRange((prev) => ({ ...prev, ...nextRange }))
  }

  const searchInputRef = useRef<HTMLInputElement>(null)
  useKeyShortcuts({ '/': () => searchInputRef.current?.focus() })

  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      await downloadAllBills()
    } catch (err) {
      showToast((err as { message?: string })?.message ?? 'Could not export these bills', 'error')
    } finally {
      setExporting(false)
    }
  }

  // Exports every match, not just this page.
  const downloadAllBills = async () => {
    const all = await api.loadBills({ scope, search: query, filter, from: range.dateFrom || undefined, to: range.dateTo || undefined, all: true })

    const headers = showCounterColumn
      ? ['Bill no.', 'Branch', 'Date', 'Customer', 'Mobile', 'Total', 'Payment', 'Status']
      : ['Bill no.', 'Date', 'Customer', 'Mobile', 'Total', 'Payment', 'Status']

    const rows = all.data.map((bill) => {
      const row = [bill.billNo, bill.date, bill.customerName || 'Walk-in', bill.customerMobile, formatCurrency(getBillTotals(bill).grandTotal), bill.paymentMethod ?? '—', bill.status]
      return showCounterColumn ? [row[0], bill.counter, ...row.slice(1)] : row
    })

    await downloadXlsx(`bills-${new Date().toISOString().slice(0, 10)}.xlsx`, 'Bills', headers, rows)
  }

  const tableFooter = (
    <ListFooter
      count={result.total}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={changePage}
      onRowsPerPageChange={changeRowsPerPage}
      summary={
        <>
          <Typography variant="caption">{result.total} bills shown</Typography>
          <div className={styles.footerSpacer} />
          <Typography variant="caption">Total <Mono sx={{ fontWeight: 700, color: 'text.primary', fontSize: 13 }}>{formatCurrency(result.totals.grand)}</Mono></Typography>
        </>
      }
    />
  )

  return (
    <>
      <PageHeader
        title="Reports"
        crumb={`${result.total} bills · ${scopeName}`}
        actions={
          <>
            <Button size="small" startIcon={<TodayOutlinedIcon />} onClick={() => navigate(ROUTES.dailyStatement)}>
              Daily statement
            </Button>
            <Button
              size="small"
              startIcon={exporting ? <CircularProgress size={14} /> : <FileDownloadOutlinedIcon />}
              onClick={handleExport}
              disabled={result.total === 0 || exporting}
            >
              {exporting ? 'Exporting…' : 'Export'}
            </Button>
          </>
        }
      />
      <PageContent>
        <div className={styles.kpiRow}>
          <KpiCard label="Sales (paid)" value={formatCurrency(result.totals.grand)} icon={PaymentsOutlinedIcon} tone="primary" />
          <KpiCard label="Bills" value={formatInt(result.total)} icon={ReceiptLongOutlinedIcon} tone="info" />
          <KpiCard label="GST collected" value={formatCurrency(result.totals.gst)} icon={AccountBalanceOutlinedIcon} tone="paid" />
          <KpiCard label="Discounts given" value={formatCurrency(result.totals.discount)} icon={LocalOfferOutlinedIcon} tone="ember" />
        </div>

        <ReportFilterBar
          filters={filters}
          onChange={updateFilters}
          counters={canPickCounter ? counters : null}
          paymentCounts={result.counts}
          searchInputRef={searchInputRef}
        />

        <ReportsTable
          bills={result.bills}
          loading={result.loading}
          error={result.error}
          showCounterColumn={showCounterColumn}
          onView={(bill) => navigate(billPrintPath(bill.id))}
          footer={tableFooter}
        />
      </PageContent>
    </>
  )
}

export default Reports
