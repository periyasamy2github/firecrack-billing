import type { ReactNode } from 'react'
import { TablePaginationBar } from './TablePaginationBar'
import styles from './ListFooter.module.css'

interface ListFooterProps {
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (event: unknown, page: number) => void
  onRowsPerPageChange: (event: { target: { value: unknown } }) => void
  summary?: ReactNode
}

export const ListFooter = ({ summary, ...pagination }: ListFooterProps) => (
  <>
    {summary && <div className={styles.summary}>{summary}</div>}
    <TablePaginationBar {...pagination} />
  </>
)
