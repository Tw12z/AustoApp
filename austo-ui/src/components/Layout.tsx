import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, MapPin, ArrowLeftRight,
  Users, Truck, TrendingUp, ShoppingCart, ShoppingBag,
  BarChart3, LogOut, Menu, X, Settings,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

const nav = [
  { to: '/app',             icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/app/products',   icon: Package,         label: 'Ürünler'            },
  { to: '/app/categories', icon: Tag,             label: 'Kategoriler'        },
  { to: '/app/locations',  icon: MapPin,          label: 'Konumlar'           },
  { to: '/app/stock',      icon: ArrowLeftRight,  label: 'Stok'               },
  { to: '/app/customers',  icon: Users,           label: 'Müşteriler'         },
  { to: '/app/suppliers',  icon: Truck,           label: 'Tedarikçiler'       },
  { to: '/app/finance',    icon: TrendingUp,      label: 'Finans'             },
  { to: '/app/sales',      icon: ShoppingCart,    label: 'Satışlar'           },
  { to: '/app/purchases',  icon: ShoppingBag,     label: 'Alışlar'            },
  { to: '/app/reports',    icon: BarChart3,       label: 'Raporlar'           },
]

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const hh = time.getHours().toString().padStart(2, '0')
  const mm = time.getMinutes().toString().padStart(2, '0')
  const ss = time.getSeconds().toString().padStart(2, '0')
  const date = time.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })
  return (
    <div className="flex flex-col items-end">
      <div className="text-sm font-mono font-semibold" style={{ color: '#D4AF37', letterSpacing: '0.08em' }}>
        {hh}<span style={{ opacity: time.getSeconds() % 2 === 0 ? 1 : 0.4 }}>:</span>{mm}<span style={{ opacity: time.getSeconds() % 2 === 0 ? 1 : 0.4 }}>:</span>{ss}
      </div>
      <div className="text-xs" style={{ color: '#444' }}>{date}</div>
    </div>
  )
}

export default function Layout() {
  const { userName, userRole, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <Logo className="h-6 w-auto" style={{ color: '#D4AF37' }} />
          <button className="ml-auto lg:hidden text-gray-500" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
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
          <div className="flex-1" />
          <Clock />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
