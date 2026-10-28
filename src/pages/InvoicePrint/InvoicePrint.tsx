import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Switch, Typography } from '@mui/material'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { A4Invoice } from './A4Invoice'
import { ThermalReceipt } from './ThermalReceipt'
import { CutLine, DeliverySlip } from './DeliverySlip'
import { getBillTotals } from '../../utils/billing'
import { formatCurrency } from '../../utils/format'
import { ROUTES } from '../../utils/routes'
import { api } from '../../services/api'
import type { Bill } from '../../types'
import styles from '../../css/pages/InvoicePrint.module.css'
import { usePageTitle } from '../../hooks/usePageTitle'

type PrintFormat = 'thermal' | 'a4'

interface PrintNavState {
  bill: Bill
}

const PREVIEW_CAPTION_CLASS: Record<PrintFormat, string> = {
  thermal: styles.previewCaptionThermal,
  a4: styles.previewCaptionA4,
}

const FORMAT_OPTIONS = [
  { key: 'thermal' as const, icon: ReceiptLongOutlinedIcon, title: 'Thermal 80mm', desc: 'Customer copy · fast' },
  { key: 'a4' as const, icon: DescriptionOutlinedIcon, title: 'A4 Tax Invoice', desc: 'GST compliant · filing' },
]

// whole mm plus 1mm spare, so the content never spills onto an extra page
const heightInMm = (element: HTMLElement | null) => (element ? Math.ceil((element.getBoundingClientRect().height * 25.4) / 96) + 1 : 0)

export const InvoicePrint = () => {
  const navigate = useNavigate()
  const params = useParams<{ billId: string }>()
  const location = useLocation()
  const navState = location.state as PrintNavState | undefined

  const billId = params.billId ?? ''
  const [bill, setBill] = useState<Bill | null>(navState?.bill ?? null)
  const [notFound, setNotFound] = useState(false)
  usePageTitle(bill ? `Bill ${bill.billNo}` : 'Bill')

  useEffect(() => {
    if (navState?.bill) return
    api.loadBill(billId).then(setBill).catch(() => setNotFound(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billId])

  const [format, setFormat] = useState<PrintFormat>('thermal')
  const [showMrpSaved, setShowMrpSaved] = useState(true)
  const receiptPageRef = useRef<HTMLDivElement>(null)
  const slipPageRef = useRef<HTMLDivElement>(null)
  const [pageHeightsMm, setPageHeightsMm] = useState({ receipt: 0, slip: 0 })

  // exact page heights, so the printer cuts right after the bill and after the slip
  useEffect(() => {
    const measurePages = () =>
      flushSync(() => setPageHeightsMm({ receipt: heightInMm(receiptPageRef.current), slip: heightInMm(slipPageRef.current) }))
    window.addEventListener('beforeprint', measurePages)
    return () => window.removeEventListener('beforeprint', measurePages)
  }, [])

  if (!bill) {
    if (!notFound) return null

    return (
      <>
        <PageHeader title="Print bill" actions={<Button onClick={() => navigate(ROUTES.bills)}>Back to bills</Button>} />
        <PageContent>
          <Typography color="text.secondary">This bill was not found.</Typography>
        </PageContent>
      </>
    )
  }

  const totals = getBillTotals(bill)
  const formats = bill.gstApplicable ? FORMAT_OPTIONS : FORMAT_OPTIONS.filter((option) => option.key === 'thermal')
  const activeFormat: PrintFormat = formats.some((option) => option.key === format) ? format : 'thermal'

  return (
    <>
      <PageHeader
        title="Print bill"
        crumb={`${bill.billNo} · ${formatCurrency(totals.grandTotal)} · ${bill.paymentMethod ?? 'Unpaid'}`}
        actions={
          <>
            <Button size="small" onClick={() => navigate(ROUTES.bills)}>Back to bills</Button>
            <Button variant="contained" startIcon={<PrintOutlinedIcon />} onClick={() => window.print()}>
              Print
            </Button>
          </>
        }
      />
      <PageContent>
        <div className={styles.grid}>
          <Card className="no-print">
            <div className={styles.sidebarStack}>
              <Typography variant="subtitle2" className={styles.sidebarTitle}>Format</Typography>
              {formats.map(({ key, icon: Icon, title, desc }) => (
                <div
                  key={key}
                  onClick={() => setFormat(key)}
                  className={activeFormat === key ? `${styles.formatRow} ${styles.formatRowActive}` : styles.formatRow}
                >
                  <Icon className={styles.formatIcon} />
                  <div>
                    <Typography className={styles.formatTitle}>{title}</Typography>
                    <Typography variant="caption">{desc}</Typography>
                  </div>
                </div>
              ))}
              {!bill.gstApplicable && (
                <Typography variant="caption" className={styles.formatNote}>
                  Bill of Supply — no GST was charged, so there is no A4 tax invoice to print.
                </Typography>
              )}

              {activeFormat === 'thermal' && totals.hasMrp && (
                <div className={styles.optionsSection}>
                  <div className={styles.optionsStack}>
                    <div className={styles.toggleRow}>
                      <div className={styles.toggleRowText}>
                        <Typography className={styles.toggleRowLabel}>Show amount saved</Typography>
                        <Typography variant="caption">"You saved ₹{Math.round(totals.mrpValue - totals.gross + totals.billDiscountAmount).toLocaleString('en-IN')}"</Typography>
                      </div>
                      <Switch size="small" checked={showMrpSaved} onChange={(e) => setShowMrpSaved(e.target.checked)} />
                    </div>
                  </div>
                </div>
              )}

              <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={() => window.print()} className={styles.downloadButton}>
                Download PDF
              </Button>
            </div>
          </Card>

          <style>
            {activeFormat === 'thermal'
              ? `@media print { @page receipt { size: 80mm ${pageHeightsMm.receipt}mm; } @page slip { size: 80mm ${pageHeightsMm.slip}mm; } }`
              : '@media print { @page { size: A4 portrait; } }'}
          </style>

          <div className={`${styles.previewCol} print-area`}>
            <Typography variant="caption" className={`${styles.previewCaption} ${PREVIEW_CAPTION_CLASS[activeFormat]}`}>
              {activeFormat === 'thermal' ? '80mm — Customer receipt' : 'A4 — Tax Invoice'}
            </Typography>

            {activeFormat === 'thermal' ? (
              <>
                <div ref={receiptPageRef} className={styles.receiptPage}>
                  <ThermalReceipt bill={bill} showMrpSaved={showMrpSaved} />
                  <CutLine />
                </div>
                <div ref={slipPageRef} className={styles.slipPage}>
                  <DeliverySlip bill={bill} />
                </div>
              </>
            ) : (
              <div className={styles.a4Wrap}>
                <A4Invoice bill={bill} />
              </div>
            )}
          </div>
        </div>
      </PageContent>
    </>
  )
}

export default InvoicePrint
