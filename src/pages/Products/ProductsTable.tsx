import type { ReactNode } from 'react'
import { CircularProgress, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { Mono } from '../../components/Mono'
import { StatusPill } from '../../components/StatusPill'
import { TableCard, TableEmptyRow, TableLoadingRow } from '../../components/TableCard'
import { stockStatus } from '../../data/products'
import { formatAmount } from '../../utils/format'
import type { Product } from '../../types'
import styles from '../../css/pages/Products.module.css'

interface ProductsTableProps {
  rows: Product[]
  loading: boolean
  filteredCount: number
  viewingAllCounters: boolean
  canManage: boolean
  isPending: (key: string) => boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  footer: ReactNode
}

export const ProductsTable = ({ rows, loading, filteredCount, viewingAllCounters, canManage, isPending, onEdit, onDelete, footer }: ProductsTableProps) => {
  const colSpan = viewingAllCounters ? 10 : 9

  return (
    <TableCard footer={footer}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Barcode</TableCell>
            {viewingAllCounters && <TableCell>Counter</TableCell>}
            <TableCell>Item name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell align="right">MRP</TableCell>
            <TableCell align="right">Rate</TableCell>
            <TableCell align="right">Stock</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading && rows.map((p) => {
            const status = stockStatus(p)
            const key = `${p.counterId}:${p.code}`
            return (
              <TableRow key={key} hover>
                <TableCell><Mono sx={{ fontWeight: 600 }}>{p.code}</Mono></TableCell>
                {viewingAllCounters && <TableCell>{p.counter}</TableCell>}
                <TableCell><Typography className={styles.itemName}>{p.name}</Typography></TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell className={styles.unitCell}>{p.unit}</TableCell>
                <TableCell align="right"><Mono sx={{ color: 'text.secondary' }}>{formatAmount(p.mrp)}</Mono></TableCell>
                <TableCell align="right"><Mono sx={{ fontWeight: 600 }}>{formatAmount(p.rate)}</Mono></TableCell>
                <TableCell align="right">
                  <Mono sx={{ fontWeight: 650, color: status.tone === 'due' ? 'var(--due)' : status.tone === 'hold' ? 'var(--ember-ink)' : 'var(--ink)' }}>
                    {p.stock}
                  </Mono>
                </TableCell>
                <TableCell><StatusPill tone={status.tone} label={status.label} /></TableCell>
                <TableCell align="right">
                  {canManage && (isPending(key) ? (
                    <CircularProgress size={16} />
                  ) : (
                    <>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit(p)}><EditOutlinedIcon className={styles.actionIcon} /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => onDelete(p)}><DeleteOutlineRoundedIcon className={styles.actionIcon} /></IconButton>
                      </Tooltip>
                    </>
                  ))}
                </TableCell>
              </TableRow>
            )
          })}
          {loading && <TableLoadingRow colSpan={colSpan} />}
          {!loading && filteredCount === 0 && <TableEmptyRow colSpan={colSpan} message="No products match this search." />}
        </TableBody>
      </Table>
    </TableCard>
  )
}
