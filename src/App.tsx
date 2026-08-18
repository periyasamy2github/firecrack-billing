import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { RouteProgress, PageLoader } from './components/RouteProgress'
import { RequireAuth, RequireSuperAdmin } from './components/RouteGuards'
import { GlobalToast } from './components/GlobalToast'

// Each page loads as its own chunk — the top bar shows while it downloads.
const Login = lazy(() => import('./pages/Login/Login'))
const SelectCounter = lazy(() => import('./pages/SelectCounter/SelectCounter'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const NewBill = lazy(() => import('./pages/NewBill/NewBill'))
const Bills = lazy(() => import('./pages/Bills/Bills'))
const InvoicePrint = lazy(() => import('./pages/InvoicePrint/InvoicePrint'))
const Reports = lazy(() => import('./pages/Reports/Reports'))
const Products = lazy(() => import('./pages/Products/Products'))
const Users = lazy(() => import('./pages/Users/Users'))
const Counters = lazy(() => import('./pages/Counters/Counters'))
const Settings = lazy(() => import('./pages/Settings/Settings'))
const AccessDenied = lazy(async () => ({ default: (await import('./pages/SystemPage')).AccessDenied }))
const NotFound = lazy(async () => ({ default: (await import('./pages/SystemPage')).NotFound }))

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <RouteProgress />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route path="/select-counter" element={<SelectCounter />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bills/new" element={<NewBill />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/bills/:billNo/print" element={<InvoicePrint />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/products" element={<Products />} />
              <Route path="/unauthorized" element={<AccessDenied />} />
              <Route element={<RequireSuperAdmin />}>
                <Route path="/users" element={<Users />} />
                <Route path="/counters" element={<Counters />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <GlobalToast />
    </BrowserRouter>
  )
}

export default App
