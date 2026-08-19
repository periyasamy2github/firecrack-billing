import { TextField, type SxProps, type Theme } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

interface SearchFieldProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  inputRef?: React.Ref<HTMLInputElement>
  sx?: SxProps<Theme>
}

export const SearchField = ({ placeholder, value, onChange, inputRef, sx }: SearchFieldProps) => (
  <TextField
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    size="small"
    inputRef={inputRef}
    sx={sx}
    InputProps={{ startAdornment: <SearchRoundedIcon sx={{ fontSize: 17, color: 'text.secondary', mr: 1 }} /> }}
  />
)
