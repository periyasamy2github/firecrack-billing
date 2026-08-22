import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import type { User } from '../../types'
import { resetPasswordSchema, type ResetPasswordValues } from './userFormSchema'
import styles from '../../css/pages/Users.module.css'

interface ResetPasswordDialogProps {
  user: User | null
  onClose: () => void
  onSubmit: (password: string) => void | Promise<void>
}

export const ResetPasswordDialog = ({ user, onClose, onSubmit }: ResetPasswordDialogProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  return (
    <Dialog open={Boolean(user)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Reset password{user ? ` — ${user.name}` : ''}</DialogTitle>
      <DialogContent className={styles.dialogContentFlex}>
        <TextField
          label="New password"
          type="password"
          {...register('newPassword')}
          fullWidth
          autoFocus
          required
          error={Boolean(errors.newPassword)}
          helperText={errors.newPassword?.message || 'At least 6 characters'}
        />
        <TextField
          label="Confirm new password"
          type="password"
          {...register('confirmPassword')}
          fullWidth
          required
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message || ' '}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(({ newPassword }) => onSubmit(newPassword))}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={14} /> : undefined}
        >
          Reset password
        </Button>
      </DialogActions>
    </Dialog>
  )
}
