import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { useFormValidation } from '../../hooks/useFormValidation'
import type { User, UserRole } from '../../types'
import { emptyUserForm, fromUserFormValues, toUserFormValues, userSchema, type UserFormValues } from './userFormSchema'
import styles from './Users.module.css'

interface UserDialogProps {
  open: boolean
  user: User | null
  users: User[]
  counterNames: string[]
  onClose: () => void
  onSubmit: (user: User) => void
}

export const UserDialog = ({ open, user, users, counterNames, onClose, onSubmit }: UserDialogProps) => {
  const [form, setForm] = useState<UserFormValues>(() => (user ? toUserFormValues(user) : emptyUserForm()))
  const { errors, validate, clearError } = useFormValidation(userSchema(users, user?.id ?? null, !user))

  const setField = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    clearError(key)
  }

  const toggleCounter = (counter: string) => {
    setField('counters', form.counters.includes(counter)
      ? form.counters.filter((name) => name !== counter)
      : [...form.counters, counter])
  }

  const submit = () => {
    if (!validate(form)) return
    onSubmit(fromUserFormValues(form, user))
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{user ? `Edit user — ${user.name}` : 'Add user'}</DialogTitle>
      <DialogContent className={styles.dialogContentTop}>
        <div className={styles.formGrid}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            fullWidth
            autoFocus
            required
            error={Boolean(errors.name)}
            helperText={errors.name || ' '}
          />
          <TextField
            label="Staff ID"
            value={form.staffId}
            onChange={(e) => setField('staffId', e.target.value)}
            fullWidth
            required
            error={Boolean(errors.staffId)}
            helperText={errors.staffId || 'Used to sign in — must be unique'}
          />
          <TextField
            label="Mobile"
            value={form.mobile}
            onChange={(e) => setField('mobile', e.target.value)}
            fullWidth
            required
            error={Boolean(errors.mobile)}
            helperText={errors.mobile || ' '}
          />
          <TextField
            label="Email — used to sign in"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            fullWidth
            required
            error={Boolean(errors.email)}
            helperText={errors.email || ' '}
          />
          {!user && (
            <>
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                fullWidth
                required
                error={Boolean(errors.password)}
                helperText={errors.password || 'At least 4 characters'}
              />
              <TextField
                label="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                fullWidth
                required
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword || ' '}
              />
            </>
          )}
        </div>

        <ToggleButtonGroup
          exclusive
          fullWidth
          value={form.role}
          onChange={(_, value: UserRole | null) => value && setField('role', value)}
          className={styles.roleGroup}
        >
          <ToggleButton value="Counter Staff" className={styles.roleButton}>
            <StorefrontOutlinedIcon className={styles.roleIcon} /> Counter Staff
          </ToggleButton>
          <ToggleButton value="Super Admin" className={styles.roleButton}>
            <ShieldOutlinedIcon className={styles.roleIcon} /> Super Admin
          </ToggleButton>
        </ToggleButtonGroup>

        <div className={`${styles.detailsGrid} ${form.role === 'Counter Staff' ? styles.detailsGridTwoCol : styles.detailsGridOneCol}`}>
          {form.role === 'Counter Staff' ? (
            <div className={user ? styles.countersColSpan1 : styles.countersColSpanFull}>
              <Typography className={styles.countersLabel}>Counters — pick one or more</Typography>
              <div className={styles.countersList}>
                {counterNames.map((counter) => (
                  <div
                    key={counter}
                    onClick={() => toggleCounter(counter)}
                    className={form.counters.includes(counter) ? `${styles.counterRow} ${styles.counterRowSelected}` : styles.counterRow}
                  >
                    <Typography className={styles.counterRowLabel}>{counter}</Typography>
                    <Switch
                      size="small"
                      checked={form.counters.includes(counter)}
                      onChange={() => toggleCounter(counter)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>
              {errors.counters ? (
                <Typography variant="caption" className={styles.counterError}>{errors.counters}</Typography>
              ) : form.counters.length > 1 && (
                <Typography variant="caption" className={styles.counterHint}>
                  Mapped to more than one counter — this user will be asked which one after signing in.
                </Typography>
              )}
            </div>
          ) : (
            <Typography className={styles.superAdminNote}>
              Super Admin accounts aren't tied to one counter — they see every counter after signing in.
            </Typography>
          )}

          {user && (
            <div className={styles.activeRow}>
              <div className={styles.activeRowText}>
                <Typography className={styles.activeLabel}>Active</Typography>
                <Typography variant="caption">Inactive users can't sign in</Typography>
              </div>
              <Switch checked={form.active} onChange={(e) => setField('active', e.target.checked)} />
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit}>{user ? 'Save changes' : 'Add user'}</Button>
      </DialogActions>
    </Dialog>
  )
}
