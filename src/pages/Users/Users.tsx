import { useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { Mono } from '../../components/Mono'
import { StatusPill } from '../../components/StatusPill'
import { SearchField } from '../../components/SearchField'
import { TableCard, TableEmptyRow } from '../../components/TableCard'
import { TablePaginationBar } from '../../components/TablePaginationBar'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useKeyShortcuts } from '../../hooks/useKeyShortcuts'
import { usePagination } from '../../hooks/usePagination'
import { useFormValidation } from '../../hooks/useFormValidation'
import { useToast } from '../../hooks/useToast'
import type { User, UserRole } from '../../types'
import styles from './Users.module.css'

// Staff ID uniqueness and the password rules depend on the current user list and
// whether we're adding vs editing, so the schema is built fresh with that context.
const userSchema = (users: User[], editingId: string | null, isNew: boolean) =>
  z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
    staffId: z.string().trim().min(1, 'Staff ID is required'),
    mobile: z.string().trim().min(1, 'Mobile is required'),
    password: z.string(),
    confirmPassword: z.string(),
    role: z.enum(['Counter Staff', 'Super Admin']),
    counters: z.array(z.string()),
  })
    .refine((v) => v.role !== 'Counter Staff' || v.counters.length > 0, { message: 'Pick at least one counter', path: ['counters'] })
    .refine((v) => !isNew || v.password.length >= 4, { message: 'At least 4 characters', path: ['password'] })
    .refine((v) => !isNew || v.password === v.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
    .refine((v) => !users.some((u) => u.staffId.toLowerCase() === v.staffId.toLowerCase() && u.id !== editingId), { message: 'That staff ID is already in use', path: ['staffId'] })
    .refine((v) => !users.some((u) => u.email.toLowerCase() === v.email.trim().toLowerCase() && u.id !== editingId), { message: 'That email is already in use', path: ['email'] })

const resetPasswordSchema = z.object({
  newPassword: z.string().min(4, 'At least 4 characters'),
  confirmPassword: z.string(),
}).refine((v) => v.newPassword === v.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

const emptyForm = {
  name: '',
  staffId: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Counter Staff' as UserRole,
  counters: [] as string[],
  active: true,
}

const initialsFrom = (name: string): string =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.detailRow}>
    <Typography className={styles.detailLabel}>{label}</Typography>
    <Typography className={styles.detailValue}>{value}</Typography>
  </div>
)

export const Users = () => {
  const { users, saveUser: persistUser, branches } = useStoreScope()
  const counterNames = branches.map((branch) => branch.name)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [resettingUser, setResettingUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const showToast = useToast()

  useKeyShortcuts({ '/': () => searchInputRef.current?.focus() })

  const { errors, validate, clearError, reset: resetErrors } = useFormValidation(userSchema(users, editingUser?.id ?? null, !editingUser))

  const { errors: resetPwErrors, validate: validateResetPw, clearError: clearResetPwError, reset: resetResetPwErrors } = useFormValidation(resetPasswordSchema)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.staffId.toLowerCase().includes(q))
  }, [users, search])

  const { page, rowsPerPage, pageRows, changePage, changeRowsPerPage } = usePagination(filtered)

  const openAdd = () => {
    setEditingUser(null)
    setForm(emptyForm)
    resetErrors()
    setFormOpen(true)
  }

  const openEdit = (u: User) => {
    setEditingUser(u)
    setForm({
      name: u.name,
      staffId: u.staffId,
      mobile: u.mobile,
      email: u.email,
      password: '',
      confirmPassword: '',
      role: u.role,
      counters: u.counters,
      active: u.active,
    })
    resetErrors()
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingUser(null)
    setForm(emptyForm)
    resetErrors()
  }

  const toggleCounter = (counter: string) => {
    setForm((f) => ({
      ...f,
      counters: f.counters.includes(counter) ? f.counters.filter((c) => c !== counter) : [...f.counters, counter],
    }))
  }

  const saveUser = async () => {
    const valid = validate({
      name: form.name,
      email: form.email,
      staffId: form.staffId,
      mobile: form.mobile,
      password: form.password,
      confirmPassword: form.confirmPassword,
      role: form.role,
      counters: form.counters,
    })
    if (!valid) return

    if (editingUser) {
      await persistUser({
        ...editingUser,
        name: form.name.trim(),
        initials: initialsFrom(form.name),
        staffId: form.staffId.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        role: form.role,
        counters: form.role === 'Super Admin' ? [] : form.counters,
        active: form.active,
      })
      showToast(`${form.name.trim()} updated`)
    } else {
      await persistUser({
        id: `U${Date.now()}`,
        name: form.name.trim(),
        initials: initialsFrom(form.name),
        staffId: form.staffId.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        counters: form.role === 'Super Admin' ? [] : form.counters,
        active: true,
        joinedOn: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      })
      showToast(`${form.name.trim()} added`)
    }
    closeForm()
  }

  const openReset = (u: User) => {
    setResettingUser(u)
    setNewPassword('')
    setConfirmPassword('')
    resetResetPwErrors()
  }

  const closeReset = () => setResettingUser(null)

  const saveNewPassword = async () => {
    if (!resettingUser || !validateResetPw({ newPassword, confirmPassword })) return
    await persistUser({ ...resettingUser, password: newPassword })
    showToast(`Password reset for ${resettingUser.name}`)
    closeReset()
  }

  return (
    <>
      <PageHeader
        title="Users"
        crumb={`${users.length} users`}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}>
            Add user
          </Button>
        }
      />
      <PageContent>
        <SearchField placeholder="Search by name or staff ID… (/)" value={search} onChange={setSearch} inputRef={searchInputRef} sx={{ maxWidth: 340 }} />

        <TableCard footer={<TablePaginationBar count={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={changePage} onRowsPerPageChange={changeRowsPerPage} />}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Staff ID</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Counters</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell><Typography className={styles.userName}>{u.name}</Typography></TableCell>
                    <TableCell><Mono sx={{ fontWeight: 600 }}>{u.staffId}</Mono></TableCell>
                    <TableCell><Mono sx={{ fontSize: 12 }}>{u.mobile}</Mono></TableCell>
                    <TableCell>
                      <div className={styles.roleRow}>
                        {u.role === 'Super Admin' && <ShieldOutlinedIcon sx={{ fontSize: 14, color: 'secondary.dark' }} />}
                        <Typography className={styles.roleLabel}>{u.role}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      {u.role === 'Super Admin' ? (
                        <Typography className={styles.allCountersLabel}>All counters</Typography>
                      ) : (
                        <div className={styles.countersWrap}>
                          {u.counters.map((c) => (
                            <Chip key={c} size="small" label={c.split(' — ')[0]} variant="outlined" />
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell><StatusPill tone={u.active ? 'paid' : 'mut'} label={u.active ? 'Active' : 'Inactive'} /></TableCell>
                    <TableCell align="right">
                      <div className={styles.actionsRow}>
                        <Tooltip title="View details">
                          <IconButton size="small" onClick={() => setViewingUser(u)}>
                            <VisibilityOutlinedIcon className={styles.actionIcon} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit user">
                          <IconButton size="small" onClick={() => openEdit(u)}>
                            <EditOutlinedIcon className={styles.actionIcon} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reset password">
                          <IconButton size="small" onClick={() => openReset(u)}>
                            <LockResetOutlinedIcon className={styles.actionIcon} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableEmptyRow colSpan={7} message="No users match this search." />}
              </TableBody>
            </Table>
        </TableCard>
      </PageContent>

      <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="sm">
        <DialogTitle>{editingUser ? `Edit user — ${editingUser.name}` : 'Add user'}</DialogTitle>
        <DialogContent className={styles.dialogContentTop}>
          <div className={styles.formGrid}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); clearError('name') }}
              fullWidth
              autoFocus
              required
              error={Boolean(errors.name)}
              helperText={errors.name || ' '}
            />
            <TextField
              label="Staff ID"
              value={form.staffId}
              onChange={(e) => { setForm((f) => ({ ...f, staffId: e.target.value })); clearError('staffId') }}
              fullWidth
              required
              error={Boolean(errors.staffId)}
              helperText={errors.staffId || 'Used to sign in — must be unique'}
            />
            <TextField
              label="Mobile"
              value={form.mobile}
              onChange={(e) => { setForm((f) => ({ ...f, mobile: e.target.value })); clearError('mobile') }}
              fullWidth
              required
              error={Boolean(errors.mobile)}
              helperText={errors.mobile || ' '}
            />
            <TextField
              label="Email — used to sign in"
              value={form.email}
              onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); clearError('email') }}
              fullWidth
              required
              error={Boolean(errors.email)}
              helperText={errors.email || ' '}
            />
            {!editingUser && (
              <>
                <TextField
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); clearError('password') }}
                  fullWidth
                  required
                  error={Boolean(errors.password)}
                  helperText={errors.password || 'At least 4 characters'}
                />
                <TextField
                  label="Confirm password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => { setForm((f) => ({ ...f, confirmPassword: e.target.value })); clearError('confirmPassword') }}
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
            onChange={(_, value: UserRole | null) => value && setForm((f) => ({ ...f, role: value }))}
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
              <div className={editingUser ? styles.countersColSpan1 : styles.countersColSpanFull}>
                <Typography className={styles.countersLabel}>Counters — pick one or more</Typography>
                <div className={styles.countersList}>
                  {counterNames.map((c) => (
                    <div
                      key={c}
                      onClick={() => { toggleCounter(c); clearError('counters') }}
                      className={form.counters.includes(c) ? `${styles.counterRow} ${styles.counterRowSelected}` : styles.counterRow}
                    >
                      <Typography className={styles.counterRowLabel}>{c}</Typography>
                      <Switch size="small" checked={form.counters.includes(c)} onChange={() => { toggleCounter(c); clearError('counters') }} onClick={(e) => e.stopPropagation()} />
                    </div>
                  ))}
                </div>
                {errors.counters ? (
                  <Typography variant="caption" className={styles.counterError}>
                    {errors.counters}
                  </Typography>
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

            {editingUser && (
              <div className={styles.activeRow}>
                <div className={styles.activeRowText}>
                  <Typography className={styles.activeLabel}>Active</Typography>
                  <Typography variant="caption">Inactive users can't sign in</Typography>
                </div>
                <Switch checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button onClick={closeForm}>Cancel</Button>
          <Button variant="contained" onClick={saveUser}>
            {editingUser ? 'Save changes' : 'Add user'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(viewingUser)} onClose={() => setViewingUser(null)} fullWidth maxWidth="xs">
        <DialogTitle>User details</DialogTitle>
        {viewingUser && (
          <DialogContent className={styles.dialogContentTop}>
            <DetailRow label="Name" value={viewingUser.name} />
            <DetailRow label="Staff ID" value={viewingUser.staffId} />
            <DetailRow label="Mobile" value={viewingUser.mobile} />
            <DetailRow label="Email" value={viewingUser.email} />
            <DetailRow label="Role" value={viewingUser.role} />
            <DetailRow label="Counters" value={viewingUser.role === 'Super Admin' ? 'All counters' : viewingUser.counters.join(', ') || '—'} />
            <DetailRow label="Joined on" value={viewingUser.joinedOn} />
            <DetailRow label="Status" value={viewingUser.active ? 'Active' : 'Inactive'} />
          </DialogContent>
        )}
        <DialogActions className={styles.dialogActions}>
          <Button onClick={() => setViewingUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(resettingUser)} onClose={closeReset} fullWidth maxWidth="xs">
        <DialogTitle>Reset password{resettingUser ? ` — ${resettingUser.name}` : ''}</DialogTitle>
        <DialogContent className={styles.dialogContentFlex}>
          <TextField
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); clearResetPwError('newPassword') }}
            fullWidth
            autoFocus
            required
            error={Boolean(resetPwErrors.newPassword)}
            helperText={resetPwErrors.newPassword || 'At least 4 characters'}
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearResetPwError('confirmPassword') }}
            fullWidth
            required
            error={Boolean(resetPwErrors.confirmPassword)}
            helperText={resetPwErrors.confirmPassword || ' '}
          />
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button onClick={closeReset}>Cancel</Button>
          <Button variant="contained" onClick={saveNewPassword}>
            Reset password
          </Button>
        </DialogActions>
      </Dialog>

    </>
  )
}

export default Users
