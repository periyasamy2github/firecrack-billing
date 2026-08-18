import type { Bill, Branch, Product, Shop, User } from '../types'
import { bills as seedBills } from './mockBills'
import { products as seedProducts } from './mockProducts'
import { branches as seedBranches, shop as seedShop } from './shop'
import { users as seedUsers } from './users'

export interface AppData {
  version: 2
  shop: Shop
  branches: Branch[]
  users: User[]
  products: Product[]
  bills: Bill[]
}

const STORAGE_KEY = 'sparkline-billing:data:v2'

const seedAppData = (): AppData => structuredClone({
  version: 2 as const,
  shop: seedShop,
  branches: seedBranches,
  users: seedUsers,
  products: seedProducts,
  bills: seedBills,
})

const isAppData = (value: unknown): value is AppData => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AppData>
  return candidate.version === 2
    && Array.isArray(candidate.branches)
    && Array.isArray(candidate.users)
    && Array.isArray(candidate.products)
    && Array.isArray(candidate.bills)
    && Boolean(candidate.shop)
}

/** Browser persistence for this standalone demo. Replace with API calls in a multi-user deployment. */
export const loadAppData = (): AppData => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedAppData()
    const parsed: unknown = JSON.parse(raw)
    return isAppData(parsed) ? parsed : seedAppData()
  } catch {
    return seedAppData()
  }
}

export const saveAppData = (data: AppData): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
