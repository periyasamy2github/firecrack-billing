import type { Bill, Branch, Product, Shop, User } from '../types'

/**
 * Stand-in for the server. Every call resolves after a beat, so the thunks that
 * use it are genuinely asynchronous. Replace this one file with real HTTP calls
 * when a backend exists — no slice or page needs to change.
 */
const LATENCY_MS = 120

const respond = <T>(value: T): Promise<T> =>
  new Promise((resolve) => window.setTimeout(() => resolve(value), LATENCY_MS))

export const mockApi = {
  saveShop: (shop: Shop) => respond(shop),
  saveProduct: (product: Product) => respond(product),
  importProducts: (products: Product[]) => respond(products),
  deleteProduct: (code: string) => respond(code),
  saveUser: (user: User) => respond(user),
  saveCounter: (counter: Branch) => respond(counter),
  createBill: (bill: Bill) => respond(bill),
  cancelBill: (billNo: string) => respond(billNo),
  reprintBill: (billNo: string) => respond(billNo),
}
