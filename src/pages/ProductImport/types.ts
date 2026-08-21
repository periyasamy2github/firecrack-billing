import type { Product } from '../../types'

// Whether a row updates or creates a product is the backend's call, made at import time.
export type Outcome = 'ready' | 'error'

export interface ImportRow {
  index: number
  code: string
  name: string
  category: string
  mrp: string
  rate: string
  stock: string
  outcome: Outcome
  product: Product | null
  errors: string[]
}
