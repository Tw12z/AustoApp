/**
 * Generic page for Categories & Locations (Name + Description CRUD)
 */
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react'

interface Item { id: string; name: string; description?: string; isActive: boolean }

function Modal({ open, onClose, title, children }: any) {
  const { t } = useTranslation()
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} aria-label={t('common.close')} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function SimpleList({ title, api, entityLabel }: {
  title: string; api: { getAll: () => any; create: (d: any) => any; update: (id: string, d: any) => any; remove: (id: string) => any }; entityLabel: string
}) {
  const { t } = useTranslation()
  const [items, setItems] = useState<Item[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Item | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => api.getAll().then((r: any) => setItems(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm({ name: '', description: '' }); setSelected(null); setModal('create') }
  const openEdit   = (item: Item) => { setForm({ name: item.name, description: item.description ?? '' }); setSelected(item); setModal('edit') }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (modal === 'edit' && selected) await api.update(selected.id, form)
      else await api.create(form)
      setModal(null); load()
    } finally { setSaving(false) }
  }

  const handleDelete = async (item: Item) => {
    if (!confirm(t('simpleList.confirmDeactivate', { name: item.name }))) return
    await api.remove(item.id); load()
  }

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title gold-text">{title}</h1>
        <button className="btn-gold flex items-center gap-2" onClick={openCreate}>
          <Plus size={16} /> {t('simpleList.newEntity', { entity: entityLabel })}
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#888' }} />
        <input className="input pl-9" placeholder={t('simpleList.searchPlaceholder', { entity: entityLabel })} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {[t('simpleList.columns.name'), t('simpleList.columns.description'), t('simpleList.columns.status'), ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('simpleList.loading')}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('simpleList.noResults')}</td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} className="table-row">
                <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                <td className="px-4 py-3" style={{ color: '#888' }}>{item.description || '—'}</td>
                <td className="px-4 py-3"><span className={item.isActive ? 'badge-green' : 'badge-red'}>{item.isActive ? t('common.active') : t('common.inactive')}</span></td>
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

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'edit' ? t('simpleList.editEntity', { entity: entityLabel }) : t('simpleList.newEntity', { entity: entityLabel })}>
        <form onSubmit={handleSave}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="label">{t('common.name')}</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">{t('common.description')}</label>
              <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={t('simpleList.namePlaceholderOptional')} />
            </div>
          </div>
          <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
            <button type="button" className="btn-ghost" onClick={() => setModal(null)}>{t('simpleList.cancel')}</button>
            <button type="submit" className="btn-gold" disabled={saving}>{saving ? t('simpleList.saving') : t('simpleList.save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
