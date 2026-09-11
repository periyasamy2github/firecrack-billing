import { useEffect } from 'react'

export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} — SparkBill`
    return () => { document.title = 'SparkBill — Fireworks Billing' }
  }, [title])
}
