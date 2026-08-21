import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { BillsPage } from '../types'
import { errorMessage } from '../utils/errorMessage'
import type { BillFilter } from '../utils/billFilters'

const emptyPage: BillsPage = {
  data: [],
  counts: {},
  totals: { discount: 0, gst: 0, grand: 0 },
}

interface UseBillsPageOptions {
  scope: string
  from?: string
  to?: string
}

export const useBillsPage = ({ scope, from, to }: UseBillsPageOptions) => {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<BillFilter>('All')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [reloadCount, setReloadCount] = useState(0)

  const [response, setResponse] = useState<BillsPage>(emptyPage)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // A new search starts at page 1.
  useEffect(() => {
    setPage(0)
  }, [scope, query, filter, from, to])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    // 'All' means no payment/status filter.
    api.loadBills({
      scope,
      page: page + 1,
      perPage: rowsPerPage,
      search: query,
      filter: filter === 'All' ? undefined : filter,
      from,
      to,
    })
      .then((loaded) => { if (!cancelled) setResponse(loaded) })
      .catch((err) => {
        if (cancelled) return
        setResponse(emptyPage)
        setError(errorMessage(err, 'Could not load these bills'))
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [scope, query, filter, from, to, page, rowsPerPage, reloadCount])

  return {
    query,
    setQuery,
    filter,
    setFilter,
    page,
    rowsPerPage,
    changePage: (_: unknown, newPage: number) => setPage(newPage),
    changeRowsPerPage: (e: { target: { value: unknown } }) => {
      setRowsPerPage(Number(e.target.value))
      setPage(0)
    },
    result: {
      bills: response.data,
      total: response.meta?.total ?? response.data.length,
      counts: response.counts,
      totals: response.totals,
      loading,
      error,
    },
    refetch: () => setReloadCount((count) => count + 1),
  }
}
