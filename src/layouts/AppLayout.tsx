import { Suspense, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Typography } from '@mui/material'
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import { BrandMark } from '../components/BrandMark'
import { useSession } from '../hooks/useSession'
import { ShortcutsDialog } from '../components/ShortcutsDialog'
import { InstallHelpDialog } from '../components/InstallHelpDialog'
import { PageSkeleton } from '../components/PageSkeleton'
import { allShortcutGroups } from '../data/shortcuts'
import { useKeyShortcuts } from '../hooks/useKeyShortcuts'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { ROUTES } from '../utils/routes'
import { PRIMARY_NAV, MASTER_NAV } from './navItems'
import { NavRow } from './NavRow'
import { LoggedProfile } from './LoggedProfile'
import { CounterScopeSelect } from './CounterScopeSelect'
import { MobileHeader } from './MobileHeader'
import { MobileBottomNav } from './MobileBottomNav'
import styles from '../css/layouts/AppLayout.module.css'

export const AppLayout = () => {
  const navigate = useNavigate()
  const { isSuperAdmin, scopeLabel, currentUser, signOut } = useSession()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [installHelpOpen, setInstallHelpOpen] = useState(false)
  const { canInstall, isInstalled, install } = usePwaInstall()

  const navKeys: Record<string, string> = {
    n: ROUTES.newBill,
    d: ROUTES.dashboard,
    b: ROUTES.bills,
    r: ROUTES.reports,
    p: ROUTES.products,
    ...(isSuperAdmin ? { u: ROUTES.users, s: ROUTES.settings } : {}),
  }

  useKeyShortcuts({
    F1: () => setShortcutsOpen(true),
    '?': () => setShortcutsOpen(true),
    ...Object.fromEntries(Object.entries(navKeys).map(([key, path]) => [key, () => navigate(path)])),
  })

  return (
    <div className={`${styles.shell} print-shell`}>
      <MobileHeader />
      <aside className={`${styles.aside} no-print`}>
        <div className={isSuperAdmin ? `${styles.brandRow} ${styles.brandRowCompact}` : styles.brandRow}>
          <div className={styles.logo}>
            <BrandMark className={styles.logoIcon} />
          </div>
          <div className={styles.brandText}>
            <Typography className={styles.brandName}>AgniBooks</Typography>
            <Typography noWrap className={styles.brandSubtitle}>{scopeLabel}</Typography>
          </div>
        </div>

        {isSuperAdmin && <CounterScopeSelect className={styles.counterSelect} />}

        {PRIMARY_NAV.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}

        <Typography className={styles.sectionLabel}>Master</Typography>
        {MASTER_NAV.filter((item) => !item.superAdminOnly || isSuperAdmin).map((item) => (
          <NavRow key={item.to} item={item} />
        ))}

        <div className={styles.spacer} />

        {!isInstalled && (
          <div className={styles.shortcutsRow} onClick={() => { if (canInstall) void install(); else setInstallHelpOpen(true) }}>
            <DownloadOutlinedIcon className={styles.shortcutsIcon} />
            <Typography className={styles.shortcutsLabel}>Install app</Typography>
          </div>
        )}

        <div className={`${styles.shortcutsRow} kbd-only`} onClick={() => setShortcutsOpen(true)}>
          <KeyboardOutlinedIcon className={styles.shortcutsIcon} />
          <Typography className={styles.shortcutsLabel}>Keyboard shortcuts</Typography>
          <Typography className={styles.shortcutsKey}>F1</Typography>
        </div>

        <LoggedProfile
          user={currentUser}
          isSuperAdmin={isSuperAdmin}
          counterLabel={currentUser?.counter ?? 'All branches'}
          onSignOut={() => { signOut(); }}
        />
      </aside>

      <main className={`${styles.main} print-main`}>
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>

      <MobileBottomNav />

      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} groups={allShortcutGroups} />
      <InstallHelpDialog open={installHelpOpen} onClose={() => setInstallHelpOpen(false)} />
    </div>
  )
}
