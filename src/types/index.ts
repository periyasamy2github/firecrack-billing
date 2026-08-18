export type ProductCategory =
  | 'Sparklers'
  | 'Flower Pots'
  | 'Chakkar'
  | 'Rockets'
  | 'Bombs'
  | 'Fancy'
  | 'Gift Boxes'

export type UserRole = 'Counter Staff' | 'Super Admin'

/** The single shop this deployment serves — one GSTIN, one licence, printed on every invoice. */
export interface Shop {
  name: string
  town: string
  addressLine: string
  phone: string
  gstin: string
  stateCode: string
  invoicePrefix: string
  nextInvoiceNumber: number
  declaration: string
  seasonTarget: number
}

/** A billing counter within the shop. Super Admin oversees all of them. */
export interface Branch {
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
  email?: string
  password: string
  role: UserRole
  /** Counters this user can bill from. Empty for Super Admin — they aren't tied to one. */
  counters: string[]
  active: boolean
  joinedOn: string
}

export interface Product {
  code: string
  name: string
  category: ProductCategory
  hsn: string
  unit: string
  mrp: number
  gstRate: number
  stock: number
  lowStockThreshold: number
}

export interface BillLineItem {
  lineId: string
  product: Product
  qty: number
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card'

export type BillStatus = 'Paid' | 'Cancelled'

export type BillDiscountType = 'percent' | 'flat'

export interface BillDiscount {
  type: BillDiscountType
  value: number
}

export interface Bill {
  billNo: string
  branchId: string
  date: string
  time: string
  customerName: string
  customerMobile: string
  counter: string
  billedBy: string
  items: BillLineItem[]
  paymentMethod: PaymentMethod | null
  status: BillStatus
  reprintCount: number
  /** Off produces a plain Bill of Supply — no CGST/SGST, no tax columns. */
  gstApplicable: boolean
  /** The one discount on a bill — the shop's flat festival offer, percent or rupees. */
  billDiscount?: BillDiscount
}

export interface BillTotals {
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
