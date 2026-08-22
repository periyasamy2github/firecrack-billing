import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import type { Counter, User, UserRole } from '../../types'
import { emptyUserForm, fromUserFormValues, toUserFormValues, userSchema, type UserFormValues } from './userFormSchema'
import styles from '../../css/pages/Users.module.css'

interface UserDialogProps {
  open: boolean
  user: User | null
  users: User[]
  counters: Counter[]
  onClose: () => void
  onSubmit: (user: User) => void | Promise<void>
}

export const UserDialog = ({ open, user, users, counters, onClose, onSubmit }: UserDialogProps) => {
  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema(users, user?.id ?? null, !user)),
    defaultValues: user ? toUserFormValues(user) : emptyUserForm(),
  })

  const role = watch('role')

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{user ? `Edit user — ${user.name}` : 'Add user'}</DialogTitle>
      <DialogContent className={styles.dialogContentTop}>
        <div className={styles.formGrid}>
          <TextField
            label="Name"
            {...register('name')}
            fullWidth
            autoFocus
            required
            error={Boolean(errors.name)}
            helperText={errors.name?.message || ' '}
          />
          <TextField
            label="Staff ID"
            {...register('staffId')}
            fullWidth
            required
            error={Boolean(errors.staffId)}
            helperText={errors.staffId?.message || 'Used to sign in — must be unique'}
          />
          <TextField
            label="Mobile"
            {...register('mobile')}
            fullWidth
            required
            error={Boolean(errors.mobile)}
            helperText={errors.mobile?.message || ' '}
          />
          <TextField
            label="Email — used to sign in"
            {...register('email')}
            fullWidth
            required
            error={Boolean(errors.email)}
            helperText={errors.email?.message || ' '}
          />
          {!user && (
            <>
              <TextField
                label="Password"
                type="password"
                {...register('password')}
                fullWidth
                required
                error={Boolean(errors.password)}
                helperText={errors.password?.message || 'At least 6 characters'}
              />
              <TextField
                label="Confirm password"
                type="password"
                {...register('confirmPassword')}
                fullWidth
                required
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword?.message || ' '}
              />
            </>
          )}
        </div>

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={field.value}
              onChange={(_, value: UserRole | null) => value && field.onChange(value)}
              className={styles.roleGroup}
            >
              <ToggleButton value="Counter Staff" className={styles.roleButton}>
                <StorefrontOutlinedIcon className={styles.roleIcon} /> Counter Staff
              </ToggleButton>
              <ToggleButton value="Super Admin" className={styles.roleButton}>
                <ShieldOutlinedIcon className={styles.roleIcon} /> Super Admin
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        />

        <div className={`${styles.detailsGrid} ${role === 'Counter Staff' ? styles.detailsGridTwoCol : styles.detailsGridOneCol}`}>
          {role === 'Counter Staff' ? (
            <Controller
              name="counterId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Counter"
                  {...field}
                  fullWidth
                  error={Boolean(errors.counterId)}
                  helperText={errors.counterId?.message || 'The counter this cashier works at'}
                  className={user ? styles.countersColSpan1 : styles.countersColSpanFull}
                >
                  {counters.map((counter) => (
                    <MenuItem key={counter.id} value={counter.id}>{counter.name}</MenuItem>
                  ))}
                </TextField>
              )}
            />
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
              <Controller
                name="active"
                control={control}
                render={({ field }) => <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
              />
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit((values) => onSubmit(fromUserFormValues(values, user)))}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={14} /> : undefined}
        >
          {user ? 'Save changes' : 'Add user'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
