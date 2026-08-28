import { Table, TableBody, TableCell, TableRow } from '@mui/material'
import { formatAmount, formatCurrency } from '../../utils/format'
import type { BillTotals } from '../../types'
import styles from '../../css/pages/A4Invoice.module.css'

interface InvoiceChargesTableProps {
  totals: BillTotals
  gst: boolean
  cgstLabel: string
  sgstLabel: string
  /** e.g. "10%" — printed beside the ₹ discount so both figures appear. */
  discountPercent?: string | null
}

// One charges breakdown for both invoice kinds — the tax rows only appear when GST applies.
export const InvoiceChargesTable = ({ totals, gst, cgstLabel, sgstLabel, discountPercent }: InvoiceChargesTableProps) => {
  const rows: [string, string][] = [
    ...(totals.hasMrp ? [['MRP value', formatAmount(totals.mrpValue)] as [string, string]] : []),
    ['Sub total', formatAmount(totals.gross)],
    ...(totals.billDiscountAmount > 0
      ? [[`Bill discount${discountPercent ? ` (${discountPercent})` : ''}`, `− ${formatAmount(totals.billDiscountAmount)}`] as [string, string]]
      : []),
    ...(gst
      ? [
          ['Taxable value', formatAmount(totals.taxable)] as [string, string],
          [cgstLabel, formatAmount(totals.cgst)] as [string, string],
          [sgstLabel, formatAmount(totals.sgst)] as [string, string],
        ]
      : []),
    ['Round off', formatAmount(totals.roundOff)],
  ]

  return (
    <Table size="small" className={gst ? styles.chargesTable : `${styles.chargesTable} ${styles.chargesTableNoGst}`}>
      <TableBody>
        {rows.map(([label, value]) => (
          <TableRow key={label}>
            <TableCell>{label}</TableCell>
            <TableCell align="right">{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <tfoot>
        <TableRow>
          <TableCell className={styles.grandTotalLabelCell}>Grand total</TableCell>
          <TableCell align="right" className={styles.grandTotalValueCell}>{formatCurrency(totals.grandTotal)}</TableCell>
        </TableRow>
      </tfoot>
    </Table>
  )
}
