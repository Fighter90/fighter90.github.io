import { useEffect, useRef, useState } from 'react'
import { translations } from '../i18n'
import { useLang } from '../contexts/LangContext'

type LinkedInEmbedProps = {
  embedUrl: string
  postUrl: string
  title: string
  date?: string
  height?: number
}

type Status = 'idle' | 'mounted' | 'loaded' | 'failed'

const LOAD_TIMEOUT_MS = 6000

function LinkedInIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

function Skeleton({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse bg-muted rounded-xl"
      style={{ height }}
      aria-hidden="true"
    />
  )
}

function FallbackCard({
  postUrl,
  title,
  date,
  height,
}: {
  postUrl: string
  title: string
  date?: string
  height: number
}) {
  const { lang } = useLang()
  const copy = translations[lang].linkedinEmbed
  return (
    <div
      className="w-full flex flex-col justify-between p-6 bg-card"
      style={{ minHeight: height }}
    >
      <div className="flex items-start gap-3">
        <div className="text-[#0a66c2]">
          <LinkedInIcon />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            {copy.fallbackLabel}
          </div>
          <div className="font-display font-semibold text-foreground">{title}</div>
          {date && (
            <div className="text-sm text-muted-foreground mt-1">{date}</div>
          )}
        </div>
      </div>
      <a
        href={postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
      >
        {copy.openButton}
      </a>
    </div>
  )
}

export default function LinkedInEmbed({
  embedUrl,
  postUrl,
  title,
  date,
  height = 400,
}: LinkedInEmbedProps) {
  const [status, setStatus] = useState<Status>('idle')
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatus(prev => (prev === 'idle' ? 'mounted' : prev))
          io.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (status !== 'mounted') return
    timerRef.current = setTimeout(() => {
      setStatus(prev => (prev === 'loaded' ? prev : 'failed'))
    }, LOAD_TIMEOUT_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [status])

  const handleLoad = () => {
    setStatus('loaded')
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-border card-hover bg-white"
      style={{ minHeight: height }}
    >
      {status === 'failed' ? (
        <FallbackCard postUrl={postUrl} title={title} date={date} height={height} />
      ) : status === 'mounted' || status === 'loaded' ? (
        <>
          <iframe
            src={embedUrl}
            height={height}
            width="100%"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            style={{ border: 0, display: status === 'loaded' ? 'block' : 'none' }}
            title={title}
            onLoad={handleLoad}
            allowFullScreen
            className="w-full"
          />
          {status === 'mounted' && <Skeleton height={height} />}
        </>
      ) : (
        <Skeleton height={height} />
      )}
    </div>
  )
}
