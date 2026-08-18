import { createTheme, type Theme } from '@mui/material/styles'
import { fontFamily, radius, tokens as t } from './tokens'

export const buildMuiTheme = (): Theme =>
  createTheme({
    palette: {
      mode: 'light',
      primary: { main: t.primary, contrastText: t.onPrimary },
      secondary: { main: t.secondary, contrastText: '#241905' },
      success: { main: t.paid, contrastText: '#04210F' },
      error: { main: t.due, contrastText: '#FFFFFF' },
      warning: { main: t.ember, contrastText: '#2A1503' },
      info: { main: t.info, contrastText: '#FFFFFF' },
      background: { default: t.bg, paper: t.card },
      text: { primary: t.ink, secondary: t.muted },
      divider: t.line,
    },
    shape: { borderRadius: radius.md },
    typography: {
      fontFamily: fontFamily.sans,
      fontSize: 13,
      h4: { fontFamily: fontFamily.heading, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontFamily: fontFamily.heading, fontSize: 19, fontWeight: 700, letterSpacing: '-0.015em' },
      h6: { fontFamily: fontFamily.heading, fontSize: 16, fontWeight: 650, letterSpacing: '-0.01em' },
      subtitle1: { fontSize: 13, fontWeight: 640 },
      subtitle2: { fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' },
      body1: { fontSize: 13.5 },
      body2: { fontSize: 12.5 },
      caption: { fontSize: 10.5, color: t.mutedSoft },
      button: { textTransform: 'none', fontWeight: 700, fontFamily: fontFamily.heading },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: t.bg },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${t.line}`,
          },
        },
        defaultProps: { elevation: 0 },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${t.line}`,
            boxShadow: '0 12px 32px -24px rgba(30,50,90,0.18)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
            fontSize: 12.5,
            padding: '8px 14px',
            transition: 'transform 150ms ease, box-shadow 150ms ease, filter 150ms ease',
          },
          outlined: { borderColor: t.line },
          containedPrimary: {
            backgroundImage: t.gradientBrand,
            boxShadow: t.glowPrimary,
            '&:hover': { boxShadow: t.glowPrimary, filter: 'brightness(1.08)', transform: 'translateY(-1px)' },
            '&.Mui-disabled': { backgroundImage: 'none', boxShadow: 'none' },
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontFamily: fontFamily.heading,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            padding: '16px 20px 13px',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 700, fontSize: 10.5 },
          label: { paddingLeft: 8, paddingRight: 8 },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': { color: t.primary },
            '&.Mui-checked + .MuiSwitch-track': { backgroundColor: t.primary, opacity: 0.5 },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '9px 12px',
            borderColor: t.lineSoft,
            fontSize: 12.5,
          },
          head: {
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: t.mutedSoft,
            backgroundColor: t.surface,
            borderColor: t.line,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': { borderBottom: 0 },
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: radius.sm, fontSize: 13 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 700, fontSize: 13, fontFamily: fontFamily.heading },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            padding: '10px 14px',
            fontSize: 12.5,
            fontWeight: 560,
            alignItems: 'center',
            boxShadow: '0 8px 24px -14px rgba(30,50,90,0.35)',
            '&.MuiAlert-standardSuccess .MuiAlert-icon': { color: t.paid },
            '&.MuiAlert-standardError .MuiAlert-icon': { color: t.due },
            '&.MuiAlert-standardWarning .MuiAlert-icon': { color: t.ember },
            '&.MuiAlert-standardInfo .MuiAlert-icon': { color: t.info },
          },
          icon: { fontSize: 18, opacity: 1, marginRight: 10, padding: 0 },
          message: { padding: 0 },
          action: { paddingTop: 0, marginRight: -4 },
          standardSuccess: { backgroundColor: t.paidSoft, color: t.paidInk, borderLeft: `3px solid ${t.paid}` },
          standardError: { backgroundColor: t.dueSoft, color: t.dueInk, borderLeft: `3px solid ${t.due}` },
          standardWarning: { backgroundColor: t.emberSoft, color: t.emberInk, borderLeft: `3px solid ${t.ember}` },
          standardInfo: { backgroundColor: t.primarySoft, color: t.ink, borderLeft: `3px solid ${t.info}` },
        },
      },
    },
  })
