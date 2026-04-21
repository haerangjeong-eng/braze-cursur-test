import { createPortal } from 'react-dom'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import {
  contrastWithWhite,
  ensureContrastWithWhite,
  meetsContrastWithWhite,
} from '../utils/contrast'
import {
  BOTTOM_SLIDE_UP_TEXT_CLAMP_W,
  isCarouselThumbPopupType,
  POPUP_TYPE_IDS,
  SLIDE_MODAL_11_MAX_IMAGES,
  SLIDE_MODAL_11_MIN_IMAGES,
  SLIDE_MODAL_VERTICAL_MIN_IMAGES,
  SLIDE_MODAL_VERTICAL_MAX_IMAGES,
  SMV_COLUMN_W,
} from '../config/popupTypes'
import { PANEL_STICKY_COPY_HTML_FOOTER_BTN_CLASS } from './LanguageMenu'
import PopupTypePicker from './PopupTypePicker'
import {
  normalizeSlideModal11Images,
  normalizeSlideModal11SlotKeys,
} from '../utils/slideModal11'
import {
  normalizeSlideVerticalImages,
  normalizeSlideVerticalSlotKeys,
} from '../utils/slideVertical'
import {
  BUTTON_LABEL_FONT_FAMILY,
  BUTTON_LABEL_FONT_SIZE_PX,
  BUTTON_LABEL_FONT_WEIGHT,
  BUTTON_LABEL_LINE_HEIGHT_PX,
  getPreviewButtonLabelInnerWidthPx,
} from '../utils/buttonLabelPreview'
import { measureSmvVisualLineCount, SMV_PREVIEW_FONT } from '../utils/smvTextMeasure'
import { clampTextToVisualLineBudget } from '../utils/visualLineClamp'
import {
  SIMPLE_ICON_PRESETS,
  SIMPLE_ICON_VARIANT_ICON,
  SIMPLE_ICON_VARIANT_THUMB,
} from '../config/simpleIcon'
import { PANEL_WARN_AFTER_INPUT_CLASS, PANEL_WARN_SIBLING_CLASS } from '../config/panelWarn'
import {
  PANEL_ADD_ROW_BUTTON_CLASS,
  PANEL_AUX_BUTTON_CLASS,
  PANEL_DRAG_PORTAL_CARD_CLASS,
  PANEL_IMAGE_EMPTY_PLACEHOLDER_CLASS,
  PANEL_INSET_TOGGLE_WRAP_CLASS,
  PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS,
  PANEL_INSET_TOGGLE_BUTTON_CLASS,
  PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS,
  PANEL_SECTION_TITLE_CLASS,
  PANEL_SLIDE_CARD_BASE,
  PANEL_SLIDE_CARD_BORDER_DROP,
  PANEL_SLIDE_CARD_BORDER_IDLE,
} from '../config/panelUi'

const MIN_CONTRAST = 3.1

/** Carousel / Simple Icon 패널 내 한 줄 텍스트 입력(smv-btn 등)과 동일 스타일 */
const SMV_PANEL_INPUT_CLASS =
  'w-full px-3 py-2 rounded-lg bg-surface-800 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50'

/** 제목·설명 textarea — 위와 동일 박스·글자색 + 줄바꿈만 금지 */
const SMV_TITLE_DESC_TEXTAREA_CLASS = `${SMV_PANEL_INPUT_CLASS} resize-none`

/** 이미지 URL 입력 — 바깥 셸 + 안쪽 텍스트형 적용 버튼 (h-11 통일) */
const IMAGE_ROW_URL_SHELL_CLASS =
  'flex h-11 w-full min-w-0 items-stretch rounded-lg border border-zinc-700 bg-surface-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-[box-shadow,border-color] focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/45'
const IMAGE_ROW_URL_INPUT_CLASS =
  'flex-1 min-w-0 min-h-0 bg-transparent border-0 px-3 py-2 text-zinc-200 placeholder-zinc-500 text-sm leading-normal focus:outline-none focus:ring-0'
const IMAGE_ROW_APPLY_TEXT_BTN_CLASS =
  'inline-flex shrink-0 items-center self-stretch rounded-r-lg border-l border-zinc-700 bg-surface-700 px-4 text-sm font-medium leading-normal text-zinc-200 transition-colors hover:bg-surface-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/45'
const IMAGE_ROW_FILE_BUTTON_CLASS =
  'inline-flex h-11 shrink-0 items-center justify-center px-4 rounded-lg bg-surface-700 hover:bg-surface-600 text-zinc-200 text-sm font-medium leading-normal border border-zinc-700 transition-colors whitespace-nowrap'

const Section = ({ title, children, className = '' }) => (
  <div className={`py-5 px-5 border-b border-zinc-800/90 last:border-b-0 ${className}`}>
    {title ? <h2 className={PANEL_SECTION_TITLE_CLASS}>{title}</h2> : null}
    {children}
  </div>
)

const Label = ({ children, htmlFor, noMargin, className = '' }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-zinc-300 ${noMargin ? '' : 'mb-1.5'} ${className}`}
  >
    {children}
  </label>
)

function ImageUrlApplyField({ id, onSubmit, submitLabel }) {
  return (
    <form onSubmit={onSubmit} className="w-full min-w-0">
      <div className={IMAGE_ROW_URL_SHELL_CLASS}>
        <input
          id={id}
          name="url"
          type="url"
          placeholder="https://..."
          className={IMAGE_ROW_URL_INPUT_CLASS}
        />
        <button type="submit" className={IMAGE_ROW_APPLY_TEXT_BTN_CLASS}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function ButtonLabelTextField({
  id,
  value,
  onChange,
  popupType,
  buttonCount,
  warnMessage,
}) {
  const innerW = useMemo(
    () => getPreviewButtonLabelInnerWidthPx(popupType, buttonCount),
    [popupType, buttonCount]
  )
  const [showWarn, setShowWarn] = useState(false)

  useLayoutEffect(() => {
    const raw = value ?? ''
    const clamped = clampTextToVisualLineBudget(raw, {
      widthPx: innerW,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      maxLines: 1,
      lineHeightPx: BUTTON_LABEL_LINE_HEIGHT_PX,
      fontSizePx: BUTTON_LABEL_FONT_SIZE_PX,
      fontWeight: BUTTON_LABEL_FONT_WEIGHT,
      fontFamily: BUTTON_LABEL_FONT_FAMILY,
      textAlign: 'center',
    })
    if (clamped !== raw) {
      onChange(clamped)
      setShowWarn(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-way sync; onChange stable per field
  }, [value, innerW])

  return (
    <>
      <input
        id={id}
        type="text"
        value={value ?? ''}
        onChange={(e) => {
          setShowWarn(false)
          onChange(e.target.value)
        }}
        className={SMV_PANEL_INPUT_CLASS}
      />
      {showWarn && warnMessage ? (
        <p className={PANEL_WARN_AFTER_INPUT_CLASS}>{warnMessage}</p>
      ) : null}
    </>
  )
}

function TwoLineOverflowField({
  id,
  label,
  value,
  onChange,
  heightPx,
  lineHeightPx,
  fontSizePx,
  fontWeight,
  textAlign,
  fontFamily,
  maxLines,
  maxLinesWarnMessage,
  /** 미리보기 영역과 동일한 줄바꿈 폭(px). 지정 시 textarea 너비 대신 이 값으로 제한 */
  previewClampWidth,
  /** 미리보기(Preview)와 동일 타이포로 줄 수·클램프 계산 — 없으면 위 표시용 props 사용 */
  clampLineHeightPx,
  clampFontSizePx,
  clampFontWeight,
  clampTextAlign,
  clampFontFamily,
  /** textarea 클래스 — 제목·설명 기본은 버튼 텍스트 입력과 동일 패널 스타일 */
  textareaClassName = SMV_TITLE_DESC_TEXTAREA_CLASS,
}) {
  const ref = useRef(null)
  const [showMaxLinesWarn, setShowMaxLinesWarn] = useState(false)
  const [measureTick, setMeasureTick] = useState(0)

  const cLineH = clampLineHeightPx ?? lineHeightPx
  const cFontS = clampFontSizePx ?? fontSizePx
  const cWeight = clampFontWeight ?? fontWeight
  const cAlign = clampTextAlign ?? textAlign
  const cFamily = clampFontFamily ?? fontFamily ?? SMV_PREVIEW_FONT

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (maxLines != null) {
      const cs = window.getComputedStyle(el)
      const padT = parseFloat(cs.paddingTop) || 0
      const padB = parseFloat(cs.paddingBottom) || 0
      const raw = value ?? ''
      const trimmed = raw.trim()
      let usedLines = maxLines
      const widthForMeasure =
        previewClampWidth != null ? previewClampWidth : el.clientWidth || SMV_COLUMN_W
      usedLines = trimmed
        ? Math.min(
            maxLines,
            measureSmvVisualLineCount(raw, {
              widthPx: widthForMeasure,
              lineHeightPx: cLineH,
              fontSizePx: cFontS,
              fontWeight: cWeight,
              fontFamily: cFamily,
              maxLines,
              textAlign: cAlign,
            })
          )
        : 1
      const fixedH = padT + padB + usedLines * lineHeightPx
      el.style.height = `${fixedH}px`
      el.style.minHeight = `${fixedH}px`
      el.style.maxHeight = `${fixedH}px`
      el.style.overflow = 'hidden'
      return
    }
    el.style.height = 'auto'
    el.style.minHeight = `${heightPx}px`
    el.style.maxHeight = ''
    el.style.overflow = 'hidden'
    el.style.height = `${Math.max(heightPx, el.scrollHeight)}px`
  }, [
    value,
    heightPx,
    lineHeightPx,
    maxLines,
    previewClampWidth,
    fontSizePx,
    fontWeight,
    fontFamily,
    cLineH,
    cFontS,
    cWeight,
    cAlign,
    cFamily,
  ])

  useLayoutEffect(() => {
    if (maxLines == null) return
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setMeasureTick((t) => t + 1))
    ro.observe(el)
    return () => ro.disconnect()
  }, [maxLines])

  useLayoutEffect(() => {
    if (maxLines == null) return
    const el = ref.current
    const raw = value ?? ''
    let clamped
    if (previewClampWidth != null) {
      clamped = clampTextToVisualLineBudget(raw, {
        widthPx: previewClampWidth,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        maxLines,
        lineHeightPx: cLineH,
        fontSizePx: cFontS,
        fontWeight: cWeight,
        fontFamily: cFamily,
        textAlign: cAlign,
      })
    } else {
      if (!el || el.clientWidth <= 0) return
      const cs = window.getComputedStyle(el)
      const padT = parseFloat(cs.paddingTop) || 0
      const padR = parseFloat(cs.paddingRight) || 0
      const padB = parseFloat(cs.paddingBottom) || 0
      const padL = parseFloat(cs.paddingLeft) || 0
      clamped = clampTextToVisualLineBudget(raw, {
        widthPx: el.clientWidth,
        paddingTop: padT,
        paddingRight: padR,
        paddingBottom: padB,
        paddingLeft: padL,
        maxLines,
        lineHeightPx: cLineH,
        fontSizePx: cFontS,
        fontWeight: cWeight,
        fontFamily: cFamily,
        textAlign: cAlign,
      })
    }
    if (clamped !== raw) {
      onChange(clamped)
      setShowMaxLinesWarn(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- field-specific onChange; sync from prop only
  }, [
    value,
    maxLines,
    lineHeightPx,
    fontSizePx,
    fontWeight,
    fontFamily,
    textAlign,
    measureTick,
    previewClampWidth,
    cLineH,
    cFontS,
    cWeight,
    cAlign,
    cFamily,
  ])

  const handleChange = (e) => {
    if (maxLines != null) setShowMaxLinesWarn(false)
    onChange(e.target.value)
  }

  const baseStyle =
    maxLines != null
      ? {
          lineHeight: `${lineHeightPx}px`,
          overflow: 'hidden',
          fontSize: fontSizePx,
          fontWeight: fontWeight ?? undefined,
          textAlign: textAlign ?? 'start',
          fontFamily: fontFamily ?? undefined,
        }
      : {
          minHeight: heightPx,
          lineHeight: `${lineHeightPx}px`,
          overflow: 'hidden',
          fontSize: fontSizePx,
          fontWeight: fontWeight ?? undefined,
          textAlign: textAlign ?? 'start',
          fontFamily: fontFamily ?? undefined,
        }

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        ref={ref}
        value={value}
        onChange={handleChange}
        className={textareaClassName}
        style={baseStyle}
      />
      {maxLines != null && showMaxLinesWarn && maxLinesWarnMessage ? (
        <p className={PANEL_WARN_AFTER_INPUT_CLASS}>{maxLinesWarnMessage}</p>
      ) : null}
    </div>
  )
}

function ContrastFeedback({ hex }) {
  const ratio = contrastWithWhite(hex)
  const pass = ratio >= MIN_CONTRAST
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={`text-sm font-medium ${pass ? 'text-green-400' : 'text-red-400'}`}
      >
        Contrast: {ratio.toFixed(1)}:1
      </span>
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded ${
          pass ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}
      >
        {pass ? 'Pass' : 'Fail'}
      </span>
    </div>
  )
}

function filterHexDraft(raw) {
  const t = String(raw).trim()
  if (t === '' || t === '#') return t
  const withHash = t.startsWith('#') ? t : '#' + t
  return '#' + withHash.slice(1).replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
}

/** #RGB 또는 #RRGGBB만 허용 */
function tryParseHexString(s) {
  const only = String(s)
    .trim()
    .replace(/^#/, '')
    .replace(/[^0-9a-fA-F]/g, '')
  if (only.length === 3) {
    return (
      '#' +
      only
        .toLowerCase()
        .split('')
        .map((c) => c + c)
        .join('')
    )
  }
  if (only.length === 6) return '#' + only.toLowerCase()
  return null
}

function HexColorTextField({ id, value, onValidHex }) {
  const [draft, setDraft] = useState(value)
  useEffect(() => {
    setDraft(value)
  }, [value])

  const commit = () => {
    const parsed = tryParseHexString(draft)
    if (parsed) onValidHex(parsed)
    else setDraft(value)
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="text"
      value={draft}
      onChange={(e) => setDraft(filterHexDraft(e.target.value))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          commit()
        }
      }}
      className="w-[8.25rem] shrink-0 px-2.5 py-1.5 rounded-lg bg-surface-800 border border-zinc-700 text-zinc-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/50"
      placeholder="#000000"
      spellCheck={false}
      autoComplete="off"
      aria-label="Hex color (#RRGGBB)"
    />
  )
}

function SmvSlideDragHandleIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9 5h2v2H9V5zm4 0h2v2h-2V5zM9 11h2v2H9v-2zm4 0h2v2h-2v-2zM9 17h2v2H9v-2zm4 0h2v2h-2v-2z" />
    </svg>
  )
}

/** 세로 리스트 기준 pointer Y로 드롭 인덱스 (각 행 중앙선) */
function computeSmvDropIndex(clientY, rowRefs) {
  const list = rowRefs?.current
  if (!list?.length) return 0
  for (let j = 0; j < list.length; j++) {
    const el = list[j]
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (r.height <= 0) continue
    const mid = r.top + r.height / 2
    if (clientY < mid) return j
  }
  return list.length - 1
}

function SmvOptionalSlotRemoveButton({ ariaLabel, onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="shrink-0 rounded p-1 text-zinc-500 transition-colors hover:text-red-400 focus:outline-none focus-visible:text-red-400 focus-visible:ring-2 focus-visible:ring-brand/40"
      aria-label={ariaLabel}
    >
      <svg
        className="h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  )
}

export default function ControlPanel({
  state,
  setImage,
  update,
  updateButton,
  setSlideModal11Slot,
  reorderSlideModal11Images,
  appendSlideModal11Slot,
  removeSlideModal11Slot,
  setSlideVerticalSlot,
  reorderSlideVerticalImages,
  appendSlideVerticalSlot,
  removeSlideVerticalSlot,
  t,
  onCopyHtml,
  copyToast,
  headerHelpOpen,
  onHeaderHelpEnter,
  onHeaderHelpLeave,
}) {
  const fileInputRef = useRef(null)
  const slide11SlotFileRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ]
  const smvSlotFileRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ]
  const smvRowRefs = useRef([])
  const smvDragRef = useRef(null)
  const reorderSmvRef = useRef(reorderSlideVerticalImages)
  reorderSmvRef.current = reorderSlideVerticalImages
  const slide11RowRefs = useRef([])
  const slide11DragRef = useRef(null)
  const reorderSlide11Ref = useRef(reorderSlideModal11Images)
  reorderSlide11Ref.current = reorderSlideModal11Images
  const [smvDrag, setSmvDrag] = useState(null)
  const [smvDragPos, setSmvDragPos] = useState({ x: 0, y: 0 })
  const [smvDragOver, setSmvDragOver] = useState(null)
  const [slide11Drag, setSlide11Drag] = useState(null)
  const [slide11DragPos, setSlide11DragPos] = useState({ x: 0, y: 0 })
  const [slide11DragOver, setSlide11DragOver] = useState(null)
  const [contrastWarning, setContrastWarning] = useState({ button1: false, button2: false })
  const copyFooterBtnRef = useRef(null)
  const copyToastBubbleRef = useRef(null)
  /** 복사 토스트 — 패널 가로 전체 줄(짙은 배경처럼 보임) 없이 말풍선만 뜨도록 body 고정 배치 */
  const [copyToastFixedPos, setCopyToastFixedPos] = useState(null)
  const tr = t || {}

  const layoutCopyToast = useCallback(() => {
    if (!copyToast || !copyFooterBtnRef.current || !copyToastBubbleRef.current) {
      setCopyToastFixedPos(null)
      return
    }
    const br = copyFooterBtnRef.current.getBoundingClientRect()
    const bubble = copyToastBubbleRef.current
    const h = bubble.offsetHeight
    const w = bubble.offsetWidth
    const gap = 16
    let left = br.left + br.width / 2 - w / 2
    const margin = 12
    const vw = window.innerWidth
    if (left < margin) left = margin
    if (left + w > vw - margin) left = vw - margin - w
    setCopyToastFixedPos({
      top: Math.max(margin, br.top - h - gap),
      left,
    })
  }, [copyToast])

  useLayoutEffect(() => {
    layoutCopyToast()
    const id = requestAnimationFrame(() => layoutCopyToast())
    return () => cancelAnimationFrame(id)
  }, [layoutCopyToast])

  useEffect(() => {
    if (!copyToast) return
    layoutCopyToast()
    window.addEventListener('resize', layoutCopyToast)
    window.addEventListener('scroll', layoutCopyToast, true)
    return () => {
      window.removeEventListener('resize', layoutCopyToast)
      window.removeEventListener('scroll', layoutCopyToast, true)
    }
  }, [copyToast, layoutCopyToast])
  const isSlideModal11 = state.popupType === POPUP_TYPE_IDS.SLIDE_MODAL_1_1
  const isSmvCarousel = isCarouselThumbPopupType(state.popupType)
  const isSimpleIconModal = state.popupType === POPUP_TYPE_IDS.SIMPLE_ICON_MODAL
  const isBottomSlideUp = state.popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP
  const slideImages = state.slideImages || []
  const slideModal11Norm = normalizeSlideModal11Images(state.slideImages)
  const slideModal11SlotKeys = normalizeSlideModal11SlotKeys(
    state.slideImages,
    state.slideImagesSlotKeys
  )
  const slideCount = isSlideModal11 ? slideModal11Norm.length : slideImages.length
  const slideVerticalImages = normalizeSlideVerticalImages(state.slideVerticalImages)
  const slideVerticalSlotKeys = normalizeSlideVerticalSlotKeys(
    state.slideVerticalImages,
    state.slideVerticalSlotKeys
  )

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result, 'file')
    reader.readAsDataURL(file)
  }

  const handleUrlSubmit = (e) => {
    e.preventDefault()
    const url = e.target.url?.value?.trim()
    if (url) setImage(url, 'url')
  }

  const bumpSlidePreview = (delta) => {
    if (!slideCount) return
    const cur = state.slidePreviewIndex ?? 0
    const next = Math.min(slideCount - 1, Math.max(0, cur + delta))
    update('slidePreviewIndex', next)
  }

  const bumpSlideVerticalPreview = (delta) => {
    const maxIdx = Math.max(0, slideVerticalImages.length - 1)
    const cur = state.slideVerticalPreviewIndex ?? 0
    const next = Math.min(maxIdx, Math.max(0, cur + delta))
    update('slideVerticalPreviewIndex', next)
  }

  const handleSmvSlotUrlSubmit = (slotIndex) => (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const url = String(fd.get('url') ?? '').trim()
    if (url) setSlideVerticalSlot(slotIndex, url)
    e.currentTarget.reset()
  }

  const handleSlide11SlotUrlSubmit = (slotIndex) => (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const url = String(fd.get('url') ?? '').trim()
    if (url) setSlideModal11Slot(slotIndex, url)
    e.currentTarget.reset()
  }

  const handleBgColorChange = (which, hex) => {
    const meets = meetsContrastWithWhite(hex, MIN_CONTRAST)
    if (!meets) {
      setContrastWarning((w) => ({ ...w, [which]: true }))
      const corrected = ensureContrastWithWhite(hex, MIN_CONTRAST)
      updateButton(which, 'bgColor', corrected)
    } else {
      setContrastWarning((w) => ({ ...w, [which]: false }))
      updateButton(which, 'bgColor', hex)
    }
  }

  useLayoutEffect(() => {
    const n = slideVerticalImages.length
    if (smvRowRefs.current.length > n) smvRowRefs.current = smvRowRefs.current.slice(0, n)
  }, [slideVerticalImages.length])

  useLayoutEffect(() => {
    const n = slideModal11Norm.length
    if (slide11RowRefs.current.length > n) slide11RowRefs.current = slide11RowRefs.current.slice(0, n)
  }, [slideModal11Norm.length])

  useEffect(() => {
    if (!smvDrag) return undefined
    const onMove = (e) => {
      setSmvDragPos({ x: e.clientX, y: e.clientY })
      setSmvDragOver(computeSmvDropIndex(e.clientY, smvRowRefs))
    }
    const onEnd = (e) => {
      const d = smvDragRef.current
      if (d) {
        const drop = computeSmvDropIndex(e.clientY, smvRowRefs)
        if (drop !== d.fromIndex) reorderSmvRef.current(d.fromIndex, drop)
      }
      smvDragRef.current = null
      setSmvDrag(null)
      setSmvDragOver(null)
      document.body.style.cursor = ''
    }
    document.body.style.cursor = 'grabbing'
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onEnd)
    document.addEventListener('pointercancel', onEnd)
    return () => {
      document.body.style.cursor = ''
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onEnd)
      document.removeEventListener('pointercancel', onEnd)
    }
  }, [smvDrag])

  useEffect(() => {
    if (!slide11Drag) return undefined
    const onMove = (e) => {
      setSlide11DragPos({ x: e.clientX, y: e.clientY })
      setSlide11DragOver(computeSmvDropIndex(e.clientY, slide11RowRefs))
    }
    const onEnd = (e) => {
      const d = slide11DragRef.current
      if (d) {
        const drop = computeSmvDropIndex(e.clientY, slide11RowRefs)
        if (drop !== d.fromIndex) reorderSlide11Ref.current(d.fromIndex, drop)
      }
      slide11DragRef.current = null
      setSlide11Drag(null)
      setSlide11DragOver(null)
      document.body.style.cursor = ''
    }
    document.body.style.cursor = 'grabbing'
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onEnd)
    document.addEventListener('pointercancel', onEnd)
    return () => {
      document.body.style.cursor = ''
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onEnd)
      document.removeEventListener('pointercancel', onEnd)
    }
  }, [slide11Drag])

  const handleSmvHandlePointerDown = useCallback(
    (slotIndex, e) => {
      if (e.button !== 0) return
      const li = smvRowRefs.current[slotIndex]
      if (!li) return
      e.preventDefault()
      e.stopPropagation()
      const rect = li.getBoundingClientRect()
      const payload = {
        fromIndex: slotIndex,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        width: rect.width,
        height: rect.height,
      }
      smvDragRef.current = payload
      setSmvDrag(payload)
      setSmvDragPos({ x: e.clientX, y: e.clientY })
      setSmvDragOver(computeSmvDropIndex(e.clientY, smvRowRefs))
    },
    []
  )

  const handleSlide11HandlePointerDown = useCallback((slotIndex, e) => {
    if (e.button !== 0) return
    const li = slide11RowRefs.current[slotIndex]
    if (!li) return
    e.preventDefault()
    e.stopPropagation()
    const rect = li.getBoundingClientRect()
    const payload = {
      fromIndex: slotIndex,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    }
    slide11DragRef.current = payload
    setSlide11Drag(payload)
    setSlide11DragPos({ x: e.clientX, y: e.clientY })
    setSlide11DragOver(computeSmvDropIndex(e.clientY, slide11RowRefs))
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-zinc-800/90 bg-zinc-950/50 px-5 pb-5 pt-5">
        <PopupTypePicker
          popupType={state.popupType}
          update={update}
          t={tr}
          simpleIconVariant={state.simpleIconVariant}
          simpleIconThumbSize={state.simpleIconThumbSize}
          language={state.language}
          onLanguageChange={(code) => update('language', code)}
          headerHelpOpen={headerHelpOpen}
          onHeaderHelpEnter={onHeaderHelpEnter}
          onHeaderHelpLeave={onHeaderHelpLeave}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="py-2">
      {isSmvCarousel ? (
        <>
          <Section
            title={`${tr.smvGroupImage || 'Image'} ${tr.smvCarouselSlotRange ?? '(min 3 — max 6)'}`}
          >
            <div className="space-y-4">
              <LayoutGroup id="smv-slide-rows">
              <ul className="space-y-3">
                {slideVerticalImages.map((src, i) => (
                  <motion.li
                    key={slideVerticalSlotKeys[i]}
                    layout={!smvDrag}
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 34,
                      mass: 0.82,
                    }}
                    ref={(el) => {
                      smvRowRefs.current[i] = el
                    }}
                    className={`${PANEL_SLIDE_CARD_BASE} ${smvDrag?.fromIndex === i ? 'opacity-[0.2]' : ''} ${
                      smvDragOver === i && smvDrag && smvDrag.fromIndex !== i
                        ? PANEL_SLIDE_CARD_BORDER_DROP
                        : PANEL_SLIDE_CARD_BORDER_IDLE
                    }`}
                  >
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2">
                      <div
                        onPointerDown={(e) => handleSmvHandlePointerDown(i, e)}
                        className="flex items-center justify-center self-center shrink-0 cursor-grab touch-none rounded p-0.5 text-zinc-500 hover:bg-zinc-700/80 hover:text-zinc-300 active:cursor-grabbing [-webkit-touch-callout:none]"
                        aria-label={
                          tr.smvDragReorderAria ||
                          'Drag up or down to change slide order'
                        }
                      >
                        <SmvSlideDragHandleIcon />
                      </div>
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <Label htmlFor={`smv-slot-${i}`} noMargin className="min-w-0 truncate">
                          {tr.smvSlotLabel?.replace('{n}', String(i + 1)) ||
                            `슬라이드 ${i + 1}`}
                        </Label>
                        {i >= SLIDE_MODAL_VERTICAL_MIN_IMAGES ? (
                          <SmvOptionalSlotRemoveButton
                            ariaLabel={
                              tr.smvRemoveSlideSlotAria ||
                              `Remove slide slot ${i + 1}`
                            }
                            onClick={() => removeSlideVerticalSlot(i)}
                          />
                        ) : null}
                      </div>
                      <div className="col-start-2 flex flex-row flex-nowrap items-start gap-x-3 w-full min-w-0">
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <Label htmlFor={`smv-slot-upload-${i}`}>
                              {tr.imageUpload || '이미지 업로드'}
                            </Label>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                id={`smv-slot-upload-${i}`}
                                type="button"
                                onClick={() => smvSlotFileRefs[i].current?.click()}
                                className={IMAGE_ROW_FILE_BUTTON_CLASS}
                              >
                                {tr.chooseFile || '파일 선택'}
                              </button>
                              <input
                                ref={smvSlotFileRefs[i]}
                                id={`smv-slot-${i}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0]
                                  e.target.value = ''
                                  if (f) setSlideVerticalSlot(i, f)
                                }}
                              />
                              {src ? (
                                <button
                                  type="button"
                                  onClick={() => setSlideVerticalSlot(i, null)}
                                  className="px-2 py-1.5 rounded text-xs text-red-400 hover:bg-red-950/50 border border-red-900/40 whitespace-nowrap"
                                >
                                  {tr.slideRemove || '삭제'}
                                </button>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <Label htmlFor={`smv-url-${i}`}>{tr.imageUrl || '이미지 URL'}</Label>
                            <ImageUrlApplyField
                              id={`smv-url-${i}`}
                              onSubmit={handleSmvSlotUrlSubmit(i)}
                              submitLabel={tr.apply || '적용'}
                            />
                          </div>
                        </div>
                      {src ? (
                        <img
                          src={src}
                          alt=""
                          className="col-start-2 w-full max-h-24 rounded object-contain bg-zinc-900"
                        />
                      ) : (
                        <div
                          className={`col-start-2 ${PANEL_IMAGE_EMPTY_PLACEHOLDER_CLASS}`}
                        >
                          {tr.noImage || '배경 이미지 없음'}
                        </div>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
              {smvDrag && typeof document !== 'undefined'
                ? createPortal(
                    <div
                      className={PANEL_DRAG_PORTAL_CARD_CLASS}
                      style={{
                        width: smvDrag.width,
                        left: Math.min(
                          Math.max(8, smvDragPos.x - smvDrag.offsetX),
                          typeof window !== 'undefined'
                            ? window.innerWidth - smvDrag.width - 8
                            : 8
                        ),
                        top: Math.min(
                          Math.max(8, smvDragPos.y - smvDrag.offsetY),
                          typeof window !== 'undefined'
                            ? window.innerHeight - smvDrag.height - 8
                            : 8
                        ),
                        boxSizing: 'border-box',
                      }}
                      aria-hidden
                    >
                      <div className="flex gap-3 opacity-95">
                        <div className="mt-1 shrink-0 rounded p-0.5 text-zinc-400">
                          <SmvSlideDragHandleIcon />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="text-sm font-medium text-zinc-200 leading-snug">
                            {tr.smvSlotLabel?.replace('{n}', String(smvDrag.fromIndex + 1)) ||
                              `슬라이드 ${smvDrag.fromIndex + 1}`}
                          </p>
                          <div className="flex flex-row flex-nowrap items-start gap-x-3 w-full min-w-0 opacity-90">
                            <span className="text-[11px] text-zinc-500 shrink-0">
                              {tr.imageUpload || '이미지 업로드'}
                            </span>
                            <span className="text-[11px] text-zinc-500 truncate">
                              {tr.imageUrl || '이미지 URL'}
                            </span>
                          </div>
                          {slideVerticalImages[smvDrag.fromIndex] ? (
                            <img
                              src={slideVerticalImages[smvDrag.fromIndex]}
                              alt=""
                              className="w-full max-h-24 rounded object-contain bg-zinc-900"
                            />
                          ) : (
                            <div className={PANEL_IMAGE_EMPTY_PLACEHOLDER_CLASS}>{tr.noImage || '배경 이미지 없음'}</div>
                          )}
                        </div>
                      </div>
                    </div>,
                    document.body
                  )
                : null}
              </LayoutGroup>
              {slideVerticalImages.length < SLIDE_MODAL_VERTICAL_MAX_IMAGES && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => appendSlideVerticalSlot()}
                    className={PANEL_ADD_ROW_BUTTON_CLASS}
                  >
                    {tr.smvAddSlideSlot ?? '이미지 추가'}
                  </button>
                </div>
              )}
              <div>
                <Label>{tr.slidePreview || '미리보기 슬라이드'}</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => bumpSlideVerticalPreview(-1)}
                    className={PANEL_AUX_BUTTON_CLASS}
                  >
                    {tr.slidePrev || '이전'}
                  </button>
                  <span className="text-sm text-zinc-400 tabular-nums">
                    {(state.slideVerticalPreviewIndex ?? 0) + 1} /{' '}
                    {slideVerticalImages.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => bumpSlideVerticalPreview(1)}
                    className={PANEL_AUX_BUTTON_CLASS}
                  >
                    {tr.slideNext || '다음'}
                  </button>
                </div>
              </div>
            </div>
          </Section>
          <Section title={tr.sectionContent || 'Content'}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <TwoLineOverflowField
                  id="smv-title"
                  label={tr.smvTitleLabel || '제목'}
                  value={state.slideVerticalTitle ?? ''}
                  onChange={(v) => update('slideVerticalTitle', v)}
                  heightPx={56}
                  lineHeightPx={28}
                  fontSizePx={20}
                  fontWeight={700}
                  textAlign="center"
                  fontFamily={SMV_PREVIEW_FONT}
                  maxLines={2}
                  previewClampWidth={SMV_COLUMN_W}
                  maxLinesWarnMessage={tr.smvTitleMaxTwoLinesWarn}
                />
                {!(state.slideVerticalTitle ?? '').trim() ? (
                  <p className={PANEL_WARN_SIBLING_CLASS}>
                    {tr.smvTitleRequiredWarning || '제목을 입력해 주세요.'}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <TwoLineOverflowField
                  id="smv-desc"
                  label={tr.smvDescLabel || '설명'}
                  value={state.slideVerticalDescription ?? ''}
                  onChange={(v) => update('slideVerticalDescription', v)}
                  heightPx={40}
                  lineHeightPx={20}
                  fontSizePx={13}
                  fontWeight={400}
                  textAlign="center"
                  fontFamily={SMV_PREVIEW_FONT}
                  maxLines={2}
                  previewClampWidth={SMV_COLUMN_W}
                  maxLinesWarnMessage={tr.smvDescMaxTwoLinesWarn}
                />
                {!(state.slideVerticalDescription ?? '').trim() ? (
                  <p className={PANEL_WARN_SIBLING_CLASS}>
                    {tr.smvDescRequiredWarning || '설명을 입력해 주세요.'}
                  </p>
                ) : null}
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="smv-btn">{tr.smvBtnLabel || 'Button text'}</Label>
                  <ButtonLabelTextField
                    id="smv-btn"
                    value={state.button1?.label ?? ''}
                    onChange={(v) => updateButton('button1', 'label', v)}
                    popupType={state.popupType}
                    buttonCount={state.buttonCount ?? 1}
                    warnMessage={tr.buttonLabelOneLineWarn}
                  />
                </div>
              </div>
            </div>
          </Section>
        </>
      ) : isSimpleIconModal ? (
        <>
          {(state.simpleIconVariant ?? SIMPLE_ICON_VARIANT_THUMB) === SIMPLE_ICON_VARIANT_THUMB ? (
            <Section title={tr.simpleIconSectionThumbImage || 'Image'}>
              <div className="flex flex-row flex-wrap gap-x-4 gap-y-3 items-start">
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Label htmlFor="simple-thumb-file">{tr.imageUpload || '이미지 업로드'}</Label>
                  <button
                    id="simple-thumb-file"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={IMAGE_ROW_FILE_BUTTON_CLASS}
                  >
                    {tr.chooseFile || '파일 선택'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                  <Label htmlFor="simple-thumb-url">{tr.imageUrl || '이미지 URL'}</Label>
                  <ImageUrlApplyField
                    id="simple-thumb-url"
                    onSubmit={handleUrlSubmit}
                    submitLabel={tr.apply || '적용'}
                  />
                </div>
              </div>
            </Section>
          ) : (
            <Section title={tr.simpleIconSectionIcon || 'Icon'}>
              <div className="grid grid-cols-3 gap-3">
                {SIMPLE_ICON_PRESETS.map((p) => {
                  const sel = (state.simpleIconPresetId ?? 'gift') === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => update('simpleIconPresetId', p.id)}
                      className={`group rounded-lg border p-2 flex flex-col items-center justify-center gap-3 min-h-[88px] transition-colors ${
                        sel
                          ? 'border-transparent bg-brand/25 ring-1 ring-brand/35'
                          : 'border-zinc-700 bg-surface-800/50 hover:border-zinc-600'
                      }`}
                    >
                      <img src={p.src} alt="" className="w-[70px] h-[70px] object-contain shrink-0" />
                      <span
                        className={`text-[11px] leading-tight text-center px-0.5 line-clamp-2 font-semibold ${
                          sel ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                        }`}
                      >
                        {tr[p.labelKey] ?? p.id}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Section>
          )}
          <Section title={tr.sectionContent || 'Content'}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <TwoLineOverflowField
                  id="simple-icon-title"
                  label={tr.smvTitleLabel || '제목'}
                  value={state.slideVerticalTitle ?? ''}
                  onChange={(v) => update('slideVerticalTitle', v)}
                  heightPx={56}
                  lineHeightPx={28}
                  fontSizePx={20}
                  fontWeight={700}
                  textAlign="center"
                  fontFamily={SMV_PREVIEW_FONT}
                  maxLines={2}
                  previewClampWidth={SMV_COLUMN_W}
                  maxLinesWarnMessage={tr.smvTitleMaxTwoLinesWarn}
                />
                {!(state.slideVerticalTitle ?? '').trim() ? (
                  <p className={PANEL_WARN_SIBLING_CLASS}>
                    {tr.smvTitleRequiredWarning || '제목을 입력해 주세요.'}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <TwoLineOverflowField
                  id="simple-icon-desc"
                  label={tr.smvDescLabel || '설명'}
                  value={state.slideVerticalDescription ?? ''}
                  onChange={(v) => update('slideVerticalDescription', v)}
                  heightPx={40}
                  lineHeightPx={20}
                  fontSizePx={13}
                  fontWeight={400}
                  textAlign="center"
                  fontFamily={SMV_PREVIEW_FONT}
                  maxLines={2}
                  previewClampWidth={SMV_COLUMN_W}
                  maxLinesWarnMessage={tr.smvDescMaxTwoLinesWarn}
                />
                {!(state.slideVerticalDescription ?? '').trim() ? (
                  <p className={PANEL_WARN_SIBLING_CLASS}>
                    {tr.smvDescRequiredWarning || '설명을 입력해 주세요.'}
                  </p>
                ) : null}
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="simple-icon-btn">{tr.smvBtnLabel || 'Button text'}</Label>
                  <ButtonLabelTextField
                    id="simple-icon-btn"
                    value={state.button1?.label ?? ''}
                    onChange={(v) => updateButton('button1', 'label', v)}
                    popupType={state.popupType}
                    buttonCount={state.buttonCount ?? 1}
                    warnMessage={tr.buttonLabelOneLineWarn}
                  />
                </div>
              </div>
            </div>
          </Section>
        </>
      ) : isBottomSlideUp ? (
        <>
          <Section title={tr.appModeLabel ?? 'App Mode'}>
            <div className={PANEL_INSET_TOGGLE_WRAP_CLASS}>
              <button
                type="button"
                onClick={() => update('bottomSlideAppMode', 'light')}
                className={`${PANEL_INSET_TOGGLE_BUTTON_CLASS} ${
                  (state.bottomSlideAppMode ?? 'light') === 'light'
                    ? PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS
                    : PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS
                }`}
              >
                {tr.appModeLight ?? 'Light Mode'}
              </button>
              <button
                type="button"
                onClick={() => update('bottomSlideAppMode', 'dark')}
                className={`${PANEL_INSET_TOGGLE_BUTTON_CLASS} ${
                  state.bottomSlideAppMode === 'dark'
                    ? PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS
                    : PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS
                }`}
              >
                {tr.appModeDark ?? 'Dark Mode'}
              </button>
            </div>
          </Section>
          <Section title={tr.sectionBg || '이미지'}>
            <div className="flex flex-row flex-wrap gap-x-4 gap-y-3 items-start">
              <div className="flex flex-col gap-1.5 shrink-0">
                <Label htmlFor="bsu-file">{tr.imageUpload || '이미지 업로드'}</Label>
                <button
                  id="bsu-file"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={IMAGE_ROW_FILE_BUTTON_CLASS}
                >
                  {tr.chooseFile || '파일 선택'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <Label htmlFor="bsu-url">{tr.imageUrl || '이미지 URL'}</Label>
                <ImageUrlApplyField
                  id="bsu-url"
                  onSubmit={handleUrlSubmit}
                  submitLabel={tr.apply || '적용'}
                />
              </div>
            </div>
          </Section>
          <Section title={tr.bottomSlideDescriptionLabel ?? '설명'}>
            <TwoLineOverflowField
              id="bsu-desc"
              label={tr.bottomSlideDescriptionLabel ?? '설명'}
              value={state.bottomSlideUpText ?? ''}
              onChange={(v) => update('bottomSlideUpText', v)}
              heightPx={36}
              lineHeightPx={18}
              fontSizePx={13}
              fontWeight={500}
              textAlign="left"
              fontFamily={SMV_PREVIEW_FONT}
              maxLines={2}
              previewClampWidth={BOTTOM_SLIDE_UP_TEXT_CLAMP_W}
              maxLinesWarnMessage={tr.bottomSlideMaxTwoLinesWarn}
            />
          </Section>
        </>
      ) : (
        <Section
          title={
            isSlideModal11
              ? tr.slideModal11SectionImageTitle || '이미지 (최소 2장, 최대 6장)'
              : tr.sectionBg || '이미지'
          }
        >
          <div className="space-y-4">
            {isSlideModal11 ? (
              <>
                <LayoutGroup id="slide11-slide-rows">
                  <ul className="space-y-3">
                    {slideModal11Norm.map((src, i) => (
                      <motion.li
                        key={slideModal11SlotKeys[i]}
                        layout={!slide11Drag}
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 34,
                          mass: 0.82,
                        }}
                        ref={(el) => {
                          slide11RowRefs.current[i] = el
                        }}
                        className={`${PANEL_SLIDE_CARD_BASE} ${
                          slide11Drag?.fromIndex === i ? 'opacity-[0.2]' : ''
                        } ${
                          slide11DragOver === i && slide11Drag && slide11Drag.fromIndex !== i
                            ? PANEL_SLIDE_CARD_BORDER_DROP
                            : PANEL_SLIDE_CARD_BORDER_IDLE
                        }`}
                      >
                        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2">
                          <div
                            onPointerDown={(e) => handleSlide11HandlePointerDown(i, e)}
                            className="flex items-center justify-center self-center shrink-0 cursor-grab touch-none rounded p-0.5 text-zinc-500 hover:bg-zinc-700/80 hover:text-zinc-300 active:cursor-grabbing [-webkit-touch-callout:none]"
                            aria-label={
                              tr.smvDragReorderAria ||
                              'Drag up or down to change slide order'
                            }
                          >
                            <SmvSlideDragHandleIcon />
                          </div>
                          <div className="flex min-w-0 items-center justify-between gap-2">
                            <Label htmlFor={`slide11-slot-${i}`} noMargin className="min-w-0 truncate">
                              {tr.smvSlotLabel?.replace('{n}', String(i + 1)) ||
                                `슬라이드 ${i + 1}`}
                            </Label>
                            {i >= SLIDE_MODAL_11_MIN_IMAGES ? (
                              <SmvOptionalSlotRemoveButton
                                ariaLabel={
                                  tr.smvRemoveSlideSlotAria ||
                                  `Remove slide slot ${i + 1}`
                                }
                                onClick={() => removeSlideModal11Slot(i)}
                              />
                            ) : null}
                          </div>
                          <div className="col-start-2 flex flex-row flex-nowrap items-start gap-x-3 w-full min-w-0">
                              <div className="flex flex-col gap-1.5 shrink-0">
                                <Label htmlFor={`slide11-slot-upload-${i}`}>
                                  {tr.imageUpload || '이미지 업로드'}
                                </Label>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    id={`slide11-slot-upload-${i}`}
                                    type="button"
                                    onClick={() => slide11SlotFileRefs[i].current?.click()}
                                    className={IMAGE_ROW_FILE_BUTTON_CLASS}
                                  >
                                    {tr.chooseFile || '파일 선택'}
                                  </button>
                                  <input
                                    ref={slide11SlotFileRefs[i]}
                                    id={`slide11-slot-${i}`}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0]
                                      e.target.value = ''
                                      if (f) setSlideModal11Slot(i, f)
                                    }}
                                  />
                                  {src ? (
                                    <button
                                      type="button"
                                      onClick={() => setSlideModal11Slot(i, null)}
                                      className="px-2 py-1.5 rounded text-xs text-red-400 hover:bg-red-950/50 border border-red-900/40 whitespace-nowrap"
                                    >
                                      {tr.slideRemove || '삭제'}
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                <Label htmlFor={`slide11-url-${i}`}>{tr.imageUrl || '이미지 URL'}</Label>
                                <ImageUrlApplyField
                                  id={`slide11-url-${i}`}
                                  onSubmit={handleSlide11SlotUrlSubmit(i)}
                                  submitLabel={tr.apply || '적용'}
                                />
                              </div>
                            </div>
                          {src ? (
                            <img
                              src={src}
                              alt=""
                              className="col-start-2 w-full max-h-24 rounded object-contain bg-zinc-900"
                            />
                          ) : (
                            <div
                              className={`col-start-2 ${PANEL_IMAGE_EMPTY_PLACEHOLDER_CLASS}`}
                            >
                              {tr.noImage || '배경 이미지 없음'}
                            </div>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                  {slide11Drag && typeof document !== 'undefined'
                    ? createPortal(
                        <div
                          className={PANEL_DRAG_PORTAL_CARD_CLASS}
                          style={{
                            width: slide11Drag.width,
                            left: Math.min(
                              Math.max(8, slide11DragPos.x - slide11Drag.offsetX),
                              typeof window !== 'undefined'
                                ? window.innerWidth - slide11Drag.width - 8
                                : 8
                            ),
                            top: Math.min(
                              Math.max(8, slide11DragPos.y - slide11Drag.offsetY),
                              typeof window !== 'undefined'
                                ? window.innerHeight - slide11Drag.height - 8
                                : 8
                            ),
                            boxSizing: 'border-box',
                          }}
                          aria-hidden
                        >
                          <div className="flex gap-3 opacity-95">
                            <div className="mt-1 shrink-0 rounded p-0.5 text-zinc-400">
                              <SmvSlideDragHandleIcon />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                              <p className="text-sm font-medium text-zinc-200 leading-snug">
                                {tr.smvSlotLabel?.replace('{n}', String(slide11Drag.fromIndex + 1)) ||
                                  `슬라이드 ${slide11Drag.fromIndex + 1}`}
                              </p>
                              <div className="flex flex-row flex-nowrap items-start gap-x-3 w-full min-w-0 opacity-90">
                                <span className="text-[11px] text-zinc-500 shrink-0">
                                  {tr.imageUpload || '이미지 업로드'}
                                </span>
                                <span className="text-[11px] text-zinc-500 truncate">
                                  {tr.imageUrl || '이미지 URL'}
                                </span>
                              </div>
                              {slideModal11Norm[slide11Drag.fromIndex] ? (
                                <img
                                  src={slideModal11Norm[slide11Drag.fromIndex]}
                                  alt=""
                                  className="w-full max-h-24 rounded object-contain bg-zinc-900"
                                />
                              ) : (
                                <div className={PANEL_IMAGE_EMPTY_PLACEHOLDER_CLASS}>{tr.noImage || '배경 이미지 없음'}</div>
                              )}
                            </div>
                          </div>
                        </div>,
                        document.body
                      )
                    : null}
                </LayoutGroup>
                {slideModal11Norm.length < SLIDE_MODAL_11_MAX_IMAGES && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => appendSlideModal11Slot()}
                      className={PANEL_ADD_ROW_BUTTON_CLASS}
                    >
                      {tr.smvAddSlideSlot ?? '이미지 추가'}
                    </button>
                  </div>
                )}
                <div>
                  <Label>{tr.slidePreview || '미리보기 슬라이드'}</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => bumpSlidePreview(-1)}
                      className={PANEL_AUX_BUTTON_CLASS}
                    >
                      {tr.slidePrev || '이전'}
                    </button>
                    <span className="text-sm text-zinc-400 tabular-nums">
                      {(state.slidePreviewIndex ?? 0) + 1} / {slideCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => bumpSlidePreview(1)}
                      className={PANEL_AUX_BUTTON_CLASS}
                    >
                      {tr.slideNext || '다음'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-row flex-wrap gap-x-4 gap-y-3 items-start">
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Label htmlFor="popup-bg-file">{tr.imageUpload || '이미지 업로드'}</Label>
                  <button
                    id="popup-bg-file"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={IMAGE_ROW_FILE_BUTTON_CLASS}
                  >
                    {tr.chooseFile || '파일 선택'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                  <Label htmlFor="popup-bg-url">{tr.imageUrl || '이미지 URL'}</Label>
                  <ImageUrlApplyField
                    id="popup-bg-url"
                    onSubmit={handleUrlSubmit}
                    submitLabel={tr.apply || '적용'}
                  />
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {!isSlideModal11 && !isSmvCarousel && !isSimpleIconModal && !isBottomSlideUp && (
        <Section title={tr.sectionButtons || '버튼'}>
          <div className="space-y-4">
            <div
              role="radiogroup"
              aria-label={tr.sectionButtonCount || 'Button count'}
              className={PANEL_INSET_TOGGLE_WRAP_CLASS}
            >
              <button
                type="button"
                aria-pressed={state.buttonCount === 0}
                onClick={() => update('buttonCount', 0)}
                className={`${PANEL_INSET_TOGGLE_BUTTON_CLASS} ${
                  state.buttonCount === 0
                    ? PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS
                    : PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS
                }`}
              >
                {tr.buttonCountNone ?? '없음'}
              </button>
              <button
                type="button"
                aria-pressed={state.buttonCount === 1}
                onClick={() => update('buttonCount', 1)}
                className={`${PANEL_INSET_TOGGLE_BUTTON_CLASS} ${
                  state.buttonCount === 1
                    ? PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS
                    : PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS
                }`}
              >
                {tr.one ?? '1개'}
              </button>
              <button
                type="button"
                aria-pressed={state.buttonCount === 2}
                onClick={() => update('buttonCount', 2)}
                className={`${PANEL_INSET_TOGGLE_BUTTON_CLASS} ${
                  state.buttonCount === 2
                    ? PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS
                    : PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS
                }`}
              >
                {tr.two ?? '2개'}
              </button>
            </div>

            {state.buttonCount >= 1 && (
              <>
                <div className="mt-6 space-y-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {tr.sectionButton1 || 'Button 1'}
                  </p>
                  <div className="space-y-5">
                    <div>
                      <Label>{tr.text || '텍스트'}</Label>
                      <ButtonLabelTextField
                        id="choice-btn1-label"
                        value={state.button1.label}
                        onChange={(v) => updateButton('button1', 'label', v)}
                        popupType={state.popupType}
                        buttonCount={state.buttonCount ?? 1}
                        warnMessage={tr.buttonLabelOneLineWarn}
                      />
                    </div>
                    <div>
                      <Label>{tr.bgColor || '배경색'}</Label>
                      <div className="flex items-center gap-3 flex-wrap">
                        <input
                          type="color"
                          value={state.button1.bgColor}
                          onChange={(e) => handleBgColorChange('button1', e.target.value)}
                        />
                        <HexColorTextField
                          id="btn1-bg-hex"
                          value={state.button1.bgColor}
                          onValidHex={(hex) => handleBgColorChange('button1', hex)}
                        />
                        <ContrastFeedback hex={state.button1.bgColor} />
                      </div>
                      {contrastWarning.button1 && (
                        <p className={PANEL_WARN_AFTER_INPUT_CLASS}>
                          {tr.contrastWarning ||
                            '흰색 텍스트가 잘 보이지 않는 너무 밝은 색상입니다. 명도 대비 3.1:1 이상이 되도록 자동 보정했습니다.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {state.buttonCount === 2 && (
                  <div className="mt-8 space-y-5 border-t border-zinc-700 pt-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {tr.sectionButton2 || 'Button 2'}
                    </p>
                    <div className="space-y-5">
                      <div>
                        <Label>{tr.text || '텍스트'}</Label>
                        <ButtonLabelTextField
                          id="choice-btn2-label"
                          value={state.button2.label}
                          onChange={(v) => updateButton('button2', 'label', v)}
                          popupType={state.popupType}
                          buttonCount={state.buttonCount ?? 1}
                          warnMessage={tr.buttonLabelOneLineWarn}
                        />
                      </div>
                      <div>
                        <Label>{tr.bgColor || '배경색'}</Label>
                        <div className="flex items-center gap-3 flex-wrap">
                          <input
                            type="color"
                            value={state.button2.bgColor}
                            onChange={(e) => handleBgColorChange('button2', e.target.value)}
                          />
                          <HexColorTextField
                            id="btn2-bg-hex"
                            value={state.button2.bgColor}
                            onValidHex={(hex) => handleBgColorChange('button2', hex)}
                          />
                          <ContrastFeedback hex={state.button2.bgColor} />
                        </div>
                        {contrastWarning.button2 && (
                          <p className={PANEL_WARN_AFTER_INPUT_CLASS}>
                            {tr.contrastWarning ||
                              '흰색 텍스트가 잘 보이지 않는 너무 밝은 색상입니다. 명도 대비 3.1:1 이상이 되도록 자동 보정했습니다.'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Section>
      )}
      </div>
      </div>

      <div className="relative z-50 shrink-0">
        <button
          ref={copyFooterBtnRef}
          type="button"
          onClick={onCopyHtml}
          className={PANEL_STICKY_COPY_HTML_FOOTER_BTN_CLASS}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-base font-medium leading-none text-white">{tr.copyHtml}</span>
          </span>
        </button>
      </div>

      {typeof document !== 'undefined' &&
        copyToast &&
        createPortal(
          <div
            ref={copyToastBubbleRef}
            role="status"
            aria-live="polite"
            style={{
              position: 'fixed',
              top: copyToastFixedPos?.top ?? -9999,
              left: copyToastFixedPos?.left ?? 0,
              zIndex: 70,
              visibility: copyToastFixedPos ? 'visible' : 'hidden',
            }}
            className={`pointer-events-none inline-block w-max max-w-[min(calc(100vw-24px),22rem)] animate-[fadeIn_0.25s_ease-out] rounded-lg px-[10px] py-2 text-left text-sm leading-snug ring-1 whitespace-pre-line ${
              copyToast.variant === 'success'
                ? 'bg-emerald-950/95 text-emerald-50 ring-emerald-500/35'
                : copyToast.variant === 'danger'
                  ? 'bg-red-950/95 text-red-50 ring-red-500/35'
                  : 'bg-amber-950/95 text-amber-50 ring-amber-500/35'
            }`}
          >
            {copyToast.message}
          </div>,
          document.body
        )}
    </div>
  )
}
