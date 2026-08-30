import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { computeLineAmounts } from '../../utils/billing'
import { formatAmount } from '../../utils/format'
import type { Bill, BillTotals } from '../../types'
import styles from '../../css/pages/A4Invoice.module.css'

interface InvoiceItemsTableProps {
  items: Bill['items']
  gst: boolean
  totals: BillTotals
  cgstLabel: string
  sgstLabel: string
}

export const InvoiceItemsTable = ({ items, gst, totals, cgstLabel, sgstLabel }: InvoiceItemsTableProps) => {
  const showMrp = items.some((i) => i.product.mrp != null)
  const columns = [
    '#',
    'Description of goods',
    'HSN',
    ...(showMrp ? ['MRP'] : []),
    'Rate',
    'Qty',
    ...(gst ? ['Taxable', cgstLabel, sgstLabel] : []),
    'Amount',
  ]

  return (
    <Table size="small" className={styles.itemsTable}>
      <TableHead>
        <TableRow>
          {columns.map((h) => (
            <TableCell key={h} align={h === 'Description of goods' || h === '#' ? 'left' : 'right'} className={styles.headCell}>
              {h}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, idx) => {
          const { rate, taxable, gstAmount } = computeLineAmounts(item, gst)
          return (
            <TableRow key={item.lineId}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{item.product.name}</TableCell>
              <TableCell align="right">{item.product.hsn}</TableCell>
              {showMrp && <TableCell align="right">{item.product.mrp != null ? formatAmount(item.product.mrp) : ''}</TableCell>}
              <TableCell align="right">{formatAmount(rate)}</TableCell>
              <TableCell align="right">{item.qty}</TableCell>
              {gst && (
                <>
                  <TableCell align="right">{formatAmount(taxable)}</TableCell>
                  <TableCell align="right">{formatAmount(gstAmount / 2)}</TableCell>
                  <TableCell align="right">{formatAmount(gstAmount / 2)}</TableCell>
                </>
              )}
              <TableCell align="right">{formatAmount(taxable + gstAmount)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
      <tfoot>
        <TableRow>
          <TableCell colSpan={showMrp ? 5 : 4} className={styles.footCell} />
          <TableCell align="right" className={styles.footCellBold}>{totals.qtyCount}</TableCell>
          {gst && (
            <>
              <TableCell align="right" className={styles.footCellBold}>{formatAmount(totals.taxable)}</TableCell>
              <TableCell align="right" className={styles.footCellBold}>{formatAmount(totals.cgst)}</TableCell>
              <TableCell align="right" className={styles.footCellBold}>{formatAmount(totals.sgst)}</TableCell>
            </>
          )}
          <TableCell align="right" className={styles.footCellBold}>{formatAmount(totals.taxable + totals.cgst + totals.sgst)}</TableCell>
        </TableRow>
      </tfoot>
    </Table>
  )
}
