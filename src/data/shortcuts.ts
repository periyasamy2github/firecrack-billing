import type { ShortcutGroup } from '../components/ShortcutsDialog'

export const globalShortcuts: ShortcutGroup = {
  title: 'Everywhere',
  items: [
    { key: 'F1', label: 'Show keyboard shortcuts' },
    { key: '?', label: 'Show keyboard shortcuts' },
    { key: 'N', label: 'Go to New Bill' },
    { key: 'D', label: 'Go to Dashboard' },
    { key: 'B', label: 'Go to Bills' },
    { key: 'R', label: 'Go to Reports' },
    { key: 'P', label: 'Go to Products' },
    { key: 'U', label: 'Go to Users', hint: 'Super Admin only' },
    { key: 'S', label: 'Go to Settings', hint: 'Super Admin only' },
  ],
}

export const newBillShortcuts: ShortcutGroup = {
  title: 'New Bill',
  items: [
    { key: 'F2', label: 'Search / scan item', hint: 'Focuses the search bar — your barcode scanner types here directly' },
    { key: 'F3', label: 'Customer name', hint: 'Jumps focus to the customer field' },
    { key: 'F7', label: 'Bill discount', hint: 'Jumps focus to the overall discount field' },
    { key: 'F9', label: 'Save & print' },
    { key: 'F10', label: 'Save without printing' },
  ],
}

export const billsShortcuts: ShortcutGroup = {
  title: 'Bills',
  items: [
    { key: '/', label: 'Search bills', hint: 'By bill number or customer mobile' },
    { key: '1–5', label: 'Switch filter', hint: 'All, Cash, UPI, Card, Cancelled' },
  ],
}

export const productsShortcuts: ShortcutGroup = {
  title: 'Products',
  items: [
    { key: '/', label: 'Search products', hint: 'By code or item name' },
    { key: '1–8', label: 'Switch category' },
  ],
}

export const reportsShortcuts: ShortcutGroup = {
  title: 'Reports',
  items: [
    { key: '/', label: 'Search bills', hint: 'By bill number or customer mobile' },
    { key: '1–5', label: 'Switch filter', hint: 'All, Cash, UPI, Card, Cancelled' },
  ],
}

export const usersShortcuts: ShortcutGroup = {
  title: 'Users',
  items: [{ key: '/', label: 'Search users', hint: 'By name or staff ID' }],
}

export const allShortcutGroups: ShortcutGroup[] = [
  globalShortcuts,
  newBillShortcuts,
  billsShortcuts,
  productsShortcuts,
  usersShortcuts,
  reportsShortcuts,
]
