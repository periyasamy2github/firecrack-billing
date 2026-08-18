import type { Bill } from '../types'

export type BillFilter = 'All' | 'Cash' | 'UPI' | 'Card' | 'Cancelled'

export const BILL_FILTERS: BillFilter[] = ['All', 'Cash', 'UPI', 'Card', 'Cancelled']

export const matchesFilter = (bill: Bill, filter: BillFilter): boolean => {
  if (filter === 'All') return true
  if (filter === 'Cancelled') return bill.status === 'Cancelled'
  return bill.paymentMethod === filter
}

/** Matches bill number or customer mobile, ignoring spaces in the mobile. */
export const matchesSearch = (bill: Bill, query: string): boolean => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return bill.billNo.toLowerCase().includes(q) || bill.customerMobile.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
}
