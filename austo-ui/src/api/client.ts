import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:5202/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('austo_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('austo_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ────────────────────────────────────────────────
export const authApi = {
  login:          (data: { userNameOrEmail: string; password: string }) => api.post('/auth/login', data),
  register:       (data: object) => api.post('/auth/register', data),
  verifyEmail:    (token: string) => api.post(`/auth/verify-email?token=${token}`),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
}

// ── Products ────────────────────────────────────────────
export const productsApi = {
  getAll:  ()              => api.get('/products'),
  getById: (id: string)    => api.get(`/products/${id}`),
  create:  (data: object)  => api.post('/products', data),
  update:  (id: string, data: object) => api.put(`/products/${id}`, data),
  remove:  (id: string)    => api.delete(`/products/${id}`),
  qr:      (id: string)    => api.get(`/products/${id}/qr`, { responseType: 'blob' }),
}

// ── Categories ──────────────────────────────────────────
export const categoriesApi = {
  getAll:  ()              => api.get('/categories'),
  create:  (data: object)  => api.post('/categories', data),
  update:  (id: string, data: object) => api.put(`/categories/${id}`, data),
  remove:  (id: string)    => api.delete(`/categories/${id}`),
}

// ── Locations ───────────────────────────────────────────
export const locationsApi = {
  getAll:  ()              => api.get('/locations'),
  create:  (data: object)  => api.post('/locations', data),
  update:  (id: string, data: object) => api.put(`/locations/${id}`, data),
  remove:  (id: string)    => api.delete(`/locations/${id}`),
}

// ── Customers ───────────────────────────────────────────
export const customersApi = {
  getAll:  ()              => api.get('/customers'),
  getById: (id: string)    => api.get(`/customers/${id}`),
  create:  (data: object)  => api.post('/customers', data),
  update:  (id: string, data: object) => api.put(`/customers/${id}`, data),
  remove:  (id: string)    => api.delete(`/customers/${id}`),
}

// ── Suppliers ───────────────────────────────────────────
export const suppliersApi = {
  getAll:  ()              => api.get('/suppliers'),
  getById: (id: string)    => api.get(`/suppliers/${id}`),
  create:  (data: object)  => api.post('/suppliers', data),
  update:  (id: string, data: object) => api.put(`/suppliers/${id}`, data),
  remove:  (id: string)    => api.delete(`/suppliers/${id}`),
}

// ── Finance ─────────────────────────────────────────────
export const financeApi = {
  getLiveRates:      ()             => api.get('/finance/live'),
  getLatestGoldPrice: ()            => api.get('/finance/gold-price/latest'),
  getGoldHistory:    (days = 30)    => api.get(`/finance/gold-price/history?days=${days}`),
  logGoldPrice:      (data: object) => api.post('/finance/gold-price', data),
}

// ── Sales ───────────────────────────────────────────────
export const salesApi = {
  getAll:        ()              => api.get('/sales'),
  getById:       (id: string)    => api.get(`/sales/${id}`),
  getByCustomer: (id: string)    => api.get(`/sales/by-customer/${id}`),
  getByDate:     (from: string, to: string) => api.get(`/sales/by-date?from=${from}&to=${to}`),
  create:        (data: object)  => api.post('/sales', data),
  cancel:        (id: string)    => api.post(`/sales/${id}/cancel`),
}

// ── Purchases ───────────────────────────────────────────
export const purchasesApi = {
  getAll:    ()              => api.get('/purchases'),
  getById:   (id: string)    => api.get(`/purchases/${id}`),
  getByDate: (from: string, to: string) => api.get(`/purchases/by-date?from=${from}&to=${to}`),
  create:    (data: object)  => api.post('/purchases', data),
  cancel:    (id: string)    => api.post(`/purchases/${id}/cancel`),
}

// ── Stock ───────────────────────────────────────────────
export const stockApi = {
  getMovements: (productId?: string, locationId?: string) => {
    const params = new URLSearchParams()
    if (productId)  params.append('productId', productId)
    if (locationId) params.append('locationId', locationId)
    return api.get(`/stock/movements?${params}`)
  },
  transfer:     (data: object) => api.post('/stock/transfer', data),
  getValuation: ()             => api.get('/stock/valuation'),
}

// ── Reports ─────────────────────────────────────────────
export const reportsApi = {
  getDaily: (date?: string) => api.get(`/reports/daily${date ? `?date=${date}` : ''}`),
  getStock: ()              => api.get('/reports/stock'),
}
