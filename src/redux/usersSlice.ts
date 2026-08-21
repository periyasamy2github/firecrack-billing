import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../services/api'
import type { User } from '../types'
import type { RootState } from './store'

// Users page only; boot never loads the full staff list.
export const loadUsers = createAsyncThunk('users/load', () => api.loadUsers())

export const saveUser = createAsyncThunk('users/save', (user: User, { getState }) => {
  const state = getState() as RootState
  const counterId = user.role === 'Super Admin' ? null : user.counterId

  const payload: Record<string, unknown> = {
    name: user.name,
    initials: user.initials,
    staffId: user.staffId,
    mobile: user.mobile,
    email: user.email,
    role: user.role,
    active: user.active,
    joinedOn: user.joinedOn,
    counterId,
  }
  if (user.password) payload.password = user.password

  const existing = state.users.items.some((u) => u.id === user.id)
  return api.saveUser(existing ? user.id : null, payload)
})

const upsert = (items: User[], incoming: User) => {
  const index = items.findIndex((item) => item.id === incoming.id)
  if (index === -1) items.push(incoming)
  else items[index] = incoming
}

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [] as User[] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(saveUser.fulfilled, (state, action) => {
        upsert(state.items, action.payload)
      })
  },
})

export default usersSlice.reducer
