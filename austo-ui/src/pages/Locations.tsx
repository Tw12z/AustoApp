import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X, Search, MapPin } from 'lucide-react'
import { locationsApi, categoriesApi } from '../api/client'

interface Category { id: string; name: string; isActive: boolean }
interface Location  { id: string; name: string; description?: string; categoryId?: string; category?: Category; isActive: boolean }

function Modal({ open, onClose, title, children }: any) {
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

export default function Locations() {
  const [items, setItems]         = useState<Location[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected]   = useState<Location | null>(null)
  const [form, setForm]           = useState({ name: '', description: '', categoryId: '' })
  const [saving, setSaving]       = useState(false)
  const [loading, setLoading]     = useState(true)

  const load = () =>
    Promise.all([
      locationsApi.getAll().then((r: any) => setItems(r.data)),
      categoriesApi.getAll().then((r: any) => setCategories(r.data.filter((c: Category) => c.isActive))),
    ]).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ name: '', description: '', categoryId: '' })
    setSelected(null)
    setModal('create')
  }
  const openEdit = (item: Location) => {
    setForm({ name: item.name, description: item.description ?? '', categoryId: item.categoryId ?? '' })
    setSelected(item)
    setModal('edit')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      description: form.description || null,
      categoryId: form.categoryId || null,
    }
    try {
      if (modal === 'edit' && selected) await locationsApi.update(selected.id, payload)
      else await locationsApi.create(payload)
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const handleDelete = async (item: Location) => {
    if (!confirm(`"${item.name}" pasif yapılsın mı?`)) return
    await locationsApi.remove(item.id)
    load()
  }

  const filtered = items.filter(i => i.isActive && i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title gold-text">Konumlar</h1>
        <button className="btn-gold flex items-center gap-2" onClick={openCreate}>
          <Plus size={16} /> Yeni Konum
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#555' }} />
        <input className="input pl-9" placeholder="Konum ara..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {['Ad', 'Açıklama', 'Kategori', 'Durum', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium"
                  style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: '#555' }}>Yükleniyor...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: '#555' }}>Kayıt bulunamadı.</td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} className="table-row">
                <td className="px-4 py-3 font-medium text-white">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} style={{ color: '#D4AF37' }} />
                    {item.name}
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: '#888' }}>{item.description || '—'}</td>
                <td className="px-4 py-3">
                  {item.category ? (
                    <span className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                      {item.category.name}
                    </span>
                  ) : (
                    <span style={{ color: '#444' }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={item.isActive ? 'badge-green' : 'badge-red'}>{item.isActive ? 'Aktif' : 'Pasif'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="btn-ghost px-2 py-1 text-xs" onClick={() => openEdit(item)}><Edit2 size={14} /></button>
                    <button className="btn-danger px-2 py-1 text-xs" onClick={() => handleDelete(item)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={`${modal === 'edit' ? 'Düzenle' : 'Yeni'} Konum`}>
        <form onSubmit={handleSave}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="label">Ad</label>
              <input className="input" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Açıklama</label>
              <input className="input" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Opsiyonel" />
            </div>
            <div>
              <label className="label">Kategori</label>
              <select className="input" value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">— Seçiniz —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
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
