export interface ColorTokens {
  ink: string
  muted: string
  mutedSoft: string
  bg: string
  card: string
  surface: string
  inset: string
  line: string
  lineSoft: string
  primary: string
  primarySoft: string
  onPrimary: string
  secondary: string
  secondarySoft: string
  ember: string
  emberSoft: string
  emberInk: string
  paid: string
  paidSoft: string
  paidInk: string
  due: string
  dueSoft: string
  dueInk: string
  info: string
  railBg: string
  railFg: string
  railActive: string
  railLine: string
  glowPrimary: string
  gradientBrand: string
}

export const tokens: ColorTokens = {
  ink: '#171A21',
  muted: '#5B6270',
  mutedSoft: '#8890A0',
  bg: '#F7F8FA',
  card: '#FFFFFF',
  surface: '#F1F3F6',
  inset: '#ECEFF3',
  line: '#E1E5EB',
  lineSoft: '#EAEDF1',
  primary: '#2E56B0',
  primarySoft: '#E8EEFA',
  onPrimary: '#FFFFFF',
  secondary: '#9C7423',
  secondarySoft: '#FAF0DC',
  ember: '#96591F',
  emberSoft: '#FAEEDE',
  emberInk: '#6B3F14',
  paid: '#1E7F52',
  paidSoft: '#E3F4EC',
  paidInk: '#155C3B',
  due: '#A93C36',
  dueSoft: '#FAE7E5',
  dueInk: '#7A2823',
  info: '#35529C',
  railBg: '#12151B',
  railFg: '#A7ADBC',
  railActive: '#1C212B',
  railLine: '#262C37',
  glowPrimary: '0 0 14px rgba(46,86,176,0.18)',
  gradientBrand: 'linear-gradient(135deg, #4A73CC 0%, #1F3D82 100%)',
}

export const radius = { sm: 8, md: 10 }

export const fontFamily = {
  sans: '"DM Sans", ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  heading: '"Space Grotesk", "DM Sans", ui-sans-serif, system-ui, sans-serif',
  mono: 'ui-monospace, "Cascadia Mono", "Segoe UI Mono", "SF Mono", Consolas, "Liberation Mono", monospace',
}
