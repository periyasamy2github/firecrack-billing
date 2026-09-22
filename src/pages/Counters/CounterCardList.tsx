import type { ReactNode } from 'react'
import { Card, CircularProgress, IconButton, Switch, Typography } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { CardList } from '../../components/CardList'
import { Mono } from '../../components/Mono'
import { StatusPill } from '../../components/StatusPill'
import { nextBillNoLabel } from '../../utils/format'
import type { Counter } from '../../types'
import styles from '../../css/components/CardList.module.css'

interface CounterCardListProps {
  counters: Counter[]
  isPending: (id: string) => boolean
  onToggleActive: (counter: Counter) => void
  onEdit: (counter: Counter) => void
  footer: ReactNode
}

export const CounterCardList = ({ counters, isPending, onToggleActive, onEdit, footer }: CounterCardListProps) => (
  <CardList footer={footer}>
    {counters.map((c) => (
      <Card key={c.id} className={styles.itemCard}>
        <div className={styles.itemCardTop}>
          <Typography className={styles.cardName}>{c.name}</Typography>
          <StatusPill tone={c.active ? 'paid' : 'mut'} label={c.active ? 'Active' : 'Inactive'} />
        </div>
        <Typography className={styles.itemCardMeta}>
          Code <Mono className={styles.cardMonoSmall}>{c.code ?? '—'}</Mono> · Next bill{' '}
          <Mono className={styles.cardMonoSmall}>{nextBillNoLabel(c.code, c.nextNumber)}</Mono>
        </Typography>
        <div className={styles.itemCardActions}>
          {isPending(c.id) ? (
            <CircularProgress size={16} />
          ) : (
            <>
              <Switch size="small" checked={c.active} onChange={() => onToggleActive(c)} />
              <IconButton size="small" onClick={() => onEdit(c)}><EditOutlinedIcon /></IconButton>
            </>
          )}
        </div>
      </Card>
    ))}
  </CardList>
)
