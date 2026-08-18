import { configureStore } from '@reduxjs/toolkit'
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector, type TypedUseSelectorHook } from 'react-redux'
import { saveAppData } from '../data/appData'
import dataReducer from './dataSlice'
import sessionReducer, { saveSession } from './sessionSlice'

export const store = configureStore({
  reducer: {
    data: dataReducer,
    session: sessionReducer,
  },
})

store.subscribe(() => {
  const state = store.getState()
  saveAppData(state.data)
  saveSession(state.session)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useDispatch = () => useReduxDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector
