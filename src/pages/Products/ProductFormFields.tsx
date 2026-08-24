import { Controller, useFormContext } from 'react-hook-form'
import { MenuItem, TextField } from '@mui/material'
import { productCategories } from '../../data/products'
import type { ProductBatchValues, ProductFormValues } from './productFormSchema'
import styles from '../../css/pages/ProductFormFields.module.css'

interface ProductFormFieldsProps {
  index: number
}

export const ProductFormFields = ({ index }: ProductFormFieldsProps) => {
  const { register, control, formState: { errors } } = useFormContext<ProductBatchValues>()
  const rowErrors = errors.products?.[index]

  const field = (key: keyof ProductFormValues) => ({
    ...register(`products.${index}.${key}`),
    error: Boolean(rowErrors?.[key]),
    helperText: rowErrors?.[key]?.message || ' ',
    size: 'small' as const,
    fullWidth: true,
  })

  return (
    <div className={styles.grid}>
      <TextField label="Barcode" {...field('code')} />
      <TextField label="Name" {...field('name')} />
      <Controller
        name={`products.${index}.category`}
        control={control}
        render={({ field: category }) => (
          <TextField
            label="Category"
            select
            {...category}
            error={Boolean(rowErrors?.category)}
            helperText={rowErrors?.category?.message || ' '}
            size="small"
            fullWidth
          >
            {productCategories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        )}
      />
      <TextField label="Unit" {...field('unit')} placeholder="packet, box of 10…" />
      <TextField label="MRP (₹)" {...field('mrp')} />
      <TextField label="Rate (₹)" {...field('rate')} />
      <TextField label="GST %" {...field('gstRate')} />
      <TextField label="Stock" {...field('stock')} />
    </div>
  )
}
