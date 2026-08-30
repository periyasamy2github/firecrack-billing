import { useState } from 'react'
import { Button, CircularProgress, IconButton, Switch, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { StatusPill } from '../../components/StatusPill'
import { TableCard } from '../../components/TableCard'
import { useSession } from '../../hooks/useSession'
import { useDispatch } from '../../redux/store'
import { saveCounter } from '../../redux/countersSlice'
import { usePendingAction } from '../../hooks/usePendingAction'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../utils/errorMessage'
import type { Counter } from '../../types'
import { CounterDialog } from './CounterDialog'
import styles from '../../css/pages/Counters.module.css'
import { usePageTitle } from '../../hooks/usePageTitle'

export const Counters = () => {
  usePageTitle('Branches')
  const { counters } = useSession()
  const dispatch = useDispatch()
  const persistCounter = (counter: Counter) => dispatch(saveCounter(counter)).unwrap()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Counter | null>(null)
  const showToast = useToast()
  const { isPending, run } = usePendingAction()

  const openAdd = () => {
    setEditing(null)
    setOpen(true)
  }

  const openEdit = (counter: Counter) => {
    setEditing(counter)
    setOpen(true)
  }

  const closeDialog = () => setOpen(false)

  // Await before closing so the dialog stays open if saving fails.
  const save = async (counter: Counter) => {
    const wasEditing = Boolean(editing)
    try {
      await persistCounter(counter)
    } catch (err) {
      showToast(errorMessage(err, 'Could not save this branch'), 'error')
      throw err
    }
    closeDialog()
    showToast(`${counter.name} ${wasEditing ? 'updated' : 'added'}`)
  }

  const toggleActive = (counter: Counter) =>
    run(counter.id, async () => {
      try {
        await persistCounter({ ...counter, active: !counter.active })
      } catch (err) {
        showToast(errorMessage(err, 'Could not update this branch'), 'error')
      }
    })

  return (
    <>
      <PageHeader
        title="Branches"
        crumb={`${counters.length} branches · ${counters.filter((c) => c.active).length} active`}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}>
            Add branch
          </Button>
        }
      />
      <PageContent>
        <TableCard
          footer={
            <div className={styles.footer}>
              <Typography variant="caption">Inactive branches can't be picked at login or billed from.</Typography>
            </div>
          }
        >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Branch</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Active</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {counters.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell><Typography className={styles.counterName}>{c.name}</Typography></TableCell>
                    <TableCell><StatusPill tone={c.active ? 'paid' : 'mut'} label={c.active ? 'Active' : 'Inactive'} /></TableCell>
                    <TableCell align="right">
                      <Switch size="small" checked={c.active} onChange={() => toggleActive(c)} disabled={isPending(c.id)} />
                    </TableCell>
                    <TableCell align="right">
                      {isPending(c.id) ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Tooltip title="Edit branch">
                          <IconButton size="small" onClick={() => openEdit(c)}>
                            <EditOutlinedIcon className={styles.actionIcon} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </TableCard>
      </PageContent>

      {open && (
        <CounterDialog
          open={open}
          counter={editing}
          onClose={closeDialog}
          onSubmit={save}
        />
      )}
    </>
  )
}

export default Counters
