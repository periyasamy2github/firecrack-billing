import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { ProductFormFields } from './ProductFormFields'
import { emptyProductForm, fromProductFormValues, productBatchSchema, toProductFormValues, type ProductBatchValues } from './productFormSchema'
import type { Product } from '../../types'
import styles from '../../css/pages/ProductDialog.module.css'

interface ProductDialogProps {
  mode: 'add' | 'edit'
  open: boolean
  onClose: () => void
  product?: Product | null
  existingCodes: Set<string>
  counterId: string
  onSubmit: (rows: Product[]) => void | Promise<void>
}

export const ProductDialog = ({ mode, open, onClose, product, existingCodes, counterId, onSubmit }: ProductDialogProps) => {
  const isAdd = mode === 'add'
  const excludeCode = mode === 'edit' ? product?.code.toUpperCase() ?? null : null

  const form = useForm<ProductBatchValues>({
    resolver: zodResolver(productBatchSchema(existingCodes, excludeCode)),
    defaultValues: { products: [mode === 'edit' && product ? toProductFormValues(product) : emptyProductForm()] },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'products' })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const save = async ({ products }: ProductBatchValues) => {
    await onSubmit(products.map((values) => fromProductFormValues(values, mode === 'edit' ? product ?? null : null, counterId)))
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={isAdd ? 'md' : 'sm'}>
      <DialogTitle>{isAdd ? 'Add products' : `Edit product — ${product?.name}`}</DialogTitle>
      <FormProvider {...form}>
        <DialogContent className={styles.dialogContentTop}>
          {fields.map((row, index) => (
            isAdd ? (
              <div key={row.id} className={styles.rowCard}>
                <div className={styles.rowHeader}>
                  <Typography className={styles.rowLabel}>Product {index + 1}</Typography>
                  {fields.length > 1 && (
                    <Tooltip title="Remove this row">
                      <IconButton size="small" onClick={() => remove(index)}>
                        <DeleteOutlineRoundedIcon className={styles.removeIcon} />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
                <ProductFormFields index={index} showStock />
              </div>
            ) : (
              <ProductFormFields key={row.id} index={index} showStock={false} />
            )
          ))}
          {isAdd && (
            <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => append(emptyProductForm())} className={styles.addRowButton}>
              Add another product
            </Button>
          )}
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button onClick={handleClose} disabled={form.formState.isSubmitting}>Cancel</Button>
          <Button
            variant="contained"
            onClick={form.handleSubmit(save)}
            disabled={form.formState.isSubmitting}
            startIcon={form.formState.isSubmitting ? <CircularProgress size={14} /> : undefined}
          >
            {isAdd ? `Add ${fields.length} product${fields.length === 1 ? '' : 's'}` : 'Save changes'}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  )
}
