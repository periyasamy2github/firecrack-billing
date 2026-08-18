import type { User } from '../types'
import { counters } from './shop'

// Demo logins. Names and staff IDs say plainly what each account is for.
// There is no backend yet, so any password is accepted at sign-in.
export const users: User[] = [
  { id: 'U1', name: 'Admin User', initials: 'AU', staffId: 'ADMIN', mobile: '9000000001', email: 'admin@sparkline.app', password: 'admin123', role: 'Super Admin', counters: [], active: true, joinedOn: '02 Jan 2023' },
  { id: 'U2', name: 'Counter User', initials: 'CU', staffId: 'USER', mobile: '9000000002', email: 'user@sparkline.app', password: 'user123', role: 'Counter Staff', counters: [counters[0]], active: true, joinedOn: '14 Jun 2023' },
  { id: 'U3', name: 'Multi Counter User', initials: 'MU', staffId: 'MULTI', mobile: '9000000003', password: 'multi123', role: 'Counter Staff', counters: [counters[0], counters[1]], active: true, joinedOn: '03 Sep 2023' },
  { id: 'U4', name: 'Wholesale User', initials: 'WU', staffId: 'WHOLESALE', mobile: '9000000004', password: 'wholesale123', role: 'Counter Staff', counters: [counters[2]], active: true, joinedOn: '21 Nov 2023' },
  { id: 'U5', name: 'Inactive User', initials: 'IU', staffId: 'INACTIVE', mobile: '9000000005', password: 'inactive123', role: 'Counter Staff', counters: [counters[0]], active: false, joinedOn: '09 Feb 2024' },
]
