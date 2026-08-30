import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'nprogress/nprogress.css'
import './index.css'
import './hooks/usePwaInstall'
import App from './App.tsx'
import { ThemeModeProvider } from './theme/ThemeModeContext'
import { Provider } from 'react-redux'
import { ConfirmProvider } from 'material-ui-confirm'
import { store } from './redux/store'

// One confirm dialog for the whole app — pages call useConfirm() instead of owning dialog state.
// No right-click menu inside the installed app; browser tabs keep it.
window.addEventListener('contextmenu', (event) => {
  const installedApp = window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as { standalone?: boolean }).standalone === true
  if (installedApp) event.preventDefault()
})

const confirmDefaults = {
  dialogProps: { maxWidth: 'xs' as const, fullWidth: true },
  confirmationButtonProps: { variant: 'contained' as const, color: 'error' as const },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <Provider store={store}>
        <ConfirmProvider defaultOptions={confirmDefaults}>
          <App />
        </ConfirmProvider>
      </Provider>
    </ThemeModeProvider>
  </StrictMode>,
)
