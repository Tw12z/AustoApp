import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Lock, Bell, Database, Globe, Moon, Save, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n'

type Tab = 'profile' | 'security' | 'notifications' | 'system'

const TAB_ICONS: Record<Tab, any> = { profile: User, security: Lock, notifications: Bell, system: Database }
const TAB_IDS: Tab[] = ['profile', 'security', 'notifications', 'system']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 mb-4">
      <h3 className="font-semibold text-white mb-5 pb-4" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>{title}</h3>
      {children}
    </div>
  )
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        {desc && <div className="text-xs mt-0.5" style={{ color: '#888' }}>{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-all duration-300 shrink-0"
        style={{ background: checked ? 'linear-gradient(135deg,#D4AF37,#F5C842)' : '#222', border: `1px solid ${checked ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}` }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 shadow"
          style={{ background: '#fff', left: checked ? 'calc(100% - 22px)' : '2px' }}
        />
      </button>
    </div>
  )
}

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { userName, userRole } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  // Profile
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  // Security
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)

  // Notifications
  const [notifSales, setNotifSales]   = useState(true)
  const [notifStock, setNotifStock]   = useState(true)
  const [notifGold, setNotifGold]     = useState(false)
  const [notifEmail, setNotifEmail]   = useState(false)

  // System
  const [darkMode]   = useState(true)
  const language = (i18n.resolvedLanguage ?? i18n.language) as SupportedLanguage
  const [currency, setCurrency] = useState('TRY')

  const [saved, setSaved] = useState('')

  const showSaved = (msg: string) => {
    setSaved(msg)
    setTimeout(() => setSaved(''), 3000)
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{t('settings.pageTitle')}</h1>
          <p className="text-sm mt-1" style={{ color: '#888' }}>{t('settings.pageSubtitle')}</p>
        </div>
        {saved && (
          <div className="text-sm px-4 py-2 rounded-lg" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
            {saved}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="shrink-0 w-44">
          {TAB_IDS.map(id => {
            const Icon = TAB_ICONS[id]
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-all duration-200"
                style={activeTab === id
                  ? { background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }
                  : { color: '#888', border: '1px solid transparent' }}
              >
                <Icon size={15} />
                {t(`settings.tabs.${id}`)}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <>
              <Section title={t('settings.profile.sectionTitle')}>
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg,#D4AF37,#B8960C)', color: '#0A0A0A' }}>
                    {userName?.[0]?.toUpperCase() ?? 'A'}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{userName}</div>
                    <div className="text-sm" style={{ color: '#D4AF37' }}>{userRole}</div>
                    <div className="text-xs mt-1" style={{ color: '#7D7D7D' }}>{t('settings.profile.activeUser')}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label">{t('settings.profile.fullName')}</label>
                    <input className="input" placeholder={userName ?? t('settings.profile.fullNamePlaceholder')} value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">{t('settings.profile.email')}</label>
                    <input className="input" type="email" placeholder={t('common.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <button onClick={() => showSaved(t('settings.profile.saved'))} className="btn-gold mt-5 flex items-center gap-2">
                  <Save size={14} /> {t('settings.profile.save')}
                </button>
              </Section>
            </>
          )}

          {activeTab === 'security' && (
            <Section title={t('settings.security.sectionTitle')}>
              <div className="space-y-4">
                <div>
                  <label className="label">{t('settings.security.currentPassword')}</label>
                  <div className="relative">
                    <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" onClick={() => setShowPw(v => !v)} aria-label={showPw ? t('common.hidePassword') : t('common.showPassword')}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">{t('settings.security.newPassword')}</label>
                  <input className="input" type="password" placeholder="••••••••" value={newPw} onChange={e => setNewPw(e.target.value)} />
                </div>
                <div>
                  <label className="label">{t('settings.security.confirmNewPassword')}</label>
                  <input className="input" type="password" placeholder="••••••••" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                </div>
              </div>
              <button onClick={() => showSaved(t('settings.security.saved'))} className="btn-gold mt-5 flex items-center gap-2">
                <Lock size={14} /> {t('settings.security.updatePassword')}
              </button>
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 className="text-sm font-medium text-white mb-3">{t('settings.security.sessionSecurity')}</h4>
                <div className="p-4 rounded-xl text-sm" style={{ background: '#0A0A0A', border: '1px solid #1a1a1a' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{t('settings.security.jwtToken')}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#888' }}>{t('settings.security.jwtDesc')}</div>
                    </div>
                    <span className="badge-green text-xs">{t('settings.security.active')}</span>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'notifications' && (
            <Section title={t('settings.notifications.sectionTitle')}>
              <Toggle label={t('settings.notifications.sales.label')} desc={t('settings.notifications.sales.desc')} checked={notifSales} onChange={setNotifSales} />
              <Toggle label={t('settings.notifications.stock.label')} desc={t('settings.notifications.stock.desc')} checked={notifStock} onChange={setNotifStock} />
              <Toggle label={t('settings.notifications.gold.label')} desc={t('settings.notifications.gold.desc')} checked={notifGold} onChange={setNotifGold} />
              <Toggle label={t('settings.notifications.email.label')} desc={t('settings.notifications.email.desc')} checked={notifEmail} onChange={setNotifEmail} />
              <button onClick={() => showSaved(t('settings.notifications.saved'))} className="btn-gold mt-5 flex items-center gap-2">
                <Save size={14} /> {t('settings.notifications.save')}
              </button>
            </Section>
          )}

          {activeTab === 'system' && (
            <>
              <Section title={t('settings.system.appearance')}>
                <Toggle label={t('settings.system.darkMode.label')} desc={t('settings.system.darkMode.desc')} checked={darkMode} onChange={() => {}} />
              </Section>
              <Section title={t('settings.system.languageCurrency')}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Globe size={16} style={{ color: '#888' }} />
                    <div className="flex-1">
                      <label className="label">{t('settings.system.language')}</label>
                      <select className="select" value={language} onChange={e => i18n.changeLanguage(e.target.value as SupportedLanguage)}>
                        {SUPPORTED_LANGUAGES.map(lang => (
                          <option key={lang} value={lang}>{lang === 'tr' ? 'Türkçe' : 'English'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Moon size={16} style={{ color: '#888' }} />
                    <div className="flex-1">
                      <label className="label">{t('settings.system.currency')}</label>
                      <select className="select" value={currency} onChange={e => setCurrency(e.target.value)}>
                        <option value="TRY">Türk Lirası (₺)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={() => showSaved(t('settings.system.saved'))} className="btn-gold mt-5 flex items-center gap-2">
                  <Save size={14} /> {t('settings.system.save')}
                </button>
              </Section>
              <Section title={t('settings.system.about')}>
                <div className="space-y-3 text-sm">
                  {[
                    [t('settings.system.fields.version'), 'Austo v1.0.0'],
                    [t('settings.system.fields.backend'), '.NET 10 · Onion Architecture'],
                    [t('settings.system.fields.frontend'), 'React 19 · Vite · TypeScript'],
                    [t('settings.system.fields.database'), 'SQL Server · Entity Framework Core 10'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: '#888' }}>{k}</span>
                      <span className="text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
