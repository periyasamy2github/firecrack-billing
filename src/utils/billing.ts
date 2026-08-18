import type { Bill, BillDiscount, BillLineItem, BillTotals } from '../types'

export interface LineAmounts {
  rate: number
  taxable: number
  gstAmount: number
  amount: number
}

export const computeLineAmounts = (item: BillLineItem, gstApplicable = true): LineAmounts => {
  const rate = item.product.mrp * (1 - item.discountPct / 100)
  const taxable = rate * item.qty
  const gstAmount = gstApplicable ? taxable * (item.product.gstRate / 100) : 0
  return { rate, taxable, gstAmount, amount: taxable + gstAmount }
}

/** Extra bill-level discount, clamped to sane bounds, applied on top of each item's own discount. */
const resolveBillDiscountAmount = (itemTaxable: number, billDiscount?: BillDiscount): number => {
  if (!billDiscount || !Number.isFinite(billDiscount.value) || billDiscount.value <= 0 || itemTaxable <= 0) return 0
  if (billDiscount.type === 'percent') return itemTaxable * (Math.min(billDiscount.value, 100) / 100)
  return Math.min(billDiscount.value, itemTaxable)
}

export const computeBillTotals = (items: BillLineItem[], gstApplicable = true, billDiscount?: BillDiscount): BillTotals => {
  let gross = 0
  let itemTaxable = 0
  for (const item of items) {
    const { taxable: lineTaxable } = computeLineAmounts(item, false)
    gross += item.product.mrp * item.qty
    itemTaxable += lineTaxable
  }

  const itemDiscount = gross - itemTaxable
  const billDiscountAmount = resolveBillDiscountAmount(itemTaxable, billDiscount)
  const finalTaxable = itemTaxable - billDiscountAmount
  // Same factor applied to every line so mixed GST rates still net out correctly.
  const shrink = itemTaxable > 0 ? finalTaxable / itemTaxable : 1

  let gstTotal = 0
  if (gstApplicable) {
    for (const item of items) {
      const { taxable: lineTaxable } = computeLineAmounts(item, false)
      gstTotal += lineTaxable * shrink * (item.product.gstRate / 100)
    }
  }

  const cgst = gstTotal / 2
  const sgst = gstTotal / 2
  const rawTotal = finalTaxable + gstTotal
  const grandTotal = Math.round(rawTotal)
  const roundOff = grandTotal - rawTotal
  const qtyCount = items.reduce((sum, i) => sum + i.qty, 0)

  return {
    gross,
    discount: itemDiscount,
    billDiscountAmount,
    taxable: finalTaxable,
    cgst,
    sgst,
    roundOff,
    grandTotal,
    itemCount: items.length,
    qtyCount,
    avgDiscountPct: gross > 0 ? (itemDiscount / gross) * 100 : 0,
  }
}

export const getBillTotals = (bill: Bill): BillTotals => computeBillTotals(bill.items, bill.gstApplicable, bill.billDiscount)

export const hsnSummary = (items: BillLineItem[], gstApplicable = true, billDiscount?: BillDiscount) => {
  let itemTaxable = 0
  for (const item of items) itemTaxable += computeLineAmounts(item, false).taxable
  const billDiscountAmount = resolveBillDiscountAmount(itemTaxable, billDiscount)
  const shrink = itemTaxable > 0 ? (itemTaxable - billDiscountAmount) / itemTaxable : 1

  const map = new Map<string, { hsn: string; taxable: number; cgst: number; sgst: number; qty: number }>()
  for (const item of items) {
    const { taxable, gstAmount } = computeLineAmounts(item, gstApplicable)
    const existing = map.get(item.product.hsn) ?? { hsn: item.product.hsn, taxable: 0, cgst: 0, sgst: 0, qty: 0 }
    existing.taxable += taxable * shrink
    existing.cgst += (gstAmount * shrink) / 2
    existing.sgst += (gstAmount * shrink) / 2
    existing.qty += item.qty
    map.set(item.product.hsn, existing)
  }
  return Array.from(map.values())
}
