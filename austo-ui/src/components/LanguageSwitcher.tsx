import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n'

interface LanguageSwitcherProps {
  className?: string
  // Landing page's navbar pill has much less room to work with (and no
  // fat-finger concern the way the authenticated app's header buttons did),
  // so it gets the tighter, pre-touch-target sizing instead of the default.
  compact?: boolean
}

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  tr: 'TR',
  en: 'EN',
}

export default function LanguageSwitcher({ className = '', compact = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const current = (i18n.resolvedLanguage ?? i18n.language) as SupportedLanguage
  // Scoped per instance so the sliding pill never jumps between the navbar's
  // switcher and, say, a login-page one if both ever mount at once.
  const pillId = useId()

  return (
    <div
      className={`flex items-center gap-0.5 rounded-full p-0.5 ${className}`}
      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}
      role="group"
      aria-label="Language selector"
    >
      {SUPPORTED_LANGUAGES.map(lang => {
        const isActive = current === lang
        return (
          <button
            key={lang}
            type="button"
            onClick={() => i18n.changeLanguage(lang)}
            aria-pressed={isActive}
            className={`relative rounded-full font-semibold tracking-wide ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1.5 text-[11px]'}`}
            style={{ color: isActive ? '#0A0A0A' : '#9A9A9A', transition: 'color 0.25s ease' }}
          >
            {isActive && (
              <motion.span
                layoutId={`lang-pill-${pillId}`}
                className="absolute inset-0 rounded-full"
                style={{ background: '#D4AF37' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative">{LANGUAGE_LABELS[lang]}</span>
          </button>
        )
      })}
    </div>
  )
}
