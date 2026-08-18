import { Typography } from '@mui/material'
import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  crumb?: string
  actions?: ReactNode
}

export const PageHeader = ({ title, crumb, actions }: PageHeaderProps) => (
  <div className={`${styles.header} no-print`}>
    <div>
      <Typography variant="h6" className={styles.title}>{title}</Typography>
      {crumb && (
        <Typography variant="caption" className={`num ${styles.crumb}`}>
          {crumb}
        </Typography>
      )}
    </div>
    <div className={styles.spacer} />
    {actions && <div className={styles.actions}>{actions}</div>}
  </div>
)
