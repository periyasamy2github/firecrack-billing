import { useEffect, useState } from 'react'
import { Typography } from '@mui/material'

export const ElapsedTimer = ({ startedAt, className }: { startedAt: number; className?: string }) => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const seconds = Math.max(0, Math.round((now - startedAt) / 1000))
  const label = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  return <Typography className={className}>Elapsed on this bill {label}</Typography>
}
