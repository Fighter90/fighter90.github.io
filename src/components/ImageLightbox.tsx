import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, RotateCw, X } from 'lucide-react'
import { progressPercent, useStreamedImage } from './useStreamedImage'

/* ------------------------------------------------------------------ */
/*  Lightbox                                                           */
/* ------------------------------------------------------------------ */

export interface LightboxLabels {
  readonly loading: string
  readonly error: string
  readonly retry: string
  readonly close: string
}

interface ImageLightboxProps {
  readonly url: string
  readonly alt: string
  readonly labels: LightboxLabels
  readonly onClose: () => void
}

export default function ImageLightbox({ url, alt, labels, onClose }: ImageLightboxProps) {
  const [attempt, setAttempt] = useState(0)
  const [decoded, setDecoded] = useState(false)
  const [broken, setBroken] = useState(false)
  const state = useStreamedImage(url, attempt)
  const percent = progressPercent(state)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Lock body scroll, close on Escape, move focus into the dialog.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const failed = state.error || broken
  const retry = () => { setDecoded(false); setBroken(false); setAttempt((a) => a + 1) }
  const showLoader = !failed && !decoded

  return createPortal(
    // z-[200] covers everything, including the sidebar and the chat button.
    <div role="dialog" aria-modal="true" aria-label={alt}
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6"
      onClick={onClose} style={{ animation: 'lightbox-in 0.3s ease-out' }}>
      <div className="relative max-w-4xl w-full min-h-[200px] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {showLoader && (
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl" aria-live="polite">
            <div className="flex items-center gap-3 mb-4 text-foreground">
              <Loader2 className="w-5 h-5 text-primary animate-spin" aria-hidden="true" />
              <span className="text-sm font-medium">{labels.loading}</span>
              {percent !== null && <span className="ml-auto text-sm tabular-nums text-muted-foreground">{percent}%</span>}
            </div>
            <div role="progressbar" aria-label={labels.loading} aria-valuemin={0} aria-valuemax={100}
              aria-valuenow={percent ?? undefined}
              className="h-2 w-full overflow-hidden rounded-full bg-muted">
              {percent === null
                ? <div className="h-full w-1/3 rounded-full bg-gradient-theme progress-indeterminate" />
                : <div className="h-full rounded-full bg-gradient-theme transition-[width] duration-200 ease-out" style={{ width: `${percent}%` }} />}
            </div>
          </div>
        )}

        {failed && (
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl text-center" role="alert">
            <p className="text-sm text-foreground mb-4">{labels.error}</p>
            <button type="button" onClick={retry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-theme text-white text-sm font-medium">
              <RotateCw className="w-4 h-4" aria-hidden="true" />{labels.retry}
            </button>
          </div>
        )}

        {state.src && !failed && (
          <img src={state.src} alt={alt} onLoad={() => setDecoded(true)} onError={() => setBroken(true)}
            className={`w-full h-auto max-h-[90vh] object-contain rounded-2xl shadow-2xl transition-opacity duration-300 ${decoded ? 'opacity-100' : 'opacity-0 absolute'}`} />
        )}

        <button ref={closeRef} type="button" onClick={onClose} aria-label={labels.close}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-card flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>,
    document.body
  )
}
