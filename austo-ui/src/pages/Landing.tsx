import React, { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import {
  TrendingUp, Package, ShoppingCart, BarChart3,
  QrCode, MapPin, Shield, Zap, ChevronLeft, ChevronRight, ArrowRight,
  ArrowLeftRight, Users, Truck, Wallet,
} from 'lucide-react'
import Logo from '../components/Logo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import LineWaves from '../components/LineWaves'
import DashboardMirror from '../components/DashboardMirror'
import { financeApi } from '../api/client'
import type { FinanceItem } from '../types'

const GOLD      = '#D4AF37'
const GOLD_GRAD = 'linear-gradient(135deg, #bf953f, #fcf6ba 20%, #b38728 40%, #fbf5b7 60%, #aa771c 80%, #bf953f 100%)'
const CV        = 'Montserrat, sans-serif'
const PF        = '"Playfair Display", serif'

/* ── Brand logos ── */
const BRANDS = [
  { name: 'VALCAMBI',                  serif: false, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polygon points="12,2 22,20 2,20" stroke="currentColor" strokeWidth="1.6"/></svg> },
  { name: 'Argor-Heraeus',             serif: true,  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/><rect x="7" y="7" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.1"/></svg> },
  { name: 'METALOR',                   serif: false, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.1"/></svg> },
  { name: 'Perth Mint',                serif: true,  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { name: 'PAMP SUISSE',               serif: false, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 8v8l8 5 8-5V8z" stroke="currentColor" strokeWidth="1.6"/></svg> },
  { name: 'İstanbul Altın Rafinerisi', serif: true,  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M12 3v18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" stroke="currentColor" strokeWidth="1.3"/></svg> },
  { name: 'LBMA',                      serif: false, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L22 7v10L12 22 2 17V7z" stroke="currentColor" strokeWidth="1.6"/></svg> },
  { name: 'Royal Canadian Mint',       serif: true,  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.3"/></svg> },
  { name: 'UMICORE',                   serif: false, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="8" stroke="currentColor" strokeWidth="1.6"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { name: 'Heraeus',                   serif: true,  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
]

/* ── Features ── */
const features = [
  { icon: TrendingUp,      key: 'finance' },
  { icon: Package,         key: 'products' },
  { icon: ShoppingCart,    key: 'sales' },
  { icon: ArrowLeftRight,  key: 'stock' },
  { icon: MapPin,          key: 'locations' },
  { icon: Users,           key: 'customers' },
  { icon: Truck,           key: 'purchases' },
  { icon: BarChart3,       key: 'reports' },
  { icon: Wallet,          key: 'financeModule' },
  { icon: QrCode,          key: 'qr' },
  { icon: Shield,          key: 'secure' },
  { icon: Zap,             key: 'dashboard' },
]

const stats = [
  { value: '12+',  key: 'coreModules'     },
  { value: '24/7', key: 'livePrice'       },
  { value: 'QR',   key: 'barcodeSupport'  },
  { value: '∞',    key: 'productCapacity' },
]

/* ── Live gold/currency ticker items ── */
const TICKER_ITEMS = [
  { code: 'GRAM ALTIN', labelKey: 'layout.ticker.gram' },
  { code: 'ÇEYREK ALTIN', labelKey: 'layout.ticker.quarter' },
  { code: 'YARIM ALTIN', labelKey: 'layout.ticker.half' },
  { code: 'TAM ALTIN', labelKey: 'layout.ticker.full' },
  { code: 'USD', labelKey: null },
  { code: 'EUR', labelKey: null },
]

/* ── How-it-works: asymmetric 3-step path ── */
const HOW_STEPS = [
  { key: 'account',  num: '1' },
  { key: 'products', num: '2' },
  { key: 'manage',   num: '3' },
]
const HOW_OFFSETS = ['md:mt-0', 'md:mt-20', 'md:mt-8']


/* ── Floating gold bars ──
   The source composite (public/backgroundforherosec.png) is one flat image
   holding 6 gold bars scattered on a pure-black field. Each bar gets its own
   small, independently-sized container anchored near its own corner of the
   hero, showing just its slice of the shared image via background-size /
   background-position percentages computed from that slice's own pixel box
   — not clip-path over an object-cover copy of the whole image. That's the
   part that matters for responsiveness: object-cover crops the source image
   differently depending on the HERO's aspect ratio, so on a narrow/tall
   mobile viewport most bars were cropped away entirely. Percentage
   background-size/position is relative to each bar's own tiny box only, so
   the crop is correct at any container size — desktop, tablet, or phone —
   with no dependency on the hero's shape. Each container's aspect-ratio is
   pinned to its own crop box so the photo never distorts, and its width is
   a clamp() so it scales fluidly between a sane min and max. */
interface BarSpec {
  aspect: string
  bgSize: string
  bgPos: string
  anchor: React.CSSProperties
  widthClamp: string
  duration: number; delay: number; distance: number; rotate: number
}
const GOLD_BARS: BarSpec[] = [
  { aspect: '745/550', bgSize: '417% 250%',   bgPos: '0% 0%',       anchor: { top: '2%', left: '-2%' },    widthClamp: 'clamp(150px, 21vw, 340px)', duration: 17, delay: 0,   distance: 14, rotate: 2.2  },
  { aspect: '341/179', bgSize: '909% 769%',   bgPos: '25.8% 0%',    anchor: { top: '0%', left: '19%' },    widthClamp: 'clamp(64px, 8.5vw, 140px)', duration: 12, delay: 1.4, distance: 9,  rotate: -4   },
  { aspect: '435/261', bgSize: '714% 526%',   bgPos: '79.1% 0%',    anchor: { top: '2%', right: '20%' },   widthClamp: 'clamp(72px, 9.5vw, 160px)', duration: 14, delay: 0.6, distance: 10, rotate: 3.5  },
  { aspect: '497/413', bgSize: '625% 333%',   bgPos: '100% 0%',     anchor: { top: '-1%', right: '-3%' },  widthClamp: 'clamp(150px, 20vw, 320px)', duration: 20, delay: 2.1, distance: 16, rotate: -2.6 },
  { aspect: '528/275', bgSize: '588% 500%',   bgPos: '9.6% 95%',    anchor: { bottom: '6%', left: '-1%' }, widthClamp: 'clamp(115px, 16vw, 250px)', duration: 15, delay: 0.9, distance: 12, rotate: 3    },
  { aspect: '745/454', bgSize: '417% 303%',   bgPos: '100% 97%',    anchor: { bottom: '4%', right: '-2%' },widthClamp: 'clamp(155px, 21vw, 330px)', duration: 19, delay: 1.7, distance: 13, rotate: -2.2 },
]

function FloatingGoldBars() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
      {GOLD_BARS.map((bar, i) => (
        <div key={i}
          style={{
            position: 'absolute', ...bar.anchor,
            width: bar.widthClamp, aspectRatio: bar.aspect,
            backgroundImage: 'url(/backgroundforherosec.png)',
            backgroundSize: bar.bgSize, backgroundPosition: bar.bgPos, backgroundRepeat: 'no-repeat',
            opacity: 0.4, filter: 'brightness(0.72) saturate(1.25)',
            animation: `bar-float-${i % 3} ${bar.duration}s ease-in-out ${bar.delay}s infinite`,
            '--bar-distance': `${bar.distance}px`,
            '--bar-rotate': `${bar.rotate}deg`,
          } as React.CSSProperties} />
      ))}
    </div>
  )
}

/* ── Vault-door headline reveal ──
   A line of the hero headline sits behind a hard-edged mask; a bright gold
   beam sweeps left-to-right and the text is only ever visible just behind
   it, as if a bar of light is cutting the line out of the dark — the same
   language as the system's scan-border effect, applied once, with intent,
   to the one line the visitor should remember. Not a generic fade-up. */
function VaultReveal({ children, delay = 0, center = false }: { children: React.ReactNode; delay?: number; center?: boolean }) {
  return (
    <span className="relative block overflow-hidden" style={{ width: 'fit-content', margin: center ? '0 auto' : undefined }}>
      <motion.span className="block"
        initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }}
        transition={{ duration: 0.85, delay, ease: [0.65, 0, 0.15, 1] }}>
        {children}
      </motion.span>
      <motion.span aria-hidden className="absolute top-0 bottom-0 pointer-events-none"
        style={{ width: 5, background: '#fffde0', filter: 'drop-shadow(0 0 6px rgba(255,240,180,1)) drop-shadow(0 0 22px rgba(212,175,55,0.9))' }}
        initial={{ left: '-2%', opacity: 1 }}
        animate={{ left: '102%', opacity: [1, 1, 0] }}
        transition={{ duration: 0.85, delay, ease: [0.65, 0, 0.15, 1], opacity: { duration: 0.85, delay, times: [0, 0.82, 1] } }} />
    </span>
  )
}

/* ── Helpers ── */
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

/* ── How-it-works connecting path (desktop only, draws on scroll-into-view) ── */
function HowPath() {
  const ref = useRef<SVGPathElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <svg className="hidden md:block absolute pointer-events-none" viewBox="0 0 1000 260"
      preserveAspectRatio="none" style={{ top: -20, left: 0, width: '100%', height: 260 }}>
      <defs>
        <linearGradient id="howPathGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(212,175,55,0.05)" />
          <stop offset="50%" stopColor="rgba(212,175,55,0.55)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0.05)" />
        </linearGradient>
      </defs>
      <motion.path
        ref={ref}
        d="M 166,54 C 320,54 340,154 500,134 C 660,118 700,70 834,86"
        fill="none"
        stroke="url(#howPathGrad)"
        strokeWidth={1.4}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={inView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
    </svg>
  )
}

/* ── Navbar clock ── */
function NavClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Analog hands
  const secDeg  = time.getSeconds()  * 6
  const minDeg  = time.getMinutes()  * 6  + time.getSeconds() * 0.1
  const hourDeg = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5

  return (
    <svg width="40" height="40" viewBox="0 0 36 36" className="select-none shrink-0">
      {/* Face */}
      <circle cx="18" cy="18" r="17" fill="rgba(212,175,55,0.05)" stroke="rgba(212,175,55,0.3)" strokeWidth="0.8" />
      {/* Hour ticks */}
      {[...Array(12)].map((_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180)
        const x1 = 18 + Math.cos(a) * 13.5
        const y1 = 18 + Math.sin(a) * 13.5
        const x2 = 18 + Math.cos(a) * (i % 3 === 0 ? 11 : 12.2)
        const y2 = 18 + Math.sin(a) * (i % 3 === 0 ? 11 : 12.2)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 3 === 0 ? 'rgba(212,175,55,0.7)' : 'rgba(212,175,55,0.25)'} strokeWidth={i % 3 === 0 ? 1.2 : 0.7} />
      })}
      {/* Hour hand */}
      <line x1="18" y1="18"
        x2={18 + Math.cos((hourDeg - 90) * Math.PI / 180) * 8}
        y2={18 + Math.sin((hourDeg - 90) * Math.PI / 180) * 8}
        stroke="rgba(212,175,55,0.9)" strokeWidth="1.8" strokeLinecap="round" />
      {/* Minute hand */}
      <line x1="18" y1="18"
        x2={18 + Math.cos((minDeg - 90) * Math.PI / 180) * 11}
        y2={18 + Math.sin((minDeg - 90) * Math.PI / 180) * 11}
        stroke="rgba(212,175,55,0.7)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Second hand */}
      <line x1="18" y1="18"
        x2={18 + Math.cos((secDeg - 90) * Math.PI / 180) * 12}
        y2={18 + Math.sin((secDeg - 90) * Math.PI / 180) * 12}
        stroke="#D4AF37" strokeWidth="0.7" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="18" cy="18" r="1.5" fill="#D4AF37" />
    </svg>
  )
}

/* ── Feature grid, Apple-style: no boxes, no numbers, just space and type ── */
function FeatureGrid() {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollByCard = (dir: 1 | -1) => scrollRef.current?.scrollBy({ left: dir * 296, behavior: 'smooth' })

  return (
    <div className="relative">
      <div ref={scrollRef} className="no-scrollbar scroll-fade-x flex gap-14 overflow-x-auto px-6 md:px-16"
        style={{ scrollSnapType: 'x proximity', paddingBottom: 4 }}>
        {features.map((f, i) => (
          <motion.div key={f.key}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px', amount: 0.4 }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.06, ease: 'easeOut' }}
            className="group shrink-0 transition-transform duration-300 hover:-translate-y-1"
            style={{ width: 260, scrollSnapAlign: 'start' }}>
            <div className="relative mb-5" style={{ width: 52, height: 52 }}>
              <div className="absolute -inset-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.18), transparent 70%)' }} />
              <f.icon size={30} strokeWidth={1.5} className="relative" style={{
                color: '#fffbe0',
                filter: 'drop-shadow(0 0 2px #D4AF37) drop-shadow(0 0 10px rgba(212,175,55,0.55))',
              }} />
            </div>
            <h3 style={{ color: '#fff', fontFamily: CV, fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 8 }}>
              {t(`landing.features.items.${f.key}.title`)}
            </h3>
            <p style={{ color: '#8A8A8A', fontSize: 14.5, lineHeight: 1.7, fontWeight: 300 }}>
              {t(`landing.features.items.${f.key}.desc`)}
            </p>
          </motion.div>
        ))}
      </div>

      <button aria-label="previous" onClick={() => scrollByCard(-1)}
        className="hidden md:flex items-center justify-center absolute" style={{
          left: 6, top: 26, width: 36, height: 36, borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.22)', background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(6px)',
          color: GOLD, cursor: 'pointer',
        }}>
        <ChevronLeft size={16} />
      </button>
      <button aria-label="next" onClick={() => scrollByCard(1)}
        className="hidden md:flex items-center justify-center absolute" style={{
          right: 6, top: 26, width: 36, height: 36, borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.22)', background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(6px)',
          color: GOLD, cursor: 'pointer',
        }}>
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [liveRates, setLiveRates] = useState<FinanceItem[]>([])

  useEffect(() => {
    const load = () => financeApi.getLiveRates().then(r => setLiveRates(r.data)).catch(() => {})
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ background: '#060606', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <div className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="relative flex items-center justify-between gap-8 px-8 rounded-full"
          style={{
            background: 'rgba(10,10,10,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,175,55,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
            width: '100%',
            maxWidth: 1280,
            height: 56,
            overflow: 'visible',
          }}>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="shrink-0 cursor-pointer flex items-center">
              <Logo className="h-8 w-auto" style={{ color: '#D4AF37' }} />
            </button>
            <div className="hidden sm:block shrink-0" style={{ width: 1, height: 22, background: 'rgba(212,175,55,0.15)' }} />
            <div className="hidden sm:flex items-center shrink-0" style={{ transform: 'scale(0.82)', transformOrigin: 'center' }}>
              <NavClock />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <a href="#features" className="text-sm font-medium transition-colors hover:text-white" style={{ color: '#888' }}>{t('landing.navbar.features')}</a>
            <a href="#how"      className="text-sm font-medium transition-colors hover:text-white" style={{ color: '#888' }}>{t('landing.navbar.how')}</a>
            <LanguageSwitcher />
            <Link to="/login"
              className="shrink-0 text-sm px-5 py-2 rounded-full font-semibold transition-all duration-300 hover:opacity-90"
              style={{ background: GOLD_GRAD, color: '#000', boxShadow: '0 0 16px rgba(212,175,55,0.25)' }}>
              {t('landing.navbar.login')}
            </Link>
          </div>
        </nav>
      </div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden"
        style={{ minHeight: '100vh', background: '#000' }}>

        {/* Atmosphere — animated gold waveform breathing behind everything else, so the
            black never reads as flat/empty even where the bars and glow don't reach. */}
        <div className="absolute inset-0 pointer-events-none">
          <LineWaves className="absolute inset-0" color="#D4AF37" lineCount={20} amplitude={46} opacity={0.16} speed={0.28} />
        </div>

        {/* Gold bars background — six independently floating bars cropped from one source image */}
        <FloatingGoldBars />

        {/* Radial glow, centered — anchors the atmosphere behind the now-centered headline */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 38%, rgba(212,175,55,0.09) 0%, transparent 70%)' }} />

        {/* Second glow, low and wide — pulses gently in sync with the product's own "live"
            idea, seated behind where the dashboard mirror emerges below. */}
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.5, 0.85, 0.5] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
          style={{ background: 'radial-gradient(ellipse 55% 40% at 50% 78%, rgba(212,175,55,0.1) 0%, transparent 72%)' }} />

        {/* Centered content, dashboard mirror bleeding in below */}
        <div className="relative z-10 flex flex-col items-center"
          style={{ minHeight: '100vh', paddingTop: '8.5rem', paddingBottom: '4rem' }}>

          <div className="flex flex-col items-center text-center max-w-3xl mx-auto px-6 md:px-10" style={{ zIndex: 2 }}>
            <h1
              className="mb-7"
              style={{ fontFamily: CV, fontSize: 'clamp(2.7rem, 3.4vw + 1rem, 5.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08 }}>
              <VaultReveal delay={0.15} center>
                <span style={{ background: GOLD_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
                  {t('landing.hero.titleLine1')}
                </span>
              </VaultReveal>
              <VaultReveal delay={0.38} center>
                <span className="text-white">{t('landing.hero.titleLine2')}</span>
              </VaultReveal>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.85 }}
              className="mb-10 leading-relaxed mx-auto"
              style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(1rem, 1.1vw + 0.2rem, 1.2rem)', maxWidth: 540, fontFamily: PF, fontStyle: 'italic' }}>
              {t('landing.hero.desc')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.05 }}
              className="flex items-center justify-center gap-4 flex-wrap">
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-2.5 px-9 py-4 rounded-full font-semibold text-black transition-all duration-300 hover:scale-105"
                style={{ background: GOLD_GRAD, fontSize: 16, boxShadow: '0 0 48px rgba(212,175,55,0.35)' }}>
                {t('landing.hero.ctaStart')} <ArrowRight size={17} />
              </button>
              <a href="#features"
                className="flex items-center gap-2 px-8 py-4 rounded-full font-medium text-white transition-all duration-300 hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.12)', fontSize: 15 }}>
                {t('landing.hero.ctaExplore')} <ChevronRight size={15} />
              </a>
            </motion.div>
          </div>

          {/* ── Dashboard mirror — bleeds in from below, full view on scroll ── */}
          <div className="w-full px-4 md:px-10">
            <DashboardMirror />
          </div>

        </div>
      </section>

      {/* ── BRAND MARQUEE ── */}
      <section className="py-12 marquee-wrap"
        style={{ borderTop: '1px solid rgba(212,175,55,0.1)', borderBottom: '1px solid rgba(212,175,55,0.1)', background: 'rgba(212,175,55,0.015)' }}>
        <p className="text-center text-xs tracking-widest mb-7 uppercase"
          style={{ color: '#7D7D7D', fontFamily: CV, letterSpacing: '0.2em' }}>
          {t('landing.marquee.trusted')}
        </p>
        <div className="marquee-track">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0 select-none"
              style={{ padding: '0 40px', borderRight: i % BRANDS.length === BRANDS.length - 1 ? 'none' : '1px solid rgba(212,175,55,0.08)' }}>
              <span style={{ color: GOLD, opacity: 0.7, display: 'flex' }}>{b.icon}</span>
              <span style={{
                fontFamily: b.serif ? PF : CV,
                fontSize: b.serif ? 14 : 15,
                letterSpacing: b.serif ? '0.04em' : '0.14em',
                color: '#888',
                whiteSpace: 'nowrap',
              }}>
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
        <div className="max-w-5xl mx-auto px-8 py-20 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {stats.map((s, i) => (
            <FadeIn key={s.key} delay={i * 0.1}>
              <div className="mb-2" style={{ fontFamily: CV, fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, background: GOLD_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                {s.value}
              </div>
              <div style={{ color: '#888', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t(`landing.stats.${s.key}`)}</div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ paddingTop: '7rem', paddingBottom: '7rem' }}>
        <FadeIn className="text-center mb-14 px-6 md:px-10">
          <h2 style={{ fontFamily: CV, fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
            {t('landing.features.titleLine1')}<br />
            <span style={{ background: GOLD_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t('landing.features.titleLine2')}
            </span>
          </h2>
          <p style={{ color: '#888', fontSize: 15, maxWidth: 480, margin: '0 auto', fontFamily: PF, fontStyle: 'italic' }}>
            {t('landing.features.subtitle')}
          </p>
        </FadeIn>

        <FeatureGrid />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="px-6 md:px-10 overflow-hidden" style={{ paddingTop: '8rem', paddingBottom: '8rem', borderTop: '1px solid rgba(212,175,55,0.07)' }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-20">
            <h2 style={{ fontFamily: CV, fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', fontWeight: 700, lineHeight: 1.2 }}>
              {t('landing.how.title')}
            </h2>
          </FadeIn>

          <div className="relative">
            <HowPath />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-6 relative">
              {HOW_STEPS.map((s, i) => (
                <FadeIn key={s.key} delay={i * 0.18} className={`text-center px-4 ${HOW_OFFSETS[i]}`}>
                  <div className="mb-4" style={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span aria-hidden style={{
                      fontFamily: CV, fontSize: 56, fontWeight: 800, lineHeight: 1,
                      background: GOLD_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      userSelect: 'none',
                    }}>{s.num}</span>
                  </div>
                  <h3 className="text-white mb-3" style={{ fontSize: 16, fontFamily: CV, fontWeight: 600 }}>{t(`landing.how.steps.${s.key}.title`)}</h3>
                  <p style={{ color: '#888888', fontSize: 14, lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>{t(`landing.how.steps.${s.key}.desc`)}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE GOLD STRIP ── */}
      <section className="overflow-hidden"
        style={{ paddingTop: '5rem', paddingBottom: '5rem', background: '#0A0A0A', borderTop: '1px solid rgba(212,175,55,0.08)', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
        <FadeIn className="text-center mb-10 px-6 md:px-10">
          <h3 style={{ fontFamily: CV, fontSize: 'clamp(1.4rem, 2.8vw, 2rem)', fontWeight: 700 }}>{t('landing.liveGold.title')}</h3>
        </FadeIn>

        <div className="marquee-wrap">
          <div className="marquee-track" style={{ animationDuration: '38s', animationDirection: 'reverse' }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => {
              const rate = liveRates.find(r => r.code === item.code)
              const priceLocale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'tr-TR'
              const isUp = rate ? !rate.changeRate.includes('-') : true
              return (
                <div key={i} className="flex items-center gap-3 shrink-0 select-none"
                  style={{ padding: '0 36px', borderRight: '1px solid rgba(212,175,55,0.1)' }}>
                  <span style={{ color: GOLD, fontSize: 11, letterSpacing: '0.14em', fontFamily: CV, whiteSpace: 'nowrap' }}>
                    {item.labelKey ? t(item.labelKey) : item.code}
                  </span>
                  {rate ? (
                    <>
                      <span style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        ₺{rate.sellingPrice.toLocaleString(priceLocale, { minimumFractionDigits: 2 })}
                      </span>
                      <span style={{ color: isUp ? '#22C55E' : '#EF4444', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {isUp ? '▲' : '▼'}{rate.changeRate.replace('-', '')}
                      </span>
                    </>
                  ) : (
                    <span className="h-4 w-20 rounded shimmer inline-block" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-center mt-10 px-6" style={{ color: '#7D7D7D', fontSize: 12 }}>{t('landing.liveGold.note')}</p>
      </section>

      {/* ── CTA ── */}
      <section className="text-center relative overflow-hidden px-6"
        style={{ paddingTop: '9rem', paddingBottom: '9rem' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 55% 65% at 50% 50%, rgba(212,175,55,0.055) 0%, transparent 68%)' }} />
        <FadeIn>
          <h2 className="mb-5" style={{ fontFamily: CV, fontSize: 'clamp(2rem, 4.5vw, 3.6rem)', fontWeight: 800, lineHeight: 1.1 }}>
            {t('landing.cta.titleLine1')}<br />
            <span style={{ background: GOLD_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t('landing.cta.titleLine2')}
            </span>
          </h2>
          <p className="mb-12 mx-auto" style={{ color: '#7D7D7D', fontSize: 15, maxWidth: 400, fontFamily: PF, fontStyle: 'italic', lineHeight: 1.8 }}>
            {t('landing.cta.desc')}
          </p>
          <button onClick={() => navigate('/login')}
            className="inline-flex items-center gap-3 rounded-full font-semibold text-black transition-all duration-300 hover:scale-105"
            style={{ background: GOLD_GRAD, fontSize: 17, padding: '18px 52px', boxShadow: '0 0 60px rgba(212,175,55,0.28)' }}>
            {t('landing.cta.button')} <ArrowRight size={18} />
          </button>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer className="flex flex-col md:flex-row items-center justify-between gap-4 px-10 md:px-16 py-8"
        style={{ borderTop: '1px solid rgba(212,175,55,0.07)' }}>
        <Logo className="h-8 w-auto" style={{ color: GOLD, opacity: 0.55 }} />
        <p style={{ color: '#2e2e2e', fontSize: 12 }}>{t('landing.footer.copyright')}</p>
        <Link to="/login" className="transition-colors hover:text-white" style={{ color: '#888888', fontSize: 13 }}>{t('landing.footer.login')}</Link>
      </footer>

    </div>
  )
}
