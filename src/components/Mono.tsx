import { Box, type SxProps, type Theme } from '@mui/material'
import type { ReactNode } from 'react'
import styles from '../css/components/Mono.module.css'

interface MonoProps {
  children: ReactNode
  className?: string
  sx?: SxProps<Theme>
}

export const Mono = ({ children, className, sx }: MonoProps) => (
  <Box component="span" className={className ? `${styles.mono} ${className}` : styles.mono} sx={sx}>
    {children}
  </Box>
)
