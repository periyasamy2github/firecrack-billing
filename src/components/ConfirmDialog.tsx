import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onClose: () => void
}

export const ConfirmDialog = ({ open, title, children, confirmLabel, cancelLabel, onConfirm, onClose }: ConfirmDialogProps) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary">{children}</Typography>
    </DialogContent>
    <DialogActions className={styles.actions}>
      <Button onClick={onClose}>{cancelLabel}</Button>
      <Button variant="contained" color="error" onClick={onConfirm}>{confirmLabel}</Button>
    </DialogActions>
  </Dialog>
)
