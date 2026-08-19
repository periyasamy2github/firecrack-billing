import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { useFormValidation } from '../../hooks/useFormValidation'
import type { User } from '../../types'
import { resetPasswordSchema } from './userFormSchema'
import styles from './Users.module.css'

interface ResetPasswordDialogProps {
  user: User | null
  onClose: () => void
  onSubmit: (password: string) => void
}

export const ResetPasswordDialog = ({ user, onClose, onSubmit }: ResetPasswordDialogProps) => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { errors, validate, clearError } = useFormValidation(resetPasswordSchema)

  const submit = () => {
    if (!validate({ newPassword, confirmPassword })) return
    onSubmit(newPassword)
  }

  return (
    <Dialog open={Boolean(user)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Reset password{user ? ` — ${user.name}` : ''}</DialogTitle>
      <DialogContent className={styles.dialogContentFlex}>
        <TextField
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => { setNewPassword(e.target.value); clearError('newPassword') }}
          fullWidth
          autoFocus
          required
          error={Boolean(errors.newPassword)}
          helperText={errors.newPassword || 'At least 4 characters'}
        />
        <TextField
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword') }}
          fullWidth
          required
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword || ' '}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit}>Reset password</Button>
      </DialogActions>
    </Dialog>
  )
}
