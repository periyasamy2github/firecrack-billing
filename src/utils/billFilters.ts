// Filter chips: payment types plus Mixed and Cancelled.
export type BillFilter = string

export const billFilters = (paymentTypeNames: string[]): BillFilter[] => ['All', ...paymentTypeNames, 'Mixed', 'Cancelled']
