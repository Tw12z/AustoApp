import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, PhoneCall, CheckCircle2, XCircle } from 'lucide-react'
import { demoRequestsApi } from '../api/client'

interface DemoRequest {
  id: string
  fullName: string
  businessName: string
  phone: string
  email?: string
  note?: string
  status: number
  createdAt: string
}

const STATUS_CLS: Record<number, string> = { 1: 'badge-gold', 2: 'badge-gray', 3: 'badge-green', 4: 'badge-red' }

export default function DemoRequests() {
  const { t, i18n } = useTranslation()
  const [items, setItems] = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const dateLocale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'tr-TR'

  const load = () => demoRequestsApi.getAll().then((r: { data: DemoRequest[] }) => setItems(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const statusLabel = (status: number) => t(`demoRequests.status.${status}`)

  const setStatus = async (id: string, status: number) => {
    setUpdatingId(id)
    try { await demoRequestsApi.updateStatus(id, status); await load() }
    finally { setUpdatingId(null) }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title gold-text">{t('demoRequests.pageTitle')}</h1>
        <p className="text-sm mt-1" style={{ color: '#888' }}>{t('demoRequests.subtitle')}</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                {[t('demoRequests.columns.date'), t('demoRequests.columns.fullName'), t('demoRequests.columns.business'), t('demoRequests.columns.contact'), t('common.status'), ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('common.loading')}</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#888' }}>{t('demoRequests.noResults')}</td></tr>
              ) : items.map(r => {
                const busy = updatingId === r.id
                return (
                  <tr key={r.id} className="table-row">
                    <td className="px-4 py-3" style={{ color: '#888' }}>{new Date(r.createdAt).toLocaleString(dateLocale)}</td>
                    <td className="px-4 py-3 font-medium text-white">{r.fullName}</td>
                    <td className="px-4 py-3" style={{ color: '#888' }}>{r.businessName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: '#888' }}><Phone size={11} />{r.phone}</span>
                        {r.email && <span className="flex items-center gap-1.5 text-xs" style={{ color: '#888' }}><Mail size={11} />{r.email}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={STATUS_CLS[r.status] ?? 'badge-gray'}>{statusLabel(r.status)}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost px-2 py-1 text-xs" disabled={busy} title={t('demoRequests.actions.contacted')}
                          onClick={() => setStatus(r.id, 2)}><PhoneCall size={14} /></button>
                        <button className="btn-ghost px-2 py-1 text-xs" disabled={busy} title={t('demoRequests.actions.converted')}
                          style={{ color: '#22C55E' }} onClick={() => setStatus(r.id, 3)}><CheckCircle2 size={14} /></button>
                        <button className="btn-danger px-2 py-1 text-xs" disabled={busy} title={t('demoRequests.actions.declined')}
                          onClick={() => setStatus(r.id, 4)}><XCircle size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
