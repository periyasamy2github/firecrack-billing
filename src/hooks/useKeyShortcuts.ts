import { useEffect, useRef } from 'react'

export type KeyBindings = Record<string, () => void>

const isEditableElement = (el: Element | null): boolean => {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement).isContentEditable
}

interface UseKeyShortcutsOptions {
  /** Keys that should fire even while a text field has focus — safe for function keys, never for bare letters. */
  allowInInputs?: string[]
}

/**
 * Binds `bindings` (e.g. { F2: focusSearch, n: goToNewBill }) to window keydown.
 * Bare letters and digits are ignored while focus is inside a text field so shortcuts
 * never fight with typing; function keys can opt into firing anyway via allowInInputs.
 */
export const useKeyShortcuts = (bindings: KeyBindings, options?: UseKeyShortcutsOptions) => {
  const bindingsRef = useRef(bindings)
  bindingsRef.current = bindings
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      // Letters match case-insensitively so one binding covers Shift too.
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const action = bindingsRef.current[key]
      if (!action) return
      if (isEditableElement(document.activeElement) && !optionsRef.current?.allowInInputs?.includes(key)) return
      e.preventDefault()
      action()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
