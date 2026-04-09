import React, { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  TrendingUp, Package, ShoppingCart, BarChart3,
  QrCode, MapPin, Shield, Zap, Globe, ChevronRight, ArrowRight,
} from 'lucide-react'
import Logo from '../components/Logo'
import LogoMarkless from '../components/LogoMarkless'
import BorderGlow from '../components/BorderGlow'

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
  { icon: TrendingUp,   title: 'Canlı Altın Fiyatları', desc: 'Gram, çeyrek, yarım ve tam altın fiyatlarını anlık takip edin. USD, EUR, GBP kurları otomatik güncellenir.' },
  { icon: Package,      title: 'Stok Yönetimi',         desc: "Ürünlerinizi ayar bazında kategorize edin. K8'den K24'e kadar tüm saflık derecelerini yönetin." },
  { icon: ShoppingCart, title: 'Satış & Alış Takibi',   desc: 'Müşteri ve tedarikçi işlemlerini kolayca kaydedin. Hurdadan alımlara kadar her senaryoyu destekler.' },
  { icon: BarChart3,    title: 'Gelişmiş Raporlar',     desc: 'Günlük özet, stok değerleme ve kar/zarar raporlarını anında görüntüleyin.' },
  { icon: QrCode,       title: 'QR Kod Entegrasyonu',   desc: 'Her ürün için otomatik QR kod oluşturun. Barkod ile hızlı ürün takibi yapın.' },
  { icon: MapPin,       title: 'Çoklu Lokasyon',        desc: 'Vitrin, kasa, kasa altı gibi farklı konumlar arasında stok transferini kolayca yönetin.' },
  { icon: Shield,       title: 'Güvenli & Rol Bazlı',   desc: 'JWT kimlik doğrulama ile verileriniz güvende. Admin ve personel rolleri ile erişim kontrolü sağlayın.' },
  { icon: Zap,          title: 'Hızlı & Modern',        desc: '.NET 10 ve React 19 ile inşa edilmiş. Yüksek performanslı, responsive ve tamamen bulut uyumlu.' },
  { icon: Globe,        title: 'SaaS Hazır',            desc: 'Birden fazla mağazayı tek platformdan yönetin. İster küçük kuyumcu ister büyük zincir — Austo sizin için.' },
]

const stats = [
  { value: '9+',   label: 'Temel Modül'     },
  { value: '100%', label: 'Bulut Uyumlu'    },
  { value: '24/7', label: 'Canlı Fiyat'     },
  { value: '∞',    label: 'Ürün Kapasitesi' },
]


/* ── Helpers ── */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.22)', color: GOLD, fontFamily: CV }}>
      {children}
    </div>
  )
}

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

/* ── Feature carousel ── */
const CARD_W = 380
const CARD_GAP = 28
const CARD_STEP = CARD_W + CARD_GAP

interface FeatureCardProps {
  f: typeof features[0]
  index: number
  x: ReturnType<typeof useMotionValue<number>>
  isDragging: boolean
  onClickSnap: (i: number) => void
}

function FeatureCard({ f, index, x, isDragging, onClickSnap }: FeatureCardProps) {
  const cardCenter = index * CARD_STEP + CARD_W / 2

  const scale = useTransform(x, xVal => {
    const dist = Math.abs(window.innerWidth / 2 - (xVal + cardCenter))
    return Math.max(0.75, 1.12 - (dist / CARD_STEP) * 0.22)
  })
  const opacity = useTransform(x, xVal => {
    const dist = Math.abs(window.innerWidth / 2 - (xVal + cardCenter))
    return Math.max(0.18, 1 - (dist / CARD_STEP) * 0.5)
  })
  return (
    <motion.div
      onClick={() => !isDragging && onClickSnap(index)}
      style={{ scale, opacity, width: CARD_W, flexShrink: 0, cursor: 'pointer' }}
    >
      <BorderGlow style={{ padding: 28 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          background: 'rgba(212,175,55,0.04)',
          border: '1px solid rgba(212,175,55,0.2)',
          boxShadow: '0 0 8px rgba(212,175,55,0.15), inset 0 0 8px rgba(212,175,55,0.06)',
        }}>
          <f.icon size={19} style={{
            color: '#fffbe0',
            filter: 'drop-shadow(0 0 2px #D4AF37) drop-shadow(0 0 6px #D4AF37) drop-shadow(0 0 14px rgba(212,175,55,0.9)) drop-shadow(0 0 28px rgba(212,175,55,0.5))',
          }} />
        </div>
        <h3 style={{ color: '#fff', fontSize: 14, fontFamily: CV, fontWeight: 600, letterSpacing: '0.01em', marginBottom: 10 }}>{f.title}</h3>
        <p style={{ color: '#4a4a4a', fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
      </BorderGlow>
    </motion.div>
  )
}

function FeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(0)

  const snapTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(features.length - 1, idx))
    setActiveIndex(clamped)
    animate(x, window.innerWidth / 2 - (clamped * CARD_STEP + CARD_W / 2), {
      type: 'spring', stiffness: 380, damping: 36,
    })
  }

  useEffect(() => { snapTo(activeIndex) }, [])

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    setIsDragging(false)
    if (info.offset.x < -60 || info.velocity.x < -300) snapTo(activeIndex + 1)
    else if (info.offset.x > 60 || info.velocity.x > 300) snapTo(activeIndex - 1)
    else snapTo(activeIndex)
  }

  return (
    <div style={{ overflow: 'hidden', paddingTop: 24, paddingBottom: 40 }}>
      <motion.div
        drag="x"
        dragConstraints={{ left: -9999, right: 9999 }}
        dragElastic={0}
        style={{ x, display: 'flex', gap: CARD_GAP, width: 'max-content', cursor: isDragging ? 'grabbing' : 'grab' }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        {features.map((f, i) => (
          <FeatureCard key={f.title} f={f} index={i} x={x} isDragging={isDragging} onClickSnap={snapTo} />
        ))}
      </motion.div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate()

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
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="shrink-0 cursor-pointer">
            <Logo className="h-20 w-auto" style={{ color: '#D4AF37' }} />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">
            <NavClock />
          </div>
          <div className="hidden md:flex items-center gap-5">
            <a href="#features" className="text-sm font-medium transition-colors hover:text-white" style={{ color: '#666' }}>Özellikler</a>
            <a href="#how"      className="text-sm font-medium transition-colors hover:text-white" style={{ color: '#666' }}>Nasıl Çalışır</a>
            <Link to="/login"
              className="shrink-0 text-sm px-5 py-2 rounded-full font-semibold transition-all duration-300 hover:opacity-90"
              style={{ background: GOLD_GRAD, color: '#000', boxShadow: '0 0 16px rgba(212,175,55,0.25)' }}>
              Giriş Yap
            </Link>
          </div>
        </nav>
      </div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden"
        style={{ minHeight: '100vh', background: '#000' }}>

        {/* Gold bars background */}
        <img src="/backgroundforherosec.png" aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ opacity: 0.25, filter: 'brightness(0.6) saturate(1.2)', animation: 'barsdrift 20s ease-in-out infinite', transformOrigin: 'center' }} />

        {/* Radial glow left-biased */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 25% 55%, rgba(212,175,55,0.07) 0%, transparent 70%)' }} />

        {/* Two-column layout */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center gap-12"
          style={{ minHeight: '100vh', paddingTop: '7rem', paddingBottom: '4rem' }}>

          {/* ── Left: content ── */}
          <div className="flex-1 flex flex-col items-start text-left">
            <motion.h1
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.1 }}
              className="mb-7"
              style={{ fontFamily: CV, fontSize: 'clamp(2.6rem, 3vw + 1rem, 5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              <span style={{ background: GOLD_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap', display: 'block' }}>
                Altın Yönetiminde
              </span>
              <span className="text-white">Yeni Standart</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.2 }}
              className="mb-12 leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(1rem, 1.1vw + 0.2rem, 1.2rem)', maxWidth: 480, fontFamily: PF, fontStyle: 'italic' }}>
              Kuyumcunuzu uçtan uca dijitalleştirin. Canlı altın fiyatları, stok takibi,
              satış &amp; alış yönetimi, raporlar ve daha fazlası — tek platformda.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.3 }}
              className="flex items-center gap-4 flex-wrap">
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-2.5 px-9 py-4 rounded-full font-semibold text-black transition-all duration-300 hover:scale-105"
                style={{ background: GOLD_GRAD, fontSize: 16, boxShadow: '0 0 48px rgba(212,175,55,0.35)' }}>
                Hemen Başla <ArrowRight size={17} />
              </button>
              <a href="#features"
                className="flex items-center gap-2 px-8 py-4 rounded-full font-medium text-white transition-all duration-300 hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.12)', fontSize: 15 }}>
                Özellikleri Keşfet <ChevronRight size={15} />
              </a>
            </motion.div>
          </div>

          {/* ── Right: animated logo ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
            className="flex-1 flex items-center justify-center pointer-events-none select-none"
            style={{ minWidth: 0 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 580 }}>

              {/* Black base */}
              <LogoMarkless style={{ color: '#000', width: '100%', height: 'auto', display: 'block' }} />

              {/* Dim outline */}
              <LogoMarkless strokeOnly style={{
                color: 'rgba(212,175,55,0.06)',
                width: '100%', height: 'auto', display: 'block',
                position: 'absolute', inset: 0,
              }} />

              {/* Soft glow bloom around the laser */}
              <div className="scan-border-glow">
                <LogoMarkless strokeOnly style={{
                  color: '#D4AF37',
                  width: '100%', height: 'auto', display: 'block',
                  filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.9)) drop-shadow(0 0 24px rgba(212,175,55,0.5))',
                }} />
              </div>

              {/* Tight bright laser line */}
              <div className="scan-border-layer">
                <LogoMarkless strokeOnly style={{
                  color: '#fffde0',
                  width: '100%', height: 'auto', display: 'block',
                  filter: 'drop-shadow(0 0 2px rgba(255,255,220,1)) drop-shadow(0 0 8px rgba(255,240,100,1)) drop-shadow(0 0 20px rgba(212,175,55,0.9))',
                }} />
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* ── BRAND MARQUEE ── */}
      <section className="py-12 marquee-wrap"
        style={{ borderTop: '1px solid rgba(212,175,55,0.1)', borderBottom: '1px solid rgba(212,175,55,0.1)', background: 'rgba(212,175,55,0.015)' }}>
        <p className="text-center text-xs tracking-widest mb-7 uppercase"
          style={{ color: '#444', fontFamily: CV, letterSpacing: '0.2em' }}>
          Güvenilen Markalar &amp; İş Ortakları
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
            <FadeIn key={s.label} delay={i * 0.1}>
              <div className="mb-2" style={{ fontFamily: CV, fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, background: GOLD_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                {s.value}
              </div>
              <div style={{ color: '#555', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ paddingTop: '7rem', paddingBottom: '7rem' }}>
        <FadeIn className="text-center mb-14 px-6 md:px-10">
          <Pill>Özellikler</Pill>
          <h2 style={{ fontFamily: CV, fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
            Kuyumcular İçin<br />
            <span style={{ background: GOLD_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Her Şey Düşünüldü
            </span>
          </h2>
          <p style={{ color: '#555', fontSize: 15, maxWidth: 480, margin: '0 auto', fontFamily: PF, fontStyle: 'italic' }}>
            Sektöre özel geliştirilen özelliklerle işlerinizi kolaylaştırın.
          </p>
        </FadeIn>

        {/* Draggable carousel */}
        <FeatureCarousel />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="px-6 md:px-10" style={{ paddingTop: '7rem', paddingBottom: '7rem', borderTop: '1px solid rgba(212,175,55,0.07)' }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <Pill>Nasıl Çalışır</Pill>
            <h2 style={{ fontFamily: CV, fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', fontWeight: 700, lineHeight: 1.2 }}>
              3 Adımda Başlayın
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[22%] right-[22%] h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.25), transparent)' }} />
            {[
              { step: '01', title: 'Hesap Oluşturun',     desc: 'Dakikalar içinde hesabınızı oluşturun ve mağazanızı tanımlayın.' },
              { step: '02', title: 'Ürünlerinizi Ekleyin', desc: 'Stok bilgilerini, ayar ve gramajları sisteme girin.' },
              { step: '03', title: 'Yönetmeye Başlayın',  desc: 'Satış yapın, raporları inceleyin ve kârınızı takip edin.' },
            ].map((s, i) => (
              <FadeIn key={s.step} delay={i * 0.15} className="text-center px-4">
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                  style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)', color: GOLD, fontFamily: CV, fontSize: 20, fontWeight: 700 }}>
                  {s.step}
                </div>
                <h3 className="text-white mb-3" style={{ fontSize: 16, fontFamily: CV, fontWeight: 600 }}>{s.title}</h3>
                <p style={{ color: '#4a4a4a', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE GOLD STRIP ── */}
      <section className="px-6 md:px-10 overflow-hidden"
        style={{ paddingTop: '5rem', paddingBottom: '5rem', background: 'rgba(212,175,55,0.02)', borderTop: '1px solid rgba(212,175,55,0.08)', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
        <FadeIn className="text-center mb-10">
          <p className="uppercase tracking-widest mb-3" style={{ color: GOLD, fontSize: 11, fontFamily: CV, letterSpacing: '0.22em' }}>Anlık Altın Takibi</p>
          <h3 style={{ fontFamily: CV, fontSize: 'clamp(1.4rem, 2.8vw, 2rem)', fontWeight: 700 }}>Piyasayı Asla Kaçırmayın</h3>
        </FadeIn>
        <div className="flex gap-4 justify-center flex-wrap max-w-4xl mx-auto">
          {['GRAM ALTIN', 'ÇEYREK ALTIN', 'YARIM ALTIN', 'TAM ALTIN', 'USD', 'EUR'].map((label, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
              className="rounded-2xl text-center"
              style={{ background: '#0D0D0D', border: '1px solid rgba(212,175,55,0.12)', padding: '18px 28px', minWidth: 130 }}>
              <div className="mb-2" style={{ color: '#444', fontSize: 11, letterSpacing: '0.12em', fontFamily: CV }}>{label}</div>
              <div className="h-5 w-24 rounded-lg mx-auto shimmer" />
            </motion.div>
          ))}
        </div>
        <p className="text-center mt-8" style={{ color: '#2a2a2a', fontSize: 12 }}>* Canlı fiyatlar giriş sonrası gösterilir</p>
      </section>

      {/* ── CTA ── */}
      <section className="text-center relative overflow-hidden px-6"
        style={{ paddingTop: '9rem', paddingBottom: '9rem' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 55% 65% at 50% 50%, rgba(212,175,55,0.055) 0%, transparent 68%)' }} />
        <FadeIn>
          <h2 className="mb-5" style={{ fontFamily: CV, fontSize: 'clamp(2rem, 4.5vw, 3.6rem)', fontWeight: 800, lineHeight: 1.1 }}>
            Kuyumcunuzu<br />
            <span style={{ background: GOLD_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Dijitalleştirin
            </span>
          </h2>
          <p className="mb-12 mx-auto" style={{ color: '#444', fontSize: 15, maxWidth: 400, fontFamily: PF, fontStyle: 'italic', lineHeight: 1.8 }}>
            Austo ile altın yönetimini modernleştirin. Hızlı kurulum, kolay kullanım.
          </p>
          <button onClick={() => navigate('/login')}
            className="inline-flex items-center gap-3 rounded-full font-semibold text-black transition-all duration-300 hover:scale-105"
            style={{ background: GOLD_GRAD, fontSize: 17, padding: '18px 52px', boxShadow: '0 0 60px rgba(212,175,55,0.28)' }}>
            Ücretsiz Başla <ArrowRight size={18} />
          </button>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer className="flex flex-col md:flex-row items-center justify-between gap-4 px-10 md:px-16 py-8"
        style={{ borderTop: '1px solid rgba(212,175,55,0.07)' }}>
        <Logo className="h-8 w-auto" style={{ color: GOLD, opacity: 0.55 }} />
        <p style={{ color: '#2e2e2e', fontSize: 12 }}>© 2026 Austo · Kuyumcu Yönetim Sistemi</p>
        <Link to="/login" className="transition-colors hover:text-white" style={{ color: '#3a3a3a', fontSize: 13 }}>Giriş Yap →</Link>
      </footer>

    </div>
  )
}
