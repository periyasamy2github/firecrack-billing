import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Autocomplete, Box, Button, Switch, TextField, Typography } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { Panel } from '../../components/Panel'
import { Mono } from '../../components/Mono'
import { KeyBadge } from '../../components/KeyBadge'
import { BillItemsTable } from './BillItemsTable'
import { BillSummaryRail } from './BillSummaryRail'
import type { BillDiscountType, BillLineItem, PaymentMethod } from '../../types'
import type { Product } from '../../types'
import { stockStatus } from '../../data/mockProducts'
import { formatAmount, formatBillDate, formatBillTime } from '../../utils/format'
import { newBillShortcuts } from '../../data/shortcuts'
import { computeBillTotals, halfGstRateLabel } from '../../utils/billing'
import { billPrintPath } from '../../utils/routes'
import { useStoreScope, type NewBillInput } from '../../hooks/useStoreScope'
import { useKeyShortcuts } from '../../hooks/useKeyShortcuts'
import { useFormValidation } from '../../hooks/useFormValidation'
import { useToast } from '../../hooks/useToast'
import styles from './NewBill.module.css'

// The discount bound depends on whether it's a % or a flat ₹ amount, so the schema
// is built fresh with that context.
const newBillSchema = (discountType: BillDiscountType) =>
  z.object({
    customerMobile: z.string(),
    billDiscountValue: z.string(),
  })
    .refine((v) => !v.customerMobile.trim() || /^\d{10}$/.test(v.customerMobile.replace(/\s/g, '')), {
      message: 'Enter a valid 10-digit mobile number', path: ['customerMobile'],
    })
    .refine((v) => !v.billDiscountValue || Number(v.billDiscountValue) > 0, {
      message: 'Discount must be greater than 0', path: ['billDiscountValue'],
    })
    .refine((v) => discountType !== 'percent' || !v.billDiscountValue || Number(v.billDiscountValue) <= 100, {
      message: 'Percent discount cannot exceed 100', path: ['billDiscountValue'],
    })

export const NewBill = () => {
  const navigate = useNavigate()
  const { products, createBill, nextBillNo, activeBranch, currentBranchId, isSuperAdmin, currentUser, activeCounter } = useStoreScope()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const customerNameInputRef = useRef<HTMLInputElement>(null)
  const billDiscountInputRef = useRef<HTMLInputElement>(null)
  const nextLineId = useRef(1)
  const startedAt = useRef(Date.now())

  const [items, setItems] = useState<BillLineItem[]>([])
  const [query, setQuery] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash')
  const [gstApplicable, setGstApplicable] = useState(false)
  const [billDiscountType, setBillDiscountType] = useState<BillDiscountType>('percent')
  const [billDiscountValue, setBillDiscountValue] = useState('')
  const [tendered, setTendered] = useState('')
  const [nowTick, setNowTick] = useState(Date.now())

  const billDiscount = billDiscountValue ? { type: billDiscountType, value: Number(billDiscountValue) } : undefined
  const totals = computeBillTotals(items, gstApplicable, billDiscount)
  const { errors, validate, clearError, reset: resetErrors } = useFormValidation(newBillSchema(billDiscountType))
  const showToast = useToast()

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const addItem = (product: Product | null) => {
    if (!product) return
    setItems((prev) => {
      const existing = prev.find((i) => i.product.code === product.code)
      if (existing) return prev.map((i) => (i.lineId === existing.lineId ? { ...i, qty: i.qty + 1 } : i))
      return [...prev, { lineId: `L${nextLineId.current++}`, product, qty: 1 }]
    })
    setQuery('')
  }

  // Never let a line exceed what's on the shelf — createBill rejects the whole bill otherwise.
  const updateQty = (lineId: string, qty: number) =>
    setItems((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, qty: Math.min(qty, i.product.stock) } : i)))
  const removeItem = (lineId: string) => setItems((prev) => prev.filter((i) => i.lineId !== lineId))

  const clearBill = () => {
    setItems([])
    setCustomerName('')
    setCustomerMobile('')
    setTendered('')
    setPaymentMethod('Cash')
    setGstApplicable(false)
    setBillDiscountType('percent')
    setBillDiscountValue('')
    resetErrors()
    startedAt.current = Date.now()
  }

  const buildBillInput = (): NewBillInput => {
    const now = new Date()
    return {
      branchId: currentBranchId === 'all' ? activeBranch.id : currentBranchId,
      date: formatBillDate(now),
      time: formatBillTime(now),
      customerName: customerName || 'Walk-in',
      customerMobile,
      counter: activeCounter ?? activeBranch.name,
      billedBy: currentUser?.name ?? 'Unknown',
      items,
      paymentMethod,
      gstApplicable,
      billDiscount,
    }
  }

  const failed = (err: unknown) =>
    showToast(err instanceof Error ? err.message : 'Could not save this bill', 'error')

  const saveAndPrint = async () => {
    if (items.length === 0 || !validate({ customerMobile, billDiscountValue })) return
    const tenderedNum = Number(tendered) || 0
    try {
      // Saves the bill, deducts stock and advances the invoice number.
      const bill = await createBill(buildBillInput())
      navigate(billPrintPath(bill.billNo), {
        state: {
          bill,
          tendered: paymentMethod === 'Cash' && tenderedNum > 0 ? tenderedNum : undefined,
          changeDue: paymentMethod === 'Cash' && tenderedNum > 0 ? tenderedNum - totals.grandTotal : undefined,
        },
      })
    } catch (err) {
      failed(err)
    }
  }

  const saveOnly = async () => {
    if (items.length === 0 || !validate({ customerMobile, billDiscountValue })) return
    try {
      const bill = await createBill(buildBillInput())
      showToast(`Bill ${bill.billNo} saved without printing`)
      clearBill()
    } catch (err) {
      failed(err)
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

  const elapsedLabel = () => {
    const secs = Math.max(0, Math.round((nowTick - startedAt.current) / 1000))
    return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
  }

  return (
    <>
      <PageHeader
        title="New Bill"
        crumb={`${nextBillNo} · ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · ${activeCounter ?? activeBranch.name}`}
        actions={
          <>
            {isSuperAdmin && currentBranchId === 'all' && (
              <span className={styles.counterWarning}>
                No counter selected — billing under {activeBranch.name}
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
                label="Customer mobile — optional"
                value={customerMobile}
                onChange={(e) => { setCustomerMobile(e.target.value); clearError('customerMobile') }}
                placeholder="98431 20055"
                error={Boolean(errors.customerMobile)}
                helperText={errors.customerMobile || ' '}
              />
              <TextField label="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in" inputRef={customerNameInputRef} />
              <TextField label="Counter" value={activeCounter ?? activeBranch.name} disabled />
              <div className={gstApplicable ? styles.gstBox : `${styles.gstBox} ${styles.gstBoxOff}`}>
                <div>
                  <Typography className={styles.gstBoxTitle}>{gstApplicable ? 'Tax Invoice' : 'Bill of Supply'}</Typography>
                  <Typography className={styles.gstBoxSubtitle}>{gstApplicable ? 'GST applied' : 'No GST'}</Typography>
                </div>
                <Switch size="small" checked={gstApplicable} onChange={(e) => setGstApplicable(e.target.checked)} />
              </div>
            </div>

            <div
              onKeyDownCapture={(e) => {
                if (e.key !== 'Enter') return
                const exact = products.find((p) => p.code.toLowerCase() === query.trim().toLowerCase())
                if (exact) {
                  e.preventDefault()
                  e.stopPropagation()
                  addItem(exact)
                }
              }}
            >
              <Autocomplete
                options={products}
                value={null}
                ListboxProps={{ style: { maxHeight: 320 } }}
                inputValue={query}
                onInputChange={(_, value) => setQuery(value)}
                onChange={(_, value) => addItem(value)}
                getOptionLabel={(p) => `${p.code} — ${p.name}`}
                renderOption={(props, p) => {
                  const status = stockStatus(p)
                  return (
                    <Box component="li" {...props} key={p.code} className={styles.optionRow}>
                      <div className={styles.optionLeft}>
                        <Typography className={styles.optionName}>{p.name}</Typography>
                        <div className={styles.optionMetaRow}>
                          <Mono sx={{ fontSize: 10.5, color: 'text.secondary' }}>{p.code}</Mono>
                          <Typography className={styles.optionUnit}>· {p.unit}</Typography>
                          {status.tone !== 'paid' && (
                            <Typography className={status.tone === 'due' ? `${styles.optionStock} ${styles.optionStockDue}` : `${styles.optionStock} ${styles.optionStockWarn}`}>
                              · {p.stock} left
                            </Typography>
                          )}
                        </div>
                      </div>
                      <div className={styles.optionRight}>
                        <Mono sx={{ fontSize: 14, fontWeight: 700 }}>₹{formatAmount(p.rate)}</Mono>
                        <Mono sx={{ display: 'block', fontSize: 10, color: 'text.secondary', textDecoration: 'line-through' }}>₹{formatAmount(p.mrp)}</Mono>
                      </div>
                    </Box>
                  )
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputRef={searchInputRef}
                    label="Item search"
                    placeholder="Scan barcode, or type item code / name…"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <SearchRoundedIcon className={styles.searchIcon} />,
                      endAdornment: (
                        <span className={styles.searchEndAdornment}>
                          <KeyBadge label="F2" />
                        </span>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                        borderRadius: '8px',
                        py: 0.6,
                        boxShadow: '0 0 0 3px var(--primary-soft)',
                        '& fieldset': { borderColor: 'primary.main', borderWidth: '1.5px' },
                      },
                    }}
                  />
                )}
              />
            </div>

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
            onBillDiscountValueChange={(v) => { setBillDiscountValue(v); clearError('billDiscountValue') }}
            billDiscountError={Boolean(errors.billDiscountValue)}
            billDiscountInputRef={billDiscountInputRef}
            tendered={tendered}
            onTenderedChange={setTendered}
            onSaveAndPrint={saveAndPrint}
            onSaveOnly={saveOnly}
            disabled={items.length === 0}
          />
        </div>
      </PageContent>

      <div className={styles.shortcutsBar}>
        {newBillShortcuts.items.map(({ key, label }) => (
          <div key={key} className={styles.shortcutItem}>
            <KeyBadge label={key} />
            <Typography className={styles.shortcutLabel}>{label}</Typography>
          </div>
        ))}
        <KeyBadge label="F1" />
        <Typography className={styles.shortcutLabel}>all shortcuts</Typography>
        <div className={styles.shortcutsSpacer} />
        <Typography className={styles.shortcutLabel}>Elapsed on this bill {elapsedLabel()}</Typography>
      </div>

    </>
  )
}

export default NewBill
