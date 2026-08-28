import { useState, type RefObject } from 'react'
import { Autocomplete, TextField, createFilterOptions } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { KeyBadge } from '../../components/KeyBadge'
import { stockStatus } from '../../data/products'
import { formatAmount } from '../../utils/format'
import type { Product } from '../../types'
import styles from '../../css/pages/NewBill.module.css'

// Only the first 30 matches are rendered, so typing stays instant however big the catalogue is.
const filterProducts = createFilterOptions<Product>({
  limit: 30,
  stringify: (p) => `${p.code} ${p.name}`,
})

interface ProductSearchFieldProps {
  products: Product[]
  loading: boolean
  inputRef: RefObject<HTMLInputElement | null>
  onAdd: (product: Product) => void
  onScanBlocked: () => void
}

export const ProductSearchField = ({ products, loading, inputRef, onAdd, onScanBlocked }: ProductSearchFieldProps) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const add = (product: Product | null) => {
    if (!product) return
    onAdd(product)
    setQuery('')
  }

  return (
    <div
      onKeyDownCapture={(e) => {
        if (e.key !== 'Enter') return
        const scanned = query.trim()
        if (!scanned) return

        // A scan before the catalogue lands would silently do nothing.
        if (loading) {
          e.preventDefault()
          e.stopPropagation()
          onScanBlocked()
          return
        }

        // Only swallow Enter on an exact barcode; the dropdown needs it otherwise.
        const exact = products.find((p) => p.code.toLowerCase() === scanned.toLowerCase())
        if (exact) {
          e.preventDefault()
          e.stopPropagation()
          add(exact)
        }
      }}
    >
      <Autocomplete
        options={products}
        value={null}
        filterOptions={filterProducts}
        open={open && query.trim().length > 0}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        loading={loading}
        loadingText="Loading products…"
        ListboxProps={{ style: { maxHeight: 320 } }}
        inputValue={query}
        onInputChange={(_, value) => setQuery(value)}
        onChange={(_, value) => add(value)}
        getOptionLabel={(p) => `${p.code} — ${p.name}`}
        getOptionKey={(p) => p.code}
        renderOption={({ key, ...optionProps }, p) => {
          const status = stockStatus(p)
          return (
            <li key={key} {...optionProps} className={`${optionProps.className} ${styles.optionRow}`}>
              <div className={styles.optionLeft}>
                <div className={styles.optionName}>{p.name}</div>
                <div className={styles.optionMetaRow}>
                  <span className={styles.optionCode}>{p.code}</span>
                  {status.tone !== 'paid' && (
                    <span className={status.tone === 'due' ? `${styles.optionStock} ${styles.optionStockDue}` : `${styles.optionStock} ${styles.optionStockWarn}`}>
                      · {p.stock} left
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.optionRight}>
                <span className={styles.optionRate}>₹{formatAmount(p.rate)}</span>
                {p.mrp != null && <span className={styles.optionMrp}>₹{formatAmount(p.mrp)}</span>}
              </div>
            </li>
          )
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={inputRef}
            label="Item search"
            placeholder="Scan barcode, or type item code / name…"
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchRoundedIcon className={styles.searchIcon} />,
              endAdornment: (
                <span className={styles.searchEndAdornment}>
                  <KeyBadge label="F2" />
                </span>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: '8px',
                py: 0.6,
                boxShadow: '0 0 0 3px var(--primary-soft)',
                '& fieldset': { borderColor: 'primary.main', borderWidth: '1.5px' },
              },
            }}
          />
        )}
      />
    </div>
  )
}
