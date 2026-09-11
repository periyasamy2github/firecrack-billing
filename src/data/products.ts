import type { Product } from '../types'
import type { PillTone } from '../components/StatusPill'

// Category suggestions; free text is allowed.
export const productCategories = ['Sparklers', 'Flower Pots', 'Chakkar', 'Rockets', 'Bombs', 'Fancy', 'Gift Boxes']

export const stockStatus = (p: Product): { label: string; tone: PillTone } => {
  if (p.stock <= p.lowStockThreshold / 2) return { label: 'Low', tone: 'due' }
  if (p.stock <= p.lowStockThreshold) return { label: 'Reorder', tone: 'hold' }
  return { label: 'In stock', tone: 'paid' }
}
