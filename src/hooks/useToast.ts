import { useDispatch } from '../redux/store'
import { showToast, type ToastSeverity } from '../redux/uiSlice'

/**
 * Raises the app-wide toast. Mounted once in App, so a page just says what
 * happened: showToast('Bill SMF/26-27/1483 cancelled', 'info').
 */
export const useToast = () => {
  const dispatch = useDispatch()
  return (message: string, severity: ToastSeverity = 'success') => dispatch(showToast({ message, severity }))
}
