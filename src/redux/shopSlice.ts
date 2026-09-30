import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../services/api'
import type { Shop } from '../types'
import { loadSession } from './sessionSlice'
import { createBill } from './billsSlice'

// Last applied theme, so the login page wears the shop's look before /me loads.
export const THEME_CACHE_KEY = 'agnibooks:theme'

const cachedTheme = (): Pick<Shop, 'theme' | 'themeColor' | 'themeRailColor'> => {
  try {
    const raw = window.localStorage.getItem(THEME_CACHE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* unreadable cache falls back to the default theme */ }
  return { theme: 'corporate', themeColor: '', themeRailColor: '' }
}

const emptyShop: Shop = {
  name: '', town: '', address: '', phone: '', gstin: '', stateCode: '',
  invoicePrefix: '', nextInvoiceNumber: 0,
  numberingMode: 'shop', declaration: '', seasonTarget: 0,
  ...cachedTheme(),
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
      .addCase(createBill.fulfilled, (state) => {
        state.shop.nextInvoiceNumber += 1
      })
  },
})

export default shopSlice.reducer
