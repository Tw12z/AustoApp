import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from './Logo'

// Shared shell for the legal/compliance documents (Terms, Privacy/KVKK,
// Distance Sales Agreement). Deliberately plain — no LineWaves/animation —
// these are documents to read, not a landing surface to be sold on.
export default function LegalPage({ title, updated, children }: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#000' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/"><Logo className="h-8 w-auto cursor-pointer" style={{ color: '#D4AF37' }} /></Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm transition-colors hover:text-white" style={{ color: '#888' }}>
            <ArrowLeft size={14} /> Ana Sayfa
          </Link>
        </div>

        <div className="card p-6 md:p-10">
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          <p className="text-xs mb-8" style={{ color: '#666' }}>Son güncelleme: {updated}</p>

          <div className="legal-prose">{children}</div>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: '#444' }}>© 2026 Austo · Kuyumcu Yönetim Sistemi</p>
      </div>

      <style>{`
        .legal-prose h2 { color: #D4AF37; font-size: 15px; font-weight: 700; margin: 28px 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .legal-prose h2:first-child { margin-top: 0; }
        .legal-prose p, .legal-prose li { color: #aaa; font-size: 14px; line-height: 1.75; }
        .legal-prose p { margin: 0 0 12px; }
        .legal-prose ul { margin: 0 0 12px; padding-left: 20px; list-style: disc; }
        .legal-prose li { margin-bottom: 6px; }
        .legal-prose strong { color: #ddd; }
        .legal-prose a { color: #D4AF37; text-decoration: underline; }
      `}</style>
    </div>
  )
}
