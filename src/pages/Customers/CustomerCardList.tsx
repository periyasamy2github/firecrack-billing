import type { ReactNode } from 'react'
import { Card, Typography } from '@mui/material'
import { CardList } from '../../components/CardList'
import { Mono } from '../../components/Mono'
import { formatBillDate, formatCurrency, formatInt } from '../../utils/format'
import type { Customer } from '../../types'
import styles from '../../css/components/CardList.module.css'

interface CustomerCardListProps {
  customers: Customer[]
  loading: boolean
  empty: boolean
  footer: ReactNode
}

export const CustomerCardList = ({ customers, loading, empty, footer }: CustomerCardListProps) => (
  <CardList loading={loading} empty={empty} emptyMessage="No customers yet" footer={footer}>
    {customers.map((customer) => (
      <Card key={customer.mobile} className={styles.itemCard}>
        <div className={styles.itemCardTop}>
          <Typography className={styles.cardName}>{customer.name}</Typography>
          <Mono className={styles.cardMonoSmall}>{customer.mobile}</Mono>
        </div>
        <div className={styles.itemCardBottom}>
          <Typography className={styles.itemCardMeta}>
            {formatInt(customer.bills)} bills · last {formatBillDate(new Date(customer.lastBilledAt))}
          </Typography>
          <Mono className={styles.cardTotal}>{formatCurrency(customer.spent)}</Mono>
        </div>
      </Card>
    ))}
  </CardList>
)
