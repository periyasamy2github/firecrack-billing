import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Bill, Branch, Product, Shop, User } from '../types'
import { loadAppData, type AppData } from '../data/appData'

const initialState: AppData = loadAppData()

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    saveShop: (state, action: PayloadAction<Shop>) => {
      state.shop = action.payload
    },
    saveProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((item) => item.code === action.payload.code)
      if (index === -1) state.products.push(action.payload)
      else state.products[index] = action.payload
    },
    importProducts: (state, action: PayloadAction<Product[]>) => {
      state.products.push(...action.payload)
    },
    saveUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((item) => item.id === action.payload.id)
      if (index === -1) state.users.push(action.payload)
      else state.users[index] = action.payload
    },
    saveBranch: (state, action: PayloadAction<Branch>) => {
      const index = state.branches.findIndex((item) => item.id === action.payload.id)
      if (index === -1) state.branches.push(action.payload)
      else state.branches[index] = action.payload
    },
    billCreated: (state, action: PayloadAction<Bill>) => {
      const bill = action.payload
      state.bills.unshift(bill)
      state.shop.nextInvoiceNumber += 1
      bill.items.forEach((item) => {
        const product = state.products.find((p) => p.code === item.product.code)
        if (product) product.stock -= item.qty
      })
    },
    cancelBill: (state, action: PayloadAction<string>) => {
      const bill = state.bills.find((item) => item.billNo === action.payload)
      if (!bill || bill.status === 'Cancelled') return
      bill.items.forEach((item) => {
        const product = state.products.find((p) => p.code === item.product.code)
        if (product) product.stock += item.qty
      })
      bill.status = 'Cancelled'
      bill.paymentMethod = null
    },
  },
})

export const { saveShop, saveProduct, importProducts, saveUser, saveBranch, billCreated, cancelBill } = dataSlice.actions
export default dataSlice.reducer
