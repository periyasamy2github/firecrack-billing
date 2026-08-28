import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import * as XLSX from 'xlsx-js-style'
import { Button, Step, StepLabel, Stepper } from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { useSession } from '../../hooks/useSession'
import { useDispatch } from '../../redux/store'
import { importProducts } from '../../redux/productsSlice'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../utils/errorMessage'
import { formatInt } from '../../utils/format'
import { ROUTES } from '../../utils/routes'
import { downloadXlsx } from '../../utils/xlsx'
import type { ImportResult, Product } from '../../types'
import styles from '../../css/pages/ProductImport.module.css'

import type { ImportRow } from './types'
import { UploadStage } from './UploadStage'
import { ReviewStage } from './ReviewStage'
import { ImportingStage } from './ImportingStage'
import { DoneStage } from './DoneStage'

// Headers are matched case-insensitively on import, so these stay readable.
export const TEMPLATE_COLUMNS = ['Barcode', 'Name', 'Category', 'HSN', 'MRP', 'Rate', 'GST Rate', 'Stock', 'Low Stock Threshold']

const HEADER_ALIASES: Record<string, string> = {
  barcode: 'code', code: 'code', 'product code': 'code', sku: 'code',
  name: 'name', 'item name': 'name', 'product name': 'name',
  category: 'category',
  hsn: 'hsn', 'hsn code': 'hsn',
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
  hsn: z.string().trim(),
  mrp: z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), z.coerce.number().nullable()),
  rate: z.coerce.number(),
  gstRate: z.coerce.number(),
  stock: z.coerce.number(),
  lowStockThreshold: z.coerce.number(),
})
  .refine((v) => v.mrp === null || (Number.isFinite(v.mrp) && v.mrp > 0), { message: 'MRP must be a positive number', path: ['mrp'] })
  .refine((v) => Number.isFinite(v.rate) && v.rate > 0, { message: 'Rate must be a positive number', path: ['rate'] })
  .refine((v) => Number.isFinite(v.gstRate) && v.gstRate >= 0, { message: 'GST rate must be 0 or more', path: ['gstRate'] })
  .refine((v) => Number.isFinite(v.stock) && v.stock >= 0, { message: 'Stock must be 0 or more', path: ['stock'] })

const displayField = (mapped: Record<string, unknown>, key: string): string => {
  const v = mapped[key]
  return v === undefined || v === null || v === '' ? '—' : String(v)
}

const buildRow = (raw: Record<string, unknown>, index: number, seenCodes: Set<string>, counterId: string): ImportRow | null => {
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
    return { index, ...display, outcome: 'error', product: null, errors: ['Duplicate barcode in this file'] }
  }
  seenCodes.add(codeKey)

  return {
    index,
    ...display,
    outcome: 'ready',
    product: {
      code: result.data.code,
      counterId,
      name: result.data.name,
      category: result.data.category,
      hsn: result.data.hsn,
      mrp: result.data.mrp,
      rate: result.data.rate,
      gstRate: result.data.gstRate,
      stock: result.data.stock,
      lowStockThreshold: result.data.lowStockThreshold,
    },
    errors: [],
  }
}

const downloadTemplate = () => downloadXlsx('Import-Template.xlsx', 'Products', TEMPLATE_COLUMNS, [])

const STEPS = ['Choose file', 'Review rows', 'Import'] as const

export const ProductImport = () => {
  const navigate = useNavigate()
  const { counterScope } = useSession()
  const dispatch = useDispatch()
  const showToast = useToast()

  const [stage, setStage] = useState<'upload' | 'review' | 'importing' | 'done'>('upload')
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [summary, setSummary] = useState<{ created: number; updated: number; skipped: number } | null>(null)
  const [serverErrors, setServerErrors] = useState<ImportResult['errors']>([])
  const [savedCount, setSavedCount] = useState(0)

  const activeStep = stage === 'upload' ? 0 : stage === 'review' ? 1 : stage === 'importing' ? 2 : STEPS.length

  const errorRows = useMemo(() => rows.filter((r) => r.outcome === 'error'), [rows])
  const readyCount = rows.length - errorRows.length

  const resetToUpload = () => {
    setStage('upload')
    setFileName('')
    setRows([])
    setSummary(null)
    setServerErrors([])
    setSavedCount(0)
  }

  const handleFile = async (file: File) => {
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      if (!sheet) {
        showToast("No sheet found in this file.", 'error')
        return
      }
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
      if (raw.length === 0) {
        showToast("No rows found in this file.", 'error')
        return false;
      }

      const seenCodes = new Set<string>()
      const parsed: ImportRow[] = []
      raw.forEach((r, i) => {
        const row = buildRow(r, i, seenCodes, counterScope)
        if (row) parsed.push({ ...row, index: parsed.length })
      })

      if (parsed.length === 0) {
        showToast("Every row in this file is empty — check the column headings.", 'error')
        return false;
      }
      setFileName(file.name)
      setRows(parsed)
      setStage('review')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not read this file.', 'error')
    }
  }

  const BATCH_SIZE = 25

  const startImport = async () => {
    const validProducts = rows.filter((r) => r.product).map((r) => r.product as Product)
    if (validProducts.length === 0) return

    setStage('importing')
    setSavedCount(0)

    let created = 0
    let updated = 0
    const collectedErrors: ImportResult['errors'] = []

    try {
      for (let start = 0; start < validProducts.length; start += BATCH_SIZE) {
        const batch = validProducts.slice(start, start + BATCH_SIZE)
        const res = await dispatch(importProducts({ products: batch, counterId: counterScope })).unwrap()
        created += res.created
        updated += res.updated
        collectedErrors.push(...res.errors)
        setSavedCount(Math.min(start + batch.length, validProducts.length))
      }

      setSummary({ created, updated, skipped: errorRows.length + collectedErrors.length })
      setServerErrors(collectedErrors)
      setStage('done')
      showToast(`${created} added · ${updated} updated`, 'success')
    } catch (err) {
      showToast(errorMessage(err, 'Import failed — nothing more was saved.'), 'error')
      setStage('review')
    }
  }

  return (
    <>
      <PageHeader
        title="Import products"
        crumb={`${fileName ? `${fileName} · ${formatInt(rows.length)} rows read` : 'Bulk upload from Excel file'}`}
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
          <UploadStage
            onFileSelected={handleFile}
          />
        )}

        {stage === 'review' && (
          <ReviewStage
            fileName={fileName}
            totalRows={rows.length}
            errorRows={errorRows}
            readyCount={readyCount}
            onReset={resetToUpload}
            onStartImport={startImport}
          />
        )}

        {stage === 'importing' && (
          <ImportingStage
            fileName={fileName}
            savedCount={savedCount}
            readyCount={readyCount}
          />
        )}

        {stage === 'done' && summary && (
          <DoneStage
            fileName={fileName}
            totalRows={rows.length}
            summary={summary}
            errorRows={errorRows}
            serverErrors={serverErrors}
            onViewProducts={() => navigate(ROUTES.products)}
            onReset={resetToUpload}
          />
        )}
      </PageContent>
    </>
  )
}

export default ProductImport
