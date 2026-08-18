import { useDispatch, useSelector } from '../redux/store'
import {
  saveShop as saveShopAction,
  saveProduct as saveProductAction,
  importProducts as importProductsAction,
  saveUser as saveUserAction,
  saveBranch as saveBranchAction,
  billCreated,
  cancelBill as cancelBillAction,
} from '../redux/dataSlice'
import {
  setCurrentUserId,
  setActiveCounter as setActiveCounterAction,
  setCurrentBranchId as setCurrentBranchIdAction,
  signOut as signOutAction,
  type BranchScope,
} from '../redux/sessionSlice'
import type { Bill, Branch, Product, Shop, User, UserRole } from '../types'

export type { BranchScope }
export type NewBillInput = Omit<Bill, 'billNo' | 'status' | 'reprintCount'>

const findBranch = (branches: Branch[], id: string): Branch | undefined => branches.find((branch) => branch.id === id)

export const useStoreScope = () => {
  const dispatch = useDispatch()
  
  // By using individual selectors, Redux can optimize re-renders
  // better than Context could.
  const shop = useSelector((state) => state.data.shop)
  const users = useSelector((state) => state.data.users)
  const products = useSelector((state) => state.data.products)
  const bills = useSelector((state) => state.data.bills)
  const branches = useSelector((state) => state.data.branches)
  const currentUserId = useSelector((state) => state.session.currentUserId)
  const activeCounter = useSelector((state) => state.session.activeCounter)
  const currentBranchId = useSelector((state) => state.session.currentBranchId)

  const currentUser = users.find((user) => user.id === currentUserId && user.active) ?? null
  const role: UserRole = currentUser?.role ?? 'Counter Staff'
  const currentBranch = currentBranchId === 'all' ? undefined : findBranch(branches, currentBranchId)
  const activeBranch = currentBranch ?? branches[0]

  // Every list page shows the counter you're scoped to, so the filter lives here once.
  const scopedBills = currentBranchId === 'all' ? bills : bills.filter((bill) => bill.branchId === currentBranchId)

  const createBill = (input: NewBillInput): Bill => {
    const requiredByCode = new Map<string, number>()
    input.items.forEach((item) => requiredByCode.set(item.product.code, (requiredByCode.get(item.product.code) ?? 0) + item.qty))
    const shortage = [...requiredByCode].find(([code, qty]) => (products.find((product) => product.code === code)?.stock ?? 0) < qty)
    if (shortage) throw new Error(`${shortage[0]} does not have enough stock`)

    const billNo = `${shop.invoicePrefix}${shop.nextInvoiceNumber}`
    const bill: Bill = { ...input, billNo, status: 'Paid', reprintCount: 0 }
    dispatch(billCreated(bill))
    return bill
  }

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
    nextBillNo: `${shop.invoicePrefix}${shop.nextInvoiceNumber}`,
    saveShop: (nextShop: Shop) => dispatch(saveShopAction(nextShop)),
    saveProduct: (product: Product) => dispatch(saveProductAction(product)),
    importProducts: (list: Product[]) => dispatch(importProductsAction(list)),
    saveUser: (user: User) => dispatch(saveUserAction(user)),
    saveBranch: (branch: Branch) => dispatch(saveBranchAction(branch)),
    createBill,
    cancelBill: (billNo: string) => dispatch(cancelBillAction(billNo)),
  }
}
