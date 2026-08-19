import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { shop as seedShop } from '../data/shop'
import { mockApi } from '../services/mockApi'
import type { Shop } from '../types'

export const saveShop = createAsyncThunk('shop/save', (shop: Shop) => mockApi.saveShop(shop))

const shopSlice = createSlice({
  name: 'shop',
  initialState: { shop: structuredClone(seedShop) as Shop },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(saveShop.fulfilled, (state, action) => {
      state.shop = action.payload
    })
  },
})

export default shopSlice.reducer
