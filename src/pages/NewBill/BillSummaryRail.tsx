import { Box, Button, Card, CircularProgress, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import type { BillDiscountType, BillTotals, PaymentType } from '../../types'
import { discountPercentLabel } from '../../utils/billing'
import { formatAmount, formatCurrency, formatSignedAmount } from '../../utils/format'
import { Mono } from '../../components/Mono'
import { PaymentMethodToggle } from './PaymentMethodToggle'
import styles from '../../css/pages/BillSummaryRail.module.css'

const popIn = keyframes`
  0% { transform: scale(0.94); }
  60% { transform: scale(1.03); }
  100% { transform: scale(1); }
`

const SumRow = ({ label, value, negative }: { label: string; value: string; negative?: boolean }) => (
  <div className={styles.sumRow}>
    <Typography className={styles.sumRowLabel}>{label}</Typography>
    <Mono sx={{ fontSize: 12.5, fontWeight: 560, color: negative ? 'var(--ember-ink)' : 'var(--ink)' }}>{value}</Mono>
  </div>
)

interface BillSummaryRailProps {
  totals: BillTotals
  gstApplicable: boolean
  halfGstRate: string | null
  paymentTypes: PaymentType[]
  paymentSelection: string
  onPaymentSelectionChange: (selection: string) => void
  mixedAmounts: Record<string, string>
  onMixedAmountChange: (typeId: string, value: string) => void
  billDiscountType: BillDiscountType
  onBillDiscountTypeChange: (type: BillDiscountType) => void
  billDiscountValue: string
  onBillDiscountValueChange: (value: string) => void
  billDiscountError?: boolean
  billDiscountInputRef?: React.RefObject<HTMLInputElement | null>
  onSaveAndPrint: () => void
  onSaveOnly: () => void
  disabled: boolean
  saving?: boolean
}

export const BillSummaryRail = ({
  totals,
  gstApplicable,
  halfGstRate,
  paymentTypes,
  paymentSelection,
  onPaymentSelectionChange,
  mixedAmounts,
  onMixedAmountChange,
  billDiscountType,
  onBillDiscountTypeChange,
  billDiscountValue,
  onBillDiscountValueChange,
  billDiscountError,
  billDiscountInputRef,
  onSaveAndPrint,
  onSaveOnly,
  disabled,
  saving = false,
}: BillSummaryRailProps) => {
  const discountPercent = discountPercentLabel(totals, billDiscountValue ? { type: billDiscountType, value: Number(billDiscountValue) } : undefined)
  // The typed figure's other face: 10% shows its ₹ value, ₹54 shows its %.
  const discountEquivalence = totals.billDiscountAmount > 0
    ? (billDiscountType === 'percent' ? `= ₹${formatAmount(totals.billDiscountAmount)}` : `= ${discountPercent}`)
    : null

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
      {totals.hasMrp && <SumRow label="MRP value" value={formatAmount(totals.mrpValue)} />}
      <SumRow label="Sub total" value={formatAmount(totals.gross)} />

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
      {discountEquivalence && <Typography className={styles.discountEquivalence}>{discountEquivalence}</Typography>}
      {totals.billDiscountAmount > 0 && (
        <SumRow label={`Bill discount applied${discountPercent ? ` (${discountPercent})` : ''}`} value={`− ${formatAmount(totals.billDiscountAmount)}`} negative />
      )}

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

    <PaymentMethodToggle
      types={paymentTypes}
      selection={paymentSelection}
      onSelectionChange={onPaymentSelectionChange}
      mixedAmounts={mixedAmounts}
      onMixedAmountChange={onMixedAmountChange}
      grandTotal={totals.grandTotal}
    />

    <div className={styles.footer}>
      <Button
        variant="contained"
        size="large"
        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <PrintOutlinedIcon />}
        disabled={disabled}
        onClick={onSaveAndPrint}
        className={styles.printButton}
      >
        {saving ? 'Saving…' : <>Save &amp; Print <Box component="span" className={styles.shortcutHint}>F9</Box></>}
      </Button>
      <Button variant="outlined" disabled={disabled} onClick={onSaveOnly}>
        Save without printing <Box component="span" className={styles.shortcutHintSubtle}>F10</Box>
      </Button>
    </div>
  </Card>
  )
}
