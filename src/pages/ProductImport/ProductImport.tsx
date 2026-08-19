import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import * as XLSX from 'xlsx'
import { Button, LinearProgress, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
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
import { TableCard } from '../../components/TableCard'
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
  XLSX.writeFile(wb, 'sparkbill-product-import-template.xlsx')
}

const STEPS = ['Choose file', 'Review rows', 'Import'] as const

export const ProductImport = () => {
  const navigate = useNavigate()
  const { products, importProducts } = useStoreScope()
  const showToast = useToast()

  const [stage, setStage] = useState<'upload' | 'review' | 'importing' | 'done'>('upload')
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<{ created: number; updated: number; skipped: number } | null>(null)
  const [processed, setProcessed] = useState(0)
  const importTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (importTimer.current) window.clearInterval(importTimer.current)
  }, [])

  const activeStep = stage === 'upload' ? 0 : stage === 'review' ? 1 : stage === 'importing' ? 2 : STEPS.length

  const counts = useMemo(
    () => ({
      created: rows.filter((r) => r.outcome === 'new').length,
      updated: rows.filter((r) => r.outcome === 'update').length,
      skipped: rows.filter((r) => r.outcome === 'error').length,
    }),
    [rows],
  )

  const errorRows = useMemo(() => rows.filter((r) => r.outcome === 'error'), [rows])
  const readyCount = counts.created + counts.updated

  const resetToUpload = () => {
    setStage('upload')
    setFileName('')
    setRows([])
    setParseError(null)
    setResult(null)
    setProcessed(0)
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
      raw.forEach((r, i) => {
        const row = buildRow(r, i, existingCodes, seenCodes)
        if (row) parsed.push({ ...row, index: parsed.length })
      })
      if (parsed.length === 0) throw new Error('Every row in this file is empty — check the column headings.')

      setFileName(file.name)
      setRows(parsed)
      setStage('review')
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Could not read this file.')
    }
  }

  const startImport = () => {
    const queue = rows.filter((r) => r.product).map((r) => r.product as Product)
    if (queue.length === 0) return

    setStage('importing')
    setProcessed(0)
    const ticks = Math.min(20, queue.length)
    const batchSize = Math.max(1, Math.ceil(queue.length / ticks))
    const interval = Math.round(900 / ticks)
    let done = 0

    importTimer.current = window.setInterval(() => {
      void importProducts(queue.slice(done, done + batchSize))
      done = Math.min(done + batchSize, queue.length)
      setProcessed(done)

      if (done >= queue.length) {
        if (importTimer.current) window.clearInterval(importTimer.current)
        importTimer.current = null
        setResult(counts)
        setStage('done')
        showToast(`${counts.created} added · ${counts.updated} updated`, 'success')
      }
    }, interval)
  }

  return (
    <>
      <PageHeader
        title="Import products"
        crumb={fileName ? `${fileName} · ${formatInt(rows.length)} rows read` : 'Bulk upload from an Excel or CSV file'}
        actions={
          <>
            <Button size="small" disabled={stage === 'importing'} onClick={() => navigate(ROUTES.products)}>
              Back to products
            </Button>
            {stage === 'upload' && (
              <Button size="small" startIcon={<FileDownloadOutlinedIcon />} onClick={downloadTemplate}>
                Download template
              </Button>
            )}
          </>
        }
      />

      <PageContent>
        <Stepper activeStep={activeStep} className={styles.stepper}>
          {STEPS.map((step) => (
            <Step key={step}>
              <StepLabel>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>

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
              <Typography variant="caption">.xlsx, .xls or .csv — nothing is saved until you start the import</Typography>
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

        {stage === 'review' && (
          <>
            <div className={`${styles.reviewBanner} ${errorRows.length === 0 ? styles.reviewBannerOk : styles.reviewBannerWarn}`}>
              {errorRows.length === 0
                ? <CheckCircleOutlineRoundedIcon className={styles.reviewIcon} />
                : <ErrorOutlineRoundedIcon className={styles.reviewIcon} />}
              <div>
                <Typography className={styles.reviewTitle}>
                  {errorRows.length === 0
                    ? 'Every row is ready to import'
                    : `${formatInt(errorRows.length)} row${errorRows.length === 1 ? '' : 's'} need fixing`}
                </Typography>
                <Typography className={styles.reviewBody}>
                  {errorRows.length === 0
                    ? `${formatInt(rows.length)} rows checked, nothing to fix.`
                    : `Listed below and skipped on import. The other ${formatInt(readyCount)} row${readyCount === 1 ? '' : 's'} go through.`}
                </Typography>
              </div>
            </div>

            {errorRows.length > 0 && (
              <TableCard>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Barcode</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>What needs fixing</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {errorRows.map((row) => (
                      <TableRow key={row.index} hover>
                        <TableCell className={styles.rowIndex}>{row.index + 1}</TableCell>
                        <TableCell><Mono sx={{ fontSize: 12 }}>{row.code}</Mono></TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell><Typography className={styles.errorReason}>{row.errors.join(' · ')}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableCard>
            )}

            <div className={styles.actionBar}>
              <Typography variant="caption" className={styles.actionNote}>
                {readyCount > 0
                  ? `${formatInt(readyCount)} row${readyCount === 1 ? '' : 's'} will be imported from ${fileName}.`
                  : 'Nothing can be imported until at least one row is fixed.'}
              </Typography>
              <div className={styles.filterSpacer} />
              <Button onClick={resetToUpload}>Choose a different file</Button>
              <Button variant="contained" size="large" disabled={readyCount === 0} onClick={startImport}>
                Start import
              </Button>
            </div>
          </>
        )}

        {stage === 'importing' && (
          <div className={styles.progressPanel}>
            <div className={styles.progressHead}>
              <Typography className={styles.progressTitle}>Importing products</Typography>
              <div className={styles.filterSpacer} />
              <Mono sx={{ fontSize: 13, fontWeight: 700 }}>{Math.round((processed / Math.max(readyCount, 1)) * 100)}%</Mono>
            </div>
            <LinearProgress
              variant="determinate"
              value={(processed / Math.max(readyCount, 1)) * 100}
              className={styles.progressBar}
              aria-label="Import progress"
            />
            <Typography variant="caption" role="status" aria-live="polite" className={styles.progressMeta}>
              {formatInt(processed)} of {formatInt(readyCount)} rows written · {fileName}
            </Typography>
          </div>
        )}

        {stage === 'done' && result && (
          <>
            <div className={styles.doneBanner}>
              <CheckCircleOutlineRoundedIcon className={styles.doneIcon} />
              <div>
                <Typography className={styles.doneTitle}>Import finished</Typography>
                <Typography className={styles.doneBody}>{fileName} · {formatInt(rows.length)} rows read</Typography>
              </div>
              <div className={styles.filterSpacer} />
              <Button variant="contained" onClick={() => navigate(ROUTES.products)}>View products</Button>
              <Button onClick={resetToUpload}>Import another file</Button>
            </div>

            <div className={styles.summaryGrid}>
              <KpiCard label="New products" value={formatInt(result.created)} icon={AddCircleOutlineRoundedIcon} tone="paid" />
              <KpiCard label="Updated products" value={formatInt(result.updated)} icon={AutorenewRoundedIcon} tone="info" />
              <KpiCard label="Rows skipped" value={formatInt(result.skipped)} icon={ErrorOutlineRoundedIcon} tone="due" />
            </div>
          </>
        )}
      </PageContent>
    </>
  )
}

export default ProductImport
