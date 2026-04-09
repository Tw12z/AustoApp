import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import SimpleList from './pages/SimpleList'
import Customers from './pages/Customers'
import Suppliers from './pages/Suppliers'
import Finance from './pages/Finance'
import Sales from './pages/Sales'
import Purchases from './pages/Purchases'
import Stock from './pages/Stock'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import VerifyEmail from './pages/VerifyEmail'
import ResetPassword from './pages/ResetPassword'
import { categoriesApi, locationsApi } from './api/client'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products"   element={<Products />} />
        <Route path="categories" element={<SimpleList title="Kategoriler" api={categoriesApi} entityLabel="Kategori" />} />
        <Route path="locations"  element={<SimpleList title="Konumlar" api={locationsApi} entityLabel="Konum" />} />
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
