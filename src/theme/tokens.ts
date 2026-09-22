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
  ink: '#0F172A',
  muted: '#475569',
  mutedSoft: '#64748B',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  surface: '#F1F5F9',
  inset: '#E9EEF3',
  line: '#E2E8F0',
  lineSoft: '#EDF2F7',
  primary: '#2563EB',
  primarySoft: '#DBEAFE',
  onPrimary: '#FFFFFF',
  secondary: '#7C3AED',
  secondarySoft: '#EDE9FE',
  ember: '#D97706',
  emberSoft: '#FEF3C7',
  emberInk: '#92400E',
  paid: '#059669',
  paidSoft: '#D1FAE5',
  paidInk: '#065F46',
  due: '#DC2626',
  dueSoft: '#FEE2E2',
  dueInk: '#991B1B',
  info: '#0284C7',
  railBg: '#172554',
  railFg: '#A5B4D9',
  railActive: '#1E3A8A',
  railLine: '#2B4390',
  glowPrimary: '0 0 14px rgba(37,99,235,0.20)',
  gradientBrand: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
}

export const radius = { sm: 8, md: 10 }

export const fontFamily = {
  sans: '"DM Sans", ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  heading: '"Space Grotesk", "DM Sans", ui-sans-serif, system-ui, sans-serif',
  mono: 'ui-monospace, "Cascadia Mono", "Segoe UI Mono", "SF Mono", Consolas, "Liberation Mono", monospace',
}
