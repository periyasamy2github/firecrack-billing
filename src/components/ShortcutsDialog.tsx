import { Dialog, DialogTitle, IconButton, Typography } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined'
import { KeyBadge } from './KeyBadge'
import styles from '../css/components/ShortcutsDialog.module.css'

export interface ShortcutItem {
  key: string
  label: string
  hint?: string
}

export interface ShortcutGroup {
  title: string
  items: ShortcutItem[]
}

interface ShortcutsDialogProps {
  open: boolean
  onClose: () => void
  groups: ShortcutGroup[]
}

export const ShortcutsDialog = ({ open, onClose, groups }: ShortcutsDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
    <DialogTitle className={styles.header}>
      <KeyboardOutlinedIcon className={styles.headerIcon} />
      Keyboard shortcuts
      <div className={styles.spacer} />
      <IconButton size="small" onClick={onClose} aria-label="Close shortcuts">
        <CloseRoundedIcon sx={{ fontSize: 19 }} />
      </IconButton>
    </DialogTitle>

    <div className={styles.body}>
      <div className={styles.columns}>
        {groups.map((group) => (
          <div key={group.title} className={styles.group}>
            <Typography variant="subtitle2" className={styles.groupTitle}>{group.title}</Typography>
            <div className={styles.items}>
              {group.items.map((item) => (
                <div key={item.key} className={styles.item}>
                  <KeyBadge label={item.key} />
                  <div className={styles.itemLabel}>
                    <Typography className={styles.itemText}>{item.label}</Typography>
                    {item.hint && <Typography variant="caption">{item.hint}</Typography>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </Dialog>
)
