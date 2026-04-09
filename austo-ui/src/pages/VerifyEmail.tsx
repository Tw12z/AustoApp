import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { authApi } from '../api/client'
import Logo from '../components/Logo'
import LineWaves from '../components/LineWaves'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Geçersiz doğrulama bağlantısı.'); return }
    authApi.verifyEmail(token)
      .then(res => { setStatus('success'); setMessage(res.data.message) })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.message ?? 'Doğrulama başarısız.') })
  }, [token])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#000' }}>
      <div className="fixed inset-0 pointer-events-none">
        <LineWaves className="absolute inset-0" color="#D4AF37" lineCount={22} amplitude={55} opacity={0.5} speed={0.35} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,0,0,0.55) 0%, transparent 100%)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative text-center max-w-sm w-full">
        <Logo className="h-10 w-auto mx-auto mb-8" style={{ color: '#D4AF37' }} />

        <div className="card p-10">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader size={40} className="animate-spin" style={{ color: '#D4AF37' }} />
              <p className="text-white">Doğrulanıyor...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#D4AF37,#F5C842)', boxShadow: '0 0 30px rgba(212,175,55,0.4)' }}>
                <CheckCircle size={32} className="text-black" />
              </div>
              <h2 className="text-xl font-bold text-white">E-posta Doğrulandı!</h2>
              <p className="text-sm" style={{ color: '#888' }}>{message}</p>
              <Link to="/login" className="btn-gold w-full mt-2 text-center">Giriş Yap</Link>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <XCircle size={40} style={{ color: '#EF4444' }} />
              <h2 className="text-xl font-bold text-white">Doğrulama Başarısız</h2>
              <p className="text-sm" style={{ color: '#888' }}>{message}</p>
              <Link to="/login" className="btn-outline w-full text-center mt-2">Geri Dön</Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
