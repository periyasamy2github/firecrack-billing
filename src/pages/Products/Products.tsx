import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { Mono } from '../../components/Mono'
import { StatusPill } from '../../components/StatusPill'
import { SearchField } from '../../components/SearchField'
import { TableCard, TableEmptyRow } from '../../components/TableCard'
import { TablePaginationBar } from '../../components/TablePaginationBar'
import { ProductDialog } from './ProductDialog'
import { productCategories, stockStatus } from '../../data/mockProducts'
import { formatAmount } from '../../utils/format'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useKeyShortcuts } from '../../hooks/useKeyShortcuts'
import { usePagination } from '../../hooks/usePagination'
import { ROUTES } from '../../utils/routes'
import { useToast } from '../../hooks/useToast'
import type { Product, ProductCategory } from '../../types'
import styles from './Products.module.css'

const CATEGORY_KEYS = ['All', ...productCategories] as const

export const Products = () => {
  const navigate = useNavigate()
  const { branches, isSuperAdmin, products, importProducts, saveProduct, deleteProduct } = useStoreScope()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProductCategory | 'All'>('All')
  const [addOpen, setAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const showToast = useToast()

  useKeyShortcuts({
    '/': () => searchInputRef.current?.focus(),
    ...Object.fromEntries(CATEGORY_KEYS.map((key, i) => [String(i + 1), () => setCategory(key)])),
  })

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length }
    productCategories.forEach((c) => { counts[c] = products.filter((p) => p.category === c).length })
    return counts
  }, [products])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'All' && p.category !== category) return false
      if (!q) return true
      return p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    })
  }, [products, search, category])

  const lowStockCount = useMemo(() => products.filter((p) => p.stock <= p.lowStockThreshold).length, [products])

  const { page, rowsPerPage, pageRows, changePage, changeRowsPerPage } = usePagination(filtered)

  const existingCodes = useMemo(() => new Set(products.map((p) => p.code.toUpperCase())), [products])

  const confirmDelete = async () => {
    if (!deletingProduct) return
    const { code, name } = deletingProduct
    setDeletingProduct(null)
    await deleteProduct(code)
    showToast(`${name} deleted`, 'warning')
  }

  const handleProductSubmit = async (rows: Product[]) => {
    if (editingProduct) {
      setEditingProduct(null)
      await saveProduct(rows[0])
      showToast(`${rows[0].name} updated`)
    } else {
      await importProducts(rows)
      showToast(`${rows.length} product${rows.length === 1 ? '' : 's'} added`)
    }
  }

  return (
    <>
      <PageHeader
        title="Products"
        crumb={isSuperAdmin ? `${products.length} items · shared catalog across ${branches.length} counters` : `${products.length} items · ${lowStockCount} running low`}
        actions={
          <>
            {isSuperAdmin && <Button size="small" startIcon={<FileUploadOutlinedIcon />} onClick={() => navigate(ROUTES.productImport)}>Import from Excel</Button>}
            {isSuperAdmin && <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setAddOpen(true)}>Add item</Button>}
          </>
        }
      />
      <PageContent>
        <div className={styles.filterRow}>
          <SearchField placeholder="Search by code or item name… (/)" value={search} onChange={setSearch} inputRef={searchInputRef} sx={{ flex: 1, minWidth: 240 }} />
          {CATEGORY_KEYS.map((c) => (
            <Chip
              key={c}
              label={`${c} ${categoryCounts[c] ?? 0}`}
              size="small"
              onClick={() => setCategory(c)}
              color={category === c ? 'primary' : undefined}
              variant={category === c ? 'filled' : 'outlined'}
            />
          ))}
        </div>

        <TableCard footer={<TablePaginationBar count={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={changePage} onRowsPerPageChange={changeRowsPerPage} />}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Barcode</TableCell>
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
                {pageRows.map((p) => {
                  const status = stockStatus(p)
                  return (
                    <TableRow key={p.code} hover>
                      <TableCell><Mono sx={{ fontWeight: 600 }}>{p.code}</Mono></TableCell>
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
                        {isSuperAdmin && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => setEditingProduct(p)}><EditOutlinedIcon className={styles.actionIcon} /></IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => setDeletingProduct(p)}><DeleteOutlineRoundedIcon className={styles.actionIcon} /></IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && <TableEmptyRow colSpan={9} message="No products match this search." />}
              </TableBody>
            </Table>
        </TableCard>
      </PageContent>

      {isSuperAdmin && (
        <>
          <ProductDialog
            key={editingProduct ? `edit-${editingProduct.code}` : 'add'}
            mode={editingProduct ? 'edit' : 'add'}
            open={addOpen || Boolean(editingProduct)}
            onClose={() => { setAddOpen(false); setEditingProduct(null) }}
            product={editingProduct}
            existingCodes={existingCodes}
            onSubmit={handleProductSubmit}
          />
        </>
      )}

      <Dialog open={Boolean(deletingProduct)} onClose={() => setDeletingProduct(null)} fullWidth maxWidth="xs">
        <DialogTitle>Delete product?</DialogTitle>
        {deletingProduct && (
          <DialogContent>
            <Typography color="text.secondary">
              Remove <b>{deletingProduct.name}</b> ({deletingProduct.code}) from the catalogue? Bills already raised keep
              their copy of the item.
            </Typography>
          </DialogContent>
        )}
        <DialogActions className={styles.dialogActions}>
          <Button onClick={() => setDeletingProduct(null)}>Keep product</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Products
