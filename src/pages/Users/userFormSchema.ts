import { z } from 'zod'
import type { User, UserRole } from '../../types'

export const userSchema = (users: User[], editingId: string | null, isNew: boolean) =>
  z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
    staffId: z.string().trim().min(1, 'Staff ID is required'),
    mobile: z.string().trim().min(1, 'Mobile is required'),
    password: z.string(),
    confirmPassword: z.string(),
    role: z.enum(['Counter Staff', 'Super Admin']),
    counters: z.array(z.string()),
    active: z.boolean(),
  })
    .refine((v) => v.role !== 'Counter Staff' || v.counters.length > 0, { message: 'Pick at least one counter', path: ['counters'] })
    .refine((v) => !isNew || v.password.length >= 4, { message: 'At least 4 characters', path: ['password'] })
    .refine((v) => !isNew || v.password === v.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
    .refine((v) => !users.some((u) => u.staffId.toLowerCase() === v.staffId.toLowerCase() && u.id !== editingId), { message: 'That staff ID is already in use', path: ['staffId'] })
    .refine((v) => !users.some((u) => u.email.toLowerCase() === v.email.trim().toLowerCase() && u.id !== editingId), { message: 'That email is already in use', path: ['email'] })

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(4, 'At least 4 characters'),
  confirmPassword: z.string(),
}).refine((v) => v.newPassword === v.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export interface UserFormValues {
  name: string
  staffId: string
  mobile: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  counters: string[]
  active: boolean
}

export const emptyUserForm = (): UserFormValues => ({
  name: '',
  staffId: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Counter Staff',
  counters: [],
  active: true,
})

export const toUserFormValues = (user: User): UserFormValues => ({
  name: user.name,
  staffId: user.staffId,
  mobile: user.mobile,
  email: user.email,
  password: '',
  confirmPassword: '',
  role: user.role,
  counters: user.counters,
  active: user.active,
})

const initialsFrom = (name: string): string =>
  name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase()).join('')

// `existing` carries the fields the form never shows, so editing never resets them.
export const fromUserFormValues = (values: UserFormValues, existing: User | null): User => {
  const shared = {
    name: values.name.trim(),
    initials: initialsFrom(values.name),
    staffId: values.staffId.trim(),
    mobile: values.mobile.trim(),
    email: values.email.trim(),
    role: values.role,
    counters: values.role === 'Super Admin' ? [] : values.counters,
  }

  if (existing) return { ...existing, ...shared, active: values.active }

  return {
    ...shared,
    id: `U${Date.now()}`,
    password: values.password,
    active: true,
    joinedOn: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  }
}
