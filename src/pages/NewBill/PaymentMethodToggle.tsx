import { TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded'
import type { PaymentType } from '../../types'
import { formatAmount } from '../../utils/format'
import { Mono } from '../../components/Mono'
import styles from '../../css/pages/BillSummaryRail.module.css'

export const MIXED = 'mixed'

const ICONS: Record<string, typeof PaymentsOutlinedIcon> = {
  Cash: PaymentsOutlinedIcon,
  UPI: QrCode2OutlinedIcon,
  Card: CreditCardOutlinedIcon,
}

interface PaymentMethodToggleProps {
  types: PaymentType[]
  selection: string
  onSelectionChange: (selection: string) => void
  mixedAmounts: Record<string, string>
  onMixedAmountChange: (typeId: string, value: string) => void
  grandTotal: number
}

export const PaymentMethodToggle = ({ types, selection, onSelectionChange, mixedAmounts, onMixedAmountChange, grandTotal }: PaymentMethodToggleProps) => {
  const tendered = types.reduce((sum, type) => sum + (Number(mixedAmounts[type.id]) || 0), 0)
  const remaining = grandTotal - tendered

  return (
    <div className={styles.paymentSection}>
      <Typography className={styles.paymentLabel}>
        Payment
      </Typography>
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        value={selection}
        onChange={(_, next) => next && onSelectionChange(next)}
        className={styles.paymentGroup}
      >
        {types.map((type) => {
          const Icon = ICONS[type.name] ?? AccountBalanceWalletOutlinedIcon
          return (
            <ToggleButton
              key={type.id}
              value={type.id}
              className={styles.paymentButton}
              sx={{
                '&.Mui-selected': { borderColor: 'primary.main', bgcolor: 'var(--primary-soft)', color: 'primary.main', transform: 'translateY(-1px)' },
                '&.Mui-selected:hover': { bgcolor: 'var(--primary-soft)' },
              }}
            >
              <Icon className={styles.paymentIcon} />
              {type.name}
            </ToggleButton>
          )
        })}
        <ToggleButton
          value={MIXED}
          className={styles.paymentButton}
          sx={{
            '&.Mui-selected': { borderColor: 'primary.main', bgcolor: 'var(--primary-soft)', color: 'primary.main', transform: 'translateY(-1px)' },
            '&.Mui-selected:hover': { bgcolor: 'var(--primary-soft)' },
          }}
        >
          <CallSplitRoundedIcon className={styles.paymentIcon} />
          Mixed
        </ToggleButton>
      </ToggleButtonGroup>

      {selection === MIXED && (
        <>
          <div className={styles.mixedGrid}>
            {types.map((type) => (
              <TextField
                key={type.id}
                label={type.name}
                value={mixedAmounts[type.id] ?? ''}
                onChange={(e) => onMixedAmountChange(type.id, e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0"
                size="small"
              />
            ))}
          </div>
          <div className={`${styles.mixedRemaining} ${remaining === 0 && grandTotal > 0 ? styles.mixedRemainingOk : styles.mixedRemainingDue}`}>
            <span>{remaining === 0 && grandTotal > 0 ? 'Fully covered' : remaining > 0 ? 'Remaining' : 'Over by'}</span>
            <Mono sx={{ fontSize: 11.5, fontWeight: 700, color: 'inherit' }}>{formatAmount(Math.abs(remaining))}</Mono>
          </div>
        </>
      )}
    </div>
  )
}
