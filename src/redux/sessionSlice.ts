import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { branches } from '../data/shop'

export type BranchScope = 'all' | string

export interface SessionState {
  currentUserId: string | null
  activeCounter: string | null
  currentBranchId: BranchScope
}

const SESSION_KEY = 'sparkbill:session:v1'

const emptySession = (): SessionState => ({
  currentUserId: null,
  activeCounter: null,
  currentBranchId: branches[0]?.id ?? 'all',
})

/** Keeps you signed in across a refresh — the guard still re-checks the user is active. */
const loadSession = (): SessionState => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return emptySession()
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return emptySession()
    const candidate = parsed as Partial<SessionState>
    return {
      currentUserId: typeof candidate.currentUserId === 'string' ? candidate.currentUserId : null,
      activeCounter: typeof candidate.activeCounter === 'string' ? candidate.activeCounter : null,
      currentBranchId: typeof candidate.currentBranchId === 'string' ? candidate.currentBranchId : emptySession().currentBranchId,
    }
  } catch {
    return emptySession()
  }
}

export const saveSession = (state: SessionState): void => {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(state))
}

const initialState: SessionState = loadSession()

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCurrentUserId: (state, action: PayloadAction<string | null>) => {
      state.currentUserId = action.payload
    },
    setActiveCounter: (state, action: PayloadAction<string | null>) => {
      state.activeCounter = action.payload
    },
    setCurrentBranchId: (state, action: PayloadAction<BranchScope>) => {
      state.currentBranchId = action.payload
    },
    signOut: (state, action: PayloadAction<BranchScope>) => {
      state.currentUserId = null
      state.activeCounter = null
      state.currentBranchId = action.payload
    },
  },
})

export const { setCurrentUserId, setActiveCounter, setCurrentBranchId, signOut } = sessionSlice.actions
export default sessionSlice.reducer
