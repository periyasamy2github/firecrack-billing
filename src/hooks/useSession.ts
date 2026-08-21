import { useDispatch, useSelector } from '../redux/store'
import { setCounterScope as setCounterScopeAction, signOut as signOutAction, type CounterScope } from '../redux/sessionSlice'
import { api, setToken } from '../services/api'
import type { UserRole } from '../types'

export type { CounterScope }

// Everything a screen needs about the signed-in user, the shop, and the counter in view.
export const useSession = () => {
  const dispatch = useDispatch()

  const shop = useSelector((state) => state.shop.shop)
  const counters = useSelector((state) => state.counters.items)
  const currentUser = useSelector((state) => state.session.user)
  const counterScope = useSelector((state) => state.session.counterScope)

  const role: UserRole = currentUser?.role ?? 'Counter Staff'
  // The counter the screens are showing; undefined while a Super Admin views all counters.
  const selectedCounter = counterScope === 'all' ? undefined : counters.find((counter) => counter.id === counterScope)

  return {
    shop,
    counters,
    currentUser,
    role,
    isSuperAdmin: role === 'Super Admin',
    counterScope,
    selectedCounter,
    // A bill is always raised on one counter: the selected one, or the first when viewing all.
    billingCounter: selectedCounter ?? counters[0],
    nextBillNo: `${shop.invoicePrefix}${shop.nextInvoiceNumber}`,
    setCounterScope: (scope: CounterScope) => dispatch(setCounterScopeAction(scope)),
    signOut: async () => {
      await api.logout().catch(() => undefined) // revoke while the token is still attached
      setToken(null)
      dispatch(signOutAction())
    },
  }
}
