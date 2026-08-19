import { useDispatch } from '../redux/store'
import { showToast, type ToastSeverity } from '../redux/uiSlice'

export const useToast = () => {
  const dispatch = useDispatch()
  return (message: string, severity: ToastSeverity = 'success') => dispatch(showToast({ message, severity }))
}
