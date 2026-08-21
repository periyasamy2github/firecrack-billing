import { LinearProgress, Typography } from '@mui/material'
import { Mono } from '../../components/Mono'
import { formatInt } from '../../utils/format'
import styles from '../../css/pages/ProductImport.module.css'

interface ImportingStageProps {
  fileName: string
  savedCount: number
  readyCount: number
}

export const ImportingStage = ({ fileName, savedCount, readyCount }: ImportingStageProps) => {
  const percent = Math.round((savedCount / Math.max(readyCount, 1)) * 100)
  
  return (
    <div className={styles.progressPanel}>
      <div className={styles.progressHead}>
        <Typography className={styles.progressTitle}>Importing products</Typography>
        <div className={styles.filterSpacer} />
        <Mono sx={{ fontSize: 13, fontWeight: 700 }}>{percent}%</Mono>
      </div>
      <LinearProgress
        variant="determinate"
        value={percent}
        className={styles.progressBar}
        aria-label="Import progress"
      />
      <Typography variant="caption" role="status" aria-live="polite" className={styles.progressMeta}>
        {formatInt(savedCount)} of {formatInt(readyCount)} rows written · {fileName}
      </Typography>
    </div>
  )
}
