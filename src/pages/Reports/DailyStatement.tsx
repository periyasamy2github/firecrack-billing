import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, MenuItem, TextField, Typography } from '@mui/material'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { PageMessage } from '../../components/PageMessage'
import { Mono } from '../../components/Mono'
import { api } from '../../services/api'
import { useSession } from '../../hooks/useSession'
import { formatAmount, formatCurrency } from '../../utils/format'
import { ROUTES } from '../../utils/routes'
import type { DailyStatementData } from '../../types'
import styles from '../../css/pages/DailyStatement.module.css'

const todayIso = () => new Date().toLocaleDateString('en-CA')

const SectionTable = ({ title, headers, rows }: { title: string; headers: string[]; rows: (string | number)[][] }) => (
  <div className={styles.section}>
    <Typography className={styles.sectionTitle}>{title}</Typography>
    <table className={styles.table}>
      <thead>
        <tr>
          {headers.map((header, i) => <th key={header} className={i === 0 ? styles.thLeft : styles.thRight}>{header}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, i) => <td key={i} className={i === 0 ? styles.tdLeft : styles.tdRight}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const DailyStatement = () => {
  const navigate = useNavigate()
  const { shop, counters, isSuperAdmin } = useSession()

  const [date, setDate] = useState(todayIso())
  const [scope, setScope] = useState('all')
  const [statement, setStatement] = useState<DailyStatementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.loadDailyStatement(date, scope)
      .then(setStatement)
      .catch((err) => setError((err as { message?: string })?.message ?? 'Could not load this statement'))
      .finally(() => setLoading(false))
  }, [date, scope])

  const displayDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <>
      <PageHeader
        title="Daily Statement"
        crumb={`${displayDate} · ${statement?.counter ?? 'all branches'}`}
        actions={
          <>
            <TextField
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            {isSuperAdmin && (
              <TextField select value={scope} onChange={(e) => setScope(e.target.value)} size="small" className={styles.counterPicker}>
                <MenuItem value="all">All branches</MenuItem>
                {counters.map((counter) => <MenuItem key={counter.id} value={counter.id}>{counter.name}</MenuItem>)}
              </TextField>
            )}
            <Button size="small" onClick={() => navigate(ROUTES.reports)}>Back to reports</Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<PrintOutlinedIcon />}
              onClick={() => window.print()}
              disabled={loading || !statement}
            >
              Print
            </Button>
          </>
        }
      />
      <PageContent>
        {error && <PageMessage title="Daily Statement" message={error} />}
        {!error && loading && <PageMessage title="Daily Statement" message="Preparing the statement…" />}
        {!error && !loading && statement && (
          <div className={`${styles.sheetWrap} print-area`}>
            <div className={styles.sheet}>
              <div className={styles.sheetHeader}>
                <Typography className={styles.shopName}>{shop.name.toUpperCase()}</Typography>
                <Typography className={styles.sheetTitle}>DAILY STATEMENT</Typography>
                <Typography className={styles.sheetMeta}>
                  {displayDate} · {statement.counter ?? 'All branches'}
                </Typography>
              </div>

              <div className={styles.summaryRow}>
                {[
                  ['Sales', formatCurrency(statement.sales)],
                  ['Bills', String(statement.billCount)],
                  ['GST', formatCurrency(statement.gst)],
                  ['Discount', formatCurrency(statement.discount)],
                  ['Cancelled', String(statement.cancelledCount)],
                  ...(statement.refundCount > 0 ? [['Refunds', String(statement.refundCount)]] : []),
                ].map(([label, value]) => (
                  <div key={label} className={styles.summaryBlock}>
                    <Typography className={styles.summaryLabel}>{label}</Typography>
                    <Mono sx={{ fontSize: 14, fontWeight: 700 }}>{value}</Mono>
                  </div>
                ))}
              </div>

              {statement.paymentTotals.length > 0 && (
                <SectionTable
                  title="Collections by payment type"
                  headers={['Type', 'Bills', 'Amount']}
                  rows={statement.paymentTotals.map((row) => [row.type, row.bills, formatAmount(row.amount)])}
                />
              )}

              {statement.perCounter.length > 0 && (
                <SectionTable
                  title="Per branch"
                  headers={['Branch', 'Bills', 'Sales']}
                  rows={statement.perCounter.map((row) => [row.name, row.bills, formatAmount(row.sales)])}
                />
              )}

              {statement.itemSales.length > 0 && (
                <SectionTable
                  title="Items sold"
                  headers={['Item', 'Qty', 'Amount']}
                  rows={statement.itemSales.map((row) => [row.name, row.qty, formatAmount(row.amount)])}
                />
              )}

              {statement.bills.length > 0 ? (
                <SectionTable
                  title="Bills"
                  headers={['Bill no.', 'Time', 'Customer', 'By', 'Payment', 'Amount']}
                  rows={statement.bills.map((bill) => [
                    `${bill.billNo}${statement.counter ? '' : ` · ${bill.counter}`}${bill.status !== 'Paid' ? ` (${bill.status.toLowerCase()})` : ''}`,
                    bill.time,
                    bill.customerName || 'Walk-in',
                    bill.billedBy,
                    bill.payment ?? '—',
                    formatAmount(bill.grandTotal),
                  ])}
                />
              ) : (
                <Typography className={styles.emptyDay}>No bills on this day.</Typography>
              )}

              <Typography className={styles.footerNote}>
                Generated {new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </div>
          </div>
        )}
      </PageContent>
    </>
  )
}

export default DailyStatement
