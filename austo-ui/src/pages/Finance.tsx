import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, Plus, X, TrendingUp, TrendingDown } from 'lucide-react'
import { financeApi } from '../api/client'
import type { FinanceItem, GoldPriceLog } from '../types'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'

// ── Formatters ────────────────────────────────────────────
function fmt(n: number, locale = 'tr-TR') {
  return '₺' + n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtShort(n: number, locale = 'tr-TR') {
  // Full precision, not "7K" — traders want the exact number, not a rounded stand-in.
  // Small-magnitude instruments (USD/EUR/GBP, ~tens of TRY) need the kuruş decimals to
  // mean anything; large gold/coin prices (thousands) read cleaner without them.
  const decimals = Math.abs(n) < 1000 ? 2 : 0
  return '₺' + n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

// ── Metric config ─────────────────────────────────────────
type MetricKey =
  | 'gramGoldBuyTRY' | 'gramGoldSellTRY'
  | 'usdTRY' | 'eurTRY' | 'gbpTRY'
  | 'ceyrekAltinTRY' | 'yarimAltinTRY' | 'tamAltinTRY' | 'cumhuriyetAltinTRY' | 'ataLiraTRY'
  | 'gramK14BuyTRY'  | 'gramK14SellTRY'
  | 'gramK18BuyTRY'  | 'gramK18SellTRY'
  | 'gramK22BuyTRY'  | 'gramK22SellTRY'

interface MetricConfig {
  key: MetricKey
  labelKey: string
  shortKey: string
  color: string
}

// Gram altın alış/satış + döviz + tam altın türleri önce gelir (esas görünüm);
// ayarlı (14/18/22k) gram fiyatları — hepsi aynı gram fiyatının türevi olduğundan —
// ayrıntı isteyenler için sonda, ayrı bir grupta durur.
const METRICS: MetricConfig[] = [
  { key: 'gramGoldBuyTRY',    labelKey: 'fineBuy',  shortKey: 'shortFineBuy',  color: '#D4AF37' },
  { key: 'gramGoldSellTRY',   labelKey: 'fineSell', shortKey: 'shortFineSell', color: '#F5E070' },
  { key: 'usdTRY',            labelKey: 'usd',        shortKey: 'shortUsd',        color: '#22C55E' },
  { key: 'eurTRY',            labelKey: 'eur',        shortKey: 'shortEur',        color: '#38BDF8' },
  { key: 'gbpTRY',            labelKey: 'gbp',        shortKey: 'shortGbp',        color: '#A78BFA' },
  { key: 'ceyrekAltinTRY',    labelKey: 'ceyrek',     shortKey: 'shortCeyrek',     color: '#F59E0B' },
  { key: 'yarimAltinTRY',     labelKey: 'yarim',      shortKey: 'shortYarim',      color: '#FB923C' },
  { key: 'tamAltinTRY',       labelKey: 'tam',        shortKey: 'shortTam',        color: '#EF4444' },
  { key: 'cumhuriyetAltinTRY',labelKey: 'cumhuriyet', shortKey: 'shortCumhuriyet', color: '#EC4899' },
  { key: 'ataLiraTRY',        labelKey: 'ata',        shortKey: 'shortAta',        color: '#D946EF' },
  { key: 'gramK14BuyTRY',   labelKey: 'k14Buy',   shortKey: 'shortK14Buy',  color: '#3B82F6' },
  { key: 'gramK14SellTRY',  labelKey: 'k14Sell',  shortKey: 'shortK14Sell', color: '#93C5FD' },
  { key: 'gramK18BuyTRY',   labelKey: 'k18Buy',   shortKey: 'shortK18Buy',  color: '#10B981' },
  { key: 'gramK18SellTRY',  labelKey: 'k18Sell',  shortKey: 'shortK18Sell', color: '#6EE7B7' },
  { key: 'gramK22BuyTRY',   labelKey: 'k22Buy',   shortKey: 'shortK22Buy',  color: '#F59E0B' },
  { key: 'gramK22SellTRY',  labelKey: 'k22Sell',  shortKey: 'shortK22Sell', color: '#FDE68A' },
]

// ── Time / Grouping config ────────────────────────────────
type TimeRange = '7d' | '30d' | '3m' | '6m' | '1y'
type Grouping  = 'daily' | 'weekly' | 'monthly'

const TIME_DAYS: Record<TimeRange, number> = {
  '7d': 7, '30d': 30, '3m': 90, '6m': 180, '1y': 365,
}

// ── Data grouping ─────────────────────────────────────────
type ChartPoint = { label: string } & Partial<Record<MetricKey, number>>

function weekStart(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // Monday
  return d.toISOString().slice(0, 10)
}

function bucketKey(log: GoldPriceLog, grouping: Grouping): string {
  if (grouping === 'monthly') return log.date.slice(0, 7)
  if (grouping === 'weekly')  return weekStart(new Date(log.date))
  return log.date.slice(0, 10)
}

function formatLabel(key: string, grouping: Grouping, locale = 'tr-TR'): string {
  const d = new Date(key.length === 7 ? key + '-01' : key + 'T00:00:00')
  if (grouping === 'monthly') return d.toLocaleDateString(locale, { month: 'short', year: '2-digit' })
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

function groupLogs(logs: GoldPriceLog[], grouping: Grouping, locale = 'tr-TR'): ChartPoint[] {
  type Acc = { sums: Partial<Record<MetricKey, number>>; counts: Partial<Record<MetricKey, number>> }
  const map = new Map<string, Acc>()

  for (const log of logs) {
    const k = bucketKey(log, grouping)
    if (!map.has(k)) map.set(k, { sums: {}, counts: {} })
    const acc = map.get(k)!
    for (const { key } of METRICS) {
      const val = log[key] as number | undefined
      if (val != null && val > 0) {
        acc.sums[key]   = (acc.sums[key]   ?? 0) + val
        acc.counts[key] = (acc.counts[key] ?? 0) + 1
      }
    }
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { sums, counts }]) => {
      const pt: ChartPoint = { label: formatLabel(key, grouping, locale) }
      for (const { key: mk } of METRICS) {
        const c = counts[mk]
        if (c && c > 0) pt[mk] = (sums[mk]! / c)
      }
      return pt
    })
}

// ── Chart Tooltip ─────────────────────────────────────────
interface MultiTipProps {
  active?: boolean
  label?: string
  payload?: Array<{ dataKey: string; value: number; color: string; payload: Record<string, number | string> }>
}
function MultiTip({ active, label, payload }: MultiTipProps) {
  const { t, i18n } = useTranslation()
  const priceLocale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'tr-TR'
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-sm"
      style={{ background: '#1A1A1A', border: '1px solid rgba(212,175,55,0.2)', minWidth: 190 }}>
      <div className="text-xs mb-2" style={{ color: '#888' }}>{label}</div>
      {payload.map(p => {
        const key = p.dataKey.replace(/__pct$/, '')
        const m = METRICS.find(m => m.key === key)
        const abs = p.payload[key]
        const isUp = p.value >= 0
        return (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
              <span className="text-xs" style={{ color: '#888' }}>{m ? t(`finance.metrics.${m.shortKey}`) : ''}</span>
            </div>
            <div className="text-right leading-tight">
              <div className="text-xs font-semibold tabular-nums" style={{ color: isUp ? '#22C55E' : '#EF4444' }}>
                {isUp ? '+' : ''}{p.value.toFixed(2)}%
              </div>
              {typeof abs === 'number' && (
                <div className="text-[10px] tabular-nums" style={{ color: '#666' }}>{fmtShort(abs, priceLocale)}</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Rate Card ─────────────────────────────────────────────
function RateCard({ item }: { item: FinanceItem }) {
  const { t, i18n } = useTranslation()
  const priceLocale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'tr-TR'
  const isUp = !item.changeRate.includes('-')
  return (
    <div className="rounded-xl px-4 py-3 transition-all"
      style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide truncate" style={{ color: '#888' }}>
          {item.code}
        </span>
        <span className={`flex items-center gap-0.5 text-[10px] font-semibold shrink-0 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {item.changeRate}
        </span>
      </div>
      <div className="text-base font-bold text-white tabular-nums">
        ₺{item.sellingPrice.toLocaleString(priceLocale, { minimumFractionDigits: 2 })}
      </div>
      <div className="text-xs mt-0.5" style={{ color: '#888' }}>
        {t('finance.rateCard.buy')} ₺{item.buyingPrice.toLocaleString(priceLocale, { minimumFractionDigits: 2 })}
      </div>
    </div>
  )
}

// ── Finance ───────────────────────────────────────────────
const GOLD_CODES = ['GRAM ALTIN', 'ÇEYREK ALTIN', 'YARIM ALTIN', 'TAM ALTIN', 'CUMHURİYET', 'ATA LİRA']

export default function Finance() {
  const { t, i18n } = useTranslation()
  const priceLocale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'tr-TR'
  const [rates,      setRates]      = useState<FinanceItem[]>([])
  const [history,    setHistory]    = useState<GoldPriceLog[]>([])
  const [ratesLoading,   setRatesLoading]   = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modal,      setModal]      = useState(false)
  const [saving,     setSaving]     = useState(false)

  // Chart controls
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [grouping,  setGrouping]  = useState<Grouping>('daily')
  const [selected,  setSelected]  = useState<Set<MetricKey>>(
    new Set<MetricKey>(['gramGoldSellTRY', 'usdTRY', 'ceyrekAltinTRY', 'tamAltinTRY'])
  )

  // Live rate visibility
  const [visibleRates, setVisibleRates] = useState<Set<string>>(
    new Set(['GRAM ALTIN', 'ÇEYREK ALTIN', 'TAM ALTIN', 'USD', 'EUR', 'GBP'])
  )
  function toggleRate(code: string) {
    setVisibleRates(prev => {
      const next = new Set(prev)
      if (next.has(code)) { if (next.size > 1) next.delete(code) }
      else next.add(code)
      return next
    })
  }

  // Form
  const [form, setForm] = useState({
    gramGoldBuyTRY: '', gramGoldSellTRY: '',
    gramK14BuyTRY: '',  gramK14SellTRY: '',
    gramK18BuyTRY: '',  gramK18SellTRY: '',
    gramK22BuyTRY: '',  gramK22SellTRY: '',
  })
  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  function loadRates() {
    setRatesLoading(true)
    financeApi.getLiveRates().then(r => setRates(r.data)).finally(() => setRatesLoading(false))
  }
  function loadHistory(days: number) {
    setHistoryLoading(true)
    financeApi.getGoldHistory(days).then(r => setHistory(r.data)).finally(() => setHistoryLoading(false))
  }

  useEffect(() => { loadRates(); loadHistory(TIME_DAYS[timeRange]) }, [])
  useEffect(() => { loadHistory(TIME_DAYS[timeRange]) }, [timeRange])

  async function handleRefresh() {
    setRefreshing(true)
    await Promise.all([
      financeApi.getLiveRates().then(r => setRates(r.data)),
      financeApi.getGoldHistory(TIME_DAYS[timeRange]).then(r => setHistory(r.data)),
    ]).finally(() => setRefreshing(false))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await financeApi.logGoldPrice({
        gramGoldBuyTRY:  +form.gramGoldBuyTRY,
        gramGoldSellTRY: +form.gramGoldSellTRY,
        gramK14BuyTRY:   form.gramK14BuyTRY  ? +form.gramK14BuyTRY  : null,
        gramK14SellTRY:  form.gramK14SellTRY ? +form.gramK14SellTRY : null,
        gramK18BuyTRY:   form.gramK18BuyTRY  ? +form.gramK18BuyTRY  : null,
        gramK18SellTRY:  form.gramK18SellTRY ? +form.gramK18SellTRY : null,
        gramK22BuyTRY:   form.gramK22BuyTRY  ? +form.gramK22BuyTRY  : null,
        gramK22SellTRY:  form.gramK22SellTRY ? +form.gramK22SellTRY : null,
      })
      setModal(false)
      setForm({ gramGoldBuyTRY: '', gramGoldSellTRY: '', gramK14BuyTRY: '', gramK14SellTRY: '', gramK18BuyTRY: '', gramK18SellTRY: '', gramK22BuyTRY: '', gramK22SellTRY: '' })
      loadHistory(TIME_DAYS[timeRange])
    } finally { setSaving(false) }
  }

  function toggleMetric(key: MetricKey) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) { if (next.size > 1) next.delete(key) }
      else next.add(key)
      return next
    })
  }

  const chartData = useMemo(() => groupLogs(history, grouping, priceLocale), [history, grouping, priceLocale])
  const goldRates = rates.filter(r => GOLD_CODES.includes(r.code))
  const fxRates   = rates.filter(r => ['USD', 'EUR', 'GBP'].includes(r.code))
  const tickInterval = Math.max(0, Math.floor(chartData.length / 7) - 1)

  // Overlaying raw TRY prices breaks the moment two selected instruments sit
  // at different orders of magnitude (USD ~48 next to Tam Altın ~44.000) —
  // the small one gets crushed flat on a shared axis no matter how tight the
  // domain is. Index every series to "% change since the start of the visible
  // range" instead: every instrument shares the same axis on equal footing,
  // and a real 0.2% move actually reads as a visible swing instead of noise.
  const normalizedChartData = useMemo(() => {
    const baseline: Partial<Record<MetricKey, number>> = {}
    for (const m of METRICS) {
      if (!selected.has(m.key)) continue
      const first = chartData.find(pt => typeof pt[m.key] === 'number')
      if (first) baseline[m.key] = first[m.key] as number
    }
    return chartData.map(pt => {
      const row: Record<string, number | string> = { label: pt.label }
      for (const m of METRICS) {
        if (!selected.has(m.key)) continue
        const v = pt[m.key]
        if (typeof v === 'number') {
          row[m.key] = v
          const base = baseline[m.key]
          row[`${m.key}__pct`] = base ? (v / base - 1) * 100 : 0
        }
      }
      return row
    })
  }, [chartData, selected])

  // Zoom the Y-axis into the actual range of the visible % series instead of
  // an auto-scale default — otherwise a tight ±0.5% week still gets padded
  // out to something that looks flat.
  const yDomain = useMemo((): [number, number] | ['auto', 'auto'] => {
    const vals: number[] = []
    for (const pt of normalizedChartData) {
      for (const m of METRICS) {
        if (selected.has(m.key)) {
          const v = pt[`${m.key}__pct`]
          if (typeof v === 'number') vals.push(v)
        }
      }
    }
    if (vals.length === 0) return ['auto', 'auto']
    const min = Math.min(0, ...vals)
    const max = Math.max(0, ...vals)
    const span = max - min
    const pad = Math.max(span * 0.2, 0.15)
    return [Math.floor((min - pad) * 100) / 100, Math.ceil((max + pad) * 100) / 100]
  }, [normalizedChartData, selected])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title gold-text">{t('finance.pageTitle')}</h1>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost flex items-center gap-2" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> {t('finance.refresh')}
          </button>
          <button className="btn-gold flex items-center gap-2" onClick={() => setModal(true)}>
            <Plus size={16} /> {t('finance.enterManualPrice')}
          </button>
        </div>
      </div>

      {/* Live rates */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="label">{t('finance.liveRates')}</p>
          {!ratesLoading && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Group toggles */}
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                {([
                  { label: t('finance.groupGold'), codes: goldRates.map(r => r.code) },
                  { label: t('finance.groupFx'), codes: fxRates.map(r => r.code)  },
                ] as { label: string; codes: string[] }[]).map(({ label, codes }) => {
                  const allOn = codes.every(c => visibleRates.has(c))
                  return (
                    <button key={label}
                      onClick={() => {
                        setVisibleRates(prev => {
                          const next = new Set(prev)
                          if (allOn) {
                            // turn off group only if other group has at least 1 visible
                            const otherVisible = [...next].some(c => !codes.includes(c))
                            if (otherVisible) codes.forEach(c => next.delete(c))
                          } else {
                            codes.forEach(c => next.add(c))
                          }
                          return next
                        })
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                      style={{
                        background: allOn ? 'rgba(212,175,55,0.15)' : 'transparent',
                        color:      allOn ? '#D4AF37' : '#7D7D7D',
                        border:     `1px solid ${allOn ? 'rgba(212,175,55,0.3)' : 'transparent'}`,
                      }}>
                      {label}
                    </button>
                  )
                })}
              </div>
              {/* Individual toggles */}
              <div className="flex flex-wrap gap-1.5">
                {[...goldRates, ...fxRates].map(r => {
                  const on = visibleRates.has(r.code)
                  return (
                    <button key={r.code} onClick={() => toggleRate(r.code)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150"
                      style={{
                        background: on ? 'rgba(212,175,55,0.12)' : '#0A0A0A',
                        border:     `1px solid ${on ? 'rgba(212,175,55,0.35)' : '#1A1A1A'}`,
                        color:      on ? '#D4AF37' : '#7D7D7D',
                      }}>
                      {r.code}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))' }}>
          {ratesLoading
            ? [1,2,3,4,5,6,7,8,9].map(i => (
                <div key={i} className="h-16 rounded-xl shimmer" />
              ))
            : [...goldRates, ...fxRates]
                .filter(r => visibleRates.has(r.code))
                .map(r => <RateCard key={r.code} item={r} />)
          }
        </div>
      </div>

      {/* Chart Card */}
      <div className="card p-5">
        {/* Chart header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="label mb-3">{t('finance.priceHistory')}</p>
            {/* Metric toggles */}
            <div className="flex flex-wrap gap-2">
              {METRICS.map(m => {
                const on = selected.has(m.key)
                return (
                  <button key={m.key} onClick={() => toggleMetric(m.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                    style={{
                      background: on ? `${m.color}18` : '#0A0A0A',
                      border:     `1px solid ${on ? m.color + '50' : '#1A1A1A'}`,
                      color:      on ? m.color : '#7D7D7D',
                    }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: on ? m.color : '#333' }} />
                    {t(`finance.metrics.${m.labelKey}`)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time range + grouping */}
          <div className="flex flex-col gap-2 items-end shrink-0">
            {/* Time range */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
              {(['7d', '30d', '3m', '6m', '1y'] as TimeRange[]).map(r => (
                <button key={r} onClick={() => setTimeRange(r)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={{
                    background: timeRange === r ? 'rgba(212,175,55,0.15)' : 'transparent',
                    color:      timeRange === r ? '#D4AF37' : '#7D7D7D',
                    border:     `1px solid ${timeRange === r ? 'rgba(212,175,55,0.3)' : 'transparent'}`,
                  }}>
                  {t(`finance.timeRanges.${r}`)}
                </button>
              ))}
            </div>
            {/* Grouping */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
              {(['daily', 'weekly', 'monthly'] as Grouping[]).map(g => (
                <button key={g} onClick={() => setGrouping(g)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={{
                    background: grouping === g ? 'rgba(212,175,55,0.1)' : 'transparent',
                    color:      grouping === g ? '#D4AF37' : '#7D7D7D',
                    border:     `1px solid ${grouping === g ? 'rgba(212,175,55,0.25)' : 'transparent'}`,
                  }}>
                  {t(`finance.grouping.${g}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        {historyLoading ? (
          <div className="shimmer rounded-xl" style={{ height: 360 }} />
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl text-sm" style={{ height: 360, color: '#7D7D7D' }}>
            {t('finance.noChartData')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={normalizedChartData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <defs>
                {METRICS.filter(m => selected.has(m.key)).map(m => (
                  <linearGradient key={m.key} id={`fill-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={m.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={m.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#7D7D7D', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={tickInterval}
              />
              <YAxis
                hide={false}
                tick={{ fill: '#7D7D7D', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={56}
                domain={yDomain}
                allowDataOverflow
                tickFormatter={v => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
              <Tooltip content={<MultiTip />} cursor={{ stroke: 'rgba(212,175,55,0.15)', strokeWidth: 1 }} />
              {METRICS.filter(m => selected.has(m.key)).map(m => (
                <Area
                  key={m.key}
                  type="monotone"
                  dataKey={`${m.key}__pct`}
                  stroke={m.color}
                  strokeWidth={2.5}
                  fill={`url(#fill-${m.key})`}
                  dot={false}
                  activeDot={{ r: 5, fill: m.color, stroke: '#111', strokeWidth: 2 }}
                  connectNulls
                  isAnimationActive
                  animationDuration={700}
                  animationEasing="ease-out"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* History table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <p className="label">{t('finance.recordHistory')}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #111' }}>
                {[t('finance.columns.date'), t('finance.columns.fineBuy'), t('finance.columns.fineSell'), t('finance.columns.k14'), t('finance.columns.k18'), t('finance.columns.k22'), t('finance.columns.source')].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap"
                    style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center"><div className="shimmer h-4 w-48 mx-auto rounded" /></td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: '#888' }}>{t('finance.noResults')}</td></tr>
              ) : history.slice(0, 20).map(h => (
                <tr key={h.id} className="table-row">
                  <td className="px-4 py-3 text-white whitespace-nowrap">
                    {new Date(h.date).toLocaleDateString(priceLocale, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: '#888' }}>{fmt(h.gramGoldBuyTRY, priceLocale)}</td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: '#888' }}>{fmt(h.gramGoldSellTRY, priceLocale)}</td>
                  <td className="px-4 py-3 tabular-nums whitespace-nowrap" style={{ color: '#888' }}>
                    {h.gramK14BuyTRY ? `${fmtShort(h.gramK14BuyTRY, priceLocale)} / ${fmtShort(h.gramK14SellTRY ?? 0, priceLocale)}` : '—'}
                  </td>
                  <td className="px-4 py-3 tabular-nums whitespace-nowrap" style={{ color: '#888' }}>
                    {h.gramK18BuyTRY ? `${fmtShort(h.gramK18BuyTRY, priceLocale)} / ${fmtShort(h.gramK18SellTRY ?? 0, priceLocale)}` : '—'}
                  </td>
                  <td className="px-4 py-3 tabular-nums whitespace-nowrap" style={{ color: '#888' }}>
                    {h.gramK22BuyTRY ? `${fmtShort(h.gramK22BuyTRY, priceLocale)} / ${fmtShort(h.gramK22SellTRY ?? 0, priceLocale)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={h.source === 'Manuel' ? 'badge-gold' : 'badge-gray'}>{h.source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
              <h2 className="text-base font-semibold text-white">{t('finance.modal.title')}</h2>
              <button onClick={() => setModal(false)} aria-label={t('common.close')} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="px-6 py-5 grid grid-cols-2 gap-4">
                {([
                  ['gramGoldBuyTRY',  t('finance.modal.fineGoldBuy'),  true],
                  ['gramGoldSellTRY', t('finance.modal.fineGoldSell'), true],
                  ['gramK14BuyTRY',   t('finance.modal.k14Buy'),        false],
                  ['gramK14SellTRY',  t('finance.modal.k14Sell'),       false],
                  ['gramK18BuyTRY',   t('finance.modal.k18Buy'),        false],
                  ['gramK18SellTRY',  t('finance.modal.k18Sell'),       false],
                  ['gramK22BuyTRY',   t('finance.modal.k22Buy'),        false],
                  ['gramK22SellTRY',  t('finance.modal.k22Sell'),       false],
                ] as [string, string, boolean][]).map(([key, label, required]) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input
                      className="input"
                      type="number"
                      step="0.01"
                      required={required}
                      value={form[key as keyof typeof form]}
                      onChange={e => setF(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
                <button type="button" className="btn-ghost" onClick={() => setModal(false)}>{t('finance.modal.cancel')}</button>
                <button type="submit" className="btn-gold" disabled={saving}>
                  {saving ? t('finance.modal.saving') : t('finance.modal.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
