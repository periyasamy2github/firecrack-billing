import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../services/api'
import type { Customer } from '../types'

export const loadCustomers = createAsyncThunk('customers/load', () => api.loadCustomers())

const customersSlice = createSlice({
  name: 'customers',
  initialState: { items: [] as Customer[] },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadCustomers.fulfilled, (state, action) => {
      state.items = action.payload
    })
  },
})

export default customersSlice.reducer
