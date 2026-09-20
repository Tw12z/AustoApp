import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit2, Trash2, X, Search, MapPin, Package, HelpCircle } from 'lucide-react'
import { locationsApi, categoriesApi, stockApi } from '../api/client'
import type { LocationStockDetail, LocationStockSummary } from '../types'
import { useEnumLabels } from '../hooks/useEnumLabels'
import { formatQty } from '../utils/formatQty'

interface Category { id: string; name: string; isActive: boolean }
interface Location  { id: string; name: string; description?: string; categoryId?: string; category?: Category; isActive: boolean }

function Modal({ open, onClose, title, children, maxWidth = 440 }: any) {
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

// ── Konumdaki Ürünler Modalı ──────────────────────────────────────────────
// Bir konuma tıklayınca o konumda hangi üründen kaç adet olduğunu gösterir.
// locationId null ise parçası oluşturulmamış ("konumu belirtilmemiş") adetler.
function LocationStockModal({ open, locationId, locationName, onClose }: {
  open: boolean; locationId: string | null; locationName: string; onClose: () => void
}) {
  const { t, i18n } = useTranslation()
  const { purityLabels } = useEnumLabels()
  const priceLocale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'tr-TR'
  const [detail, setDetail]   = useState<LocationStockDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!open) { setDetail(null); setError(''); return }
    setLoading(true); setError('')
    stockApi.getLocationStock(locationId)
      .then((r: any) => setDetail(r.data))
      .catch((err: any) => setError(err?.response?.data?.message ?? t('locations.stockModal.loadFailed')))
      .finally(() => setLoading(false))
  }, [open, locationId])

  return (
    <Modal open={open} onClose={onClose} maxWidth={720}
      title={t('locations.stockModal.title', { name: locationName })}>
      <div className="px-6 py-5 space-y-4">
        {error && (
          <div className="text-sm px-3 py-2.5 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-sm" style={{ color: '#888' }}>{t('locations.stockModal.loading')}</div>
        ) : detail && detail.products.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg p-3" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                <div className="text-xs mb-1" style={{ color: '#888' }}>{t('locations.stockModal.totalPieces')}</div>
                <div className="font-bold text-white">{formatQty(detail.totalQuantity)}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                <div className="text-xs mb-1" style={{ color: '#888' }}>{t('locations.stockModal.totalWeight')}</div>
                <div className="font-bold text-white">{detail.totalWeightGram.toFixed(2)}gr</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#0A0A0A', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div className="text-xs mb-1" style={{ color: '#888' }}>{t('locations.stockModal.estimatedValue')}</div>
                <div className="font-bold gold-text">₺{detail.totalEstimatedValueTRY.toLocaleString(priceLocale, { minimumFractionDigits: 2 })}</div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1A1A1A' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                      {[t('locations.stockModal.columns.product'), t('locations.stockModal.columns.category'),
                        t('locations.stockModal.columns.purity'), t('locations.stockModal.columns.quantity'),
                        t('locations.stockModal.columns.weight')].map(h => (
                        <th key={h} className="text-left px-4 py-2 font-medium" style={{ color: '#888', fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.products.map(p => (
                      <tr key={p.productId} className="table-row">
                        <td className="px-4 py-2 font-medium text-white">{p.productName}</td>
                        <td className="px-4 py-2" style={{ color: '#888' }}>{p.categoryName}</td>
                        <td className="px-4 py-2"><span className="badge-gold">{purityLabels[p.purity]}</span></td>
                        <td className="px-4 py-2 font-bold" style={{ color: '#D4AF37' }}>{formatQty(p.quantity)}</td>
                        <td className="px-4 py-2" style={{ color: '#888' }}>{p.totalWeightGram.toFixed(2)}gr</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : !error ? (
          <div className="py-8 text-center text-sm" style={{ color: '#888' }}>{t('locations.stockModal.empty')}</div>
        ) : null}
      </div>
    </Modal>
  )
}

export default function Locations() {
  const { t } = useTranslation()
  const [items, setItems]         = useState<Location[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [summaries, setSummaries] = useState<LocationStockSummary[]>([])
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected]   = useState<Location | null>(null)
  const [form, setForm]           = useState({ name: '', description: '', categoryId: '' })
  const [saving, setSaving]       = useState(false)
  const [loading, setLoading]     = useState(true)
  // Açık olan konum stok listesi. locationId null ⇒ konumu belirtilmemiş adetler.
  const [stockView, setStockView] = useState<{ id: string | null; name: string } | null>(null)

  const load = () =>
    Promise.all([
      locationsApi.getAll().then((r: any) => setItems(r.data)),
      categoriesApi.getAll().then((r: any) => setCategories(r.data.filter((c: Category) => c.isActive))),
      stockApi.getLocationSummaries().then((r: any) => setSummaries(r.data)).catch(() => setSummaries([])),
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
    if (!confirm(t('locations.confirmDeactivate', { name: item.name }))) return
    await locationsApi.remove(item.id)
    load()
  }

  const filtered = items.filter(i => i.isActive && i.name.toLowerCase().includes(search.toLowerCase()))
  const stockOf = (locationId: string) => summaries.find(s => s.locationId === locationId)
  // Gerçek bir konum değil: parçası oluşturulmamış adetlerin toplandığı satır.
  const unassigned = summaries.find(s => s.locationId === null)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title gold-text">{t('locations.pageTitle')}</h1>
        <button className="btn-gold flex items-center gap-2" onClick={openCreate}>
          <Plus size={16} /> {t('locations.newLocation')}
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#888' }} />
        <input className="input pl-9" placeholder={t('locations.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {[t('locations.columns.name'), t('locations.columns.description'), t('locations.columns.category'), t('locations.columns.stock'), t('locations.columns.status'), ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium"
                  style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('locations.loading')}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('locations.noResults')}</td></tr>
            ) : filtered.map(item => {
              const summary = stockOf(item.id)
              const quantity = summary?.totalQuantity ?? 0
              return (
                <tr key={item.id} className="table-row">
                  {/* Konum adına tıklayınca o konumdaki ürünler açılır. */}
                  <td className="px-4 py-3 font-medium text-white">
                    <button type="button" onClick={() => setStockView({ id: item.id, name: item.name })}
                      title={t('locations.viewStock')}
                      className="flex items-center gap-2 hover:underline" style={{ textUnderlineOffset: 3 }}>
                      <MapPin size={14} style={{ color: '#D4AF37' }} />
                      {item.name}
                    </button>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{item.description || '—'}</td>
                  <td className="px-4 py-3">
                    {item.category ? (
                      <span className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                        {item.category.name}
                      </span>
                    ) : (
                      <span style={{ color: '#7D7D7D' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {quantity > 0 ? (
                      <button type="button" onClick={() => setStockView({ id: item.id, name: item.name })}
                        title={t('locations.viewStock')}
                        className="flex items-center gap-1.5 font-semibold hover:underline"
                        style={{ color: '#D4AF37', textUnderlineOffset: 3 }}>
                        <Package size={13} />
                        {t('locations.stockCell', { qty: formatQty(quantity) })}
                      </button>
                    ) : (
                      <span style={{ color: '#7D7D7D' }}>{t('locations.stockEmpty')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={item.isActive ? 'badge-green' : 'badge-red'}>{item.isActive ? t('common.active') : t('common.inactive')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="btn-ghost px-2 py-1 text-xs" onClick={() => openEdit(item)}><Edit2 size={14} /></button>
                      <button className="btn-danger px-2 py-1 text-xs" onClick={() => handleDelete(item)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {/* Konumu belirtilmemiş adetler — düzenlenebilir bir konum değil,
                sadece "nerede olduğu henüz girilmemiş" stoğun toplamı. */}
            {!loading && unassigned && unassigned.totalQuantity > 0 && (
              <tr className="table-row" style={{ background: 'rgba(212,175,55,0.03)' }}>
                <td className="px-4 py-3 font-medium">
                  <button type="button" onClick={() => setStockView({ id: null, name: t('locations.unassignedRow') })}
                    className="flex items-center gap-2 hover:underline" style={{ color: '#B9B9B9', textUnderlineOffset: 3 }}>
                    <HelpCircle size={14} style={{ color: '#7D7D7D' }} />
                    {t('locations.unassignedRow')}
                  </button>
                </td>
                <td className="px-4 py-3" style={{ color: '#7D7D7D' }}>{t('locations.unassignedRowHint')}</td>
                <td className="px-4 py-3"><span style={{ color: '#7D7D7D' }}>—</span></td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => setStockView({ id: null, name: t('locations.unassignedRow') })}
                    className="flex items-center gap-1.5 font-semibold hover:underline"
                    style={{ color: '#B9B9B9', textUnderlineOffset: 3 }}>
                    <Package size={13} />
                    {t('locations.stockCell', { qty: formatQty(unassigned.totalQuantity) })}
                  </button>
                </td>
                <td className="px-4 py-3"><span style={{ color: '#7D7D7D' }}>—</span></td>
                <td className="px-4 py-3"></td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <LocationStockModal
        open={stockView !== null}
        locationId={stockView?.id ?? null}
        locationName={stockView?.name ?? ''}
        onClose={() => setStockView(null)}
      />

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'edit' ? t('locations.editTitle') : t('locations.newTitle')}>
        <form onSubmit={handleSave}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="label">{t('locations.form.name')}</label>
              <input className="input" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">{t('locations.form.description')}</label>
              <input className="input" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder={t('locations.form.descriptionOptional')} />
            </div>
            <div>
              <label className="label">{t('locations.form.category')}</label>
              <select className="input" value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">{t('locations.form.selectCategory')}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
            <button type="button" className="btn-ghost" onClick={() => setModal(null)}>{t('locations.form.cancel')}</button>
            <button type="submit" className="btn-gold" disabled={saving}>{saving ? t('locations.form.saving') : t('locations.form.save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
