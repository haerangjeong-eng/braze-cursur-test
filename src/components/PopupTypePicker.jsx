import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  POPUP_GROUP_DEFAULT_POPUP_TYPE,
  POPUP_TYPE_DISPLAY_NAME,
  POPUP_TYPE_IDS,
  POPUP_UI_GROUPS,
  getPopupUiGroupId,
} from '../config/popupTypes'
import {
  SIMPLE_ICON_VARIANT_ICON,
  SIMPLE_ICON_VARIANT_THUMB,
} from '../config/simpleIcon'
import LanguageMenu from './LanguageMenu'
import {
  PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS,
  PANEL_INSET_TOGGLE_BUTTON_CLASS,
  PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS,
  PANEL_INSET_TOGGLE_WRAP_CLASS,
  PANEL_TEMPLATE_CARD_CLASS,
} from '../config/panelUi'

const POPUP_HELP_LABEL_CLASS =
  'inline-flex shrink-0 flex-row flex-nowrap items-center justify-center gap-1 text-[19px] font-bold uppercase tracking-[0.6px] text-green-400'

function ChevronDown({ open, className = '' }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${open ? 'rotate-180 text-zinc-400' : ''} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export default function PopupTypePicker({
  popupType,
  update,
  t,
  simpleIconVariant,
  simpleIconThumbSize,
  language,
  onLanguageChange,
  headerHelpOpen,
  onHeaderHelpEnter,
  onHeaderHelpLeave,
}) {
  const tr = t || {}
  const [mainOpen, setMainOpen] = useState(false)
  const wrapRef = useRef(null)
  const mainBtnRef = useRef(null)
  const mainMenuRef = useRef(null)
  const helpBtnRef = useRef(null)
  const helpTooltipRef = useRef(null)
  /** 헤더 도움말 툴팁 — aside overflow:hidden 에 안 잘리도록 body 포털 + fixed */
  const [helpTooltipPos, setHelpTooltipPos] = useState(null)

  /** 사이드바 overflow-y-auto 가 absolute 메뉴를 잘라 포털 + fixed 로 표시 */
  const [floatRect, setFloatRect] = useState({ main: null })

  const groupId = getPopupUiGroupId(popupType)
  const currentGroup = POPUP_UI_GROUPS.find((g) => g.id === groupId)

  const measureFloat = useCallback(() => {
    setFloatRect(() => {
      const next = { main: null }
      if (mainOpen && mainBtnRef.current) {
        const r = mainBtnRef.current.getBoundingClientRect()
        next.main = { top: r.bottom + 4, left: r.left, width: r.width }
      }
      return next
    })
  }, [mainOpen])

  useLayoutEffect(() => {
    measureFloat()
  }, [measureFloat, groupId, popupType])

  useEffect(() => {
    if (!mainOpen) return
    measureFloat()
    window.addEventListener('resize', measureFloat)
    window.addEventListener('scroll', measureFloat, true)
    return () => {
      window.removeEventListener('resize', measureFloat)
      window.removeEventListener('scroll', measureFloat, true)
    }
  }, [mainOpen, measureFloat])

  useEffect(() => {
    const onDoc = (e) => {
      const tEl = e.target
      if (wrapRef.current?.contains(tEl)) return
      if (mainMenuRef.current?.contains(tEl)) return
      setMainOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  /** 텍스트 너비에 맞춘 뒤 뷰포트 안으로만 left 보정 */
  const layoutHelpTooltip = useCallback(() => {
    if (!headerHelpOpen || !helpBtnRef.current) {
      setHelpTooltipPos(null)
      return
    }
    const r = helpBtnRef.current.getBoundingClientRect()
    const margin = 12
    const vw = window.innerWidth
    let left = r.left
    const tip = helpTooltipRef.current
    if (tip) {
      const w = tip.offsetWidth
      if (left + w > vw - margin) left = Math.max(margin, vw - margin - w)
    }
    setHelpTooltipPos({ top: r.bottom + 8, left })
  }, [headerHelpOpen])

  useLayoutEffect(() => {
    if (!headerHelpOpen) {
      setHelpTooltipPos(null)
      return
    }
    layoutHelpTooltip()
  }, [headerHelpOpen, tr?.headerHelpTooltip, layoutHelpTooltip])

  useEffect(() => {
    if (!headerHelpOpen) return
    layoutHelpTooltip()
    window.addEventListener('resize', layoutHelpTooltip)
    window.addEventListener('scroll', layoutHelpTooltip, true)
    return () => {
      window.removeEventListener('resize', layoutHelpTooltip)
      window.removeEventListener('scroll', layoutHelpTooltip, true)
    }
  }, [headerHelpOpen, layoutHelpTooltip])

  const setPopupType = (id) => update('popupType', id)

  const onPickGroup = (gid) => {
    const def = POPUP_GROUP_DEFAULT_POPUP_TYPE[gid]
    if (def) setPopupType(def)
    setMainOpen(false)
  }

  const choiceTypes = [
    POPUP_TYPE_IDS.SQUARE,
    POPUP_TYPE_IDS.VERTICAL_3_4,
    POPUP_TYPE_IDS.VERTICAL,
  ]

  const simpleIconIsThumb =
    (simpleIconVariant ?? SIMPLE_ICON_VARIANT_THUMB) === SIMPLE_ICON_VARIANT_THUMB
  const simpleIconSmallSelected =
    simpleIconIsThumb && (simpleIconThumbSize ?? 'small') === 'small'
  const simpleIconLargeSelected = simpleIconIsThumb && simpleIconThumbSize === 'large'
  const simpleIconIconSelected = simpleIconVariant === SIMPLE_ICON_VARIANT_ICON

  const isCarousel11Active =
    popupType === POPUP_TYPE_IDS.CAROUSEL_SNS ||
    popupType === POPUP_TYPE_IDS.CAROUSEL_STORYTELLING

  return (
    <div ref={wrapRef} className={PANEL_TEMPLATE_CARD_CLASS}>
      <div className="mb-3 flex items-center justify-start gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <span
            className={POPUP_HELP_LABEL_CLASS}
            onMouseEnter={onHeaderHelpEnter}
            onMouseLeave={onHeaderHelpLeave}
          >
            {tr.popupTemplateLabel ?? 'Popup template'}
            <button
              ref={helpBtnRef}
              type="button"
              aria-expanded={headerHelpOpen}
              aria-controls="panel-help-tooltip"
              aria-label={tr.headerHelpAriaLabel || 'Help'}
              className="inline-flex shrink-0 rounded-full p-1 text-zinc-500 transition-colors hover:bg-zinc-900/90 hover:text-[#86efac] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
            >
              <svg
                className="h-[1.125rem] w-[1.125rem]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </button>
          </span>
        </div>
        <LanguageMenu
          language={language}
          onLanguageChange={onLanguageChange}
          t={tr}
        />
      </div>
      <div className="relative">
        <button
          ref={mainBtnRef}
          type="button"
          onClick={() => setMainOpen((o) => !o)}
          className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
            mainOpen
              ? 'border-brand bg-surface-800 ring-2 ring-brand/45 ring-offset-2 ring-offset-zinc-950 text-zinc-50'
              : 'border-zinc-700 bg-surface-800 text-zinc-200 hover:border-zinc-600 hover:bg-surface-800'
          }`}
          aria-expanded={mainOpen}
          aria-haspopup="listbox"
        >
          <span className="truncate">{currentGroup?.label ?? ''}</span>
          <ChevronDown open={mainOpen} />
        </button>
      </div>

      {groupId === 'choice' && (
        <div
          role="radiogroup"
          className={`${PANEL_INSET_TOGGLE_WRAP_CLASS} mt-[16px]`}
        >
          {choiceTypes.map((tid) => (
            <button
              key={tid}
              type="button"
              aria-pressed={popupType === tid}
              onClick={() => setPopupType(tid)}
              className={`${PANEL_INSET_TOGGLE_BUTTON_CLASS} ${
                popupType === tid
                  ? PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS
                  : PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS
              }`}
            >
              {POPUP_TYPE_DISPLAY_NAME[tid]}
            </button>
          ))}
        </div>
      )}

      {groupId === 'carousel' && (
        <div
          role="radiogroup"
          className={`${PANEL_INSET_TOGGLE_WRAP_CLASS} mt-[16px]`}
        >
          <button
            type="button"
            aria-pressed={popupType === POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL}
            onClick={() => setPopupType(POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL)}
            className={`${PANEL_INSET_TOGGLE_BUTTON_CLASS} ${
              popupType === POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL
                ? PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS
                : PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS
            }`}
          >
            {tr.carouselSubtypeVertical ?? 'Vertical'}
          </button>
          <button
            type="button"
            aria-pressed={popupType === POPUP_TYPE_IDS.CAROUSEL_THUMB_HORIZONTAL}
            onClick={() => setPopupType(POPUP_TYPE_IDS.CAROUSEL_THUMB_HORIZONTAL)}
            className={`${PANEL_INSET_TOGGLE_BUTTON_CLASS} ${
              popupType === POPUP_TYPE_IDS.CAROUSEL_THUMB_HORIZONTAL
                ? PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS
                : PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS
            }`}
          >
            {tr.carouselSubtypeHorizontal ?? 'Horizontal'}
          </button>
          <button
            type="button"
            aria-pressed={isCarousel11Active}
            onClick={() => setPopupType(POPUP_TYPE_IDS.CAROUSEL_SNS)}
            className={`${PANEL_INSET_TOGGLE_BUTTON_CLASS} ${
              isCarousel11Active
                ? PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS
                : PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS
            }`}
          >
            {tr.carouselSubtype11 ?? '1:1'}
          </button>
        </div>
      )}

      {groupId === 'simple_icon' && (
        <div
          role="radiogroup"
          className={`${PANEL_INSET_TOGGLE_WRAP_CLASS} mt-[16px]`}
        >
          <button
            type="button"
            aria-pressed={simpleIconSmallSelected}
            onClick={() => {
              update('simpleIconThumbSize', 'small')
              update('simpleIconVariant', SIMPLE_ICON_VARIANT_THUMB)
            }}
            className={`${PANEL_INSET_TOGGLE_BUTTON_CLASS} ${
              simpleIconSmallSelected
                ? PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS
                : PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS
            }`}
          >
            {tr.simpleIconTypeSmall ?? 'Small Type'}
          </button>
          <button
            type="button"
            aria-pressed={simpleIconLargeSelected}
            onClick={() => {
              update('simpleIconThumbSize', 'large')
              update('simpleIconVariant', SIMPLE_ICON_VARIANT_THUMB)
            }}
            className={`${PANEL_INSET_TOGGLE_BUTTON_CLASS} ${
              simpleIconLargeSelected
                ? PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS
                : PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS
            }`}
          >
            {tr.simpleIconTypeLarge ?? 'Large Type'}
          </button>
          <button
            type="button"
            aria-pressed={simpleIconIconSelected}
            onClick={() => update('simpleIconVariant', SIMPLE_ICON_VARIANT_ICON)}
            className={`${PANEL_INSET_TOGGLE_BUTTON_CLASS} ${
              simpleIconIconSelected
                ? PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS
                : PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS
            }`}
          >
            {tr.simpleIconVariantIcon || 'Icon Type'}
          </button>
        </div>
      )}

      {typeof document !== 'undefined' &&
        mainOpen &&
        floatRect.main &&
        createPortal(
          <ul
            ref={mainMenuRef}
            role="listbox"
            style={{
              position: 'fixed',
              top: floatRect.main.top,
              left: floatRect.main.left,
              width: floatRect.main.width,
              zIndex: 100,
            }}
            className="max-h-72 overflow-auto rounded-lg border border-zinc-700 bg-surface-800/95 py-1 shadow-xl shadow-black/50"
          >
            {POPUP_UI_GROUPS.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={groupId === g.id}
                  onClick={() => onPickGroup(g.id)}
                  className={`flex w-full items-center px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                    groupId === g.id
                      ? 'bg-brand/15 font-medium text-white'
                      : 'text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-100'
                  }`}
                >
                  {g.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}

      {typeof document !== 'undefined' &&
        headerHelpOpen &&
        createPortal(
          <span
            ref={helpTooltipRef}
            id="panel-help-tooltip"
            role="tooltip"
            style={{
              position: 'fixed',
              top:
                helpTooltipPos?.top ??
                (helpBtnRef.current ? helpBtnRef.current.getBoundingClientRect().bottom + 8 : 0),
              left:
                helpTooltipPos?.left ??
                (helpBtnRef.current ? helpBtnRef.current.getBoundingClientRect().left : 0),
              zIndex: 80,
            }}
            onMouseEnter={onHeaderHelpEnter}
            onMouseLeave={onHeaderHelpLeave}
            className="box-border w-max max-w-[min(22rem,calc(100vw-1.5rem))] rounded-lg border border-zinc-700/90 bg-zinc-950/95 px-[10px] py-2 text-left text-xs leading-snug text-zinc-200 shadow-xl ring-1 ring-brand/15 whitespace-pre-line break-words pointer-events-auto"
          >
            {tr.headerHelpTooltip}
          </span>,
          document.body
        )}
    </div>
  )
}
