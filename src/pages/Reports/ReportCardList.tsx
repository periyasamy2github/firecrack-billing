import { CardList } from '../../components/CardList'
import { BillCard } from '../../components/BillCard'
import type { ReportsTableProps } from './ReportsTable'

export const ReportCardList = ({ bills, loading, error, showCounterColumn, onView, footer }: ReportsTableProps) => (
  <CardList loading={loading} empty={bills.length === 0} emptyMessage={error || 'No bills match this search.'} footer={footer}>
    {bills.map((bill) => (
      <BillCard key={bill.counterId + bill.billNo} bill={bill} showCounter={showCounterColumn} onOpen={onView} />
    ))}
  </CardList>
)
