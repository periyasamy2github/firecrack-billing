import { Typography } from '@mui/material'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import { Mono } from '../../components/Mono'
import { TEMPLATE_COLUMNS } from './ProductImport'
import styles from '../../css/pages/ProductImport.module.css'

interface UploadStageProps {
  onFileSelected: (file: File) => void
}

export const UploadStage = ({ onFileSelected }: UploadStageProps) => {
  return (
    <div className={styles.uploadStage}>
      <label className={styles.dropZone}>
        <input
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFileSelected(file)
            e.target.value = ''
          }}
        />
        <FileUploadOutlinedIcon className={styles.dropZoneIcon} />
        <Typography className={styles.dropZoneTitle}>Choose an Excel file</Typography>
        <Typography variant="caption">.xlsx or .xls — nothing is saved until you start the import</Typography>
      </label>

      <div className={styles.helpPanel}>
        <Typography className={styles.helpTitle}>Columns the file needs</Typography>
        <div className={styles.columnList}>
          {TEMPLATE_COLUMNS.map((column) => (
            <Mono key={column} sx={{ fontSize: 11.5 }}>{column}</Mono>
          ))}
        </div>
        <Typography variant="caption" className={styles.helpNote}>
          <b>lowStockThreshold</b> is optional and defaults to 15. A barcode already in the catalogue updates that
          product instead of creating a second one.
        </Typography>
      </div>
    </div>
  )
}
