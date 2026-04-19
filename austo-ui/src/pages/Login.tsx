import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, AtSign, ArrowLeft, MailCheck } from 'lucide-react'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import LineWaves from '../components/LineWaves'

type View = 'auth' | 'forgot' | 'forgotSent' | 'registered'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [view, setView] = useState<View>('auth')

  const [loginForm, setLoginForm] = useState({ userNameOrEmail: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ fullName: '', email: '', userName: '', password: '', confirmPassword: '' })
  const [forgotEmail, setForgotEmail] = useState('')

  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devToken, setDevToken] = useState<string | null>(null)  // dev only

  const resetErrors = () => { setError(''); setDevToken(null) }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    resetErrors()
    setLoading(true)
    try {
      const res = await authApi.login(loginForm)
      login(res.data.accessToken, res.data.userName, res.data.userRole)
      navigate('/app')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Giriş başarısız.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    resetErrors()
    if (registerForm.password !== registerForm.confirmPassword) { setError('Şifreler eşleşmiyor.'); return }
    setLoading(true)
    try {
      const res = await authApi.register({ ...registerForm, role: 2 })
      // If SMTP not configured, backend returns devVerifyToken
      if (res.data.devVerifyToken) setDevToken(res.data.devVerifyToken)
      setView('registered')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Kayıt başarısız.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    resetErrors()
    setLoading(true)
    try {
      const res = await authApi.forgotPassword(forgotEmail)
      if (res.data.devResetToken) setDevToken(res.data.devResetToken)
      setView('forgotSent')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'İşlem başarısız.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (signup: boolean) => { setIsSignUp(signup); resetErrors() }
  const backToAuth = () => { setView('auth'); resetErrors() }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#000' }}>
      {/* Line waves background */}
      <div className="fixed inset-0 pointer-events-none">
        <LineWaves className="absolute inset-0" color="#D4AF37" lineCount={22} amplitude={55} opacity={0.5} speed={0.35} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,0,0,0.55) 0%, transparent 100%)' }} />
      </div>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10 relative">
        <Logo className="h-12 w-auto cursor-pointer" style={{ color: '#D4AF37' }} onClick={() => navigate('/')} />
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ── FORGOT PASSWORD ── */}
        {view === 'forgot' && (
          <motion.div key="forgot" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }} className="relative w-full max-w-sm">
            <div className="card p-8">
              <button onClick={backToAuth} className="flex items-center gap-1.5 text-sm mb-6 transition-colors hover:text-white" style={{ color: '#555' }}>
                <ArrowLeft size={14} /> Geri Dön
              </button>
              <h2 className="text-xl font-bold text-white mb-1">Şifremi Unuttum</h2>
              <p className="text-sm mb-6" style={{ color: '#555' }}>E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.</p>
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="label">E-posta</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(212,175,55,0.5)' }} />
                    <input className="input pl-8" type="email" placeholder="ornek@austo.com"
                      value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                  </div>
                </div>
                {error && <div className="text-sm px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
                <button type="submit" disabled={loading} className="w-full py-3 rounded-full font-semibold text-black disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #bf953f, #fcf6ba 20%, #b38728 40%, #fbf5b7 60%, #aa771c 80%, #bf953f 100%)' }}>
                  {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── FORGOT SENT ── */}
        {view === 'forgotSent' && (
          <motion.div key="forgotSent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }} className="relative w-full max-w-sm">
            <div className="card p-8 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <MailCheck size={26} style={{ color: '#D4AF37' }} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">E-posta Gönderildi</h2>
              <p className="text-sm mb-6" style={{ color: '#666' }}>
                <span style={{ color: '#D4AF37' }}>{forgotEmail}</span> adresine şifre sıfırlama bağlantısı gönderildi.
              </p>
              {devToken && (
                <div className="text-xs px-3 py-2 rounded-lg mb-4 text-left break-all"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', color: '#888' }}>
                  <span style={{ color: '#D4AF37' }}>Dev:</span> <a href={`/reset-password?token=${devToken}`} className="underline hover:text-white">Sıfırlama bağlantısı →</a>
                </div>
              )}
              <button onClick={backToAuth} className="btn-outline w-full">Giriş Sayfasına Dön</button>
            </div>
          </motion.div>
        )}

        {/* ── REGISTERED ── */}
        {view === 'registered' && (
          <motion.div key="registered" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }} className="relative w-full max-w-sm">
            <div className="card p-8 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <MailCheck size={26} style={{ color: '#D4AF37' }} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Hesabınız Oluşturuldu!</h2>
              <p className="text-sm mb-5" style={{ color: '#666' }}>
                Giriş yapabilmek için <span style={{ color: '#D4AF37' }}>{registerForm.email}</span> adresine gönderilen doğrulama bağlantısına tıklayın.
              </p>
              {devToken && (
                <div className="text-xs px-3 py-2 rounded-lg mb-4 text-left break-all"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', color: '#888' }}>
                  <span style={{ color: '#D4AF37' }}>Dev (SMTP yok):</span>{' '}
                  <a href={`/verify-email?token=${devToken}`} className="underline hover:text-white">E-postayı doğrula →</a>
                </div>
              )}
              <button onClick={backToAuth} className="btn-outline w-full">Giriş Sayfasına Dön</button>
            </div>
          </motion.div>
        )}

        {/* ── MAIN AUTH CARD ── */}
        {view === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }} className="relative w-full max-w-3xl overflow-hidden rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(10px)', minHeight: 520 }}>

            {/* Sign In Form — left */}
            <div className="absolute top-0 left-0 w-1/2 h-full flex items-center justify-center p-10">
              <div className="w-full">
                <h2 className="text-2xl font-bold text-white mb-1">Giriş Yap — <span style={{ color: '#D4AF37' }}>Austo</span></h2>
                <p className="text-sm mb-6" style={{ color: '#666' }}>Hesabınıza erişin</p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="label">Kullanıcı Adı / E-posta</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(212,175,55,0.5)' }} />
                      <input className="input pl-8" placeholder="kullanici@austo.com"
                        value={loginForm.userNameOrEmail} onChange={e => setLoginForm(f => ({ ...f, userNameOrEmail: e.target.value }))} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Şifre</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(212,175,55,0.5)' }} />
                      <input className="input pl-8 pr-9" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                        value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} required />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" onClick={() => setShowPw(v => !v)}>
                        {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setView('forgot'); resetErrors() }}
                    className="text-xs transition-colors hover:text-white" style={{ color: '#555' }}>
                    Şifremi unuttum →
                  </button>
                  {!isSignUp && error && (
                    <div className="text-sm px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>
                  )}
                  <button type="submit" disabled={loading} className="w-full py-3 rounded-full font-semibold text-black disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #bf953f, #fcf6ba 20%, #b38728 40%, #fbf5b7 60%, #aa771c 80%, #bf953f 100%)' }}>
                    {loading && !isSignUp ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                  </button>
                </form>
              </div>
            </div>

            {/* Sign Up Form — right */}
            <div className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-center p-10">
              <div className="w-full">
                <h2 className="text-2xl font-bold text-white mb-1">Hesap <span style={{ color: '#D4AF37' }}>Oluştur</span></h2>
                <p className="text-sm mb-5" style={{ color: '#666' }}>Austo'ya katılın</p>
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="label">Ad Soyad</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(212,175,55,0.5)' }} />
                      <input className="input pl-8" placeholder="Ahmet Yılmaz" value={registerForm.fullName}
                        onChange={e => setRegisterForm(f => ({ ...f, fullName: e.target.value }))} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">E-posta</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(212,175,55,0.5)' }} />
                      <input className="input pl-8" type="email" placeholder="ornek@austo.com" value={registerForm.email}
                        onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Kullanıcı Adı</label>
                    <div className="relative">
                      <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(212,175,55,0.5)' }} />
                      <input className="input pl-8" placeholder="kullanici_adi" value={registerForm.userName}
                        onChange={e => setRegisterForm(f => ({ ...f, userName: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label">Şifre</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(212,175,55,0.5)' }} />
                        <input className="input pl-8 pr-8" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                          value={registerForm.password} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} required />
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" onClick={() => setShowPw(v => !v)}>
                          {showPw ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label">Tekrar</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(212,175,55,0.5)' }} />
                        <input className="input pl-8 pr-8" type={showConfirmPw ? 'text' : 'password'} placeholder="••••••••"
                          value={registerForm.confirmPassword} onChange={e => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" onClick={() => setShowConfirmPw(v => !v)}>
                          {showConfirmPw ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {isSignUp && error && (
                    <div className="text-sm px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>
                  )}
                  <button type="submit" disabled={loading} className="w-full py-3 rounded-full font-semibold text-black disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #bf953f, #fcf6ba 20%, #b38728 40%, #fbf5b7 60%, #aa771c 80%, #bf953f 100%)' }}>
                    {loading && isSignUp ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                  </button>
                </form>
              </div>
            </div>

            {/* Sliding dark panel */}
            <motion.div
              className="absolute top-0 bottom-0 w-1/2 z-10 flex flex-col items-center justify-center p-12 text-center"
              animate={{ left: isSignUp ? '0%' : '50%' }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              style={{ background: 'linear-gradient(135deg, #050505, #111)' }}
            >
              <Logo className="h-10 w-auto mb-6 cursor-pointer" style={{ color: '#D4AF37' }} onClick={() => navigate('/')} />
              <h2 className="text-2xl font-bold text-white mb-3">{isSignUp ? 'Tekrar Hoş Geldiniz!' : 'Merhaba!'}</h2>
              <p className="text-sm mb-8 max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {isSignUp
                  ? 'Hesabınızla giriş yaparak tüm özelliklere erişin.'
                  : 'Kuyumcu yönetim sistemine katılmak için kayıt olun.'}
              </p>
              <button onClick={() => switchMode(!isSignUp)}
                className="px-8 py-2.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-300"
                style={{ border: '2px solid #D4AF37', color: '#D4AF37', background: 'transparent' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#D4AF37'; el.style.color = '#000' }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'transparent'; el.style.color = '#D4AF37' }}>
                {isSignUp ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      <p className="relative text-center text-xs mt-8" style={{ color: '#222' }}>© 2026 Austo · Kuyumcu Yönetim Sistemi</p>
    </div>
  )
}
