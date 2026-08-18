import { Card, Typography } from '@mui/material'
import type { SvgIconComponent } from '@mui/icons-material'
import styles from './KpiCard.module.css'

export type KpiTone = 'primary' | 'info' | 'ember' | 'paid'

interface KpiCardProps {
  label: string
  value: string
  icon: SvgIconComponent
  tone?: KpiTone
}

export const KpiCard = ({ label, value, icon: Icon, tone = 'primary' }: KpiCardProps) => (
  <Card className={styles.card}>
    <div className={`${styles.iconTile} ${styles[tone]}`}>
      <Icon className={styles.icon} />
    </div>
    <div className={styles.text}>
      <Typography className={styles.label}>{label}</Typography>
      <Typography className={styles.value}>{value}</Typography>
    </div>
  </Card>
)
