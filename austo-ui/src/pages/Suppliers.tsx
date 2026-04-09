import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X, Search, Building2, Phone } from 'lucide-react'
import { suppliersApi } from '../api/client'
import type { Supplier } from '../types'

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

const empty = { companyName: '', phone: '', contactName: '', email: '', taxNumber: '', notes: '' }

export default function Suppliers() {
  const [items, setItems] = useState<Supplier[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Supplier | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => suppliersApi.getAll().then((r: any) => setItems(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))
  const openCreate = () => { setForm(empty); setSelected(null); setModal('create') }
  const openEdit = (s: Supplier) => { setForm({ companyName: s.companyName, phone: s.phone, contactName: s.contactName ?? '', email: s.email ?? '', taxNumber: s.taxNumber ?? '', notes: '' }); setSelected(s); setModal('edit') }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (modal === 'edit' && selected) await suppliersApi.update(selected.id, form)
      else await suppliersApi.create(form)
      setModal(null); load()
    } finally { setSaving(false) }
  }

  const filtered = items.filter(i => i.companyName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title gold-text">Tedarikçiler</h1>
        <button className="btn-gold flex items-center gap-2" onClick={openCreate}><Plus size={16} /> Yeni Tedarikçi</button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#555' }} />
        <input className="input pl-9" placeholder="Şirket ara..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {['Şirket', 'İletişim Kişisi', 'Telefon', 'Durum', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: '#555' }}>Yükleniyor...</td></tr>
            : filtered.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: '#555' }}>Tedarikçi bulunamadı.</td></tr>
            : filtered.map(s => (
              <tr key={s.id} className="table-row">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><Building2 size={14} style={{ color: '#D4AF37' }} /><span className="font-medium text-white">{s.companyName}</span></div></td>
                <td className="px-4 py-3" style={{ color: '#888' }}>{s.contactName || '—'}</td>
                <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-xs" style={{ color: '#888' }}><Phone size={11}/>{s.phone}</span></td>
                <td className="px-4 py-3"><span className={s.isActive ? 'badge-green' : 'badge-red'}>{s.isActive ? 'Aktif' : 'Pasif'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="btn-ghost px-2 py-1" onClick={() => openEdit(s)}><Edit2 size={14}/></button>
                    <button className="btn-danger px-2 py-1" onClick={() => suppliersApi.remove(s.id).then(load)}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'edit' ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi'}>
        <form onSubmit={handleSave}>
          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Şirket Adı</label><input className="input" value={form.companyName} onChange={set('companyName')} required /></div>
            <div><label className="label">İletişim Kişisi</label><input className="input" value={form.contactName} onChange={set('contactName')} /></div>
            <div><label className="label">Telefon</label><input className="input" value={form.phone} onChange={set('phone')} required /></div>
            <div><label className="label">E-posta</label><input className="input" type="email" value={form.email} onChange={set('email')} /></div>
            <div><label className="label">Vergi No</label><input className="input" value={form.taxNumber} onChange={set('taxNumber')} /></div>
          </div>
          <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
            <button type="button" className="btn-ghost" onClick={() => setModal(null)}>İptal</button>
            <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
