import { Dialog, IconButton, Stack, Typography } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined'
import { KeyBadge } from './KeyBadge'
import styles from './ShortcutsDialog.module.css'

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
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
    <div className={styles.header}>
      <KeyboardOutlinedIcon className={styles.headerIcon} />
      <Typography className={styles.title}>Keyboard shortcuts</Typography>
      <div className={styles.spacer} />
      <IconButton size="small" onClick={onClose} aria-label="Close shortcuts">
        <CloseRoundedIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </div>

    <div className={styles.body}>
      <Stack spacing={2}>
        {groups.map((group) => (
          <div key={group.title}>
            <Typography variant="subtitle2" className={styles.groupTitle}>{group.title}</Typography>
            <Stack spacing={1}>
              {group.items.map((item) => (
                <Stack key={item.key} direction="row" alignItems="center" spacing={1.5}>
                  <KeyBadge label={item.key} />
                  <div className={styles.itemLabel}>
                    <Typography className={styles.itemText}>{item.label}</Typography>
                    {item.hint && <Typography variant="caption">{item.hint}</Typography>}
                  </div>
                </Stack>
              ))}
            </Stack>
          </div>
        ))}
      </Stack>
    </div>
  </Dialog>
)
