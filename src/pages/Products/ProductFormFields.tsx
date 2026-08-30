import { useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Autocomplete, TextField } from '@mui/material'
import { productCategories } from '../../data/products'
import { useSelector } from '../../redux/store'
import type { ProductBatchValues, ProductFormValues } from './productFormSchema'
import styles from '../../css/pages/ProductFormFields.module.css'

interface ProductFormFieldsProps {
  index: number
}

export const ProductFormFields = ({ index }: ProductFormFieldsProps) => {
  const { register, control, formState: { errors } } = useFormContext<ProductBatchValues>()
  const rowErrors = errors.products?.[index]
  const products = useSelector((state) => state.products.items)

  const categoryOptions = useMemo(
    () => [...new Set([...productCategories, ...products.map((p) => p.category)])].sort(),
    [products],
  )

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
          <Autocomplete
            freeSolo
            options={categoryOptions}
            value={category.value}
            onChange={(_, v) => category.onChange(v ?? '')}
            onInputChange={(_, v) => category.onChange(v)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                error={Boolean(rowErrors?.category)}
                helperText={rowErrors?.category?.message || ' '}
                size="small"
              />
            )}
            fullWidth
          />
        )}
      />
      <TextField label="MRP (₹) — optional" {...field('mrp')} />
      <TextField label="Rate (₹)" {...field('rate')} />
      <TextField label="GST %" {...field('gstRate')} />
      <TextField label="Stock" {...field('stock')} />
    </div>
  )
}
