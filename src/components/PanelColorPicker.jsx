import { createPortal } from 'react-dom'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'

const POPOVER_W = 248
/** 레이아웃 전 첫 프레임용 추정값 — 실제는 popover DOM 높이로 보정 */
const POPOVER_H_FALLBACK = 182
const GAP = 4
const VIEW_MARGIN = 10

function safeHexForPicker(hex) {
  const s = String(hex ?? '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase()
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    const x = s.slice(1)
    return '#' + [...x].map((c) => c + c).join('').toLowerCase()
  }
  return '#18181b'
}

function placePopover(triggerRect, popoverHeight) {
  const h = popoverHeight ?? POPOVER_H_FALLBACK
  const vw = window.innerWidth
  const vh = window.innerHeight
  let left = triggerRect.left
  let top = triggerRect.bottom + GAP
  if (left + POPOVER_W > vw - VIEW_MARGIN) {
    left = Math.max(VIEW_MARGIN, vw - VIEW_MARGIN - POPOVER_W)
  }
  if (left < VIEW_MARGIN) left = VIEW_MARGIN
  if (top + h > vh - VIEW_MARGIN) {
    top = triggerRect.top - h - GAP
  }
  if (top < VIEW_MARGIN) top = VIEW_MARGIN
  return { top, left }
}

/**
 * 네이티브 input[type=color] 대신 — 브라우저 팝업은 스타일 불가라
 * react-colorful + zinc 패널과 통일된 피커 (aside overflow 회피: 포털 + fixed).
 */
export default function PanelColorPicker({
  id,
  value,
  onChange,
  /** 스와치 옆 Hex 입력 등 — 클릭 시 피커 유지 (포털 밖 동료 요소) */
  companionRef,
  'aria-label': ariaLabel = '색 선택',
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const measure = useCallback(() => {
    if (!open || !triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    const ph =
      popoverRef.current?.offsetHeight > 0
        ? popoverRef.current.offsetHeight
        : POPOVER_H_FALLBACK
    setPos(placePopover(r, ph))
  }, [open])

  useLayoutEffect(() => {
    measure()
  }, [measure, open])

  /** 포털 페인트 직후 실제 높이로 한 번 더 맞춤 (위/아래 뒤집힘 간격 과대 방지) */
  useLayoutEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => measure())
    return () => cancelAnimationFrame(id)
  }, [open, measure])

  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open, measure])

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      const t = e.target
      if (triggerRef.current?.contains(t)) return
      if (popoverRef.current?.contains(t)) return
      if (companionRef?.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, companionRef])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const safe = safeHexForPicker(value)

  return (
    <div className="relative inline-flex shrink-0">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="box-border h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-zinc-700 bg-surface-800 p-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[box-shadow,border-color] hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand/50"
        style={{ backgroundColor: safe }}
        onClick={() => setOpen((o) => !o)}
      />
      {typeof document !== 'undefined' &&
        open &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label={ariaLabel}
            className="panel-color-picker-popover animate-[fadeIn_0.18s_ease-out] rounded-xl border border-zinc-700 bg-zinc-950 p-3 shadow-2xl shadow-black/70 ring-1 ring-zinc-800/90"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              zIndex: 95,
              width: POPOVER_W,
            }}
          >
            <HexColorPicker
              color={safe}
              onChange={(hex) => onChange(hex)}
            />
          </div>,
          document.body
        )}
    </div>
  )
}
