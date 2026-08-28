// Everything that talks to the Laravel backend: the axios client, the bearer token, and one method per endpoint.
import axios from 'axios'
import { store } from '../redux/store'
import { showToast } from '../redux/uiSlice'
import type {
  Bill, BillMutation, BillsPage, BillsQuery, Counter, DailyStatementData, DashboardStats, ImportResult,
  LoginResult, NewBillPayload, PaymentType, Product, SessionData, Shop, User,
} from '../types'

const TOKEN_KEY = 'token'

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)

export const setToken = (token: string | null): void => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? ''

    // Signing out with an already-dead token is fine — nothing to show, nowhere to bounce.
    if (url.includes('/logout')) return Promise.reject(error)

    // A 401 on anything other than the login attempt means our token died — bounce to login.
    if (error.response?.status === 401 && !url.includes('/login')) {
      setToken(null)
      window.location.assign(`${import.meta.env.BASE_URL}login`)
      return Promise.reject(new Error('Your session has ended. Please sign in again.'))
    }

    const message = error.response?.data?.message ?? 'Something went wrong'
    store.dispatch(showToast({ message, severity: 'error' }))
    return Promise.reject(new Error(message))
  },
)

export const api = {
  login: async (email: string, password: string) => (await client.post<LoginResult>('/login', { email, password })).data,
  loadSession: async () => (await client.get<SessionData>('/me')).data,
  logout: async () => { await client.post('/logout') },

  loadDashboard: async (scope: string) => (await client.get<DashboardStats>('/dashboard', { params: { scope } })).data,
  loadDailyStatement: async (date: string, scope: string) =>
    (await client.get<DailyStatementData>('/reports/daily-statement', { params: { date, scope } })).data,

  loadBills: async (query: BillsQuery) => (await client.get<BillsPage>('/bills', { params: query })).data,
  loadBill: async (id: string) => (await client.get<Bill>('/bills/find', { params: { id } })).data,

  loadProducts: async (scope: string) => (await client.get<Product[]>('/products', { params: { scope } })).data,
  loadUsers: async () => (await client.get<User[]>('/users')).data,

  saveShop: async (shop: Shop) => (await client.put<Shop>('/shop', shop)).data,

  saveProduct: async (product: Product, counterId: string) => (await client.post<Product>('/products', { ...product, counterId })).data,
  importProducts: async (products: Product[], counterId: string) => (await client.post<ImportResult>('/products/import', { products, counterId })).data,
  deleteProduct: async (code: string, counterId: string) =>
    (await client.delete<{ code: string }>(`/products/${encodeURIComponent(code)}`, { params: { counterId } })).data.code,

  createBill: async (payload: NewBillPayload) => (await client.post<BillMutation>('/bills', payload)).data,
  updateBill: async (payload: NewBillPayload & { billNo: string }) => (await client.put<BillMutation>('/bills', payload)).data,
  cancelBill: async (billNo: string) => (await client.post<BillMutation>('/bills/cancel', { billNo })).data,
  reprintBill: async (billNo: string) => (await client.post<{ bill: Bill }>('/bills/reprint', { billNo })).data,

  saveCounter: async (payload: { name: string; active: boolean }, id?: string) =>
    id ? (await client.put<Counter>(`/counters/${id}`, payload)).data : (await client.post<Counter>('/counters', payload)).data,

  savePaymentType: async (payload: { name: string; active: boolean }, id?: string) =>
    id ? (await client.put<PaymentType>(`/payment-types/${id}`, payload)).data : (await client.post<PaymentType>('/payment-types', payload)).data,

  saveUser: async (id: string | null, payload: Record<string, unknown>) =>
    id ? (await client.put<User>(`/users/${id}`, payload)).data : (await client.post<User>('/users', payload)).data,

  resetPassword: async (id: string, password: string) => { await client.put(`/users/${id}/password`, { password }) },
}
