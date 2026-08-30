import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning'

interface UiState {
  toastId: number
  toastOpen: boolean
  toastMessage: string
  toastSeverity: ToastSeverity
}

const initialState: UiState = {
  toastId: 0,
  toastOpen: false,
  toastMessage: '',
  toastSeverity: 'success',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<{ message: string; severity?: ToastSeverity }>) => {
      state.toastId += 1
      state.toastOpen = true
      state.toastMessage = action.payload.message
      state.toastSeverity = action.payload.severity ?? 'success'
    },
    hideToast: (state) => {
      state.toastOpen = false
    },
  },
})

export const { showToast, hideToast } = uiSlice.actions
export default uiSlice.reducer
