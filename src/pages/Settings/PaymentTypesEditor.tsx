import { useState } from 'react'
import { CircularProgress, IconButton, Switch, TextField, Tooltip } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useSession } from '../../hooks/useSession'
import { useDispatch } from '../../redux/store'
import { savePaymentType } from '../../redux/paymentTypesSlice'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../utils/errorMessage'
import type { PaymentType } from '../../types'
import styles from '../../css/pages/Settings.module.css'

const TypeTile = ({ type }: { type: PaymentType }) => {
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
    <div className={type.active ? styles.typeTile : `${styles.typeTile} ${styles.typeTileOff}`}>
      <TextField
        variant="standard"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => save({})}
        disabled={saving}
        fullWidth
        InputProps={{ disableUnderline: true, className: styles.typeTileInput }}
      />
      {saving
        ? <CircularProgress size={16} />
        : (
          <Tooltip title={type.active ? 'Shown on billing' : 'Hidden from billing'}>
            <Switch size="small" checked={type.active} onChange={(e) => save({ active: e.target.checked })} />
          </Tooltip>
        )}
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
    <div className={styles.typeGrid}>
      {paymentTypes.map((type) => <TypeTile key={type.id} type={type} />)}

      <div className={`${styles.typeTile} ${styles.typeAdd}`}>
        <TextField
          variant="standard"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void addType() }}
          placeholder="New payment type"
          disabled={adding}
          fullWidth
          InputProps={{ disableUnderline: true, className: styles.typeTileInput }}
        />
        <IconButton size="small" color="primary" onClick={addType} disabled={adding}>
          {adding ? <CircularProgress size={14} /> : <AddRoundedIcon fontSize="small" />}
        </IconButton>
      </div>
    </div>
  )
}
