import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Autocomplete, Button, Divider, TextField, Typography } from '@mui/material'
import { AuthShell } from '../../components/AuthShell'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useFormValidation } from '../../hooks/useFormValidation'
import { useToast } from '../../hooks/useToast'
import type { User } from '../../types'
import { ROUTES } from '../../utils/routes'
import styles from './Login.module.css'

const loginSchema = z.object({
  staffId: z.string().min(1, 'Pick your name from the list'),
})

export const Login = () => {
  const navigate = useNavigate()
  const { setCurrentUser, setCurrentBranchId, setActiveCounter, users, shop, branches } = useStoreScope()
  const [staffUser, setStaffUser] = useState<User | null>(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const { errors, validate, clearError } = useFormValidation(loginSchema)
  const showToast = useToast()
  const findBranchByName = (name: string) => branches.find((branch) => branch.name === name)

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate({ staffId: staffUser?.staffId ?? '' }) || !staffUser) return
    // Password isn't checked yet — there's no backend to authenticate against.
    setLoginError('')
    setCurrentUser(staffUser)
    if (staffUser.role === 'Super Admin') {
      setCurrentBranchId('all')
      setActiveCounter(null)
      navigate(ROUTES.dashboard)
      return
    }
    const usableCounters = staffUser.counters.filter((c) => findBranchByName(c)?.active)
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
    <AuthShell
      footer={
        <Typography className={styles.footer}>
          GSTIN {shop.gstin}
        </Typography>
      }
    >
      <form onSubmit={handleSignIn} className={styles.form}>
        <div className={styles.heading}>
          <Typography className={styles.title}>
            Sign in
          </Typography>
          <Typography className={styles.subtitle}>
            {shop.name} · {shop.town}
          </Typography>
        </div>

        <Divider />

        <Autocomplete
          options={users.filter((user) => user.active)}
          value={staffUser}
          onChange={(_, value) => {
            setStaffUser(value)
            // Demo build: fill in the account's password so testers can sign straight in.
            setPassword(value?.password ?? '')
            clearError('staffId')
            setLoginError('')
          }}
          getOptionLabel={(u) => `${u.name} — ${u.staffId}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          filterOptions={(options, { inputValue }) => {
            const q = inputValue.trim().toLowerCase()
            return options.filter((u) => u.name.toLowerCase().includes(q) || u.staffId.toLowerCase().includes(q) || u.mobile.includes(q))
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Mobile number or staff ID"
              placeholder="e.g. ADMIN"
              required
              error={Boolean(errors.staffId)}
              helperText={errors.staffId || ' '}
            />
          )}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => { setPassword(event.target.value); setLoginError('') }}
          placeholder="••••••••"
          fullWidth
          required
          error={Boolean(loginError)}
          helperText={loginError || ' '}
        />

        <Button type="submit" variant="contained" size="large" className={styles.signInButton}>
          Sign in
        </Button>

        <div className={styles.footerRow}>
          <Button type="button" variant="text" size="small" onClick={() => showToast('Ask a Super Admin to reset your password.', 'info')} className={styles.footerLink}>Forgot password?</Button>
          <Typography className={styles.footerVersion}>v1.0 · Season 2026</Typography>
        </div>
      </form>
    </AuthShell>
  )
}

export default Login
