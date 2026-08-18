import { Card, Typography } from '@mui/material'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import type { ReactNode } from 'react'
import styles from './AuthShell.module.css'

/** Centered brand card layout shared by the Login and Select Counter screens. */
export const AuthShell = ({ children, footer }: { children: ReactNode; footer?: ReactNode }) => (
  <div className={styles.page}>
    <div className={styles.container}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <AutoAwesomeRoundedIcon className={styles.logoIcon} />
        </div>
        <Typography className={styles.brandName}>Sparkline</Typography>
      </div>

      <Card className={styles.card}>
        <div className={styles.accentBar} />
        {children}
      </Card>

      {footer}
    </div>
  </div>
)
