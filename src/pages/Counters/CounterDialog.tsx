import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import type { Counter } from '../../types'
import styles from '../../css/pages/Counters.module.css'

const counterSchema = z.object({
  name: z.string().trim().min(1, 'Branch name is required'),
})

type CounterFormValues = z.infer<typeof counterSchema>

interface CounterDialogProps {
  open: boolean
  counter: Counter | null
  onClose: () => void
  onSubmit: (counter: Counter) => void | Promise<void>
}

export const CounterDialog = ({ open, counter, onClose, onSubmit }: CounterDialogProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CounterFormValues>({
    resolver: zodResolver(counterSchema),
    defaultValues: { name: counter?.name ?? '' },
  })

  const save = ({ name }: CounterFormValues) =>
    onSubmit(counter
      ? { ...counter, name: name.trim() }
      : { id: `c${Date.now()}`, name: name.trim(), active: true })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{counter ? 'Edit branch' : 'Add branch'}</DialogTitle>
      <DialogContent className={styles.dialogContentTop}>
        <TextField
          label="Branch name"
          {...register('name')}
          fullWidth
          autoFocus
          required
          className={styles.nameField}
          placeholder="e.g. Branch 4 — Gift desk"
          error={Boolean(errors.name)}
          helperText={errors.name?.message || ' '}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(save)}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={14} /> : undefined}
        >
          {counter ? 'Save changes' : 'Add branch'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
