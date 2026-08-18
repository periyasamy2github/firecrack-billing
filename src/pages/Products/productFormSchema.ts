import { z } from 'zod'
import { productCategories } from '../../data/mockProducts'
import type { Product, ProductCategory } from '../../types'

// HSN and the reorder threshold are still fixed defaults; the GST rate is on the form,
// because it follows the HSN and a shop stocks goods at more than one rate.
const DEFAULT_HSN = '3604 90 00'
const DEFAULT_GST_RATE = 18
const DEFAULT_LOW_STOCK_THRESHOLD = 15

const positiveNumber = (message: string) => z.string().refine((v) => /^\d+(\.\d+)?$/.test(v.trim()) && Number(v) > 0, message)
const nonNegativeNumber = (message: string) => z.string().refine((v) => /^\d+(\.\d+)?$/.test(v.trim()) && Number(v) >= 0, message)

export const productFormSchema = (takenCodes: Set<string>, excludeCode: string | null) =>
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
    .refine((v) => (productCategories as string[]).includes(v.category), { message: 'Pick a category', path: ['category'] })
    .refine((v) => {
      const key = v.code.trim().toUpperCase()
      return key === (excludeCode ?? '') || !takenCodes.has(key)
    }, { message: 'That barcode is already in use', path: ['code'] })

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

// `existing` carries forward the hidden fields when editing, so saving a product never
// resets its real HSN/GST/discount/threshold back to the defaults.
export const fromProductFormValues = (v: ProductFormValues, existing?: Product | null): Product => ({
  code: v.code.trim(),
  name: v.name.trim(),
  category: v.category as ProductCategory,
  unit: v.unit.trim(),
  mrp: Number(v.mrp),
  rate: Number(v.rate),
  gstRate: Number(v.gstRate),
  stock: Number(v.stock),
  hsn: existing?.hsn ?? DEFAULT_HSN,
  lowStockThreshold: existing?.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
})
