import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import type { User } from '../../types'
import styles from '../../css/pages/Users.module.css'

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.detailRow}>
    <Typography className={styles.detailLabel}>{label}</Typography>
    <Typography className={styles.detailValue}>{value}</Typography>
  </div>
)

interface UserDetailsDialogProps {
  user: User | null
  onClose: () => void
}

export const UserDetailsDialog = ({ user, onClose }: UserDetailsDialogProps) => (
  <Dialog open={Boolean(user)} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>User details</DialogTitle>
    {user && (
      <DialogContent className={styles.dialogContentTop}>
        <DetailRow label="Name" value={user.name} />
        <DetailRow label="Staff ID" value={user.staffId} />
        <DetailRow label="Mobile" value={user.mobile} />
        <DetailRow label="Email" value={user.email} />
        <DetailRow label="Role" value={user.role} />
        <DetailRow label="Counter" value={user.role === 'Super Admin' ? 'All counters' : (user.counter || '—')} />
        <DetailRow label="Joined on" value={user.joinedOn} />
        <DetailRow label="Status" value={user.active ? 'Active' : 'Inactive'} />
      </DialogContent>
    )}
    <DialogActions className={styles.dialogActions}>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
)
