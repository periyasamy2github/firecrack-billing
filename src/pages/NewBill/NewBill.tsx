import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Switch, TextField, Typography } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { PageMessage } from '../../components/PageMessage'
import { Panel } from '../../components/Panel'
import { BillItemsTable } from './BillItemsTable'
import { BillSummaryRail } from './BillSummaryRail'
import { ProductSearchField } from './ProductSearchField'
import { ShortcutsBar } from './ShortcutsBar'
import { newBillSchema, type NewBillFormValues } from './newBillSchema'
import { MIXED } from './PaymentMethodToggle'
import type { BillDiscountType, BillLineItem, BillPayment, Product } from '../../types'
import { formatBillDate, formatBillTime } from '../../utils/format'
import { computeBillTotals, halfGstRateLabel } from '../../utils/billing'
import { ROUTES, billPrintPath } from '../../utils/routes'
import { useSession } from '../../hooks/useSession'
import { useDispatch, useSelector } from '../../redux/store'
import { createBill, updateBill, type NewBillInput } from '../../redux/billsSlice'
import { api } from '../../services/api'
import type { Bill } from '../../types'
import { loadProducts } from '../../redux/productsSlice'
import { useKeyShortcuts } from '../../hooks/useKeyShortcuts'
import { useToast } from '../../hooks/useToast'
import styles from '../../css/pages/NewBill.module.css'

export const NewBill = () => {
  const navigate = useNavigate()
  const params = useParams<{ billId: string }>()
  const editBillId = params.billId ?? ''
  const editing = Boolean(editBillId)
  const { nextBillNo, billingCounter, counterScope, isSuperAdmin, currentUser, activePaymentTypes } = useSession()
  const dispatch = useDispatch()
  const products = useSelector((state) => state.products.items)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const customerNameInputRef = useRef<HTMLInputElement>(null)
  const billDiscountInputRef = useRef<HTMLInputElement>(null)
  const nextLineId = useRef(1)
  const startedAt = useRef(Date.now())

  const [items, setItems] = useState<BillLineItem[]>([])
  const [customerName, setCustomerName] = useState('')
  // A payment type's id, or MIXED with per-type amounts that must add up to the total.
  const [paymentSelection, setPaymentSelection] = useState<string>('')
  const [mixedAmounts, setMixedAmounts] = useState<Record<string, string>>({})
  const [gstApplicable, setGstApplicable] = useState(false)
  const [billDiscountType, setBillDiscountType] = useState<BillDiscountType>('percent')
  const [saving, setSaving] = useState(false)

  // Edit mode: the bill loads by its encrypted id, prefills everything, and saves via PUT.
  const [editBill, setEditBill] = useState<Bill | null>(null)
  const [editNotFound, setEditNotFound] = useState(false)
  // What this bill already holds per product code — its stock is spoken for, so qty may go that far above shelf stock.
  const originalQty = useRef<Record<string, number>>({})

  // The whole catalogue loads once so search and scanning read from memory. Empty id = no counter exists yet.
  const selectedCounterId = (counterScope === 'all' ? billingCounter?.id : counterScope) ?? ''
  const billingCounterId = editing ? (editBill?.counterId ?? '') : selectedCounterId
  const [loadingProducts, setLoadingProducts] = useState(true)
  useEffect(() => {
    if (!billingCounterId) return
    setLoadingProducts(true)
    void dispatch(loadProducts(billingCounterId)).finally(() => setLoadingProducts(false))
  }, [billingCounterId])

  const { register, watch, setValue, trigger, reset: resetForm, formState: { errors } } = useForm<NewBillFormValues>({
    resolver: zodResolver(newBillSchema(billDiscountType)),
    defaultValues: { customerMobile: '', billDiscountValue: '' },
  })

  useEffect(() => {
    if (!editing) return
    api.loadBill(editBillId)
      .then((bill) => {
        if (bill.status !== 'Paid') {
          setEditNotFound(true)
          return
        }
        setEditBill(bill)
        setItems(bill.items)
        originalQty.current = Object.fromEntries(bill.items.map((item) => [item.product.code, item.qty]))
        setCustomerName(bill.customerName === 'Walk-in' ? '' : bill.customerName)
        setGstApplicable(bill.gstApplicable)
        if (bill.billDiscount) {
          setBillDiscountType(bill.billDiscount.type)
          resetForm({ customerMobile: bill.customerMobile, billDiscountValue: String(bill.billDiscount.value) })
        } else {
          resetForm({ customerMobile: bill.customerMobile, billDiscountValue: '' })
        }
        if (bill.payments.length > 1) {
          setPaymentSelection(MIXED)
          setMixedAmounts(Object.fromEntries(bill.payments.map((payment) => [payment.typeId, String(payment.amount)])))
        } else if (bill.payments.length === 1) {
          setPaymentSelection(bill.payments[0].typeId)
        }
      })
      .catch(() => setEditNotFound(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editBillId])

  const customerMobile = watch('customerMobile')
  const billDiscountValue = watch('billDiscountValue')

  const billDiscount = billDiscountValue ? { type: billDiscountType, value: Number(billDiscountValue) } : undefined
  const totals = computeBillTotals(items, gstApplicable, billDiscount)
  const showToast = useToast()

  // Cash (or whichever type comes first) is preselected once the types arrive.
  const effectiveSelection = paymentSelection || activePaymentTypes[0]?.id || ''

  const buildPayments = (): BillPayment[] => {
    if (effectiveSelection !== MIXED) {
      const type = activePaymentTypes.find((t) => t.id === effectiveSelection)
      return type ? [{ typeId: type.id, type: type.name, amount: totals.grandTotal }] : []
    }
    return activePaymentTypes
      .map((type) => ({ typeId: type.id, type: type.name, amount: Number(mixedAmounts[type.id]) || 0 }))
      .filter((payment) => payment.amount > 0)
  }

  const mixedTendered = activePaymentTypes.reduce((sum, type) => sum + (Number(mixedAmounts[type.id]) || 0), 0)
  const paymentsReady = effectiveSelection === MIXED ? mixedTendered === totals.grandTotal && totals.grandTotal > 0 : Boolean(effectiveSelection)

  const addItem = (product: Product) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.product.code === product.code)
      if (existing) return prev.map((i) => (i.lineId === existing.lineId ? { ...i, qty: i.qty + 1 } : i))
      return [...prev, { lineId: `L${nextLineId.current++}`, product, qty: 1 }]
    })

  // Never let a line exceed what's on the shelf — createBill rejects the whole bill otherwise.
  // While editing, this bill's own quantities already left the shelf, so they count as available.
  const updateQty = (lineId: string, qty: number) =>
    setItems((prev) => prev.map((i) => (i.lineId === lineId
      ? { ...i, qty: Math.min(qty, i.product.stock + (editing ? originalQty.current[i.product.code] ?? 0 : 0)) }
      : i)))
  const removeItem = (lineId: string) => setItems((prev) => prev.filter((i) => i.lineId !== lineId))

  const clearBill = () => {
    setItems([])
    setCustomerName('')
    setPaymentSelection('')
    setMixedAmounts({})
    setGstApplicable(false)
    setBillDiscountType('percent')
    resetForm({ customerMobile: '', billDiscountValue: '' })
    startedAt.current = Date.now()
  }

  const buildBillInput = (): NewBillInput => {
    const now = new Date()
    return {
      counterId: billingCounterId,
      date: formatBillDate(now),
      time: formatBillTime(now),
      customerName: customerName || 'Walk-in',
      customerMobile,
      counter: editing ? (editBill?.counter ?? '') : (currentUser?.counter ?? billingCounter?.name ?? ''),
      billedBy: currentUser?.name ?? 'Unknown',
      items,
      payments: buildPayments(),
      gstApplicable,
      billDiscount,
    }
  }

  const failed = (err: unknown) =>
    showToast((err as { message?: string })?.message ?? 'Could not save this bill', 'error')

  const persistBill = () =>
    editing
      ? dispatch(updateBill({ billNo: editBill!.billNo, input: buildBillInput() })).unwrap()
      : dispatch(createBill(buildBillInput())).unwrap()

  const saveAndPrint = async () => {
    if (saving || items.length === 0 || !paymentsReady || !(await trigger())) return
    setSaving(true)
    try {
      const { bill } = await persistBill()
      navigate(billPrintPath(bill.id), { state: { bill } })
    } catch (err) {
      failed(err)
    } finally {
      setSaving(false)
    }
  }

  const saveOnly = async () => {
    if (saving || items.length === 0 || !paymentsReady || !(await trigger())) return
    setSaving(true)
    try {
      const { bill } = await persistBill()
      if (editing) {
        showToast(`Bill ${bill.billNo} updated`)
        navigate(ROUTES.bills)
        return
      }
      showToast(`Bill ${bill.billNo} saved without printing`)
      clearBill()
    } catch (err) {
      failed(err)
    } finally {
      setSaving(false)
    }
  }

  useKeyShortcuts(
    {
      F2: () => searchInputRef.current?.focus(),
      F3: () => customerNameInputRef.current?.focus(),
      F7: () => billDiscountInputRef.current?.focus(),
      F9: () => saveAndPrint(),
      F10: () => saveOnly(),
    },
    { allowInInputs: ['F2', 'F3', 'F7', 'F9', 'F10'] },
  )

  // A fresh install has no counters yet — nothing to bill on until one is created.
  if (!editing && !billingCounter) {
    return <PageMessage title="New Bill" message="No branch is set up yet. Create one under Master → Branches, then come back to bill." />
  }

  if (editing && editNotFound) {
    return <PageMessage title="Edit Bill" message="This bill cannot be edited — it may be cancelled or no longer exist." />
  }

  if (editing && !editBill) {
    return <PageMessage title="Edit Bill" message="Loading bill…" />
  }

  return (
    <>
      <PageHeader
        title={editing ? 'Edit Bill' : 'New Bill'}
        crumb={editing
          ? `${editBill!.billNo} · ${editBill!.date} · ${editBill!.counter} · editing`
          : `${nextBillNo} · ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · ${currentUser?.counter ?? billingCounter!.name} · ${loadingProducts ? 'loading products…' : `${products.length} items ready`}`}
        actions={
          <>
            {!editing && isSuperAdmin && counterScope === 'all' && (
              <span className={styles.counterWarning}>
                No branch selected — billing under {billingCounter!.name}
              </span>
            )}
            {editing ? (
              <Button size="small" onClick={() => navigate(ROUTES.bills)}>
                Back to bills
              </Button>
            ) : (
              <Button size="small" color="error" startIcon={<CloseRoundedIcon />} onClick={clearBill} disabled={items.length === 0}>
                Clear
              </Button>
            )}
          </>
        }
      />
      <PageContent>
        <div className={styles.pageGrid}>
          <div className={styles.leftCol}>
            <div className={styles.topFieldsGrid}>
              <TextField
                label="Customer Mobile"
                {...register('customerMobile', { required: "Mobile is required" })}
                placeholder="98431 20055"
                error={Boolean(errors.customerMobile)}
                helperText={errors.customerMobile?.message || ' '}
              />
              <TextField label="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in" inputRef={customerNameInputRef} />
              <TextField label="Branch" value={editing ? editBill!.counter : (currentUser?.counter ?? billingCounter!.name)} disabled />
              <div className={gstApplicable ? styles.gstBox : `${styles.gstBox} ${styles.gstBoxOff}`}>
                <div>
                  <Typography className={styles.gstBoxTitle}>{gstApplicable ? 'Tax Invoice' : 'Bill of Supply'}</Typography>
                  <Typography className={styles.gstBoxSubtitle}>{gstApplicable ? 'GST applied' : 'No GST'}</Typography>
                </div>
                <Switch size="small" checked={gstApplicable} onChange={(e) => setGstApplicable(e.target.checked)} />
              </div>
            </div>

            <ProductSearchField
              products={products}
              loading={loadingProducts}
              inputRef={searchInputRef}
              onAdd={addItem}
              onScanBlocked={() => showToast('Still loading this branch’s products — scan again in a moment.', 'info')}
            />

            <Panel title="Items" subtitle={`${totals.itemCount} items · ${totals.qtyCount} qty`} action={<Typography variant="caption">Enter adds a line</Typography>} flush>
              {items.length === 0 ? (
                <div className={styles.emptyState}>
                  <Typography className={styles.emptyStateText}>No items yet — type above, or scan with your barcode scanner.</Typography>
                </div>
              ) : (
                <BillItemsTable items={items} gstApplicable={gstApplicable} onQtyChange={updateQty} onRemove={removeItem} />
              )}
            </Panel>
          </div>

          <BillSummaryRail
            totals={totals}
            gstApplicable={gstApplicable}
            halfGstRate={halfGstRateLabel(items)}
            paymentTypes={activePaymentTypes}
            paymentSelection={effectiveSelection}
            onPaymentSelectionChange={setPaymentSelection}
            mixedAmounts={mixedAmounts}
            onMixedAmountChange={(typeId, value) => setMixedAmounts((prev) => ({ ...prev, [typeId]: value }))}
            billDiscountType={billDiscountType}
            onBillDiscountTypeChange={setBillDiscountType}
            billDiscountValue={billDiscountValue}
            onBillDiscountValueChange={(v) => setValue('billDiscountValue', v, { shouldValidate: Boolean(errors.billDiscountValue) })}
            billDiscountError={Boolean(errors.billDiscountValue)}
            billDiscountInputRef={billDiscountInputRef}
            onSaveAndPrint={saveAndPrint}
            onSaveOnly={saveOnly}
            disabled={items.length === 0 || saving || !paymentsReady}
            saving={saving}
          />
        </div>
      </PageContent>

      <ShortcutsBar startedAt={startedAt.current} />
    </>
  )
}

export default NewBill
