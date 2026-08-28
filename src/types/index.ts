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
  /** Only present when creating/resetting; the API never returns it. */
  password?: string
  role: UserRole
  /** The one counter a staff member belongs to (null for Super Admin). */
  counterId: string | null
  counter: string | null
  active: boolean
  joinedOn: string
}

export interface Product {
  code: string
  // The same barcode can exist on two counters.
  counterId: string
  counter?: string
  name: string
  // Free text; the dropdown only suggests.
  category: string
  hsn: string
  /** Printed on the box — what the customer compares against. Optional; hidden on bills when absent. */
  mrp: number | null
  /** What the counter actually charges. Sivakasi shops sell well under MRP. */
  rate: number
  gstRate: number
  stock: number
  lowStockThreshold: number
  /** Sum of qty on Paid bills; sent by the products list endpoint only. */
  salesCount?: number
}

export interface BillLineItem {
  lineId: string
  product: Product
  qty: number
}

// Managed from Settings; the billing screen shows the active ones.
export interface PaymentType {
  id: string
  name: string
  active: boolean
  sort: number
}

// One slice of a bill's money: the whole bill for a single-type payment, a part for Mixed.
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
  // Encrypted by the backend; goes in URLs so the raw row id is never exposed.
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
  /** Display label from the backend: one type's name, 'Mixed', or null (e.g. cancelled). */
  paymentMethod: string | null
  status: BillStatus
  reprintCount: number
  /** Set when a saved bill was reworked; shows the "Edited" marker. */
  editedAt: string | null
  editedBy: string | null
  /** Off produces a plain Bill of Supply — no CGST/SGST, no tax columns. */
  gstApplicable: boolean
  billDiscount?: BillDiscount
}

export interface BillTotals {
  mrpValue: number
  /** Whether any line item carries an MRP — MRP rows and savings hide when false. */
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
  /** Applied ₹ — what the totals math uses. */
  discount: number
  /** How the cashier typed it, so bills can show both % and ₹. */
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

// One day's takings for the printable end-of-day statement.
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
