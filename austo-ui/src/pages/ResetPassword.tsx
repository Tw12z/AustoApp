import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { authApi } from '../api/client'
import Logo from '../components/Logo'
import LineWaves from '../components/LineWaves'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()

  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) { setError('Şifreler eşleşmiyor.'); return }
    if (newPw.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return }
    setError('')
    setLoading(true)
    try {
      await authApi.resetPassword(token, newPw)
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Şifre sıfırlama başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#000' }}>
      <div className="fixed inset-0 pointer-events-none">
        <LineWaves className="absolute inset-0" color="#D4AF37" lineCount={22} amplitude={55} opacity={0.5} speed={0.35} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,0,0,0.55) 0%, transparent 100%)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative w-full max-w-sm">
        <Logo className="h-10 w-auto mx-auto mb-8" style={{ color: '#D4AF37' }} />

        <div className="card p-8">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#D4AF37,#F5C842)', boxShadow: '0 0 30px rgba(212,175,55,0.4)' }}>
                <CheckCircle size={32} className="text-black" />
              </div>
              <h2 className="text-xl font-bold text-white">Şifre Güncellendi!</h2>
              <p className="text-sm text-center" style={{ color: '#888' }}>Giriş sayfasına yönlendiriliyorsunuz...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-1">Yeni Şifre Belirle</h2>
              <p className="text-sm mb-6" style={{ color: '#555' }}>Hesabınız için yeni bir şifre oluşturun.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Yeni Şifre</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(212,175,55,0.5)' }} />
                    <input className="input pl-8 pr-9" type={showPw ? 'text' : 'password'}
                      placeholder="••••••••" value={newPw} onChange={e => setNewPw(e.target.value)} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Şifre Tekrar</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(212,175,55,0.5)' }} />
                    <input className="input pl-8" type="password"
                      placeholder="••••••••" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
                  </div>
                </div>
                {error && <div className="text-sm px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
                <button type="submit" disabled={loading || !token} className="w-full py-3 rounded-full font-semibold text-black transition-all duration-300 hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #bf953f, #fcf6ba 20%, #b38728 40%, #fbf5b7 60%, #aa771c 80%, #bf953f 100%)' }}>
                  {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
