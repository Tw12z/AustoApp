import { useEffect, useState } from 'react'
import { Plus, X, Ban } from 'lucide-react'
import { purchasesApi, suppliersApi, customersApi } from '../api/client'
import type { Purchase, Supplier, Customer } from '../types'
import { PURITY_LABELS, PURCHASE_SOURCE_TYPES, TRANSACTION_STATUS } from '../types'

function Modal({ open, onClose, children, title }: any) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

const PURITIES = [0, 8, 14, 18, 21, 22, 24]

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    purchaseDate: new Date().toISOString().slice(0, 10),
    totalAmountTRY: 0, weightGram: 0, purity: 14, sourceType: 1,
    supplierId: '', customerId: '', notes: '',
  })

  const load = () => purchasesApi.getAll().then(r => setPurchases(r.data)).finally(() => setLoading(false))
  useEffect(() => {
    load()
    suppliersApi.getAll().then(r => setSuppliers(r.data))
    customersApi.getAll().then(r => setCustomers(r.data))
  }, [])

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.type === 'number' ? +e.target.value : e.target.value }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await purchasesApi.create({
        ...form,
        supplierId: form.supplierId || null,
        customerId: form.customerId || null,
        notes: form.notes || null,
      })
      setModal(false); load()
    } finally { setSaving(false) }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Bu alış iptal edilsin mi?')) return
    await purchasesApi.cancel(id); load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title gold-text">Alışlar</h1>
        <button className="btn-gold flex items-center gap-2" onClick={() => setModal(true)}>
          <Plus size={16} /> Yeni Alış
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {['Tarih', 'Kaynak', 'Tedarikçi / Müşteri', 'Ağırlık', 'Ayar', 'Tutar', 'Durum', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center" style={{ color: '#555' }}>Yükleniyor...</td></tr>
            : purchases.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center" style={{ color: '#555' }}>Alış kaydı yok.</td></tr>
            : purchases.map(p => {
              const st = TRANSACTION_STATUS[p.status]
              return (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3 text-white">{new Date(p.purchaseDate).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3"><span className="badge-gray">{PURCHASE_SOURCE_TYPES[p.sourceType]}</span></td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{p.supplierName || p.customerName || '—'}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{p.weightGram.toFixed(3)}gr</td>
                  <td className="px-4 py-3"><span className="badge-gold">{PURITY_LABELS[p.purity]}</span></td>
                  <td className="px-4 py-3 font-semibold text-white">₺{p.totalAmountTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3"><span className={st?.cls ?? 'badge-gray'}>{st?.label ?? '—'}</span></td>
                  <td className="px-4 py-3">
                    {p.status !== 2 && <button className="btn-danger px-2 py-1" onClick={() => handleCancel(p.id)}><Ban size={14} /></button>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Yeni Alış">
        <form onSubmit={handleCreate}>
          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            <div>
              <label className="label">Kaynak Türü</label>
              <select className="select" value={form.sourceType} onChange={set('sourceType')}>
                <option value={1}>Tedarikçi</option>
                <option value={2}>Müşteri (İkinci El)</option>
                <option value={3}>Hurda Altın</option>
              </select>
            </div>
            <div>
              <label className="label">Alış Tarihi</label>
              <input className="input" type="date" value={form.purchaseDate} onChange={set('purchaseDate')} required />
            </div>
            {form.sourceType === 1 && (
              <div className="col-span-2">
                <label className="label">Tedarikçi</label>
                <select className="select" value={form.supplierId} onChange={set('supplierId')}>
                  <option value="">Seçin</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                </select>
              </div>
            )}
            {form.sourceType === 2 && (
              <div className="col-span-2">
                <label className="label">Müşteri</label>
                <select className="select" value={form.customerId} onChange={set('customerId')}>
                  <option value="">Seçin</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label">Ağırlık (gram)</label>
              <input className="input" type="number" step="0.001" min="0.001" value={form.weightGram} onChange={set('weightGram')} required />
            </div>
            <div>
              <label className="label">Ayar</label>
              <select className="select" value={form.purity} onChange={set('purity')}>
                {PURITIES.map(p => <option key={p} value={p}>{PURITY_LABELS[p]}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Toplam Tutar (₺)</label>
              <input className="input" type="number" step="0.01" min="0" value={form.totalAmountTRY} onChange={set('totalAmountTRY')} required />
            </div>
            <div className="col-span-2">
              <label className="label">Notlar</label>
              <input className="input" value={form.notes} onChange={set('notes')} placeholder="Opsiyonel" />
            </div>
          </div>
          <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
            <button type="button" className="btn-ghost" onClick={() => setModal(false)}>İptal</button>
            <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Alışı Kaydet'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
