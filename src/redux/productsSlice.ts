import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { products as seedProducts } from '../data/mockProducts'
import { mockApi } from '../services/mockApi'
import type { Product } from '../types'

export const saveProduct = createAsyncThunk('products/save', (product: Product) => mockApi.saveProduct(product))

export const importProducts = createAsyncThunk('products/import', (products: Product[]) =>
  mockApi.importProducts(products),
)

export const deleteProduct = createAsyncThunk('products/delete', (code: string) => mockApi.deleteProduct(code))

const upsert = (items: Product[], incoming: Product) => {
  const index = items.findIndex((item) => item.code.toUpperCase() === incoming.code.toUpperCase())
  if (index === -1) items.push(incoming)
  else items[index] = incoming
}

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: structuredClone(seedProducts) as Product[] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveProduct.fulfilled, (state, action) => {
        upsert(state.items, action.payload)
      })
      .addCase(importProducts.fulfilled, (state, action) => {
        for (const incoming of action.payload) upsert(state.items, incoming)
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.code !== action.payload)
      })
  },
})

export default productsSlice.reducer
