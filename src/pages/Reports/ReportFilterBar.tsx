import type { RefObject } from 'react'
import { Card, MenuItem, TextField } from '@mui/material'
import { SearchField } from '../../components/SearchField'
import { BILL_FILTERS, type BillFilter } from '../../utils/billFilters'
import type { Counter } from '../../types'
import styles from '../../css/pages/Reports.module.css'

export interface ReportFilters {
  query: string
  dateFrom: string
  dateTo: string
  counterId: string
  payment: BillFilter
}

interface ReportFilterBarProps {
  filters: ReportFilters
  onChange: (patch: Partial<ReportFilters>) => void
  counters: Counter[] | null
  paymentCounts: Partial<Record<BillFilter, number>>
  searchInputRef: RefObject<HTMLInputElement | null>
}

// counters = null hides the counter picker (staff, or admin already narrowed by the sidebar).
export const ReportFilterBar = ({ filters, onChange, counters, paymentCounts, searchInputRef }: ReportFilterBarProps) => (
  <Card className={styles.filterCard}>
    <div className={styles.filterRow}>
      <SearchField placeholder="Bill number or customer mobile… (/)" value={filters.query} onChange={(query) => onChange({ query })} inputRef={searchInputRef} sx={{ flex: 1, minWidth: 260 }} />
      <TextField
        label="From"
        type="date"
        value={filters.dateFrom}
        onChange={(e) => onChange({ dateFrom: e.target.value })}
        size="small"
        InputLabelProps={{ shrink: true }}
        className={styles.dateField}
      />
      <TextField
        label="To"
        type="date"
        value={filters.dateTo}
        onChange={(e) => onChange({ dateTo: e.target.value })}
        size="small"
        InputLabelProps={{ shrink: true }}
        className={styles.dateField}
      />
      {counters && (
        <TextField
          label="Counter"
          select
          value={filters.counterId}
          onChange={(e) => onChange({ counterId: e.target.value })}
          size="small"
          className={styles.counterField}
        >
          <MenuItem value="all">All counters</MenuItem>
          {counters.map((counter) => (
            <MenuItem key={counter.id} value={counter.id}>{counter.name}</MenuItem>
          ))}
        </TextField>
      )}
      <TextField
        label="Payment"
        select
        value={filters.payment}
        onChange={(e) => onChange({ payment: e.target.value as BillFilter })}
        size="small"
        className={styles.paymentField}
      >
        {BILL_FILTERS.map((key) => (
          <MenuItem key={key} value={key}>{key} ({paymentCounts[key] ?? 0})</MenuItem>
        ))}
      </TextField>
    </div>
  </Card>
)
