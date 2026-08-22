import { Typography } from '@mui/material'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import type { ReactNode } from 'react'
import { BrandMark } from './BrandMark'
import { FireworksArt } from './FireworksArt'
import styles from '../css/components/AuthShell.module.css'

// Nothing is fetched before sign-in, so the shop identity comes from VITE_SHOP_* in .env at build time.
const SHOP = {
  name: import.meta.env.VITE_SHOP_NAME || 'SparkBill',
  town: import.meta.env.VITE_SHOP_TOWN || '',
  gstin: import.meta.env.VITE_SHOP_GSTIN || '',
}

const HIGHLIGHTS = [
  {
    icon: ReceiptLongOutlinedIcon,
    title: 'Tax invoice or bill of supply',
    body: 'GST split by HSN when you charge it, a plain bill when you do not.',
  },
  {
    icon: PrintOutlinedIcon,
    title: 'Thermal and A4 printing',
    body: '80mm receipt for the customer, A4 tax invoice for your records.',
  },
  {
    icon: InsightsOutlinedIcon,
    title: 'Every counter in one place',
    body: 'Sales, stock and season reports across the whole shop.',
  },
]

export const AuthShell = ({ children, footer }: { children: ReactNode; footer?: ReactNode }) => (
  <div className={styles.page}>
    <aside className={styles.brandPanel}>
      <FireworksArt />

      <div className={styles.brandRow}>
        <div className={styles.logo}>
          <BrandMark className={styles.logoIcon} />
        </div>
        <Typography className={styles.brandName}>SparkBill</Typography>
      </div>

      <div className={styles.pitch}>
        <Typography component="h1" className={styles.headline}>
          Billing built for the counter rush.
        </Typography>
        <Typography className={styles.subhead}>
          {[SHOP.name, SHOP.town].filter(Boolean).join(' · ')}
        </Typography>
      </div>

      <ul className={styles.highlights}>
        {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
          <li key={title} className={styles.highlight}>
            <span className={styles.highlightIcon}>
              <Icon sx={{ fontSize: 17 }} />
            </span>
            <span className={styles.highlightText}>
              <Typography className={styles.highlightTitle}>{title}</Typography>
              <Typography className={styles.highlightBody}>{body}</Typography>
            </span>
          </li>
        ))}
      </ul>

      {SHOP.gstin && <Typography className={styles.legal}>GSTIN {SHOP.gstin}</Typography>}
    </aside>

    <main className={styles.formPanel}>
      <div className={styles.formInner}>
        <div className={styles.compactBrand}>
          <div className={styles.logo}>
            <BrandMark className={styles.logoIcon} />
          </div>
          <Typography className={styles.compactBrandName}>SparkBill</Typography>
        </div>

        {children}
        {footer}
      </div>
    </main>
  </div>
)
