import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel } from '../../components/Panel'
import { useTokens } from '../../theme/ThemeModeContext'
import type { DashboardStats } from '../../types'

interface DailySalesChartProps {
  trend: DashboardStats['trend']
}

export const DailySalesChart = ({ trend }: DailySalesChartProps) => {
  const t = useTokens()

  return (
    <Panel title="Daily sales" subtitle="₹ per day">
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={trend} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={t.lineSoft} />
          <XAxis dataKey="label" tick={{ fontSize: 9.5, fill: t.mutedSoft }} axisLine={{ stroke: t.line }} tickLine={false} interval={0} />
          <YAxis tick={{ fontSize: 9.5, fill: t.mutedSoft }} axisLine={false} tickLine={false} width={34} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v))} />
          <Tooltip
            cursor={{ fill: t.primarySoft }}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${t.line}`, background: t.card }}
            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={46}>
            {trend.map((point, i) => (
              <Cell key={point.label} fill={i === trend.length - 1 ? t.secondary : t.primary} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}
