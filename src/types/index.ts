export type UserRole = 'Staff' | 'Super Admin'

export interface Shop {
  name: string
  town: string
  address: string
  phone: string
  gstin: string
  stateCode: string
  invoicePrefix: string
  nextInvoiceNumber: number
  declaration: string
  seasonTarget: number
}

export interface Counter {
  id: string
  name: string
  active: boolean
}

export interface User {
  id: string
  name: string
  initials: string
  staffId: string
  mobile: string
  email: string
  password?: string
  role: UserRole
  counterId: string | null
  counter: string | null
  active: boolean
  joinedOn: string
}

export interface Product {
  code: string
  counterId: string
  counter?: string
  name: string
  category: string
  hsn: string
  mrp: number | null
  rate: number
  gstRate: number
  stock: number
  lowStockThreshold: number
  salesCount?: number
}

export interface BillLineItem {
  lineId: string
  product: Product
  qty: number
}

// Managed from Settings.
export interface PaymentType {
  id: string
  name: string
  active: boolean
  sort: number
}

// One payment slice of a bill.
export interface BillPayment {
  typeId: string
  type: string
  amount: number
}

export type BillStatus = 'Paid' | 'Cancelled'

export type BillDiscountType = 'percent' | 'flat'

export interface BillDiscount {
  type: BillDiscountType
  value: number
}

export interface Bill {
  id: string
  billNo: string
  counterId: string
  date: string
  time: string
  customerName: string
  customerMobile: string
  counter: string
  billedBy: string
  items: BillLineItem[]
  payments: BillPayment[]
  paymentMethod: string | null
  status: BillStatus
  reprintCount: number
  editedAt: string | null
  editedBy: string | null
  gstApplicable: boolean
  billDiscount?: BillDiscount
}

export interface BillTotals {
  mrpValue: number
  hasMrp: boolean
  gross: number
  billDiscountAmount: number
  taxable: number
  cgst: number
  sgst: number
  roundOff: number
  grandTotal: number
  itemCount: number
  qtyCount: number
}

// ---- API shapes (what the Laravel backend sends and receives) ----

// Loaded once at boot from /me.
export interface SessionData {
  user: User
  shop: Shop
  counters: Counter[]
  paymentTypes: PaymentType[]
}

export interface LoginResult {
  token: string
  user: User
}

export interface ImportResult {
  products: Product[]
  created: number
  updated: number
  skipped: number
  errors: { row: number; code: string; message: string }[]
}

// Bill changes echo back the touched products' new stock.
export interface BillMutation {
  bill: Bill
  products: { code: string; counterId: string; stock: number }[]
}

// billNo, status and totals are filled in by the API.
export interface NewBillPayload {
  counterId: string
  customerName: string
  customerMobile: string
  payments: { typeId: string; amount: number }[]
  gstApplicable: boolean
  discount: number
  discountType: BillDiscountType | null
  discountValue: number | null
  items: { code: string; qty: number }[]
}

// Laravel's paginator shape, plus chip tallies and paid totals.
export interface BillsPage {
  data: Bill[]
  meta?: { total: number }
  counts: Record<string, number>
  totals: { discount: number; gst: number; grand: number }
}

// Sent as axios params; anything undefined is not sent.
export interface BillsQuery {
  scope: string
  page?: number
  perPage?: number
  search?: string
  filter?: string
  from?: string
  to?: string
  all?: boolean
}

// Data for the printable daily statement.
export interface DailyStatementData {
  date: string
  counter: string | null
  billCount: number
  sales: number
  discount: number
  gst: number
  cancelledCount: number
  refundCount: number
  paymentTotals: { type: string; amount: number; bills: number }[]
  itemSales: { name: string; qty: number; amount: number }[]
  perCounter: { name: string; bills: number; sales: number }[]
  bills: { billNo: string; time: string; counter: string; customerName: string; billedBy: string; grandTotal: number; payment: string | null; status: string }[]
}

// Worked out by the backend.
export interface DashboardStats {
  sales: number
  billCount: number
  avgBill: number
  gstCollected: number
  trend: { label: string; value: number }[]
  paymentMix: { method: string; amount: number }[]
  topItems: { name: string; amount: number }[]
  recentBills: Bill[]
  perCounter?: { id: string; name: string; sales: number; billCount: number }[]
  seasonSales?: number
}
