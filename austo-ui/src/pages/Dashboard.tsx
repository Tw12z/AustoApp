import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, ShoppingCart, ShoppingBag, Scale } from 'lucide-react'
import { reportsApi, financeApi, stockApi } from '../api/client'
import type { DailySummary, FinanceItem, StockValuation } from '../types'

function StatCard({ label, value, sub, icon: Icon, color = '#D4AF37', trend }: {
  label: string; value: string; sub?: string; icon: any; color?: string; trend?: number
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className={trend >= 0 ? 'badge-green' : 'badge-red'} style={{ display:'flex', alignItems:'center', gap:3 }}>
            {trend >= 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm font-medium" style={{ color: '#888' }}>{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: '#555' }}>{sub}</div>}
    </div>
  )
}

function GoldTicker({ items }: { items: FinanceItem[] }) {
  const gold = items.filter(i => ['GRAM ALTIN','ÇEYREK ALTIN','YARIM ALTIN','TAM ALTIN'].includes(i.code))
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#888', textTransform:'uppercase', letterSpacing:'.05em' }}>Canlı Altın Fiyatları</h3>
      <div className="grid grid-cols-2 gap-3">
        {gold.map(item => (
          <div key={item.code} className="rounded-lg p-3" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
            <div className="text-xs mb-1" style={{ color: '#555' }}>{item.code}</div>
            <div className="font-bold text-white">₺{item.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
            <div className="text-xs" style={{ color: item.changeRate.includes('-') ? '#EF4444' : '#22C55E' }}>{item.changeRate}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function fmt(n: number) {
  return '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [rates, setRates] = useState<FinanceItem[]>([])
  const [valuation, setValuation] = useState<StockValuation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      reportsApi.getDaily().then(r => setSummary(r.data)),
      financeApi.getLiveRates().then(r => setRates(r.data)),
      stockApi.getValuation().then(r => setValuation(r.data)),
    ]).finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title gold-text mb-1">Dashboard</h1>
          <p className="text-sm" style={{ color: '#555' }}>{today}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Bugünkü Satış"
          value={loading ? '—' : fmt(summary?.salesRevenueTRY ?? 0)}
          sub={`${summary?.salesCount ?? 0} işlem · ${(summary?.salesWeightGram ?? 0).toFixed(2)}gr`}
          icon={ShoppingCart}
          color="#22C55E"
        />
        <StatCard
          label="Bugünkü Alış"
          value={loading ? '—' : fmt(summary?.purchasesCostTRY ?? 0)}
          sub={`${summary?.purchasesCount ?? 0} işlem · ${(summary?.purchasesWeightGram ?? 0).toFixed(2)}gr`}
          icon={ShoppingBag}
          color="#3B82F6"
        />
        <StatCard
          label="Net Kar"
          value={loading ? '—' : fmt(summary?.netRevenueTRY ?? 0)}
          sub="Bugün"
          icon={TrendingUp}
          color={!summary || summary.netRevenueTRY >= 0 ? '#22C55E' : '#EF4444'}
        />
        <StatCard
          label="Stok Değeri"
          value={loading ? '—' : fmt(valuation?.totalEstimatedValueTRY ?? 0)}
          sub={`${(valuation?.totalWeightGram ?? 0).toFixed(2)}gr toplam ağırlık`}
          icon={Scale}
          color="#D4AF37"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gold ticker */}
        <div className="lg:col-span-1">
          {loading ? (
            <div className="card p-5"><div className="shimmer h-40 rounded" /></div>
          ) : (
            <GoldTicker items={rates} />
          )}
        </div>

        {/* Stok by purity */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>Ayara Göre Stok</h3>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="shimmer h-10 rounded" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {(valuation?.byPurity ?? []).map(b => {
                  const pct = valuation ? (b.estimatedValueTRY / valuation.totalEstimatedValueTRY) * 100 : 0
                  const purityLabels: Record<number,string> = { 0:'Diğer',8:'8 Ayar',14:'14 Ayar',18:'18 Ayar',21:'21 Ayar',22:'22 Ayar',24:'24 Ayar (Has)' }
                  return (
                    <div key={b.purity}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">{purityLabels[b.purity] ?? `${b.purity}k`}</span>
                        <span className="text-sm" style={{ color: '#888' }}>{b.totalWeightGram.toFixed(2)}gr · {fmt(b.estimatedValueTRY)}</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: '#1A1A1A' }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#B8960C,#D4AF37)' }} />
                      </div>
                    </div>
                  )
                })}
                {!valuation?.byPurity?.length && <p className="text-sm" style={{ color: '#555' }}>Stok verisi yok.</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>Döviz Kurları</h3>
        <div className="grid grid-cols-3 gap-3">
          {rates.filter(r => ['USD','EUR','GBP'].includes(r.code)).map(r => (
            <div key={r.code} className="text-center rounded-lg py-3 px-4" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
              <div className="text-xs mb-1" style={{ color: '#555' }}>{r.code} / TRY</div>
              <div className="font-bold text-white">₺{r.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
              <div className="text-xs mt-0.5" style={{ color: r.changeRate.includes('-') ? '#EF4444' : '#22C55E' }}>{r.changeRate}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
