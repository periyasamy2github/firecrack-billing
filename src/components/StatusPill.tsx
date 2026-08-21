import styles from '../css/components/StatusPill.module.css'
import type { Bill } from '../types'

export type PillTone = 'paid' | 'due' | 'hold' | 'mut'

export const BILL_STATUS_TONE: Record<Bill['status'], PillTone> = { Paid: 'paid', Cancelled: 'due' }

interface StatusPillProps {
  label: string
  tone: PillTone
  dot?: boolean
}

export const StatusPill = ({ label, tone, dot = true }: StatusPillProps) => (
  <span className={`${styles.pill} ${styles[tone]}`}>
    {dot && <span className={styles.dot} />}
    {label}
  </span>
)
