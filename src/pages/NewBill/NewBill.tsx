import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import type { BillDiscountType, BillLineItem, PaymentMethod, Product } from '../../types'
import { formatBillDate, formatBillTime } from '../../utils/format'
import { computeBillTotals, halfGstRateLabel } from '../../utils/billing'
import { billPrintPath } from '../../utils/routes'
import { useSession } from '../../hooks/useSession'
import { useDispatch, useSelector } from '../../redux/store'
import { createBill, type NewBillInput } from '../../redux/billsSlice'
import { loadProducts } from '../../redux/productsSlice'
import { useKeyShortcuts } from '../../hooks/useKeyShortcuts'
import { useToast } from '../../hooks/useToast'
import styles from '../../css/pages/NewBill.module.css'

export const NewBill = () => {
  const navigate = useNavigate()
  const { nextBillNo, billingCounter, counterScope, isSuperAdmin, currentUser } = useSession()
  const dispatch = useDispatch()
  const products = useSelector((state) => state.products.items)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const customerNameInputRef = useRef<HTMLInputElement>(null)
  const billDiscountInputRef = useRef<HTMLInputElement>(null)
  const nextLineId = useRef(1)
  const startedAt = useRef(Date.now())

  const [items, setItems] = useState<BillLineItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash')
  const [gstApplicable, setGstApplicable] = useState(false)
  const [billDiscountType, setBillDiscountType] = useState<BillDiscountType>('percent')
  const [saving, setSaving] = useState(false)

  // The whole catalogue loads once so search and scanning read from memory. Empty id = no counter exists yet.
  const billingCounterId = (counterScope === 'all' ? billingCounter?.id : counterScope) ?? ''
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

  const customerMobile = watch('customerMobile')
  const billDiscountValue = watch('billDiscountValue')

  const billDiscount = billDiscountValue ? { type: billDiscountType, value: Number(billDiscountValue) } : undefined
  const totals = computeBillTotals(items, gstApplicable, billDiscount)
  const showToast = useToast()

  const addItem = (product: Product) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.product.code === product.code)
      if (existing) return prev.map((i) => (i.lineId === existing.lineId ? { ...i, qty: i.qty + 1 } : i))
      return [...prev, { lineId: `L${nextLineId.current++}`, product, qty: 1 }]
    })

  // Never let a line exceed what's on the shelf — createBill rejects the whole bill otherwise.
  const updateQty = (lineId: string, qty: number) =>
    setItems((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, qty: Math.min(qty, i.product.stock) } : i)))
  const removeItem = (lineId: string) => setItems((prev) => prev.filter((i) => i.lineId !== lineId))

  const clearBill = () => {
    setItems([])
    setCustomerName('')
    setPaymentMethod('Cash')
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
      counter: currentUser?.counter ?? billingCounter?.name ?? '',
      billedBy: currentUser?.name ?? 'Unknown',
      items,
      paymentMethod,
      gstApplicable,
      billDiscount,
    }
  }

  const failed = (err: unknown) =>
    showToast((err as { message?: string })?.message ?? 'Could not save this bill', 'error')

  const saveAndPrint = async () => {
    if (saving || items.length === 0 || !(await trigger())) return
    setSaving(true)
    try {
      const { bill } = await dispatch(createBill(buildBillInput())).unwrap()
      navigate(billPrintPath(bill.id), { state: { bill } })
    } catch (err) {
      failed(err)
    } finally {
      setSaving(false)
    }
  }

  const saveOnly = async () => {
    if (saving || items.length === 0 || !(await trigger())) return
    setSaving(true)
    try {
      const { bill } = await dispatch(createBill(buildBillInput())).unwrap()
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
  if (!billingCounter) {
    return <PageMessage title="New Bill" message="No branch is set up yet. Create one under Master → Branches, then come back to bill." />
  }

  return (
    <>
      <PageHeader
        title="New Bill"
        crumb={`${nextBillNo} · ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · ${currentUser?.counter ?? billingCounter.name} · ${loadingProducts ? 'loading products…' : `${products.length} items ready`}`}
        actions={
          <>
            {isSuperAdmin && counterScope === 'all' && (
              <span className={styles.counterWarning}>
                No branch selected — billing under {billingCounter.name}
              </span>
            )}
            <Button size="small" color="error" startIcon={<CloseRoundedIcon />} onClick={clearBill} disabled={items.length === 0}>
              Clear
            </Button>
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
              <TextField label="Branch" value={currentUser?.counter ?? billingCounter.name} disabled />
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
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            billDiscountType={billDiscountType}
            onBillDiscountTypeChange={setBillDiscountType}
            billDiscountValue={billDiscountValue}
            onBillDiscountValueChange={(v) => setValue('billDiscountValue', v, { shouldValidate: Boolean(errors.billDiscountValue) })}
            billDiscountError={Boolean(errors.billDiscountValue)}
            billDiscountInputRef={billDiscountInputRef}
            onSaveAndPrint={saveAndPrint}
            onSaveOnly={saveOnly}
            disabled={items.length === 0 || saving}
            saving={saving}
          />
        </div>
      </PageContent>

      <ShortcutsBar startedAt={startedAt.current} />
    </>
  )
}

export default NewBill
