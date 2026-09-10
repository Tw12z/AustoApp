import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import {
  LayoutDashboard, Package, ArrowLeftRight, ShoppingCart, ShoppingBag,
  TrendingUp, TrendingDown, BarChart3, Search, Settings, Plus,
  QrCode, CheckCircle2,
} from 'lucide-react'
import LogoMarkless from './LogoMarkless'

/* ── Dashboard mirror ──
   A faithful, large-scale echo of the real in-app product — same section
   order, same labels, same stat-card and card visual language as the real
   pages, rather than a stylized abstraction or a device mockup. The sidebar
   icons are real navigation: clicking one swaps the main content to that
   page's own mirror, the way the real app shell works (sidebar + ticker
   stay put, only the page body changes). It sits inside the hero and is
   tall enough that only its top third clears the first viewport; scrolling
   reveals the rest. Its top edge dissolves into the hero's black via a mask
   instead of a hard screenshot border. Numbers are illustrative demo data
   only, never presented as a real customer's figures. */

const CV = 'Montserrat, sans-serif'
const AUTO_ADVANCE_MS = 5000

function MiniStat({ icon: Icon, iconNode, label, value, sub, color, delay }: {
  icon?: React.ElementType; iconNode?: React.ReactNode; label: string; value: string; sub: string; color: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
      className="relative rounded-xl overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#161616 0%,#0E0E0E 100%)', border: '1px solid rgba(212,175,55,0.1)', padding: '16px 16px 14px' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }} />
      <div className="flex items-center gap-1.5 mb-2" style={{ color: '#888888' }}>
        {iconNode ?? (Icon && <Icon size={12} strokeWidth={2} />)}
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: 21, fontWeight: 800, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{value}</div>
      <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full" style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
        <span style={{ fontSize: 10, fontWeight: 600, color }}>{sub}</span>
      </div>
    </motion.div>
  )
}

function MiniChart() {
  return (
    <svg viewBox="0 0 420 130" width="100%" height="130" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="mirrorChartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,96 C35,90 48,42 78,48 C108,54 118,88 150,78 C182,68 194,22 228,26 C262,30 270,72 304,60 C338,48 348,10 396,14"
        fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: 'easeOut' }} />
      <motion.path
        d="M0,96 C35,90 48,42 78,48 C108,54 118,88 150,78 C182,68 194,22 228,26 C262,30 270,72 304,60 C338,48 348,10 396,14 L396,130 L0,130 Z"
        fill="url(#mirrorChartFill)" stroke="none"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.6 }} />
    </svg>
  )
}

/* Small product glyphs for the Quick Sale list — an actual silhouette per
   item instead of a flat colour swatch, since a bracelet and a gold bar
   read as visibly different products, not just "some gold item #1/#2". */
type ProductGlyphType = 'bracelet' | 'bar' | 'necklace' | 'ring'
function ProductGlyph({ type, color = '#D4AF37' }: { type: ProductGlyphType; color?: string }) {
  return (
    <div className="rounded-md shrink-0 flex items-center justify-center"
      style={{ width: 22, height: 22, background: '#1A1A1A', border: '1px solid rgba(212,175,55,0.25)' }}>
      {type === 'bracelet' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2.6" />
          <circle cx="12" cy="4.3" r="1.3" fill="#F5E070" />
        </svg>
      )}
      {type === 'bar' && (
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path d="M6 17 L8 8 L16 8 L18 17 Z" fill={color} />
          <path d="M6 17 L8 8 L16 8 L18 17 Z" fill="none" stroke="#8A6C14" strokeWidth="0.6" />
          <line x1="8.6" y1="10.5" x2="15.4" y2="10.5" stroke="#8A6C14" strokeWidth="0.6" />
        </svg>
      )}
      {type === 'necklace' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M4 5 C4 13 20 13 20 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="2.3" fill={color} />
        </svg>
      )}
      {type === 'ring' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="14" r="6.5" stroke={color} strokeWidth="2.4" />
          <path d="M9 7.5 L12 3 L15 7.5 Z" fill="#F5E070" />
        </svg>
      )}
    </div>
  )
}

/* ── Page 1: Dashboard ── */
const DEMO_RATES = [
  { code: 'USD', price: '₺34,18', change: '+0.42%', up: true },
  { code: 'EUR', price: '₺37,05', change: '+0.18%', up: true },
  { code: 'GBP', price: '₺43,21', change: '-0.09%', up: false },
]

function DashboardBody() {
  const { t, i18n } = useTranslation()
  const numLocale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'tr-TR'
  const demoProducts: { name: string; price: string; type: 'bracelet' | 'bar' }[] = [
    { name: t('landing.features.demo.productA'), price: '₺9.840', type: 'bracelet' },
    { name: t('landing.hero.demo.productFineBar'), price: '₺28.650', type: 'bar' },
  ]
  return (
    <>
      <div className="flex items-center gap-2 mb-5">
        <span style={{ fontFamily: CV, fontSize: 15, fontWeight: 600, color: '#E5E5E5' }}>{t('landing.hero.demo.dashboardTitle')}</span>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22C55E' }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#22C55E' }} />
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#22C55E' }}>{t('landing.hero.demo.live')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MiniStat icon={ShoppingCart} label={t('landing.hero.demo.todaySales')}     value="₺48.250" sub="+12.4%"    color="#22C55E" delay={0} />
        <MiniStat icon={ShoppingBag}  label={t('landing.hero.demo.todayPurchases')} value="₺16.900" sub={t('landing.hero.demo.purchasesCount', { count: 8 })}  color="#3B82F6" delay={0.06} />
        <MiniStat icon={TrendingUp}   label={t('landing.hero.demo.netProfit')}      value="₺31.350" sub="+68.2%"   color="#22C55E" delay={0.12} />
        <MiniStat iconNode={<LogoMarkless style={{ width: 12, height: 12, color: '#D4AF37' }} />}
          label={t('landing.hero.demo.stockValue')} value="₺2,4M"
          sub={t('landing.hero.demo.stockUnitsCount', { count: (1284).toLocaleString(numLocale) })}
          color="#D4AF37" delay={0.18} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2 rounded-xl" style={{ background: '#0D0D0D', border: '1px solid rgba(212,175,55,0.08)', padding: 16 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}>{t('landing.hero.demo.quickSale')}</span>
          <div className="flex items-center gap-1.5 mt-3 mb-3 rounded-lg" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', padding: '7px 10px' }}>
            <Search size={11} style={{ color: '#888888' }} />
            <span style={{ fontSize: 10, color: '#555555' }}>{t('landing.hero.demo.search')}</span>
          </div>
          <div className="space-y-1.5">
            {demoProducts.map((p, i) => (
              <motion.div key={p.name}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-2 rounded-lg" style={{ background: '#111111', padding: '8px 10px' }}>
                <ProductGlyph type={p.type} />
                <span className="flex-1 truncate" style={{ fontSize: 11, fontWeight: 500, color: '#E5E5E5' }}>{p.name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#FFFFFF' }}>{p.price}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-xl" style={{ background: '#0D0D0D', border: '1px solid rgba(212,175,55,0.08)', padding: 16 }}>
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}>{t('landing.hero.demo.salesTrend')}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#22C55E' }}>+18.4%</span>
          </div>
          <MiniChart />
        </div>
      </div>

      <div className="hidden md:grid grid-cols-3 gap-3 mt-4">
        {DEMO_RATES.map((r, i) => (
          <motion.div key={r.code}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.35 + i * 0.06 }}
            className="rounded-xl" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', padding: '12px 14px' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>{r.code} <span style={{ color: '#333' }}>/</span> <span style={{ color: '#888888' }}>TRY</span></span>
              <span className="flex items-center gap-0.5" style={{ fontSize: 10, fontWeight: 600, color: r.up ? '#22C55E' : '#EF4444' }}>
                {r.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}{r.change}
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>{r.price}</div>
          </motion.div>
        ))}
      </div>
    </>
  )
}

function ProductsBody() {
  const { t } = useTranslation()
  const demoProductsTable: { name: string; purity: string; color: string; stock: string; price: string; type: ProductGlyphType }[] = [
    { name: t('landing.features.demo.productA'),   purity: '22k', color: '#EAC84A', stock: '4.20g', price: '₺9.840',  type: 'bracelet' },
    { name: t('landing.features.demo.productB'),   purity: '14k', color: '#C8A420', stock: '2.85g', price: '₺5.120',  type: 'necklace' },
    { name: t('landing.hero.demo.productFineBar'), purity: '24k', color: '#F5C842', stock: '10.0g', price: '₺28.650', type: 'bar' },
    { name: t('landing.hero.demo.productRing18k'), purity: '18k', color: '#D4AF37', stock: '1.40g', price: '₺3.210',  type: 'ring' },
  ]
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span style={{ fontFamily: CV, fontSize: 15, fontWeight: 600, color: '#E5E5E5' }}>{t('landing.hero.demo.productsTitle')}</span>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'linear-gradient(135deg,#D4AF37,#F5C842)' }}>
          <Plus size={10} style={{ color: '#0A0A0A' }} strokeWidth={3} />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#0A0A0A' }}>{t('landing.hero.demo.new')}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-4 rounded-lg" style={{ background: '#0D0D0D', border: '1px solid #1A1A1A', padding: '8px 12px', maxWidth: 280 }}>
        <Search size={11} style={{ color: '#888888' }} />
        <span style={{ fontSize: 10.5, color: '#555555' }}>{t('landing.hero.demo.search')}</span>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.08)' }}>
        <div className="hidden sm:flex items-center px-4 py-2.5" style={{ background: '#0D0D0D', borderBottom: '1px solid #1A1A1A' }}>
          {[t('landing.hero.demo.colProduct'), t('landing.hero.demo.colPurity'), t('landing.hero.demo.colStock'), t('landing.hero.demo.colPrice')].map((h, i) => (
            <span key={h} style={{ flex: i === 0 ? 2 : 1, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888', textAlign: i === 0 ? 'left' : 'right' }}>{h}</span>
          ))}
        </div>
        {demoProductsTable.map((p, i) => (
          <motion.div key={p.name}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: i * 0.06 }}
            className="flex items-center px-4 py-3"
            style={{ background: i % 2 ? '#0D0D0D' : '#111111', borderBottom: i < demoProductsTable.length - 1 ? '1px solid #1A1A1A' : 'none' }}>
            <div className="flex items-center gap-2.5" style={{ flex: 2 }}>
              <ProductGlyph type={p.type} color={p.color} />
              <span className="truncate" style={{ fontSize: 12, fontWeight: 500, color: '#E5E5E5' }}>{p.name}</span>
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 700, color: p.color, background: `${p.color}18`, border: `1px solid ${p.color}33` }}>{p.purity}</span>
            </div>
            <span style={{ flex: 1, fontSize: 11.5, color: '#888888', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{p.stock}</span>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#FFFFFF', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{p.price}</span>
          </motion.div>
        ))}
      </div>
    </>
  )
}

/* ── Page 3: Stock ── */
function QrGlyph() {
  const cells = [1,1,1,0,1,0,1,1,1, 1,0,1,0,0,0,1,0,1, 1,1,1,0,1,0,1,1,1, 0,0,0,1,1,0,0,0,0, 1,1,0,0,1,1,1,0,1, 0,0,1,0,0,1,0,1,0, 1,1,1,0,1,0,1,1,1, 1,0,1,0,0,0,1,0,1, 1,1,1,0,1,1,0,1,1]
  return (
    <div className="grid shrink-0" style={{ gridTemplateColumns: 'repeat(9, 1fr)', width: 56, height: 56, gap: 2, padding: 6, background: '#fff', borderRadius: 8 }}>
      {cells.map((c, i) => <div key={i} style={{ background: c ? '#0A0A0A' : 'transparent', borderRadius: 0.5 }} />)}
    </div>
  )
}

function StockBody() {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span style={{ fontFamily: CV, fontSize: 15, fontWeight: 600, color: '#E5E5E5' }}>{t('landing.hero.demo.stockTitle')}</span>
        <QrCode size={16} style={{ color: '#D4AF37' }} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl" style={{ background: '#0D0D0D', border: '1px solid rgba(212,175,55,0.08)', padding: '14px 16px' }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}>{t('landing.hero.demo.totalWeight')}</span>
          <div style={{ fontSize: 19, fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>842.6g</div>
        </div>
        <div className="rounded-xl" style={{ background: '#0D0D0D', border: '1px solid rgba(212,175,55,0.08)', padding: '14px 16px' }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}>{t('landing.hero.demo.estValue')}</span>
          <div style={{ fontSize: 19, fontWeight: 800, color: '#D4AF37', marginTop: 4 }}>₺2,4M</div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl mb-4" style={{ background: 'linear-gradient(160deg,#161616 0%,#0E0E0E 100%)', border: '1px solid rgba(212,175,55,0.12)', padding: 14 }}>
        <QrGlyph />
        <div className="min-w-0">
          <div style={{ fontSize: 10, color: '#888888', letterSpacing: '0.04em' }}>AUSTO-00482</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <CheckCircle2 size={13} style={{ color: '#22C55E' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#22C55E' }}>{t('landing.hero.demo.scanned')}</span>
          </div>
          <div style={{ fontSize: 10.5, color: '#E5E5E5', marginTop: 4 }}>{t('landing.hero.demo.transferred')}</div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.08)' }}>
        {[
          { label: t('landing.hero.demo.moveIn'),  loc: t('landing.hero.demo.locShowcase'), delta: '+3' },
          { label: t('landing.hero.demo.moveOut'), loc: t('landing.hero.demo.locSafe'),     delta: '-1' },
          { label: t('landing.hero.demo.moveIn'),  loc: t('landing.hero.demo.locSafe'),     delta: '+5' },
        ].map((m, i, arr) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
            className="flex items-center gap-2.5 px-4 py-2.5"
            style={{ background: i % 2 ? '#0D0D0D' : '#111111', borderBottom: i < arr.length - 1 ? '1px solid #1A1A1A' : 'none' }}>
            <ArrowLeftRight size={12} style={{ color: '#D4AF37' }} />
            <span className="flex-1" style={{ fontSize: 11.5, color: '#E5E5E5' }}>{m.label}</span>
            <span style={{ fontSize: 10.5, color: '#888888' }}>{m.loc}</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: m.delta.startsWith('+') ? '#22C55E' : '#EF4444', width: 28, textAlign: 'right' }}>{m.delta}</span>
          </motion.div>
        ))}
      </div>
    </>
  )
}

const PAGES = [
  { key: 'dashboard', icon: LayoutDashboard, Body: DashboardBody },
  { key: 'products',  icon: Package,         Body: ProductsBody },
  { key: 'stock',     icon: ArrowLeftRight,  Body: StockBody },
] as const

export default function DashboardMirror() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [activePage, setActivePage] = useState(0)
  const [autoAdvance, setAutoAdvance] = useState(true)

  // Subtle 3D tilt: the edge nearer the cursor leans very slightly toward the
  // viewer, like a real panel under a light. No glow — the depth cue is the
  // tilt itself, plus the flat ambient drop shadow. Applied imperatively via
  // a ref (not React state/framer-motion's animate prop) so every mousemove
  // updates the transform directly — no re-render, no animation-controller
  // contention with the dozens of other motion elements inside the panel;
  // the CSS `transition` on the node itself supplies the smoothing.
  const tiltRef = useRef<HTMLDivElement>(null)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    if (tiltRef.current) tiltRef.current.style.transform = `rotateX(${py * -5}deg) rotateY(${px * 5}deg)`
  }
  const handlePointerLeave = () => {
    if (tiltRef.current) tiltRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)'
  }

  // Not gated on inView: this only toggles which page is queued up next, which
  // is inexpensive even off-screen, and avoids depending on IntersectionObserver
  // timing (unreliable right after a fast programmatic scroll) for correctness.
  useEffect(() => {
    if (!autoAdvance) return
    const id = setInterval(() => setActivePage(i => (i + 1) % PAGES.length), AUTO_ADVANCE_MS)
    return () => clearInterval(id)
  }, [autoAdvance])

  // A manual pick means the visitor is browsing on purpose — stop overriding
  // their choice with the auto-advance timer instead of snapping back mid-look.
  const handleSelect = (i: number) => {
    setAutoAdvance(false)
    setActivePage(i)
  }

  const Body = PAGES[activePage].Body

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full mx-auto"
      style={{
        maxWidth: 1180, marginTop: 'clamp(2.5rem, 6vw, 4.5rem)',
        maskImage: 'linear-gradient(to bottom, black 0%, black 87%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 87%, transparent 100%)',
      }}>
      <div style={{ perspective: 1400 }}>
        <div ref={tiltRef}
          onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}
          style={{
            transformStyle: 'preserve-3d', transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            borderRadius: 22, overflow: 'hidden', background: '#0A0A0A',
            border: '1px solid rgba(212,175,55,0.14)',
            boxShadow: '0 50px 100px rgba(0,0,0,0.6)',
          }}>
        <div className="flex" style={{ minHeight: 580 }}>

          {/* Sidebar — real navigation: click a page to preview it here */}
          <div className="hidden sm:flex flex-col items-center gap-2 shrink-0"
            style={{ width: 60, padding: '20px 0', borderRight: '1px solid rgba(212,175,55,0.08)' }}>
            <div className="mb-3 flex items-center justify-center rounded-lg" style={{ width: 26, height: 26, background: 'linear-gradient(135deg,#D4AF37,#B8960C)' }}>
              <LogoMarkless style={{ width: 14, height: 14, color: '#0A0A0A' }} />
            </div>
            {PAGES.map((p, i) => (
              <button key={p.key} type="button" onClick={() => handleSelect(i)}
                aria-label={t(`landing.hero.demo.nav.${p.key}`)} aria-pressed={activePage === i}
                className="flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer"
                style={{
                  width: 34, height: 34, border: 'none',
                  background: activePage === i ? 'rgba(212,175,55,0.1)' : 'transparent',
                  boxShadow: activePage === i ? '0 0 0 1px rgba(212,175,55,0.5), 0 0 14px rgba(212,175,55,0.2)' : 'none',
                }}>
                <p.icon size={15} style={{ color: activePage === i ? '#D4AF37' : '#555555' }} />
              </button>
            ))}
            {/* Decorative — represents more of the app without its own preview */}
            <div className="flex items-center justify-center rounded-lg" style={{ width: 34, height: 34 }}>
              <BarChart3 size={15} style={{ color: '#333333' }} />
            </div>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 34, height: 34 }}>
              <Settings size={15} style={{ color: '#333333' }} />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0" style={{ padding: 'clamp(16px, 2.4vw, 28px)' }}>

            {/* Ticker — constant across pages, like the real app header */}
            <div className="flex items-center gap-4 mb-5 overflow-hidden" style={{ opacity: 0.9 }}>
              {[
                { label: t('layout.ticker.gram').toUpperCase(), price: '₺4.812,50', up: true },
                { label: t('layout.ticker.quarter').toUpperCase(), price: '₺7.855,00', up: true },
                { label: 'USD', price: '₺34,18', up: false },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5 shrink-0">
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: '#D4AF37' }}>{item.label}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 500, color: '#AAAAAA', fontVariantNumeric: 'tabular-nums' }}>{item.price}</span>
                  <span style={{ fontSize: 8, color: item.up ? '#22C55E' : '#EF4444' }}>{item.up ? '▲' : '▼'}</span>
                  <span style={{ color: '#222', fontSize: 8 }}>◆</span>
                </div>
              ))}
            </div>

            {/* No AnimatePresence here: each Body has its own entrance animations
                (initial/animate on every row and card), so a fresh mount on page
                switch already replays them — a wrapper crossfade only adds risk. */}
            <Body />
          </div>
        </div>
        </div>
      </div>

      {/* Page dots — mobile fallback for the hidden sidebar, and a visible cue that this is browsable */}
      <div className="flex sm:hidden items-center justify-center gap-2 mt-4">
        {PAGES.map((p, i) => (
          <button key={p.key} type="button" onClick={() => handleSelect(i)}
            aria-label={t(`landing.hero.demo.nav.${p.key}`)} aria-pressed={activePage === i}
            style={{
              width: activePage === i ? 20 : 6, height: 6, borderRadius: 3, border: 'none', cursor: 'pointer',
              background: activePage === i ? '#D4AF37' : 'rgba(212,175,55,0.25)', transition: 'all 0.25s',
            }} />
        ))}
      </div>
    </motion.div>
  )
}
