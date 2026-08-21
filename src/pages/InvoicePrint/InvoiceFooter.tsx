import { Typography } from '@mui/material'
import type { Shop } from '../../types'
import styles from '../../css/pages/A4Invoice.module.css'

interface InvoiceFooterProps {
  shop: Shop
  gst: boolean
}

export const InvoiceFooter = ({ shop, gst }: InvoiceFooterProps) => (
  <div className={styles.footerRow}>
    <Typography className={styles.declaration}>
      <b>Declaration</b><br />{shop.declaration}
      {!gst && <><br /><i>This is a Bill of Supply — no tax has been charged on this sale.</i></>}
    </Typography>
    <div className={styles.signatureBlock}>
      <Typography className={styles.forShopLabel}>For {shop.name}</Typography>
      <div className={styles.signatureGap} />
      <Typography className={styles.signatureText}>Authorised Signatory</Typography>
    </div>
  </div>
)
