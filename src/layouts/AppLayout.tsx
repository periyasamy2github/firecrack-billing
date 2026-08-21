import { Suspense, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { MenuItem, Select, Typography } from '@mui/material'
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined'
import { BrandMark } from '../components/BrandMark'
import { useTokens } from '../theme/ThemeModeContext'
import { useSession } from '../hooks/useSession'
import { ShortcutsDialog } from '../components/ShortcutsDialog'
import { PageSkeleton } from '../components/PageSkeleton'
import { allShortcutGroups } from '../data/shortcuts'
import { useKeyShortcuts } from '../hooks/useKeyShortcuts'
import { ROUTES } from '../utils/routes'
import { PRIMARY_NAV, MASTER_NAV } from './navItems'
import { NavRow } from './NavRow'
import { LoggedProfile } from './LoggedProfile'
import styles from '../css/layouts/AppLayout.module.css'

export const AppLayout = () => {
  const t = useTokens()
  const navigate = useNavigate()
  const { isSuperAdmin, shop, counters, counterScope, setCounterScope, selectedCounter, currentUser, signOut } = useSession()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const brandSubtitle = isSuperAdmin ? (counterScope === 'all' ? 'All counters' : selectedCounter?.name) : (currentUser?.counter ?? shop.name)

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
      <aside className={`${styles.aside} no-print`}>
        <div className={isSuperAdmin ? `${styles.brandRow} ${styles.brandRowCompact}` : styles.brandRow}>
          <div className={styles.logo}>
            <BrandMark className={styles.logoIcon} />
          </div>
          <div className={styles.brandText}>
            <Typography className={styles.brandName}>SparkBill</Typography>
            <Typography noWrap className={styles.brandSubtitle}>{brandSubtitle}</Typography>
          </div>
        </div>

        {isSuperAdmin && (
          <Select
            value={counterScope}
            onChange={(e) => setCounterScope(e.target.value)}
            size="small"
            className={styles.counterSelect}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: t.railLine },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
              '& .MuiSelect-select': { py: 0.85, color: '#fff' },
              '& .MuiSvgIcon-root': { color: t.railFg },
            }}
            MenuProps={{ PaperProps: { sx: { bgcolor: 'background.paper', color: 'text.primary' } } }}
          >
            <MenuItem value="all" sx={{ fontWeight: 700 }}>All counters</MenuItem>
            {counters.filter((b) => b.active).map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
            ))}
          </Select>
        )}

        {PRIMARY_NAV.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}

        <Typography className={styles.sectionLabel}>Master</Typography>
        {MASTER_NAV.filter((item) => !item.superAdminOnly || isSuperAdmin).map((item) => (
          <NavRow key={item.to} item={item} />
        ))}

        <div className={styles.spacer} />

        <div className={styles.shortcutsRow} onClick={() => setShortcutsOpen(true)}>
          <KeyboardOutlinedIcon className={styles.shortcutsIcon} />
          <Typography className={styles.shortcutsLabel}>Keyboard shortcuts</Typography>
          <Typography className={styles.shortcutsKey}>F1</Typography>
        </div>

        <LoggedProfile
          user={currentUser}
          isSuperAdmin={isSuperAdmin}
          counterLabel={currentUser?.counter ?? 'All counters'}
          onSignOut={() => { signOut(); }}
        />
      </aside>

      <main className={`${styles.main} print-main`}>
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>

      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} groups={allShortcutGroups} />
    </div>
  )
}
