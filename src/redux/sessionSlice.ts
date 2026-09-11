import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '../services/api'
import type { User } from '../types'

// 'all' or one counter id.
export type CounterScope = 'all' | string

interface SessionState {
  user: User | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  counterScope: CounterScope
}

export const loadSession = createAsyncThunk('session/load', () => api.loadSession())

// Only the counter scope is persisted.
const SCOPE_KEY = 'sparkbill:counter-scope'
const RETIRED_KEYS = ['sparkbill:session:v1', 'sparkbill:view:v1']

const loadCounterScope = (): CounterScope => {
  RETIRED_KEYS.forEach((key) => window.localStorage.removeItem(key))
  return window.localStorage.getItem(SCOPE_KEY) || 'all'
}

export const saveCounterScope = ({ counterScope }: SessionState): void => {
  window.localStorage.setItem(SCOPE_KEY, counterScope)
}

const initialState: SessionState = { user: null, status: 'idle', error: null, counterScope: loadCounterScope() }

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCounterScope: (state, action: PayloadAction<CounterScope>) => {
      state.counterScope = action.payload
    },
    signOut: (state) => {
      state.user = null
      state.status = 'idle'
      state.counterScope = 'all'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSession.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.status = 'ready'
        state.user = action.payload.user
      })
      .addCase(loadSession.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.error.message ?? 'Could not load your data'
      })
  },
})

export const { setCounterScope, signOut } = sessionSlice.actions
export default sessionSlice.reducer
