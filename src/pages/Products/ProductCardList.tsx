import { Card, CircularProgress, IconButton, Typography } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { CardList } from '../../components/CardList'
import { Mono } from '../../components/Mono'
import { StatusPill } from '../../components/StatusPill'
import { stockStatus } from '../../data/products'
import { formatAmount } from '../../utils/format'
import type { ProductsTableProps } from './ProductsTable'
import styles from '../../css/components/CardList.module.css'
import pageStyles from '../../css/pages/Products.module.css'

export const ProductCardList = ({ rows, loading, filteredCount, viewingAllCounters, canManage, isPending, onEdit, onDelete, footer }: ProductsTableProps) => (
  <CardList loading={loading} empty={filteredCount === 0} emptyMessage="No products match this search." footer={footer}>
    {rows.map((p) => {
      const status = stockStatus(p)
      const key = `${p.counterId}:${p.code}`
      return (
        <Card key={key} className={styles.itemCard}>
          <div className={styles.itemCardTop}>
            <Typography className={styles.cardName}>{p.name}</Typography>
            <StatusPill tone={status.tone} label={status.label} />
          </div>
          <Typography className={styles.itemCardMeta}>
            <Mono className={styles.cardMonoSmall}>{p.code}</Mono> · {p.category}{viewingAllCounters ? ` · ${p.counter}` : ''}
          </Typography>
          <div className={styles.itemCardBottom}>
            <Typography className={styles.itemCardMeta}>
              Stock <Mono className={pageStyles.cardStock}>{p.stock}</Mono> · Sold <Mono>{p.salesCount ?? 0}</Mono>
            </Typography>
            <Mono className={styles.cardTotal}>₹{formatAmount(p.rate)}</Mono>
          </div>
          {canManage && (
            <div className={styles.itemCardActions}>
              {isPending(key) ? <CircularProgress size={16} /> : (
                <>
                  <IconButton size="small" onClick={() => onEdit(p)}><EditOutlinedIcon /></IconButton>
                  <IconButton size="small" onClick={() => onDelete(p)}><DeleteOutlineRoundedIcon /></IconButton>
                </>
              )}
            </div>
          )}
        </Card>
      )
    })}
  </CardList>
)
