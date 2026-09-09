import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays } from 'lucide-react'
import { reportsApi } from '../api/client'
import type { DailySummary, StockReport } from '../types'

function fmt(n: number, locale = 'tr-TR') {
  return '₺' + n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Reports() {
  const { t, i18n } = useTranslation()
  const priceLocale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'tr-TR'
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [stockReport, setStockReport] = useState<StockReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [stockLoading, setStockLoading] = useState(true)

  const loadSummary = async () => {
    setLoading(true)
    await reportsApi.getDaily(date).then(r => setSummary(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSummary()
    reportsApi.getStock().then(r => setStockReport(r.data)).finally(() => setStockLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="page-title gold-text">{t('reports.pageTitle')}</h1>

      {/* Daily Summary */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold" style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>{t('reports.dailySummary')}</h2>
          <div className="flex items-center gap-2">
            <CalendarDays size={14} style={{ color: '#D4AF37' }} />
            <input className="input" style={{ width: 160 }} type="date" value={date} onChange={e => setDate(e.target.value)} />
            <button className="btn-outline px-3 py-1.5 text-sm" onClick={loadSummary} disabled={loading}>{loading ? '...' : t('reports.fetch')}</button>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t('reports.cards.salesCount'), value: summary.salesCount.toString(), sub: `${summary.salesWeightGram.toFixed(2)}gr`, color: '#22C55E' },
              { label: t('reports.cards.salesRevenue'), value: fmt(summary.salesRevenueTRY, priceLocale), color: '#22C55E' },
              { label: t('reports.cards.purchasesCount'), value: summary.purchasesCount.toString(), sub: `${summary.purchasesWeightGram.toFixed(2)}gr`, color: '#3B82F6' },
              { label: t('reports.cards.purchasesCost'), value: fmt(summary.purchasesCostTRY, priceLocale), color: '#3B82F6' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                <div className="text-xs mb-2" style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
                <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                {s.sub && <div className="text-xs mt-1" style={{ color: '#888' }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        )}

        {summary && (
          <div className="mt-4 rounded-xl p-4 flex items-center justify-between" style={{ background: summary.netRevenueTRY >= 0 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${summary.netRevenueTRY >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <span className="text-sm font-medium" style={{ color: '#888' }}>{t('reports.netProfitLoss')}</span>
            <span className="text-2xl font-bold" style={{ color: summary.netRevenueTRY >= 0 ? '#22C55E' : '#EF4444' }}>{fmt(summary.netRevenueTRY, priceLocale)}</span>
          </div>
        )}
      </div>

      {/* Stock Report */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            {t('reports.stockReport')} {stockReport && <span style={{ color: '#888' }}>— {stockReport.totalProducts} {t('reports.productsSuffix')}</span>}
          </h2>
          {stockReport && (
            <div className="text-right">
              <div className="text-xs" style={{ color: '#888' }}>{t('reports.totalValue')}</div>
              <div className="font-bold gold-text">{fmt(stockReport.totalEstimatedValueTRY, priceLocale)}</div>
            </div>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {[t('reports.columns.product'), t('reports.columns.category'), t('reports.columns.purity'), t('reports.columns.weight'), t('reports.columns.stock'), t('reports.columns.totalWeight'), t('reports.columns.estimatedValue')].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stockLoading ? <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('reports.loading')}</td></tr>
            : !stockReport?.items?.length ? <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('reports.noStockData')}</td></tr>
            : stockReport.items.map((item, i) => (
              <tr key={i} className="table-row">
                <td className="px-4 py-3 font-medium text-white">{item.productName}</td>
                <td className="px-4 py-3" style={{ color: '#888' }}>{item.categoryName}</td>
                <td className="px-4 py-3"><span className="badge-gold">{item.purity}</span></td>
                <td className="px-4 py-3" style={{ color: '#888' }}>{item.weightGram.toFixed(3)}gr</td>
                <td className="px-4 py-3 font-medium text-white">{item.stockQuantity.toFixed(2)}</td>
                <td className="px-4 py-3" style={{ color: '#888' }}>{item.totalWeightGram.toFixed(3)}gr</td>
                <td className="px-4 py-3 font-semibold" style={{ color: '#D4AF37' }}>{fmt(item.estimatedValueTRY, priceLocale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
