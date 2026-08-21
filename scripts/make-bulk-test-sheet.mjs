// Builds a large sheet so the import progress bar is actually visible.
// Run: node scripts/make-bulk-test-sheet.mjs [rowCount]
import * as fs from 'node:fs'
import { createRequire } from 'node:module'

// xlsx-js-style is CommonJS, and its Node build already has filesystem access.
const XLSX = createRequire(import.meta.url)('xlsx-js-style')


const HEADER_STYLE = {
  font: { bold: true, sz: 11, color: { rgb: '1F3B2C' } },
  fill: { fgColor: { rgb: 'E2EFDA' } },
  alignment: { vertical: 'center' },
  border: { bottom: { style: 'thin', color: { rgb: 'A9C4A0' } } },
}

const styleHeaderRow = (sheet, headers) => {
  headers.forEach((_, index) => {
    sheet[XLSX.utils.encode_cell({ r: 0, c: index })].s = HEADER_STYLE
  })
}

const COUNT = Number(process.argv[2]) || 400
const HEADERS = ['Barcode', 'Name', 'Category', 'HSN', 'Unit', 'MRP', 'Rate', 'GST Rate', 'Stock', 'Low Stock Threshold']

const CATEGORIES = ['Sparklers', 'Flower Pots', 'Chakkar', 'Rockets', 'Bombs', 'Fancy', 'Gift Boxes']
const UNITS = ['packet', 'box', 'box of 10', 'box of 5', 'pcs']

const rows = Array.from({ length: COUNT }, (_, i) => {
  const n = i + 1
  const category = CATEGORIES[i % CATEGORIES.length]
  const mrp = 100 + ((i * 37) % 900)
  return [
    `BULK-${String(n).padStart(4, '0')}`,
    `${category} Assorted Pack ${n}`,
    category,
    '3604 90 00',
    UNITS[i % UNITS.length],
    mrp,
    Math.round(mrp * 0.32),
    18,
    20 + ((i * 13) % 180),
    15,
  ]
})

fs.mkdirSync('test-data', { recursive: true })

const book = XLSX.utils.book_new()
const sheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows])
styleHeaderRow(sheet, HEADERS)
XLSX.utils.book_append_sheet(book, sheet, 'Products')
XLSX.writeFile(book, 'test-data/product-import-bulk.xlsx')

console.log(`wrote test-data/product-import-bulk.xlsx — ${COUNT} valid rows`)
console.log(`  ${Math.ceil(COUNT / 25)} batches of 25, so the bar steps ~${Math.round(100 / Math.ceil(COUNT / 25))}% at a time`)
