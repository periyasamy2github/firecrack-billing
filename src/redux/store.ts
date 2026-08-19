import { configureStore } from '@reduxjs/toolkit'
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector, type TypedUseSelectorHook } from 'react-redux'
import billsReducer from './billsSlice'
import countersReducer from './countersSlice'
import productsReducer from './productsSlice'
import sessionReducer, { saveSession } from './sessionSlice'
import shopReducer from './shopSlice'
import uiReducer from './uiSlice'
import usersReducer from './usersSlice'

export const store = configureStore({
  reducer: {
    shop: shopReducer,
    counters: countersReducer,
    users: usersReducer,
    products: productsReducer,
    bills: billsReducer,
    session: sessionReducer,
    ui: uiReducer,
  },
})

store.subscribe(() => saveSession(store.getState().session))

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useDispatch = () => useReduxDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector
