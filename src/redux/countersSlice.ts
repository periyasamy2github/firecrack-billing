import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { branches as seedBranches } from '../data/shop'
import { mockApi } from '../services/mockApi'
import type { Branch } from '../types'

export const saveCounter = createAsyncThunk('counters/save', (counter: Branch) => mockApi.saveCounter(counter))

const countersSlice = createSlice({
  name: 'counters',
  initialState: { items: structuredClone(seedBranches) as Branch[] },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(saveCounter.fulfilled, (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id)
      if (index === -1) state.items.push(action.payload)
      else state.items[index] = action.payload
    })
  },
})

export default countersSlice.reducer
