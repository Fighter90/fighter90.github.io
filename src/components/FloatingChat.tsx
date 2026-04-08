import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Briefcase, Rocket, CircleHelp, Mail } from 'lucide-react'
import { useLang } from '../contexts/LangContext'
import type { Lang } from '../i18n'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type MessageRole = 'user' | 'assistant'

interface ChatMessage {
  id: string
  role: MessageRole
  text: string
  html?: boolean
}

type PromptKey = 'experience' | 'projects' | 'why' | 'contact'

interface QuickPrompt {
  key: PromptKey
  icon: React.ReactNode
  label: Record<Lang, string>
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const quickPrompts: QuickPrompt[] = [
  { key: 'experience', icon: <Briefcase className="w-4 h-4" />, label: { ru: 'Опыт работы', en: 'Work experience' } },
  { key: 'projects',   icon: <Rocket className="w-4 h-4" />,    label: { ru: 'Проекты', en: 'Featured projects' } },
  { key: 'why',        icon: <CircleHelp className="w-4 h-4" />, label: { ru: 'Почему я?', en: 'Why hire me?' } },
  { key: 'contact',    icon: <Mail className="w-4 h-4" />,       label: { ru: 'Контакт', en: 'Contact' } },
]

const predefinedResponses: Record<PromptKey, Record<Lang, { text: string; html?: boolean }>> = {
  experience: {
    ru: {
      text: '14+ лет в backend: PHP, Go, Symfony. Rambler&Co, Lamoda, Авито, МТС Финтех. Высоконагруженные системы, микросервисы, CI/CD.',
    },
    en: {
      text: '14+ years in backend: PHP, Go, Symfony. Rambler&Co, Lamoda, Avito, MTS Fintech. High-load systems, microservices, CI/CD.',
    },
  },
  projects: {
    ru: {
      text: 'ResumeCraft — мульти-агентный SaaS (5 LLM). ICAIMT 2026 — научная статья об агентном ИИ. Career-Ops — AI-поиск работы.',
    },
    en: {
      text: 'ResumeCraft — multi-agent SaaS (5 LLMs). ICAIMT 2026 — research paper on agentic AI. Career-Ops — AI-powered job search.',
    },
  },
  why: {
    ru: {
      text: 'Глубокая экспертиза в backend + изучаю продуктовый менеджмент в ВШЭ. Умею выстраивать архитектуру, менторить команды и доводить проекты до продакшена.',
    },
    en: {
      text: 'Deep backend expertise + studying product management at HSE. I design architecture, mentor teams, and ship projects to production.',
    },
  },
  contact: {
    ru: {
      text: '<a href="mailto:pochtasergeia@gmail.com" class="underline hover:text-primary">pochtasergeia@gmail.com</a><br/><a href="https://t.me/sergey_in_job" target="_blank" rel="noopener noreferrer" class="underline hover:text-primary">Telegram</a><br/><a href="https://linkedin.com/in/sergey-emelyanov-in-job" target="_blank" rel="noopener noreferrer" class="underline hover:text-primary">LinkedIn</a>',
      html: true,
    },
    en: {
      text: '<a href="mailto:pochtasergeia@gmail.com" class="underline hover:text-primary">pochtasergeia@gmail.com</a><br/><a href="https://t.me/sergey_in_job" target="_blank" rel="noopener noreferrer" class="underline hover:text-primary">Telegram</a><br/><a href="https://linkedin.com/in/sergey-emelyanov-in-job" target="_blank" rel="noopener noreferrer" class="underline hover:text-primary">LinkedIn</a>',
      html: true,
    },
  },
}

const fallbackResponse: Record<Lang, { text: string; html: boolean }> = {
  ru: {
    text: 'Напишите мне в Telegram для подробного ответа! <a href="https://t.me/sergey_in_job" target="_blank" rel="noopener noreferrer" class="underline font-medium hover:text-primary">@sergey_in_job</a>',
    html: true,
  },
  en: {
    text: 'Message me on Telegram for a detailed answer! <a href="https://t.me/sergey_in_job" target="_blank" rel="noopener noreferrer" class="underline font-medium hover:text-primary">@sergey_in_job</a>',
    html: true,
  },
}

const headerCopy: Record<Lang, { name: string; subtitle: string }> = {
  ru: { name: 'Сергей', subtitle: 'Спросите о моём опыте' },
  en: { name: 'Sergey', subtitle: 'Ask me about my experience' },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let _id = 0
function uid(): string {
  return `msg-${++_id}-${Date.now()}`
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FloatingChat() {
  const { lang } = useLang()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* auto-scroll on new messages */
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isTyping])

  /* focus input when panel opens */
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  /* ---- reply helpers ---- */

  const pushAssistantReply = useCallback(
    (text: string, html?: boolean) => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: 'assistant', text, html },
        ])
      }, 500)
    },
    [],
  )

  const handleQuickPrompt = useCallback(
    (prompt: QuickPrompt) => {
      const userText = prompt.label[lang]
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'user', text: userText },
      ])

      const response = predefinedResponses[prompt.key][lang]
      pushAssistantReply(response.text, response.html)
    },
    [lang, pushAssistantReply],
  )

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text) return

    setInput('')
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text }])

    const fb = fallbackResponse[lang]
    pushAssistantReply(fb.text, fb.html)
  }, [input, lang, pushAssistantReply])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  /* ---- render ---- */

  const showQuickPrompts = messages.length === 0

  return (
    <>
      {/* ---- toggle button ---- */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-theme text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
        style={{ animation: open ? 'none' : 'chat-glow 2s ease-in-out infinite' }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* ---- chat panel ---- */}
      <div
        className={`fixed z-50 flex flex-col overflow-hidden border border-border bg-card shadow-2xl transition-all duration-300 origin-bottom-right
          sm:bottom-24 sm:right-6 sm:w-[380px] sm:h-[520px] sm:rounded-2xl
          max-sm:inset-0 max-sm:rounded-none max-sm:w-full max-sm:h-full
          ${open ? 'pointer-events-auto scale-100 translate-y-0 opacity-100' : 'pointer-events-none scale-95 translate-y-4 opacity-0'}`}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-border bg-gradient-theme-10 px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/foto-avatar-sm.webp"
              alt={headerCopy[lang].name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div className="min-w-0">
              <p className="text-sm font-display font-semibold leading-tight text-foreground">
                {headerCopy[lang].name}
              </p>
              <p className="text-xs text-muted-foreground">
                {headerCopy[lang].subtitle}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close chat">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {showQuickPrompts && (
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {quickPrompts.map((qp) => (
                <button
                  key={qp.key}
                  onClick={() => handleQuickPrompt(qp)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {qp.icon}
                  {qp.label[lang]}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex animate-fade-in ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
                {...(msg.html
                  ? { dangerouslySetInnerHTML: { __html: msg.text } }
                  : { children: msg.text })}
              />
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-2">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        {/* input bar */}
        <div className="border-t border-border px-3 py-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'ru' ? 'Напишите сообщение...' : 'Type a message...'}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* keyframe for fade-in (injected once) */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out both;
        }
      `}</style>
    </>
  )
}
