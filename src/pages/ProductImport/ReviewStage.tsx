import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import { Mono } from '../../components/Mono'
import { TableCard } from '../../components/TableCard'
import { formatInt } from '../../utils/format'
import type { ImportRow } from './types'
import styles from '../../css/pages/ProductImport.module.css'

interface ReviewStageProps {
  fileName: string
  totalRows: number
  errorRows: ImportRow[]
  readyCount: number
  onReset: () => void
  onStartImport: () => void
}

export const ReviewStage = ({ fileName, totalRows, errorRows, readyCount, onReset, onStartImport }: ReviewStageProps) => {
  return (
    <>
      <div className={`${styles.reviewBanner} ${errorRows.length === 0 ? styles.reviewBannerOk : styles.reviewBannerWarn}`}>
        {errorRows.length === 0
          ? <CheckCircleOutlineRoundedIcon className={styles.reviewIcon} />
          : <ErrorOutlineRoundedIcon className={styles.reviewIcon} />}
        <div>
          <Typography className={styles.reviewTitle}>
            {errorRows.length === 0
              ? 'Every row is ready to import'
              : `${formatInt(errorRows.length)} row${errorRows.length === 1 ? '' : 's'} need fixing`}
          </Typography>
          <Typography className={styles.reviewBody}>
            {errorRows.length === 0
              ? `${formatInt(totalRows)} rows checked, nothing to fix.`
              : `Listed below and skipped on import. The other ${formatInt(readyCount)} row${readyCount === 1 ? '' : 's'} go through.`}
          </Typography>
        </div>
      </div>

      {errorRows.length > 0 && (
        <TableCard>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Row</TableCell>
                <TableCell>Barcode</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>What needs fixing</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errorRows.map((row) => (
                <TableRow key={row.index} hover>
                  <TableCell className={styles.rowIndex}>{row.index + 1}</TableCell>
                  <TableCell><Mono sx={{ fontSize: 12 }}>{row.code}</Mono></TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell><Typography className={styles.errorReason}>{row.errors.join(' · ')}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}

      <div className={styles.actionBar}>
        <Typography variant="caption" className={styles.actionNote}>
          {readyCount > 0
            ? `${formatInt(readyCount)} row${readyCount === 1 ? '' : 's'} will be imported from ${fileName}.`
            : 'Nothing can be imported until at least one row is fixed.'}
        </Typography>
        <div className={styles.filterSpacer} />
        <Button onClick={onReset}>Choose a different file</Button>
        <Button variant="contained" size="large" disabled={readyCount === 0} onClick={onStartImport}>
          Start import
        </Button>
      </div>
    </>
  )
}
