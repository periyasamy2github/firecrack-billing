import type { Bill } from '../types'
import { getBillTotals } from './billing'

export interface DashboardKpis {
  sales: number
  billCount: number
  avgBill: number
  gstCollected: number
}

export interface TrendPoint {
  label: string
  value: number
}

export interface PaymentSlice {
  method: string
  amount: number
}

export interface TopItem {
  name: string
  amount: number
}

const paidOnly = (bills: Bill[]): Bill[] => bills.filter((bill) => bill.status === 'Paid')

export const dashboardKpis = (bills: Bill[]): DashboardKpis => {
  const paid = paidOnly(bills)
  let sales = 0
  let gstCollected = 0
  for (const bill of paid) {
    const totals = getBillTotals(bill)
    sales += totals.grandTotal
    gstCollected += totals.cgst + totals.sgst
  }
  return {
    sales,
    billCount: paid.length,
    avgBill: paid.length === 0 ? 0 : Math.round(sales / paid.length),
    gstCollected,
  }
}

/** '10-Nov-2026' sorts wrongly as text, so trend points are ordered by real date. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const sortKey = (billDate: string): number => {
  const [day, month, year] = billDate.split('-')
  const monthIndex = MONTHS.indexOf(month)
  return Number(year) * 10000 + (monthIndex + 1) * 100 + Number(day)
}

export const salesTrend = (bills: Bill[], days = 10): TrendPoint[] => {
  const byDate = new Map<string, number>()
  for (const bill of paidOnly(bills)) {
    byDate.set(bill.date, (byDate.get(bill.date) ?? 0) + getBillTotals(bill).grandTotal)
  }
  return Array.from(byDate.entries())
    .sort((a, b) => sortKey(a[0]) - sortKey(b[0]))
    .slice(-days)
    .map(([date, total]) => ({
      label: date.split('-').slice(0, 2).join(' '),
      value: Math.round(total / 1000),
    }))
}

export const paymentMix = (bills: Bill[]): PaymentSlice[] => {
  const byMethod = new Map<string, number>()
  for (const bill of paidOnly(bills)) {
    if (!bill.paymentMethod) continue
    byMethod.set(bill.paymentMethod, (byMethod.get(bill.paymentMethod) ?? 0) + getBillTotals(bill).grandTotal)
  }
  return Array.from(byMethod.entries())
    .map(([method, amount]) => ({ method, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export const topItems = (bills: Bill[], count = 6): TopItem[] => {
  const byProduct = new Map<string, number>()
  for (const bill of paidOnly(bills)) {
    for (const item of bill.items) {
      byProduct.set(item.product.name, (byProduct.get(item.product.name) ?? 0) + item.product.rate * item.qty)
    }
  }
  return Array.from(byProduct.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, count)
}

export const recentBills = (bills: Bill[], count: number): Bill[] =>
  [...bills]
    .sort((a, b) => sortKey(b.date) - sortKey(a.date) || b.time.localeCompare(a.time))
    .slice(0, count)
