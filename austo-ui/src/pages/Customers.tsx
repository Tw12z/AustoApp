import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit2, Trash2, X, Search, Phone, Mail } from 'lucide-react'
import { customersApi } from '../api/client'
import type { Customer } from '../types'

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

const empty = { fullName: '', phone: '', email: '', taxNumber: '', notes: '' }

export default function Customers() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => customersApi.getAll().then((r: any) => setItems(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  const openCreate = () => { setForm(empty); setSelected(null); setModal('create') }
  const openEdit = (c: Customer) => { setForm({ fullName: c.fullName, phone: c.phone, email: c.email ?? '', taxNumber: c.taxNumber ?? '', notes: c.notes ?? '' }); setSelected(c); setModal('edit') }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (modal === 'edit' && selected) await customersApi.update(selected.id, form)
      else await customersApi.create(form)
      setModal(null); load()
    } finally { setSaving(false) }
  }

  const filtered = items.filter(i => i.fullName.toLowerCase().includes(search.toLowerCase()) || i.phone.includes(search))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title gold-text">{t('customers.pageTitle')}</h1>
        <button className="btn-gold flex items-center gap-2" onClick={openCreate}><Plus size={16} /> {t('customers.newCustomer')}</button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#888' }} />
        <input className="input pl-9" placeholder={t('customers.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {[t('customers.columns.fullName'), t('customers.columns.contact'), t('customers.columns.taxNumber'), t('customers.columns.status'), ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('customers.loading')}</td></tr>
            : filtered.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('customers.noResults')}</td></tr>
            : filtered.map(c => (
              <tr key={c.id} className="table-row">
                <td className="px-4 py-3 font-medium text-white">{c.fullName}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: '#888' }}><Phone size={11}/>{c.phone}</span>
                    {c.email && <span className="flex items-center gap-1.5 text-xs" style={{ color: '#888' }}><Mail size={11}/>{c.email}</span>}
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: '#888' }}>{c.taxNumber || '—'}</td>
                <td className="px-4 py-3"><span className={c.isActive ? 'badge-green' : 'badge-red'}>{c.isActive ? t('common.active') : t('common.inactive')}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="btn-ghost px-2 py-1" onClick={() => openEdit(c)}><Edit2 size={14}/></button>
                    <button className="btn-danger px-2 py-1" onClick={() => customersApi.remove(c.id).then(load)}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'edit' ? t('customers.editTitle') : t('customers.newTitle')}>
        <form onSubmit={handleSave}>
          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">{t('customers.form.fullName')}</label><input className="input" value={form.fullName} onChange={set('fullName')} required /></div>
            <div><label className="label">{t('customers.form.phone')}</label><input className="input" value={form.phone} onChange={set('phone')} required /></div>
            <div><label className="label">{t('customers.form.email')}</label><input className="input" type="email" value={form.email} onChange={set('email')} /></div>
            <div><label className="label">{t('customers.form.taxNumber')}</label><input className="input" value={form.taxNumber} onChange={set('taxNumber')} /></div>
            <div><label className="label">{t('customers.form.notes')}</label><input className="input" value={form.notes} onChange={set('notes')} /></div>
          </div>
          <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
            <button type="button" className="btn-ghost" onClick={() => setModal(null)}>{t('customers.form.cancel')}</button>
            <button type="submit" className="btn-gold" disabled={saving}>{saving ? t('customers.form.saving') : t('customers.form.save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
