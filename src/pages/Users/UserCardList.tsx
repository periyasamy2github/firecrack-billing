import { Card, IconButton, Typography } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import { CardList } from '../../components/CardList'
import { Mono } from '../../components/Mono'
import { StatusPill } from '../../components/StatusPill'
import { counterShortName } from '../../utils/format'
import type { UsersTableProps } from './UsersTable'
import styles from '../../css/components/CardList.module.css'

export const UserCardList = ({ rows, loading, filteredCount, onView, onEdit, onResetPassword, footer }: UsersTableProps) => (
  <CardList loading={loading} empty={filteredCount === 0} emptyMessage="No users match this search." footer={footer}>
    {rows.map((user) => (
      <Card key={user.id} className={`${styles.itemCard} ${styles.itemCardClickable}`} onClick={() => onView(user)}>
        <div className={styles.itemCardTop}>
          <Typography className={styles.cardName}>{user.name}</Typography>
          <StatusPill tone={user.active ? 'paid' : 'mut'} label={user.active ? 'Active' : 'Inactive'} />
        </div>
        <Typography className={styles.itemCardMeta}>
          <Mono className={styles.cardMonoSmall}>{user.staffId}</Mono> · {user.role}
          {user.role === 'Super Admin' ? ' · All branches' : user.counter ? ` · ${counterShortName(user.counter)}` : ''}
        </Typography>
        <Typography className={styles.itemCardMeta}>{user.email} · {user.mobile}</Typography>
        <div className={styles.itemCardActions} onClick={(e) => e.stopPropagation()}>
          <IconButton size="small" onClick={() => onView(user)}><VisibilityOutlinedIcon /></IconButton>
          <IconButton size="small" onClick={() => onEdit(user)}><EditOutlinedIcon /></IconButton>
          <IconButton size="small" onClick={() => onResetPassword(user)}><LockResetOutlinedIcon /></IconButton>
        </div>
      </Card>
    ))}
  </CardList>
)
