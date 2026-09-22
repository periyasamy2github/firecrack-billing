import type { ReactNode } from 'react'
import { Card, Typography } from '@mui/material'
import { Mono } from './Mono'
import { StatusPill, BILL_STATUS_TONE } from './StatusPill'
import { getBillTotals, mixedPaymentLabel } from '../utils/billing'
import { formatCurrency } from '../utils/format'
import type { Bill } from '../types'
import styles from '../css/components/CardList.module.css'

interface BillCardProps {
  bill: Bill
  showCounter: boolean
  showTime?: boolean
  actions?: ReactNode
  onOpen: (bill: Bill) => void
}

export const BillCard = ({ bill, showCounter, showTime = false, actions, onOpen }: BillCardProps) => (
  <Card className={`${styles.itemCard} ${styles.itemCardClickable}`} onClick={() => onOpen(bill)}>
    <div className={styles.itemCardTop}>
      <Mono className={styles.cardMonoStrong}>{bill.billNo}</Mono>
      <StatusPill tone={BILL_STATUS_TONE[bill.status]} label={bill.status} />
    </div>
    <Typography className={styles.cardName}>{bill.customerName || 'Walk-in'}</Typography>
    <Typography className={styles.itemCardMeta}>
      {bill.date}{showTime ? ` ${bill.time}` : ''}{showCounter ? ` · ${bill.counter}` : ''} · {bill.billedBy}
    </Typography>
    <div className={styles.itemCardBottom}>
      <div className={styles.itemCardPayment}>
        {bill.payments.length > 1
          ? <Mono className={styles.cardMixed}>{mixedPaymentLabel(bill)}</Mono>
          : bill.paymentMethod && <StatusPill tone="paid" dot={false} label={bill.paymentMethod} />}
      </div>
      <Mono className={bill.status === 'Cancelled' ? `${styles.cardTotal} ${styles.cardTotalCancelled}` : styles.cardTotal}>
        {formatCurrency(getBillTotals(bill).grandTotal)}
      </Mono>
    </div>
    {actions}
  </Card>
)
