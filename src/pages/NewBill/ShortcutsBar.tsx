import { Typography } from '@mui/material'
import { KeyBadge } from '../../components/KeyBadge'
import { ElapsedTimer } from './ElapsedTimer'
import { newBillShortcuts } from '../../data/shortcuts'
import styles from '../../css/pages/NewBill.module.css'

export const ShortcutsBar = ({ startedAt }: { startedAt: number }) => (
  <div className={styles.shortcutsBar}>
    {newBillShortcuts.items.map(({ key, label }) => (
      <div key={key} className={styles.shortcutItem}>
        <KeyBadge label={key} />
        <Typography className={styles.shortcutLabel}>{label}</Typography>
      </div>
    ))}
    <KeyBadge label="F1" />
    <Typography className={styles.shortcutLabel}>all shortcuts</Typography>
    <div className={styles.shortcutsSpacer} />
    <ElapsedTimer startedAt={startedAt} className={styles.shortcutLabel} />
  </div>
)
