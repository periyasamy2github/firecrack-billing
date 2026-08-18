import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Autocomplete, Avatar, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { AuthShell } from '../../components/AuthShell'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useFormValidation } from '../../hooks/useFormValidation'
import { useToast } from '../../hooks/useToast'
import type { User } from '../../types'
import { ROUTES } from '../../utils/routes'
import styles from './Login.module.css'

const loginSchema = z.object({
  email: z.string().min(1, 'Pick your email from the list'),
})

export const Login = () => {
  const navigate = useNavigate()
  const { setCurrentUser, setCurrentBranchId, setActiveCounter, users, branches } = useStoreScope()
  const [account, setAccount] = useState<User | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { errors, validate, clearError } = useFormValidation(loginSchema)
  const showToast = useToast()
  const findBranchByName = (name: string) => branches.find((branch) => branch.name === name)

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate({ email: account?.email ?? '' }) || !account) return
    // Password isn't checked yet — there's no backend to authenticate against.

    setCurrentUser(account)
    if (account.role === 'Super Admin') {
      setCurrentBranchId('all')
      setActiveCounter(null)
      navigate(ROUTES.dashboard)
      return
    }
    const usableCounters = account.counters.filter((c) => findBranchByName(c)?.active)
    if (usableCounters.length > 1) {
      navigate(ROUTES.selectCounter)
    } else {
      const counter = usableCounters[0] ?? null
      setActiveCounter(counter)
      setCurrentBranchId(counter ? findBranchByName(counter)?.id ?? 'all' : 'all')
      navigate(ROUTES.dashboard)
    }
  }

  return (
    <AuthShell>
      <form onSubmit={handleSignIn} className={styles.form}>
        <div className={styles.heading}>
          <Typography component="h2" className={styles.title}>Sign in</Typography>
          <Typography className={styles.subtitle}>Use your work email to open your counter.</Typography>
        </div>

        <Autocomplete
          options={users.filter((user) => user.active)}
          value={account}
          onChange={(_, value) => {
            setAccount(value)
            // Demo build: fill in the account's password so testers can sign straight in.
            setPassword(value?.password ?? '')
            clearError('email')
          }}
          getOptionLabel={(user) => user.email}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          filterOptions={(options, { inputValue }) => {
            const q = inputValue.trim().toLowerCase()
            return options.filter((user) => user.email.toLowerCase().includes(q))
          }}
          renderOption={({ key, ...props }, user) => (
            <li {...props} key={key} className={`${props.className ?? ''} ${styles.option}`}>
              <Avatar className={styles.optionAvatar}>{user.initials}</Avatar>
              <span className={styles.optionText}>
                <Typography className={styles.optionName}>{user.email}</Typography>
                <Typography className={styles.optionMeta}>{user.role}</Typography>
              </span>
              {user.role === 'Super Admin' && <ShieldOutlinedIcon className={styles.optionShield} />}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Email address"
              placeholder="you@sparkbill.app"
              size="medium"
              autoFocus
              required
              error={Boolean(errors.email)}
              helperText={errors.email || ' '}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineRoundedIcon sx={{ fontSize: 19, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          size="medium"
          fullWidth
          required
          autoComplete="current-password"
          helperText=" "
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
          endIcon={<ArrowForwardRoundedIcon />}
          className={styles.signInButton}
        >
          Sign in
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
          <Typography className={styles.footerVersion}>v1.0 · Season 2026</Typography>
        </div>
      </form>
    </AuthShell>
  )
}

export default Login
