// A chip per payment type plus the two fixed ones; type names come from Settings.
export type BillFilter = string

export const billFilters = (paymentTypeNames: string[]): BillFilter[] => ['All', ...paymentTypeNames, 'Cancelled']
