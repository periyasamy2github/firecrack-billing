import type { Bill, Branch, Product, Shop, User } from '../types'

/** Stand-in for the server: resolves after a beat. Swap for real HTTP calls later. */
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
