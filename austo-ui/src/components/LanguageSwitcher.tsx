import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n'

interface LanguageSwitcherProps {
  className?: string
}

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  tr: 'TR',
  en: 'EN',
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const current = (i18n.resolvedLanguage ?? i18n.language) as SupportedLanguage

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
            className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide transition-colors"
            style={{
              color: isActive ? '#0A0A0A' : '#9A9A9A',
              background: isActive ? '#D4AF37' : 'transparent',
            }}
          >
            {LANGUAGE_LABELS[lang]}
          </button>
        )
      })}
    </div>
  )
}
