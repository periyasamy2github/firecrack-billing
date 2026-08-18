import { useState } from 'react'
import { z } from 'zod'
import * as XLSX from 'xlsx'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import { Mono } from '../../components/Mono'
import { StatusPill } from '../../components/StatusPill'
import type { Product, ProductCategory } from '../../types'
import styles from './BulkImportDialog.module.css'

const CATEGORIES: ProductCategory[] = ['Sparklers', 'Flower Pots', 'Chakkar', 'Rockets', 'Bombs', 'Fancy', 'Gift Boxes']

const TEMPLATE_COLUMNS = ['barcode', 'name', 'category', 'hsn', 'unit', 'mrp', 'gstRate', 'stock', 'lowStockThreshold']

const HEADER_ALIASES: Record<string, string> = {
  barcode: 'code', code: 'code', 'product code': 'code', sku: 'code',
  name: 'name', 'item name': 'name', 'product name': 'name',
  category: 'category',
  hsn: 'hsn', 'hsn code': 'hsn',
  unit: 'unit',
  mrp: 'mrp',
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
  gstRate: z.coerce.number(),
  stock: z.coerce.number(),
  lowStockThreshold: z.coerce.number(),
})
  .refine((v) => CATEGORIES.includes(v.category as ProductCategory), { message: `Category must be one of: ${CATEGORIES.join(', ')}`, path: ['category'] })
  .refine((v) => Number.isFinite(v.mrp) && v.mrp > 0, { message: 'MRP must be a positive number', path: ['mrp'] })
  .refine((v) => Number.isFinite(v.gstRate) && v.gstRate >= 0, { message: 'GST rate must be 0 or more', path: ['gstRate'] })
  .refine((v) => Number.isFinite(v.stock) && v.stock >= 0, { message: 'Stock must be 0 or more', path: ['stock'] })

interface ImportRow {
  index: number
  code: string
  name: string
  category: string
  mrp: string
  stock: string
  product: Product | null
  errors: string[]
}

const displayField = (mapped: Record<string, unknown>, key: string): string => {
  const v = mapped[key]
  return v === undefined || v === null || v === '' ? '—' : String(v)
}

const buildRow = (raw: Record<string, unknown>, index: number, existingCodes: Set<string>, seenCodes: Set<string>): ImportRow => {
  const mapped: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(raw)) {
    const field = HEADER_ALIASES[normalizeHeader(key)]
    if (field) mapped[field] = value
  }
  if (mapped.lowStockThreshold === undefined || mapped.lowStockThreshold === '') mapped.lowStockThreshold = 15

  const display = {
    code: displayField(mapped, 'code'),
    name: displayField(mapped, 'name'),
    category: displayField(mapped, 'category'),
    mrp: displayField(mapped, 'mrp'),
    stock: displayField(mapped, 'stock'),
  }

  const result = importRowSchema.safeParse(mapped)
  if (!result.success) {
    return { index, ...display, product: null, errors: [...new Set(result.error.issues.map((i) => i.message))] }
  }

  const codeKey = result.data.code.toUpperCase()
  const duplicate = existingCodes.has(codeKey) || seenCodes.has(codeKey)
  seenCodes.add(codeKey)
  if (duplicate) {
    return { index, ...display, product: null, errors: ['Duplicate product code'] }
  }

  return {
    index,
    ...display,
    product: {
      code: result.data.code,
      name: result.data.name,
      category: result.data.category as ProductCategory,
      hsn: result.data.hsn,
      unit: result.data.unit,
      mrp: result.data.mrp,
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
    ['SKY-100', 'Sky Shot 10 Shots', 'Rockets', '36049000', 'box', 450, 18, 120, 20],
  ])
  XLSX.utils.book_append_sheet(wb, ws, 'Products')
  XLSX.writeFile(wb, 'sparkline-product-import-template.xlsx')
}

interface BulkImportDialogProps {
  open: boolean
  onClose: () => void
  existingCodes: Set<string>
  // In this UI-only build this just appends to local state. A real backend would
  // POST these rows and this callback would become the place to call that API.
  onImport: (rows: Product[]) => void
}

export const BulkImportDialog = ({ open, onClose, existingCodes, onImport }: BulkImportDialogProps) => {
  const [stage, setStage] = useState<'upload' | 'preview'>('upload')
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)

  const resetToUpload = () => {
    setStage('upload')
    setFileName('')
    setRows([])
    setParseError(null)
  }

  const handleClose = () => {
    resetToUpload()
    onClose()
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

      const seenCodes = new Set<string>()
      const parsed = raw.map((r, i) => buildRow(r, i, existingCodes, seenCodes))
      setFileName(file.name)
      setRows(parsed)
      setStage('preview')
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Could not read this file.')
    }
  }

  const validRows = rows.filter((r) => r.product !== null)
  const invalidRows = rows.filter((r) => r.product === null)

  const handleConfirm = () => {
    onImport(validRows.map((r) => r.product as Product))
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={stage === 'preview' ? 'md' : 'xs'}>
      <DialogTitle>Import products from Excel</DialogTitle>
      <DialogContent className={styles.dialogContentTop}>
        {stage === 'upload' ? (
          <div className={styles.uploadStage}>
            <Typography variant="body2" color="text.secondary">
              Columns expected: barcode, name, category, hsn, unit, mrp, gstRate, stock. lowStockThreshold is optional (defaults to 15).
            </Typography>
            <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={downloadTemplate}>
              Download template
            </Button>
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
              <Typography className={styles.dropZoneText}>Click to choose a file</Typography>
              <Typography variant="caption">.xlsx, .xls or .csv</Typography>
            </label>
            {parseError && <Typography className={styles.errorText}>{parseError}</Typography>}
          </div>
        ) : (
          <div className={styles.previewStage}>
            <div className={styles.previewSummary}>
              <Typography variant="body2">
                <b>{fileName}</b> · {validRows.length} ready to import{invalidRows.length > 0 ? ` · ${invalidRows.length} need fixing` : ''}
              </Typography>
              <Button size="small" onClick={resetToUpload}>Choose a different file</Button>
            </div>
            <div className={styles.previewTableWrap}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Barcode</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">MRP</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.index} hover>
                      <TableCell className={styles.rowIndex}>{r.index + 1}</TableCell>
                      <TableCell><Mono sx={{ fontSize: 12 }}>{r.code}</Mono></TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.category}</TableCell>
                      <TableCell align="right"><Mono sx={{ fontSize: 12 }}>{r.mrp}</Mono></TableCell>
                      <TableCell align="right"><Mono sx={{ fontSize: 12 }}>{r.stock}</Mono></TableCell>
                      <TableCell>
                        {r.product ? (
                          <StatusPill tone="paid" dot={false} label="OK" />
                        ) : (
                          <Tooltip title={r.errors.join(', ')}>
                            <span><StatusPill tone="due" dot={false} label="Fix" /></span>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={handleClose}>Cancel</Button>
        {stage === 'preview' && (
          <Button variant="contained" disabled={validRows.length === 0} onClick={handleConfirm}>
            Import {validRows.length} product{validRows.length === 1 ? '' : 's'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
