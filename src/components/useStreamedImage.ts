import { useEffect, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Streaming image loader                                             */
/*  fetch() + ReadableStream gives real byte progress, which <img>     */
/*  alone cannot report. The result is handed to <img> as a blob URL.  */
/* ------------------------------------------------------------------ */

export interface ImageLoadState {
  readonly src: string | null
  readonly loaded: number
  readonly total: number
  readonly error: boolean
}

const INITIAL: ImageLoadState = { src: null, loaded: 0, total: 0, error: false }

export function useStreamedImage(url: string, attempt: number): ImageLoadState {
  const [state, setState] = useState<ImageLoadState>(INITIAL)

  useEffect(() => {
    const ctrl = new AbortController()
    let objectUrl: string | null = null

    const load = async () => {
      setState(INITIAL)
      try {
        const res = await fetch(url, { signal: ctrl.signal })
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
        // Content-Length is the compressed size when the server gzips;
        // progress is clamped below so the bar never overshoots.
        const total = Number(res.headers.get('content-length')) || 0
        const reader = res.body.getReader()
        const chunks: Uint8Array[] = []
        let loaded = 0
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          loaded += value.length
          setState({ src: null, loaded, total, error: false })
        }
        const type = res.headers.get('content-type') ?? 'image/webp'
        objectUrl = URL.createObjectURL(new Blob(chunks as BlobPart[], { type }))
        setState({ src: objectUrl, loaded, total: total || loaded, error: false })
      } catch {
        if (!ctrl.signal.aborted) setState((s) => ({ ...s, error: true }))
      }
    }
    void load()

    return () => {
      ctrl.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [url, attempt])

  return state
}

/** 0–100 while downloading; null when the size is unknown (indeterminate bar). */
export function progressPercent({ loaded, total, src }: ImageLoadState): number | null {
  if (src) return 100
  if (!total) return null
  return Math.min(99, Math.round((loaded / total) * 100))
}
