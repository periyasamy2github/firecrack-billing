import type { ThemeName } from '../types'

// Full-skin presets: each carries its accent family AND a matching dark rail
// (sidebar / mobile header). Neutrals and status colors never change.
// The CSS mirror of each preset lives in index.css under :root[data-theme='...'].
export interface ThemePreset {
  id: ThemeName
  label: string
  primary: string
  primarySoft: string
  glowPrimary: string
  gradientBrand: string
  railBg: string
  railFg: string
  railActive: string
  railLine: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'corporate',
    label: 'Corporate Blue',
    primary: '#1E40AF',
    primarySoft: '#E8EFF6',
    glowPrimary: '0 0 14px rgba(30,64,175,0.20)',
    gradientBrand: 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)',
    railBg: '#0F172A',
    railFg: '#94A3B8',
    railActive: '#1E293B',
    railLine: '#334155',
  },
  {
    id: 'royal',
    label: 'Royal Blue',
    primary: '#2563EB',
    primarySoft: '#DBEAFE',
    glowPrimary: '0 0 14px rgba(37,99,235,0.20)',
    gradientBrand: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    railBg: '#172554',
    railFg: '#A5B4D9',
    railActive: '#1E3A8A',
    railLine: '#2B4390',
  },
  {
    id: 'teal',
    label: 'Teal',
    primary: '#0F766E',
    primarySoft: '#CCFBF1',
    glowPrimary: '0 0 14px rgba(15,118,110,0.20)',
    gradientBrand: 'linear-gradient(135deg, #0D9488 0%, #115E59 100%)',
    railBg: '#042F2E',
    railFg: '#9EC3BF',
    railActive: '#134E4A',
    railLine: '#115E59',
  },
  {
    id: 'indigo',
    label: 'Indigo',
    primary: '#4338CA',
    primarySoft: '#E0E7FF',
    glowPrimary: '0 0 14px rgba(67,56,202,0.20)',
    gradientBrand: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
    railBg: '#1E1B4B',
    railFg: '#A5B4FC',
    railActive: '#312E81',
    railLine: '#3730A3',
  },
  {
    id: 'charcoal',
    label: 'Charcoal',
    primary: '#1F2937',
    primarySoft: '#E5E7EB',
    glowPrimary: '0 0 14px rgba(31,41,55,0.20)',
    gradientBrand: 'linear-gradient(135deg, #374151 0%, #111827 100%)',
    railBg: '#111827',
    railFg: '#9CA3AF',
    railActive: '#1F2937',
    railLine: '#374151',
  },
]

export const themePreset = (id: string | undefined): ThemePreset =>
  THEME_PRESETS.find((preset) => preset.id === id) ?? THEME_PRESETS[0]

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const hexToRgb = (hex: string) => {
  const value = parseInt(hex.slice(1), 16)
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}

const rgbaString = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

const hexToHsl = (hex: string) => {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: l * 100 }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === rn ? (gn - bn) / d + (gn < bn ? 6 : 0) : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4
  return { h: h * 60, s: s * 100, l: l * 100 }
}

const hslToHex = (h: number, s: number, l: number) => {
  const sn = s / 100
  const ln = l / 100
  const a = sn * Math.min(ln, 1 - ln)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    const c = ln - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`.toUpperCase()
}

// The left-menu family from one picked color: kept dark enough for white text,
// with active/line/muted-text steps derived from the same hue.
const railFamily = (hex: string) => {
  const { h, s, l } = hexToHsl(hex)
  const railS = clamp(s, 0, 60)
  const bgL = clamp(l, 6, 30)
  return {
    railBg: hslToHex(h, railS, bgL),
    railActive: hslToHex(h, railS, clamp(bgL + 9, 14, 40)),
    railLine: hslToHex(h, railS, clamp(bgL + 17, 22, 48)),
    railFg: hslToHex(h, clamp(s, 8, 30), 72),
  }
}

// Derives a full skin from the picked brand color (and optionally a separate
// left-menu color), the way the fixed presets were hand-tuned: light tint,
// gradient, glow and a dark rail. Lightness is clamped so white text stays
// readable whatever colors are picked.
export const buildCustomPreset = (hex: string, railHex?: string): ThemePreset => {
  const { h, s, l } = hexToHsl(hex)
  const accentL = clamp(l, 20, 55)
  const primary = hslToHex(h, s, accentL)
  return {
    id: 'custom',
    label: 'Custom',
    primary,
    primarySoft: hslToHex(h, clamp(s, 15, 70), 94),
    glowPrimary: `0 0 14px ${rgbaString(primary, 0.2)}`,
    gradientBrand: `linear-gradient(135deg, ${hslToHex(h, s, clamp(accentL + 10, 25, 60))} 0%, ${hslToHex(h, s, clamp(accentL - 10, 12, 45))} 100%)`,
    ...railFamily(railHex && HEX_COLOR.test(railHex) ? railHex : hslToHex(h, clamp(s, 15, 45), 11)),
  }
}

export const resolveTheme = (theme: string | undefined, themeColor: string | undefined, themeRailColor?: string): ThemePreset =>
  theme === 'custom' && HEX_COLOR.test(themeColor ?? '')
    ? buildCustomPreset(themeColor as string, themeRailColor)
    : themePreset(theme)
