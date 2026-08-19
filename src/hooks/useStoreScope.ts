import { useDispatch, useSelector } from '../redux/store'
import { cancelBill as cancelBillThunk, createBill as createBillThunk, reprintBill as reprintBillThunk, type NewBillInput } from '../redux/billsSlice'
import { saveCounter as saveCounterThunk } from '../redux/countersSlice'
import { deleteProduct as deleteProductThunk, importProducts as importProductsThunk, saveProduct as saveProductThunk } from '../redux/productsSlice'
import { saveShop as saveShopThunk } from '../redux/shopSlice'
import { saveUser as saveUserThunk } from '../redux/usersSlice'
import {
  setCurrentUserId,
  setActiveCounter as setActiveCounterAction,
  setCurrentBranchId as setCurrentBranchIdAction,
  signOut as signOutAction,
  type BranchScope,
} from '../redux/sessionSlice'
import type { Bill, Branch, Product, Shop, User, UserRole } from '../types'

export type { BranchScope, NewBillInput }

const findBranch = (branches: Branch[], id: string): Branch | undefined => branches.find((branch) => branch.id === id)

/** A thunk rejection carries a string; pages expect an Error they can read. */
const asError = (reason: unknown, fallback: string): Error =>
  new Error(typeof reason === 'string' ? reason : reason instanceof Error ? reason.message : fallback)

export const useStoreScope = () => {
  const dispatch = useDispatch()

  // By using individual selectors, Redux can optimize re-renders
  // better than Context could.
  const shop = useSelector((state) => state.shop.shop)
  const users = useSelector((state) => state.users.items)
  const products = useSelector((state) => state.products.items)
  const bills = useSelector((state) => state.bills.items)
  const nextBillNumber = useSelector((state) => state.bills.nextNumber)
  const branches = useSelector((state) => state.counters.items)
  const currentUserId = useSelector((state) => state.session.currentUserId)
  const activeCounter = useSelector((state) => state.session.activeCounter)
  const currentBranchId = useSelector((state) => state.session.currentBranchId)

  const currentUser = users.find((user) => user.id === currentUserId && user.active) ?? null
  const role: UserRole = currentUser?.role ?? 'Counter Staff'
  const currentBranch = currentBranchId === 'all' ? undefined : findBranch(branches, currentBranchId)
  const activeBranch = currentBranch ?? branches[0]

  // Every list page shows the counter you're scoped to, so the filter lives here once.
  const scopedBills = currentBranchId === 'all' ? bills : bills.filter((bill) => bill.branchId === currentBranchId)

  return {
    shop,
    users,
    products,
    bills,
    scopedBills,
    currentUser,
    setCurrentUser: (user: User | null) => dispatch(setCurrentUserId(user?.id ?? null)),
    activeCounter,
    setActiveCounter: (counter: string | null) => dispatch(setActiveCounterAction(counter)),
    signOut: () => dispatch(signOutAction(branches[0]?.id ?? 'all')),
    role,
    branches,
    currentBranchId,
    setCurrentBranchId: (id: BranchScope) => dispatch(setCurrentBranchIdAction(id)),
    currentBranch,
    activeBranch,
    isSuperAdmin: role === 'Super Admin',
    nextBillNo: `${shop.invoicePrefix}${nextBillNumber}`,
    saveShop: (nextShop: Shop) => dispatch(saveShopThunk(nextShop)).unwrap(),
    saveProduct: (product: Product) => dispatch(saveProductThunk(product)).unwrap(),
    importProducts: (list: Product[]) => dispatch(importProductsThunk(list)).unwrap(),
    deleteProduct: (code: string) => dispatch(deleteProductThunk(code)).unwrap(),
    saveUser: (user: User) => dispatch(saveUserThunk(user)).unwrap(),
    saveBranch: (branch: Branch) => dispatch(saveCounterThunk(branch)).unwrap(),
    createBill: async (input: NewBillInput): Promise<Bill> => {
      try {
        return await dispatch(createBillThunk(input)).unwrap()
      } catch (reason) {
        throw asError(reason, 'Could not save this bill')
      }
    },
    cancelBill: async (billNo: string): Promise<void> => {
      try {
        await dispatch(cancelBillThunk(billNo)).unwrap()
      } catch (reason) {
        throw asError(reason, 'Could not cancel this bill')
      }
    },
    billReprinted: (billNo: string) => dispatch(reprintBillThunk(billNo)).unwrap(),
  }
}
