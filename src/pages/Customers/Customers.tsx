import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { SearchField } from '../../components/SearchField'
import { ListFooter } from '../../components/ListFooter'
import { Mono } from '../../components/Mono'
import { TableCard, TableEmptyRow, TableLoadingRow } from '../../components/TableCard'
import { useDispatch, useSelector } from '../../redux/store'
import { loadCustomers } from '../../redux/customersSlice'
import { useListPage } from '../../hooks/useListPage'
import { usePageTitle } from '../../hooks/usePageTitle'
import { formatBillDate, formatCurrency, formatInt } from '../../utils/format'
import type { Customer } from '../../types'
import styles from '../../css/pages/Customers.module.css'

export const Customers = () => {
  usePageTitle('Customers')
  const dispatch = useDispatch()
  const customers = useSelector((state) => state.customers.items)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void dispatch(loadCustomers()).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { query, setQuery, searchInputRef, filtered, page, rowsPerPage, pageRows, changePage, changeRowsPerPage } =
    useListPage<Customer>({
      rows: customers,
      matchesSearch: (customer, search) => {
        const q = search.trim().toLowerCase()
        return !q || customer.name.toLowerCase().includes(q) || customer.mobile.includes(q)
      },
    })

  return (
    <>
      <PageHeader title="Customers" crumb={`${customers.length} customers`} />
      <PageContent>
        <SearchField placeholder="Search by name or mobile… (/)" value={query} onChange={setQuery} inputRef={searchInputRef} sx={{ maxWidth: 340 }} />

        <TableCard footer={<ListFooter count={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={changePage} onRowsPerPageChange={changeRowsPerPage} />}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell align="right">Bills</TableCell>
                <TableCell align="right">Total spent</TableCell>
                <TableCell align="right">Last bill</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && pageRows.map((customer) => (
                <TableRow key={customer.mobile} hover>
                  <TableCell><Typography className={styles.customerName}>{customer.name}</Typography></TableCell>
                  <TableCell><Mono sx={{ fontSize: 12 }}>{customer.mobile}</Mono></TableCell>
                  <TableCell align="right"><Mono>{formatInt(customer.bills)}</Mono></TableCell>
                  <TableCell align="right"><Mono>{formatCurrency(customer.spent)}</Mono></TableCell>
                  <TableCell align="right"><Typography className={styles.lastBill}>{formatBillDate(new Date(customer.lastBilledAt))}</Typography></TableCell>
                </TableRow>
              ))}
              {loading && <TableLoadingRow colSpan={5} />}
              {!loading && filtered.length === 0 && <TableEmptyRow colSpan={5} message="No customers yet" />}
            </TableBody>
          </Table>
        </TableCard>
      </PageContent>
    </>
  )
}

export default Customers
