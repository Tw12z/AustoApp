import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, MapPin, ArrowLeftRight,
  Users, Truck, TrendingUp, ShoppingCart, ShoppingBag,
  BarChart3, LogOut, Menu, X, Settings,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { financeApi } from '../api/client'
import type { FinanceItem } from '../types'
import Logo from './Logo'

const TICKER_CODES  = ['GRAM ALTIN', 'ÇEYREK ALTIN', 'YARIM ALTIN', 'TAM ALTIN', 'USD', 'EUR', 'GBP']
const TICKER_LABELS: Record<string, string> = {
  'GRAM ALTIN': 'Gram', 'ÇEYREK ALTIN': 'Çeyrek', 'YARIM ALTIN': 'Yarım',
  'TAM ALTIN': 'Tam', 'USD': 'USD', 'EUR': 'EUR', 'GBP': 'GBP',
}

function HeaderTicker({ items }: { items: FinanceItem[] }) {
  const filtered = items.filter(i => TICKER_CODES.includes(i.code))
  if (!filtered.length) return null
  const repeated = [...filtered, ...filtered, ...filtered, ...filtered]
  return (
    <div className="flex-1 overflow-hidden min-w-0"
      style={{
        WebkitMaskImage: 'linear-gradient(to right,transparent 0%,black 5%,black 95%,transparent 100%)',
        maskImage:        'linear-gradient(to right,transparent 0%,black 5%,black 95%,transparent 100%)',
      }}>
      <div className="flex items-center"
        style={{ width: 'max-content', animation: 'ticker-scroll 55s linear infinite' }}
        onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}>
        {repeated.map((item, i) => {
          const isUp  = !item.changeRate.includes('-')
          const isGold = !['USD', 'EUR', 'GBP'].includes(item.code)
          return (
            <div key={i} className="flex items-center shrink-0">
              <div className="flex items-center gap-1.5 px-4 cursor-default">
                <span className="text-[9px] font-semibold tracking-widest uppercase"
                  style={{ color: isGold ? '#D4AF37' : '#666' }}>
                  {TICKER_LABELS[item.code]}
                </span>
                <span className="text-[11px] font-medium tabular-nums" style={{ color: '#AAA' }}>
                  ₺{item.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] font-semibold tabular-nums"
                  style={{ color: isUp ? '#22C55E' : '#EF4444' }}>
                  {isUp ? '▲' : '▼'}{item.changeRate.replace('-', '')}
                </span>
              </div>
              <span className="text-[8px]" style={{ color: '#222' }}>◆</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const nav = [
  { to: '/app',             icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/app/products',   icon: Package,         label: 'Ürünler'            },
  { to: '/app/categories', icon: Tag,             label: 'Kategoriler'        },
  { to: '/app/locations',  icon: MapPin,          label: 'Konumlar'           },
  { to: '/app/stock',      icon: ArrowLeftRight,  label: 'Stok'               },
  { to: '/app/customers',  icon: Users,           label: 'Müşteriler'         },
  { to: '/app/suppliers',  icon: Truck,           label: 'Tedarikçiler'       },
  { to: '/app/finance',    icon: TrendingUp,      label: 'Finans'             },
  { to: '/app/sales',      icon: ShoppingCart,    label: 'Satış'              },
  { to: '/app/purchases',  icon: ShoppingBag,     label: 'Alışlar'            },
  { to: '/app/reports',    icon: BarChart3,       label: 'Raporlar'           },
]

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const hh   = time.getHours().toString().padStart(2, '0')
  const mm   = time.getMinutes().toString().padStart(2, '0')
  const ss   = time.getSeconds().toString().padStart(2, '0')
  const weekday = time.toLocaleDateString('tr-TR', { weekday: 'long' })
  const dayMonth = time.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="tabular-nums font-light tracking-[0.1em] leading-none"
        style={{ color: '#D4AF37', fontSize: 15, fontFamily: "'Montserrat', sans-serif" }}>
        {hh}<span style={{ color: 'rgba(212,175,55,0.4)' }}>:</span>{mm}
        <span style={{ color: '#6A6A6A', fontSize: 11, marginLeft: 4 }}>{ss}</span>
      </div>
      <div className="text-[10px] tracking-[0.08em] uppercase" style={{ color: '#6A6A6A' }}>
        {weekday} · {dayMonth}
      </div>
    </div>
  )
}

export default function Layout() {
  const { userName, userRole, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rates, setRates] = useState<FinanceItem[]>([])

  useEffect(() => {
    financeApi.getLiveRates().then(r => setRates(r.data)).catch(() => {})
    const interval = setInterval(() => {
      financeApi.getLiveRates().then(r => setRates(r.data)).catch(() => {})
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0A0A' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#0D0D0D', borderRight: '1px solid rgba(212,175,55,0.12)' }}
      >
        {/* Logo */}
        <div className="flex items-center pr-3 py-3 shrink-0"
          style={{ paddingLeft: 26, borderBottom: '1px solid rgba(212,175,55,0.1)', background: '#0D0D0D' }}>
          <Logo className="h-8 w-auto" style={{ color: '#D4AF37' }} />
          <button className="ml-auto lg:hidden text-gray-500 hover:text-gray-300 transition-colors" onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings + User */}
        <div className="px-3 pb-3" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
          <NavLink to="/app/settings" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''} mt-1`} onClick={() => setSidebarOpen(false)}>
            <Settings size={16} />
            <span>Ayarlar</span>
          </NavLink>
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg mt-1" style={{ background: '#111' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg,#D4AF37,#B8960C)', color: '#0A0A0A' }}>
              {userName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{userName}</div>
              <div className="text-xs" style={{ color: '#D4AF37' }}>{userRole}</div>
            </div>
            <button onClick={handleLogout} className="text-gray-600 hover:text-red-400 transition-colors" title="Çıkış">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-4 px-6 py-3.5 shrink-0" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)', background: '#0A0A0A' }}>
          <button className="lg:hidden text-gray-400 hover:text-gold-400" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <HeaderTicker items={rates} />
          <Clock />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
