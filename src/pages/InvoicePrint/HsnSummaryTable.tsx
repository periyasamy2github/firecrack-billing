import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { formatAmount } from '../../utils/format'
import type { hsnSummary } from '../../utils/billing'
import styles from '../../css/pages/A4Invoice.module.css'

interface HsnSummaryTableProps {
  rows: ReturnType<typeof hsnSummary>
}

export const HsnSummaryTable = ({ rows }: HsnSummaryTableProps) => (
  <>
    <Typography className={styles.partyLabel}>HSN summary</Typography>
    <Table size="small" className={styles.hsnTable}>
      <TableHead>
        <TableRow>
          {['HSN', 'GST%', 'Taxable', 'CGST', 'SGST', 'Total tax'].map((h) => (
            <TableCell key={h} align={h === 'HSN' ? 'left' : 'right'} className={styles.hsnHeadCell}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.hsn}>
            <TableCell>{row.hsn}</TableCell>
            <TableCell align="right">{row.rate}%</TableCell>
            <TableCell align="right">{formatAmount(row.taxable)}</TableCell>
            <TableCell align="right">{formatAmount(row.cgst)}</TableCell>
            <TableCell align="right">{formatAmount(row.sgst)}</TableCell>
            <TableCell align="right">{formatAmount(row.cgst + row.sgst)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </>
)
