import { Typography } from '@mui/material'
import type { Bill } from '../../types'
import { getBillTotals } from '../../utils/billing'
import { formatAmount, formatCurrency } from '../../utils/format'
import { useSession } from '../../hooks/useSession'
import { Dash, Row } from './ThermalReceipt'
import styles from '../../css/pages/ThermalReceipt.module.css'

interface DeliverySlipProps {
  bill: Bill
}

// Delivery ticket: the receipt header and totals without the item lines, torn off at the cut line.
export const DeliverySlip = ({ bill }: DeliverySlipProps) => {
  const { shop } = useSession()
  const totals = getBillTotals(bill)

  return (
    <>
      <div className={styles.cutLine}>✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>
      <div className={`${styles.sheet} ${styles.deliverySlip}`}>
        <Typography className={styles.shopName}>{shop.name.toUpperCase()}</Typography>
        <Typography className={styles.shopAddress}>
          {shop.address.split(',').slice(0, 2).join(',')}
          <br />Ph {shop.phone}
        </Typography>
        <Dash />
        <Row label="Bill No" value={bill.billNo} />
        <Row label="Date" value={`${bill.date} ${bill.time}`} />
        {bill.customerName && <Row label="Name" value={bill.customerName} />}
        <Dash />
        <Row label="Total Qty" value={String(totals.qtyCount)} />
        <Row label="Gross Amount" value={formatAmount(totals.gross)} />
        {totals.billDiscountAmount > 0 && <Row label="Discount" value={`-${formatAmount(totals.billDiscountAmount)}`} />}
        <Row label="Round off" value={formatAmount(totals.roundOff)} />
        <Dash />
        <Row label="TOTAL" value={formatCurrency(totals.grandTotal)} bold />
      </div>
    </>
  )
}
