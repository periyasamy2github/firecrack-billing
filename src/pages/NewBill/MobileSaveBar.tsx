import { Button, CircularProgress, Typography } from '@mui/material'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import { Mono } from '../../components/Mono'
import { formatInt } from '../../utils/format'
import styles from '../../css/pages/NewBill.module.css'

interface MobileSaveBarProps {
  grandTotal: number
  disabled: boolean
  saving: boolean
  onSaveAndPrint: () => void
  onSaveOnly: () => void
}

export const MobileSaveBar = ({ grandTotal, disabled, saving, onSaveAndPrint, onSaveOnly }: MobileSaveBarProps) => (
  <div className={`${styles.mobileSaveBar} mobile-only no-print`}>
    <div className={styles.mobileSaveTotal}>
      <Typography className={styles.mobileSaveLabel}>Total</Typography>
      <Mono className={styles.mobileSaveValue}>₹{formatInt(grandTotal)}</Mono>
    </div>
    <Button variant="outlined" size="small" disabled={disabled} onClick={onSaveOnly}>Save</Button>
    <Button
      variant="contained"
      size="small"
      startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <PrintOutlinedIcon />}
      disabled={disabled}
      onClick={onSaveAndPrint}
    >
      {saving ? 'Saving…' : 'Save & Print'}
    </Button>
  </div>
)
