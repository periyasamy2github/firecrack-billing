const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const integerFormatter = new Intl.NumberFormat('en-IN')

export const formatCurrency = (value: number): string => currencyFormatter.format(value)

export const formatAmount = (value: number): string => numberFormatter.format(value)

export const formatInt = (value: number): string => integerFormatter.format(value)

export const formatSignedAmount = (value: number): string =>
  `${value < 0 ? '−' : '+'} ${numberFormatter.format(Math.abs(value))}`

/** 'Tuesday, 18 August 2026' — the date line on the dashboards. */
export const formatLongDate = (value: Date): string =>
  value.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/** '10-Nov-2026' — same shape as the seed bills, so the Reports date filter keeps working. */
export const formatBillDate = (value: Date): string =>
  value.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')

/** 24-hour '20:38' — bills are sorted by this string, so 12-hour times would jumble the order. */
export const formatBillTime = (value: Date): string =>
  value.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

const twoDigitsToWords = (n: number): string => {
  if (n < 20) return ONES[n]
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return `${TENS[tens]}${ones ? ` ${ONES[ones]}` : ''}`
}

const threeDigitsToWords = (n: number): string => {
  const hundreds = Math.floor(n / 100)
  const rest = n % 100
  const parts: string[] = []
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`)
  if (rest) parts.push(twoDigitsToWords(rest))
  return parts.join(' ')
}

/** Indian numbering system (lakh/crore) words for the rupee portion of an invoice total. */
export const amountToWordsIndian = (value: number): string => {
  const rupees = Math.floor(Math.round(value))
  if (rupees === 0) return 'Rupees Zero Only'

  const crore = Math.floor(rupees / 1_00_00_000)
  const lakh = Math.floor((rupees % 1_00_00_000) / 1_00_000)
  const thousand = Math.floor((rupees % 1_00_000) / 1_000)
  const hundred = rupees % 1_000

  const segments: string[] = []
  if (crore) segments.push(`${threeDigitsToWords(crore)} Crore`)
  if (lakh) segments.push(`${threeDigitsToWords(lakh)} Lakh`)
  if (thousand) segments.push(`${threeDigitsToWords(thousand)} Thousand`)
  if (hundred) segments.push(threeDigitsToWords(hundred))

  return `Rupees ${segments.join(' ')} Only`
}
