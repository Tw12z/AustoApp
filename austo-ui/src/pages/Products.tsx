import { useEffect, useState } from 'react'
import { Plus, QrCode, Search, Edit2, Trash2, X } from 'lucide-react'
import { productsApi, categoriesApi } from '../api/client'
import type { Product, Category } from '../types'
import { PURITY_LABELS } from '../types'

const PURITIES = [0, 8, 14, 18, 21, 22, 24]

function Modal({ open, onClose, title, children }: any) {
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

function ProductForm({ initial, categories, onSave, onClose, loading }: {
  initial?: Partial<Product>; categories: Category[]; onSave: (d: any) => void; onClose: () => void; loading: boolean
}) {
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
            <label className="label">Ürün Adı</label>
            <input className="input" value={form.name} onChange={set('name')} required placeholder="22 Ayar Altın Bilezik" />
          </div>
          <div>
            <label className="label">Kategori</label>
            <select className="select" value={form.categoryId} onChange={set('categoryId')} required>
              <option value="">Seçin</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ayar</label>
            <select className="select" value={form.purity} onChange={setNum('purity')}>
              {PURITIES.map(p => <option key={p} value={p}>{PURITY_LABELS[p]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ağırlık (gram)</label>
            <input className="input" type="number" step="0.001" min="0" value={form.weightGram} onChange={set('weightGram')} required />
          </div>
          <div>
            <label className="label">Stok (adet)</label>
            <input className="input" type="number" step="0.001" min="0" value={form.stockQuantity} onChange={set('stockQuantity')} required />
          </div>
          <div>
            <label className="label">Alış Fiyatı (₺)</label>
            <input className="input" type="number" step="0.01" min="0" value={form.purchasePrice} onChange={set('purchasePrice')} required />
          </div>
          <div>
            <label className="label">Satış Fiyatı (₺)</label>
            <input className="input" type="number" step="0.01" min="0" value={form.salePrice} onChange={set('salePrice')} required />
          </div>
          <div className="col-span-2">
            <label className="label">Barkod</label>
            <input className="input" value={form.barcode} onChange={set('barcode')} placeholder="Opsiyonel" />
          </div>
        </div>
      </div>
      <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
        <button type="button" className="btn-ghost" onClick={onClose}>İptal</button>
        <button type="submit" className="btn-gold" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
      </div>
    </form>
  )
}

export default function Products() {
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
    if (!confirm(`"${p.name}" pasif yapılsın mı?`)) return
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
      <div className="flex items-center justify-between">
        <h1 className="page-title gold-text">Ürünler</h1>
        <button className="btn-gold flex items-center gap-2" onClick={() => { setSelected(null); setModal('create') }}>
          <Plus size={16} /> Yeni Ürün
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#555' }} />
        <input className="input pl-9" placeholder="Ürün veya kategori ara..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                {['Ürün', 'Kategori', 'Ayar', 'Ağırlık', 'Stok', 'Alış', 'Satış', 'Durum', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center" style={{ color: '#555' }}>Yükleniyor...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center" style={{ color: '#555' }}>Ürün bulunamadı.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{p.categoryName}</td>
                  <td className="px-4 py-3"><span className="badge-gold">{PURITY_LABELS[p.purity]}</span></td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{p.weightGram.toFixed(3)}gr</td>
                  <td className="px-4 py-3 font-medium text-white">{p.stockQuantity.toFixed(2)}</td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>₺{p.purchasePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 font-medium text-white">₺{p.salePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3"><span className={p.isActive ? 'badge-green' : 'badge-red'}>{p.isActive ? 'Aktif' : 'Pasif'}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="btn-ghost px-2 py-1 text-xs" onClick={() => handleQR(p)} title="QR"><QrCode size={14} /></button>
                      <button className="btn-ghost px-2 py-1 text-xs" onClick={() => { setSelected(p); setModal('edit') }} title="Düzenle"><Edit2 size={14} /></button>
                      <button className="btn-danger px-2 py-1 text-xs" onClick={() => handleDelete(p)} title="Pasif"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'edit' ? 'Ürün Düzenle' : 'Yeni Ürün'}>
        <ProductForm initial={selected ?? undefined} categories={categories} onSave={handleSave} onClose={() => setModal(null)} loading={saving} />
      </Modal>
    </div>
  )
}
