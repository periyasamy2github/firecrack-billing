import type { User } from '../types'
import { counters } from './shop'

export const users: User[] = [
  { id: 'U1', name: 'Admin User', initials: 'AU', staffId: 'ADMIN', mobile: '9000000001', email: 'admin@sparkbill.app', password: 'admin123', role: 'Super Admin', counters: [], active: true, joinedOn: '02 Jan 2023' },
  { id: 'U2', name: 'Counter User', initials: 'CU', staffId: 'USER', mobile: '9000000002', email: 'user@sparkbill.app', password: 'user123', role: 'Counter Staff', counters: [counters[0]], active: true, joinedOn: '14 Jun 2023' },
  { id: 'U3', name: 'Multi Counter User', initials: 'MU', staffId: 'MULTI', mobile: '9000000003', email: 'multi@sparkbill.app', password: 'multi123', role: 'Counter Staff', counters: [counters[0], counters[1]], active: true, joinedOn: '03 Sep 2023' },
  { id: 'U4', name: 'Jhone Doe', initials: 'JD', staffId: 'STAFF', mobile: '9000000004', email: 'jhone.doe@sparkbill.app', password: 'wholesale123', role: 'Counter Staff', counters: [counters[2]], active: true, joinedOn: '21 Nov 2023' },
  { id: 'U5', name: 'Inactive User', initials: 'IU', staffId: 'INACTIVE', mobile: '9000000005', email: 'inactive@sparkbill.app', password: 'inactive123', role: 'Counter Staff', counters: [counters[0]], active: false, joinedOn: '09 Feb 2024' },
]
