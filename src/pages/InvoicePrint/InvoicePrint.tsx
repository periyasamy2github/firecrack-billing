import { useState } from 'react'
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
import { getBillTotals } from '../../utils/billing'
import { formatCurrency } from '../../utils/format'
import { ROUTES } from '../../utils/routes'
import { useStoreScope } from '../../hooks/useStoreScope'
import type { Bill } from '../../types'
import styles from './InvoicePrint.module.css'

type PrintFormat = 'thermal' | 'a4'

interface PrintNavState {
  bill: Bill
  tendered?: number
  changeDue?: number
}

const PREVIEW_CAPTION_CLASS: Record<PrintFormat, string> = {
  thermal: styles.previewCaptionThermal,
  a4: styles.previewCaptionA4,
}

const FORMAT_OPTIONS = [
  { key: 'thermal' as const, icon: ReceiptLongOutlinedIcon, title: 'Thermal 80mm', desc: 'Customer copy · fast' },
  { key: 'a4' as const, icon: DescriptionOutlinedIcon, title: 'A4 Tax Invoice', desc: 'GST compliant · filing' },
]

export const InvoicePrint = () => {
  const navigate = useNavigate()
  const params = useParams<{ billNo: string }>()
  const location = useLocation()
  const navState = location.state as PrintNavState | undefined
  const { bills } = useStoreScope()

  // Fresh bills arrive through router state; reprints are looked up in the store.
  const billNo = decodeURIComponent(params.billNo ?? '')
  const bill = navState?.bill ?? bills.find((item) => item.billNo === billNo)

  const [format, setFormat] = useState<PrintFormat>('thermal')
  const [showQr, setShowQr] = useState(true)
  const [showMrpSaved, setShowMrpSaved] = useState(true)

  if (!bill) {
    return (
      <>
        <PageHeader title="Print bill" actions={<Button onClick={() => navigate(ROUTES.bills)}>Back to bills</Button>} />
        <PageContent>
          <Typography color="text.secondary">Bill "{billNo}" was not found.</Typography>
        </PageContent>
      </>
    )
  }

  const totals = getBillTotals(bill)
  // A4 is the GST tax-invoice layout, so a Bill of Supply only prints as a thermal receipt.
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

              <div className={styles.optionsSection}>
                <div className={styles.optionsStack}>
                  <div className={styles.toggleRow}>
                    <div className={styles.toggleRowText}>
                      <Typography className={styles.toggleRowLabel}>Include UPI QR</Typography>
                      <Typography variant="caption">On thermal only</Typography>
                    </div>
                    <Switch size="small" checked={showQr} onChange={(e) => setShowQr(e.target.checked)} />
                  </div>
                  <div className={styles.toggleRow}>
                    <div className={styles.toggleRowText}>
                      <Typography className={styles.toggleRowLabel}>Show amount saved</Typography>
                      <Typography variant="caption">"You saved ₹{Math.round(totals.mrpValue - totals.gross + totals.billDiscountAmount).toLocaleString('en-IN')}"</Typography>
                    </div>
                    <Switch size="small" checked={showMrpSaved} onChange={(e) => setShowMrpSaved(e.target.checked)} />
                  </div>
                </div>
              </div>

              <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={() => window.print()} className={styles.downloadButton}>
                Download PDF
              </Button>
            </div>
          </Card>

          <div className={`${styles.previewCol} print-area`}>
            <Typography variant="caption" className={`${styles.previewCaption} ${PREVIEW_CAPTION_CLASS[activeFormat]}`}>
              {activeFormat === 'thermal' ? '80mm — Customer receipt' : 'A4 — Tax Invoice'}
            </Typography>

            {activeFormat === 'thermal' ? (
              <ThermalReceipt bill={bill} tendered={navState?.tendered} changeDue={navState?.changeDue} showQr={showQr} showMrpSaved={showMrpSaved} />
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
