import { Typography } from '@mui/material'
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined'
import type { Bill } from '../../types'
import { computeLineAmounts, getBillTotals, halfGstRateLabel } from '../../utils/billing'
import { formatAmount, formatCurrency } from '../../utils/format'
import { useStoreScope } from '../../hooks/useStoreScope'
import styles from './ThermalReceipt.module.css'

interface ThermalReceiptProps {
  bill: Bill
  tendered?: number
  changeDue?: number
  showQr: boolean
  showMrpSaved: boolean
}

const Dash = () => <div className={styles.dash} />

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={bold ? `${styles.row} ${styles.rowBold}` : styles.row}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
)

export const ThermalReceipt = ({ bill, tendered, changeDue, showQr, showMrpSaved }: ThermalReceiptProps) => {
  const { shop } = useStoreScope()
  const gst = bill.gstApplicable
  const totals = getBillTotals(bill)
  const halfRate = halfGstRateLabel(bill.items)

  return (
    <div className={styles.sheet}>
      <Typography className={styles.shopName}>{shop.name.toUpperCase()}</Typography>
      <Typography className={styles.shopAddress}>
        {shop.addressLine.split(',').slice(0, 2).join(',')}
        <br />Ph {shop.phone}
      </Typography>
      <Typography className={styles.gstLine}>GSTIN {shop.gstin}</Typography>
      <Dash />
      <Typography className={styles.invoiceTitle}>{gst ? 'TAX INVOICE' : 'BILL OF SUPPLY'}</Typography>
      {bill.status === 'Cancelled' && (
        <Typography className={styles.cancelledBanner}>
          *** CANCELLED ***
        </Typography>
      )}
      <Dash />
      <Row label="Bill" value={bill.billNo.split('/').pop() ?? bill.billNo} />
      <Row label="Date" value={`${bill.date} ${bill.time}`} />
      <Row label="Counter" value={bill.counter.replace('Counter ', '').split(' ')[0] + ' · ' + bill.billedBy.split(' ')[0]} />
      <Dash />
      <Row label="Item" value="Qty × Rate      Amt" bold={false} />
      <Dash />
      {bill.items.map((item) => {
        const { rate, amount } = computeLineAmounts(item, gst)
        return (
          <div key={item.lineId} className={styles.itemBlock}>
            <div>{item.product.name}</div>
            <Row label="" value={`${item.qty} × ${formatAmount(rate)}    ${formatAmount(amount)}`} />
          </div>
        )
      })}
      <Dash />
      <Row label="Items / Qty" value={`${totals.itemCount} / ${totals.qtyCount}`} />
      <Row label="MRP value" value={formatAmount(totals.mrpValue)} />
      <Row label="Counter rate" value={formatAmount(totals.gross)} />
      {totals.billDiscountAmount > 0 && <Row label="Bill discount" value={`-${formatAmount(totals.billDiscountAmount)}`} />}
      <Row label={gst ? 'Taxable' : 'Subtotal'} value={formatAmount(totals.taxable)} />
      {gst && <Row label={halfRate ? `CGST ${halfRate}` : 'CGST'} value={formatAmount(totals.cgst)} />}
      {gst && <Row label={halfRate ? `SGST ${halfRate}` : 'SGST'} value={formatAmount(totals.sgst)} />}
      <Row label="Round off" value={formatAmount(totals.roundOff)} />
      <Dash />
      <Row label="TOTAL" value={formatCurrency(totals.grandTotal)} bold />
      <Dash />
      {typeof tendered === 'number' && (
        <>
          <Row label={bill.paymentMethod ?? 'Paid'} value={formatAmount(tendered)} />
          <Row label="Change" value={formatAmount(Math.max(0, changeDue ?? 0))} />
          <Dash />
        </>
      )}
      {showMrpSaved && (
        <Typography className={styles.savedLine}>
          YOU SAVED {formatCurrency(totals.mrpValue - totals.gross + totals.billDiscountAmount)}
        </Typography>
      )}
      {showQr && (
        <div className={styles.qrWrap}>
          <div className={styles.qrBox}>
            <QrCode2OutlinedIcon className={styles.qrIcon} />
          </div>
          <Typography className={styles.qrCaption}>Scan to pay by UPI</Typography>
        </div>
      )}
      <Dash />
      <Typography className={styles.footerNote}>
        Goods once sold will not be taken back.
        <br />Handle fireworks safely. Thank you!
      </Typography>
    </div>
  )
}
