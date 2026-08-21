import { NavLink, useLocation } from 'react-router-dom'
import { Typography } from '@mui/material'
import { ROUTES } from '../utils/routes'
import type { NavItem } from './navItems'
import styles from '../css/layouts/AppLayout.module.css'

export const NavRow = ({ item }: { item: NavItem }) => {
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
