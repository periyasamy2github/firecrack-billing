import { Box, type SxProps, type Theme } from '@mui/material'
import type { ReactNode } from 'react'
import styles from './Mono.module.css'

interface MonoProps {
  children: ReactNode
  sx?: SxProps<Theme>
}

export const Mono = ({ children, sx }: MonoProps) => (
  <Box component="span" className={styles.mono} sx={sx}>
    {children}
  </Box>
)
