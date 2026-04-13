import { useEffect, useState, useMemo } from 'react'
import { Plus, X, Ban, Eye, Percent, Receipt, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { salesApi, customersApi, productsApi } from '../api/client'
import type { Sale, Customer, Product } from '../types'
import { TRANSACTION_STATUS } from '../types'

function fmt(n: number) {
  return '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Modal({ open, onClose, children, title, wide }: {
  open: boolean; onClose: () => void; children: React.ReactNode; title: string; wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: wide ? 740 : 560 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

interface SaleItem { productId: string; quantity: number; unitPriceTRY: number }
interface ExtraCost { name: string; value: number; mode: 'fixed' | 'pct' }

const EMPTY_ITEM: SaleItem = { productId: '', quantity: 1, unitPriceTRY: 0 }
const EMPTY_EXTRA: ExtraCost = { name: '', value: 0, mode: 'fixed' }

export default function Sales() {
  const [sales, setSales]       = useState<Sale[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [modal, setModal]       = useState<'create' | 'detail' | null>(null)
  const [selected, setSelected] = useState<Sale | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [tab,      setTab]      = useState<'active' | 'cancelled'>('active')
  const [sortKey,  setSortKey]  = useState<'date' | 'amount'>('date')
  const [sortDir,  setSortDir]  = useState<'desc' | 'asc'>('desc')

  // Form state
  const [customerId, setCustomerId] = useState('')
  const nowLocal = () => {
    const d = new Date(); d.setSeconds(0, 0)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }
  const [saleDate, setSaleDate] = useState(nowLocal)
  const [notes, setNotes]           = useState('')
  const [items, setItems]           = useState<SaleItem[]>([{ ...EMPTY_ITEM }])
  const [extraCosts, setExtraCosts] = useState<ExtraCost[]>([])
  const [discountVal,  setDiscountVal]  = useState<number>(0)
  const [discountMode, setDiscountMode] = useState<'pct' | 'fixed'>('pct')

  const load = () => salesApi.getAll().then(r => setSales(r.data)).finally(() => setLoading(false))

  const activeSales    = useMemo(() => sales.filter(s => s.status !== 2), [sales])
  const cancelledSales = useMemo(() => sales.filter(s => s.status === 2), [sales])
  const visibleSales   = tab === 'active' ? activeSales : cancelledSales

  const sortedSales = useMemo(() => [...visibleSales].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'date') return mul * (new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime())
    return mul * (a.totalAmountTRY - b.totalAmountTRY)
  }), [visibleSales, sortKey, sortDir])

  const toggleSort = (key: 'date' | 'amount') => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }
  useEffect(() => {
    load()
    customersApi.getAll().then(r => setCustomers(r.data))
    productsApi.getAll().then(r => setProducts(r.data))
  }, [])

  // ── Item helpers ────────────────────────────────────────
  const addItem    = () => setItems(prev => [...prev, { ...EMPTY_ITEM }])
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, n) => n !== idx))
  const updateItem = (idx: number, k: keyof SaleItem, v: string | number) =>
    setItems(prev => prev.map((it, n) => n === idx ? { ...it, [k]: v } : it))

  const handleProductChange = (idx: number, id: string) => {
    const p = products.find(x => x.id === id)
    setItems(prev => prev.map((it, n) =>
      n === idx ? { ...it, productId: id, unitPriceTRY: p ? p.salePrice : 0 } : it
    ))
  }

  // ── Extra cost helpers ───────────────────────────────────
  const addExtra    = () => setExtraCosts(prev => [...prev, { ...EMPTY_EXTRA }])
  const removeExtra = (idx: number) => setExtraCosts(prev => prev.filter((_, n) => n !== idx))
  const updateExtra = (idx: number, k: keyof ExtraCost, v: string | number) =>
    setExtraCosts(prev => prev.map((it, n) => n === idx ? { ...it, [k]: v } : it))

  // ── Totals ───────────────────────────────────────────────
  const subtotal   = items.reduce((s, i) => s + i.quantity * i.unitPriceTRY, 0)
  const extraTotal = extraCosts.reduce((s, c) =>
    s + (c.mode === 'pct' ? subtotal * (c.value / 100) : (c.value || 0)), 0)
  const beforeDiscount = subtotal + extraTotal
  const discountAmt    = discountMode === 'pct'
    ? beforeDiscount * (discountVal / 100)
    : Math.min(discountVal, beforeDiscount)
  const grandTotal     = beforeDiscount - discountAmt

  // ── Submit ───────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Distribute extra costs & discount proportionally across items
    const ratio = subtotal > 0 ? grandTotal / subtotal : 1
    const adjustedItems = items.map(it => ({
      productId: it.productId,
      quantity: it.quantity,
      unitPriceTRY: parseFloat((it.unitPriceTRY * ratio).toFixed(2)),
    }))

    const noteLines = [notes]
    if (extraCosts.length) noteLines.push('Ek masraflar: ' + extraCosts.map(c => {
      const amt = c.mode === 'pct' ? subtotal * (c.value / 100) : c.value
      return `${c.name} ${c.mode === 'pct' ? `%${c.value}` : ''} (${fmt(amt)})`
    }).join(', '))
    if (discountVal > 0) noteLines.push(
      discountMode === 'pct'
        ? `%${discountVal} indirim uygulandı (−${fmt(discountAmt)})`
        : `${fmt(discountVal)} indirim uygulandı`
    )

    try {
      await salesApi.create({
        customerId: customerId || null,
        saleDate,
        notes: noteLines.filter(Boolean).join(' | ') || null,
        items: adjustedItems,
      })
      setModal(null)
      resetForm()
      load()
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setCustomerId('')
    setSaleDate(nowLocal())
    setNotes('')
    setItems([{ ...EMPTY_ITEM }])
    setExtraCosts([])
    setDiscountVal(0)
    setDiscountMode('pct')
  }

  const openCreate = () => { resetForm(); setModal('create') }

  const handleCancel = async (id: string) => {
    if (!confirm('Bu satış iptal edilsin mi?')) return
    await salesApi.cancel(id); load()
  }

  const openDetail = async (id: string) => {
    const res = await salesApi.getById(id)
    setSelected(res.data); setModal('detail')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title gold-text">Satış</h1>
        <button className="btn-gold flex items-center gap-2" onClick={openCreate}>
          <Plus size={16} /> Yeni Satış
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: '#111', border: '1px solid #1A1A1A' }}>
        {([
          { key: 'active',    label: 'Satışlar',       count: activeSales.length    },
          { key: 'cancelled', label: 'İptal Edilenler', count: cancelledSales.length },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.key ? '#1A1A1A' : 'transparent',
              color:      tab === t.key ? '#E5E5E5' : '#555',
              border:     tab === t.key ? '1px solid rgba(212,175,55,0.15)' : '1px solid transparent',
            }}>
            {t.label}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full tabular-nums"
              style={{
                background: tab === t.key ? 'rgba(212,175,55,0.12)' : '#1A1A1A',
                color:      tab === t.key ? '#D4AF37' : '#444',
              }}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {[
                { label: 'Tarih',   key: 'date'   as const },
                { label: 'Müşteri', key: null },
                { label: 'Tutar',   key: 'amount' as const },
                { label: 'Ağırlık', key: null },
                { label: 'Durum',   key: null },
                { label: '',        key: null },
              ].map(({ label, key }) => (
                <th key={label}
                  className="text-left px-4 py-3 font-medium select-none"
                  style={{ color: key ? '#888' : '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em', cursor: key ? 'pointer' : 'default' }}
                  onClick={() => key && toggleSort(key)}>
                  <span className="flex items-center gap-1">
                    {label}
                    {key && (sortKey === key
                      ? sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                      : <ChevronsUpDown size={11} style={{ opacity: 0.3 }} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#555' }}>Yükleniyor...</td></tr>
              : sortedSales.length === 0
                ? <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#555' }}>Satış kaydı yok.</td></tr>
                : sortedSales.map(s => {
                  const st = TRANSACTION_STATUS[s.status]
                  return (
                    <tr key={s.id} className="table-row">
                      <td className="px-4 py-3">
                        <span className="text-white">{new Date(s.saleDate).toLocaleDateString('tr-TR')}</span>
                        <span className="ml-1.5 text-[11px] tabular-nums" style={{ color: '#3A3A3A' }}>
                          {new Date(s.saleDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: '#888' }}>{s.customerName || 'Perakende'}</td>
                      <td className="px-4 py-3 font-semibold text-white">
                        ₺{s.totalAmountTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3" style={{ color: '#888' }}>{s.totalWeightGram.toFixed(3)}gr</td>
                      <td className="px-4 py-3"><span className={st?.cls ?? 'badge-gray'}>{st?.label ?? '—'}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="btn-ghost px-2 py-1" onClick={() => openDetail(s.id)} title="Detay"><Eye size={14} /></button>
                          {tab === 'active' && s.status !== 2 && <button className="btn-danger px-2 py-1" onClick={() => handleCancel(s.id)} title="İptal"><Ban size={14} /></button>}
                        </div>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>

      {/* ── Create modal ───────────────────────────────────── */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Yeni Satış" wide>
        <form onSubmit={handleCreate}>
          <div className="px-6 py-5 space-y-5" style={{ maxHeight: '75vh', overflowY: 'auto' }}>

            {/* Müşteri + Tarih */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Müşteri</label>
                <select className="select" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                  <option value="">Perakende (isimsiz)</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Satış Tarihi</label>
                <input className="input" type="datetime-local" value={saleDate} onChange={e => setSaleDate(e.target.value)} required />
              </div>
            </div>

            {/* Ürünler */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Ürünler</label>
                <button type="button" className="btn-outline px-3 py-1 text-xs" onClick={addItem}>+ Ürün Ekle</button>
              </div>
              <div className="space-y-2">
                {/* Header row */}
                <div className="grid grid-cols-12 gap-2 px-1">
                  {['Ürün', '', 'Adet', '', 'Birim Fiyat', '', ''].map((h, i) => (
                    <div key={i} className={`text-[10px] uppercase tracking-wider ${
                      i === 0 ? 'col-span-5' : i === 2 ? 'col-span-2' : i === 4 ? 'col-span-4' : 'col-span-1'
                    }`} style={{ color: '#444' }}>{h}</div>
                  ))}
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <select className="select text-sm" value={item.productId}
                        onChange={e => handleProductChange(idx, e.target.value)} required>
                        <option value="">Ürün Seç</option>
                        {products.filter(p => p.isActive).map(p =>
                          <option key={p.id} value={p.id}>{p.name} ({p.stockQuantity} adet)</option>
                        )}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input className="input text-sm" type="number" step="1" min="1"
                        placeholder="Adet" value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', +e.target.value)} required />
                    </div>
                    <div className="col-span-4">
                      <input className="input text-sm" type="number" step="0.01" min="0"
                        placeholder="Birim Fiyat ₺" value={item.unitPriceTRY}
                        onChange={e => updateItem(idx, 'unitPriceTRY', +e.target.value)} required />
                    </div>
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-300">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ara toplam */}
              <div className="flex justify-end mt-2 pr-8">
                <span className="text-xs" style={{ color: '#555' }}>Ara Toplam: </span>
                <span className="text-sm font-semibold text-white ml-2">{fmt(subtotal)}</span>
              </div>
            </div>

            {/* Ek Masraflar */}
            <div className="rounded-xl p-4 space-y-2" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Receipt size={13} style={{ color: '#D4AF37' }} />
                  <span className="label mb-0">Ek Masraflar</span>
                </div>
                <button type="button" className="btn-outline px-2 py-1 text-xs" onClick={addExtra}>+ Ekle</button>
              </div>

              {extraCosts.length === 0 && (
                <p className="text-xs" style={{ color: '#333' }}>KDV, nakliye, sigorta vb. ekleyebilirsiniz.</p>
              )}

              {extraCosts.map((ec, idx) => {
                const resolvedAmt = ec.mode === 'pct' ? subtotal * (ec.value / 100) : ec.value
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <input className="input text-sm flex-1" placeholder="İsim (örn: KDV)"
                      value={ec.name} onChange={e => updateExtra(idx, 'name', e.target.value)} />
                    {/* Mode toggle */}
                    <div className="flex shrink-0 rounded-lg overflow-hidden" style={{ border: '1px solid #2A2A2A' }}>
                      <button type="button"
                        onClick={() => updateExtra(idx, 'mode', 'fixed')}
                        className="px-3 py-2 text-xs font-semibold transition-colors"
                        style={{
                          background: ec.mode === 'fixed' ? 'rgba(212,175,55,0.15)' : 'transparent',
                          color: ec.mode === 'fixed' ? '#D4AF37' : '#555',
                        }}>₺</button>
                      <button type="button"
                        onClick={() => updateExtra(idx, 'mode', 'pct')}
                        className="px-3 py-2 text-xs font-semibold transition-colors"
                        style={{
                          background: ec.mode === 'pct' ? 'rgba(212,175,55,0.15)' : 'transparent',
                          color: ec.mode === 'pct' ? '#D4AF37' : '#555',
                          borderLeft: '1px solid #2A2A2A',
                        }}>%</button>
                    </div>
                    <input className="input text-sm w-28" type="number" step="0.01" min="0"
                      placeholder={ec.mode === 'pct' ? 'Oran (%)' : 'Tutar (₺)'}
                      value={ec.value || ''}
                      onChange={e => updateExtra(idx, 'value', +e.target.value)} />
                    {/* Computed amount when pct mode */}
                    {ec.mode === 'pct' && ec.value > 0 && (
                      <span className="text-xs shrink-0 tabular-nums" style={{ color: '#888', minWidth: 60 }}>
                        = {fmt(resolvedAmt)}
                      </span>
                    )}
                    <button type="button" onClick={() => removeExtra(idx)} className="text-red-500 hover:text-red-300 shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                )
              })}

              {extraCosts.length > 0 && (
                <div className="flex justify-end pt-1">
                  <span className="text-xs" style={{ color: '#555' }}>Ek Masraf Toplamı: </span>
                  <span className="text-sm font-semibold text-white ml-2">{fmt(extraTotal)}</span>
                </div>
              )}
            </div>

            {/* İndirim */}
            <div className="flex items-center gap-2">
              <Percent size={12} style={{ color: '#555' }} />
              <span className="text-xs shrink-0" style={{ color: '#555' }}>İndirim</span>
              {/* Mode toggle */}
              <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: '1px solid #2A2A2A' }}>
                <button type="button" onClick={() => setDiscountMode('pct')}
                  className="px-2.5 py-1.5 text-xs font-semibold transition-colors"
                  style={{ background: discountMode === 'pct' ? 'rgba(212,175,55,0.15)' : 'transparent', color: discountMode === 'pct' ? '#D4AF37' : '#555' }}>%</button>
                <button type="button" onClick={() => setDiscountMode('fixed')}
                  className="px-2.5 py-1.5 text-xs font-semibold transition-colors"
                  style={{ background: discountMode === 'fixed' ? 'rgba(212,175,55,0.15)' : 'transparent', color: discountMode === 'fixed' ? '#D4AF37' : '#555', borderLeft: '1px solid #2A2A2A' }}>₺</button>
              </div>
              <input className="input text-sm w-24" type="number" min="0" step="0.01"
                max={discountMode === 'pct' ? 100 : undefined}
                placeholder={discountMode === 'pct' ? 'Oran' : 'Tutar'}
                value={discountVal || ''}
                onChange={e => setDiscountVal(+e.target.value)} />
              {discountVal > 0 && (
                <span className="text-xs tabular-nums shrink-0" style={{ color: '#EF4444' }}>
                  −{fmt(discountAmt)}
                </span>
              )}
            </div>

            {/* Notlar */}
            <div>
              <label className="label">Notlar</label>
              <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opsiyonel" />
            </div>
          </div>

          {/* Footer — Genel Toplam + Kaydet */}
          <div className="px-6 py-4 flex items-center justify-between gap-4"
            style={{ borderTop: '1px solid #1A1A1A', background: '#0D0D0D' }}>
            <div>
              <div className="text-xs mb-0.5" style={{ color: '#555' }}>Genel Toplam</div>
              <div className="text-xl font-bold" style={{ color: '#D4AF37' }}>{fmt(grandTotal)}</div>
              {(discountVal > 0 || extraTotal > 0) && (
                <div className="text-[10px] mt-0.5 space-x-3" style={{ color: '#444' }}>
                  {extraTotal > 0 && <span>+{fmt(extraTotal)} ek masraf</span>}
                  {discountVal > 0 && <span>−{fmt(discountAmt)} indirim</span>}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn-ghost" onClick={() => setModal(null)}>İptal</button>
              <button type="submit" className="btn-gold" disabled={saving || grandTotal <= 0}>
                {saving ? 'Kaydediliyor...' : 'Satışı Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Detail modal ───────────────────────────────────── */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title="Satış Detayı" wide>
        {selected && (
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg p-3" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                <div className="label">Müşteri</div>
                <div className="text-white font-medium">{selected.customerName || 'Perakende'}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                <div className="label">Toplam Tutar</div>
                <div className="font-bold" style={{ color: '#D4AF37' }}>
                  ₺{selected.totalAmountTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                <div className="label">Toplam Ağırlık</div>
                <div className="text-white font-medium">{selected.totalWeightGram.toFixed(3)}gr</div>
              </div>
            </div>

            {selected.notes && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', color: '#888' }}>
                {selected.notes}
              </div>
            )}

            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                  {['Ürün', 'Adet', 'Birim Fiyat', 'Ağırlık', 'Toplam'].map(h => (
                    <th key={h} className="text-left pb-2 font-medium"
                      style={{ color: '#555', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item, i) => (
                  <tr key={i} className="table-row">
                    <td className="py-2 text-white">{item.productName}</td>
                    <td className="py-2" style={{ color: '#888' }}>{item.quantity}</td>
                    <td className="py-2" style={{ color: '#888' }}>
                      ₺{item.unitPriceTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2" style={{ color: '#888' }}>{item.weightGram.toFixed(3)}gr</td>
                    <td className="py-2 font-semibold text-white">
                      ₺{(item.unitPriceTRY * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  )
}
