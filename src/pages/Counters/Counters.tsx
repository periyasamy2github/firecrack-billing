import { useState } from 'react'
import { Button, IconButton, Switch, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { StatusPill } from '../../components/StatusPill'
import { TableCard } from '../../components/TableCard'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useToast } from '../../hooks/useToast'
import type { Branch } from '../../types'
import { CounterDialog } from './CounterDialog'
import styles from './Counters.module.css'

export const Counters = () => {
  const { branches: counters, saveBranch } = useStoreScope()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Branch | null>(null)
  const showToast = useToast()

  const openAdd = () => {
    setEditing(null)
    setOpen(true)
  }

  const openEdit = (counter: Branch) => {
    setEditing(counter)
    setOpen(true)
  }

  const closeDialog = () => setOpen(false)

  const save = async (counter: Branch) => {
    const wasEditing = Boolean(editing)
    closeDialog()
    await saveBranch(counter)
    showToast(`${counter.name} ${wasEditing ? 'updated' : 'added'}`)
  }

  const toggleActive = (counter: Branch) => {
    void saveBranch({ ...counter, active: !counter.active })
  }

  return (
    <>
      <PageHeader
        title="Counters"
        crumb={`${counters.length} counters · ${counters.filter((c) => c.active).length} active`}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}>
            Add counter
          </Button>
        }
      />
      <PageContent>
        <TableCard
          footer={
            <div className={styles.footer}>
              <Typography variant="caption">Inactive counters can't be picked at login or billed from.</Typography>
            </div>
          }
        >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Counter</TableCell>
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
                      <Switch size="small" checked={c.active} onChange={() => toggleActive(c)} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit counter">
                        <IconButton size="small" onClick={() => openEdit(c)}>
                          <EditOutlinedIcon className={styles.actionIcon} />
                        </IconButton>
                      </Tooltip>
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
