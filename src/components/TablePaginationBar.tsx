import { MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material'

interface TablePaginationBarProps {
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (event: unknown, page: number) => void
  onRowsPerPageChange: (event: { target: { value: unknown } }) => void
}

export const TablePaginationBar = ({ count, page, rowsPerPage, onPageChange, onRowsPerPageChange }: TablePaginationBarProps) => {
  const pageCount = Math.max(1, Math.ceil(count / rowsPerPage))
  const from = count === 0 ? 0 : page * rowsPerPage + 1
  const to = Math.min(count, (page + 1) * rowsPerPage)

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      spacing={1.5}
      sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Rows per page</Typography>
        <TextField select size="small" value={rowsPerPage} onChange={onRowsPerPageChange} sx={{ width: 72 }}>
          {[10, 25, 50].map((n) => (
            <MenuItem key={n} value={n}>{n}</MenuItem>
          ))}
        </TextField>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {count === 0 ? '0 of 0' : `${from}–${to} of ${count}`}
        </Typography>
      </Stack>

      <Pagination
        count={pageCount}
        page={page + 1}
        onChange={(event, newPage) => onPageChange(event, newPage - 1)}
        size="small"
        shape="rounded"
        color="primary"
      />
    </Stack>
  )
}
