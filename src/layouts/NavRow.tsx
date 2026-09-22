import { NavLink, useLocation } from 'react-router-dom'
import { Typography } from '@mui/material'
import { isNavActive, type NavItem } from './navItems'
import styles from '../css/layouts/AppLayout.module.css'

export const NavRow = ({ item }: { item: NavItem }) => {
  const { pathname } = useLocation()
  const Icon = item.icon
  const isActive = isNavActive(pathname, item.to)

  return (
    <NavLink to={item.to} className={styles.navLink}>
      <div className={isActive ? `${styles.navRow} ${styles.navRowActive}` : styles.navRow}>
        <Icon className={isActive ? `${styles.navIcon} ${styles.navIconActive}` : styles.navIcon} />
        <Typography component="span" className={styles.navLabel}>
          {item.label}
        </Typography>
        <div className={styles.spacer} />
        {item.shortcut && <Typography component="span" className={`${styles.navShortcut} kbd-only`}>{item.shortcut}</Typography>}
      </div>
    </NavLink>
  )
}
