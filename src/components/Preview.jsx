/**
 * 디자인 가이드:
 * - 팝업 컨테이너: border-radius 14px, overflow:hidden, 그림자 없음
 * - 이미지 없음: 짙은 기본 배경 / 이미지 있음: 배경 투명 + 이미지
 * - 버튼: Square top 280px / Vertical bottom 26px, buttonCount 1·2 시 표시 (0이면 미표시)
 * - 버튼 텍스트: 1줄, 좌우 패딩 16px
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  getPopupTypeConfig,
  isBottomSlideUpType,
  isCarouselThumbPopupType,
  isChoiceButtonModalType,
  isSimpleIconModalPopupType,
  POPUP_CONTAINER_BORDER_RADIUS,
  POPUP_EMPTY_BACKGROUND,
  POPUP_TYPE_IDS,
  isSlideModalAutoSquareType,
  SMV_BTN_BG,
  SMV_BTN_H,
  SMV_BTN_RADIUS,
  SMV_BTN_W,
  SMV_COLUMN_W,
  SMV_CAROUSEL_GAP,
  SMV_CAROUSEL_SLIDE_W,
  SMV_CONTENT_PAD_X,
  SMV_GAP_SLIDE_TEXT,
  SMV_GAP_TEXT_BTN,
  SMV_MODAL_W,
  SMV_PAD_BOTTOM,
  SMV_PAD_TOP,
  SMV_SIMPLE_ICON_PAD_TOP,
  SMV_SLIDE_RADIUS,
  getSmvCarouselSlideHeight,
  PREVIEW_PHONE_IPHONE_13_14_H,
  PREVIEW_PHONE_IPHONE_13_14_W,
  SMV_TITLE_DESC_GAP,
} from '../config/popupTypes'
import {
  SIMPLE_ICON_ICON_PX,
  SIMPLE_ICON_VARIANT_ICON,
  getSimpleIconMediaHeightPx,
  getSimpleIconPresetSrc,
  getSimpleIconThumbDimensions,
} from '../config/simpleIcon'
import BottomSlideUpPreview from './BottomSlideUpPreview'
import PreviewDeviceFrame from './PreviewDeviceFrame'
import { resolvePopupPreviewDimensions } from '../utils/popupLayout'
import { normalizeSlideModal11Images } from '../utils/slideModal11'
import { measureSmvVisualLineCount } from '../utils/smvTextMeasure'
import {
  getSmvCarouselTrack,
  getSmvLogicalIndexFromTrackIndex,
  normalizeSlideVerticalImages,
} from '../utils/slideVertical'
import { PREVIEW_DEVICE_PRESET_DEFAULT_ID } from '../config/previewDevicePresets'

const PREVIEW_SMV_CAROUSEL_VIEW_CLASS = 'preview-smv-carousel-view'
const PREVIEW_SMV_CAROUSEL_INSTANT_CLASS = 'preview-smv-carousel-view--instant'

/** 무한 루프 복제 구간으로 점프할 때만 컨테이너 scroll-behavior를 끈다(CSS smooth가 scrollIntoView를 덮어쓰는 경우 방지) */
function withInstantSmvScroll(carouselEl, run) {
  if (!carouselEl) return
  carouselEl.classList.add(PREVIEW_SMV_CAROUSEL_INSTANT_CLASS)
  try {
    run()
  } finally {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        carouselEl.classList.remove(PREVIEW_SMV_CAROUSEL_INSTANT_CLASS)
      })
    })
  }
}

/** Auto Square 캐러셀 순간 점프용(transition 없이 즉시 좌표 이동) */
function withInstantSlideModalScroll(carouselEl, run) {
  if (!carouselEl) return
  const prev = carouselEl.style.scrollBehavior
  carouselEl.style.scrollBehavior = 'auto'
  try {
    run()
  } finally {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        carouselEl.style.scrollBehavior = prev || ''
      })
    })
  }
}

function getLoopLogicalIndexFromTrackIndex(trackIndex, slotCount) {
  const n = Math.max(0, Number(slotCount) || 0)
  if (n <= 0) return 0
  if (trackIndex === 0) return n - 1
  if (trackIndex === n + 1) return 0
  return Math.min(Math.max(0, trackIndex - 1), n - 1)
}

/** 뷰포트 중앙과 가장 가까운 슬라이드 트랙 인덱스 (dup + n장 + dup) */
function getSmvTrackIndexCentered(viewportEl) {
  const slides = viewportEl.firstElementChild?.children
  if (!slides?.length) return 1
  const vr = viewportEl.getBoundingClientRect()
  const mid = vr.left + vr.width / 2
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < slides.length; i++) {
    const r = slides[i].getBoundingClientRect()
    const c = r.left + r.width / 2
    const d = Math.abs(c - mid)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

/** 가로 트랙(중복 없음): 중앙에 가장 가까운 슬라이드 인덱스 0..n-1 */
function getLinearTrackIndexCentered(viewportEl) {
  const slides = viewportEl.firstElementChild?.children
  if (!slides?.length) return 0
  const vr = viewportEl.getBoundingClientRect()
  const mid = vr.left + vr.width / 2
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < slides.length; i++) {
    const r = slides[i].getBoundingClientRect()
    const c = r.left + r.width / 2
    const d = Math.abs(c - mid)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

const POPUP_SIDE_MARGIN = 14
const BUTTON_HEIGHT = 48
const BUTTON_RADIUS = 4
const BUTTON_HORIZONTAL_PADDING = 16
const SINGLE_BUTTON_WIDTH = 300
const DUAL_BUTTON_WIDTH = 146
const DUAL_BUTTON_GAP = 8
const BUTTON_TEXT_COLOR = '#FFFFFF'
const BUTTON_FONT_SIZE = 15
const BUTTON_LINE_CLAMP_STYLE = {
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
  lineHeight: 1.2,
  textAlign: 'center',
  maxWidth: '100%',
  minWidth: 0,
}
const SLIDE_DOT_SIZE = 6
const SLIDE_DOT_GAP = 4
const SLIDE_DOT_BOTTOM_OFFSET = 8
const SLIDE_DOT_INACTIVE = '#ffffff'
const SLIDE_DOT_ACTIVE = '#00DC64'
const SLIDE_DOT_COLOR_TRANSITION = 'background-color 0.35s ease'
const FOOTER_TEXT_COLOR = '#FFFFFF'
const FOOTER_FONT_SIZE = 15

const SMV_TEXT_FONT =
  "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif"

/** 스크롤은 유지하고 트랙만 숨김 (가로·세로 모두; WebKit은 display:none이 더 안정적) */
const HIDE_SCROLLBAR_CLASS =
  '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'

const SMV_TITLE_TEXT_STYLE = {
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  lineHeight: '28px',
  fontSize: 20,
  fontWeight: 700,
  color: '#000000',
  margin: 0,
  width: '100%',
  minWidth: 0,
  textAlign: 'center',
  fontFamily: SMV_TEXT_FONT,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}
const SMV_DESC_TEXT_STYLE = {
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  lineHeight: '20px',
  fontSize: 13,
  fontWeight: 400,
  color: '#000000',
  margin: 0,
  width: '100%',
  minWidth: 0,
  textAlign: 'center',
  fontFamily: SMV_TEXT_FONT,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

function SlideDotIndicators({ count, activeIndex }) {
  if (count <= 0) return null
  const safeIdx = Math.min(Math.max(0, activeIndex), Math.max(0, count - 1))
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-10 flex justify-center items-center"
      style={{ bottom: SLIDE_DOT_BOTTOM_OFFSET, gap: SLIDE_DOT_GAP }}
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            width: SLIDE_DOT_SIZE,
            height: SLIDE_DOT_SIZE,
            borderRadius: '50%',
            backgroundColor: i === safeIdx ? SLIDE_DOT_ACTIVE : SLIDE_DOT_INACTIVE,
            transition: SLIDE_DOT_COLOR_TRANSITION,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}

function CloseXIcon({ className = 'flex-shrink-0' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ width: 20, height: 20 }}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

export default function Preview({
  state,
  t,
  onSlideVerticalPreviewIndexChange,
  onSlidePreviewIndexChange,
  previewScreenW = PREVIEW_PHONE_IPHONE_13_14_W,
  previewScreenH = PREVIEW_PHONE_IPHONE_13_14_H,
  previewDevicePresetId = PREVIEW_DEVICE_PRESET_DEFAULT_ID,
}) {
  const tr = t || {}
  const cfg = getPopupTypeConfig(state.popupType)
  const frameDims = resolvePopupPreviewDimensions(state, {
    previewScreenW,
    previewScreenH,
  })
  const isSlideModalAutoSquare = isSlideModalAutoSquareType(state.popupType)
  const isSmvCarousel = isCarouselThumbPopupType(state.popupType)
  const isSimpleIconModal = isSimpleIconModalPopupType(state.popupType)
  const isChoiceButtonModal = isChoiceButtonModalType(state.popupType)
  /** IAM Studio式: 스테이지 `px 10%` + 컬럼 `100%`·`max(310)` — 캐러셀·Simple Icon (참고 HTML `.center { width: 310px }` / export `data-iam-col`과 동일) */
  const useSmvStudioMargins = isSmvCarousel || isSimpleIconModal
  const useStudioShellMargins = useSmvStudioMargins
  const studioShellColumnMaxW = SMV_MODAL_W
  const isBottomSlideUp = isBottomSlideUpType(state.popupType)
  const smvSlideH = getSmvCarouselSlideHeight(state.popupType)
  const smvScrollRef = useRef(null)
  const suppressSmvScrollSyncRef = useRef(false)
  const smvFirstLayoutRef = useRef(true)
  /** 패널 prev/next 순환 시 스크롤 방향(복제 슬라이드 경유) */
  const smvPrevLogicalIdxRef = useRef(state.slideVerticalPreviewIndex ?? 0)
  const smvScrollSettleTimer = useRef(null)
  const smvDotRafRef = useRef(null)
  /** 스크롤 중 인디케이터: 복제 슬라이드 위에서도 실제 논리 인덱스 표시(null이면 smvIdx 사용) */
  const [smvScrollDotLogical, setSmvScrollDotLogical] = useState(null)
  const slideModalScrollRef = useRef(null)
  const suppressSlideModalScrollSyncRef = useRef(false)
  const slideModalDragRef = useRef(null)
  const slideModalFirstLayoutRef = useRef(true)
  const slideModalPrevLogicalIdxRef = useRef(state.slidePreviewIndex ?? 0)
  const slideModalScrollSettleTimer = useRef(null)
  const slideModalDotRafRef = useRef(null)
  const [slideModalDragging, setSlideModalDragging] = useState(false)
  const [slideModalScrollDotLogical, setSlideModalScrollDotLogical] = useState(null)
  const slideImages = useMemo(
    () =>
      isSlideModalAutoSquare
        ? normalizeSlideModal11Images(state.slideImages)
        : state.slideImages || [],
    [isSlideModalAutoSquare, state.slideImages]
  )
  const slideIdx = Math.min(
    Math.max(0, state.slidePreviewIndex ?? 0),
    Math.max(0, slideImages.length - 1)
  )
  const slideSrc = slideImages.length ? slideImages[slideIdx] : null
  const slideModalTrackSlides = useMemo(() => {
    if (!isSlideModalAutoSquare || slideImages.length === 0) return []
    const keys = slideImages.map((_, i) => state.slideImagesSlotKeys?.[i] ?? `slide-preview-${i}`)
    if (slideImages.length === 1) {
      return [{ key: keys[0], src: slideImages[0], logicalIndex: 0 }]
    }
    const lastIdx = slideImages.length - 1
    return [
      { key: `dup-last-${keys[lastIdx]}`, src: slideImages[lastIdx], logicalIndex: lastIdx },
      ...slideImages.map((src, i) => ({ key: keys[i], src, logicalIndex: i })),
      { key: `dup-first-${keys[0]}`, src: slideImages[0], logicalIndex: 0 },
    ]
  }, [isSlideModalAutoSquare, slideImages, state.slideImagesSlotKeys])
  const smvImages = useMemo(
    () => normalizeSlideVerticalImages(state.slideVerticalImages),
    [state.slideVerticalImages]
  )
  const smvSlotCount = smvImages.length
  const smvIdx = Math.min(
    Math.max(0, state.slideVerticalPreviewIndex ?? 0),
    Math.max(0, smvSlotCount - 1)
  )
  const hasImage =
    !isSmvCarousel &&
    !isSimpleIconModal &&
    !isBottomSlideUp &&
    (isSlideModalAutoSquare ? Boolean(slideSrc) : Boolean(state.imageSource))
  const displayImageSrc = isSlideModalAutoSquare ? slideSrc : state.imageSource
  const smvTotal = smvImages.length
  const showButtons =
    (state.buttonCount ?? 1) >= 1 && !cfg.noButtons

  const smvTitleLines = useMemo(
    () =>
      measureSmvVisualLineCount(state.slideVerticalTitle ?? '', {
        widthPx: SMV_COLUMN_W,
        lineHeightPx: 28,
        fontSizePx: 20,
        fontWeight: 700,
        fontFamily: SMV_TEXT_FONT,
        maxLines: 2,
      }),
    [state.slideVerticalTitle]
  )
  const smvDescLines = useMemo(
    () =>
      measureSmvVisualLineCount(state.slideVerticalDescription ?? '', {
        widthPx: SMV_COLUMN_W,
        lineHeightPx: 20,
        fontSizePx: 13,
        fontWeight: 400,
        fontFamily: SMV_TEXT_FONT,
        maxLines: 2,
      }),
    [state.slideVerticalDescription]
  )
  const simpleIconThumbBox = getSimpleIconThumbDimensions(state.simpleIconThumbSize ?? 'small')

  useLayoutEffect(() => {
    if (!isSmvCarousel) {
      smvFirstLayoutRef.current = true
      return
    }
    const el = smvScrollRef.current
    if (!el || suppressSmvScrollSyncRef.current) return
    const slides = el.firstElementChild?.children
    const maxIdx = Math.max(0, smvSlotCount - 1)
    const prevLogical = smvPrevLogicalIdxRef.current
    const curTrack = getSmvTrackIndexCentered(el)

    /**
     * 마지막 → 첫(패널/순환): dup-first로만 스크롤해야 함.
     * 방금 루프 점프로 이미 실제 1번(트랙 1)에 있으면 ref만 맞추고 — 여기서 dup으로 다시 밀면 한 번 더 ‘덜컥’ 함.
     */
    if (maxIdx > 0 && prevLogical === maxIdx && smvIdx === 0) {
      if (curTrack === 1) {
        smvPrevLogicalIdxRef.current = smvIdx
        return
      }
      smvFirstLayoutRef.current = false
      slides?.[smvSlotCount + 1]?.scrollIntoView({
        inline: 'center',
        block: 'nearest',
        behavior: 'smooth',
      })
      smvPrevLogicalIdxRef.current = smvIdx
      return
    }
    /**
     * 첫 → 마지막(패널/순환): dup-last로만 스크롤.
     * 루프 점프 직후 이미 실제 마지막(트랙 smvSlotCount)이면 dup으로 밀지 않음.
     */
    if (maxIdx > 0 && prevLogical === 0 && smvIdx === maxIdx) {
      if (curTrack === smvSlotCount) {
        smvPrevLogicalIdxRef.current = smvIdx
        return
      }
      smvFirstLayoutRef.current = false
      slides?.[0]?.scrollIntoView({
        inline: 'center',
        block: 'nearest',
        behavior: 'smooth',
      })
      smvPrevLogicalIdxRef.current = smvIdx
      return
    }

    const targetIdx = smvIdx + 1
    const slideEl = slides?.[targetIdx]
    if (!slideEl) return
    const cur = getSmvTrackIndexCentered(el)
    if (cur === targetIdx) {
      smvPrevLogicalIdxRef.current = smvIdx
      return
    }
    const behavior = smvFirstLayoutRef.current ? 'auto' : 'smooth'
    smvFirstLayoutRef.current = false
    if (behavior === 'auto') {
      withInstantSmvScroll(el, () => {
        slideEl.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' })
      })
    } else {
      slideEl.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    }
    smvPrevLogicalIdxRef.current = smvIdx
  }, [isSmvCarousel, smvIdx, smvImages, smvSlotCount])

  useLayoutEffect(() => {
    if (!isSlideModalAutoSquare || slideImages.length === 0) {
      slideModalFirstLayoutRef.current = true
      setSlideModalScrollDotLogical(null)
      return
    }
    setSlideModalScrollDotLogical(slideIdx)
    if (slideImages.length === 1) {
      slideModalPrevLogicalIdxRef.current = 0
      return
    }
    const el = slideModalScrollRef.current
    if (!el || suppressSlideModalScrollSyncRef.current) return
    const slides = el.firstElementChild?.children
    const prevLogical = slideModalPrevLogicalIdxRef.current
    const curTrack = getLinearTrackIndexCentered(el)
    const maxIdx = slideImages.length - 1

    if (maxIdx > 0 && prevLogical === maxIdx && slideIdx === 0) {
      if (curTrack === 1) {
        slideModalPrevLogicalIdxRef.current = slideIdx
        return
      }
      slideModalFirstLayoutRef.current = false
      slides?.[slideImages.length + 1]?.scrollIntoView({
        inline: 'center',
        block: 'nearest',
        behavior: 'smooth',
      })
      slideModalPrevLogicalIdxRef.current = slideIdx
      return
    }
    if (maxIdx > 0 && prevLogical === 0 && slideIdx === maxIdx) {
      if (curTrack === slideImages.length) {
        slideModalPrevLogicalIdxRef.current = slideIdx
        return
      }
      slideModalFirstLayoutRef.current = false
      slides?.[0]?.scrollIntoView({
        inline: 'center',
        block: 'nearest',
        behavior: 'smooth',
      })
      slideModalPrevLogicalIdxRef.current = slideIdx
      return
    }

    const targetTrackIdx = slideIdx + 1
    const slideEl = slides?.[targetTrackIdx]
    if (!slideEl) return
    if (curTrack === targetTrackIdx) {
      slideModalPrevLogicalIdxRef.current = slideIdx
      return
    }
    const behavior = slideModalFirstLayoutRef.current ? 'auto' : 'smooth'
    slideModalFirstLayoutRef.current = false
    suppressSlideModalScrollSyncRef.current = true
    if (behavior === 'auto') {
      withInstantSlideModalScroll(el, () => {
        slideEl.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' })
      })
    } else {
      slideEl.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    }
    slideModalPrevLogicalIdxRef.current = slideIdx
    requestAnimationFrame(() => {
      suppressSlideModalScrollSyncRef.current = false
    })
  }, [isSlideModalAutoSquare, slideIdx, slideImages])

  useEffect(() => {
    const el = smvScrollRef.current
    if (!el || !isSmvCarousel || !onSlideVerticalPreviewIndexChange) return

    const wrapToLogical = (logicalIdx, trackIdx) => {
      const slides = el.firstElementChild?.children
      if (!slides?.length) return
      suppressSmvScrollSyncRef.current = true
      withInstantSmvScroll(el, () => {
        slides[trackIdx]?.scrollIntoView({
          inline: 'center',
          block: 'nearest',
          behavior: 'auto',
        })
      })
      smvPrevLogicalIdxRef.current = logicalIdx
      onSlideVerticalPreviewIndexChange(logicalIdx)
      requestAnimationFrame(() => {
        suppressSmvScrollSyncRef.current = false
      })
    }

    const settle = () => {
      if (suppressSmvScrollSyncRef.current) return
      const ti = getSmvTrackIndexCentered(el)

      if (ti === 0) {
        wrapToLogical(smvSlotCount - 1, smvSlotCount)
        return
      }
      if (ti === smvSlotCount + 1) {
        wrapToLogical(0, 1)
        return
      }
      const logical = getSmvLogicalIndexFromTrackIndex(ti, smvSlotCount)
      if (logical === smvIdx) return
      onSlideVerticalPreviewIndexChange(logical)
    }

    const onScroll = () => {
      if (!smvDotRafRef.current) {
        smvDotRafRef.current = requestAnimationFrame(() => {
          smvDotRafRef.current = null
          if (suppressSmvScrollSyncRef.current) return
          const ti = getSmvTrackIndexCentered(el)
          const logical = getSmvLogicalIndexFromTrackIndex(ti, smvSlotCount)
          setSmvScrollDotLogical((p) => (p === logical ? p : logical))
        })
      }
      if (smvScrollSettleTimer.current) window.clearTimeout(smvScrollSettleTimer.current)
      smvScrollSettleTimer.current = window.setTimeout(settle, 90)
    }

    const onScrollEnd = () => {
      if (suppressSmvScrollSyncRef.current) return
      settle()
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('scrollend', onScrollEnd)

    return () => {
      if (smvScrollSettleTimer.current) window.clearTimeout(smvScrollSettleTimer.current)
      if (smvDotRafRef.current) {
        window.cancelAnimationFrame(smvDotRafRef.current)
        smvDotRafRef.current = null
      }
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('scrollend', onScrollEnd)
    }
  }, [isSmvCarousel, onSlideVerticalPreviewIndexChange, smvIdx, smvSlotCount])

  useEffect(() => {
    const el = slideModalScrollRef.current
    if (!el || !isSlideModalAutoSquare || slideImages.length === 0 || !onSlidePreviewIndexChange)
      return undefined

    const wrapToLogical = (logicalIdx, trackIdx) => {
      const slides = el.firstElementChild?.children
      if (!slides?.length) return
      suppressSlideModalScrollSyncRef.current = true
      withInstantSlideModalScroll(el, () => {
        slides[trackIdx]?.scrollIntoView({
          inline: 'center',
          block: 'nearest',
          behavior: 'auto',
        })
      })
      slideModalPrevLogicalIdxRef.current = logicalIdx
      setSlideModalScrollDotLogical(logicalIdx)
      onSlidePreviewIndexChange(logicalIdx)
      requestAnimationFrame(() => {
        suppressSlideModalScrollSyncRef.current = false
      })
    }

    const settle = () => {
      if (suppressSlideModalScrollSyncRef.current) return
      if (!onSlidePreviewIndexChange) return
      const ti = getLinearTrackIndexCentered(el)
      if (slideImages.length > 1 && ti === 0) {
        wrapToLogical(slideImages.length - 1, slideImages.length)
        return
      }
      if (slideImages.length > 1 && ti === slideImages.length + 1) {
        wrapToLogical(0, 1)
        return
      }
      const logical = getLoopLogicalIndexFromTrackIndex(ti, slideImages.length)
      setSlideModalScrollDotLogical(logical)
      if (logical !== slideIdx) onSlidePreviewIndexChange(logical)
    }

    const onScroll = () => {
      if (!slideModalDotRafRef.current) {
        slideModalDotRafRef.current = requestAnimationFrame(() => {
          slideModalDotRafRef.current = null
          if (suppressSlideModalScrollSyncRef.current) return
          const ti = getLinearTrackIndexCentered(el)
          const logical = getLoopLogicalIndexFromTrackIndex(ti, slideImages.length)
          setSlideModalScrollDotLogical((p) => (p === logical ? p : logical))
        })
      }
      if (slideModalScrollSettleTimer.current) window.clearTimeout(slideModalScrollSettleTimer.current)
      slideModalScrollSettleTimer.current = window.setTimeout(settle, 90)
    }

    const onScrollEnd = () => {
      if (suppressSlideModalScrollSyncRef.current) return
      settle()
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('scrollend', onScrollEnd)
    return () => {
      if (slideModalScrollSettleTimer.current) window.clearTimeout(slideModalScrollSettleTimer.current)
      if (slideModalDotRafRef.current) {
        window.cancelAnimationFrame(slideModalDotRafRef.current)
        slideModalDotRafRef.current = null
      }
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('scrollend', onScrollEnd)
    }
  }, [isSlideModalAutoSquare, slideImages, onSlidePreviewIndexChange, slideIdx])

  const onSlideModalPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const shell = slideModalScrollRef.current
    if (!shell) return
    slideModalDragRef.current = { startX: e.clientX, scrollLeft: shell.scrollLeft }
    setSlideModalDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onSlideModalPointerMove = (e) => {
    const d = slideModalDragRef.current
    const shell = slideModalScrollRef.current
    if (!d || !shell) return
    shell.scrollLeft = d.scrollLeft - (e.clientX - d.startX)
  }

  const onSlideModalPointerUp = (e) => {
    const shell = slideModalScrollRef.current
    slideModalDragRef.current = null
    setSlideModalDragging(false)
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
    }
    if (shell) {
      const slides = shell.firstElementChild?.children
      const ti = getLinearTrackIndexCentered(shell)
      slides?.[ti]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    }
  }

  const smvTrackSlides = getSmvCarouselTrack(smvImages)

  const overlayStyle = {
    backgroundColor: `rgba(0, 0, 0, ${state.overlayOpacity / 100})`,
  }

  const popupContainerStyle = {
    width: cfg.width,
    height: cfg.height,
    backgroundColor: 'transparent',
    borderRadius: POPUP_CONTAINER_BORDER_RADIUS,
    overflow: 'hidden',
    position: 'relative',
  }

  const smvContainerStyle = {
    width: cfg.width,
    height: 'auto',
    backgroundColor: '#ffffff',
    borderRadius: POPUP_CONTAINER_BORDER_RADIUS,
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
  }

  const gap = (state.buttonCount ?? 1) === 2 ? DUAL_BUTTON_GAP : 0
  const choicePreviewFg = isChoiceButtonModalType(state.popupType)
  const btn1PreviewFg = choicePreviewFg
    ? state.button1?.textColor ?? BUTTON_TEXT_COLOR
    : BUTTON_TEXT_COLOR
  const btn2PreviewFg = choicePreviewFg
    ? state.button2?.textColor ?? BUTTON_TEXT_COLOR
    : BUTTON_TEXT_COLOR

  const buttonRowStyle = isChoiceButtonModal
    ? cfg.buttonBottom != null
      ? {
          left: 0,
          right: 0,
          bottom: cfg.buttonBottom,
          height: BUTTON_HEIGHT,
          gap,
          paddingLeft: 20,
          paddingRight: 20,
          boxSizing: 'border-box',
          justifyContent: (state.buttonCount ?? 1) === 2 ? 'space-between' : 'center',
        }
      : {
          left: 0,
          right: 0,
          top: cfg.buttonTop,
          height: BUTTON_HEIGHT,
          gap,
          paddingLeft: 20,
          paddingRight: 20,
          boxSizing: 'border-box',
          justifyContent: (state.buttonCount ?? 1) === 2 ? 'space-between' : 'center',
        }
    : cfg.buttonBottom != null
      ? {
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: cfg.buttonBottom,
          height: BUTTON_HEIGHT,
          gap,
        }
      : {
          left: '50%',
          transform: 'translateX(-50%)',
          top: cfg.buttonTop,
          height: BUTTON_HEIGHT,
          gap,
        }

  return (
    <PreviewDeviceFrame
      presetId={previewDevicePresetId}
      screenW={previewScreenW}
      screenH={previewScreenH}
    >
      {isBottomSlideUp ? (
        <BottomSlideUpPreview state={state} tr={tr} />
      ) : (
      <>
        {/* 전체 화면 딤(오버레이 불투명도). 베이스는 흰 스크린 → 투명 PNG 대비 확인 */}
        <div
          className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] transition-colors"
          style={overlayStyle}
          aria-hidden
        />
      <div
        className={`absolute inset-0 z-10 flex min-h-0 items-center justify-center overflow-x-hidden overflow-y-auto bg-transparent ${useStudioShellMargins ? 'py-3 px-[10%]' : 'p-3'} ${isSmvCarousel ? HIDE_SCROLLBAR_CLASS : ''}`}
      >
        <div
          className="relative z-20 flex w-full max-h-full min-h-0 max-w-full flex-col items-center flex-shrink-0 self-center"
          style={
            useStudioShellMargins
              ? { marginLeft: 0, marginRight: 0 }
              : { marginLeft: POPUP_SIDE_MARGIN, marginRight: POPUP_SIDE_MARGIN }
          }
        >
          <div
            style={
              useStudioShellMargins
                ? {
                    width: '100%',
                    maxWidth: studioShellColumnMaxW,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }
                : { display: 'contents' }
            }
          >
          <div
            className="relative flex-none"
            style={
              isSmvCarousel || isSimpleIconModal
                ? {
                    ...smvContainerStyle,
                    ...(useSmvStudioMargins ? { width: '100%' } : {}),
                  }
                : {
                    ...popupContainerStyle,
                    ...(isChoiceButtonModal
                      ? {
                          width: '100%',
                          maxWidth: cfg.width,
                          height: 'auto',
                          aspectRatio: `${cfg.width} / ${cfg.height}`,
                        }
                      : {}),
                  }
            }
          >
            {isSmvCarousel || isSimpleIconModal ? (
              <div
                className="flex flex-col items-center"
                style={{
                  paddingTop: isSimpleIconModal ? SMV_SIMPLE_ICON_PAD_TOP : SMV_PAD_TOP,
                  paddingBottom: SMV_PAD_BOTTOM,
                  paddingLeft: SMV_CONTENT_PAD_X,
                  paddingRight: SMV_CONTENT_PAD_X,
                  boxSizing: 'border-box',
                }}
              >
                {isSmvCarousel ? (
                <div
                  style={{
                    width: `calc(100% + ${SMV_CONTENT_PAD_X * 2}px)`,
                    marginLeft: -SMV_CONTENT_PAD_X,
                    marginRight: -SMV_CONTENT_PAD_X,
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  <div
                    ref={smvScrollRef}
                    className={`relative flex-shrink-0 ${HIDE_SCROLLBAR_CLASS} select-none ${PREVIEW_SMV_CAROUSEL_VIEW_CLASS}`}
                    style={{
                      width: '100%',
                      height: smvSlideH,
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      scrollSnapType: 'x mandatory',
                      overscrollBehaviorX: 'contain',
                      WebkitOverflowScrolling: 'touch',
                      touchAction: 'pan-x',
                    }}
                  >
                    <div
                      className="flex flex-row h-full box-border"
                      style={{ gap: SMV_CAROUSEL_GAP, width: 'max-content' }}
                    >
                      {smvTrackSlides.map((item) => {
                        const src = item.src
                        return (
                          <div
                            key={item.key}
                            className="flex-shrink-0 overflow-hidden"
                            style={{
                              width: SMV_CAROUSEL_SLIDE_W,
                              height: smvSlideH,
                              scrollSnapAlign: 'center',
                              borderRadius: SMV_SLIDE_RADIUS,
                              backgroundColor: src ? 'transparent' : POPUP_EMPTY_BACKGROUND,
                            }}
                          >
                            {src ? (
                              <img
                                src={src}
                                alt=""
                                draggable={false}
                                className="w-full h-full pointer-events-none"
                                style={{ objectFit: 'cover', display: 'block' }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs px-2 text-center">
                                {tr.noImage || '이미지 없음'}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <SlideDotIndicators
                    count={smvTotal}
                    activeIndex={smvScrollDotLogical ?? smvIdx}
                  />
                </div>
                ) : (
                  <div
                    style={{
                      width: isSimpleIconModal
                        ? `calc(100% + ${SMV_CONTENT_PAD_X * 2}px)`
                        : SMV_MODAL_W,
                      marginLeft: -SMV_CONTENT_PAD_X,
                      marginRight: -SMV_CONTENT_PAD_X,
                      flexShrink: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: getSimpleIconMediaHeightPx(state),
                    }}
                  >
                    {state.simpleIconVariant === SIMPLE_ICON_VARIANT_ICON ? (
                      <img
                        src={getSimpleIconPresetSrc(state.simpleIconPresetId)}
                        alt=""
                        draggable={false}
                        style={{
                          width: SIMPLE_ICON_ICON_PX,
                          height: SIMPLE_ICON_ICON_PX,
                          display: 'block',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: simpleIconThumbBox.width,
                          height: simpleIconThumbBox.height,
                          overflow: 'hidden',
                          borderRadius: 0,
                          backgroundColor: state.imageSource
                            ? 'transparent'
                            : POPUP_EMPTY_BACKGROUND,
                        }}
                      >
                        {state.imageSource ? (
                          <img
                            src={state.imageSource}
                            alt=""
                            draggable={false}
                            className="pointer-events-none"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs px-2 text-center">
                            {tr.noImage || '이미지 없음'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ height: SMV_GAP_SLIDE_TEXT, flexShrink: 0 }} aria-hidden />
                <div
                  style={{
                    width: useSmvStudioMargins ? '100%' : SMV_COLUMN_W,
                    maxWidth: useSmvStudioMargins ? SMV_COLUMN_W : undefined,
                    flexShrink: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  {smvTitleLines > 0 ? (
                    <p
                      style={{
                        ...SMV_TITLE_TEXT_STYLE,
                        WebkitLineClamp: smvTitleLines,
                        maxHeight: smvTitleLines * 28,
                      }}
                    >
                      {state.slideVerticalTitle ?? ''}
                    </p>
                  ) : null}
                </div>
                <div style={{ height: SMV_TITLE_DESC_GAP, flexShrink: 0 }} aria-hidden />
                <div
                  style={{
                    width: useSmvStudioMargins ? '100%' : SMV_COLUMN_W,
                    maxWidth: useSmvStudioMargins ? SMV_COLUMN_W : undefined,
                    flexShrink: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  {smvDescLines > 0 ? (
                    <p
                      style={{
                        ...SMV_DESC_TEXT_STYLE,
                        WebkitLineClamp: smvDescLines,
                        maxHeight: smvDescLines * 20,
                      }}
                    >
                      {state.slideVerticalDescription ?? ''}
                    </p>
                  ) : null}
                </div>
                <div style={{ height: SMV_GAP_TEXT_BTN, flexShrink: 0 }} aria-hidden />
                <button
                  type="button"
                  className="flex items-center justify-center font-medium flex-shrink-0"
                  style={{
                    width: useSmvStudioMargins ? '100%' : SMV_BTN_W,
                    maxWidth: useSmvStudioMargins ? SMV_BTN_W : undefined,
                    height: SMV_BTN_H,
                    borderRadius: SMV_BTN_RADIUS,
                    backgroundColor: SMV_BTN_BG,
                    color: '#FFFFFF',
                    fontSize: BUTTON_FONT_SIZE,
                    fontWeight: 500,
                    border: 'none',
                    boxSizing: 'border-box',
                    paddingLeft: BUTTON_HORIZONTAL_PADDING,
                    paddingRight: BUTTON_HORIZONTAL_PADDING,
                  }}
                >
                  <span style={BUTTON_LINE_CLAMP_STYLE}>
                    {state.button1?.label ?? 'Read Now'}
                  </span>
                </button>
              </div>
            ) : (
              <>
                {isSlideModalAutoSquare && slideImages.length > 0 ? (
                  <>
                    <div
                      ref={slideModalScrollRef}
                      className={`absolute inset-0 z-0 ${HIDE_SCROLLBAR_CLASS} select-none`}
                      onPointerDown={onSlideModalPointerDown}
                      onPointerMove={onSlideModalPointerMove}
                      onPointerUp={onSlideModalPointerUp}
                      onPointerCancel={onSlideModalPointerUp}
                      style={{
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        scrollSnapType: 'x mandatory',
                        scrollBehavior: 'smooth',
                        overscrollBehaviorX: 'contain',
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'pan-x',
                        cursor: slideModalDragging ? 'grabbing' : 'grab',
                      }}
                    >
                      <div className="flex h-full flex-row" style={{ width: 'max-content' }}>
                        {slideModalTrackSlides.map((item, i) => (
                          <div
                            key={item.key}
                            className="flex-shrink-0 overflow-hidden"
                            style={{
                              width: cfg.width,
                              height: cfg.height,
                              scrollSnapAlign: 'center',
                              backgroundColor: item.src ? 'transparent' : POPUP_EMPTY_BACKGROUND,
                            }}
                          >
                            {item.src ? (
                              <img
                                src={item.src}
                                alt=""
                                draggable={false}
                                className="pointer-events-none h-full w-full object-cover"
                                style={{ display: 'block' }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center px-2 text-center text-sm text-zinc-500">
                                {tr.noImage || '이미지 없음'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <SlideDotIndicators
                      count={slideImages.length}
                      activeIndex={slideModalScrollDotLogical ?? slideIdx}
                    />
                  </>
                ) : (
                  <div
                    className="absolute inset-0 z-0"
                    style={{
                      backgroundColor: hasImage ? 'transparent' : POPUP_EMPTY_BACKGROUND,
                    }}
                  >
                    {hasImage ? (
                      <img
                        src={displayImageSrc}
                        alt="Popup background"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ display: 'block' }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
                        {tr.noImage || '이미지 없음'}
                      </div>
                    )}
                  </div>
                )}
                {showButtons && (
                  <div
                    className={`absolute z-10 flex items-center ${isChoiceButtonModal ? '' : 'justify-center'}`}
                    style={buttonRowStyle}
                  >
                    {(state.buttonCount ?? 1) === 2 ? (
                      <>
                        <button
                          type="button"
                          className="flex items-center justify-center font-medium shrink-0"
                          style={{
                            width: DUAL_BUTTON_WIDTH,
                            height: BUTTON_HEIGHT,
                            borderRadius: BUTTON_RADIUS,
                            backgroundColor: state.button1.bgColor,
                            color: btn1PreviewFg,
                            fontSize: BUTTON_FONT_SIZE,
                            boxSizing: 'border-box',
                            paddingLeft: BUTTON_HORIZONTAL_PADDING,
                            paddingRight: BUTTON_HORIZONTAL_PADDING,
                          }}
                        >
                          <span style={BUTTON_LINE_CLAMP_STYLE}>{state.button1.label}</span>
                        </button>
                        <button
                          type="button"
                          className="flex items-center justify-center font-medium shrink-0"
                          style={{
                            width: DUAL_BUTTON_WIDTH,
                            height: BUTTON_HEIGHT,
                            borderRadius: BUTTON_RADIUS,
                            backgroundColor: state.button2.bgColor,
                            color: btn2PreviewFg,
                            fontSize: BUTTON_FONT_SIZE,
                            boxSizing: 'border-box',
                            paddingLeft: BUTTON_HORIZONTAL_PADDING,
                            paddingRight: BUTTON_HORIZONTAL_PADDING,
                          }}
                        >
                          <span style={BUTTON_LINE_CLAMP_STYLE}>{state.button2.label}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="flex items-center justify-center font-medium shrink-0"
                        style={{
                          width: SINGLE_BUTTON_WIDTH,
                          height: BUTTON_HEIGHT,
                          borderRadius: BUTTON_RADIUS,
                          backgroundColor: state.button1.bgColor,
                          color: btn1PreviewFg,
                          fontSize: BUTTON_FONT_SIZE,
                          boxSizing: 'border-box',
                          paddingLeft: BUTTON_HORIZONTAL_PADDING,
                          paddingRight: BUTTON_HORIZONTAL_PADDING,
                        }}
                      >
                        <span style={BUTTON_LINE_CLAMP_STYLE}>{state.button1.label}</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <footer
            className="mt-2 flex w-full flex-shrink-0 items-center justify-between"
            style={{
              width: useStudioShellMargins ? '100%' : frameDims.width,
              minHeight: 20,
              boxSizing: 'border-box',
              backgroundColor: 'transparent',
            }}
          >
            <button
              type="button"
              className="cursor-pointer text-left"
              style={{
                color: FOOTER_TEXT_COLOR,
                fontSize: FOOTER_FONT_SIZE,
                background: 'transparent',
                border: 'none',
                padding: 0,
              }}
            >
              {tr.dontShowAgain || "Don't show again"}
            </button>
            <button
              type="button"
              className="cursor-pointer flex items-center justify-center"
              style={{
                color: FOOTER_TEXT_COLOR,
                fontSize: FOOTER_FONT_SIZE,
                background: 'transparent',
                border: 'none',
                padding: 0,
                gap: 4,
              }}
            >
              {tr.close || 'Close'}
              <CloseXIcon />
            </button>
          </footer>
          </div>
        </div>
      </div>
      </>
      )}
    </PreviewDeviceFrame>
  )
}
