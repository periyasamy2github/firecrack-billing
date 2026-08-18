import { type ReactNode } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { buildMuiTheme } from './muiTheme'
import { tokens } from './tokens'

const theme = buildMuiTheme()

export const ThemeModeProvider = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
)

export const useTokens = () => tokens
