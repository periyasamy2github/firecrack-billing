import { useState } from 'react'
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { Mono } from '../../components/Mono'
import { StatusPill } from '../../components/StatusPill'
import { SearchField } from '../../components/SearchField'
import { TableCard, TableEmptyRow } from '../../components/TableCard'
import { ListFooter } from '../../components/ListFooter'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useListPage } from '../../hooks/useListPage'
import { useToast } from '../../hooks/useToast'
import type { User } from '../../types'
import { UserDialog } from './UserDialog'
import { ResetPasswordDialog } from './ResetPasswordDialog'
import styles from './Users.module.css'

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.detailRow}>
    <Typography className={styles.detailLabel}>{label}</Typography>
    <Typography className={styles.detailValue}>{value}</Typography>
  </div>
)

export const Users = () => {
  const { users, saveUser, branches } = useStoreScope()
  const counterNames = branches.map((branch) => branch.name)
  const showToast = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [resettingUser, setResettingUser] = useState<User | null>(null)

  const { query, setQuery, searchInputRef, filtered, page, rowsPerPage, pageRows, changePage, changeRowsPerPage } =
    useListPage<User>({
      rows: users,
      matchesSearch: (user, search) => {
        const q = search.trim().toLowerCase()
        return !q || user.name.toLowerCase().includes(q) || user.staffId.toLowerCase().includes(q)
      },
    })

  const openAdd = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingUser(null)
  }

  const submitUser = async (user: User) => {
    const wasEditing = Boolean(editingUser)
    closeForm()
    await saveUser(user)
    showToast(`${user.name} ${wasEditing ? 'updated' : 'added'}`)
  }

  const submitPassword = async (password: string) => {
    if (!resettingUser) return
    const { name } = resettingUser
    setResettingUser(null)
    await saveUser({ ...resettingUser, password })
    showToast(`Password reset for ${name}`)
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
        <SearchField placeholder="Search by name or staff ID… (/)" value={query} onChange={setQuery} inputRef={searchInputRef} sx={{ maxWidth: 340 }} />

        <TableCard footer={<ListFooter count={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={changePage} onRowsPerPageChange={changeRowsPerPage} />}>
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
              {pageRows.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell><Typography className={styles.userName}>{user.name}</Typography></TableCell>
                  <TableCell><Mono sx={{ fontWeight: 600 }}>{user.staffId}</Mono></TableCell>
                  <TableCell><Mono sx={{ fontSize: 12 }}>{user.mobile}</Mono></TableCell>
                  <TableCell>
                    <div className={styles.roleRow}>
                      {user.role === 'Super Admin' && <ShieldOutlinedIcon sx={{ fontSize: 14, color: 'secondary.dark' }} />}
                      <Typography className={styles.roleLabel}>{user.role}</Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === 'Super Admin' ? (
                      <Typography className={styles.allCountersLabel}>All counters</Typography>
                    ) : (
                      <div className={styles.countersWrap}>
                        {user.counters.map((counter) => (
                          <Chip key={counter} size="small" label={counter.split(' — ')[0]} variant="outlined" />
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell><StatusPill tone={user.active ? 'paid' : 'mut'} label={user.active ? 'Active' : 'Inactive'} /></TableCell>
                  <TableCell align="right">
                    <div className={styles.actionsRow}>
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => setViewingUser(user)}>
                          <VisibilityOutlinedIcon className={styles.actionIcon} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit user">
                        <IconButton size="small" onClick={() => openEdit(user)}>
                          <EditOutlinedIcon className={styles.actionIcon} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset password">
                        <IconButton size="small" onClick={() => setResettingUser(user)}>
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

      {formOpen && (
        <UserDialog
          open={formOpen}
          user={editingUser}
          users={users}
          counterNames={counterNames}
          onClose={closeForm}
          onSubmit={submitUser}
        />
      )}

      <ResetPasswordDialog
        key={resettingUser?.id ?? 'reset'}
        user={resettingUser}
        onClose={() => setResettingUser(null)}
        onSubmit={submitPassword}
      />

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
    </>
  )
}

export default Users
