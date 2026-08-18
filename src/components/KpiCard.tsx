import { Card, Typography } from '@mui/material'
import styles from './KpiCard.module.css'

export const KpiCard = ({ label, value }: { label: string; value: string }) => (
  <Card className={styles.card}>
    <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
    <Typography className={styles.value}>{value}</Typography>
  </Card>
)
