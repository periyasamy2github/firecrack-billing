import { createAsyncThunk } from '@reduxjs/toolkit'
import { computeBillTotals } from '../utils/billing'
import { api } from '../services/api'
import type { Bill, NewBillPayload } from '../types'

// paymentMethod is the backend's display label and the edit audit is server-stamped — derived, never sent.
export type NewBillInput = Omit<Bill, 'id' | 'billNo' | 'status' | 'reprintCount' | 'paymentMethod' | 'editedAt' | 'editedBy'>

// Cart of full products -> the API's codes + flat-₹ discount.
const toPayload = (input: NewBillInput): NewBillPayload => ({
  counterId: input.counterId,
  customerName: input.customerName,
  customerMobile: input.customerMobile,
  payments: input.payments.map((payment) => ({ typeId: payment.typeId, amount: payment.amount })),
  gstApplicable: input.gstApplicable,
  discount: computeBillTotals(input.items, input.gstApplicable, input.billDiscount).billDiscountAmount,
  discountType: input.billDiscount?.type ?? null,
  discountValue: input.billDiscount?.value ?? null,
  items: input.items.map((i) => ({ code: i.product.code, qty: i.qty })),
})

export const createBill = createAsyncThunk('bills/create', (input: NewBillInput) => api.createBill(toPayload(input)))
export const updateBill = createAsyncThunk('bills/update', ({ billNo, input }: { billNo: string; input: NewBillInput }) =>
  api.updateBill({ ...toPayload(input), billNo }))
export const cancelBill = createAsyncThunk('bills/cancel', (billNo: string) => api.cancelBill(billNo))
export const reprintBill = createAsyncThunk('bills/reprint', (billNo: string) => api.reprintBill(billNo))
