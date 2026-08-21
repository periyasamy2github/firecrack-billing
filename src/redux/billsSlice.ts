import { createAsyncThunk } from '@reduxjs/toolkit'
import { computeBillTotals } from '../utils/billing'
import { api } from '../services/api'
import type { Bill, NewBillPayload } from '../types'

export type NewBillInput = Omit<Bill, 'id' | 'billNo' | 'status' | 'reprintCount'>

// Cart of full products -> the API's codes + flat-₹ discount.
const toPayload = (input: NewBillInput): NewBillPayload => ({
  counterId: input.counterId,
  customerName: input.customerName,
  customerMobile: input.customerMobile,
  paymentMethod: input.paymentMethod,
  gstApplicable: input.gstApplicable,
  discount: computeBillTotals(input.items, input.gstApplicable, input.billDiscount).billDiscountAmount,
  items: input.items.map((i) => ({ code: i.product.code, qty: i.qty })),
})

export const createBill = createAsyncThunk('bills/create', (input: NewBillInput) => api.createBill(toPayload(input)))
export const cancelBill = createAsyncThunk('bills/cancel', (billNo: string) => api.cancelBill(billNo))
export const reprintBill = createAsyncThunk('bills/reprint', (billNo: string) => api.reprintBill(billNo))
