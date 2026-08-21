import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../services/api'
import type { Counter } from '../types'
import { loadSession } from './sessionSlice'
import type { RootState } from './store'

export const saveCounter = createAsyncThunk('counters/save', (counter: Counter, { getState }) => {
  const state = getState() as RootState
  const existing = state.counters.items.some((c) => c.id === counter.id)
  return api.saveCounter({ name: counter.name, active: counter.active }, existing ? counter.id : undefined)
})

const upsert = (items: Counter[], incoming: Counter) => {
  const index = items.findIndex((item) => item.id === incoming.id)
  if (index === -1) items.push(incoming)
  else items[index] = incoming
}

const countersSlice = createSlice({
  name: 'counters',
  initialState: { items: [] as Counter[] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadSession.fulfilled, (state, action) => {
        const { user, counters } = action.payload
        // Staff get an empty list; they already know their counter.
        state.items = user.counterId
          ? [{ id: user.counterId, name: user.counter ?? '', active: true }]
          : counters
      })
      .addCase(saveCounter.fulfilled, (state, action) => {
        upsert(state.items, action.payload)
      })
  },
})

export default countersSlice.reducer
