import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../services/api'
import type { Shop } from '../types'
import { loadSession } from './sessionSlice'
import { createBill } from './billsSlice'

const emptyShop: Shop = {
  name: '', town: '', address: '', phone: '', gstin: '', stateCode: '',
  invoicePrefix: '', nextInvoiceNumber: 0, declaration: '', seasonTarget: 0,
}

export const saveShop = createAsyncThunk('shop/save', (shop: Shop) => api.saveShop(shop))

const shopSlice = createSlice({
  name: 'shop',
  initialState: { shop: emptyShop },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadSession.fulfilled, (state, action) => {
        state.shop = action.payload.shop
      })
      .addCase(saveShop.fulfilled, (state, action) => {
        state.shop = action.payload
      })
      // Advance locally so New Bill shows the next number.
      .addCase(createBill.fulfilled, (state) => {
        state.shop.nextInvoiceNumber += 1
      })
  },
})

export default shopSlice.reducer
