import { Card, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import styles from '../css/components/Panel.module.css'

interface PanelProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  flush?: boolean
  children: ReactNode
}

export const Panel = ({ title, subtitle, action, flush = false, children }: PanelProps) => (
  <Card className={styles.card}>
    {title && (
      <div className={styles.header}>
        <Typography variant="h6">{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        <div className={styles.spacer} />
        {action}
      </div>
    )}
    <div className={flush ? styles.bodyFlush : styles.body}>{children}</div>
  </Card>
)
