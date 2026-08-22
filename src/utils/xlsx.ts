// Styled .xlsx downloads. The SheetJS fork is loaded on demand so list pages stay light until someone exports.
export const HEADER_STYLE = {
  font: { bold: true, sz: 11, color: { rgb: '1F3B2C' } },
  fill: { fgColor: { rgb: 'E2EFDA' } },
  alignment: { vertical: 'center' as const },
  border: { bottom: { style: 'thin' as const, color: { rgb: 'A9C4A0' } } },
}

export const downloadXlsx = async (fileName: string, sheetName: string, headers: string[], rows: (string | number)[][]): Promise<void> => {
  const XLSX = await import('xlsx-js-style')
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows])

  headers.forEach((_, index) => {
    sheet[XLSX.utils.encode_cell({ r: 0, c: index })].s = HEADER_STYLE
  })
  sheet['!cols'] = headers.map((header) => ({ wch: Math.max(header.length + 4, 12) }))

  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, sheetName)
  XLSX.writeFile(book, fileName)
}
