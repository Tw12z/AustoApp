import { useEffect, useRef, useState } from 'react'
import { ArrowLeftRight, QrCode, X, Plus, Minus, Search } from 'lucide-react'
import { stockApi, productsApi, locationsApi } from '../api/client'
import type { StockMovement, StockValuation, Product, Location } from '../types'
import { STOCK_MOVEMENT_TYPES } from '../types'

function Modal({ open, onClose, children, title, maxWidth = 440 }: any) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth }} onClick={e => e.stopPropagation()}>
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

// ── QR Stok Modalı ────────────────────────────────────────
function QRStockModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [scanInput, setScanInput]   = useState('')
  const [found, setFound]           = useState<Product | null>(null)
  const [qty, setQty]               = useState(1)
  const [direction, setDirection]   = useState<'In' | 'Out'>('In')
  const [notes, setNotes]           = useState('')
  const [searching, setSearching]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setScanInput(''); setFound(null); setQty(1)
      setDirection('In'); setNotes(''); setError(''); setSuccess(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleScan = async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) return
    setSearching(true); setError(''); setFound(null)
    try {
      const res = await productsApi.getByBarcode(trimmed)
      setFound(res.data)
      setQty(1)
    } catch {
      setError('Ürün bulunamadı. Kodu kontrol edin.')
    } finally { setSearching(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleScan(scanInput) }
  }

  const handleSave = async () => {
    if (!found) return
    setSaving(true); setError('')
    try {
      await stockApi.adjust({ productId: found.id, quantity: qty, direction, notes: notes || null })
      setSuccess(true)
      setTimeout(() => {
        setFound(null); setScanInput(''); setQty(1); setNotes(''); setSuccess(false)
        onDone()
        inputRef.current?.focus()
      }, 1200)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'İşlem başarısız.')
    } finally { setSaving(false) }
  }

  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <div className="flex items-center gap-2">
            <QrCode size={16} style={{ color: '#D4AF37' }} />
            <h2 className="text-base font-semibold text-white">QR Stok Güncelle</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Scan input */}
          <div>
            <label className="label">QR / Barkod Okut veya Yaz</label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#555' }} />
                <input
                  ref={inputRef}
                  className="input pl-9"
                  placeholder="USB okuyucuyla okut veya kodu yaz + Enter"
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button
                type="button"
                className="btn-outline px-4"
                onClick={() => handleScan(scanInput)}
                disabled={searching}
              >
                {searching ? '...' : 'Ara'}
              </button>
            </div>
            <p className="text-xs mt-1.5" style={{ color: '#444' }}>
              USB barkod okuyucu otomatik Enter gönderir — direkt okutabilirsiniz
            </p>
          </div>

          {/* Hata */}
          {error && (
            <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* Başarı */}
          {success && (
            <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
              Stok güncellendi! Yeni okutma yapabilirsiniz.
            </div>
          )}

          {/* Ürün bilgisi */}
          {found && (
            <div className="rounded-xl p-4 space-y-4" style={{ background: '#0A0A0A', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{found.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#888' }}>
                    {PURITY_LABELS[found.purity]} · {found.weightGram}gr
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold" style={{ color: '#D4AF37' }}>
                    Stok: {found.stockQuantity} adet
                  </div>
                </div>
              </div>

              {/* Giriş / Çıkış */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('In')}
                  className="py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: direction === 'In' ? 'rgba(34,197,94,0.15)' : '#111',
                    border: `1px solid ${direction === 'In' ? 'rgba(34,197,94,0.4)' : '#222'}`,
                    color: direction === 'In' ? '#22C55E' : '#555',
                  }}
                >
                  <Plus size={14} /> Stok Girişi
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('Out')}
                  className="py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: direction === 'Out' ? 'rgba(239,68,68,0.12)' : '#111',
                    border: `1px solid ${direction === 'Out' ? 'rgba(239,68,68,0.35)' : '#222'}`,
                    color: direction === 'Out' ? '#EF4444' : '#555',
                  }}
                >
                  <Minus size={14} /> Stok Çıkışı
                </button>
              </div>

              {/* Miktar */}
              <div>
                <label className="label">Miktar</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
                  >
                    <Minus size={13} style={{ color: '#888' }} />
                  </button>
                  <input
                    className="input text-center font-bold"
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={qty}
                    onChange={e => setQty(Math.max(0.001, +e.target.value))}
                    style={{ width: 100 }}
                  />
                  <button
                    type="button"
                    onClick={() => setQty(q => q + 1)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
                  >
                    <Plus size={13} style={{ color: '#888' }} />
                  </button>
                </div>
              </div>

              {/* Notlar */}
              <div>
                <label className="label">Notlar (Opsiyonel)</label>
                <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Açıklama" />
              </div>
            </div>
          )}
        </div>

        {found && (
          <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
            <button type="button" className="btn-ghost" onClick={() => setFound(null)}>Temizle</button>
            <button
              type="button"
              className="btn-gold"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : `${direction === 'In' ? '+' : '-'}${qty} Adet Kaydet`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Ana Sayfa ─────────────────────────────────────────────
export default function Stock() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [valuation, setValuation] = useState<StockValuation | null>(null)
  const [products, setProducts]   = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [modal, setModal]         = useState<'transfer' | 'qr' | null>(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
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
    try { await stockApi.transfer(form); setModal(null); load() }
    finally { setSaving(false) }
  }

  const typeColor: Record<number, string> = { 1:'badge-green', 2:'badge-red', 3:'badge-gold', 4:'badge-gray', 5:'badge-red' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title gold-text">Stok</h1>
        <div className="flex items-center gap-2">
          <button className="btn-outline flex items-center gap-2" onClick={() => setModal('qr')}>
            <QrCode size={15} /> QR Güncelle
          </button>
          <button className="btn-gold flex items-center gap-2" onClick={() => setModal('transfer')}>
            <ArrowLeftRight size={16} /> Transfer
          </button>
        </div>
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

      {/* QR Modal */}
      <QRStockModal
        open={modal === 'qr'}
        onClose={() => setModal(null)}
        onDone={load}
      />

      {/* Transfer Modal */}
      <Modal open={modal === 'transfer'} onClose={() => setModal(null)} title="Stok Transferi">
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
            <button type="button" className="btn-ghost" onClick={() => setModal(null)}>İptal</button>
            <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Transfer ediliyor...' : 'Transferi Yap'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
