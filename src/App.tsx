import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { RouteProgress, PageLoader } from './components/RouteProgress'
import { RequireAuth, RequireSuperAdmin } from './components/RouteGuards'
import { GlobalToast } from './components/GlobalToast'

const Login = lazy(() => import('./pages/Login/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const NewBill = lazy(() => import('./pages/NewBill/NewBill'))
const Bills = lazy(() => import('./pages/Bills/Bills'))
const InvoicePrint = lazy(() => import('./pages/InvoicePrint/InvoicePrint'))
const Reports = lazy(() => import('./pages/Reports/Reports'))
const DailyStatement = lazy(() => import('./pages/Reports/DailyStatement'))
const Products = lazy(() => import('./pages/Products/Products'))
const ProductImport = lazy(() => import('./pages/ProductImport/ProductImport'))
const Users = lazy(() => import('./pages/Users/Users'))
const Counters = lazy(() => import('./pages/Counters/Counters'))
const Settings = lazy(() => import('./pages/Settings/Settings'))
const SystemPage = lazy(() => import('./pages/System/SystemPage'))

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <RouteProgress />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bills/new" element={<NewBill />} />
              <Route path="/bills/:billId/edit" element={<NewBill />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/bills/:billId/print" element={<InvoicePrint />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/daily-statement" element={<DailyStatement />} />
              <Route path="/products" element={<Products />} />
              <Route path="/unauthorized" element={<SystemPage type="403" />} />
              <Route element={<RequireSuperAdmin />}>
                <Route path="/products/import" element={<ProductImport />} />
                <Route path="/users" element={<Users />} />
                <Route path="/counters" element={<Counters />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>
          <Route path="/500" element={<SystemPage type="500" />} />
          <Route path="*" element={<SystemPage type="404" />} />
        </Routes>
      </Suspense>
      <GlobalToast />
    </BrowserRouter>
  )
}

export default App
