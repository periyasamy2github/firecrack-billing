import type { ReactNode } from 'react'
import { Chip, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { Mono } from '../../components/Mono'
import { StatusPill } from '../../components/StatusPill'
import { TableCard, TableEmptyRow, TableLoadingRow } from '../../components/TableCard'
import type { User } from '../../types'
import styles from '../../css/pages/Users.module.css'

interface UsersTableProps {
  rows: User[]
  loading: boolean
  filteredCount: number
  onView: (user: User) => void
  onEdit: (user: User) => void
  onResetPassword: (user: User) => void
  footer: ReactNode
}

export const UsersTable = ({ rows, loading, filteredCount, onView, onEdit, onResetPassword, footer }: UsersTableProps) => (
  <TableCard footer={footer}>
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
        {!loading && rows.map((user) => (
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
                  {user.counter && <Chip size="small" label={user.counter.split(' — ')[0]} variant="outlined" />}
                </div>
              )}
            </TableCell>
            <TableCell><StatusPill tone={user.active ? 'paid' : 'mut'} label={user.active ? 'Active' : 'Inactive'} /></TableCell>
            <TableCell align="right">
              <div className={styles.actionsRow}>
                <Tooltip title="View details">
                  <IconButton size="small" onClick={() => onView(user)}>
                    <VisibilityOutlinedIcon className={styles.actionIcon} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit user">
                  <IconButton size="small" onClick={() => onEdit(user)}>
                    <EditOutlinedIcon className={styles.actionIcon} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset password">
                  <IconButton size="small" onClick={() => onResetPassword(user)}>
                    <LockResetOutlinedIcon className={styles.actionIcon} />
                  </IconButton>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {loading && <TableLoadingRow colSpan={7} />}
        {!loading && filteredCount === 0 && <TableEmptyRow colSpan={7} message="No users match this search." />}
      </TableBody>
    </Table>
  </TableCard>
)
