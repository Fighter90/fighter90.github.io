import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Briefcase, Rocket, CircleHelp, Mail } from 'lucide-react'
import { useLang } from '../contexts/LangContext'
import type { Lang } from '../i18n'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

interface QuickPrompt {
  key: string
  icon: React.ReactNode
  label: Record<Lang, string>
  message: Record<Lang, string>
}

/* ------------------------------------------------------------------ */
/*  System prompt — Sergey's CV knowledge base                         */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `You are Sergey Emelyanov's AI portfolio assistant. You respond in the same language the user writes to you (Russian or English).

About Sergey:
- Senior Software Engineer (PHP/Go) at Rambler&Co, Moscow (since March 2024)
- 14+ years of backend development experience
- Previous companies: Lamoda Tech (2022-2024), Rambler&Co (2021-2022), MTS Fintech (2020-2021), ETP Gazprombank (2016-2020), Avito (2016), Mamba/Tourbar (2015-2016), Sutochno.ru (2011-2015)

Key achievements:
- Migrated PHP 7.4→8.1 at Lamoda: 25% faster queries, 15% less memory
- Optimized CI/CD pipelines: 30% faster delivery at Lamoda
- Built config microservice from scratch using DDD at MTS Fintech, 85% test coverage
- Reporting subsystem 5x faster at Rambler&Co
- Government procurement integration via microservices at ETP GPB
- Payment system integrations at Avito (billing microservice)
- Grew Sutochno.ru from prototype to production with thousands of users, automated 90% accounting

Core stack: PHP 8, Go, Symfony 4, Laravel, PostgreSQL, MySQL, MongoDB, Redis, Kafka, RabbitMQ, Docker, Kubernetes, CI/CD
AI/ML: Python, FastAPI, Claude API, OpenAI API, Prompt Engineering

Education:
- HSE University — Master's in IT Product Management (2025-2027, in progress)
- Kuban State University — Master's in Psychology (2023-2025)
- Ulyanovsk State Technical University — Information Systems (2007-2012)

Side projects:
- ResumeCraft (resumecraft.ru) — Multi-agent SaaS resume optimizer with 5 LLM providers
- ICAIMT 2026 — Research paper "Agentic AI in Enterprise" (EAAMM model), 136 respondents, accepted at international conference
- Career-Ops — AI job search system for Russian market (hh.ru, Habr Career integration)

Portfolio (Webguru.pro era):
- Alicebot.pro — Yandex Alice skill builder with amoCRM/Bitrix24 integration
- vl-taxi.ru — Taxi service with Telegram bot notifications and CMS
- HR Survey System — Chatbots for Telegram/Viber/VK/Facebook for MegaFon Retail and Alliance Retail Security
- Telegram shop @braidsBot, StartBiz.Space HRM, Karpala.ru taxi system

Client testimonials: MegaFon Retail, Alliance Retail Security, CS GARANT — all praise professionalism and quality.

Contact: pochtasergeia@gmail.com | Telegram: @sergey_in_job | LinkedIn: sergey-emelyanov-in-job | GitHub: Fighter90

You answer questions about Sergey's experience, skills, and projects. Be helpful, concise, and professional. If asked about something you don't know, say so honestly and suggest contacting Sergey directly.`

/* ------------------------------------------------------------------ */
/*  OpenRouter API                                                     */
/* ------------------------------------------------------------------ */

// OpenRouter key — will work once account is funded
const OPENROUTER_KEY = '***REVOKED***'
const MODEL = 'deepseek/deepseek-chat-v3-0324'

async function callLLM(
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://fighter90.github.io',
      'X-Title': 'Sergey Emelyanov Portfolio',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    }),
    signal,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error: ${res.status} ${err}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)
      if (data === '[DONE]') return

      try {
        const parsed = JSON.parse(data)
        const delta = parsed.choices?.[0]?.delta?.content
        if (delta) onChunk(delta)
      } catch { /* skip malformed chunks */ }
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Quick prompts                                                      */
/* ------------------------------------------------------------------ */

const quickPrompts: QuickPrompt[] = [
  {
    key: 'experience',
    icon: <Briefcase className="w-3.5 h-3.5" />,
    label: { ru: 'Опыт работы', en: 'Work experience' },
    message: { ru: 'Расскажи о своём опыте работы', en: 'Tell me about your work experience' },
  },
  {
    key: 'projects',
    icon: <Rocket className="w-3.5 h-3.5" />,
    label: { ru: 'Проекты', en: 'Projects' },
    message: { ru: 'Какие проекты ты делал?', en: 'What projects have you built?' },
  },
  {
    key: 'why',
    icon: <CircleHelp className="w-3.5 h-3.5" />,
    label: { ru: 'Почему я?', en: 'Why hire me?' },
    message: { ru: 'Почему стоит тебя нанять?', en: 'Why should we hire you?' },
  },
  {
    key: 'contact',
    icon: <Mail className="w-3.5 h-3.5" />,
    label: { ru: 'Контакт', en: 'Contact' },
    message: { ru: 'Как с тобой связаться?', en: 'How can I contact you?' },
  },
]

const headerCopy: Record<Lang, { name: string; subtitle: string; greeting: string }> = {
  ru: { name: 'Сергей', subtitle: 'AI-ассистент портфолио', greeting: 'Привет! Я AI-ассистент Сергея. Спросите что угодно о моём опыте, проектах или навыках.' },
  en: { name: 'Sergey', subtitle: 'AI Portfolio Assistant', greeting: "Hi! I'm Sergey's AI assistant. Ask me anything about his experience, projects, or skills." },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let _id = 0
const uid = () => `msg-${++_id}-${Date.now()}`

/** Auto-link URLs, emails, @telegram handles, and LinkedIn usernames in text */
function Linkify({ text }: { text: string }) {
  const parts = text.split(/(\bhttps?:\/\/\S+|[\w.+-]+@[\w.-]+\.\w+|@[\w_]+|linkedin:[\w-]+)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (/^https?:\/\//.test(part))
          return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">{part}</a>
        if (/^[\w.+-]+@[\w.-]+\.\w+$/.test(part))
          return <a key={i} href={`mailto:${part}`} className="underline text-primary hover:text-primary/80">{part}</a>
        if (/^@[\w_]+$/.test(part))
          return <a key={i} href={`https://t.me/${part.slice(1)}`} target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">{part}</a>
        if (/^linkedin:/.test(part)) {
          const handle = part.replace('linkedin:', '')
          return <a key={i} href={`https://www.linkedin.com/in/${handle}/`} target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">LinkedIn</a>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FloatingChat() {
  const { lang } = useLang()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Escape to close
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streamText, isStreaming])

  // Focus input
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Show greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: uid(), role: 'assistant', text: headerCopy[lang].greeting }])
    }
  }, [open, lang, messages.length])

  // Local fallback responses for when OpenRouter is unavailable
  const localFallback = useCallback((text: string): string => {
    const lower = text.toLowerCase()
    if (lower.includes('опыт') || lower.includes('experience') || lower.includes('работ'))
      return lang === 'ru'
        ? '14+ лет в backend-разработке: PHP 8, Go, Symfony. Работал в Rambler&Co, Lamoda, Авито, МТС Финтех, ЭТП Газпромбанка. Строю высоконагруженные системы, микросервисы, настраиваю CI/CD.'
        : '14+ years in backend: PHP 8, Go, Symfony. Worked at Rambler&Co, Lamoda, Avito, MTS Fintech, ETP Gazprombank. High-load systems, microservices, CI/CD.'
    if (lower.includes('проект') || lower.includes('project') || lower.includes('portfolio'))
      return lang === 'ru'
        ? 'Ключевые проекты: ResumeCraft (мульти-агентный SaaS с 5 LLM), научная статья ICAIMT 2026 (агентный ИИ, 136 респондентов), Career-Ops (AI-поиск работы). Также 7+ веб-сервисов в рамках Webguru.pro: чат-боты, CMS, HRM-системы.'
        : 'Key projects: ResumeCraft (multi-agent SaaS with 5 LLMs), ICAIMT 2026 research paper (agentic AI, 136 respondents), Career-Ops (AI job search). Also 7+ web services at Webguru.pro: chatbots, CMS, HRM systems.'
    if (lower.includes('почему') || lower.includes('why') || lower.includes('hire') || lower.includes('нанять'))
      return lang === 'ru'
        ? 'Глубокая экспертиза в backend (14+ лет) + магистратура по продуктовому менеджменту в ВШЭ. Умею выстраивать архитектуру, менторить команды, доводить проекты до продакшена. Исследую применение ИИ в бизнесе.'
        : 'Deep backend expertise (14+ years) + pursuing Product Management master\'s at HSE. I design architecture, mentor teams, ship to production. Researching AI in business processes.'
    if (lower.includes('контакт') || lower.includes('contact') || lower.includes('связ'))
      return lang === 'ru'
        ? 'Email: pochtasergeia@gmail.com\nTelegram: @sergey_in_job\nLinkedIn: linkedin:sergey-emelyanov-in-job\nGitHub: https://github.com/Fighter90'
        : 'Email: pochtasergeia@gmail.com\nTelegram: @sergey_in_job\nLinkedIn: linkedin:sergey-emelyanov-in-job\nGitHub: https://github.com/Fighter90'
    return lang === 'ru'
      ? 'Спасибо за вопрос! Для подробного ответа напишите мне в Telegram: @sergey_in_job — отвечу лично.'
      : 'Thanks for asking! For a detailed answer, message me on Telegram: @sergey_in_job — I\'ll reply personally.'
  }, [lang])

  const sendToLLM = useCallback(async (userText: string) => {
    const userMsg: ChatMessage = { id: uid(), role: 'user', text: userText }
    setMessages(prev => [...prev, userMsg])
    setIsStreaming(true)
    setStreamText('')

    // If no API key, use local fallback
    if (!OPENROUTER_KEY) {
      await new Promise(r => setTimeout(r, 600))
      setMessages(prev => [...prev, { id: uid(), role: 'assistant', text: localFallback(userText) }])
      setIsStreaming(false)
      return
    }

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.text }))
    const controller = new AbortController()
    abortRef.current = controller

    let fullText = ''
    try {
      await callLLM(history, (chunk) => {
        fullText += chunk
        setStreamText(fullText)
      }, controller.signal)
      setMessages(prev => [...prev, { id: uid(), role: 'assistant', text: fullText || localFallback(userText) }])
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        // Fallback to local on API error
        setMessages(prev => [...prev, { id: uid(), role: 'assistant', text: localFallback(userText) }])
      }
    } finally {
      setIsStreaming(false)
      setStreamText('')
      abortRef.current = null
    }
  }, [messages, lang, localFallback])

  const handleQuickPrompt = useCallback((qp: QuickPrompt) => {
    if (isStreaming) return
    sendToLLM(qp.message[lang])
  }, [sendToLLM, lang, isStreaming])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    sendToLLM(text)
  }, [input, isStreaming, sendToLLM])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }, [handleSend])

  const showQuickPrompts = messages.length <= 1 && !isStreaming

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-theme text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
        style={{ animation: open ? 'none' : 'chat-glow 2s ease-in-out infinite' }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed z-50 flex flex-col overflow-hidden border border-border bg-card shadow-2xl transition-all duration-300 origin-bottom-right
          sm:bottom-24 sm:right-6 sm:w-[400px] sm:h-[560px] sm:rounded-2xl
          max-sm:inset-0 max-sm:rounded-none max-sm:w-full max-sm:h-full
          ${open ? 'pointer-events-auto scale-100 translate-y-0 opacity-100' : 'pointer-events-none scale-95 translate-y-4 opacity-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-gradient-theme-10 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/foto-avatar-sm.webp" alt={headerCopy[lang].name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20" />
            <div>
              <p className="text-sm font-display font-semibold text-foreground">{headerCopy[lang].name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {headerCopy[lang].subtitle}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex animate-chat-msg ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              }`}>
                <Linkify text={msg.text} />
              </div>
            </div>
          ))}

          {/* Streaming response */}
          {isStreaming && (
            <div className="flex justify-start animate-chat-msg">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted text-foreground px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
                {streamText ? <Linkify text={streamText} /> : (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick prompts */}
          {showQuickPrompts && (
            <div className="flex flex-wrap gap-2 pt-1">
              {quickPrompts.map((qp) => (
                <button key={qp.key} type="button" onClick={() => handleQuickPrompt(qp)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 hover:border-primary/40 transition-colors">
                  {qp.icon}{qp.label[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border px-3 py-2.5">
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder={lang === 'ru' ? 'Спросите что-нибудь...' : 'Ask me anything...'}
              className="flex-1 rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50" />
            <button type="button" onClick={handleSend} disabled={!input.trim() || isStreaming}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-theme text-white transition-opacity disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes chat-msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-chat-msg { animation: chat-msg-in 0.3s ease-out both; }
      `}</style>
    </>
  )
}
