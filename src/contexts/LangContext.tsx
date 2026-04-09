import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Lang } from '../i18n'

interface LangContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

const LangContext = createContext<LangContextType | null>(null)

function detectLang(): Lang {
  const urlLang = new URLSearchParams(window.location.search).get('lang')
  if (urlLang === 'en' || urlLang === 'ru') return urlLang
  const stored = localStorage.getItem('lang')
  if (stored === 'en' || stored === 'ru') return stored
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('ru')) return 'ru'
  return 'ru' // default RU
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru')

  useEffect(() => {
    setLangState(detectLang())
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
    document.documentElement.lang = l
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

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
