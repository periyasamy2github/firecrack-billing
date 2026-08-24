import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import type { SvgIconComponent } from '@mui/icons-material'

export interface NavItem {
  label: string
  to: string
  icon: SvgIconComponent
  shortcut?: string
  superAdminOnly?: boolean
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: DashboardOutlinedIcon },
  { label: 'New Bill', to: '/bills/new', icon: ReceiptLongOutlinedIcon, shortcut: 'N' },
  { label: 'Bills', to: '/bills', icon: ListAltOutlinedIcon },
  { label: 'Reports', to: '/reports', icon: BarChartOutlinedIcon },
]

export const MASTER_NAV: NavItem[] = [
  { label: 'Products', to: '/products', icon: Inventory2OutlinedIcon },
  { label: 'Users', to: '/users', icon: BadgeOutlinedIcon, superAdminOnly: true },
  { label: 'Branches', to: '/counters', icon: PointOfSaleOutlinedIcon, superAdminOnly: true },
  { label: 'Settings', to: '/settings', icon: SettingsOutlinedIcon, superAdminOnly: true },
]
