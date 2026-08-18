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
      // Upsert: a barcode already in the catalogue is updated, not added twice.
      for (const incoming of action.payload) {
        const index = state.products.findIndex((item) => item.code.toUpperCase() === incoming.code.toUpperCase())
        if (index === -1) state.products.push(incoming)
        else state.products[index] = incoming
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((item) => item.code !== action.payload)
    },
    saveUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((item) => item.id === action.payload.id)
      if (index === -1) state.users.push(action.payload)
      else state.users[index] = action.payload
    },
    saveBranch: (state, action: PayloadAction<Branch>) => {
      const index = state.branches.findIndex((item) => item.id === action.payload.id)
      if (index === -1) {
        state.branches.push(action.payload)
        return
      }
      // Users map to counters by name, so a rename has to travel with them or
      // their mapping silently points at a counter that no longer exists.
      const previousName = state.branches[index].name
      state.branches[index] = action.payload
      if (previousName !== action.payload.name) {
        for (const user of state.users) {
          user.counters = user.counters.map((counter) => (counter === previousName ? action.payload.name : counter))
        }
      }
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
    billReprinted: (state, action: PayloadAction<string>) => {
      const bill = state.bills.find((item) => item.billNo === action.payload)
      if (bill) bill.reprintCount += 1
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

export const { saveShop, saveProduct, importProducts, deleteProduct, saveUser, saveBranch, billCreated, billReprinted, cancelBill } = dataSlice.actions
export default dataSlice.reducer
