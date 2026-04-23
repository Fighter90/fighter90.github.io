import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Lang } from '../i18n'

interface LangContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

const LangContext = createContext<LangContextType | null>(null)

function detectLang(): Lang {
  if (typeof window === 'undefined') return 'ru'
  const urlLang = new URLSearchParams(window.location.search).get('lang')
  if (urlLang === 'en' || urlLang === 'ru') return urlLang
  const stored = localStorage.getItem('lang')
  if (stored === 'en' || stored === 'ru') return stored
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('ru')) return 'ru'
  return 'ru'
}

function setMetaContent(selector: string, value: string) {
  const el = document.querySelector(selector)
  if (el) el.setAttribute('content', value)
}

function applyMeta(lang: Lang) {
  const m = translations[lang].meta
  document.documentElement.lang = lang
  document.title = m.title
  setMetaContent('meta[name="title"]', m.title)
  setMetaContent('meta[name="description"]', m.description)
  setMetaContent('meta[property="og:title"]', m.ogTitle)
  setMetaContent('meta[property="og:description"]', m.ogDescription)
  setMetaContent('meta[property="og:locale"]', m.ogLocale)
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectLang())

  useEffect(() => {
    applyMeta(lang)
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  const toggleLang = () => {
    setLang(lang === 'ru' ? 'en' : 'ru')
  }

  return (
    <LangContext value={{ lang, setLang, toggleLang }}>
      {children}
    </LangContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
