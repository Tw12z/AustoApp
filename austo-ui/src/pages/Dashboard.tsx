import { useEffect, useRef, useState } from 'react'
import {
  TrendingUp, TrendingDown, ShoppingCart, ShoppingBag,
  Gem, Search, Plus, Minus, X, CheckCircle, Zap, User,
} from 'lucide-react'
import {
  reportsApi, financeApi, stockApi,
  productsApi, customersApi, salesApi,
} from '../api/client'
import type { DailySummary, FinanceItem, StockValuation, Product, Customer, Sale } from '../types'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import BorderGlow from '../components/BorderGlow'

// ── Formatters ────────────────────────────────────────────
function fmt(n: number) {
  return '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtShort(n: number) {
  if (n >= 1_000_000) return '₺' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000)     return '₺' + (n / 1_000).toFixed(1)     + 'K'
  return fmt(n)
}

// ── StatCard ──────────────────────────────────────────────
interface StatCardProps {
  label: string; value: string; sub?: string
  icon: React.ElementType; color?: string; loading?: boolean
  iconRight?: number; iconBottom?: number; iconSize?: number
}
function StatCard({ label, value, sub, icon: Icon, color = '#D4AF37', loading, iconRight = -20, iconBottom = -20, iconSize = 140 }: StatCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl transition-all duration-300 overflow-hidden"
      style={{
        background: 'linear-gradient(160deg,#161616 0%,#0E0E0E 100%)',
        border: '1px solid rgba(212,175,55,0.08)',
        padding: '20px 20px 16px',
        minHeight: 130,
      }}>
      {/* Glow accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }} />

      {/* Large watermark icon */}
      <div className="absolute" style={{ right: iconRight, bottom: iconBottom, opacity: 0.25 }}>
        <Icon size={iconSize} strokeWidth={0.6} style={{
          color: color,
          filter: `
            drop-shadow(0 0 8px ${color}20)
            drop-shadow(2px 0 0 ${color}) drop-shadow(-2px 0 0 ${color})
            drop-shadow(0 2px 0 ${color}) drop-shadow(0 -2px 0 ${color})
          `,
        }} />
      </div>

      {/* Label */}
      <div className="relative">
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#555' }}>
          {label}
        </span>
      </div>

      {/* Value */}
      {loading ? (
        <div className="relative space-y-2 mt-1">
          <div className="shimmer h-8 w-3/4 rounded-lg" />
          <div className="shimmer h-4 w-1/2 rounded" />
        </div>
      ) : (
        <div className="relative">
          <div className="text-[1.65rem] font-extrabold tracking-tight leading-none mt-2"
            style={{ color: '#F5F5F5', fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </div>
          {sub && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: `${color}10`, border: `1px solid ${color}22` }}>
              <span className="text-[11px] font-medium" style={{ color: `${color}CC` }}>{sub}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── LiveDot ───────────────────────────────────────────────
function LiveDot() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ background: '#22C55E' }} />
      <span className="relative inline-flex rounded-full h-2 w-2"
        style={{ background: '#22C55E' }} />
    </span>
  )
}

// ── Quick Sale ────────────────────────────────────────────
interface CartItem { product: Product; quantity: number }

function QuickSale({ onSaleCompleted }: { onSaleCompleted: () => void }) {
  const [products, setProducts]     = useState<Product[]>([])
  const [customers, setCustomers]   = useState<Customer[]>([])
  const [search, setSearch]         = useState('')
  const [cart, setCart]             = useState<CartItem[]>([])
  const [customerId, setCustomerId] = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [confirming,  setConfirming]  = useState(false)
  const [success,     setSuccess]     = useState(false)
  const [error,       setError]       = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    productsApi.getAll().then(r => setProducts(r.data.filter((p: Product) => p.isActive)))
    customersApi.getAll().then(r => setCustomers(r.data.filter((c: Customer) => c.isActive)))
  }, [])

  const filtered = search.trim().length > 0
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase())
      )
    : products.slice(0, 6)

  function addToCart(product: Product) {
    if (product.stockQuantity <= 0) return
    setCart(prev => {
      const exists = prev.find(c => c.product.id === product.id)
      if (exists) {
        if (exists.quantity >= product.stockQuantity) return prev
        return prev.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { product, quantity: 1 }]
    })
    setSearch('')
    if (searchOpen) searchRef.current?.focus()
  }

  function changeQty(id: string, delta: number) {
    setCart(prev => prev
      .map(c => c.product.id === id ? { ...c, quantity: c.quantity + delta } : c)
      .filter(c => c.quantity > 0)
    )
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(c => c.product.id !== id))
  }

  const total = cart.reduce((s, c) => s + c.product.salePrice * c.quantity, 0)

  async function handleSubmit() {
    if (!cart.length) return
    setSubmitting(true)
    setError('')
    try {
      await salesApi.create({
        customerId: customerId || null,
        saleDate: new Date().toISOString(),
        items: cart.map(c => ({ productId: c.product.id, quantity: c.quantity, unitPriceTRY: 0 })),
        notes: '',
      })
      setSuccess(true)
      setConfirming(false)
      setCart([])
      setCustomerId('')
      onSaleCompleted()
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Satış oluşturulamadı. Stok kontrolü yapın.')
    } finally {
      setSubmitting(false)
    }
  }

  const PURITY_COLOR: Record<number, string> = {
    8: '#888', 14: '#C8A420', 18: '#D4AF37', 21: '#DDB940', 22: '#EAC84A', 24: '#F5C842', 0: '#555'
  }

  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="card flex flex-col" style={{ height: 460 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <Zap size={14} style={{ color: '#D4AF37' }} />
          </div>
          <span className="text-sm font-semibold text-white">Hızlı Satış</span>
        </div>
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <span className="badge-gold">{cart.length} ürün</span>
          )}
          {/* Search toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSearchOpen(o => !o); setTimeout(() => searchRef.current?.focus(), 50) }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: searchOpen ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${searchOpen ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <Search size={13} style={{ color: searchOpen ? '#D4AF37' : '#555' }} />
            </button>
            <div className="overflow-hidden transition-all duration-300"
              style={{ width: searchOpen ? 180 : 0, opacity: searchOpen ? 1 : 0 }}>
              <div className="relative">
                <input
                  ref={searchRef}
                  className="input pl-3 text-sm"
                  placeholder="Ürün adı veya barkod..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onBlur={() => { if (!search) setSearchOpen(false) }}
                  style={{ width: 180 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product list */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5" style={{ minHeight: 0 }}>
        {cart.length === 0 || search ? (
          filtered.length > 0 ? filtered.map(p => {
            const inCart = cart.find(c => c.product.id === p.id)
            const outOfStock = p.stockQuantity <= 0
            const pColor = PURITY_COLOR[p.purity] ?? '#888'
            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={outOfStock}
                className="w-full text-left"
                style={{ opacity: outOfStock ? 0.4 : 1, cursor: outOfStock ? 'not-allowed' : 'pointer' }}
              >
                <BorderGlow
                  backgroundColor={inCart ? '#111' : '#0A0A0A'}
                  borderRadius={12}
                  glowRadius={28}
                  glowIntensity={inCart ? 1.2 : 0.7}
                  colors={inCart ? ['#D4AF37', '#F5C842', '#AA8500'] : ['#2a2a2a', '#333', '#222']}
                  style={{ padding: '10px 14px' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          background: `${pColor}12`,
                          border: `1px solid ${pColor}30`,
                          boxShadow: `0 0 6px ${pColor}20`,
                        }}>
                        <span className="text-[10px] font-bold" style={{ color: pColor }}>{p.purity}k</span>
                      </div>
                      <span className="text-sm text-white truncate font-medium">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs" style={{ color: p.stockQuantity <= 2 ? '#EF4444' : '#444' }}>
                        {p.stockQuantity} adet
                      </span>
                      <span className="text-sm font-bold" style={{
                        color: '#D4AF37',
                        filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.4))',
                      }}>
                        {fmtShort(p.salePrice)}
                      </span>
                      <Plus size={13} style={{ color: outOfStock ? '#333' : '#D4AF37' }} />
                    </div>
                  </div>
                </BorderGlow>
              </button>
            )
          }) : (
            <div className="flex items-center justify-center h-16 text-sm" style={{ color: '#444' }}>
              Ürün bulunamadı
            </div>
          )
        ) : (
          /* Cart items */
          <div className="space-y-1.5">
            {cart.map(c => (
              <div key={c.product.id} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
                style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{c.product.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#555' }}>
                    {fmtShort(c.product.salePrice)} / adet
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => changeQty(c.product.id, -1)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                    <Minus size={10} style={{ color: '#888' }} />
                  </button>
                  <span className="text-sm font-bold text-white w-5 text-center tabular-nums">
                    {c.quantity}
                  </span>
                  <button
                    onClick={() => changeQty(c.product.id, 1)}
                    disabled={c.quantity >= c.product.stockQuantity}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                    <Plus size={10} style={{ color: c.quantity >= c.product.stockQuantity ? '#333' : '#888' }} />
                  </button>
                  <button onClick={() => removeFromCart(c.product.id)} className="ml-1">
                    <X size={13} style={{ color: '#444' }} />
                  </button>
                </div>
                <div className="text-sm font-bold shrink-0 tabular-nums" style={{ color: '#D4AF37' }}>
                  {fmtShort(c.product.salePrice * c.quantity)}
                </div>
              </div>
            ))}
            {/* Add more button */}
            <button onClick={() => { setSearch(' '); searchRef.current?.focus() }}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs transition-all"
              style={{ border: '1px dashed #2A2A2A', color: '#555' }}
              onFocus={() => setSearch('')}>
              <Plus size={11} /> Ürün ekle
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3 shrink-0 space-y-3"
        style={{ borderTop: '1px solid #1A1A1A' }}>

        {/* Customer selector */}
        <div className="flex items-center gap-2">
          <User size={13} style={{ color: '#555' }} />
          <select
            className="select text-sm flex-1"
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
          >
            <option value="">Müşteri seç (opsiyonel)</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Total + Submit */}
        {success ? (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' }}>
            <CheckCircle size={16} /> Satış tamamlandı!
          </div>
        ) : confirming ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 text-sm font-semibold text-white tabular-nums px-3 py-2.5 rounded-xl"
              style={{ background: '#0A0A0A', border: '1px solid #2A2A2A' }}>
              {fmt(total)} onaylansın mı?
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center w-11 h-10 rounded-xl shrink-0 transition-all"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}
              title="Onayla"
            >
              {submitting
                ? <span className="animate-spin w-4 h-4 border-2 border-green-800/30 border-t-green-400 rounded-full" />
                : <CheckCircle size={16} />}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={submitting}
              className="flex items-center justify-center w-11 h-10 rounded-xl shrink-0 transition-all"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}
              title="Vazgeç"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setError(''); setConfirming(true) }}
            disabled={!cart.length}
            className="btn-gold w-full flex items-center justify-center gap-2"
          >
            <ShoppingCart size={15} />
            {cart.length > 0 ? `Sat — ${fmt(total)}` : 'Sepet boş'}
          </button>
        )}
      </div>
    </div>
  )
}


// ── Sales Chart ───────────────────────────────────────────
type SalesRange = '7d' | '30d' | '3m'
interface SalesPoint { date: string; revenue: number; count: number }

interface SalesTooltipProps { active?: boolean; payload?: Array<{ value: number; payload: SalesPoint }> }
function SalesTooltip({ active, payload }: SalesTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  const label = new Date(d.payload.date + 'T00:00:00').toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  return (
    <div className="rounded-xl px-4 py-3 text-sm"
      style={{ background: '#1A1A1A', border: '1px solid rgba(212,175,55,0.3)' }}>
      <div className="mb-1.5" style={{ color: '#555', fontSize: 11 }}>{label}</div>
      <div className="font-bold" style={{ color: '#D4AF37' }}>{fmt(d.value)}</div>
      <div className="mt-0.5" style={{ color: '#888', fontSize: 11 }}>{d.payload.count} satış</div>
    </div>
  )
}

function buildSalesChartData(sales: Sale[], from: Date, to: Date): SalesPoint[] {
  const map = new Map<string, SalesPoint>()
  const cur = new Date(from)
  while (cur <= to) {
    const key = cur.toISOString().slice(0, 10)
    map.set(key, { date: key, revenue: 0, count: 0 })
    cur.setDate(cur.getDate() + 1)
  }
  for (const s of sales) {
    if (s.status === 2) continue
    const key = s.saleDate.slice(0, 10)
    const pt = map.get(key)
    if (pt) { pt.revenue += s.totalAmountTRY; pt.count += 1 }
  }
  return Array.from(map.values())
}

// ── Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const [summary,   setSummary]   = useState<DailySummary | null>(null)
  const [rates,     setRates]     = useState<FinanceItem[]>([])
  const [valuation, setValuation] = useState<StockValuation | null>(null)
  const [loading,   setLoading]   = useState(true)

  const [salesRange,        setSalesRange]        = useState<SalesRange>('7d')
  const [salesChartData,    setSalesChartData]    = useState<SalesPoint[]>([])
  const [salesChartLoading, setSalesChartLoading] = useState(true)

  function loadSalesChart(range: SalesRange) {
    setSalesChartLoading(true)
    const to   = new Date()
    const from = new Date()
    if (range === '7d')  from.setDate(from.getDate() - 6)
    else if (range === '30d') from.setDate(from.getDate() - 29)
    else from.setMonth(from.getMonth() - 3)
    const fromStr = from.toISOString().slice(0, 10)
    const toStr   = to.toISOString().slice(0, 10)
    salesApi.getByDate(fromStr, toStr)
      .then(r => setSalesChartData(buildSalesChartData(r.data as Sale[], from, to)))
      .finally(() => setSalesChartLoading(false))
  }

  function loadData() {
    loadSalesChart(salesRange)
    return Promise.all([
      reportsApi.getDaily().then(r => setSummary(r.data)),
      financeApi.getLiveRates().then(r => setRates(r.data)),
      stockApi.getValuation().then(r => setValuation(r.data)),
    ]).finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])
  useEffect(() => { loadSalesChart(salesRange) }, [salesRange])

  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const currencies = rates.filter(r => ['USD', 'EUR', 'GBP'].includes(r.code))

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl"
        style={{ background: 'linear-gradient(135deg,#151515 0%,#111 60%,#0D0D0D 100%)', border: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,#D4AF37 0%,transparent 70%)' }} />

        <div className="relative flex items-center justify-between px-6 pt-3.5 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-base font-semibold tracking-wide gold-text">Dashboard</h1>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}>
                <LiveDot />Canlı
              </div>
            </div>
            <p className="text-xs capitalize" style={{ color: '#444' }}>{today}</p>
          </div>
        </div>

        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.15),transparent)' }} />
      </div>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Bugünkü Satış"
          value={loading ? '—' : fmtShort(summary?.salesRevenueTRY ?? 0)}
          sub={`${summary?.salesCount ?? 0} işlem · ${(summary?.salesWeightGram ?? 0).toFixed(2)}gr`}
          icon={ShoppingCart} color="#22C55E" loading={loading} iconRight={5} />
        <StatCard label="Bugünkü Alış"
          value={loading ? '—' : fmtShort(summary?.purchasesCostTRY ?? 0)}
          sub={`${summary?.purchasesCount ?? 0} işlem · ${(summary?.purchasesWeightGram ?? 0).toFixed(2)}gr`}
          icon={ShoppingBag} color="#3B82F6" loading={loading} />
        <StatCard label="Tahmini Net Kar"
          value={loading ? '—' : fmtShort(summary?.netRevenueTRY ?? 0)}
          sub="Bugünkü net" icon={TrendingUp}
          color={!summary || summary.netRevenueTRY >= 0 ? '#22C55E' : '#EF4444'}
          loading={loading} iconRight={5} iconBottom={-58} iconSize={190} />
        <StatCard label="Stok Değeri"
          value={loading ? '—' : fmtShort(valuation?.totalEstimatedValueTRY ?? 0)}
          sub={`${(valuation?.totalWeightGram ?? 0).toFixed(2)}gr toplam`}
          icon={Gem} color="#D4AF37" loading={loading} />
      </div>

      {/* ── Main Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Quick Sale */}
        <div className="lg:col-span-2">
          <QuickSale onSaleCompleted={loadData} />
        </div>

        {/* Sales Trend */}
        <div className="lg:col-span-3 card p-5 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <span className="label">Satış Trendi</span>
              {!salesChartLoading && salesChartData.length > 0 && (
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-lg font-bold text-white tabular-nums">
                    {fmtShort(salesChartData.reduce((s, d) => s + d.revenue, 0))}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(212,175,55,0.08)', color: '#888', border: '1px solid rgba(212,175,55,0.15)' }}>
                    {salesChartData.reduce((s, d) => s + d.count, 0)} satış
                  </span>
                </div>
              )}
            </div>
            {/* Period selector */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
              {(['7d', '30d', '3m'] as const).map(r => (
                <button key={r} onClick={() => setSalesRange(r)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{
                    background:  salesRange === r ? 'rgba(212,175,55,0.15)' : 'transparent',
                    color:       salesRange === r ? '#D4AF37' : '#444',
                    border:      `1px solid ${salesRange === r ? 'rgba(212,175,55,0.3)' : 'transparent'}`,
                  }}>
                  {r === '7d' ? '7G' : r === '30d' ? '30G' : '3A'}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          {salesChartLoading ? (
            <div className="shimmer rounded-xl flex-1" style={{ minHeight: 300 }} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesChartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#D4AF37" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#444', fontSize: 11 }}
                  interval={Math.max(0, Math.floor(salesChartData.length / 6) - 1)}
                  tickFormatter={v =>
                    new Date(v + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                  }
                />
                <YAxis hide />
                <Tooltip
                  content={<SalesTooltip />}
                  cursor={{ stroke: 'rgba(212,175,55,0.15)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#D4AF37', stroke: '#111', strokeWidth: 2 }}
                  isAnimationActive
                  animationDuration={700}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Currency Rates ──────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <span className="label">Döviz Kurları</span>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#22C55E' }}>
            <LiveDot />Canlı
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading
            ? [1, 2, 3].map(i => <div key={i} className="shimmer h-28 rounded-xl" />)
            : currencies.map(r => {
              const isUp = !r.changeRate.includes('-')
              return (
                <div key={r.code} className="rounded-xl p-5 flex flex-col gap-3"
                  style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white">
                      {r.code} <span style={{ color: '#333' }}>/</span>{' '}
                      <span style={{ color: '#555' }}>TRY</span>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold ${isUp ? 'badge-green' : 'badge-red'}`}>
                      {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                      {r.changeRate}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">
                    ₺{r.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="h-1 rounded-full" style={{ background: '#1A1A1A' }}>
                    <div className="h-1 rounded-full"
                      style={{ width: '70%', background: isUp ? '#22C55E55' : '#EF444455' }} />
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>

    </div>
  )
}
