import type { Branch, Shop } from '../types'

export const shop: Shop = {
  name: 'Sri Fireworks',
  town: 'Thiruthangal',
  addressLine: '142, Sivakasi Main Road, Virudhunagar — 626130, Tamil Nadu',
  phone: '04562 224 118',
  gstin: 'ABCDEFGH876545',
  stateCode: '33-Tamil Nadu',
  invoicePrefix: 'SMF/26-27/',
  nextInvoiceNumber: 1483,
  declaration: 'Goods once sold will not be taken back. Fireworks to be stored and used per PESO safety norms. Subject to Virudhunagar jurisdiction.',
  seasonTarget: 40_00_000,
}

export const branches: Branch[] = [
  { id: 'c1', name: 'Erode', active: true },
  { id: 'c2', name: 'Chennai', active: true },
  { id: 'c3', name: 'Kovai', active: true },
]

export const counters = branches.map((b) => b.name)
