export const ROUTES = {
  login: '/login',
  dashboard: '/',
  newBill: '/bills/new',
  bills: '/bills',
  reports: '/reports',
  products: '/products',
  productImport: '/products/import',
  users: '/users',
  counters: '/counters',
  settings: '/settings',
  unauthorized: '/unauthorized',
}

export const billPrintPath = (billId: string): string => `/bills/${encodeURIComponent(billId)}/print`
