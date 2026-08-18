import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import * as XLSX from 'xlsx'
import { Button, Chip, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { Mono } from '../../components/Mono'
import { KpiCard } from '../../components/KpiCard'
import { StatusPill } from '../../components/StatusPill'
import { TableCard, TableEmptyRow } from '../../components/TableCard'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useToast } from '../../hooks/useToast'
import { formatInt } from '../../utils/format'
import { ROUTES } from '../../utils/routes'
import type { Product, ProductCategory } from '../../types'
import styles from './ProductImport.module.css'

const CATEGORIES: ProductCategory[] = ['Sparklers', 'Flower Pots', 'Chakkar', 'Rockets', 'Bombs', 'Fancy', 'Gift Boxes']

const TEMPLATE_COLUMNS = ['barcode', 'name', 'category', 'hsn', 'unit', 'mrp', 'rate', 'gstRate', 'stock', 'lowStockThreshold']

const HEADER_ALIASES: Record<string, string> = {
  barcode: 'code', code: 'code', 'product code': 'code', sku: 'code',
  name: 'name', 'item name': 'name', 'product name': 'name',
  category: 'category',
  hsn: 'hsn', 'hsn code': 'hsn',
  unit: 'unit',
  mrp: 'mrp',
  rate: 'rate', 'sale rate': 'rate', 'selling price': 'rate', 'counter rate': 'rate',
  gst: 'gstRate', gstrate: 'gstRate', 'gst rate': 'gstRate', 'gst%': 'gstRate', 'gst %': 'gstRate',
  stock: 'stock', qty: 'stock', quantity: 'stock',
  'low stock threshold': 'lowStockThreshold', 'lowstockthreshold': 'lowStockThreshold', 'reorder level': 'lowStockThreshold', threshold: 'lowStockThreshold',
}

const normalizeHeader = (h: string) => h.trim().toLowerCase().replace(/\s+/g, ' ')

const importRowSchema = z.object({
  code: z.string().trim().min(1, 'Barcode is required'),
  name: z.string().trim().min(1, 'Name is required'),
  category: z.string().trim().min(1, 'Category is required'),
  hsn: z.string().trim().min(1, 'HSN is required'),
  unit: z.string().trim().min(1, 'Unit is required'),
  mrp: z.coerce.number(),
  rate: z.coerce.number(),
  gstRate: z.coerce.number(),
  stock: z.coerce.number(),
  lowStockThreshold: z.coerce.number(),
})
  .refine((v) => CATEGORIES.includes(v.category as ProductCategory), { message: `Category must be one of: ${CATEGORIES.join(', ')}`, path: ['category'] })
  .refine((v) => Number.isFinite(v.mrp) && v.mrp > 0, { message: 'MRP must be a positive number', path: ['mrp'] })
  .refine((v) => Number.isFinite(v.rate) && v.rate > 0, { message: 'Rate must be a positive number', path: ['rate'] })
  .refine((v) => Number.isFinite(v.gstRate) && v.gstRate >= 0, { message: 'GST rate must be 0 or more', path: ['gstRate'] })
  .refine((v) => Number.isFinite(v.stock) && v.stock >= 0, { message: 'Stock must be 0 or more', path: ['stock'] })

/** A code already in the catalogue is an update, not a mistake. */
type Outcome = 'new' | 'update' | 'error'

interface ImportRow {
  index: number
  code: string
  name: string
  category: string
  mrp: string
  rate: string
  stock: string
  outcome: Outcome
  product: Product | null
  errors: string[]
}

const ROW_FILTERS = ['All', 'New', 'Updated', 'Errors'] as const
type RowFilter = (typeof ROW_FILTERS)[number]

const displayField = (mapped: Record<string, unknown>, key: string): string => {
  const v = mapped[key]
  return v === undefined || v === null || v === '' ? '—' : String(v)
}

const buildRow = (raw: Record<string, unknown>, index: number, existingCodes: Set<string>, seenCodes: Set<string>): ImportRow | null => {
  const mapped: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(raw)) {
    const field = HEADER_ALIASES[normalizeHeader(key)]
    if (field) mapped[field] = value
  }

  // Spreadsheets carry trailing empty rows — skip them instead of reporting hundreds of errors.
  const hasAnyValue = Object.values(mapped).some((value) => value !== undefined && value !== null && String(value).trim() !== '')
  if (!hasAnyValue) return null

  if (mapped.lowStockThreshold === undefined || mapped.lowStockThreshold === '') mapped.lowStockThreshold = 15

  const display = {
    code: displayField(mapped, 'code'),
    name: displayField(mapped, 'name'),
    category: displayField(mapped, 'category'),
    mrp: displayField(mapped, 'mrp'),
    rate: displayField(mapped, 'rate'),
    stock: displayField(mapped, 'stock'),
  }

  const result = importRowSchema.safeParse(mapped)
  if (!result.success) {
    return { index, ...display, outcome: 'error', product: null, errors: [...new Set(result.error.issues.map((i) => i.message))] }
  }

  const codeKey = result.data.code.toUpperCase()
  if (seenCodes.has(codeKey)) {
    return { index, ...display, outcome: 'error', product: null, errors: ['This barcode appears earlier in the file'] }
  }
  seenCodes.add(codeKey)

  return {
    index,
    ...display,
    outcome: existingCodes.has(codeKey) ? 'update' : 'new',
    product: {
      code: result.data.code,
      name: result.data.name,
      category: result.data.category as ProductCategory,
      hsn: result.data.hsn,
      unit: result.data.unit,
      mrp: result.data.mrp,
      rate: result.data.rate,
      gstRate: result.data.gstRate,
      stock: result.data.stock,
      lowStockThreshold: result.data.lowStockThreshold,
    },
    errors: [],
  }
}

const downloadTemplate = () => {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([
    TEMPLATE_COLUMNS,
    ['SKY-100', 'Sky Shot 10 Shots', 'Rockets', '36049000', 'box', 450, 99, 18, 120, 20],
  ])
  XLSX.utils.book_append_sheet(wb, ws, 'Products')
  XLSX.writeFile(wb, 'sparkline-product-import-template.xlsx')
}

const OUTCOME_PILL: Record<Outcome, { label: string; tone: 'paid' | 'hold' | 'due' }> = {
  new: { label: 'New', tone: 'paid' },
  update: { label: 'Update', tone: 'hold' },
  error: { label: 'Fix', tone: 'due' },
}

export const ProductImport = () => {
  const navigate = useNavigate()
  const { products, importProducts } = useStoreScope()
  const showToast = useToast()

  const [stage, setStage] = useState<'upload' | 'preview' | 'done'>('upload')
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [skipped, setSkipped] = useState(0)
  const [parseError, setParseError] = useState<string | null>(null)
  const [filter, setFilter] = useState<RowFilter>('All')
  const [result, setResult] = useState<{ created: number; updated: number } | null>(null)

  const counts = useMemo(
    () => ({
      New: rows.filter((r) => r.outcome === 'new').length,
      Updated: rows.filter((r) => r.outcome === 'update').length,
      Errors: rows.filter((r) => r.outcome === 'error').length,
      All: rows.length,
    }),
    [rows],
  )

  const visibleRows = useMemo(() => {
    if (filter === 'All') return rows
    if (filter === 'New') return rows.filter((r) => r.outcome === 'new')
    if (filter === 'Updated') return rows.filter((r) => r.outcome === 'update')
    return rows.filter((r) => r.outcome === 'error')
  }, [rows, filter])

  const resetToUpload = () => {
    setStage('upload')
    setFileName('')
    setRows([])
    setSkipped(0)
    setParseError(null)
    setFilter('All')
    setResult(null)
  }

  const handleFile = async (file: File) => {
    setParseError(null)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      if (!sheet) throw new Error('No sheet found in this file.')
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
      if (raw.length === 0) throw new Error('No rows found in this file.')

      const existingCodes = new Set(products.map((p) => p.code.toUpperCase()))
      const seenCodes = new Set<string>()
      const parsed: ImportRow[] = []
      let blanks = 0
      raw.forEach((r, i) => {
        const row = buildRow(r, i, existingCodes, seenCodes)
        if (row) parsed.push({ ...row, index: parsed.length })
        else blanks += 1
      })
      if (parsed.length === 0) throw new Error('Every row in this file is empty — check the column headings.')

      setFileName(file.name)
      setRows(parsed)
      setSkipped(blanks)
      setFilter('All')
      setStage('preview')
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Could not read this file.')
    }
  }

  const handleImport = () => {
    const importable = rows.filter((r) => r.product).map((r) => r.product as Product)
    if (importable.length === 0) return
    importProducts(importable)
    setResult({ created: counts.New, updated: counts.Updated })
    setStage('done')
    showToast(`${counts.New} added · ${counts.Updated} updated`, 'success')
  }

  const summary = (
    <div className={styles.summaryGrid}>
      <KpiCard label="New products" value={formatInt(result ? result.created : counts.New)} icon={AddCircleOutlineRoundedIcon} tone="paid" />
      <KpiCard label="Updated products" value={formatInt(result ? result.updated : counts.Updated)} icon={AutorenewRoundedIcon} tone="info" />
      <KpiCard label="Rows to fix" value={formatInt(counts.Errors)} icon={ErrorOutlineRoundedIcon} tone="due" />
    </div>
  )

  return (
    <>
      <PageHeader
        title="Import products"
        crumb={fileName ? `${fileName} · ${counts.All} rows read${skipped > 0 ? ` · ${skipped} blank rows skipped` : ''}` : 'Bulk upload from an Excel or CSV file'}
        actions={
          <>
            <Button size="small" onClick={() => navigate(ROUTES.products)}>Back to products</Button>
            {stage === 'upload' && (
              <Button size="small" startIcon={<FileDownloadOutlinedIcon />} onClick={downloadTemplate}>
                Download template
              </Button>
            )}
            {stage === 'preview' && (
              <Button variant="contained" disabled={counts.New + counts.Updated === 0} onClick={handleImport}>
                Import {formatInt(counts.New + counts.Updated)} product{counts.New + counts.Updated === 1 ? '' : 's'}
              </Button>
            )}
          </>
        }
      />

      <PageContent>
        {stage === 'upload' && (
          <div className={styles.uploadStage}>
            <label className={styles.dropZone}>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                  e.target.value = ''
                }}
              />
              <FileUploadOutlinedIcon className={styles.dropZoneIcon} />
              <Typography className={styles.dropZoneTitle}>Choose an Excel or CSV file</Typography>
              <Typography variant="caption">.xlsx, .xls or .csv — nothing is saved until you review it</Typography>
            </label>

            <div className={styles.helpPanel}>
              <Typography className={styles.helpTitle}>Columns the file needs</Typography>
              <div className={styles.columnList}>
                {TEMPLATE_COLUMNS.map((column) => (
                  <Mono key={column} sx={{ fontSize: 11.5 }}>{column}</Mono>
                ))}
              </div>
              <Typography variant="caption" className={styles.helpNote}>
                <b>lowStockThreshold</b> is optional and defaults to 15. A barcode already in the catalogue updates that
                product instead of creating a second one.
              </Typography>
            </div>

            {parseError && <Typography className={styles.errorText}>{parseError}</Typography>}
          </div>
        )}

        {stage === 'preview' && (
          <>
            {summary}

            <div className={styles.filterRow}>
              {ROW_FILTERS.map((key) => (
                <Chip
                  key={key}
                  label={`${key} ${formatInt(counts[key])}`}
                  size="small"
                  onClick={() => setFilter(key)}
                  color={filter === key ? 'primary' : undefined}
                  variant={filter === key ? 'filled' : 'outlined'}
                />
              ))}
              <div className={styles.filterSpacer} />
              <Button size="small" onClick={resetToUpload}>Choose a different file</Button>
            </div>

            <TableCard>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Barcode</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">MRP</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map((row) => {
                    const pill = OUTCOME_PILL[row.outcome]
                    return (
                      <TableRow key={row.index} hover>
                        <TableCell className={styles.rowIndex}>{row.index + 1}</TableCell>
                        <TableCell><Mono sx={{ fontSize: 12 }}>{row.code}</Mono></TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell align="right"><Mono sx={{ fontSize: 12 }}>{row.mrp}</Mono></TableCell>
                        <TableCell align="right"><Mono sx={{ fontSize: 12 }}>{row.rate}</Mono></TableCell>
                        <TableCell align="right"><Mono sx={{ fontSize: 12 }}>{row.stock}</Mono></TableCell>
                        <TableCell>
                          {row.errors.length > 0 ? (
                            <Tooltip title={row.errors.join(', ')}>
                              <span><StatusPill tone={pill.tone} dot={false} label={pill.label} /></span>
                            </Tooltip>
                          ) : (
                            <StatusPill tone={pill.tone} dot={false} label={pill.label} />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {visibleRows.length === 0 && <TableEmptyRow colSpan={8} message={`No ${filter.toLowerCase()} rows in this file.`} />}
                </TableBody>
              </Table>
            </TableCard>
          </>
        )}

        {stage === 'done' && result && (
          <>
            <div className={styles.doneBanner}>
              <CheckCircleOutlineRoundedIcon className={styles.doneIcon} />
              <div>
                <Typography className={styles.doneTitle}>Import finished</Typography>
                <Typography className={styles.doneBody}>
                  {fileName} · {formatInt(result.created)} added, {formatInt(result.updated)} updated
                  {counts.Errors > 0 ? `, ${formatInt(counts.Errors)} skipped for fixing` : ''}.
                </Typography>
              </div>
              <div className={styles.filterSpacer} />
              <Button variant="contained" onClick={() => navigate(ROUTES.products)}>View products</Button>
              <Button onClick={resetToUpload}>Import another file</Button>
            </div>

            {summary}
          </>
        )}
      </PageContent>
    </>
  )
}

export default ProductImport
