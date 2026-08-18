import { Box, Button, Card, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import type { BillDiscountType, BillTotals, PaymentMethod } from '../../types'
import { formatAmount, formatCurrency, formatSignedAmount } from '../../utils/format'
import { Mono } from '../../components/Mono'
import styles from './BillSummaryRail.module.css'

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof PaymentsOutlinedIcon }[] = [
  { value: 'Cash', label: 'Cash', icon: PaymentsOutlinedIcon },
  { value: 'UPI', label: 'UPI', icon: QrCode2OutlinedIcon },
  { value: 'Card', label: 'Card', icon: CreditCardOutlinedIcon },
]

const popIn = keyframes`
  0% { transform: scale(0.94); }
  60% { transform: scale(1.03); }
  100% { transform: scale(1); }
`

interface BillSummaryRailProps {
  totals: BillTotals
  gstApplicable: boolean
  /** '9%' when every line shares a rate, null on a mixed-rate bill. */
  halfGstRate: string | null
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (method: PaymentMethod) => void
  billDiscountType: BillDiscountType
  onBillDiscountTypeChange: (type: BillDiscountType) => void
  billDiscountValue: string
  onBillDiscountValueChange: (value: string) => void
  billDiscountError?: boolean
  billDiscountInputRef?: React.RefObject<HTMLInputElement | null>
  tendered: string
  onTenderedChange: (value: string) => void
  onSaveAndPrint: () => void
  onSaveOnly: () => void
  disabled: boolean
}

export const BillSummaryRail = ({
  totals,
  gstApplicable,
  halfGstRate,
  paymentMethod,
  onPaymentMethodChange,
  billDiscountType,
  onBillDiscountTypeChange,
  billDiscountValue,
  onBillDiscountValueChange,
  billDiscountError,
  billDiscountInputRef,
  tendered,
  onTenderedChange,
  onSaveAndPrint,
  onSaveOnly,
  disabled,
}: BillSummaryRailProps) => {
  const tenderedNum = Number(tendered) || 0
  const changeDue = tenderedNum - totals.grandTotal
  // Nothing handed over yet is a neutral state, not a shortfall worth flagging in red.
  const awaitingTender = tenderedNum <= 0
  const changePositive = changeDue >= 0

  return (
    <Card className={styles.card}>
      <div className={styles.headerRow}>
        <Typography className={styles.headerLabel}>
          Bill summary
        </Typography>
        <div className={styles.spacer} />
        {!gstApplicable && (
          <Typography className={styles.supplyBadge}>
            Bill of Supply
          </Typography>
        )}
      </div>

      <div className={styles.sumList}>
        <SumRow label="MRP value" value={formatAmount(totals.mrpValue)} />
        <SumRow label="Counter rate" value={formatAmount(totals.gross)} />

        <div className={styles.billDiscountRow}>
          <Typography className={styles.billDiscountLabel}>Bill discount</Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={billDiscountType}
            onChange={(_, value: BillDiscountType | null) => value && onBillDiscountTypeChange(value)}
            className={styles.discountTypeGroup}
          >
            <ToggleButton value="percent" className={styles.discountTypeButton} sx={{ '&.Mui-selected': { bgcolor: 'var(--primary-soft)', color: 'primary.main' } }}>%</ToggleButton>
            <ToggleButton value="flat" className={styles.discountTypeButton} sx={{ '&.Mui-selected': { bgcolor: 'var(--primary-soft)', color: 'primary.main' } }}>₹</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            value={billDiscountValue}
            onChange={(e) => onBillDiscountValueChange(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            size="small"
            error={billDiscountError}
            inputRef={billDiscountInputRef}
            inputProps={{ className: styles.discountValueInput }}
            className={styles.discountValueField}
          />
        </div>
        {totals.billDiscountAmount > 0 && <SumRow label="Bill discount applied" value={`− ${formatAmount(totals.billDiscountAmount)}`} negative />}

        <div className={styles.divider} />
        <SumRow label="Taxable value" value={formatAmount(totals.taxable)} />
        {gstApplicable && (
          <>
            <SumRow label={halfGstRate ? `CGST @ ${halfGstRate}` : 'CGST'} value={formatAmount(totals.cgst)} />
            <SumRow label={halfGstRate ? `SGST @ ${halfGstRate}` : 'SGST'} value={formatAmount(totals.sgst)} />
          </>
        )}
        <SumRow label="Round off" value={formatSignedAmount(totals.roundOff)} />
      </div>

      <div className={styles.totalBanner}>
        <div className={styles.totalBannerGlow} />
        <div className={styles.totalBannerContent}>
          <Typography className={styles.totalBannerLabel}>
            Grand total
          </Typography>
          <Mono
            key={totals.grandTotal}
            sx={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#fff',
              textShadow: '0 4px 24px rgba(0,0,0,0.25)',
              animation: `${popIn} 260ms ease-out`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          >
            {formatCurrency(totals.grandTotal).replace('.00', '')}
          </Mono>
        </div>
      </div>

      <div className={styles.paymentSection}>
        <Typography className={styles.paymentLabel}>
          Payment
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={paymentMethod}
          onChange={(_, value) => value && onPaymentMethodChange(value)}
          className={styles.paymentGroup}
        >
          {PAYMENT_OPTIONS.map(({ value, label, icon: Icon }) => (
            <ToggleButton
              key={value}
              value={value}
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

      <div className={styles.footer}>
        <TextField
          label="Amount tendered"
          value={tendered}
          onChange={(e) => onTenderedChange(e.target.value.replace(/[^0-9.]/g, ''))}
          inputProps={{ className: styles.tenderedInput }}
          fullWidth
        />
        <div className={`${styles.changeRow} ${awaitingTender ? styles.changeRowNeutral : changePositive ? styles.changeRowPositive : styles.changeRowNegative}`}>
          <Typography className={`${styles.changeLabel} ${awaitingTender ? styles.changeLabelNeutral : changePositive ? styles.changeLabelPositive : styles.changeLabelNegative}`}>
            {changePositive ? 'Change due' : 'Amount short'}
          </Typography>
          <Mono sx={{ fontSize: 15, color: awaitingTender ? 'var(--muted)' : changePositive ? 'var(--paid-ink)' : 'var(--due-ink)', fontWeight: 700 }}>
            {awaitingTender ? '—' : formatCurrency(Math.abs(changeDue))}
          </Mono>
        </div>
        <Button variant="contained" size="large" startIcon={<PrintOutlinedIcon />} disabled={disabled} onClick={onSaveAndPrint} className={styles.printButton}>
          Save &amp; Print <Box component="span" className={styles.shortcutHint}>F9</Box>
        </Button>
        <Button variant="outlined" disabled={disabled} onClick={onSaveOnly}>
          Save without printing <Box component="span" className={styles.shortcutHintSubtle}>F10</Box>
        </Button>
      </div>
    </Card>
  )
}

const SumRow = ({ label, value, negative }: { label: string; value: string; negative?: boolean }) => (
  <div className={styles.sumRow}>
    <Typography className={styles.sumRowLabel}>{label}</Typography>
    <Mono sx={{ fontSize: 12.5, fontWeight: 560, color: negative ? 'var(--ember-ink)' : 'var(--ink)' }}>{value}</Mono>
  </div>
)
