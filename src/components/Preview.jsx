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
  isCarouselThumbPopupType,
  isSimpleIconModalPopupType,
  POPUP_CONTAINER_BORDER_RADIUS,
  POPUP_EMPTY_BACKGROUND,
  POPUP_TYPE_IDS,
  SMV_BTN_BG,
  SMV_BTN_H,
  SMV_BTN_RADIUS,
  SMV_BTN_W,
  SMV_COLUMN_W,
  SMV_CAROUSEL_GAP,
  SMV_CAROUSEL_CENTER_SLOT_LEFT,
  SMV_CAROUSEL_PAGINATION_INSET,
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
import { resolvePopupPreviewDimensions } from '../utils/popupLayout'
import { normalizeSlideModal11Images } from '../utils/slideModal11'
import { measureSmvVisualLineCount } from '../utils/smvTextMeasure'
import { getSmvCarouselTrack, normalizeSlideVerticalImages } from '../utils/slideVertical'

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

const POPUP_SIDE_MARGIN = 14
const FOOTER_PADDING_LEFT = 4
const FOOTER_PADDING_RIGHT = 0
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
const SLIDE_PAGINATION_W = 38
const SLIDE_PAGINATION_H = 20
const SLIDE_PAGINATION_GAP = 2
const SLIDE_PAGINATION_INSET = 6
const SLIDE_PAGINATION_BG = 'rgba(0, 0, 0, 0.8)'
const SLIDE_PAGINATION_TOTAL_COLOR = '#828282'
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

export default function Preview({ state, t, onSlideVerticalPreviewIndexChange }) {
  const tr = t || {}
  const cfg = getPopupTypeConfig(state.popupType)
  const frameDims = resolvePopupPreviewDimensions(state)
  const isSlideModal11 = cfg.id === POPUP_TYPE_IDS.SLIDE_MODAL_1_1
  const isSmvCarousel = isCarouselThumbPopupType(state.popupType)
  const isSimpleIconModal = isSimpleIconModalPopupType(state.popupType)
  const isBottomSlideUp = state.popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP
  const smvSlideH = getSmvCarouselSlideHeight(state.popupType)
  const smvScrollRef = useRef(null)
  const suppressSmvScrollSyncRef = useRef(false)
  const smvDragRef = useRef(null)
  const smvFirstLayoutRef = useRef(true)
  const smvScrollSettleTimer = useRef(null)
  const [smvCarouselDragging, setSmvCarouselDragging] = useState(false)
  const slideImages = isSlideModal11
    ? normalizeSlideModal11Images(state.slideImages)
    : state.slideImages || []
  const slideIdx = Math.min(
    Math.max(0, state.slidePreviewIndex ?? 0),
    Math.max(0, slideImages.length - 1)
  )
  const slideSrc = slideImages.length ? slideImages[slideIdx] : null
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
    (isSlideModal11 ? Boolean(slideSrc) : Boolean(state.imageSource))
  const displayImageSrc = isSlideModal11 ? slideSrc : state.imageSource
  const slideTotal = slideImages.length > 0 ? slideImages.length : 1
  const slideCurrent = slideImages.length > 0 ? slideIdx + 1 : 1
  const smvTotal = smvImages.length
  const smvCurrent = smvIdx + 1
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
    const targetIdx = smvIdx + 1
    const slideEl = slides?.[targetIdx]
    if (!slideEl) return
    const cur = getSmvTrackIndexCentered(el)
    if (cur === targetIdx) return
    const behavior = smvFirstLayoutRef.current ? 'auto' : 'smooth'
    smvFirstLayoutRef.current = false
    slideEl.scrollIntoView({ inline: 'center', block: 'nearest', behavior })
  }, [isSmvCarousel, smvIdx, smvImages, smvSlotCount])

  useEffect(() => {
    const el = smvScrollRef.current
    if (!el || !isSmvCarousel || !onSlideVerticalPreviewIndexChange) return

    const settle = () => {
      if (suppressSmvScrollSyncRef.current) return
      const slides = el.firstElementChild?.children
      if (!slides?.length) return
      const ti = getSmvTrackIndexCentered(el)

      if (ti === 0) {
        suppressSmvScrollSyncRef.current = true
        slides[smvSlotCount]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' })
        onSlideVerticalPreviewIndexChange(smvSlotCount - 1)
        requestAnimationFrame(() => {
          suppressSmvScrollSyncRef.current = false
        })
        return
      }
      if (ti === smvSlotCount + 1) {
        suppressSmvScrollSyncRef.current = true
        slides[1]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' })
        onSlideVerticalPreviewIndexChange(0)
        requestAnimationFrame(() => {
          suppressSmvScrollSyncRef.current = false
        })
        return
      }
      const logical = ti - 1
      if (logical === smvIdx) return
      onSlideVerticalPreviewIndexChange(logical)
    }

    const onScroll = () => {
      if (smvScrollSettleTimer.current) window.clearTimeout(smvScrollSettleTimer.current)
      smvScrollSettleTimer.current = window.setTimeout(settle, 100)
    }

    el.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      if (smvScrollSettleTimer.current) window.clearTimeout(smvScrollSettleTimer.current)
      el.removeEventListener('scroll', onScroll)
    }
  }, [isSmvCarousel, onSlideVerticalPreviewIndexChange, smvIdx, smvSlotCount])

  const onSmvCarouselPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return
    if (e.button !== 0) return
    const shell = smvScrollRef.current
    if (!shell) return
    smvDragRef.current = { startX: e.clientX, scrollLeft: shell.scrollLeft }
    setSmvCarouselDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onSmvCarouselPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const d = smvDragRef.current
    const shell = smvScrollRef.current
    if (!d || !shell) return
    shell.scrollLeft = d.scrollLeft - (e.clientX - d.startX)
  }

  const onSmvCarouselPointerUp = (e) => {
    if (e.pointerType !== 'mouse') return
    smvDragRef.current = null
    setSmvCarouselDragging(false)
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
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
  const buttonRowStyle =
    cfg.buttonBottom != null
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
    <div className="relative w-full max-w-[390px] aspect-[390/844] rounded-[2.5rem] border-0 bg-zinc-900 shadow-2xl overflow-hidden">
      {isBottomSlideUp ? (
        <BottomSlideUpPreview state={state} tr={tr} />
      ) : (
      <div
        className={`absolute inset-0 flex items-center justify-center p-3 bg-white overflow-x-hidden overflow-y-auto ${isSmvCarousel ? HIDE_SCROLLBAR_CLASS : ''}`}
      >
        <div
          className="absolute inset-0 z-10 transition-colors pointer-events-none"
          style={overlayStyle}
        />
        <div
          className="relative z-20 flex flex-col items-center flex-shrink-0 my-auto"
          style={{ marginLeft: POPUP_SIDE_MARGIN, marginRight: POPUP_SIDE_MARGIN }}
        >
          <div
            className="relative flex-none"
            style={
              isSmvCarousel || isSimpleIconModal ? smvContainerStyle : popupContainerStyle
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
                    width: SMV_MODAL_W,
                    marginLeft: -SMV_CONTENT_PAD_X,
                    marginRight: -SMV_CONTENT_PAD_X,
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  <div
                    ref={smvScrollRef}
                    className={`relative flex-shrink-0 ${HIDE_SCROLLBAR_CLASS} select-none`}
                    onPointerDown={onSmvCarouselPointerDown}
                    onPointerMove={onSmvCarouselPointerMove}
                    onPointerUp={onSmvCarouselPointerUp}
                    onPointerCancel={onSmvCarouselPointerUp}
                    style={{
                      width: SMV_MODAL_W,
                      height: smvSlideH,
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      scrollSnapType: 'x mandatory',
                      overscrollBehaviorX: 'contain',
                      WebkitOverflowScrolling: 'touch',
                      touchAction: 'pan-x',
                      cursor: smvCarouselDragging ? 'grabbing' : 'grab',
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
                                {tr.noImage || '배경 이미지 없음'}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div
                    className="pointer-events-none absolute z-10"
                    style={{
                      left: SMV_CAROUSEL_CENTER_SLOT_LEFT,
                      top: 0,
                      width: SMV_CAROUSEL_SLIDE_W,
                      height: smvSlideH,
                    }}
                  >
                    <div
                      className="pointer-events-none absolute flex items-center justify-center"
                      style={{
                        right: SMV_CAROUSEL_PAGINATION_INSET,
                        bottom: SMV_CAROUSEL_PAGINATION_INSET,
                        width: SLIDE_PAGINATION_W,
                        height: SLIDE_PAGINATION_H,
                        gap: SLIDE_PAGINATION_GAP,
                        borderRadius: SLIDE_PAGINATION_H / 2,
                        backgroundColor: SLIDE_PAGINATION_BG,
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: '-0.02em',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
                      }}
                    >
                      <span style={{ color: '#ffffff' }}>{smvCurrent}</span>
                      <span style={{ color: SLIDE_PAGINATION_TOTAL_COLOR }}>/</span>
                      <span style={{ color: SLIDE_PAGINATION_TOTAL_COLOR }}>{smvTotal}</span>
                    </div>
                  </div>
                </div>
                ) : (
                  <div
                    style={{
                      width: SMV_MODAL_W,
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
                            {tr.noImage || '배경 이미지 없음'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ height: SMV_GAP_SLIDE_TEXT, flexShrink: 0 }} aria-hidden />
                <div
                  style={{
                    width: SMV_COLUMN_W,
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
                    width: SMV_COLUMN_W,
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
                  className="flex items-center justify-center font-medium flex-shrink-0 transition-opacity hover:opacity-90"
                  style={{
                    width: SMV_BTN_W,
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
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ display: 'block' }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
                      {tr.noImage || '배경 이미지 없음'}
                    </div>
                  )}
                </div>
                {showButtons && (
                  <div
                    className="absolute flex items-center justify-center z-10"
                    style={buttonRowStyle}
                  >
                    {(state.buttonCount ?? 1) === 2 ? (
                      <>
                        <button
                          type="button"
                          className="flex items-center justify-center font-medium shrink-0 transition-opacity hover:opacity-90"
                          style={{
                            width: DUAL_BUTTON_WIDTH,
                            height: BUTTON_HEIGHT,
                            borderRadius: BUTTON_RADIUS,
                            backgroundColor: state.button1.bgColor,
                            color: BUTTON_TEXT_COLOR,
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
                          className="flex items-center justify-center font-medium shrink-0 transition-opacity hover:opacity-90"
                          style={{
                            width: DUAL_BUTTON_WIDTH,
                            height: BUTTON_HEIGHT,
                            borderRadius: BUTTON_RADIUS,
                            backgroundColor: state.button2.bgColor,
                            color: BUTTON_TEXT_COLOR,
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
                        className="flex items-center justify-center font-medium shrink-0 transition-opacity hover:opacity-90"
                        style={{
                          width: SINGLE_BUTTON_WIDTH,
                          height: BUTTON_HEIGHT,
                          borderRadius: BUTTON_RADIUS,
                          backgroundColor: state.button1.bgColor,
                          color: BUTTON_TEXT_COLOR,
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
                {isSlideModal11 && (
                  <div
                    className="absolute z-10 flex items-center justify-center pointer-events-none"
                    style={{
                      right: SLIDE_PAGINATION_INSET,
                      bottom: SLIDE_PAGINATION_INSET,
                      width: SLIDE_PAGINATION_W,
                      height: SLIDE_PAGINATION_H,
                      gap: SLIDE_PAGINATION_GAP,
                      borderRadius: SLIDE_PAGINATION_H / 2,
                      backgroundColor: SLIDE_PAGINATION_BG,
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    <span style={{ color: '#ffffff' }}>{slideCurrent}</span>
                    <span style={{ color: SLIDE_PAGINATION_TOTAL_COLOR }}>/</span>
                    <span style={{ color: SLIDE_PAGINATION_TOTAL_COLOR }}>{slideTotal}</span>
                  </div>
                )}
              </>
            )}
          </div>
          <footer
            className="flex items-center justify-between w-full flex-shrink-0"
            style={{
              width: frameDims.width,
              minHeight: 20,
              paddingLeft: FOOTER_PADDING_LEFT,
              paddingRight: FOOTER_PADDING_RIGHT,
              paddingTop: 12,
              paddingBottom: 0,
            }}
          >
            <button
              type="button"
              className="cursor-pointer transition-opacity hover:opacity-80 text-left"
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
              className="cursor-pointer flex items-center justify-center transition-opacity hover:opacity-80"
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
      )}
    </div>
  )
}
