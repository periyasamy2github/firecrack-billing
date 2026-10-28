import { Typography } from '@mui/material'
import type { Bill } from '../../types'
import { getBillTotals } from '../../utils/billing'
import { formatAmount } from '../../utils/format'
import { useSession } from '../../hooks/useSession'
import { Dash, Meta, Row, trailingMinus } from './ThermalReceipt'
import styles from '../../css/pages/ThermalReceipt.module.css'

interface DeliverySlipProps {
  bill: Bill
}

export const CutLine = () => <div className={styles.cutLine}>✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

// Delivery ticket: the receipt header and totals without the item lines, torn off at the cut line.
export const DeliverySlip = ({ bill }: DeliverySlipProps) => {
  const { shop } = useSession()
  const totals = getBillTotals(bill)

  return (
    <div className={`${styles.sheet} ${styles.deliverySlip}`}>
      <Typography className={styles.shopName}>{shop.name.toUpperCase()}</Typography>
      {bill.counter && <Typography className={styles.shopAddress}>{bill.counter.toUpperCase()}</Typography>}
      {shop.town && <Typography className={styles.shopAddress}>{shop.town.toUpperCase()}</Typography>}
      {shop.phone && <Typography className={styles.shopAddress}>Cell : {shop.phone}</Typography>}
      <Dash />
      <Meta label="Bill No" value={`${bill.billNo}  ${bill.billedBy}`} />
      <Meta label="Date" value={`${bill.date}  ${bill.time}`} />
      {bill.customerName && <Meta label="Name" value={bill.customerName} />}
      <Dash />
      <Row label="Total Qty" value={String(totals.qtyCount)} />
      <Row label="Gross Amount" value={formatAmount(totals.gross)} />
      {totals.billDiscountAmount > 0 && <Row label="Discount" value={formatAmount(totals.billDiscountAmount)} />}
      <Row label="Round Off" value={trailingMinus(totals.roundOff)} />
      <div className={styles.totalBlock}>
        <span>Total</span>
        <span>{formatAmount(totals.grandTotal)}</span>
      </div>
    </div>
  )
}
