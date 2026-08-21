import { Typography } from '@mui/material'
import type { Shop } from '../../types'
import styles from '../../css/pages/A4Invoice.module.css'

interface InvoiceHeaderProps {
  shop: Shop
  gst: boolean
  cancelled: boolean
}

export const InvoiceHeader = ({ shop, gst, cancelled }: InvoiceHeaderProps) => (
  <>
    <div className={styles.headerRow}>
      <div>
        <Typography className={styles.shopName}>{shop.name.toUpperCase()}</Typography>
        <Typography className={styles.shopAddress}>
          {shop.address}
          <br />
          Phone {shop.phone}
          {shop.gstin && <> · GSTIN <b>{shop.gstin}</b></>}
          {shop.stateCode && <> · State {shop.stateCode}</>}
        </Typography>
      </div>
      <Typography className={styles.copyLabel}>
        Original for Recipient
      </Typography>
    </div>

    <Typography className={styles.invoiceTitle}>
      {gst ? 'Tax Invoice' : 'Bill of Supply — no GST'}
    </Typography>
    {cancelled && (
      <Typography className={styles.cancelledBanner}>
        CANCELLED
      </Typography>
    )}
  </>
)
