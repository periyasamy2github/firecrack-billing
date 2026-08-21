import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { z } from 'zod'
import { Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { AuthShell } from '../../components/AuthShell'
import { useDispatch } from '../../redux/store'
import { loadSession } from '../../redux/sessionSlice'
import { api, setToken } from '../../services/api'
import { useSession } from '../../hooks/useSession'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../utils/errorMessage'
import type { User } from '../../types'
import { ROUTES } from '../../utils/routes'
import styles from '../../css/pages/Login.module.css'
import nProgress from 'nprogress'

const loginSchema = z.object({
  email: z.string().min(1, 'Enter your email').email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const landingPage = ROUTES.dashboard
  const { setCounterScope } = useSession()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const showToast = useToast()

  const routeAfterLogin = (user: User) => {
    if (user.role !== 'Super Admin' && !user.counterId) {
      setToken(null)
      showToast('No counter is assigned to you. Ask a Super Admin.', 'error')
      return
    }

    setCounterScope(user.role === 'Super Admin' ? 'all' : user.counterId as string)
    navigate(landingPage, { replace: true })
  }

  const handleSignIn = async ({ email, password }: LoginFormValues) => {
    nProgress.start()
    nProgress.inc(0.1)
    try {
      const { token } = await api.login(email, password)
      setToken(token)
      const data = await dispatch(loadSession()).unwrap()
      routeAfterLogin(data.user)
    } catch (err) {
      setToken(null)
      showToast(errorMessage(err, 'Could not sign in'), 'error')
    } finally {
      nProgress.done();
    }
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit(handleSignIn)} className={styles.form}>
        <div className={styles.heading}>
          <Typography component="h2" className={styles.title}>Sign in</Typography>
          <Typography className={styles.subtitle}>Use your work email to open your counter.</Typography>
        </div>

        <TextField
          label="Email address"
          type="email"
          {...register('email')}
          placeholder="you@example.com"
          size="medium"
          fullWidth
          autoFocus
          required
          autoComplete="username"
          error={Boolean(errors.email)}
          helperText={errors.email?.message || ' '}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MailOutlineRoundedIcon sx={{ fontSize: 19, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          {...register('password')}
          placeholder="••••••••"
          size="medium"
          fullWidth
          required
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message || ' '}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  edge="end"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <VisibilityOffOutlinedIcon sx={{ fontSize: 19 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 19 }} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          endIcon={<ArrowForwardRoundedIcon />}
          className={styles.signInButton}
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <div className={styles.footerRow}>
          <Button
            type="button"
            variant="text"
            size="small"
            onClick={() => showToast('Ask a Super Admin to reset your password.', 'info')}
            className={styles.footerLink}
          >
            Forgot password?
          </Button>
          <Typography className={styles.footerVersion}>Season {new Date().getFullYear()}</Typography>
        </div>
      </form>
    </AuthShell>
  )
}

export default Login
