import { Typography } from '@mui/material'
import type { Bill } from '../../types'
import { discountPercentLabel, getBillTotals, halfGstRateLabel, hsnSummary } from '../../utils/billing'
import { amountToWordsIndian } from '../../utils/format'
import { useSession } from '../../hooks/useSession'
import styles from '../../css/pages/A4Invoice.module.css'

import { InvoiceHeader } from './InvoiceHeader'
import { InvoicePartyGrid } from './InvoicePartyGrid'
import { InvoiceItemsTable } from './InvoiceItemsTable'
import { HsnSummaryTable } from './HsnSummaryTable'
import { InvoiceChargesTable } from './InvoiceChargesTable'
import { InvoiceFooter } from './InvoiceFooter'

interface A4InvoiceProps {
  bill: Bill
}

export const A4Invoice = ({ bill }: A4InvoiceProps) => {
  const { shop } = useSession()
  const gst = bill.gstApplicable
  const totals = getBillTotals(bill)
  const hsn = gst ? hsnSummary(bill.items, true, bill.billDiscount) : []
  const halfRate = halfGstRateLabel(bill.items)
  const cgstLabel = halfRate ? `CGST ${halfRate}` : 'CGST'
  const sgstLabel = halfRate ? `SGST ${halfRate}` : 'SGST'
  const discountPercent = discountPercentLabel(totals, bill.billDiscount)

  return (
    <div className={styles.sheet}>
      <InvoiceHeader shop={shop} gst={gst} cancelled={bill.status === 'Cancelled'} />
      <InvoicePartyGrid bill={bill} stateCode={shop.stateCode} />
      <InvoiceItemsTable items={bill.items} gst={gst} totals={totals} cgstLabel={cgstLabel} sgstLabel={sgstLabel} />

      <div className={`${styles.summaryGrid} ${gst ? styles.summaryGridGst : styles.summaryGridNoGst}`}>
        <div>
          {gst && <HsnSummaryTable rows={hsn} />}
          <div className={`${styles.wordsBox} ${gst ? styles.wordsBoxGstTop : styles.wordsBoxNoGstTop}`}>
            <Typography className={styles.partyLabel}>Amount in words</Typography>
            <Typography className={styles.wordsValue}>{amountToWordsIndian(totals.grandTotal)}</Typography>
          </div>
        </div>

        {gst && <InvoiceChargesTable totals={totals} gst cgstLabel={cgstLabel} sgstLabel={sgstLabel} discountPercent={discountPercent} />}
      </div>

      {!gst && (
        <div className={styles.noGstRow}>
          <InvoiceChargesTable totals={totals} gst={false} cgstLabel={cgstLabel} sgstLabel={sgstLabel} discountPercent={discountPercent} />
        </div>
      )}

      <InvoiceFooter shop={shop} gst={gst} />
    </div>
  )
}
