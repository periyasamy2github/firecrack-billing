import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'nprogress/nprogress.css'
import './index.css'
import App from './App.tsx'
import { ThemeModeProvider } from './theme/ThemeModeContext'
import { Provider } from 'react-redux'
import { store } from './redux/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeModeProvider>
  </StrictMode>,
)
