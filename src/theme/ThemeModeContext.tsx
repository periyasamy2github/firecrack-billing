import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { useSelector } from '../redux/store'
import { THEME_CACHE_KEY } from '../redux/shopSlice'
import { buildMuiTheme } from './muiTheme'
import { tokens, type ColorTokens } from './tokens'
import { resolveTheme, type ThemePreset } from './themePresets'

const TokensContext = createContext<ColorTokens>(tokens)

const cssVars = (preset: ThemePreset): Record<string, string> => ({
  '--primary': preset.primary,
  '--primary-soft': preset.primarySoft,
  '--glow-primary': preset.glowPrimary,
  '--gradient-brand': preset.gradientBrand,
  '--rail-bg': preset.railBg,
  '--rail-fg': preset.railFg,
  '--rail-active': preset.railActive,
  '--rail-line': preset.railLine,
})

// Applies the shop-wide theme from /me: swaps the accent + rail tokens for MUI
// and the data-theme attribute for the CSS-variable side. A custom theme has no
// static CSS block, so its derived values are written as inline variables.
export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
  const themeName = useSelector((state) => state.shop.shop.theme)
  const themeColor = useSelector((state) => state.shop.shop.themeColor)
  const themeRailColor = useSelector((state) => state.shop.shop.themeRailColor)
  const preset = useMemo(() => resolveTheme(themeName, themeColor, themeRailColor), [themeName, themeColor, themeRailColor])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = preset.id
    const vars = cssVars(preset)
    if (preset.id === 'custom') {
      Object.entries(vars).forEach(([name, value]) => root.style.setProperty(name, value))
    } else {
      Object.keys(vars).forEach((name) => root.style.removeProperty(name))
    }
    // Keeps the Android/PWA status bar matched to the rail.
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', preset.railBg)
  }, [preset])

  useEffect(() => {
    window.localStorage.setItem(THEME_CACHE_KEY, JSON.stringify({ theme: themeName, themeColor, themeRailColor }))
  }, [themeName, themeColor, themeRailColor])

  const activeTokens = useMemo<ColorTokens>(() => ({
    ...tokens,
    primary: preset.primary,
    primarySoft: preset.primarySoft,
    glowPrimary: preset.glowPrimary,
    gradientBrand: preset.gradientBrand,
    railBg: preset.railBg,
    railFg: preset.railFg,
    railActive: preset.railActive,
    railLine: preset.railLine,
  }), [preset])

  const theme = useMemo(() => buildMuiTheme(activeTokens), [activeTokens])

  return (
    <TokensContext.Provider value={activeTokens}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </TokensContext.Provider>
  )
}

export const useTokens = () => useContext(TokensContext)
