import { Typography } from '@mui/material'
import type { Bill } from '../../types'
import { computeLineAmounts, discountPercentLabel, getBillTotals, halfGstRateLabel } from '../../utils/billing'
import { formatAmount, formatCurrency } from '../../utils/format'
import { useSession } from '../../hooks/useSession'
import styles from '../../css/pages/ThermalReceipt.module.css'

interface ThermalReceiptProps {
  bill: Bill
  showMrpSaved: boolean
}

const Dash = () => <div className={styles.dash} />

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={bold ? `${styles.row} ${styles.rowBold}` : styles.row}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
)

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.metaRow}>
    <span className={styles.metaLabel}>{label}</span>
    <span className={styles.metaValue}>: {value}</span>
  </div>
)

// The printer style for a subtracted round-off: "0.50-" instead of "-0.50".
const trailingMinus = (value: number) => `${formatAmount(Math.abs(value))}${value < 0 ? '-' : ''}`

export const ThermalReceipt = ({ bill, showMrpSaved }: ThermalReceiptProps) => {
  const { shop } = useSession()
  const gst = bill.gstApplicable
  const totals = getBillTotals(bill)
  const halfRate = halfGstRateLabel(bill.items)

  return (
    <div className={styles.sheet}>
      <Typography className={styles.shopName}>{shop.name.toUpperCase()}</Typography>
      {bill.counter && <Typography className={styles.shopAddress}>{bill.counter.toUpperCase()}</Typography>}
      {shop.town && <Typography className={styles.shopAddress}>{shop.town.toUpperCase()}</Typography>}
      {shop.phone && <Typography className={styles.shopAddress}>Cell : {shop.phone}</Typography>}
      {shop.gstin && <Typography className={styles.gstLine}>GSTIN {shop.gstin}</Typography>}
      {gst && (
        <>
          <Dash />
          <Typography className={styles.invoiceTitle}>TAX INVOICE</Typography>
        </>
      )}
      {bill.status === 'Cancelled' && (
        <Typography className={styles.cancelledBanner}>
          *** CANCELLED ***
        </Typography>
      )}
      <Dash />
      <Meta label="Bill No" value={`${bill.billNo}  ${bill.billedBy}`} />
      <Meta label="Date" value={`${bill.date}  ${bill.time}`} />
      {bill.customerName && <Meta label="Name" value={bill.customerName} />}
      <Dash />
      <div className={`${styles.itemLine} ${styles.itemHead}`}>
        <span>SN</span>
        <span>Product</span>
        <span className={styles.itemNum}>Qty</span>
        <span className={styles.itemNum}>Rate</span>
        <span className={styles.itemNum}>Amount</span>
      </div>
      <Dash />
      {bill.items.map((item, index) => {
        const { rate, amount } = computeLineAmounts(item, gst)
        return (
          <div key={item.lineId} className={styles.itemLine}>
            <span>{index + 1}</span>
            <span className={styles.itemName}>{item.product.name}</span>
            <span className={styles.itemNum}>{item.qty}</span>
            <span className={styles.itemNum}>{formatAmount(rate)}</span>
            <span className={styles.itemNum}>{formatAmount(amount)}</span>
          </div>
        )
      })}
      <Dash />
      <Row label="Total Qty" value={String(totals.qtyCount)} />
      {totals.hasMrp && <Row label="MRP Value" value={formatAmount(totals.mrpValue)} />}
      <Row label="Gross Amount" value={formatAmount(totals.gross)} />
      {totals.billDiscountAmount > 0 && (
        <Row
          label={`Discount Amount${discountPercentLabel(totals, bill.billDiscount) ? ` (${discountPercentLabel(totals, bill.billDiscount)})` : ''}`}
          value={formatAmount(totals.billDiscountAmount)}
        />
      )}
      {gst && <Row label="Taxable" value={formatAmount(totals.taxable)} />}
      {gst && <Row label={halfRate ? `CGST ${halfRate}` : 'CGST'} value={formatAmount(totals.cgst)} />}
      {gst && <Row label={halfRate ? `SGST ${halfRate}` : 'SGST'} value={formatAmount(totals.sgst)} />}
      <Row label="Round Off" value={trailingMinus(totals.roundOff)} />
      <div className={styles.totalBlock}>
        <span>Total</span>
        <span>{formatAmount(totals.grandTotal)}</span>
      </div>
      {bill.payments.length > 1
        ? bill.payments.map((payment) => <Row key={payment.typeId} label={`Paid · ${payment.type}`} value={formatAmount(payment.amount)} />)
        : <Row label="Paid by" value={bill.paymentMethod ?? '—'} />}
      <Dash />
      {showMrpSaved && totals.hasMrp && (
        <>
          <Typography className={styles.savedLine}>
            YOU SAVED {formatCurrency(totals.mrpValue - totals.gross + totals.billDiscountAmount)}
          </Typography>
          <Dash />
        </>
      )}
      {shop.declaration && <Typography className={styles.footerNote}>{shop.declaration}</Typography>}
      <Typography className={styles.footerNote}>
        … Thank You Visit Again …
        <br />Happy Diwali..!!!
      </Typography>
    </div>
  )
}
