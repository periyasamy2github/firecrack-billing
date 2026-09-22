import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import { PRIMARY_NAV, MASTER_NAV, isNavActive, type NavItem } from './navItems'
import { useSession } from '../hooks/useSession'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { ROUTES } from '../utils/routes'
import styles from '../css/layouts/MobileNav.module.css'

const TAB_PATHS: string[] = [ROUTES.dashboard, ROUTES.newBill, ROUTES.bills, ROUTES.products]
const ALL_NAV = [...PRIMARY_NAV, ...MASTER_NAV]
const TABS = ALL_NAV.filter((item) => TAB_PATHS.includes(item.to))

export const MobileBottomNav = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isSuperAdmin, currentUser, signOut } = useSession()
  const { canInstall, install } = usePwaInstall()
  const [moreOpen, setMoreOpen] = useState(false)

  const moreItems = ALL_NAV.filter((item) => !TAB_PATHS.includes(item.to) && (!item.superAdminOnly || isSuperAdmin))
  const moreActive = moreItems.some((item) => isNavActive(pathname, item.to))

  const go = (to: string) => {
    setMoreOpen(false)
    navigate(to)
  }

  const tabButton = (item: NavItem) => (
    <button key={item.to} type="button" className={isNavActive(pathname, item.to) ? `${styles.tab} ${styles.tabActive}` : styles.tab} onClick={() => go(item.to)}>
      <item.icon className={styles.tabIcon} />
      <span className={styles.tabLabel}>{item.label}</span>
    </button>
  )

  return (
    <>
      <nav className={`${styles.bottomNav} mobile-only no-print`}>
        {TABS.map(tabButton)}
        <button type="button" className={moreActive ? `${styles.tab} ${styles.tabActive}` : styles.tab} onClick={() => setMoreOpen(true)}>
          <MoreHorizRoundedIcon className={styles.tabIcon} />
          <span className={styles.tabLabel}>More</span>
        </button>
      </nav>

      <Drawer anchor="bottom" open={moreOpen} onClose={() => setMoreOpen(false)} PaperProps={{ className: styles.moreSheet }}>
        <div className={styles.moreHandle} />
        <List>
          {moreItems.map((item) => (
            <ListItemButton key={item.to} selected={isNavActive(pathname, item.to)} onClick={() => go(item.to)}>
              <ListItemIcon><item.icon /></ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
          {canInstall && (
            <ListItemButton onClick={() => { setMoreOpen(false); void install() }}>
              <ListItemIcon><DownloadOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Install app" />
            </ListItemButton>
          )}
          <Divider />
          <ListItemButton onClick={() => { setMoreOpen(false); void signOut() }}>
            <ListItemIcon><LogoutRoundedIcon /></ListItemIcon>
            <ListItemText primary="Sign out" secondary={currentUser?.name} />
          </ListItemButton>
        </List>
        <Typography className={styles.moreBrand}>CrackerBooks</Typography>
      </Drawer>
    </>
  )
}
