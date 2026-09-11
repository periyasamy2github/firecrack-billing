import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector, type TypedUseSelectorHook } from 'react-redux'
import countersReducer from './countersSlice'
import customersReducer from './customersSlice'
import paymentTypesReducer from './paymentTypesSlice'
import productsReducer from './productsSlice'
import sessionReducer, { saveCounterScope, signOut } from './sessionSlice'
import shopReducer from './shopSlice'
import uiReducer from './uiSlice'
import usersReducer from './usersSlice'

const appReducer = combineReducers({
  session: sessionReducer,
  shop: shopReducer,
  counters: countersReducer,
  customers: customersReducer,
  paymentTypes: paymentTypesReducer,
  users: usersReducer,
  products: productsReducer,
  ui: uiReducer,
})

// Logout resets every slice.
const rootReducer: typeof appReducer = (state, action) => appReducer(signOut.match(action) ? undefined : state, action)

export const store = configureStore({ reducer: rootReducer })

store.subscribe(() => saveCounterScope(store.getState().session))

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useDispatch = () => useReduxDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector
