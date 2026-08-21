import { z } from 'zod'
import { productCategories } from '../../data/products'
import type { Product } from '../../types'

const DEFAULT_HSN = '3604 90 00'
const DEFAULT_GST_RATE = 18
const DEFAULT_LOW_STOCK_THRESHOLD = 15

const positiveNumber = (message: string) => z.string().refine((v) => /^\d+(\.\d+)?$/.test(v.trim()) && Number(v) > 0, message)
const nonNegativeNumber = (message: string) => z.string().refine((v) => /^\d+(\.\d+)?$/.test(v.trim()) && Number(v) >= 0, message)

const productFormSchema = (takenCodes: Set<string>, excludeCode: string | null) =>
  z.object({
    code: z.string().trim().min(1, 'Barcode is required'),
    name: z.string().trim().min(1, 'Name is required'),
    category: z.string().trim().min(1, 'Pick a category'),
    unit: z.string().trim().min(1, 'Unit is required'),
    mrp: positiveNumber('MRP must be a positive number'),
    rate: positiveNumber('Rate must be a positive number'),
    gstRate: nonNegativeNumber('GST % must be 0 or more'),
    stock: nonNegativeNumber('Stock must be 0 or more'),
  })
    .refine((v) => productCategories.includes(v.category), { message: 'Pick a category', path: ['category'] })
    .refine((v) => {
      const key = v.code.trim().toUpperCase()
      return key === (excludeCode ?? '') || !takenCodes.has(key)
    }, { message: 'That barcode is already in use', path: ['code'] })

// Codes must also be unique within one batch.
export const productBatchSchema = (takenCodes: Set<string>, excludeCode: string | null) =>
  z.object({
    products: z.array(productFormSchema(takenCodes, excludeCode)),
  }).superRefine((batch, ctx) => {
    const timesUsed = new Map<string, number>()
    for (const row of batch.products) {
      const key = row.code.trim().toUpperCase()
      if (key) timesUsed.set(key, (timesUsed.get(key) ?? 0) + 1)
    }

    batch.products.forEach((row, index) => {
      const key = row.code.trim().toUpperCase()
      if (key && (timesUsed.get(key) ?? 0) > 1) {
        ctx.addIssue({ code: 'custom', message: 'Duplicate code in this batch', path: ['products', index, 'code'] })
      }
    })
  })

export interface ProductBatchValues {
  products: ProductFormValues[]
}

export interface ProductFormValues {
  code: string
  name: string
  category: string
  unit: string
  mrp: string
  rate: string
  gstRate: string
  stock: string
}

export const emptyProductForm = (): ProductFormValues => ({
  code: '', name: '', category: '', unit: '', mrp: '', rate: '', gstRate: String(DEFAULT_GST_RATE), stock: '',
})

export const toProductFormValues = (p: Product): ProductFormValues => ({
  code: p.code,
  name: p.name,
  category: p.category,
  unit: p.unit,
  mrp: String(p.mrp),
  rate: String(p.rate),
  gstRate: String(p.gstRate),
  stock: String(p.stock),
})

// `existing` carries hidden fields forward so editing never resets them.
export const fromProductFormValues = (v: ProductFormValues, existing: Product | null, counterId: string): Product => ({
  code: v.code.trim(),
  counterId: existing?.counterId ?? counterId,
  name: v.name.trim(),
  category: v.category,
  unit: v.unit.trim(),
  mrp: Number(v.mrp),
  rate: Number(v.rate),
  gstRate: Number(v.gstRate),
  stock: Number(v.stock),
  hsn: existing?.hsn ?? DEFAULT_HSN,
  lowStockThreshold: existing?.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
})
