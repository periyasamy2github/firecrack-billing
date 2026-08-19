import { useState } from 'react'
import { z } from 'zod'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { StatusPill } from '../../components/StatusPill'
import { TableCard } from '../../components/TableCard'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useFormValidation } from '../../hooks/useFormValidation'
import type { Branch } from '../../types'
import styles from './Counters.module.css'

const counterSchema = z.object({
  name: z.string().trim().min(1, 'Counter name is required'),
})

export const Counters = () => {
  const { branches: counters, saveBranch } = useStoreScope()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Branch | null>(null)
  const [name, setName] = useState('')
  const { errors, validate, clearError, reset: resetErrors } = useFormValidation(counterSchema)

  const openAdd = () => {
    setEditing(null)
    setName('')
    resetErrors()
    setOpen(true)
  }

  const openEdit = (c: Branch) => {
    setEditing(c)
    setName(c.name)
    resetErrors()
    setOpen(true)
  }

  const closeDialog = () => setOpen(false)

  const save = async () => {
    if (!validate({ name })) return
    closeDialog()
    if (editing) {
      await saveBranch({ ...editing, name: name.trim() })
    } else {
      await saveBranch({ id: `c${Date.now()}`, name: name.trim(), active: true })
    }
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

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Edit counter' : 'Add counter'}</DialogTitle>
        <DialogContent className={styles.dialogContentTop}>
          <TextField
            label="Counter name"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError('name') }}
            fullWidth
            autoFocus
            required
            className={styles.nameField}
            placeholder="e.g. Counter 4 — Gift desk"
            error={Boolean(errors.name)}
            helperText={errors.name || ' '}
          />
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={save}>{editing ? 'Save changes' : 'Add counter'}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Counters
