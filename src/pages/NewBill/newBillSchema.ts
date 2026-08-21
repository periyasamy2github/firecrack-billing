import { z } from 'zod'
import type { BillDiscountType } from '../../types'

export interface NewBillFormValues {
  customerMobile: string
  billDiscountValue: string
}

export const newBillSchema = (discountType: BillDiscountType) =>
  z.object({
    customerMobile: z.string(),
    billDiscountValue: z.string(),
  })
    .refine((v) => !v.customerMobile.trim() || /^\d{10}$/.test(v.customerMobile.replace(/\s/g, '')), {
      message: 'Enter a valid 10-digit mobile number', path: ['customerMobile'],
    })
    .refine((v) => !v.billDiscountValue || Number(v.billDiscountValue) > 0, {
      message: 'Discount must be greater than 0', path: ['billDiscountValue'],
    })
    .refine((v) => discountType !== 'percent' || !v.billDiscountValue || Number(v.billDiscountValue) <= 100, {
      message: 'Percent discount cannot exceed 100', path: ['billDiscountValue'],
    })
