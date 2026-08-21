import { useRef, useState } from 'react'

// Blocks a second click on the same record while its action is still running.
export const usePendingAction = () => {
  const [pendingKeys, setPendingKeys] = useState<string[]>([])
  // A ref, not state — state updates land too late to block the second click.
  const running = useRef(new Set<string>())

  const isPending = (key: string) => pendingKeys.includes(key)

  const run = async (key: string, action: () => Promise<unknown>) => {
    if (running.current.has(key)) return

    running.current.add(key)
    setPendingKeys((keys) => [...keys, key])
    try {
      await action()
    } finally {
      running.current.delete(key)
      setPendingKeys((keys) => keys.filter((pending) => pending !== key))
    }
  }

  return { isPending, run }
}
