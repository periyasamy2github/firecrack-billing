import { Card, TableCell, TableRow } from '@mui/material'
import type { ReactNode } from 'react'
import styles from './TableCard.module.css'

/** Card wrapper for list tables — the table scrolls sideways, the footer (totals / pagination) stays put. */
export const TableCard = ({ children, footer }: { children: ReactNode; footer?: ReactNode }) => (
  <Card className={styles.card}>
    <div className={styles.scroll}>{children}</div>
    {footer}
  </Card>
)

/** Full-width "nothing matched" row for an empty table body. */
export const TableEmptyRow = ({ colSpan, message }: { colSpan: number; message: string }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center" className={styles.emptyCell}>
      {message}
    </TableCell>
  </TableRow>
)
