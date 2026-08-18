interface TrendPoint {
  label: string
  value: number
}

interface PaymentSlice {
  method: string
  amount: number
}

interface TopItem {
  name: string
  amount: number
}

interface DashboardKpis {
  salesToday: number
  billsToday: number
  avgBill: number
  gstCollected: number
}

interface SeasonProgress {
  collected: number
  target: number
}

export interface StoreDashboardData {
  salesTrend: TrendPoint[]
  paymentMix: PaymentSlice[]
  topItemsToday: TopItem[]
  kpis: DashboardKpis
  season: SeasonProgress
}

const round10 = (n: number) => Math.round(n / 10) * 10

const scaleTrend = (points: TrendPoint[], factor: number): TrendPoint[] =>
  points.map((p) => ({ label: p.label, value: Math.round(p.value * factor) }))

const counter1: StoreDashboardData = {
  salesTrend: [
    { label: '28 Oct', value: 42 }, { label: '29 Oct', value: 40 }, { label: '30 Oct', value: 48 },
    { label: '31 Oct', value: 52 }, { label: '1 Nov', value: 45 }, { label: '2 Nov', value: 58 },
    { label: '3 Nov', value: 68 }, { label: '4 Nov', value: 75 }, { label: '5 Nov', value: 85 },
    { label: '6 Nov', value: 100 }, { label: '7 Nov', value: 122 }, { label: '8 Nov', value: 145 },
    { label: '9 Nov', value: 175 }, { label: 'Today', value: 221 },
  ],
  paymentMix: [
    { method: 'Cash', amount: 128441 },
    { method: 'UPI', amount: 75293 },
    { method: 'Card', amount: 17716 },
  ],
  topItemsToday: [
    { name: '7cm Flower Pot (Special)', amount: 34720 },
    { name: 'Sparklers 30cm — 10 pkt', amount: 28460 },
    { name: 'Lakshmi Deepam (Big)', amount: 24640 },
    { name: 'Ground Chakkar 15cm', amount: 20150 },
    { name: 'Fancy Rocket (5 pcs)', amount: 15280 },
    { name: "Bijili Crackers 100's", amount: 10770 },
  ],
  kpis: { salesToday: 221450, billsToday: 148, avgBill: 1496, gstCollected: 33780 },
  season: { collected: 9_20_000, target: 20_00_000 },
}

const COUNTER2_SCALE = 0.416
const counter2: StoreDashboardData = {
  salesTrend: scaleTrend(counter1.salesTrend, COUNTER2_SCALE),
  paymentMix: [
    { method: 'Cash', amount: 53420 },
    { method: 'UPI', amount: 31300 },
    { method: 'Card', amount: 7460 },
  ],
  topItemsToday: counter1.topItemsToday.map((i) => ({ name: i.name, amount: round10(i.amount * COUNTER2_SCALE) })),
  kpis: { salesToday: 92180, billsToday: 61, avgBill: 1511, gstCollected: 14190 },
  season: { collected: 3_60_000, target: 8_00_000 },
}

const COUNTER3_SCALE = 1.7
const counter3: StoreDashboardData = {
  salesTrend: scaleTrend(counter1.salesTrend, COUNTER3_SCALE),
  paymentMix: [
    { method: 'Cash', amount: 217300 },
    { method: 'UPI', amount: 127300 },
    { method: 'Card', amount: 31850 },
  ],
  topItemsToday: counter1.topItemsToday.map((i) => ({ name: i.name, amount: round10(i.amount * COUNTER3_SCALE) })),
  kpis: { salesToday: 376450, billsToday: 251, avgBill: 1499, gstCollected: 57430 },
  season: { collected: 5_80_000, target: 12_00_000 },
}

export const dashboardByBranch: Record<string, StoreDashboardData> = { c1: counter1, c2: counter2, c3: counter3 }

export const combineBranchDashboards = (data: StoreDashboardData[]): StoreDashboardData => {
  const paymentTotals = new Map<string, number>()
  data.forEach((d) => d.paymentMix.forEach((p) => paymentTotals.set(p.method, (paymentTotals.get(p.method) ?? 0) + p.amount)))

  const itemTotals = new Map<string, number>()
  data.forEach((d) => d.topItemsToday.forEach((i) => itemTotals.set(i.name, (itemTotals.get(i.name) ?? 0) + i.amount)))

  const salesToday = data.reduce((s, d) => s + d.kpis.salesToday, 0)
  const billsToday = data.reduce((s, d) => s + d.kpis.billsToday, 0)

  return {
    salesTrend: data[0].salesTrend.map((point, i) => ({
      label: point.label,
      value: data.reduce((s, d) => s + d.salesTrend[i].value, 0),
    })),
    paymentMix: Array.from(paymentTotals.entries()).map(([method, amount]) => ({ method, amount })),
    topItemsToday: Array.from(itemTotals.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount),
    kpis: {
      salesToday,
      billsToday,
      avgBill: Math.round(salesToday / billsToday),
      gstCollected: data.reduce((s, d) => s + d.kpis.gstCollected, 0),
    },
    season: {
      collected: data.reduce((s, d) => s + d.season.collected, 0),
      target: data.reduce((s, d) => s + d.season.target, 0),
    },
  }
}
