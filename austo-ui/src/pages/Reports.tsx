import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { reportsApi } from '../api/client'
import type { DailySummary, StockReport } from '../types'

function fmt(n: number) {
  return '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Reports() {
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
      <h1 className="page-title gold-text">Raporlar</h1>

      {/* Daily Summary */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold" style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>Günlük Özet</h2>
          <div className="flex items-center gap-2">
            <CalendarDays size={14} style={{ color: '#D4AF37' }} />
            <input className="input" style={{ width: 160 }} type="date" value={date} onChange={e => setDate(e.target.value)} />
            <button className="btn-outline px-3 py-1.5 text-sm" onClick={loadSummary} disabled={loading}>{loading ? '...' : 'Getir'}</button>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Satış Adedi', value: summary.salesCount.toString(), sub: `${summary.salesWeightGram.toFixed(2)}gr`, color: '#22C55E' },
              { label: 'Satış Geliri', value: fmt(summary.salesRevenueTRY), color: '#22C55E' },
              { label: 'Alış Adedi', value: summary.purchasesCount.toString(), sub: `${summary.purchasesWeightGram.toFixed(2)}gr`, color: '#3B82F6' },
              { label: 'Alış Maliyeti', value: fmt(summary.purchasesCostTRY), color: '#3B82F6' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                <div className="text-xs mb-2" style={{ color: '#555', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
                <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                {s.sub && <div className="text-xs mt-1" style={{ color: '#555' }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        )}

        {summary && (
          <div className="mt-4 rounded-xl p-4 flex items-center justify-between" style={{ background: summary.netRevenueTRY >= 0 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${summary.netRevenueTRY >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <span className="text-sm font-medium" style={{ color: '#888' }}>Net Kar / Zarar</span>
            <span className="text-2xl font-bold" style={{ color: summary.netRevenueTRY >= 0 ? '#22C55E' : '#EF4444' }}>{fmt(summary.netRevenueTRY)}</span>
          </div>
        )}
      </div>

      {/* Stock Report */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Stok Raporu {stockReport && <span style={{ color: '#555' }}>— {stockReport.totalProducts} ürün</span>}
          </h2>
          {stockReport && (
            <div className="text-right">
              <div className="text-xs" style={{ color: '#555' }}>Toplam Değer</div>
              <div className="font-bold gold-text">{fmt(stockReport.totalEstimatedValueTRY)}</div>
            </div>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {['Ürün', 'Kategori', 'Ayar', 'Ağırlık', 'Stok', 'Toplam Ağırlık', 'Tahmini Değer'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stockLoading ? <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: '#555' }}>Yükleniyor...</td></tr>
            : !stockReport?.items?.length ? <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: '#555' }}>Stok verisi yok.</td></tr>
            : stockReport.items.map((item, i) => (
              <tr key={i} className="table-row">
                <td className="px-4 py-3 font-medium text-white">{item.productName}</td>
                <td className="px-4 py-3" style={{ color: '#888' }}>{item.categoryName}</td>
                <td className="px-4 py-3"><span className="badge-gold">{item.purity}</span></td>
                <td className="px-4 py-3" style={{ color: '#888' }}>{item.weightGram.toFixed(3)}gr</td>
                <td className="px-4 py-3 font-medium text-white">{item.stockQuantity.toFixed(2)}</td>
                <td className="px-4 py-3" style={{ color: '#888' }}>{item.totalWeightGram.toFixed(3)}gr</td>
                <td className="px-4 py-3 font-semibold" style={{ color: '#D4AF37' }}>{fmt(item.estimatedValueTRY)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
