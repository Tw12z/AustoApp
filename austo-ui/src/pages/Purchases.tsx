import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, Ban } from 'lucide-react'
import { purchasesApi, suppliersApi, customersApi } from '../api/client'
import type { Purchase, Supplier, Customer } from '../types'
import { useEnumLabels } from '../hooks/useEnumLabels'

function Modal({ open, onClose, children, title }: any) {
  const { t } = useTranslation()
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} aria-label={t('common.close')} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

const PURITIES = [0, 8, 14, 18, 21, 22, 24]

export default function Purchases() {
  const { t, i18n } = useTranslation()
  const { purityLabels, purchaseSourceTypes, transactionStatus } = useEnumLabels()
  const priceLocale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'tr-TR'
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
    if (!confirm(t('purchases.confirmCancel'))) return
    await purchasesApi.cancel(id); load()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title gold-text">{t('purchases.pageTitle')}</h1>
        <button className="btn-gold flex items-center gap-2" onClick={() => setModal(true)}>
          <Plus size={16} /> {t('purchases.newPurchase')}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {[t('purchases.columns.date'), t('purchases.columns.source'), t('purchases.columns.supplierCustomer'), t('purchases.columns.weight'), t('purchases.columns.purity'), t('purchases.columns.amount'), t('purchases.columns.status'), ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('purchases.loading')}</td></tr>
            : purchases.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('purchases.noResults')}</td></tr>
            : purchases.map(p => {
              const st = transactionStatus[p.status]
              return (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3 text-white">{new Date(p.purchaseDate).toLocaleDateString(priceLocale)}</td>
                  <td className="px-4 py-3"><span className="badge-gray">{purchaseSourceTypes[p.sourceType]}</span></td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{p.supplierName || p.customerName || '—'}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{p.weightGram.toFixed(3)}gr</td>
                  <td className="px-4 py-3"><span className="badge-gold">{purityLabels[p.purity]}</span></td>
                  <td className="px-4 py-3 font-semibold text-white">₺{p.totalAmountTRY.toLocaleString(priceLocale, { minimumFractionDigits: 2 })}</td>
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
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={t('purchases.createTitle')}>
        <form onSubmit={handleCreate}>
          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('purchases.form.sourceType')}</label>
              <select className="select" value={form.sourceType} onChange={set('sourceType')}>
                <option value={1}>{t('purchases.form.sourceSupplier')}</option>
                <option value={2}>{t('purchases.form.sourceCustomer')}</option>
                <option value={3}>{t('purchases.form.sourceScrap')}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('purchases.form.purchaseDate')}</label>
              <input className="input" type="date" value={form.purchaseDate} onChange={set('purchaseDate')} required />
            </div>
            {form.sourceType === 1 && (
              <div className="col-span-2">
                <label className="label">{t('purchases.form.supplier')}</label>
                <select className="select" value={form.supplierId} onChange={set('supplierId')}>
                  <option value="">{t('purchases.form.select')}</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                </select>
              </div>
            )}
            {form.sourceType === 2 && (
              <div className="col-span-2">
                <label className="label">{t('purchases.form.customer')}</label>
                <select className="select" value={form.customerId} onChange={set('customerId')}>
                  <option value="">{t('purchases.form.select')}</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label">{t('purchases.form.weight')}</label>
              <input className="input" type="number" step="0.001" min="0.001" value={form.weightGram} onChange={set('weightGram')} required />
            </div>
            <div>
              <label className="label">{t('purchases.form.purity')}</label>
              <select className="select" value={form.purity} onChange={set('purity')}>
                {PURITIES.map(p => <option key={p} value={p}>{purityLabels[p]}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">{t('purchases.form.totalAmount')}</label>
              <input className="input" type="number" step="0.01" min="0" value={form.totalAmountTRY} onChange={set('totalAmountTRY')} required />
            </div>
            <div className="col-span-2">
              <label className="label">{t('purchases.form.notes')}</label>
              <input className="input" value={form.notes} onChange={set('notes')} placeholder={t('purchases.form.notesOptional')} />
            </div>
          </div>
          <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
            <button type="button" className="btn-ghost" onClick={() => setModal(false)}>{t('purchases.form.cancel')}</button>
            <button type="submit" className="btn-gold" disabled={saving}>{saving ? t('purchases.form.saving') : t('purchases.form.submit')}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
