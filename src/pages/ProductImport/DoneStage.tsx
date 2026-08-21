import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import { Mono } from '../../components/Mono'
import { KpiCard } from '../../components/KpiCard'
import { TableCard } from '../../components/TableCard'
import { formatInt } from '../../utils/format'
import type { ImportRow } from './types'
import type { ImportResult } from '../../types'
import styles from '../../css/pages/ProductImport.module.css'

interface DoneStageProps {
  fileName: string
  totalRows: number
  summary: { created: number; updated: number; skipped: number }
  errorRows: ImportRow[]
  serverErrors: ImportResult['errors']
  onViewProducts: () => void
  onReset: () => void
}

export const DoneStage = ({ fileName, totalRows, summary, errorRows, serverErrors, onViewProducts, onReset }: DoneStageProps) => {
  return (
    <>
      <div className={styles.doneBanner}>
        <CheckCircleOutlineRoundedIcon className={styles.doneIcon} />
        <div>
          <Typography className={styles.doneTitle}>Import finished</Typography>
          <Typography className={styles.doneBody}>{fileName} · {formatInt(totalRows)} rows read</Typography>
        </div>
        <div className={styles.filterSpacer} />
        <Button variant="contained" onClick={onViewProducts}>View products</Button>
        <Button onClick={onReset}>Import another file</Button>
      </div>

      <div className={styles.summaryGrid}>
        <KpiCard label="New products" value={formatInt(summary.created)} icon={AddCircleOutlineRoundedIcon} tone="paid" />
        <KpiCard label="Updated products" value={formatInt(summary.updated)} icon={AutorenewRoundedIcon} tone="info" />
        <KpiCard label="Rows skipped" value={formatInt(summary.skipped)} icon={ErrorOutlineRoundedIcon} tone="due" />
      </div>

      {summary.skipped > 0 && (
        <TableCard>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Row</TableCell>
                <TableCell>Barcode</TableCell>
                <TableCell>Why it was skipped</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errorRows.map((row) => (
                <TableRow key={`client-${row.index}`} hover>
                  <TableCell className={styles.rowIndex}>{row.index + 1}</TableCell>
                  <TableCell><Mono sx={{ fontSize: 12 }}>{row.code}</Mono></TableCell>
                  <TableCell><Typography className={styles.errorReason}>{row.errors.join(' · ')}</Typography></TableCell>
                </TableRow>
              ))}
              {serverErrors.map((error, i) => (
                <TableRow key={`server-${i}`} hover>
                  <TableCell className={styles.rowIndex}>—</TableCell>
                  <TableCell><Mono sx={{ fontSize: 12 }}>{error.code}</Mono></TableCell>
                  <TableCell><Typography className={styles.errorReason}>{error.message}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}
    </>
  )
}
