import { MenuItem, Select } from '@mui/material'
import { useTokens } from '../theme/ThemeModeContext'
import { useSession } from '../hooks/useSession'

// Branch scope picker for super admins; styled for dark rail-colored surfaces.
export const CounterScopeSelect = ({ className }: { className?: string }) => {
  const t = useTokens()
  const { counters, counterScope, setCounterScope } = useSession()

  return (
    <Select
      value={counterScope}
      onChange={(e) => setCounterScope(e.target.value)}
      size="small"
      className={className}
      sx={{
        '& .MuiOutlinedInput-notchedOutline': { borderColor: t.railLine },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
        '& .MuiSelect-select': { py: 0.85, color: '#fff' },
        '& .MuiSvgIcon-root': { color: t.railFg },
      }}
      MenuProps={{ PaperProps: { sx: { bgcolor: 'background.paper', color: 'text.primary' } } }}
    >
      <MenuItem value="all" sx={{ fontWeight: 700 }}>All branches</MenuItem>
      {counters.filter((b) => b.active).map((b) => (
        <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
      ))}
    </Select>
  )
}
