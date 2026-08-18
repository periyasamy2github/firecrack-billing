import { Alert, Snackbar } from '@mui/material'
import { useDispatch, useSelector } from '../redux/store'
import { hideToast } from '../redux/uiSlice'

/** The one toast for the whole app. Pages raise messages through useToast(). */
export const GlobalToast = () => {
  const dispatch = useDispatch()
  const { toastId, toastOpen, toastMessage, toastSeverity } = useSelector((state) => state.ui)
  const close = () => dispatch(hideToast())

  return (
    <Snackbar
      key={toastId}
      open={toastOpen}
      autoHideDuration={3000}
      onClose={close}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={close} severity={toastSeverity}>
        {toastMessage}
      </Alert>
    </Snackbar>
  )
}
