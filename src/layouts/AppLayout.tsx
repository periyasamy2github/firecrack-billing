import { Suspense, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, IconButton, MenuItem, Select, Tooltip, Typography } from '@mui/material'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import { useTokens } from '../theme/ThemeModeContext'
import { useStoreScope } from '../hooks/useStoreScope'
import { ShortcutsDialog } from '../components/ShortcutsDialog'
import { PageSkeleton } from '../components/PageSkeleton'
import { allShortcutGroups } from '../data/shortcuts'
import { useKeyShortcuts } from '../hooks/useKeyShortcuts'
import { ROUTES } from '../utils/routes'
import styles from './AppLayout.module.css'

interface NavItem {
  label: string
  to: string
  icon: SvgIconComponent
  shortcut?: string
  superAdminOnly?: boolean
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: DashboardOutlinedIcon },
  { label: 'New Bill', to: '/bills/new', icon: ReceiptLongOutlinedIcon, shortcut: 'N' },
  { label: 'Bills', to: '/bills', icon: ListAltOutlinedIcon },
  { label: 'Reports', to: '/reports', icon: BarChartOutlinedIcon },
]

const MASTER_NAV: NavItem[] = [
  { label: 'Products', to: '/products', icon: Inventory2OutlinedIcon },
  { label: 'Users', to: '/users', icon: BadgeOutlinedIcon, superAdminOnly: true },
  { label: 'Counters', to: '/counters', icon: PointOfSaleOutlinedIcon, superAdminOnly: true },
  { label: 'Settings', to: '/settings', icon: SettingsOutlinedIcon, superAdminOnly: true },
]

const NavRow = ({ item }: { item: NavItem }) => {
  const { pathname } = useLocation()
  const Icon = item.icon
  // New Bill is its own row, so Bills must not light up while /bills/new is open.
  const isActive =
    item.to === '/'
      ? pathname === '/'
      : pathname === item.to || (pathname.startsWith(`${item.to}/`) && pathname !== ROUTES.newBill)

  return (
    <NavLink to={item.to} className={styles.navLink}>
      <div className={isActive ? `${styles.navRow} ${styles.navRowActive}` : styles.navRow}>
        <Icon className={isActive ? `${styles.navIcon} ${styles.navIconActive}` : styles.navIcon} />
        <Typography component="span" className={styles.navLabel}>
          {item.label}
        </Typography>
        <div className={styles.spacer} />
        {item.shortcut && <Typography component="span" className={styles.navShortcut}>{item.shortcut}</Typography>}
      </div>
    </NavLink>
  )
}

export const AppLayout = () => {
  const t = useTokens()
  const navigate = useNavigate()
  const { isSuperAdmin, shop, branches, currentBranchId, setCurrentBranchId, currentBranch, currentUser, activeCounter, signOut } = useStoreScope()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const brandSubtitle = isSuperAdmin ? (currentBranchId === 'all' ? 'All counters' : currentBranch?.name) : (activeCounter ?? shop.name)

  // One letter per page — the shortcut hook matches either case. Super-Admin-only
  // pages are left unbound for staff so a keypress can't land them on Access denied.
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
            <AutoAwesomeRoundedIcon className={styles.logoIcon} />
          </div>
          <div className={styles.brandText}>
            <Typography className={styles.brandName}>Sparkline</Typography>
            <Typography noWrap className={styles.brandSubtitle}>{brandSubtitle}</Typography>
          </div>
        </div>

        {isSuperAdmin && (
          <Select
            value={currentBranchId}
            onChange={(e) => setCurrentBranchId(e.target.value)}
            size="small"
            className={styles.branchSelect}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: t.railLine },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
              '& .MuiSelect-select': { py: 0.85, color: '#fff' },
              '& .MuiSvgIcon-root': { color: t.railFg },
            }}
            MenuProps={{ PaperProps: { sx: { bgcolor: 'background.paper', color: 'text.primary' } } }}
          >
            <MenuItem value="all" sx={{ fontWeight: 700 }}>All counters</MenuItem>
            {branches.filter((b) => b.active).map((b) => (
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

        <div className={styles.userRow}>
          <div className={styles.avatarRing}>
            <Avatar className={styles.avatar}>{currentUser?.initials ?? '—'}</Avatar>
          </div>
          <div className={styles.userTextBlock}>
            <Typography className={styles.userName}>{currentUser?.name ?? 'Guest'}</Typography>
            {isSuperAdmin ? (
              <div className={styles.roleRow}>
                <ShieldOutlinedIcon className={styles.roleIcon} />
                <Typography className={styles.roleLabel}>Super Admin</Typography>
              </div>
            ) : (
              <Typography noWrap className={styles.counterLabel}>{activeCounter ?? 'All counters'}</Typography>
            )}
          </div>
          <Tooltip title="Sign out">
            <IconButton
              size="small"
              aria-label="Sign out"
              onClick={() => { signOut(); navigate(ROUTES.login) }}
              className={styles.signOutButton}
            >
              <LogoutOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </div>
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
