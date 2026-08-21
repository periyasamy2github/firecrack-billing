import { Box, Button, Container, Typography, keyframes, useTheme } from '@mui/material'
import type { SvgIconComponent } from '@mui/icons-material'

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(var(--mui-palette-primary-mainChannel) / 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(var(--mui-palette-primary-mainChannel) / 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--mui-palette-primary-mainChannel) / 0); }
`

interface FullPageErrorLayoutProps {
  code: string
  title: string
  subtitle: string
  icon: SvgIconComponent
  onHome: () => void
}

// Full-screen error page (404, 500) shown outside the app layout.
export const FullPageErrorLayout = ({ code, title, subtitle, icon: Icon, onHome }: FullPageErrorLayoutProps) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at 50% 50%, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '35vw',
          height: '35vw',
          background: theme.palette.primary.main,
          opacity: 0.05,
          filter: 'blur(100px)',
          borderRadius: '50%',
          animation: `${float} 12s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '30vw',
          height: '30vw',
          background: theme.palette.secondary?.main || theme.palette.error.main,
          opacity: 0.05,
          filter: 'blur(100px)',
          borderRadius: '50%',
          animation: `${float} 10s ease-in-out infinite reverse`,
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'primary.contrastText',
            mb: 4,
            animation: `${pulse} 2.5s infinite`,
            boxShadow: `0 8px 32px 0 rgba(var(--mui-palette-primary-mainChannel) / 0.4)`,
          }}
        >
          <Icon sx={{ fontSize: 60 }} />
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '4rem', md: '6rem' },
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.error.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          {code}
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary', letterSpacing: '-0.01em' }}>
          {title}
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5, fontSize: '1.15rem', maxWidth: '85%', mx: 'auto', lineHeight: 1.6 }}>
          {subtitle}
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={onHome}
          sx={{
            borderRadius: '50px',
            px: 5,
            py: 1.5,
            fontSize: '1.05rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: `0 8px 20px 0 rgba(var(--mui-palette-primary-mainChannel) / 0.3)`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 28px 0 rgba(var(--mui-palette-primary-mainChannel) / 0.4)`,
            },
          }}
        >
          Return to Dashboard
        </Button>
      </Container>
    </Box>
  )
}
