import { useState } from 'react'
import { z } from 'zod'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { useFormValidation } from '../../hooks/useFormValidation'
import type { Branch } from '../../types'
import styles from './Counters.module.css'

const counterSchema = z.object({
  name: z.string().trim().min(1, 'Counter name is required'),
})

interface CounterDialogProps {
  open: boolean
  counter: Branch | null
  onClose: () => void
  onSubmit: (counter: Branch) => void
}

export const CounterDialog = ({ open, counter, onClose, onSubmit }: CounterDialogProps) => {
  const [name, setName] = useState(counter?.name ?? '')
  const { errors, validate, clearError } = useFormValidation(counterSchema)

  const submit = () => {
    if (!validate({ name })) return
    onSubmit(counter
      ? { ...counter, name: name.trim() }
      : { id: `c${Date.now()}`, name: name.trim(), active: true })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{counter ? 'Edit counter' : 'Add counter'}</DialogTitle>
      <DialogContent className={styles.dialogContentTop}>
        <TextField
          label="Counter name"
          value={name}
          onChange={(e) => { setName(e.target.value); clearError('name') }}
          fullWidth
          autoFocus
          required
          className={styles.nameField}
          placeholder="e.g. Counter 4 — Gift desk"
          error={Boolean(errors.name)}
          helperText={errors.name || ' '}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit}>{counter ? 'Save changes' : 'Add counter'}</Button>
      </DialogActions>
    </Dialog>
  )
}
