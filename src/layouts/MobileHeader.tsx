import { Typography } from '@mui/material'
import { BrandMark } from '../components/BrandMark'
import { useSession } from '../hooks/useSession'
import { CounterScopeSelect } from './CounterScopeSelect'
import styles from '../css/layouts/MobileNav.module.css'

export const MobileHeader = () => {
  const { isSuperAdmin, scopeLabel } = useSession()

  return (
    <header className={`${styles.header} mobile-only no-print`}>
      <BrandMark className={styles.headerLogo} />
      <div className={styles.headerText}>
        <Typography className={styles.headerName}>AgniBooks</Typography>
        <Typography noWrap className={styles.headerSubtitle}>{scopeLabel}</Typography>
      </div>
      {isSuperAdmin && <CounterScopeSelect className={styles.headerSelect} />}
    </header>
  )
}
