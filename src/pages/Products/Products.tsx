import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip, Tooltip } from '@mui/material'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useConfirm } from 'material-ui-confirm'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { SearchField } from '../../components/SearchField'
import { ListFooter } from '../../components/ListFooter'
import { ProductDialog } from './ProductDialog'
import { ProductsTable } from './ProductsTable'
import { productCategories } from '../../data/products'
import { useSession } from '../../hooks/useSession'
import { useDispatch, useSelector } from '../../redux/store'
import { deleteProduct, loadProducts, saveProduct } from '../../redux/productsSlice'
import { useListPage } from '../../hooks/useListPage'
import { usePendingAction } from '../../hooks/usePendingAction'
import { ROUTES } from '../../utils/routes'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../utils/errorMessage'
import type { Product } from '../../types'
import styles from '../../css/pages/Products.module.css'

const CATEGORY_KEYS = ['All', ...productCategories] as const

export const Products = () => {
  const navigate = useNavigate()
  const { counters, isSuperAdmin, counterScope } = useSession()
  const dispatch = useDispatch()
  const products = useSelector((state) => state.products.items)
  const [addOpen, setAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const confirm = useConfirm()
  const showToast = useToast()
  const { isPending, run } = usePendingAction()
  const [loading, setLoading] = useState(true)

  // Adding or importing needs one counter in scope.
  const viewingAllCounters = counterScope === 'all'
  const currentCounterName = counters.find((counter) => counter.id === counterScope)?.name ?? ''
  const pickCounterHint = viewingAllCounters ? 'Pick a branch first — products belong to one branch' : ''

  useEffect(() => {
    setLoading(true)
    void dispatch(loadProducts(counterScope)).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counterScope])

  const { query, setQuery, searchInputRef, filter: category, setFilter: setCategory, counts: categoryCounts, filtered, page, rowsPerPage, pageRows, changePage, changeRowsPerPage } =
    useListPage<Product, (typeof CATEGORY_KEYS)[number]>({
      rows: products,
      filters: CATEGORY_KEYS,
      matchesFilter: (product, key) => key === 'All' || product.category === key,
      matchesSearch: (product, search) => {
        const q = search.trim().toLowerCase()
        return !q || product.code.toLowerCase().includes(q) || product.name.toLowerCase().includes(q)
      },
    })

  const lowStockCount = useMemo(() => products.filter((p) => p.stock <= p.lowStockThreshold).length, [products])

  const existingCodes = useMemo(() => new Set(products.map((p) => p.code.toUpperCase())), [products])

  const handleDelete = async ({ code, counterId, name }: Product) => {
    const { confirmed } = await confirm({
      title: 'Delete product?',
      description: <>Remove <b>{name}</b> ({code}) from the catalogue? Bills already raised keep their copy of the item.</>,
      confirmationText: 'Delete',
      cancellationText: 'Keep product',
    })
    if (!confirmed) return

    // Follows the product's own counter, so it works in the all-counters view.
    await run(`${counterId}:${code}`, async () => {
      try {
        await dispatch(deleteProduct({ code, counterId })).unwrap()
        showToast(`${name} deleted`, 'warning')
      } catch (err) {
        showToast(errorMessage(err, 'Could not delete this product'), 'error')
      }
    })
  }

  // Throws on failure so the dialog keeps the typed-in values.
  const handleProductSubmit = async (rows: Product[]) => {
    try {
      if (editingProduct) {
        await dispatch(saveProduct({ product: rows[0], counterId: editingProduct.counterId })).unwrap()
        setEditingProduct(null)
        showToast(`${rows[0].name} updated`)
        return
      }

      // Manual add saves row by row; bulk upload is the Import page.
      for (const row of rows) {
        await dispatch(saveProduct({ product: row, counterId: counterScope })).unwrap()
      }
      showToast(`${rows.length} product${rows.length === 1 ? '' : 's'} added`)
    } catch (err) {
      showToast(errorMessage(err, 'Could not save this product'), 'error')
      throw err
    }
  }

  return (
    <>
      <PageHeader
        title="Products"
        crumb={
          viewingAllCounters
            ? `${products.length} items · all ${counters.length} branches`
            : `${products.length} items · ${currentCounterName} · ${lowStockCount} running low`
        }
        actions={isSuperAdmin && (
          <>
            <Tooltip title={pickCounterHint}>
              <span>
                <Button size="small" startIcon={<FileUploadOutlinedIcon />} disabled={viewingAllCounters} onClick={() => navigate(ROUTES.productImport)}>
                  Import from Excel
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={pickCounterHint}>
              <span>
                <Button variant="contained" startIcon={<AddRoundedIcon />} disabled={viewingAllCounters} onClick={() => setAddOpen(true)}>
                  Add item
                </Button>
              </span>
            </Tooltip>
          </>
        )}
      />
      <PageContent>
        <div className={styles.filterRow}>
          <SearchField placeholder="Search by code or item name… (/)" value={query} onChange={setQuery} inputRef={searchInputRef} sx={{ flex: 1, minWidth: 240 }} />
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

        <ProductsTable
          rows={pageRows}
          loading={loading}
          filteredCount={filtered.length}
          viewingAllCounters={viewingAllCounters}
          canManage={isSuperAdmin}
          isPending={isPending}
          onEdit={setEditingProduct}
          onDelete={handleDelete}
          footer={<ListFooter count={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={changePage} onRowsPerPageChange={changeRowsPerPage} />}
        />
      </PageContent>

      {isSuperAdmin && (
        <ProductDialog
          key={editingProduct ? `edit-${editingProduct.code}` : 'add'}
          mode={editingProduct ? 'edit' : 'add'}
          open={addOpen || Boolean(editingProduct)}
          onClose={() => { setAddOpen(false); setEditingProduct(null) }}
          product={editingProduct}
          existingCodes={existingCodes}
          counterId={editingProduct?.counterId ?? counterScope}
          onSubmit={handleProductSubmit}
        />
      )}
    </>
  )
}

export default Products
