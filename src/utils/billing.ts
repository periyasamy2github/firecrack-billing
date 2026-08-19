import type { Bill, BillDiscount, BillLineItem, BillTotals } from '../types'

export interface LineAmounts {
  rate: number
  taxable: number
  gstAmount: number
  amount: number
}

export const computeLineAmounts = (item: BillLineItem, gstApplicable = true): LineAmounts => {
  const rate = item.product.rate
  const taxable = rate * item.qty
  const gstAmount = gstApplicable ? taxable * (item.product.gstRate / 100) : 0
  return { rate, taxable, gstAmount, amount: taxable + gstAmount }
}

const resolveBillDiscountAmount = (gross: number, billDiscount?: BillDiscount): number => {
  if (!billDiscount || !Number.isFinite(billDiscount.value) || billDiscount.value <= 0 || gross <= 0) return 0
  if (billDiscount.type === 'percent') return gross * (Math.min(billDiscount.value, 100) / 100)
  return Math.min(billDiscount.value, gross)
}

export const computeBillTotals = (items: BillLineItem[], gstApplicable = true, billDiscount?: BillDiscount): BillTotals => {
  let mrpValue = 0
  let gross = 0
  for (const item of items) {
    mrpValue += item.product.mrp * item.qty
    gross += item.product.rate * item.qty
  }

  const billDiscountAmount = resolveBillDiscountAmount(gross, billDiscount)
  const taxable = gross - billDiscountAmount
  // Same factor on every line so mixed GST rates still net out correctly.
  const shrink = gross > 0 ? taxable / gross : 1

  let gstTotal = 0
  if (gstApplicable) {
    for (const item of items) {
      gstTotal += item.product.rate * item.qty * shrink * (item.product.gstRate / 100)
    }
  }

  const cgst = gstTotal / 2
  const sgst = gstTotal / 2
  const rawTotal = taxable + gstTotal
  const grandTotal = Math.round(rawTotal)
  const roundOff = grandTotal - rawTotal
  const qtyCount = items.reduce((sum, i) => sum + i.qty, 0)

  return {
    mrpValue,
    gross,
    billDiscountAmount,
    taxable,
    cgst,
    sgst,
    roundOff,
    grandTotal,
    itemCount: items.length,
    qtyCount,
  }
}

export const halfGstRateLabel = (items: BillLineItem[]): string | null => {
  const rates = new Set(items.map((item) => item.product.gstRate))
  if (rates.size !== 1) return null
  const [rate] = [...rates]
  return `${Number((rate / 2).toFixed(2))}%`
}

export const getBillTotals = (bill: Bill): BillTotals => computeBillTotals(bill.items, bill.gstApplicable, bill.billDiscount)

export const hsnSummary = (items: BillLineItem[], gstApplicable = true, billDiscount?: BillDiscount) => {
  let gross = 0
  for (const item of items) gross += item.product.rate * item.qty
  const billDiscountAmount = resolveBillDiscountAmount(gross, billDiscount)
  const shrink = gross > 0 ? (gross - billDiscountAmount) / gross : 1

  const map = new Map<string, { hsn: string; rate: number; taxable: number; cgst: number; sgst: number; qty: number }>()
  for (const item of items) {
    const { taxable, gstAmount } = computeLineAmounts(item, gstApplicable)
    const existing = map.get(item.product.hsn) ?? { hsn: item.product.hsn, rate: item.product.gstRate, taxable: 0, cgst: 0, sgst: 0, qty: 0 }
    existing.taxable += taxable * shrink
    existing.cgst += (gstAmount * shrink) / 2
    existing.sgst += (gstAmount * shrink) / 2
    existing.qty += item.qty
    map.set(item.product.hsn, existing)
  }
  return Array.from(map.values())
}
