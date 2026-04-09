import { useEffect, useState } from 'react'
import { RefreshCw, Plus, X } from 'lucide-react'
import { financeApi } from '../api/client'
import type { FinanceItem, GoldPriceLog } from '../types'

const gold_codes = ['GRAM ALTIN', 'ÇEYREK ALTIN', 'YARIM ALTIN', 'TAM ALTIN', 'CUMHURİYET', 'ATA LİRA']

function RateCard({ item }: { item: FinanceItem }) {
  const isUp = !item.changeRate.includes('-')
  return (
    <div className="stat-card">
      <div className="text-xs mb-2" style={{ color: '#555', textTransform: 'uppercase', letterSpacing: '.05em' }}>{item.code}</div>
      <div className="text-xl font-bold text-white mb-1">₺{item.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: '#888' }}>Alış: ₺{item.buyingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
        <span className={`text-xs font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>{item.changeRate}</span>
      </div>
    </div>
  )
}

export default function Finance() {
  const [rates, setRates] = useState<FinanceItem[]>([])
  const [history, setHistory] = useState<GoldPriceLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ gramGoldBuyTRY: 0, gramGoldSellTRY: 0, gramK14BuyTRY: '', gramK14SellTRY: '', gramK18BuyTRY: '', gramK18SellTRY: '', gramK22BuyTRY: '', gramK22SellTRY: '' })

  const load = async () => {
    await Promise.all([
      financeApi.getLiveRates().then(r => setRates(r.data)),
      financeApi.getGoldHistory(14).then(r => setHistory(r.data)),
    ])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = {
        gramGoldBuyTRY: +form.gramGoldBuyTRY, gramGoldSellTRY: +form.gramGoldSellTRY,
        gramK14BuyTRY: form.gramK14BuyTRY ? +form.gramK14BuyTRY : null,
        gramK14SellTRY: form.gramK14SellTRY ? +form.gramK14SellTRY : null,
        gramK18BuyTRY: form.gramK18BuyTRY ? +form.gramK18BuyTRY : null,
        gramK18SellTRY: form.gramK18SellTRY ? +form.gramK18SellTRY : null,
        gramK22BuyTRY: form.gramK22BuyTRY ? +form.gramK22BuyTRY : null,
        gramK22SellTRY: form.gramK22SellTRY ? +form.gramK22SellTRY : null,
      }
      await financeApi.logGoldPrice(payload)
      setModal(false); load()
    } finally { setSaving(false) }
  }

  const goldRates = rates.filter(r => gold_codes.includes(r.code))
  const currencyRates = rates.filter(r => ['USD', 'EUR', 'GBP'].includes(r.code))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title gold-text">Finans</h1>
        <div className="flex gap-2">
          <button className="btn-ghost flex items-center gap-2" onClick={refresh} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Güncelle
          </button>
          <button className="btn-gold flex items-center gap-2" onClick={() => setModal(true)}>
            <Plus size={16} /> Manuel Fiyat Gir
          </button>
        </div>
      </div>

      {/* Gold rates */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>Altın Fiyatları (Canlı)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {loading ? [1,2,3,4,5,6].map(i => <div key={i} className="stat-card shimmer h-24" />) : goldRates.map(r => <RateCard key={r.code} item={r} />)}
        </div>
      </div>

      {/* Currency */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>Döviz Kurları</h2>
        <div className="grid grid-cols-3 gap-4">
          {loading ? [1,2,3].map(i => <div key={i} className="stat-card shimmer h-20" />) : currencyRates.map(r => <RateCard key={r.code} item={r} />)}
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>Manuel Fiyat Geçmişi (Son 14 Gün)</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                {['Tarih', 'Has Alış', 'Has Satış', '14 Ayar Al/Sat', '18 Ayar Al/Sat', '22 Ayar Al/Sat', 'Kaynak'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: '#555' }}>Fiyat kaydı yok.</td></tr>
              : history.map(h => (
                <tr key={h.id} className="table-row">
                  <td className="px-4 py-3 text-white">{new Date(h.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>₺{h.gramGoldBuyTRY.toLocaleString('tr-TR')}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>₺{h.gramGoldSellTRY.toLocaleString('tr-TR')}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{h.gramK14BuyTRY ? `₺${h.gramK14BuyTRY} / ₺${h.gramK14SellTRY}` : '—'}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{h.gramK18BuyTRY ? `₺${h.gramK18BuyTRY} / ₺${h.gramK18SellTRY}` : '—'}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{h.gramK22BuyTRY ? `₺${h.gramK22BuyTRY} / ₺${h.gramK22SellTRY}` : '—'}</td>
                  <td className="px-4 py-3"><span className="badge-gray">{h.source}</span></td>
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
              <h2 className="text-base font-semibold text-white">Manuel Altın Fiyatı Gir</h2>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleLog}>
              <div className="px-6 py-5 grid grid-cols-2 gap-4">
                <div><label className="label">Has Altın Alış (₺)</label><input className="input" type="number" step="0.01" value={form.gramGoldBuyTRY} onChange={e => setForm(f => ({ ...f, gramGoldBuyTRY: +e.target.value }))} required /></div>
                <div><label className="label">Has Altın Satış (₺)</label><input className="input" type="number" step="0.01" value={form.gramGoldSellTRY} onChange={e => setForm(f => ({ ...f, gramGoldSellTRY: +e.target.value }))} required /></div>
                <div><label className="label">14 Ayar Alış</label><input className="input" type="number" step="0.01" value={form.gramK14BuyTRY} onChange={e => setForm(f => ({ ...f, gramK14BuyTRY: e.target.value }))} /></div>
                <div><label className="label">14 Ayar Satış</label><input className="input" type="number" step="0.01" value={form.gramK14SellTRY} onChange={e => setForm(f => ({ ...f, gramK14SellTRY: e.target.value }))} /></div>
                <div><label className="label">18 Ayar Alış</label><input className="input" type="number" step="0.01" value={form.gramK18BuyTRY} onChange={e => setForm(f => ({ ...f, gramK18BuyTRY: e.target.value }))} /></div>
                <div><label className="label">18 Ayar Satış</label><input className="input" type="number" step="0.01" value={form.gramK18SellTRY} onChange={e => setForm(f => ({ ...f, gramK18SellTRY: e.target.value }))} /></div>
                <div><label className="label">22 Ayar Alış</label><input className="input" type="number" step="0.01" value={form.gramK22BuyTRY} onChange={e => setForm(f => ({ ...f, gramK22BuyTRY: e.target.value }))} /></div>
                <div><label className="label">22 Ayar Satış</label><input className="input" type="number" step="0.01" value={form.gramK22SellTRY} onChange={e => setForm(f => ({ ...f, gramK22SellTRY: e.target.value }))} /></div>
              </div>
              <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
                <button type="button" className="btn-ghost" onClick={() => setModal(false)}>İptal</button>
                <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
