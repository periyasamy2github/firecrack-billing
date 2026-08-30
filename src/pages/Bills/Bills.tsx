import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Chip, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useConfirm } from 'material-ui-confirm'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { Mono } from '../../components/Mono'
import { SearchField } from '../../components/SearchField'
import { ListFooter } from '../../components/ListFooter'
import { getBillTotals } from '../../utils/billing'
import { formatCurrency } from '../../utils/format'
import { billFilters } from '../../utils/billFilters'
import { ROUTES, billEditPath, billPrintPath } from '../../utils/routes'
import { useSession } from '../../hooks/useSession'
import { useDispatch } from '../../redux/store'
import { cancelBill, reprintBill } from '../../redux/billsSlice'
import { useBillsPage } from '../../hooks/useBillsPage'
import { useKeyShortcuts } from '../../hooks/useKeyShortcuts'
import { usePendingAction } from '../../hooks/usePendingAction'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../utils/errorMessage'
import { BillsTable } from './BillsTable'
import type { Bill } from '../../types'
import styles from '../../css/pages/Bills.module.css'
import { usePageTitle } from '../../hooks/usePageTitle'

export const Bills = () => {
  const navigate = useNavigate()
  const { counterScope, paymentTypes } = useSession()
  const filters = billFilters(paymentTypes.map((type) => type.name))
  const dispatch = useDispatch()
  const confirm = useConfirm()
  const viewingAll = counterScope === 'all'
  const showToast = useToast()
  const { isPending, run } = usePendingAction()

  const { query, setQuery, filter, setFilter, page, rowsPerPage, changePage, changeRowsPerPage, result, refetch } =
    useBillsPage({ scope: counterScope })

  usePageTitle(`Bills · ${result.total}`)

  const searchInputRef = useRef<HTMLInputElement>(null)
  useKeyShortcuts({
    '/': () => searchInputRef.current?.focus(),
    ...Object.fromEntries(filters.map((key, index) => [String(index + 1), () => setFilter(key)])),
  })

  const cancelWithConfirm = async (bill: Bill) => {
    const { confirmed } = await confirm({
      title: 'Cancel bill?',
      description: <>Cancel bill <b>{bill.billNo}</b> for {formatCurrency(getBillTotals(bill).grandTotal)}? The items go back into stock. This can't be undone.</>,
      confirmationText: 'Cancel bill',
      cancellationText: 'Keep bill',
    })
    if (!confirmed) return

    await run(bill.billNo, async () => {
      try {
        await dispatch(cancelBill(bill.billNo)).unwrap()
        refetch()
        showToast(`Bill ${bill.billNo} cancelled`, 'warning')
      } catch (err) {
        showToast(errorMessage(err, 'Could not cancel this bill'), 'error')
      }
    })
  }

  const reprintAndOpen = (bill: Bill) =>
    run(bill.billNo, async () => {
      try {
        await dispatch(reprintBill(bill.billNo)).unwrap()
        navigate(billPrintPath(bill.id))
      } catch (err) {
        showToast(errorMessage(err, 'Could not reprint this bill'), 'error')
      }
    })

  const tableFooter = (
    <ListFooter
      count={result.total}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={changePage}
      onRowsPerPageChange={changeRowsPerPage}
      summary={
        <>
          <Typography variant="caption">{result.total} bills shown · {result.counts.Cancelled ?? 0} cancelled</Typography>
          <div className={styles.footerSpacer} />
          <Typography variant="caption">Discount <Mono sx={{ fontWeight: 650, color: 'text.primary' }}>{formatCurrency(result.totals.discount)}</Mono></Typography>
          <Typography variant="caption">GST <Mono sx={{ fontWeight: 650, color: 'text.primary' }}>{formatCurrency(result.totals.gst)}</Mono></Typography>
          <Typography variant="caption">Total <Mono sx={{ fontWeight: 700, color: 'text.primary', fontSize: 13 }}>{formatCurrency(result.totals.grand)}</Mono></Typography>
        </>
      }
    />
  )

  return (
    <>
      <PageHeader
        title="Bills"
        crumb={viewingAll ? `${result.total} bills · all branches` : `${result.total} bills`}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate(ROUTES.newBill)}>New Bill</Button>
        }
      />
      <PageContent>
        <Card className={styles.filterCard}>
          <div className={styles.filterRow}>
            <SearchField placeholder="Bill number or customer mobile… (/)" value={query} onChange={setQuery} inputRef={searchInputRef} sx={{ flex: 1, minWidth: 260 }} />
            {filters.map((key) => (
              <Chip
                key={key}
                label={`${key} ${result.counts[key] ?? 0}`}
                size="small"
                onClick={() => setFilter(key)}
                color={filter === key ? 'primary' : undefined}
                variant={filter === key ? 'filled' : 'outlined'}
              />
            ))}
          </div>
        </Card>

        <BillsTable
          bills={result.bills}
          loading={result.loading}
          error={result.error}
          viewingAll={viewingAll}
          isPending={isPending}
          onView={(bill) => navigate(billPrintPath(bill.id))}
          onEdit={(bill) => navigate(billEditPath(bill.id))}
          onReprint={reprintAndOpen}
          onCancel={cancelWithConfirm}
          footer={tableFooter}
        />
      </PageContent>
    </>
  )
}

export default Bills
