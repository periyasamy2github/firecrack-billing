import { useEffect, useState } from 'react'

// Not in TS's DOM lib.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// beforeinstallprompt fires once, often before React mounts — captured at module load.
let capturedPrompt: BeforeInstallPromptEvent | null = null
const subscribers = new Set<(event: BeforeInstallPromptEvent | null) => void>()

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  capturedPrompt = event as BeforeInstallPromptEvent
  subscribers.forEach((notify) => notify(capturedPrompt))
})

window.addEventListener('appinstalled', () => {
  capturedPrompt = null
  subscribers.forEach((notify) => notify(null))
})

// iOS has no install prompt; Safari only offers Share → Add to Home Screen.
const isIosSafari = (): boolean =>
  /iPhone|iPad|iPod/.test(window.navigator.userAgent) &&
  (window.navigator as { standalone?: boolean }).standalone !== true

export const usePwaInstall = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(capturedPrompt)

  useEffect(() => {
    setDeferred(capturedPrompt)
    subscribers.add(setDeferred)
    return () => { subscribers.delete(setDeferred) }
  }, [])

  return {
    canInstall: Boolean(deferred),
    showIosHint: isIosSafari(),
    install: async () => {
      if (!capturedPrompt) return
      await capturedPrompt.prompt()
      capturedPrompt = null
      subscribers.forEach((notify) => notify(null))
    },
  }
}
