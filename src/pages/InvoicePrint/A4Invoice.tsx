import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import type { Bill } from '../../types'
import { computeLineAmounts, getBillTotals, halfGstRateLabel, hsnSummary } from '../../utils/billing'
import { amountToWordsIndian, formatAmount, formatCurrency } from '../../utils/format'
import { useStoreScope } from '../../hooks/useStoreScope'
import styles from './A4Invoice.module.css'

interface A4InvoiceProps {
  bill: Bill
}

export const A4Invoice = ({ bill }: A4InvoiceProps) => {
  const { shop } = useStoreScope()
  const gst = bill.gstApplicable
  const totals = getBillTotals(bill)
  const hsn = gst ? hsnSummary(bill.items, true, bill.billDiscount) : []
  const halfRate = halfGstRateLabel(bill.items)
  const cgstLabel = halfRate ? `CGST ${halfRate}` : 'CGST'
  const sgstLabel = halfRate ? `SGST ${halfRate}` : 'SGST'

  const columns = gst
    ? ['#', 'Description of goods', 'HSN', 'MRP', 'Rate', 'Qty', 'Taxable', cgstLabel, sgstLabel, 'Amount']
    : ['#', 'Description of goods', 'HSN', 'MRP', 'Rate', 'Qty', 'Amount']

  return (
    <div className={styles.sheet}>
      <div className={styles.headerRow}>
        <div>
          <Typography className={styles.shopName}>{shop.name.toUpperCase()}</Typography>
          <Typography className={styles.shopAddress}>
            {shop.addressLine}
            <br />
            Phone {shop.phone} · GSTIN <b>{shop.gstin}</b> · State {shop.stateCode}
          </Typography>
        </div>
        <Typography className={styles.copyLabel}>
          Original for Recipient
        </Typography>
      </div>

      <Typography className={styles.invoiceTitle}>
        {gst ? 'Tax Invoice' : 'Bill of Supply — no GST'}
      </Typography>
      {bill.status === 'Cancelled' && (
        <Typography className={styles.cancelledBanner}>
          CANCELLED
        </Typography>
      )}

      <div className={styles.partyGrid}>
        <div className={styles.partyCell}>
          <Typography className={styles.partyLabel}>Billed to</Typography>
          <Typography className={styles.partyName}>{bill.customerName || 'Walk-in'}</Typography>
          <Typography className={styles.partyMeta}>
            {bill.customerMobile && <>Mobile {bill.customerMobile}<br /></>}
            Place of supply: {shop.stateCode} (intra-state)
          </Typography>
        </div>
        <div className={styles.partyCellRight}>
          {[
            ['Invoice no.', bill.billNo],
            ['Date', `${bill.date} · ${bill.time}`],
            ['Counter', `${bill.counter} · ${bill.billedBy}`],
            ['Payment', bill.paymentMethod ?? '—'],
          ].map(([label, value]) => (
            <div key={label} className={styles.metaRow}>
              <Typography className={styles.partyLabel}>{label}</Typography>
              <Typography className={styles.metaValue}>{value}</Typography>
            </div>
          ))}
        </div>
      </div>

      <Table size="small" className={styles.itemsTable}>
        <TableHead>
          <TableRow>
            {columns.map((h) => (
              <TableCell key={h} align={h === 'Description of goods' || h === '#' ? 'left' : 'right'} className={styles.headCell}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {bill.items.map((item, idx) => {
            const { rate, taxable, gstAmount } = computeLineAmounts(item, gst)
            const qtyLabel = `${item.qty} ${item.product.unit.includes('box') ? 'box' : item.product.unit.includes('packet') ? 'pkt' : ''}`
            return (
              <TableRow key={item.lineId}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{item.product.name}</TableCell>
                <TableCell align="right">{item.product.hsn}</TableCell>
                <TableCell align="right">{formatAmount(item.product.mrp)}</TableCell>
                <TableCell align="right">{formatAmount(rate)}</TableCell>
                <TableCell align="right">{qtyLabel}</TableCell>
                {gst && (
                  <>
                    <TableCell align="right">{formatAmount(taxable)}</TableCell>
                    <TableCell align="right">{formatAmount(gstAmount / 2)}</TableCell>
                    <TableCell align="right">{formatAmount(gstAmount / 2)}</TableCell>
                  </>
                )}
                <TableCell align="right">{formatAmount(taxable + gstAmount)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        <tfoot>
          <TableRow>
            <TableCell colSpan={6} className={styles.footCell} />
            <TableCell align="right" className={styles.footCellBold}>{totals.qtyCount}</TableCell>
            {gst && (
              <>
                <TableCell align="right" className={styles.footCellBold}>{formatAmount(totals.taxable)}</TableCell>
                <TableCell align="right" className={styles.footCellBold}>{formatAmount(totals.cgst)}</TableCell>
                <TableCell align="right" className={styles.footCellBold}>{formatAmount(totals.sgst)}</TableCell>
              </>
            )}
            <TableCell align="right" className={styles.footCellBold}>{formatAmount(totals.taxable + totals.cgst + totals.sgst)}</TableCell>
          </TableRow>
        </tfoot>
      </Table>

      <div className={`${styles.summaryGrid} ${gst ? styles.summaryGridGst : styles.summaryGridNoGst}`}>
        <div>
          {gst && (
            <>
              <Typography className={styles.partyLabel}>HSN summary</Typography>
              <Table size="small" className={styles.hsnTable}>
                <TableHead>
                  <TableRow>
                    {['HSN', 'GST%', 'Taxable', 'CGST', 'SGST', 'Total tax'].map((h) => (
                      <TableCell key={h} align={h === 'HSN' ? 'left' : 'right'} className={styles.hsnHeadCell}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hsn.map((row) => (
                    <TableRow key={row.hsn}>
                      <TableCell>{row.hsn}</TableCell>
                      <TableCell align="right">{row.rate}%</TableCell>
                      <TableCell align="right">{formatAmount(row.taxable)}</TableCell>
                      <TableCell align="right">{formatAmount(row.cgst)}</TableCell>
                      <TableCell align="right">{formatAmount(row.sgst)}</TableCell>
                      <TableCell align="right">{formatAmount(row.cgst + row.sgst)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
          <div className={`${styles.wordsBox} ${gst ? styles.wordsBoxGstTop : styles.wordsBoxNoGstTop}`}>
            <Typography className={styles.partyLabel}>Amount in words</Typography>
            <Typography className={styles.wordsValue}>{amountToWordsIndian(totals.grandTotal)}</Typography>
          </div>
        </div>

        {gst && (
          <Table size="small" className={styles.chargesTable}>
            <TableBody>
              {[
                ['MRP value', formatAmount(totals.mrpValue)],
                ['Counter rate', formatAmount(totals.gross)],
                ...(totals.billDiscountAmount > 0 ? [['Bill discount', `− ${formatAmount(totals.billDiscountAmount)}`]] : []),
                ['Taxable value', formatAmount(totals.taxable)],
                [cgstLabel, formatAmount(totals.cgst)],
                [sgstLabel, formatAmount(totals.sgst)],
                ['Round off', formatAmount(totals.roundOff)],
              ].map(([label, value]) => (
                <TableRow key={label}>
                  <TableCell>{label}</TableCell>
                  <TableCell align="right">{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <tfoot>
              <TableRow>
                <TableCell className={styles.grandTotalLabelCell}>Grand total</TableCell>
                <TableCell align="right" className={styles.grandTotalValueCell}>{formatCurrency(totals.grandTotal)}</TableCell>
              </TableRow>
            </tfoot>
          </Table>
        )}
      </div>

      {!gst && (
        <div className={styles.noGstRow}>
          <Table size="small" className={`${styles.chargesTable} ${styles.chargesTableNoGst}`}>
            <TableBody>
              <TableRow><TableCell>MRP value</TableCell><TableCell align="right">{formatAmount(totals.mrpValue)}</TableCell></TableRow>
              <TableRow><TableCell>Counter rate</TableCell><TableCell align="right">{formatAmount(totals.gross)}</TableCell></TableRow>
              {totals.billDiscountAmount > 0 && (
                <TableRow><TableCell>Bill discount</TableCell><TableCell align="right">− {formatAmount(totals.billDiscountAmount)}</TableCell></TableRow>
              )}
              <TableRow><TableCell>Round off</TableCell><TableCell align="right">{formatAmount(totals.roundOff)}</TableCell></TableRow>
            </TableBody>
            <tfoot>
              <TableRow>
                <TableCell className={styles.grandTotalLabelCell}>Grand total</TableCell>
                <TableCell align="right" className={styles.grandTotalValueCell}>{formatCurrency(totals.grandTotal)}</TableCell>
              </TableRow>
            </tfoot>
          </Table>
        </div>
      )}

      <div className={styles.footerRow}>
        <Typography className={styles.declaration}>
          <b>Declaration</b><br />{shop.declaration}
          {!gst && <><br /><i>This is a Bill of Supply — no tax has been charged on this sale.</i></>}
        </Typography>
        <div className={styles.signatureBlock}>
          <Typography className={styles.forShopLabel}>For {shop.name}</Typography>
          <div className={styles.signatureGap} />
          <Typography className={styles.signatureText}>Authorised Signatory</Typography>
        </div>
      </div>
    </div>
  )
}
