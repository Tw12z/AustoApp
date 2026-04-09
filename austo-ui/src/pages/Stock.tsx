import { useEffect, useState } from 'react'
import { ArrowLeftRight, X } from 'lucide-react'
import { stockApi, productsApi, locationsApi } from '../api/client'
import type { StockMovement, StockValuation, Product, Location } from '../types'
import { STOCK_MOVEMENT_TYPES } from '../types'

function Modal({ open, onClose, children, title }: any) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

const PURITY_LABELS: Record<number, string> = { 0:'Diğer',8:'8 Ayar',14:'14 Ayar',18:'18 Ayar',21:'21 Ayar',22:'22 Ayar',24:'24 Ayar (Has)' }

export default function Stock() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [valuation, setValuation] = useState<StockValuation | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ productId: '', fromLocationId: '', toLocationId: '', quantity: 1, notes: '' })

  const load = () => Promise.all([
    stockApi.getMovements().then(r => setMovements(r.data)),
    stockApi.getValuation().then(r => setValuation(r.data)),
  ]).finally(() => setLoading(false))

  useEffect(() => {
    load()
    productsApi.getAll().then(r => setProducts(r.data))
    locationsApi.getAll().then(r => setLocations(r.data))
  }, [])

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.type === 'number' ? +e.target.value : e.target.value }))

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try { await stockApi.transfer(form); setModal(false); load() }
    finally { setSaving(false) }
  }

  const typeColor: Record<number, string> = { 1:'badge-green', 2:'badge-red', 3:'badge-gold', 4:'badge-gray', 5:'badge-red' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title gold-text">Stok</h1>
        <button className="btn-gold flex items-center gap-2" onClick={() => setModal(true)}>
          <ArrowLeftRight size={16} /> Transfer
        </button>
      </div>

      {/* Valuation */}
      {valuation && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>Stok Değerleme</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg p-3" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
              <div className="text-xs mb-1" style={{ color: '#555' }}>Toplam Ağırlık</div>
              <div className="font-bold text-white">{valuation.totalWeightGram.toFixed(3)}gr</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: '#0A0A0A', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div className="text-xs mb-1" style={{ color: '#555' }}>Tahmini Değer</div>
              <div className="font-bold gold-text">₺{valuation.totalEstimatedValueTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {valuation.byPurity.map(b => (
              <div key={b.purity} className="rounded-lg p-3 text-center" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                <div className="badge-gold mb-1" style={{ display: 'inline-block' }}>{PURITY_LABELS[b.purity]}</div>
                <div className="text-sm font-semibold text-white mt-1">{b.totalWeightGram.toFixed(2)}gr</div>
                <div className="text-xs" style={{ color: '#555' }}>{b.totalPiecesCount.toFixed(0)} adet</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movements */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>Stok Hareketleri</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {['Tarih', 'Ürün', 'Tür', 'Miktar', 'Konum', 'Açıklama'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#555' }}>Yükleniyor...</td></tr>
            : movements.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#555' }}>Hareket yok.</td></tr>
            : movements.map(m => (
              <tr key={m.id} className="table-row">
                <td className="px-4 py-3" style={{ color: '#888' }}>{new Date(m.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-3 font-medium text-white">{m.productName}</td>
                <td className="px-4 py-3"><span className={typeColor[m.type] ?? 'badge-gray'}>{STOCK_MOVEMENT_TYPES[m.type]}</span></td>
                <td className="px-4 py-3 font-medium text-white">{m.quantity.toFixed(3)}</td>
                <td className="px-4 py-3" style={{ color: '#888' }}>
                  {m.locationName ?? '—'}
                  {m.toLocationName && <span> → {m.toLocationName}</span>}
                </td>
                <td className="px-4 py-3" style={{ color: '#888' }}>{m.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transfer modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Stok Transferi">
        <form onSubmit={handleTransfer}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="label">Ürün</label>
              <select className="select" value={form.productId} onChange={set('productId')} required>
                <option value="">Seçin</option>
                {products.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Kaynak Konum</label>
                <select className="select" value={form.fromLocationId} onChange={set('fromLocationId')} required>
                  <option value="">Seçin</option>
                  {locations.filter(l => l.isActive).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Hedef Konum</label>
                <select className="select" value={form.toLocationId} onChange={set('toLocationId')} required>
                  <option value="">Seçin</option>
                  {locations.filter(l => l.isActive && l.id !== form.fromLocationId).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Miktar (Adet)</label>
              <input className="input" type="number" step="0.001" min="0.001" value={form.quantity} onChange={set('quantity')} required />
            </div>
            <div>
              <label className="label">Notlar</label>
              <input className="input" value={form.notes} onChange={set('notes')} placeholder="Opsiyonel" />
            </div>
          </div>
          <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
            <button type="button" className="btn-ghost" onClick={() => setModal(false)}>İptal</button>
            <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Transfer ediliyor...' : 'Transferi Yap'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
