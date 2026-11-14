import { type ImgHTMLAttributes, type PointerEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { t } from '../i18n'
import { SOURCE_LOCALE } from '../registry-core'

/** Zoom levels, as multiples of the size that fits the screen. */
const STEPS = [1, 1.5, 2, 3]
// The site ships one language (registry-core LOCALES), and an image has no locale of its own.
const L = SOURCE_LOCALE

/**
 * MDX `img` replacement: click to open the image in a full-page lightbox, where it can be
 * zoomed (buttons, + and -, 0 to fit, or a click on the image) and panned by dragging.
 * Closes on Escape, the cross, or a click beside the image. It renders on <body>, so the
 * article's own image rules (a height cap, a border) do not reach it.
 */
export default function ZoomImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  // Width in CSS px at which the whole image fits the screen; 0 until it has loaded.
  const [fit, setFit] = useState(0)
  const overlay = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(
    null
  )
  const zoom = STEPS[step]

  const close = () => {
    setOpen(false)
    setStep(0)
    setFit(0)
  }
  const zoomBy = (delta: number) => setStep(s => Math.min(STEPS.length - 1, Math.max(0, s + delta)))

  const measure = (img: HTMLImageElement) => {
    const ratio = img.naturalWidth / img.naturalHeight
    setFit(Math.min(window.innerWidth - 64, (window.innerHeight - 64) * ratio))
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: close only resets state
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === '+' || e.key === '=') zoomBy(1)
      if (e.key === '-') zoomBy(-1)
      if (e.key === '0') setStep(0)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open])

  const onPointerDown = (e: PointerEvent) => {
    const el = overlay.current
    if (!el || e.button !== 0) return
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      left: el.scrollLeft,
      top: el.scrollTop,
      moved: false,
    }
  }
  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current
    const el = overlay.current
    if (!d || !el) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true
    el.scrollLeft = d.left - dx
    el.scrollTop = d.top - dy
  }
  // A drag ends in a click; only a click that did not move counts as one.
  const wasDrag = () => {
    const moved = drag.current?.moved ?? false
    drag.current = null
    return moved
  }

  return (
    <>
      <button
        type="button"
        className="doc-zoom"
        aria-label={props.alt}
        onClick={() => setOpen(true)}
      >
        <img {...props} alt={props.alt ?? ''} loading="lazy" />
      </button>
      {open &&
        createPortal(
          <div
            ref={overlay}
            className={`doc-lightbox${step > 0 ? ' is-zoomed' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={props.alt}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
          >
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape and the toolbar cover the keyboard */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: the backdrop, closed by Escape too */}
            <div
              className="doc-lightbox-stage"
              onClick={e => {
                if (!wasDrag() && e.target === e.currentTarget) close()
              }}
            >
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: + and - zoom from the keyboard */}
              {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: a click zooms, as the cursor says */}
              <img
                src={props.src}
                alt={props.alt}
                draggable={false}
                onLoad={e => measure(e.currentTarget)}
                style={fit ? { width: fit * zoom } : undefined}
                className={fit ? undefined : 'is-measuring'}
                onClick={() => {
                  if (!wasDrag()) setStep(s => (s === 0 ? 2 : 0))
                }}
              />
            </div>
            <div className="doc-lightbox-tools">
              <button
                type="button"
                aria-label={t(L, 'zoomOut')}
                title={t(L, 'zoomOut')}
                disabled={step === 0}
                onClick={() => zoomBy(-1)}
              >
                −
              </button>
              <button type="button" title={t(L, 'zoomFit')} onClick={() => setStep(0)}>
                {Math.round(zoom * 100)} %
              </button>
              <button
                type="button"
                aria-label={t(L, 'zoomIn')}
                title={t(L, 'zoomIn')}
                disabled={step === STEPS.length - 1}
                onClick={() => zoomBy(1)}
              >
                +
              </button>
              <button
                type="button"
                aria-label={t(L, 'close')}
                title={t(L, 'close')}
                onClick={close}
              >
                ✕
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
