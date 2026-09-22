import type { ReactNode } from 'react'
import { CircularProgress } from '@mui/material'
import styles from '../css/components/CardList.module.css'

interface CardListProps {
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
  footer: ReactNode
  children: ReactNode
}

export const CardList = ({ loading = false, empty = false, emptyMessage = '', footer, children }: CardListProps) => (
  <div className={styles.cardList}>
    {loading && <div className={styles.cardListEmpty}><CircularProgress size={20} /></div>}
    {!loading && empty && <div className={styles.cardListEmpty}>{emptyMessage}</div>}
    {!loading && children}
    {footer}
  </div>
)
