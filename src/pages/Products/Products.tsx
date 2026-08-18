import { useMemo, useRef, useState } from 'react'
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { Mono } from '../../components/Mono'
import { StatusPill } from '../../components/StatusPill'
import { SearchField } from '../../components/SearchField'
import { TableCard, TableEmptyRow } from '../../components/TableCard'
import { TablePaginationBar } from '../../components/TablePaginationBar'
import { BulkImportDialog } from './BulkImportDialog'
import { ProductDialog } from './ProductDialog'
import { productCategories, stockStatus } from '../../data/mockProducts'
import { formatAmount } from '../../utils/format'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useKeyShortcuts } from '../../hooks/useKeyShortcuts'
import { usePagination } from '../../hooks/usePagination'
import { useToast } from '../../hooks/useToast'
import type { Product, ProductCategory } from '../../types'
import styles from './Products.module.css'

const CATEGORY_KEYS = ['All', ...productCategories] as const

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.detailRow}>
    <Typography className={styles.detailLabel}>{label}</Typography>
    <Typography className={styles.detailValue}>{value}</Typography>
  </div>
)

export const Products = () => {
  const { branches, isSuperAdmin, products, importProducts, saveProduct } = useStoreScope()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProductCategory | 'All'>('All')
  const [importOpen, setImportOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
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

  const handleImport = (rows: Product[]) => {
    importProducts(rows)
    showToast(`${rows.length} product${rows.length === 1 ? '' : 's'} imported`)
  }

  const handleProductSubmit = (rows: Product[]) => {
    if (editingProduct) {
      saveProduct(rows[0])
      showToast(`${rows[0].name} updated`)
      setEditingProduct(null)
    } else {
      importProducts(rows)
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
            {isSuperAdmin && <Button size="small" startIcon={<FileUploadOutlinedIcon />} onClick={() => setImportOpen(true)}>Import from Excel</Button>}
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
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => setViewingProduct(p)}><VisibilityOutlinedIcon className={styles.actionIcon} /></IconButton>
                        </Tooltip>
                        {isSuperAdmin && (
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => setEditingProduct(p)}><EditOutlinedIcon className={styles.actionIcon} /></IconButton>
                          </Tooltip>
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
          <BulkImportDialog
            open={importOpen}
            onClose={() => setImportOpen(false)}
            existingCodes={existingCodes}
            onImport={handleImport}
          />
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

      <Dialog open={Boolean(viewingProduct)} onClose={() => setViewingProduct(null)} fullWidth maxWidth="xs">
        <DialogTitle>Product details</DialogTitle>
        {viewingProduct && (
          <DialogContent className={styles.dialogContentTop}>
            <DetailRow label="Name" value={viewingProduct.name} />
            <DetailRow label="Barcode" value={viewingProduct.code} />
            <DetailRow label="Category" value={viewingProduct.category} />
            <DetailRow label="Unit" value={viewingProduct.unit} />
            <DetailRow label="MRP" value={formatAmount(viewingProduct.mrp)} />
            <DetailRow label="Rate" value={formatAmount(viewingProduct.rate)} />
            <DetailRow label="Stock" value={String(viewingProduct.stock)} />
            <DetailRow label="Status" value={stockStatus(viewingProduct).label} />
          </DialogContent>
        )}
        <DialogActions className={styles.dialogActions}>
          <Button onClick={() => setViewingProduct(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Products
