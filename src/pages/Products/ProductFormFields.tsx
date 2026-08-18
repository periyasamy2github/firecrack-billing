import { MenuItem, TextField } from '@mui/material'
import { productCategories } from '../../data/mockProducts'
import type { ProductFormValues } from './productFormSchema'
import styles from './ProductFormFields.module.css'

interface ProductFormFieldsProps {
  values: ProductFormValues
  errors: Partial<Record<keyof ProductFormValues, string>>
  onChange: (key: keyof ProductFormValues, value: string) => void
}

export const ProductFormFields = ({ values, errors, onChange }: ProductFormFieldsProps) => {
  const field = (key: keyof ProductFormValues) => ({
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(key, e.target.value),
    error: Boolean(errors[key]),
    helperText: errors[key] || ' ',
    size: 'small' as const,
    fullWidth: true,
  })

  return (
    <div className={styles.grid}>
      <TextField label="Barcode" {...field('code')} />
      <TextField label="Name" {...field('name')} />
      <TextField label="Category" select {...field('category')}>
        {productCategories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
      </TextField>
      <TextField label="Unit" {...field('unit')} placeholder="packet, box of 10…" />
      <TextField label="MRP (₹)" {...field('mrp')} />
      <TextField label="Rate (₹)" {...field('rate')} />
      <TextField label="GST %" {...field('gstRate')} />
      <TextField label="Stock" {...field('stock')} />
    </div>
  )
}
