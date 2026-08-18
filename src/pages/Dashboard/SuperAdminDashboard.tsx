import { Button, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { Panel } from '../../components/Panel'
import { KpiCard } from '../../components/KpiCard'
import { Mono } from '../../components/Mono'
import { useTokens } from '../../theme/ThemeModeContext'
import { useStoreScope } from '../../hooks/useStoreScope'
import { formatCurrency, formatInt, formatLongDate } from '../../utils/format'
import { dashboardKpis, paymentMix, recentBills as latestBills, salesTrend, topItems } from '../../utils/dashboard'
import { ROUTES } from '../../utils/routes'
import { RecentBillsPanel } from './RecentBillsPanel'
import styles from './SuperAdminDashboard.module.css'

export const SuperAdminDashboard = () => {
  const t = useTokens()
  const navigate = useNavigate()
  const { shop, branches, bills, currentBranchId, setCurrentBranchId, scopedBills } = useStoreScope()

  const viewingAll = currentBranchId === 'all'
  const kpis = dashboardKpis(scopedBills)
  const recentBills = latestBills(scopedBills, 8)
  const seasonSales = salesTrend(scopedBills, 10)
  const mix = paymentMix(scopedBills)
  const paymentTotal = mix.reduce((s, p) => s + p.amount, 0)
  const pieColors = [t.primary, t.paid, t.ember]
  const items = topItems(scopedBills, 6)
  const maxTopItem = Math.max(1, ...items.map((i) => i.amount))
  // Season progress counts the whole shop, whichever counter is on screen.
  const seasonCollected = dashboardKpis(bills).sales
  const seasonPct = Math.round((seasonCollected / shop.seasonTarget) * 100)

  return (
    <>
      <PageHeader
        title="Dashboard"
        crumb={viewingAll ? `${formatLongDate(new Date())} · all ${branches.length} counters` : `${formatLongDate(new Date())} · ${branches.find((b) => b.id === currentBranchId)?.name}`}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate(ROUTES.newBill)}>
            New Bill
          </Button>
        }
      />
      <PageContent>
        <div className={styles.kpiGrid}>
          <KpiCard label={viewingAll ? 'Total sales' : 'Sales'} value={formatCurrency(kpis.sales)} icon={PaymentsOutlinedIcon} />
          <KpiCard label="Bills" value={formatInt(kpis.billCount)} icon={ReceiptLongOutlinedIcon} tone="info" />
          <KpiCard label="Average bill" value={formatCurrency(kpis.avgBill)} icon={ShoppingBagOutlinedIcon} tone="ember" />
          <KpiCard label="GST collected" value={formatCurrency(kpis.gstCollected)} icon={AccountBalanceOutlinedIcon} tone="paid" />
        </div>

        {viewingAll && (
          <Panel title="Season target" subtitle={`${shop.name} · goal ${formatCurrency(shop.seasonTarget)}`}>
            <div className={styles.seasonRow}>
              <div className={styles.seasonTrack}>
                <div className={styles.seasonFill} style={{ width: `${Math.min(seasonPct, 100)}%` }} />
              </div>
              <Mono sx={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>{seasonPct}%</Mono>
              <Typography className={styles.seasonMeta}>
                {formatCurrency(seasonCollected)} of {formatCurrency(shop.seasonTarget)}
              </Typography>
            </div>
          </Panel>
        )}

        <Panel
          title="Counters"
          subtitle={viewingAll ? `${branches.length} counters · tap one to drill in` : 'tap a counter to switch · showing one counter'}
          action={
            <div className={styles.superAdminBadge}>
              <ShieldOutlinedIcon className={styles.superAdminBadgeIcon} />
              <Typography className={styles.superAdminBadgeLabel}>SUPER ADMIN VIEW</Typography>
            </div>
          }
          flush
        >
          <Table size="small">
            <TableBody>
              {branches.map((b) => {
                const branchKpis = dashboardKpis(bills.filter((bill) => bill.branchId === b.id))
                const pct = seasonCollected === 0 ? 0 : Math.round((branchKpis.sales / seasonCollected) * 100)
                const selected = b.id === currentBranchId
                return (
                  <TableRow
                    key={b.id}
                    hover
                    onClick={() => setCurrentBranchId(b.id)}
                    className={selected ? `${styles.counterRow} ${styles.counterRowSelected}` : styles.counterRow}
                  >
                    <TableCell>
                      <Typography className={styles.counterName}>{b.name}</Typography>
                    </TableCell>
                    <TableCell align="right"><Mono sx={{ fontSize: 12.5, fontWeight: 650 }}>{formatCurrency(branchKpis.sales)}</Mono></TableCell>
                    <TableCell align="right"><Mono sx={{ fontSize: 12 }}>{branchKpis.billCount} bills</Mono></TableCell>
                    <TableCell className={styles.counterProgressCell}>
                      <div className={styles.counterProgressTrack}>
                        <div className={styles.counterProgressFill} style={{ width: `${pct}%` }} />
                      </div>
                      <Typography variant="caption" className={styles.counterProgressCaption}>{pct}% of shop takings</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography className={styles.counterView}>{selected ? 'Viewing' : 'View →'}</Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Panel>

        <div className={styles.chartsGrid}>
          <Panel title="Daily sales" subtitle="₹ thousands per day">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={seasonSales} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={t.lineSoft} />
                <XAxis dataKey="label" tick={{ fontSize: 9.5, fill: t.mutedSoft }} axisLine={{ stroke: t.line }} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 9.5, fill: t.mutedSoft }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  cursor={{ fill: t.primarySoft }}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${t.line}`, background: t.card }}
                  formatter={(value) => [`₹${value}k`, 'Sales']}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {seasonSales.map((d, i) => (
                    <Cell key={d.label} fill={i === seasonSales.length - 1 ? t.secondary : t.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Payment mix" subtitle={formatCurrency(paymentTotal)}>
            <div className={styles.paymentPanelRow}>
              <div className={styles.pieWrap}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mix} dataKey="amount" nameKey="method" innerRadius={36} outerRadius={54} startAngle={90} endAngle={-270} stroke="none">
                      {mix.map((entry, i) => (
                        <Cell key={entry.method} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.pieCenter}>
                  <Mono sx={{ fontSize: 16, fontWeight: 650 }}>{kpis.billCount}</Mono>
                  <Typography className={styles.pieCenterLabel}>bills</Typography>
                </div>
              </div>
              <div className={styles.paymentList}>
                {mix.map((p, i) => (
                  <div key={p.method} className={styles.paymentRow}>
                    <div className={styles.paymentDot} style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                    <Typography className={styles.paymentMethod}>{p.method}</Typography>
                    <div className={styles.paymentSpacer} />
                    <Mono sx={{ fontSize: 11.5, fontWeight: 650 }}>{formatCurrency(p.amount)}</Mono>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        <div className={styles.bottomGrid}>
          <Panel title="Top items" subtitle="by value">
            <div className={styles.itemsList}>
              {items.map((item) => (
                <div key={item.name} className={styles.itemRow}>
                  <div>
                    <Typography className={styles.itemName}>{item.name}</Typography>
                    <div className={styles.itemTrack}>
                      <div className={styles.itemFill} style={{ width: `${(item.amount / maxTopItem) * 100}%` }} />
                    </div>
                  </div>
                  <Mono sx={{ fontSize: 11.5, textAlign: 'right', color: 'text.secondary' }}>{formatCurrency(item.amount)}</Mono>
                </div>
              ))}
            </div>
          </Panel>

          <RecentBillsPanel bills={recentBills} showCounter={viewingAll} />
        </div>
      </PageContent>
    </>
  )
}
