import { useEffect } from 'react'

export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} — AgniBooks`
    return () => { document.title = 'AgniBooks — Fireworks Billing' }
  }, [title])
}
