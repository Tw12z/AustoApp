import { useState } from 'react'
import { User, Lock, Bell, Database, Globe, Moon, Save, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Tab = 'profile' | 'security' | 'notifications' | 'system'

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'profile',       label: 'Profil',        icon: User     },
  { id: 'security',      label: 'Güvenlik',       icon: Lock     },
  { id: 'notifications', label: 'Bildirimler',    icon: Bell     },
  { id: 'system',        label: 'Sistem',         icon: Database },
]

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
        {desc && <div className="text-xs mt-0.5" style={{ color: '#555' }}>{desc}</div>}
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
  const [language, setLanguage] = useState('tr')
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
          <h1 className="page-title">Ayarlar</h1>
          <p className="text-sm mt-1" style={{ color: '#555' }}>Hesabınızı ve uygulama tercihlerinizi yönetin</p>
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
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-all duration-200"
              style={activeTab === t.id
                ? { background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }
                : { color: '#555', border: '1px solid transparent' }}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <>
              <Section title="Profil Bilgileri">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg,#D4AF37,#B8960C)', color: '#0A0A0A' }}>
                    {userName?.[0]?.toUpperCase() ?? 'A'}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{userName}</div>
                    <div className="text-sm" style={{ color: '#D4AF37' }}>{userRole}</div>
                    <div className="text-xs mt-1" style={{ color: '#444' }}>Aktif kullanıcı</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label">Ad Soyad</label>
                    <input className="input" placeholder={userName ?? 'Adınız'} value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">E-posta</label>
                    <input className="input" type="email" placeholder="ornek@austo.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <button onClick={() => showSaved('Profil bilgileri kaydedildi.')} className="btn-gold mt-5 flex items-center gap-2">
                  <Save size={14} /> Kaydet
                </button>
              </Section>
            </>
          )}

          {activeTab === 'security' && (
            <Section title="Şifre Değiştir">
              <div className="space-y-4">
                <div>
                  <label className="label">Mevcut Şifre</label>
                  <div className="relative">
                    <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Yeni Şifre</label>
                  <input className="input" type="password" placeholder="••••••••" value={newPw} onChange={e => setNewPw(e.target.value)} />
                </div>
                <div>
                  <label className="label">Yeni Şifre Tekrar</label>
                  <input className="input" type="password" placeholder="••••••••" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                </div>
              </div>
              <button onClick={() => showSaved('Şifre başarıyla güncellendi.')} className="btn-gold mt-5 flex items-center gap-2">
                <Lock size={14} /> Şifreyi Güncelle
              </button>
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 className="text-sm font-medium text-white mb-3">Oturum Güvenliği</h4>
                <div className="p-4 rounded-xl text-sm" style={{ background: '#0A0A0A', border: '1px solid #1a1a1a' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">JWT Token</div>
                      <div className="text-xs mt-0.5" style={{ color: '#555' }}>Otomatik yenileme aktif · 24 saat geçerlilik</div>
                    </div>
                    <span className="badge-green text-xs">Aktif</span>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'notifications' && (
            <Section title="Bildirim Tercihleri">
              <Toggle label="Satış Bildirimleri" desc="Yeni satış yapıldığında bildirim al" checked={notifSales} onChange={setNotifSales} />
              <Toggle label="Stok Uyarıları" desc="Stok azaldığında uyarı gönder" checked={notifStock} onChange={setNotifStock} />
              <Toggle label="Altın Fiyat Alarmı" desc="Fiyat eşiği aşıldığında bildir" checked={notifGold} onChange={setNotifGold} />
              <Toggle label="E-posta Bildirimleri" desc="Günlük özet raporunu e-posta ile al" checked={notifEmail} onChange={setNotifEmail} />
              <button onClick={() => showSaved('Bildirim tercihleri kaydedildi.')} className="btn-gold mt-5 flex items-center gap-2">
                <Save size={14} /> Kaydet
              </button>
            </Section>
          )}

          {activeTab === 'system' && (
            <>
              <Section title="Görünüm">
                <Toggle label="Karanlık Mod" desc="Siyah tema (varsayılan)" checked={darkMode} onChange={() => {}} />
              </Section>
              <Section title="Dil & Para Birimi">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Globe size={16} style={{ color: '#555' }} />
                    <div className="flex-1">
                      <label className="label">Dil</label>
                      <select className="select" value={language} onChange={e => setLanguage(e.target.value)}>
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Moon size={16} style={{ color: '#555' }} />
                    <div className="flex-1">
                      <label className="label">Para Birimi</label>
                      <select className="select" value={currency} onChange={e => setCurrency(e.target.value)}>
                        <option value="TRY">Türk Lirası (₺)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={() => showSaved('Sistem ayarları kaydedildi.')} className="btn-gold mt-5 flex items-center gap-2">
                  <Save size={14} /> Kaydet
                </button>
              </Section>
              <Section title="Uygulama Hakkında">
                <div className="space-y-3 text-sm">
                  {[
                    ['Versiyon', 'Austo v1.0.0'],
                    ['Backend', '.NET 10 · Onion Architecture'],
                    ['Frontend', 'React 19 · Vite · TypeScript'],
                    ['Veritabanı', 'SQL Server · Entity Framework Core 10'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: '#555' }}>{k}</span>
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
