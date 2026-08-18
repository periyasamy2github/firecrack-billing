export const ROUTES = {
  login: '/login',
  selectCounter: '/select-counter',
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

export const billPrintPath = (billNo: string): string => `/bills/${encodeURIComponent(billNo)}/print`
