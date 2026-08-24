import { Typography } from '@mui/material'
import type { Bill } from '../../types'
import styles from '../../css/pages/A4Invoice.module.css'

interface InvoicePartyGridProps {
  bill: Bill
  stateCode: string
}

export const InvoicePartyGrid = ({ bill, stateCode }: InvoicePartyGridProps) => (
  <div className={styles.partyGrid}>
    <div className={styles.partyCell}>
      <Typography className={styles.partyLabel}>Billed to</Typography>
      <Typography className={styles.partyName}>{bill.customerName || 'Walk-in'}</Typography>
      <Typography className={styles.partyMeta}>
        {bill.customerMobile && <>Mobile {bill.customerMobile}<br /></>}
        {stateCode && <>Place of supply: {stateCode} (intra-state)</>}
      </Typography>
    </div>
    <div className={styles.partyCellRight}>
      {[
        ['Invoice no.', bill.billNo],
        ['Date', `${bill.date} · ${bill.time}`],
        ['Branch', `${bill.counter} · ${bill.billedBy}`],
        ['Payment', bill.paymentMethod ?? '—'],
      ].map(([label, value]) => (
        <div key={label} className={styles.metaRow}>
          <Typography className={styles.partyLabel}>{label}</Typography>
          <Typography className={styles.metaValue}>{value}</Typography>
        </div>
      ))}
    </div>
  </div>
)
