import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import { categoriesApi } from './api/client'

// Landing/Login are eager — they're what a fresh, unauthenticated visitor
// hits first, so there's nothing to gain by deferring them. Everything past
// login is lazy: it used to all ship in one ~1.5MB bundle regardless of
// which single page a visitor actually opened.
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Products      = lazy(() => import('./pages/Products'))
const SimpleList    = lazy(() => import('./pages/SimpleList'))
const Locations     = lazy(() => import('./pages/Locations'))
const Customers     = lazy(() => import('./pages/Customers'))
const Suppliers     = lazy(() => import('./pages/Suppliers'))
const Finance       = lazy(() => import('./pages/Finance'))
const Sales         = lazy(() => import('./pages/Sales'))
const Purchases     = lazy(() => import('./pages/Purchases'))
const Stock         = lazy(() => import('./pages/Stock'))
const Reports       = lazy(() => import('./pages/Reports'))
const Settings      = lazy(() => import('./pages/Settings'))
const VerifyEmail   = lazy(() => import('./pages/VerifyEmail'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Dark-on-dark by design — a plain white flash while a chunk downloads would
// be jarring against the rest of the app's near-black surfaces.
function RouteFallback() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      <div className="rounded-full animate-spin" style={{
        width: 32, height: 32,
        border: '2.5px solid rgba(212,175,55,0.15)',
        borderTopColor: '#D4AF37',
      }} />
    </div>
  )
}

function AppRoutes() {
  const { t } = useTranslation()
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products"   element={<Products />} />
          <Route path="categories" element={<SimpleList title={t('categories.title')} api={categoriesApi} entityLabel={t('categories.entityLabel')} />} />
          <Route path="locations"  element={<Locations />} />
          <Route path="stock"      element={<Stock />} />
          <Route path="customers"  element={<Customers />} />
          <Route path="suppliers"  element={<Suppliers />} />
          <Route path="finance"    element={<Finance />} />
          <Route path="sales"      element={<Sales />} />
          <Route path="purchases"  element={<Purchases />} />
          <Route path="reports"    element={<Reports />} />
          <Route path="settings"   element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
