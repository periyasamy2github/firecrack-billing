import { useState } from 'react'
import { Button, CircularProgress, Switch, TextField, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useSession } from '../../hooks/useSession'
import { useDispatch } from '../../redux/store'
import { savePaymentType } from '../../redux/paymentTypesSlice'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../utils/errorMessage'
import type { PaymentType } from '../../types'
import styles from '../../css/pages/Settings.module.css'

const TypeRow = ({ type }: { type: PaymentType }) => {
  const dispatch = useDispatch()
  const showToast = useToast()
  const [name, setName] = useState(type.name)
  const [saving, setSaving] = useState(false)

  const save = async (patch: { name?: string; active?: boolean }) => {
    const next = { name: (patch.name ?? name).trim(), active: patch.active ?? type.active }
    if (!next.name) {
      setName(type.name)
      return
    }
    if (next.name === type.name && next.active === type.active) return
    setSaving(true)
    try {
      await dispatch(savePaymentType({ id: type.id, ...next })).unwrap()
      showToast(`${next.name} saved`)
    } catch (err) {
      setName(type.name)
      showToast(errorMessage(err, 'Could not save this payment type'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.paymentTypeRow}>
      <TextField
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => save({})}
        size="small"
        disabled={saving}
      />
      <Typography variant="caption">{type.active ? 'Shown on billing' : 'Hidden'}</Typography>
      {saving ? <CircularProgress size={16} /> : <Switch size="small" checked={type.active} onChange={(e) => save({ active: e.target.checked })} />}
    </div>
  )
}

export const PaymentTypesEditor = () => {
  const { paymentTypes } = useSession()
  const dispatch = useDispatch()
  const showToast = useToast()
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const addType = async () => {
    const name = newName.trim()
    if (!name || adding) return
    setAdding(true)
    try {
      await dispatch(savePaymentType({ name, active: true })).unwrap()
      setNewName('')
      showToast(`${name} added`)
    } catch (err) {
      showToast(errorMessage(err, 'Could not add this payment type'), 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className={styles.paymentTypesList}>
      {paymentTypes.map((type) => <TypeRow key={type.id} type={type} />)}

      <div className={styles.paymentTypeRow}>
        <TextField
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void addType() }}
          placeholder="New payment type…"
          size="small"
          disabled={adding}
        />
        <Button
          size="small"
          startIcon={adding ? <CircularProgress size={14} /> : <AddRoundedIcon />}
          onClick={addType}
          disabled={!newName.trim() || adding}
        >
          Add
        </Button>
      </div>
    </div>
  )
}
