import { Snackbar } from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import InfoRoundedIcon from '@mui/icons-material/InfoRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import type { SvgIconComponent } from '@mui/icons-material'
import { useDispatch, useSelector } from '../redux/store'
import { hideToast, type ToastSeverity } from '../redux/uiSlice'
import styles from '../css/components/GlobalToast.module.css'

const TOAST_ICON: Record<ToastSeverity, SvgIconComponent> = {
  success: CheckCircleRoundedIcon,
  error: ErrorRoundedIcon,
  warning: WarningRoundedIcon,
  info: InfoRoundedIcon,
}

export const GlobalToast = () => {
  const dispatch = useDispatch()
  const { toastId, toastOpen, toastMessage, toastSeverity } = useSelector((state) => state.ui)
  const close = () => dispatch(hideToast())
  const Icon = TOAST_ICON[toastSeverity]

  return (
    <Snackbar
      key={toastId}
      open={toastOpen}
      autoHideDuration={3500}
      onClose={close}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <div className={`${styles.toast} ${styles[toastSeverity]}`} role="alert">
        <Icon className={styles.icon} />
        <span className={styles.message}>{toastMessage}</span>
        <button type="button" className={styles.close} onClick={close} aria-label="Close notification">
          <CloseRoundedIcon className={styles.closeIcon} />
        </button>
      </div>
    </Snackbar>
  )
}
