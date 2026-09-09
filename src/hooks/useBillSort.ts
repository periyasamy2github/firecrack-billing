import { useMemo, useState } from 'react'
import { getBillTotals } from '../utils/billing'
import type { Bill } from '../types'

const VALUES: Record<string, (bill: Bill) => string | number> = {
  billNo: (bill) => bill.billNo,
  counter: (bill) => bill.counter,
  date: (bill) => Date.parse(`${bill.date} ${bill.time}`) || 0,
  customer: (bill) => (bill.customerName || 'Walk-in').toLowerCase(),
  billedBy: (bill) => bill.billedBy.toLowerCase(),
  items: (bill) => getBillTotals(bill).itemCount,
  qty: (bill) => getBillTotals(bill).qtyCount,
  total: (bill) => getBillTotals(bill).grandTotal,
  payment: (bill) => bill.paymentMethod ?? '',
  status: (bill) => bill.status,
}

// Sorts the rows already on screen; the page order from the server stays when no column is picked.
export const useBillSort = (bills: Bill[]) => {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedBills = useMemo(() => {
    if (!sortKey) return bills
    const value = VALUES[sortKey]
    return [...bills].sort((a, b) => {
      const left = value(a)
      const right = value(b)
      const order = left < right ? -1 : left > right ? 1 : 0
      return sortDir === 'asc' ? order : -order
    })
  }, [bills, sortKey, sortDir])

  return { sortedBills, sortKey, sortDir, toggleSort }
}
