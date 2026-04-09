import { useEffect, useState } from 'react'
import { Plus, X, Ban, Eye } from 'lucide-react'
import { salesApi, customersApi, productsApi } from '../api/client'
import type { Sale, Customer, Product } from '../types'
import { TRANSACTION_STATUS } from '../types'

function Modal({ open, onClose, children, title, wide }: any) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: wide ? 700 : 560 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [modal, setModal] = useState<'create' | 'detail' | null>(null)
  const [selected, setSelected] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Create form state
  const [customerId, setCustomerId] = useState('')
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPriceTRY: 0 }])

  const load = () => salesApi.getAll().then(r => setSales(r.data)).finally(() => setLoading(false))
  useEffect(() => {
    load()
    customersApi.getAll().then(r => setCustomers(r.data))
    productsApi.getAll().then(r => setProducts(r.data))
  }, [])

  const addItem = () => setItems(i => [...i, { productId: '', quantity: 1, unitPriceTRY: 0 }])
  const removeItem = (idx: number) => setItems(i => i.filter((_, n) => n !== idx))
  const updateItem = (idx: number, k: string, v: any) => setItems(i => i.map((it, n) => n === idx ? { ...it, [k]: v } : it))

  const handleProductChange = (idx: number, id: string) => {
    const p = products.find(x => x.id === id)
    updateItem(idx, 'productId', id)
    if (p) updateItem(idx, 'unitPriceTRY', p.salePrice)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await salesApi.create({ customerId: customerId || null, saleDate, notes: notes || null, items })
      setModal(null); load()
    } finally { setSaving(false) }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Bu satış iptal edilsin mi?')) return
    await salesApi.cancel(id); load()
  }

  const openDetail = async (id: string) => {
    const res = await salesApi.getById(id)
    setSelected(res.data); setModal('detail')
  }

  const totalStr = (sale: Sale) => `₺${sale.totalAmountTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title gold-text">Satışlar</h1>
        <button className="btn-gold flex items-center gap-2" onClick={() => { setItems([{ productId: '', quantity: 1, unitPriceTRY: 0 }]); setModal('create') }}>
          <Plus size={16} /> Yeni Satış
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {['Tarih', 'Müşteri', 'Tutar', 'Ağırlık', 'Durum', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#555' }}>Yükleniyor...</td></tr>
            : sales.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#555' }}>Satış kaydı yok.</td></tr>
            : sales.map(s => {
              const st = TRANSACTION_STATUS[s.status]
              return (
                <tr key={s.id} className="table-row">
                  <td className="px-4 py-3 text-white">{new Date(s.saleDate).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{s.customerName || 'Perakende'}</td>
                  <td className="px-4 py-3 font-semibold text-white">{totalStr(s)}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{s.totalWeightGram.toFixed(3)}gr</td>
                  <td className="px-4 py-3"><span className={st?.cls ?? 'badge-gray'}>{st?.label ?? '—'}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="btn-ghost px-2 py-1" onClick={() => openDetail(s.id)} title="Detay"><Eye size={14} /></button>
                      {s.status !== 2 && <button className="btn-danger px-2 py-1" onClick={() => handleCancel(s.id)} title="İptal"><Ban size={14} /></button>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Yeni Satış" wide>
        <form onSubmit={handleCreate}>
          <div className="px-6 py-5 space-y-4">
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
                <input className="input" type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} required />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Ürünler</label>
                <button type="button" className="btn-outline px-3 py-1 text-xs" onClick={addItem}>+ Ürün Ekle</button>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <select className="select" value={item.productId} onChange={e => handleProductChange(idx, e.target.value)} required>
                        <option value="">Ürün Seç</option>
                        {products.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name} ({p.stockQuantity} adet)</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input className="input" type="number" step="0.001" min="0.001" placeholder="Adet" value={item.quantity} onChange={e => updateItem(idx, 'quantity', +e.target.value)} required />
                    </div>
                    <div className="col-span-4">
                      <input className="input" type="number" step="0.01" min="0" placeholder="Birim Fiyat ₺" value={item.unitPriceTRY} onChange={e => updateItem(idx, 'unitPriceTRY', +e.target.value)} required />
                    </div>
                    <div className="col-span-1 text-center">
                      {items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-300"><X size={14} /></button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Notlar</label>
              <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opsiyonel" />
            </div>
          </div>
          <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
            <button type="button" className="btn-ghost" onClick={() => setModal(null)}>İptal</button>
            <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Satışı Kaydet'}</button>
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title="Satış Detayı" wide>
        {selected && (
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg p-3" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                <div className="label">Müşteri</div><div className="text-white font-medium">{selected.customerName || 'Perakende'}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                <div className="label">Toplam Tutar</div><div className="font-bold" style={{ color: '#D4AF37' }}>₺{selected.totalAmountTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                <div className="label">Toplam Ağırlık</div><div className="text-white font-medium">{selected.totalWeightGram.toFixed(3)}gr</div>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                  {['Ürün', 'Adet', 'Birim Fiyat', 'Ağırlık', 'Toplam'].map(h => (
                    <th key={h} className="text-left pb-2 font-medium" style={{ color: '#555', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item, i) => (
                  <tr key={i} className="table-row">
                    <td className="py-2 text-white">{item.productName}</td>
                    <td className="py-2" style={{ color: '#888' }}>{item.quantity}</td>
                    <td className="py-2" style={{ color: '#888' }}>₺{item.unitPriceTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2" style={{ color: '#888' }}>{item.weightGram.toFixed(3)}gr</td>
                    <td className="py-2 font-semibold text-white">₺{(item.unitPriceTRY * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
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
