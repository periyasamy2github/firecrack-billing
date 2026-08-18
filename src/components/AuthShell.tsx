import { Typography } from '@mui/material'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import type { ReactNode } from 'react'
import { FireworksArt } from './FireworksArt'
import { useStoreScope } from '../hooks/useStoreScope'
import styles from './AuthShell.module.css'

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

/** Split-screen shell for the signed-out screens: brand on the left, the task on the right. */
export const AuthShell = ({ children, footer }: { children: ReactNode; footer?: ReactNode }) => {
  const { shop } = useStoreScope()

  return (
    <div className={styles.page}>
      <aside className={styles.brandPanel}>
        <FireworksArt />

        <div className={styles.brandRow}>
          <div className={styles.logo}>
            <AutoAwesomeRoundedIcon className={styles.logoIcon} />
          </div>
          <Typography className={styles.brandName}>Sparkline</Typography>
        </div>

        <div className={styles.pitch}>
          <Typography component="h1" className={styles.headline}>
            Billing built for the counter rush.
          </Typography>
          <Typography className={styles.subhead}>
            {shop.name} · {shop.town}
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

        <Typography className={styles.legal}>
          GSTIN {shop.gstin} · State {shop.stateCode}
        </Typography>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.formInner}>
          {/* Stands in for the brand panel once it is hidden on narrow screens. */}
          <div className={styles.compactBrand}>
            <div className={styles.logo}>
              <AutoAwesomeRoundedIcon className={styles.logoIcon} />
            </div>
            <Typography className={styles.compactBrandName}>Sparkline</Typography>
          </div>

          {children}
          {footer}
        </div>
      </main>
    </div>
  )
}
