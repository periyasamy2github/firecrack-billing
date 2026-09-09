import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import type { Counter } from '../../types'
import styles from '../../css/pages/Counters.module.css'

const counterSchema = z.object({
  name: z.string().trim().min(1, 'Branch name is required'),
  code: z.string().trim().min(2, 'At least 2 letters').max(6, 'At most 6 letters').regex(/^[A-Za-z0-9]+$/, 'Letters and digits only'),
  nextNumber: z.string().trim().refine((value) => value === '' || (/^\d+$/.test(value) && Number(value) >= 1), 'Enter a number of at least 1'),
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
    defaultValues: { name: counter?.name ?? '', code: counter?.code ?? '', nextNumber: counter ? String(counter.nextNumber) : '' },
  })

  const save = ({ name, code, nextNumber }: CounterFormValues) =>
    onSubmit(counter
      ? { ...counter, name: name.trim(), code: code.trim().toUpperCase(), nextNumber: nextNumber ? Number(nextNumber) : counter.nextNumber }
      : { id: `c${Date.now()}`, name: name.trim(), code: code.trim().toUpperCase(), nextNumber: nextNumber ? Number(nextNumber) : 1, active: true })

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
        <div className={styles.codeRow}>
          <TextField
            label="Code"
            {...register('code')}
            required
            placeholder="ERD"
            inputProps={{ style: { textTransform: 'uppercase' } }}
            error={Boolean(errors.code)}
            helperText={errors.code?.message || 'Used for per-branch bill numbers, e.g. ERD-001'}
          />
          <TextField
            label="Next bill number"
            {...register('nextNumber')}
            error={Boolean(errors.nextNumber)}
            helperText={errors.nextNumber?.message || 'Optional — runs automatically'}
          />
        </div>
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
