import type { Product } from '../../types'

// The backend decides update vs create per row.
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
