import { CircularProgress, IconButton } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { CardList } from '../../components/CardList'
import { BillCard } from '../../components/BillCard'
import type { BillsTableProps } from './BillsTable'
import styles from '../../css/components/CardList.module.css'

export const BillCardList = ({ bills, loading, error, viewingAll, isPending, onView, onEdit, onReprint, onCancel, footer }: BillsTableProps) => (
  <CardList loading={loading} empty={bills.length === 0} emptyMessage={error || 'No bills match this search.'} footer={footer}>
    {bills.map((bill) => (
      <BillCard
        key={bill.billNo}
        bill={bill}
        showCounter={viewingAll}
        showTime
        onOpen={onView}
        actions={
          <div className={styles.itemCardActions} onClick={(e) => e.stopPropagation()}>
            {isPending(bill.billNo) ? <CircularProgress size={16} /> : (
              <>
                <IconButton size="small" onClick={() => onView(bill)}><VisibilityOutlinedIcon /></IconButton>
                {bill.status === 'Paid' && (
                  <>
                    <IconButton size="small" onClick={() => onEdit(bill)}><EditOutlinedIcon /></IconButton>
                    <IconButton size="small" onClick={() => onReprint(bill)}><PrintOutlinedIcon /></IconButton>
                    <IconButton size="small" onClick={() => onCancel(bill)}><CancelOutlinedIcon /></IconButton>
                  </>
                )}
              </>
            )}
          </div>
        }
      />
    ))}
  </CardList>
)
