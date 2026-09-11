import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, QrCode, Search, Edit2, Trash2, X } from 'lucide-react'
import { productsApi, categoriesApi } from '../api/client'
import type { Product, Category } from '../types'
import { useEnumLabels } from '../hooks/useEnumLabels'
import { formatQty } from '../utils/formatQty'

const PURITIES = [0, 8, 14, 18, 21, 22, 24]

function Modal({ open, onClose, title, children }: any) {
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

function ProductForm({ initial, categories, onSave, onClose, loading }: {
  initial?: Partial<Product>; categories: Category[]; onSave: (d: any) => void; onClose: () => void; loading: boolean
}) {
  const { t } = useTranslation()
  const { purityLabels } = useEnumLabels()
  const [form, setForm] = useState({
    name: initial?.name ?? '', categoryId: initial?.categoryId ?? '', weightGram: initial?.weightGram ?? 0,
    purity: initial?.purity ?? 14, purchasePrice: initial?.purchasePrice ?? 0,
    salePrice: initial?.salePrice ?? 0, stockQuantity: initial?.stockQuantity ?? 0,
    barcode: initial?.barcode ?? '',
  })
  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.type === 'number' ? +e.target.value : e.target.value }))
  const setNum = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: +e.target.value }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }}>
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">{t('products.form.name')}</label>
            <input className="input" value={form.name} onChange={set('name')} required placeholder={t('products.form.namePlaceholder')} />
          </div>
          <div>
            <label className="label">{t('products.form.category')}</label>
            <select className="select" value={form.categoryId} onChange={set('categoryId')} required>
              <option value="">{t('products.form.selectCategory')}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('products.form.purity')}</label>
            <select className="select" value={form.purity} onChange={setNum('purity')}>
              {PURITIES.map(p => <option key={p} value={p}>{purityLabels[p]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('products.form.weight')}</label>
            <input className="input" type="number" step="0.001" min="0" value={form.weightGram} onChange={set('weightGram')} required />
          </div>
          <div>
            <label className="label">{t('products.form.stock')}</label>
            <input className="input" type="number" step="0.001" min="0" value={form.stockQuantity} onChange={set('stockQuantity')} required />
          </div>
          <div>
            <label className="label">{t('products.form.purchasePrice')}</label>
            <input className="input" type="number" step="0.01" min="0" value={form.purchasePrice} onChange={set('purchasePrice')} required />
          </div>
          <div>
            <label className="label">{t('products.form.salePrice')}</label>
            <input className="input" type="number" step="0.01" min="0" value={form.salePrice} onChange={set('salePrice')} required />
          </div>
          <div className="col-span-2">
            <label className="label">{t('products.form.barcode')}</label>
            <input className="input" value={form.barcode} onChange={set('barcode')} placeholder={t('products.form.barcodeOptional')} />
          </div>
        </div>
      </div>
      <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
        <button type="button" className="btn-ghost" onClick={onClose}>{t('products.form.cancel')}</button>
        <button type="submit" className="btn-gold" disabled={loading}>{loading ? t('products.form.saving') : t('products.form.save')}</button>
      </div>
    </form>
  )
}

export default function Products() {
  const { t, i18n } = useTranslation()
  const { purityLabels } = useEnumLabels()
  const priceLocale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'tr-TR'
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => productsApi.getAll().then(r => setProducts(r.data)).finally(() => setLoading(false))
  useEffect(() => { load(); categoriesApi.getAll().then(r => setCategories(r.data)) }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (data: any) => {
    setSaving(true)
    try {
      if (modal === 'edit' && selected) await productsApi.update(selected.id, data)
      else await productsApi.create(data)
      setModal(null); setSelected(null); load()
    } finally { setSaving(false) }
  }

  const handleDelete = async (p: Product) => {
    if (!confirm(t('products.confirmDeactivate', { name: p.name }))) return
    await productsApi.remove(p.id); load()
  }

  const handleQR = async (p: Product) => {
    const res = await productsApi.qr(p.id)
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a'); a.href = url; a.download = `${p.name}-qr.png`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title gold-text">{t('products.pageTitle')}</h1>
        <button className="btn-gold flex items-center gap-2" onClick={() => { setSelected(null); setModal('create') }}>
          <Plus size={16} /> {t('products.newProduct')}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#888' }} />
        <input className="input pl-9" placeholder={t('products.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                {[t('products.columns.product'), t('products.columns.category'), t('products.columns.purity'), t('products.columns.weight'), t('products.columns.stock'), t('products.columns.purchase'), t('products.columns.sale'), t('products.columns.status'), ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('products.loading')}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('products.noResults')}</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{p.categoryName}</td>
                  <td className="px-4 py-3"><span className="badge-gold">{purityLabels[p.purity]}</span></td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{p.weightGram.toFixed(3)}gr</td>
                  <td className="px-4 py-3 font-medium text-white">{formatQty(p.stockQuantity)}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>₺{p.purchasePrice.toLocaleString(priceLocale, { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 font-medium text-white">₺{p.salePrice.toLocaleString(priceLocale, { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3"><span className={p.isActive ? 'badge-green' : 'badge-red'}>{p.isActive ? t('common.active') : t('common.inactive')}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="btn-ghost px-2 py-1 text-xs" onClick={() => handleQR(p)} title={t('products.qr')}><QrCode size={14} /></button>
                      <button className="btn-ghost px-2 py-1 text-xs" onClick={() => { setSelected(p); setModal('edit') }} title={t('products.edit')}><Edit2 size={14} /></button>
                      <button className="btn-danger px-2 py-1 text-xs" onClick={() => handleDelete(p)} title={t('products.deactivate')}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'edit' ? t('products.editTitle') : t('products.newTitle')}>
        <ProductForm initial={selected ?? undefined} categories={categories} onSave={handleSave} onClose={() => setModal(null)} loading={saving} />
      </Modal>
    </div>
  )
}
