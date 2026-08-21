import { Avatar, IconButton, Tooltip, Typography } from '@mui/material'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import type { User } from '../types'
import styles from '../css/layouts/AppLayout.module.css'

interface UserProfileProps {
  user: User | null
  isSuperAdmin: boolean
  counterLabel: string
  onSignOut: () => void
}

export const LoggedProfile = ({ user, isSuperAdmin, counterLabel, onSignOut }: UserProfileProps) => (
  <div className={styles.userRow}>
    <div className={styles.avatarRing}>
      <Avatar className={styles.avatar}>{user?.initials ?? '—'}</Avatar>
    </div>
    <div className={styles.userTextBlock}>
      <Typography className={styles.userName}>{user?.name ?? 'Guest'}</Typography>
      {isSuperAdmin ? (
        <div className={styles.roleRow}>
          <ShieldOutlinedIcon className={styles.roleIcon} />
          <Typography className={styles.roleLabel}>Super Admin</Typography>
        </div>
      ) : (
        <Typography noWrap className={styles.counterLabel}>{counterLabel}</Typography>
      )}
    </div>
    <Tooltip title="Sign out">
      <IconButton size="small" aria-label="Sign out" onClick={onSignOut} className={styles.signOutButton}>
        <LogoutOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  </div>
)
