import type { Branch, Shop } from '../types'

// This deployment serves one shop. In production each shop has its own subdomain,
// so there is nothing to pick at login beyond which counter/branch you're working.
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

// Counters. Super Admin oversees and manages all of them; staff are mapped to one or more.
export const branches: Branch[] = [
  { id: 'c1', name: 'Erode', active: true },
  { id: 'c2', name: 'Chennai', active: true },
  { id: 'c3', name: 'Kovai', active: true },
]

// Counter names, derived from the branch list so the two never drift apart.
export const counters = branches.map((b) => b.name)
