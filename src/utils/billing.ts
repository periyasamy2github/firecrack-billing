import type { Bill, BillDiscount, BillLineItem, BillTotals } from '../types'

export interface LineAmounts {
  rate: number
  taxable: number
  gstAmount: number
  amount: number
}

export const computeLineAmounts = (item: BillLineItem, gstApplicable = true): LineAmounts => {
  const rate = item.product.rate
  // rate is the GST-inclusive selling price — back out the tax rather than adding it on top.
  const lineTotal = rate * item.qty
  const taxable = gstApplicable ? lineTotal / (1 + item.product.gstRate / 100) : lineTotal
  const gstAmount = lineTotal - taxable
  return { rate, taxable, gstAmount, amount: lineTotal }
}

const resolveBillDiscountAmount = (gross: number, billDiscount?: BillDiscount): number => {
  if (!billDiscount || !Number.isFinite(billDiscount.value) || billDiscount.value <= 0 || gross <= 0) return 0
  if (billDiscount.type === 'percent') return gross * (Math.min(billDiscount.value, 100) / 100)
  return Math.min(billDiscount.value, gross)
}

export const computeBillTotals = (items: BillLineItem[], gstApplicable = true, billDiscount?: BillDiscount): BillTotals => {
  let mrpValue = 0
  let gross = 0
  let hasMrp = false
  for (const item of items) {
    if (item.product.mrp != null) hasMrp = true
    // A missing MRP counts as the rate, so "MRP value" and savings stay honest.
    mrpValue += (item.product.mrp ?? item.product.rate) * item.qty
    gross += item.product.rate * item.qty
  }

  const billDiscountAmount = resolveBillDiscountAmount(gross, billDiscount)
  // `gross` and the discount are GST-inclusive; `payable` is what the customer actually hands over.
  const payable = gross - billDiscountAmount
  // Same factor on every line so mixed GST rates still net out correctly.
  const shrink = gross > 0 ? payable / gross : 1

  let gstTotal = 0
  if (gstApplicable) {
    for (const item of items) {
      const lineInclusive = item.product.rate * item.qty * shrink
      gstTotal += lineInclusive - lineInclusive / (1 + item.product.gstRate / 100)
    }
  }

  const taxable = payable - gstTotal
  const cgst = gstTotal / 2
  const sgst = gstTotal / 2
  const grandTotal = Math.round(payable)
  const roundOff = grandTotal - payable
  const qtyCount = items.reduce((sum, i) => sum + i.qty, 0)

  return {
    mrpValue,
    hasMrp,
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

/** The discount's other face: "10%" whichever way it was entered, so bills show % and ₹ together. */
export const discountPercentLabel = (totals: BillTotals, billDiscount?: BillDiscount): string | null => {
  if (!billDiscount || totals.billDiscountAmount <= 0 || totals.gross <= 0) return null
  const percent = billDiscount.type === 'percent'
    ? Math.min(billDiscount.value, 100)
    : (totals.billDiscountAmount / totals.gross) * 100
  return `${Number(percent.toFixed(2))}%`
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
