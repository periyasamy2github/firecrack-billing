import type { Bill, BillLineItem, PaymentMethod } from '../types'
import { findProduct } from './mockProducts'

let lineSeq = 0
const line = (code: string, qty: number, discountPct?: number): BillLineItem => {
  const product = findProduct(code)
  if (!product) throw new Error(`Unknown product code: ${code}`)
  lineSeq += 1
  return { lineId: `L${lineSeq}`, product, qty, discountPct: discountPct ?? product.defaultDiscountPct }
}

interface BillSpec {
  billNo: string
  time: string
  customerName: string
  customerMobile: string
  items: BillLineItem[]
  paymentMethod: PaymentMethod | null
  status: Bill['status']
  reprintCount?: number
  gstApplicable?: boolean
}

interface BranchBillContext {
  branchId: string
  date: string
  counter: string
  billedBy: string
}

const buildBills = (specs: BillSpec[], ctx: BranchBillContext): Bill[] =>
  specs.map((s) => ({
    billNo: s.billNo,
    branchId: ctx.branchId,
    date: ctx.date,
    time: s.time,
    customerName: s.customerName,
    customerMobile: s.customerMobile,
    counter: ctx.counter,
    billedBy: ctx.billedBy,
    items: s.items,
    paymentMethod: s.paymentMethod,
    status: s.status,
    reprintCount: s.reprintCount ?? 0,
    gstApplicable: s.gstApplicable ?? true,
  }))

const DATE = '10-Nov-2026'

// One invoice series for the whole shop — numbers interleave across counters by time of day.
const counter1Specs: BillSpec[] = [
  {
    billNo: 'SMF/26-27/1480',
    time: '20:38',
    customerName: 'Murugan A.',
    customerMobile: '98431 20055',
    items: [line('LKD-BG', 5), line('FLP-07S', 10), line('BJL-100', 4, 75), line('CHK-15', 6), line('SPK-30', 12, 70), line('RKT-F5', 3)],
    paymentMethod: 'Cash',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1479',
    time: '20:31',
    customerName: 'Walk-in',
    customerMobile: '',
    items: [line('GFT-D40', 2), line('FLP-09J', 6), line('CHK-WHL', 8), line('RKT-WHS', 10), line('TWK-05', 14)],
    paymentMethod: 'UPI',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1477',
    time: '20:24',
    customerName: 'Kavitha R.',
    customerMobile: '94422 71130',
    items: [line('SPK-15', 6), line('TWK-05', 4), line('RKT-SKY', 8)],
    paymentMethod: 'Cash',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1476',
    time: '20:09',
    customerName: 'Selvam Traders',
    customerMobile: '90031 44820',
    items: [line('GFT-F60', 4), line('GFT-D40', 6), line('ATOM-BM', 10), line('FLP-07S', 20), line('CHK-15', 15)],
    paymentMethod: 'Card',
    status: 'Paid',
    reprintCount: 2,
  },
  {
    billNo: 'SMF/26-27/1474',
    time: '19:57',
    customerName: 'Walk-in',
    customerMobile: '',
    items: [line('SPK-30', 5), line('FCY-PEA', 3), line('RKT-F5', 2)],
    paymentMethod: null,
    status: 'Cancelled',
  },
  {
    billNo: 'SMF/26-27/1470',
    time: '19:30',
    customerName: 'Deepa S.',
    customerMobile: '96001 55210',
    items: [line('TWK-05', 8), line('FCY-COL', 4), line('SPK-COL', 5)],
    paymentMethod: 'UPI',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1469',
    time: '19:12',
    customerName: 'Walk-in',
    customerMobile: '',
    items: [line('BJL-100', 6), line('LKD-BG', 3), line('CHK-15', 4)],
    paymentMethod: 'Cash',
    status: 'Paid',
    gstApplicable: false,
  },
  {
    billNo: 'SMF/26-27/1467',
    time: '18:58',
    customerName: 'Ganesh P.',
    customerMobile: '91503 66240',
    items: [line('GFT-D40', 1), line('RKT-WHS', 5), line('FLP-05', 8)],
    paymentMethod: 'Cash',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1464',
    time: '18:40',
    customerName: 'Walk-in',
    customerMobile: '',
    items: [line('SPK-30', 8), line('TWK-05', 6), line('RKT-SKY', 12)],
    paymentMethod: 'UPI',
    status: 'Paid',
  },
]

const counter2Specs: BillSpec[] = [
  {
    billNo: 'SMF/26-27/1473',
    time: '19:52',
    customerName: 'Pandi R.',
    customerMobile: '98765 43210',
    items: [line('SPK-15', 8), line('TWK-05', 6), line('CHK-10', 4)],
    paymentMethod: 'Cash',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1471',
    time: '19:35',
    customerName: 'Walk-in',
    customerMobile: '',
    items: [line('FLP-05', 5), line('RKT-SKY', 10)],
    paymentMethod: 'UPI',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1468',
    time: '19:10',
    customerName: 'Saravanan K.',
    customerMobile: '90441 22876',
    items: [line('BJL-100', 3), line('SPK-30', 6), line('FCY-COL', 2)],
    paymentMethod: 'Cash',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1465',
    time: '18:44',
    customerName: 'Walk-in',
    customerMobile: '',
    items: [line('GFT-MN20', 2), line('TWK-05', 4)],
    paymentMethod: 'Card',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1462',
    time: '17:58',
    customerName: 'Muthu Traders',
    customerMobile: '94860 11239',
    items: [line('GFT-D40', 3), line('LKD-BG', 4), line('BJL-100', 5)],
    paymentMethod: 'UPI',
    status: 'Paid',
  },
]

const counter3Specs: BillSpec[] = [
  {
    billNo: 'SMF/26-27/1482',
    time: '21:02',
    customerName: 'Elumalai S.',
    customerMobile: '99765 30021',
    items: [line('GFT-F60', 6), line('GFT-D40', 8), line('ATOM-BM', 14), line('FLP-09J', 10)],
    paymentMethod: 'Card',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1481',
    time: '20:48',
    customerName: 'Walk-in',
    customerMobile: '',
    items: [line('SPK-30', 14), line('TWK-05', 10), line('RKT-WHS', 6)],
    paymentMethod: 'Cash',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1478',
    time: '20:30',
    customerName: 'Bhuvaneswari T.',
    customerMobile: '96290 44718',
    items: [line('CHK-15', 8), line('FLP-07S', 12), line('BJL-100', 6)],
    paymentMethod: 'UPI',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1475',
    time: '20:05',
    customerName: 'Rajapalayam Sri Traders',
    customerMobile: '97510 66200',
    items: [line('GFT-D40', 10), line('GFT-MN20', 8), line('ATOM-BM', 6)],
    paymentMethod: 'Card',
    status: 'Paid',
    reprintCount: 1,
  },
  {
    billNo: 'SMF/26-27/1472',
    time: '19:40',
    customerName: 'Walk-in',
    customerMobile: '',
    items: [line('SPK-COL', 6), line('FCY-PEA', 4), line('RKT-SKY', 8)],
    paymentMethod: 'Cash',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1466',
    time: '18:52',
    customerName: 'Malar S.',
    customerMobile: '98420 15599',
    items: [line('TWK-05', 12), line('FLP-05', 8), line('SPK-15', 10)],
    paymentMethod: 'UPI',
    status: 'Paid',
  },
  {
    billNo: 'SMF/26-27/1463',
    time: '18:22',
    customerName: 'Walk-in',
    customerMobile: '',
    items: [line('BJL-100', 4), line('RKT-F5', 3)],
    paymentMethod: null,
    status: 'Cancelled',
  },
]

export const bills: Bill[] = [
  ...buildBills(counter1Specs, { branchId: 'c1', date: DATE, counter: 'Counter 1 — Entrance', billedBy: 'Counter User' }),
  ...buildBills(counter2Specs, { branchId: 'c2', date: DATE, counter: 'Counter 2 — Main hall', billedBy: 'Multi Counter User' }),
  ...buildBills(counter3Specs, { branchId: 'c3', date: DATE, counter: 'Counter 3 — Wholesale desk', billedBy: 'Wholesale User' }),
]
