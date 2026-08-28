import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../services/api'
import { loadSession } from './sessionSlice'
import type { PaymentType } from '../types'

export const savePaymentType = createAsyncThunk(
  'paymentTypes/save',
  (payload: { id?: string; name: string; active: boolean }) =>
    api.savePaymentType({ name: payload.name, active: payload.active }, payload.id),
)

const paymentTypesSlice = createSlice({
  name: 'paymentTypes',
  initialState: { items: [] as PaymentType[] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadSession.fulfilled, (state, action) => {
        state.items = action.payload.paymentTypes
      })
      .addCase(savePaymentType.fulfilled, (state, action) => {
        const index = state.items.findIndex((type) => type.id === action.payload.id)
        if (index >= 0) state.items[index] = action.payload
        else state.items.push(action.payload)
      })
  },
})

export default paymentTypesSlice.reducer
