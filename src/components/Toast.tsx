import { Alert, Snackbar, type AlertColor } from '@mui/material'

interface ToastProps {
  open: boolean
  message: string
  onClose: () => void
  severity?: AlertColor
}

export const Toast = ({ open, message, onClose, severity = 'success' }: ToastProps) => (
  <Snackbar open={open} autoHideDuration={3000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
    <Alert onClose={onClose} severity={severity}>
      {message}
    </Alert>
  </Snackbar>
)
