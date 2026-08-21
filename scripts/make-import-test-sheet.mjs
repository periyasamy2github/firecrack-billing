// Builds test-data/product-import-test.xlsx for exercising the Products > Import screen.
// Run: node scripts/make-import-test-sheet.mjs
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

const HEADERS = ['Barcode', 'Name', 'Category', 'HSN', 'Unit', 'MRP', 'Rate', 'GST Rate', 'Stock', 'Low Stock Threshold']

const ROWS = [
  // --- new products, should import cleanly ---
  ['SPK-45', 'Sparklers 45cm (10 pkt)', 'Sparklers', '3604 90 00', 'packet', 250, 78, 18, 40, 15],
  ['FLP-10', '10cm Flower Pot Jumbo', 'Flower Pots', '3604 10 00', 'box of 5', 520, 120, 18, 25, 10],
  ['CHK-SML', 'Ground Chakkar Small (25 pcs)', 'Chakkar', '3604 90 00', 'box', 180, 42, 18, 65, 20],

  // lowStockThreshold left blank -> defaults to 15
  ['TWL-DLX', 'Deluxe Twinkler (12 pcs)', 'Fancy', '3604 90 00', 'packet', 300, 88, 18, 30, ''],

  // category is free text now, so an unlisted one is accepted
  ['GSP-DLX', 'Ground Spinner Deluxe', 'Ground Spinners', '3604 90 00', 'box', 400, 95, 18, 20, 15],

  // HSN is optional -> imports with a blank HSN
  ['NOH-001', 'Item Without HSN', 'Fancy', '', 'box', 200, 50, 18, 10, 15],

  // --- existing Erode barcodes, should come through as "update" (price + stock changed) ---
  ['SPK-30', 'Sparklers 30cm (10 pkt)', 'Sparklers', '3604 90 00', 'packet', 190, 58, 18, 75, 15],
  ['FLP-05', '5cm Flower Pot', 'Flower Pots', '3604 10 00', 'box of 10', 230, 50, 18, 100, 15],

  // --- rows that must be rejected, one rule each ---
  ['', 'Missing Barcode Item', 'Rockets', '3604 90 00', 'box', 100, 50, 18, 10, 15],
  ['ERR-NAME', '', 'Bombs', '3604 90 00', 'box', 100, 50, 18, 10, 15],
  ['ERR-MRP', 'Zero MRP Item', 'Fancy', '3604 90 00', 'box', 0, 50, 18, 10, 15],
  ['ERR-RATE', 'Non-numeric Rate', 'Fancy', '3604 90 00', 'box', 200, 'abc', 18, 10, 15],
  ['ERR-STOCK', 'Negative Stock', 'Fancy', '3604 90 00', 'box', 200, 50, 18, -5, 15],

  // duplicate of the first row's barcode, within the same file
  ['SPK-45', 'Duplicate Barcode Row', 'Sparklers', '3604 90 00', 'packet', 250, 78, 18, 40, 15],

  // trailing blank row -> skipped silently, not reported as an error
  ['', '', '', '', '', '', '', '', '', ''],
]

fs.mkdirSync('test-data', { recursive: true })

const book = XLSX.utils.book_new()
const sheet = XLSX.utils.aoa_to_sheet([HEADERS, ...ROWS])
sheet['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 16 }, { wch: 12 }, { wch: 11 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 7 }, { wch: 18 }]
styleHeaderRow(sheet, HEADERS)
XLSX.utils.book_append_sheet(book, sheet, 'Products')
XLSX.writeFile(book, 'test-data/product-import-test.xlsx')

console.log('wrote test-data/product-import-test.xlsx')
console.log('  6 new · 2 update · 6 errors · 1 blank row skipped')
