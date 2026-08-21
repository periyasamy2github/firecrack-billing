import { useEffect, useMemo, useRef, useState } from 'react'
import { useKeyShortcuts } from './useKeyShortcuts'

interface ListPageOptions<T, F extends string> {
  rows: T[]
  matchesSearch: (row: T, query: string) => boolean
  filters?: readonly F[]
  matchesFilter?: (row: T, filter: F) => boolean
}

// Search, filter and paging for a list already held in full. Bills page on the server.
export const useListPage = <T, F extends string = string>({
  rows,
  matchesSearch,
  filters,
  matchesFilter,
}: ListPageOptions<T, F>) => {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<F>((filters?.[0] ?? '') as F)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useKeyShortcuts({
    '/': () => searchInputRef.current?.focus(),
    ...Object.fromEntries((filters ?? []).map((key, index) => [String(index + 1), () => setFilter(key)])),
  })

  const counts = {} as Record<F, number>
  for (const key of filters ?? []) {
    counts[key] = matchesFilter ? rows.filter((row) => matchesFilter(row, key)).length : rows.length
  }

  const filtered = rows.filter(
    (row) => (!matchesFilter || !filters?.length || matchesFilter(row, filter)) && matchesSearch(row, query),
  )

  useEffect(() => {
    setPage(0)
  }, [filtered.length])

  const pageRows = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  )

  return {
    query,
    setQuery,
    searchInputRef,
    filter,
    setFilter,
    counts,
    filtered,
    page,
    rowsPerPage,
    pageRows,
    changePage: (_: unknown, newPage: number) => setPage(newPage),
    changeRowsPerPage: (e: { target: { value: unknown } }) => {
      setRowsPerPage(Number(e.target.value))
      setPage(0)
    },
  }
}
