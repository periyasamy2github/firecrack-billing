import { useState } from 'react'
import type { z } from 'zod'

type Errors<T> = Partial<Record<keyof T, string>>

/** Validates form values against a Zod schema. Call validate(values) on submit. */
export const useFormValidation = <T extends Record<string, unknown>>(schema: z.ZodType<T>) => {
  const [errors, setErrors] = useState<Errors<T>>({})

  const validate = (values: T): boolean => {
    const result = schema.safeParse(values)
    if (result.success) {
      setErrors({})
      return true
    }
    const next: Errors<T> = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof T
      if (key !== undefined && !next[key]) next[key] = issue.message
    }
    setErrors(next)
    return false
  }

  const clearError = (key: keyof T) => setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  const reset = () => setErrors({})

  return { errors, validate, clearError, reset }
}
