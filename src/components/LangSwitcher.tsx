import { useLang } from '../contexts/LangContext'

function FlagRU({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <clipPath id="flagCircleRU"><circle cx="8" cy="8" r="8" /></clipPath>
      <g clipPath="url(#flagCircleRU)">
        <rect y="0" width="16" height="5.33" fill="#fff" />
        <rect y="5.33" width="16" height="5.33" fill="#0039a6" />
        <rect y="10.67" width="16" height="5.33" fill="#d52b1e" />
      </g>
    </svg>
  )
}

function FlagEN({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <clipPath id="flagCircleEN"><circle cx="8" cy="8" r="8" /></clipPath>
      <g clipPath="url(#flagCircleEN)">
        <rect width="16" height="16" fill="#012169" />
        <path d="M0 0L16 16M16 0L0 16" stroke="#fff" strokeWidth="2.5" />
        <path d="M0 0L16 16M16 0L0 16" stroke="#c8102e" strokeWidth="1.5" />
        <path d="M8 0V16M0 8H16" stroke="#fff" strokeWidth="4" />
        <path d="M8 0V16M0 8H16" stroke="#c8102e" strokeWidth="2.5" />
      </g>
    </svg>
  )
}

export default function LangSwitcher() {
  const { lang, toggleLang } = useLang()

  return (
    <button
      onClick={toggleLang}
      className="inline-flex items-center justify-center gap-1.5 w-[4.5rem] h-10 rounded-full bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
      aria-label={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
    >
      {lang === 'ru' ? <FlagRU className="w-3.5 h-3.5" /> : <FlagEN className="w-3.5 h-3.5" />}
      {lang === 'ru' ? 'EN' : 'RU'}
    </button>
  )
}
