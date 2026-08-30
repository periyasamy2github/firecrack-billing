import { useEffect } from 'react'

// Window/tab title while the page is mounted.
export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} — SparkBill`
    return () => { document.title = 'SparkBill — Fireworks Billing' }
  }, [title])
}
