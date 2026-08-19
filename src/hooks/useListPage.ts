import { useRef, useState } from 'react'
import { useKeyShortcuts } from './useKeyShortcuts'
import { usePagination } from './usePagination'

interface ListPageOptions<T, F extends string> {
  rows: T[]
  matchesSearch: (row: T, query: string) => boolean
  filters?: readonly F[]
  matchesFilter?: (row: T, filter: F) => boolean
}

export const useListPage = <T, F extends string = string>({
  rows,
  matchesSearch,
  filters,
  matchesFilter,
}: ListPageOptions<T, F>) => {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<F>((filters?.[0] ?? '') as F)
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

  return {
    query,
    setQuery,
    searchInputRef,
    filter,
    setFilter,
    counts,
    filtered,
    ...usePagination(filtered),
  }
}
