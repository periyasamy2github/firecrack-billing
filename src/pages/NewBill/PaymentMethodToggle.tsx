import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import type { PaymentMethod } from '../../types'
import styles from '../../css/pages/BillSummaryRail.module.css'

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof PaymentsOutlinedIcon }[] = [
  { value: 'Cash', label: 'Cash', icon: PaymentsOutlinedIcon },
  { value: 'UPI', label: 'UPI', icon: QrCode2OutlinedIcon },
  { value: 'Card', label: 'Card', icon: CreditCardOutlinedIcon },
]

interface PaymentMethodToggleProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
}

export const PaymentMethodToggle = ({ value, onChange }: PaymentMethodToggleProps) => (
  <div className={styles.paymentSection}>
    <Typography className={styles.paymentLabel}>
      Payment
    </Typography>
    <ToggleButtonGroup
      exclusive
      fullWidth
      size="small"
      value={value}
      onChange={(_, next) => next && onChange(next)}
      className={styles.paymentGroup}
    >
      {PAYMENT_OPTIONS.map(({ value: option, label, icon: Icon }) => (
        <ToggleButton
          key={option}
          value={option}
          className={styles.paymentButton}
          sx={{
            '&.Mui-selected': { borderColor: 'primary.main', bgcolor: 'var(--primary-soft)', color: 'primary.main', transform: 'translateY(-1px)' },
            '&.Mui-selected:hover': { bgcolor: 'var(--primary-soft)' },
          }}
        >
          <Icon className={styles.paymentIcon} />
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </div>
)
