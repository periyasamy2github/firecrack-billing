import { useMediaQuery } from '@mui/material'

// Must match the 768px breakpoint used across the module CSS media queries.
export const useIsMobile = () => useMediaQuery('(max-width: 768px)', { noSsr: true })
