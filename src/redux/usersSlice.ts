import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { users as seedUsers } from '../data/users'
import { mockApi } from '../services/mockApi'
import type { User } from '../types'

export const saveUser = createAsyncThunk('users/save', (user: User) => mockApi.saveUser(user))

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: structuredClone(seedUsers) as User[] },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(saveUser.fulfilled, (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id)
      if (index === -1) state.items.push(action.payload)
      else state.items[index] = action.payload
    })
  },
})

export default usersSlice.reducer
