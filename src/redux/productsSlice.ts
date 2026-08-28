import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../services/api'
import type { BillMutation, Product } from '../types'
import { cancelBill, createBill, updateBill } from './billsSlice'

// Each page loads its own catalogue; the boot call does not.
export const loadProducts = createAsyncThunk('products/load', (scope: string) => api.loadProducts(scope))

export const saveProduct = createAsyncThunk(
  'products/save',
  ({ product, counterId }: { product: Product; counterId: string }) => api.saveProduct(product, counterId),
)

export const importProducts = createAsyncThunk(
  'products/import',
  ({ products, counterId }: { products: Product[]; counterId: string }) => api.importProducts(products, counterId),
)

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async ({ code, counterId }: { code: string; counterId: string }) => {
    await api.deleteProduct(code, counterId)
    return { code, counterId }
  },
)

// A barcode is unique only within its counter.
const isSame = (a: Product, b: { code: string; counterId: string }) =>
  a.code.toUpperCase() === b.code.toUpperCase() && a.counterId === b.counterId

const upsert = (items: Product[], incoming: Product) => {
  const index = items.findIndex((item) => isSame(item, incoming))
  if (index === -1) items.push(incoming)
  else items[index] = incoming
}

const applyStock = (items: Product[], changes: BillMutation['products']) => {
  for (const change of changes) {
    const product = items.find((item) => isSame(item, change))
    if (product) product.stock = change.stock
  }
}

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [] as Product[] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(saveProduct.fulfilled, (state, action) => {
        upsert(state.items, action.payload)
      })
      .addCase(importProducts.fulfilled, (state, action) => {
        for (const incoming of action.payload.products) upsert(state.items, incoming)
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => !isSame(item, action.payload))
      })
      // Bills echo back the new stock.
      .addCase(createBill.fulfilled, (state, action) => applyStock(state.items, action.payload.products))
      .addCase(updateBill.fulfilled, (state, action) => applyStock(state.items, action.payload.products))
      .addCase(cancelBill.fulfilled, (state, action) => applyStock(state.items, action.payload.products))
  },
})

export default productsSlice.reducer
