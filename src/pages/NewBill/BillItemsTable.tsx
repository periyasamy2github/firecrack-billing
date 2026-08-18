import { IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import type { BillLineItem } from '../../types'
import { computeLineAmounts } from '../../utils/billing'
import { formatAmount } from '../../utils/format'
import { Mono } from '../../components/Mono'
import styles from './BillItemsTable.module.css'

interface BillItemsTableProps {
  items: BillLineItem[]
  gstApplicable: boolean
  onQtyChange: (lineId: string, qty: number) => void
  onRemove: (lineId: string) => void
}

export const BillItemsTable = ({ items, gstApplicable, onQtyChange, onRemove }: BillItemsTableProps) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell className={styles.idCol}>#</TableCell>
        <TableCell>Item</TableCell>
        <TableCell>HSN</TableCell>
        <TableCell align="right">MRP</TableCell>
        <TableCell align="right">Rate</TableCell>
        <TableCell align="right" className={styles.qtyCol}>Qty</TableCell>
        {gstApplicable && <TableCell align="right">Taxable</TableCell>}
        {gstApplicable && <TableCell align="right">GST</TableCell>}
        <TableCell align="right">Amount</TableCell>
        <TableCell className={styles.actionCol} />
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map((item, idx) => {
        const { rate, taxable, amount } = computeLineAmounts(item, gstApplicable)
        return (
          <TableRow key={item.lineId} hover>
            <TableCell>
              <Typography variant="caption">{idx + 1}</Typography>
            </TableCell>
            <TableCell>
              <Typography className={styles.itemName}>{item.product.name}</Typography>
              <Typography variant="caption">{item.product.code} · {item.product.unit}</Typography>
            </TableCell>
            <TableCell>
              <Mono sx={{ fontSize: 11, color: 'text.secondary' }}>{item.product.hsn}</Mono>
            </TableCell>
            <TableCell align="right"><Mono sx={{ fontSize: 12, color: 'text.secondary', textDecoration: 'line-through' }}>{formatAmount(item.product.mrp)}</Mono></TableCell>
            <TableCell align="right"><Mono sx={{ fontSize: 12, fontWeight: 600 }}>{formatAmount(rate)}</Mono></TableCell>
            <TableCell align="right">
              <TextField
                type="number"
                size="small"
                value={item.qty}
                onChange={(e) => onQtyChange(item.lineId, Math.max(1, Number(e.target.value) || 1))}
                inputProps={{ min: 1, className: styles.numberInput }}
                className={styles.numberField}
              />
            </TableCell>
            {gstApplicable && <TableCell align="right"><Mono sx={{ fontSize: 12 }}>{formatAmount(taxable)}</Mono></TableCell>}
            {gstApplicable && <TableCell align="right"><Typography variant="caption">{item.product.gstRate}%</Typography></TableCell>}
            <TableCell align="right"><Mono sx={{ fontSize: 12, fontWeight: 600 }}>{formatAmount(amount)}</Mono></TableCell>
            <TableCell>
              <IconButton size="small" onClick={() => onRemove(item.lineId)} aria-label={`Remove ${item.product.name}`}>
                <DeleteOutlineRoundedIcon className={styles.removeIcon} />
              </IconButton>
            </TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  </Table>
)
