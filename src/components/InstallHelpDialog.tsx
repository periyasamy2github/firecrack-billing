import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useIsMobile } from '../hooks/useIsMobile'
import styles from '../css/components/InstallHelpDialog.module.css'

interface InstallHelpDialogProps {
  open: boolean
  onClose: () => void
}

const InstallStep = ({ device, steps }: { device: string; steps: string }) => (
  <div className={styles.step}>
    <Typography className={styles.device}>{device}</Typography>
    <Typography className={styles.steps}>{steps}</Typography>
  </div>
)

// Shown when the browser doesn't offer the native install prompt
// (iPhone, Brave, or an already-dismissed prompt).
export const InstallHelpDialog = ({ open, onClose }: InstallHelpDialogProps) => {
  const isMobile = useIsMobile()

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" fullScreen={isMobile}>
      <DialogTitle>Install AgniBooks</DialogTitle>
      <DialogContent className={styles.content}>
        <Typography className={styles.intro}>
          Installing puts AgniBooks on your home screen and opens it full screen like an app.
        </Typography>
        <InstallStep device="Android phone (Chrome)" steps="Open the browser menu ⋮ and tap “Install app” or “Add to Home screen”." />
        <InstallStep device="iPhone / iPad (Safari)" steps="Tap Share, then “Add to Home Screen”." />
        <InstallStep device="Computer (Chrome, Edge, Brave)" steps="Click the install icon at the right end of the address bar, or find “Install AgniBooks” in the browser menu." />
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
