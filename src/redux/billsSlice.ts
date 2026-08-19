import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { bills as seedBills } from '../data/mockBills'
import { shop as seedShop } from '../data/shop'
import { mockApi } from '../services/mockApi'
import type { Bill, Shop } from '../types'

export type NewBillInput = Omit<Bill, 'billNo' | 'status' | 'reprintCount'>

interface BillThunkState {
  shop: { shop: Shop }
  bills: { items: Bill[]; nextNumber: number }
}

export const createBill = createAsyncThunk<Bill, NewBillInput, { state: BillThunkState }>(
  'bills/create',
  (input, { getState }) => {
    const { shop } = getState().shop
    const { nextNumber } = getState().bills
    const bill: Bill = { ...input, billNo: `${shop.invoicePrefix}${nextNumber}`, status: 'Paid', reprintCount: 0 }
    return mockApi.createBill(bill)
  },
)

export const cancelBill = createAsyncThunk('bills/cancel', (billNo: string) => mockApi.cancelBill(billNo))

export const reprintBill = createAsyncThunk('bills/reprint', (billNo: string) => mockApi.reprintBill(billNo))

const billsSlice = createSlice({
  name: 'bills',
  initialState: {
    items: structuredClone(seedBills) as Bill[],
    nextNumber: seedShop.nextInvoiceNumber,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBill.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.nextNumber += 1
      })
      .addCase(cancelBill.fulfilled, (state, action) => {
        const bill = state.items.find((item) => item.billNo === action.payload)
        if (!bill) return
        bill.status = 'Cancelled'
        bill.paymentMethod = null
      })
      .addCase(reprintBill.fulfilled, (state, action) => {
        const bill = state.items.find((item) => item.billNo === action.payload)
        if (bill) bill.reprintCount += 1
      })
  },
})

export default billsSlice.reducer
