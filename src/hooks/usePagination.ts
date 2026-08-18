import { useEffect, useMemo, useState } from 'react'

export const usePagination = <T,>(rows: T[], initialRowsPerPage = 10) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage)

  useEffect(() => {
    setPage(0)
  }, [rows.length])

  const pageRows = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, page, rowsPerPage],
  )

  const changePage = (_: unknown, newPage: number) => setPage(newPage)

  const changeRowsPerPage = (e: { target: { value: unknown } }) => {
    setRowsPerPage(Number(e.target.value))
    setPage(0)
  }

  return { page, rowsPerPage, pageRows, changePage, changeRowsPerPage }
}
