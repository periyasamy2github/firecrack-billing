import { useRef, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { ProductFormFields } from './ProductFormFields'
import { emptyProductForm, fromProductFormValues, productFormSchema, toProductFormValues, type ProductFormValues } from './productFormSchema'
import type { Product } from '../../types'
import styles from './ProductDialog.module.css'

interface DraftRow {
  id: number
  values: ProductFormValues
  errors: Partial<Record<keyof ProductFormValues, string>>
}

interface ProductDialogProps {
  mode: 'add' | 'edit'
  open: boolean
  onClose: () => void
  product?: Product | null
  existingCodes: Set<string>
  onSubmit: (rows: Product[]) => void
}

const startingRows = (mode: 'add' | 'edit', product: Product | null | undefined, nextId: () => number): DraftRow[] => [
  { id: nextId(), values: mode === 'edit' && product ? toProductFormValues(product) : emptyProductForm(), errors: {} },
]

export const ProductDialog = ({ mode, open, onClose, product, existingCodes, onSubmit }: ProductDialogProps) => {
  const nextRowId = useRef(1)
  const [rows, setRows] = useState<DraftRow[]>(() => startingRows(mode, product, () => nextRowId.current++))

  const resetRows = () => {
    nextRowId.current = 1
    setRows(startingRows(mode, product, () => nextRowId.current++))
  }

  const handleClose = () => {
    resetRows()
    onClose()
  }

  const addRow = () => {
    setRows((prev) => [...prev, { id: nextRowId.current++, values: emptyProductForm(), errors: {} }])
  }

  const removeRow = (id: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))
  }

  const updateRow = (id: number, key: keyof ProductFormValues, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id
      ? { ...r, values: { ...r.values, [key]: value }, errors: { ...r.errors, [key]: undefined } }
      : r)))
  }

  const excludeCode = mode === 'edit' ? product?.code.toUpperCase() ?? null : null

  const validateAll = (): DraftRow[] | null => {
    const codeCounts = new Map<string, number>()
    rows.forEach((r) => {
      const key = r.values.code.trim().toUpperCase()
      if (key) codeCounts.set(key, (codeCounts.get(key) ?? 0) + 1)
    })

    let allValid = true
    const schema = productFormSchema(existingCodes, excludeCode)
    const validated = rows.map((r) => {
      const result = schema.safeParse(r.values)
      const errors: Partial<Record<keyof ProductFormValues, string>> = {}
      if (!result.success) {
        for (const issue of result.error.issues) {
          const key = issue.path[0] as keyof ProductFormValues
          if (key && !errors[key]) errors[key] = issue.message
        }
      }
      const codeKey = r.values.code.trim().toUpperCase()
      if (codeKey && (codeCounts.get(codeKey) ?? 0) > 1 && !errors.code) {
        errors.code = 'Duplicate code in this batch'
      }
      if (Object.keys(errors).length > 0) allValid = false
      return { ...r, errors }
    })

    setRows(validated)
    return allValid ? validated : null
  }

  const handleSubmit = () => {
    const validated = validateAll()
    if (!validated) return
    onSubmit(validated.map((r) => fromProductFormValues(r.values, mode === 'edit' ? product : null)))
    resetRows()
    onClose()
  }

  const isAdd = mode === 'add'

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={isAdd ? 'md' : 'sm'}>
      <DialogTitle>{isAdd ? 'Add products' : `Edit product — ${product?.name}`}</DialogTitle>
      <DialogContent className={styles.dialogContentTop}>
        {rows.map((row, idx) => (
          isAdd ? (
            <div key={row.id} className={styles.rowCard}>
              <div className={styles.rowHeader}>
                <Typography className={styles.rowLabel}>Product {idx + 1}</Typography>
                {rows.length > 1 && (
                  <Tooltip title="Remove this row">
                    <IconButton size="small" onClick={() => removeRow(row.id)}>
                      <DeleteOutlineRoundedIcon className={styles.removeIcon} />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
              <ProductFormFields values={row.values} errors={row.errors} onChange={(key, value) => updateRow(row.id, key, value)} />
            </div>
          ) : (
            <ProductFormFields key={row.id} values={row.values} errors={row.errors} onChange={(key, value) => updateRow(row.id, key, value)} />
          )
        ))}
        {isAdd && (
          <Button size="small" startIcon={<AddRoundedIcon />} onClick={addRow} className={styles.addRowButton}>
            Add another product
          </Button>
        )}
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isAdd ? `Add ${rows.length} product${rows.length === 1 ? '' : 's'}` : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
