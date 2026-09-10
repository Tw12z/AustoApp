import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, QrCode, X, Plus, Minus, Search, Package, Printer, AlertTriangle } from 'lucide-react'
import { stockApi, stockItemsApi, productsApi, locationsApi } from '../api/client'
import type { StockMovement, StockValuation, StockItem, Product, Location } from '../types'
import { useEnumLabels } from '../hooks/useEnumLabels'

function Modal({ open, onClose, children, title, maxWidth = 440 }: any) {
  const { t } = useTranslation()
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} aria-label={t('common.close')} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Stok Girişi Modalı (Toplu Parça Oluşturma) ────────────────────────────
function StockEntryModal({ open, onClose, onDone, products, locations }: {
  open: boolean; onClose: () => void; onDone: () => void
  products: Product[]; locations: Location[]
}) {
  const { t } = useTranslation()
  const { purityLabels } = useEnumLabels()
  const [productId, setProductId]   = useState('')
  const [count, setCount]           = useState(1)
  const [locationId, setLocationId] = useState('')
  const [notes, setNotes]           = useState('')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [created, setCreated]       = useState<StockItem[]>([])
  const [printMode, setPrintMode]   = useState(false)
  const [qrImages, setQrImages]     = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setProductId(''); setCount(1); setLocationId('')
      setNotes(''); setError(''); setCreated([]); setPrintMode(false); setQrImages({})
    }
  }, [open])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await stockItemsApi.createBatch({
        productId, count, locationId: locationId || null, purchaseTransactionId: null, notes: notes || null,
      })
      setCreated(res.data)
      onDone()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t('stock.entryModal.createFailed'))
    } finally { setSaving(false) }
  }

  const loadQRs = async () => {
    setPrintMode(true)
    const imgs: Record<string, string> = {}
    for (const item of created) {
      try {
        const res = await stockItemsApi.qr(item.id)
        const url = URL.createObjectURL(res.data)
        imgs[item.id] = url
      } catch { /* skip */ }
    }
    setQrImages(imgs)
  }

  const handlePrint = () => window.print()

  if (!open) return null
  return (
    <div className="modal-overlay" onClick={!printMode ? onClose : undefined}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <div className="flex items-center gap-2">
            <Package size={16} style={{ color: '#D4AF37' }} />
            <h2 className="text-base font-semibold text-white">{t('stock.entryModal.title')}</h2>
          </div>
          <button onClick={onClose} aria-label={t('common.close')} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        {created.length === 0 ? (
          <form onSubmit={handleCreate}>
            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background:'rgba(239,68,68,0.1)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}
              <div>
                <label className="label">{t('stock.entryModal.product')}</label>
                <select className="select" value={productId} onChange={e => setProductId(e.target.value)} required>
                  <option value="">{t('stock.entryModal.select')}</option>
                  {products.filter(p => p.isActive).map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {purityLabels[p.purity]} · {p.weightGram}gr</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('stock.entryModal.count')}</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setCount(c => Math.max(1, c-1))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background:'#1A1A1A', border:'1px solid #2A2A2A' }}>
                      <Minus size={13} style={{ color:'#888' }} />
                    </button>
                    <input className="input text-center font-bold" type="number" min="1" max="500"
                      value={count} onChange={e => setCount(Math.max(1, Math.min(500, +e.target.value)))}
                      style={{ width: 80 }} />
                    <button type="button" onClick={() => setCount(c => Math.min(500, c+1))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background:'#1A1A1A', border:'1px solid #2A2A2A' }}>
                      <Plus size={13} style={{ color:'#888' }} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">{t('stock.entryModal.location')}</label>
                  <select className="select" value={locationId} onChange={e => setLocationId(e.target.value)}>
                    <option value="">{t('stock.entryModal.locationNotSelected')}</option>
                    {locations.filter(l => l.isActive).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">{t('stock.entryModal.notes')}</label>
                <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('stock.entryModal.notesPlaceholder')} />
              </div>
            </div>
            <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop:'1px solid #1A1A1A' }}>
              <button type="button" className="btn-ghost" onClick={onClose}>{t('stock.entryModal.cancel')}</button>
              <button type="submit" className="btn-gold" disabled={saving}>
                {saving ? t('stock.entryModal.creating') : t('stock.entryModal.createPieces', { count })}
              </button>
            </div>
          </form>
        ) : (
          /* Başarı + Etiket Yazdırma */
          <div className="px-6 py-5 space-y-4">
            <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background:'rgba(34,197,94,0.1)', color:'#22C55E', border:'1px solid rgba(34,197,94,0.2)' }}>
              {t('stock.entryModal.piecesCreated', { count: created.length })} <span className="font-bold">{created[0]?.itemCode}</span>
              {created.length > 1 && <> — <span className="font-bold">{created[created.length-1]?.itemCode}</span></>}
            </div>

            {!printMode ? (
              <div className="rounded-xl overflow-hidden" style={{ border:'1px solid #1A1A1A' }}>
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom:'1px solid #1A1A1A' }}>
                      <th className="text-left px-4 py-2 font-medium" style={{ color:'#888', fontSize:11 }}>{t('stock.entryModal.columns.code')}</th>
                      <th className="text-left px-4 py-2 font-medium" style={{ color:'#888', fontSize:11 }}>{t('stock.entryModal.columns.product')}</th>
                      <th className="text-left px-4 py-2 font-medium" style={{ color:'#888', fontSize:11 }}>{t('stock.entryModal.columns.location')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {created.map(item => (
                      <tr key={item.id} className="table-row">
                        <td className="px-4 py-2 font-mono font-bold" style={{ color:'#D4AF37' }}>{item.itemCode}</td>
                        <td className="px-4 py-2 text-white">{item.productName}</td>
                        <td className="px-4 py-2" style={{ color:'#888' }}>{item.locationName ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            ) : (
              /* Print önizleme */
              <div>
                <div className="text-xs mb-3" style={{ color:'#888' }}>{t('stock.entryModal.printPreviewHint')}</div>
                <div className="grid grid-cols-3 gap-2" id="print-labels">
                  {created.map(item => (
                    <div key={item.id} className="print-label rounded-lg p-2 text-center"
                      style={{ background:'#fff', border:'1px solid #ddd' }}>
                      {qrImages[item.id]
                        ? <img src={qrImages[item.id]} alt={item.itemCode} style={{ width:80, height:80, margin:'0 auto' }} />
                        : <div style={{ width:80, height:80, background:'#eee', margin:'0 auto' }} />
                      }
                      <div style={{ fontSize:9, fontWeight:700, color:'#000', marginTop:4 }}>{item.itemCode}</div>
                      <div style={{ fontSize:8, color:'#333' }}>{item.productName}</div>
                      <div style={{ fontSize:8, color:'#888' }}>{purityLabels[item.purity]} · {item.weightGram}gr</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" className="btn-ghost" onClick={onClose}>{t('stock.entryModal.close')}</button>
              {!printMode ? (
                <button type="button" className="btn-gold flex items-center gap-2" onClick={loadQRs}>
                  <Printer size={15} /> {t('stock.entryModal.printLabels')}
                </button>
              ) : (
                <button type="button" className="btn-gold flex items-center gap-2" onClick={handlePrint}>
                  <Printer size={15} /> {t('stock.entryModal.print')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── QR Tara Modalı (Item-Level) ───────────────────────────────────────────
function QRScanModal({ open, onClose, onDone, locations }: {
  open: boolean; onClose: () => void; onDone: () => void; locations: Location[]
}) {
  const { t } = useTranslation()
  const { purityLabels, stockItemStatus } = useEnumLabels()
  const [scanInput, setScanInput]     = useState('')
  const [found, setFound]             = useState<StockItem | null>(null)
  const [action, setAction]           = useState<'transfer' | 'damage' | null>(null)
  const [toLocationId, setToLocationId] = useState('')
  const [damageReason, setDamageReason] = useState('Damaged')
  const [notes, setNotes]             = useState('')
  const [searching, setSearching]     = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setScanInput(''); setFound(null); setAction(null)
      setToLocationId(''); setNotes(''); setError(''); setSuccess('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleScan = async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) return
    setSearching(true); setError(''); setFound(null); setAction(null); setSuccess('')
    try {
      const res = await stockItemsApi.getByCode(trimmed)
      setFound(res.data)
    } catch {
      setError(t('stock.scanModal.notFound'))
    } finally { setSearching(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleScan(scanInput) }
  }

  const handleTransfer = async () => {
    if (!found || !toLocationId) return
    setSaving(true); setError('')
    try {
      await stockItemsApi.transfer(found.id, { toLocationId, notes: notes || null })
      setSuccess(t('stock.scanModal.transferred', { code: found.itemCode }))
      onDone()
      setTimeout(() => { setFound(null); setScanInput(''); setAction(null); setSuccess(''); inputRef.current?.focus() }, 1400)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t('stock.scanModal.transferFailed'))
    } finally { setSaving(false) }
  }

  const handleDamage = async () => {
    if (!found) return
    setSaving(true); setError('')
    try {
      await stockItemsApi.damage(found.id, { reason: damageReason, notes: notes || null })
      setSuccess(damageReason === 'Lost'
        ? t('stock.scanModal.markedLost', { code: found.itemCode })
        : t('stock.scanModal.markedDamaged', { code: found.itemCode }))
      onDone()
      setTimeout(() => { setFound(null); setScanInput(''); setAction(null); setSuccess(''); inputRef.current?.focus() }, 1400)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t('stock.scanModal.actionFailed'))
    } finally { setSaving(false) }
  }

  const statusInfo = found ? stockItemStatus[found.status] : null

  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid #1A1A1A' }}>
          <div className="flex items-center gap-2">
            <QrCode size={16} style={{ color:'#D4AF37' }} />
            <h2 className="text-base font-semibold text-white">{t('stock.scanModal.title')}</h2>
          </div>
          <button onClick={onClose} aria-label={t('common.close')} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Scan input */}
          <div>
            <label className="label">{t('stock.scanModal.codeLabel')}</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'#888' }} />
                <input
                  ref={inputRef}
                  className="input pl-9"
                  placeholder={t('stock.scanModal.placeholder')}
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button type="button" className="btn-outline px-4" onClick={() => handleScan(scanInput)} disabled={searching}>
                {searching ? t('stock.scanModal.searching') : t('stock.scanModal.search')}
              </button>
            </div>
            <p className="text-xs mt-1.5" style={{ color:'#7D7D7D' }}>{t('stock.scanModal.hint')}</p>
          </div>

          {error && (
            <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background:'rgba(239,68,68,0.1)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background:'rgba(34,197,94,0.1)', color:'#22C55E', border:'1px solid rgba(34,197,94,0.2)' }}>
              {success}
            </div>
          )}

          {/* Parça Bilgisi */}
          {found && (
            <div className="rounded-xl p-4 space-y-4" style={{ background:'#0A0A0A', border:'1px solid rgba(212,175,55,0.2)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-sm font-bold mb-1" style={{ color:'#D4AF37' }}>{found.itemCode}</div>
                  <div className="font-semibold text-white">{found.productName}</div>
                  <div className="text-xs mt-0.5" style={{ color:'#888' }}>
                    {purityLabels[found.purity]} · {found.weightGram}gr
                    {found.locationName && <> · {found.locationName}</>}
                  </div>
                </div>
                {statusInfo && (
                  <span className={statusInfo.cls}>{statusInfo.label}</span>
                )}
              </div>

              {/* Sadece Available parça üzerinde işlem yapılabilir */}
              {found.status === 1 && !action && (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setAction('transfer')}
                    className="py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.3)', color:'#60A5FA' }}>
                    <ArrowLeftRight size={14} /> {t('stock.scanModal.transferAction')}
                  </button>
                  <button type="button" onClick={() => setAction('damage')}
                    className="py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:'#EF4444' }}>
                    <AlertTriangle size={14} /> {t('stock.scanModal.damageAction')}
                  </button>
                </div>
              )}

              {found.status !== 1 && (
                <div className="text-sm" style={{ color:'#888' }}>
                  {t('stock.scanModal.noActionAvailable')}
                </div>
              )}

              {/* Transfer formu */}
              {action === 'transfer' && (
                <div className="space-y-3 pt-2" style={{ borderTop:'1px solid #1A1A1A' }}>
                  <div>
                    <label className="label">{t('stock.scanModal.targetLocation')}</label>
                    <select className="select" value={toLocationId} onChange={e => setToLocationId(e.target.value)} required>
                      <option value="">{t('stock.entryModal.select')}</option>
                      {locations.filter(l => l.isActive && l.id !== found.locationId).map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">{t('stock.scanModal.notesOptional')}</label>
                    <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('stock.scanModal.transferNotePlaceholder')} />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-ghost" onClick={() => setAction(null)}>{t('stock.scanModal.back')}</button>
                    <button type="button" className="btn-gold flex-1" onClick={handleTransfer} disabled={saving || !toLocationId}>
                      {saving ? t('stock.scanModal.transferring') : t('stock.scanModal.confirmTransfer')}
                    </button>
                  </div>
                </div>
              )}

              {/* Hasar formu */}
              {action === 'damage' && (
                <div className="space-y-3 pt-2" style={{ borderTop:'1px solid #1A1A1A' }}>
                  <div>
                    <label className="label">{t('stock.scanModal.status')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Damaged', 'Lost'] as const).map(r => (
                        <button key={r} type="button" onClick={() => setDamageReason(r)}
                          className="py-2 rounded-lg text-sm font-semibold transition-all"
                          style={{
                            background: damageReason === r ? 'rgba(239,68,68,0.15)' : '#111',
                            border: `1px solid ${damageReason === r ? 'rgba(239,68,68,0.4)' : '#222'}`,
                            color: damageReason === r ? '#EF4444' : '#888',
                          }}>
                          {r === 'Damaged' ? t('stock.scanModal.damaged') : t('stock.scanModal.lost')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">{t('stock.scanModal.notesOptional')}</label>
                    <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('stock.scanModal.damageNotePlaceholder')} />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-ghost" onClick={() => setAction(null)}>{t('stock.scanModal.back')}</button>
                    <button type="button" className="btn-gold flex-1" onClick={handleDamage} disabled={saving}>
                      {saving ? t('stock.scanModal.saving') : t('stock.scanModal.confirm')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Ana Sayfa ─────────────────────────────────────────────────────────────
export default function Stock() {
  const { t, i18n } = useTranslation()
  const { purityLabels, stockMovementTypes } = useEnumLabels()
  const priceLocale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'tr-TR'
  const [movements, setMovements]   = useState<StockMovement[]>([])
  const [valuation, setValuation]   = useState<StockValuation | null>(null)
  const [products, setProducts]     = useState<Product[]>([])
  const [locations, setLocations]   = useState<Location[]>([])
  const [modal, setModal]           = useState<'entry' | 'scan' | 'transfer' | null>(null)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [form, setForm] = useState({ productId:'', fromLocationId:'', toLocationId:'', quantity:1, notes:'' })

  const load = () => Promise.all([
    stockApi.getMovements().then(r => setMovements(r.data)),
    stockApi.getValuation().then(r => setValuation(r.data)),
  ]).finally(() => setLoading(false))

  useEffect(() => {
    load()
    productsApi.getAll().then(r => setProducts(r.data))
    locationsApi.getAll().then(r => setLocations(r.data))
  }, [])

  const set = (k: string) => (e: any) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'number' ? +e.target.value : e.target.value }))

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try { await stockApi.transfer(form); setModal(null); load() }
    finally { setSaving(false) }
  }

  const typeColor: Record<number, string> = { 1:'badge-green', 2:'badge-red', 3:'badge-gold', 4:'badge-gray', 5:'badge-red' }

  return (
    <div className="space-y-6">
      {/* Print CSS — sadece yazdırırken etiketler görünür */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-labels { display: grid !important; }
          .print-label { page-break-inside: avoid; }
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title gold-text">{t('stock.pageTitle')}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-outline flex items-center gap-2" onClick={() => setModal('entry')}>
            <Package size={15} /> {t('stock.stockEntry')}
          </button>
          <button className="btn-outline flex items-center gap-2" onClick={() => setModal('scan')}>
            <QrCode size={15} /> {t('stock.qrScan')}
          </button>
          <button className="btn-gold flex items-center gap-2" onClick={() => setModal('transfer')}>
            <ArrowLeftRight size={16} /> {t('stock.transfer')}
          </button>
        </div>
      </div>

      {/* Valuation */}
      {valuation && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color:'#888', textTransform:'uppercase', letterSpacing:'.05em' }}>{t('stock.valuation.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg p-3" style={{ background:'#0A0A0A', border:'1px solid #1A1A1A' }}>
              <div className="text-xs mb-1" style={{ color:'#888' }}>{t('stock.valuation.totalWeight')}</div>
              <div className="font-bold text-white">{valuation.totalWeightGram.toFixed(3)}gr</div>
            </div>
            <div className="rounded-lg p-3" style={{ background:'#0A0A0A', border:'1px solid rgba(212,175,55,0.2)' }}>
              <div className="text-xs mb-1" style={{ color:'#888' }}>{t('stock.valuation.estimatedValue')}</div>
              <div className="font-bold gold-text">₺{valuation.totalEstimatedValueTRY.toLocaleString(priceLocale, { minimumFractionDigits:2 })}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {valuation.byPurity.map(b => (
              <div key={b.purity} className="rounded-lg p-3 text-center" style={{ background:'#0A0A0A', border:'1px solid #1A1A1A' }}>
                <div className="badge-gold mb-1" style={{ display:'inline-block' }}>{purityLabels[b.purity]}</div>
                <div className="text-sm font-semibold text-white mt-1">{b.totalWeightGram.toFixed(2)}gr</div>
                <div className="text-xs" style={{ color:'#888' }}>{b.totalPiecesCount.toFixed(0)} {t('stock.valuation.piecesSuffix')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movements */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom:'1px solid #1A1A1A' }}>
          <h2 className="text-sm font-semibold" style={{ color:'#888', textTransform:'uppercase', letterSpacing:'.05em' }}>{t('stock.movements.title')}</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom:'1px solid #1A1A1A' }}>
              {[t('stock.movements.columns.date'), t('stock.movements.columns.product'), t('stock.movements.columns.type'), t('stock.movements.columns.quantity'), t('stock.movements.columns.location'), t('stock.movements.columns.description')].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color:'#888', fontSize:11, textTransform:'uppercase', letterSpacing:'.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color:'#888' }}>{t('stock.movements.loading')}</td></tr>
              : movements.length === 0
                ? <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color:'#888' }}>{t('stock.movements.noResults')}</td></tr>
                : movements.map(m => (
                  <tr key={m.id} className="table-row">
                    <td className="px-4 py-3" style={{ color:'#888' }}>{new Date(m.createdAt).toLocaleDateString(priceLocale)}</td>
                    <td className="px-4 py-3 font-medium text-white">{m.productName}</td>
                    <td className="px-4 py-3"><span className={typeColor[m.type] ?? 'badge-gray'}>{stockMovementTypes[m.type]}</span></td>
                    <td className="px-4 py-3 font-medium text-white">{m.quantity.toFixed(3)}</td>
                    <td className="px-4 py-3" style={{ color:'#888' }}>
                      {m.locationName ?? '—'}
                      {m.toLocationName && <span> → {m.toLocationName}</span>}
                    </td>
                    <td className="px-4 py-3" style={{ color:'#888' }}>{m.description || '—'}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        </div>
      </div>

      {/* Modals */}
      <StockEntryModal
        open={modal === 'entry'}
        onClose={() => setModal(null)}
        onDone={load}
        products={products}
        locations={locations}
      />

      <QRScanModal
        open={modal === 'scan'}
        onClose={() => setModal(null)}
        onDone={load}
        locations={locations}
      />

      <Modal open={modal === 'transfer'} onClose={() => setModal(null)} title={t('stock.transferModal.title')}>
        <form onSubmit={handleTransfer}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="label">{t('stock.transferModal.product')}</label>
              <select className="select" value={form.productId} onChange={set('productId')} required>
                <option value="">{t('stock.entryModal.select')}</option>
                {products.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('stock.transferModal.sourceLocation')}</label>
                <select className="select" value={form.fromLocationId} onChange={set('fromLocationId')} required>
                  <option value="">{t('stock.entryModal.select')}</option>
                  {locations.filter(l => l.isActive).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{t('stock.transferModal.targetLocation')}</label>
                <select className="select" value={form.toLocationId} onChange={set('toLocationId')} required>
                  <option value="">{t('stock.entryModal.select')}</option>
                  {locations.filter(l => l.isActive && l.id !== form.fromLocationId).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">{t('stock.transferModal.quantity')}</label>
              <input className="input" type="number" step="0.001" min="0.001" value={form.quantity} onChange={set('quantity')} required />
            </div>
            <div>
              <label className="label">{t('stock.transferModal.notes')}</label>
              <input className="input" value={form.notes} onChange={set('notes')} placeholder={t('stock.transferModal.notesOptional')} />
            </div>
          </div>
          <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop:'1px solid #1A1A1A' }}>
            <button type="button" className="btn-ghost" onClick={() => setModal(null)}>{t('stock.transferModal.cancel')}</button>
            <button type="submit" className="btn-gold" disabled={saving}>{saving ? t('stock.transferModal.transferring') : t('stock.transferModal.submit')}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
