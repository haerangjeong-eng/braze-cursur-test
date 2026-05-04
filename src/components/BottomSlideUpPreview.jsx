import { useCallback, useEffect, useRef, useState } from 'react'
import { resolvePublicAssetUrl } from '../utils/assetUrl'
import {
  BOTTOM_SLIDE_UP_BAR_HEIGHT,
  BOTTOM_SLIDE_UP_BOTTOM,
  BOTTOM_SLIDE_UP_CLOSE_PX,
  BOTTOM_SLIDE_UP_CONTENT_MAX_W,
  BOTTOM_SLIDE_UP_GAP,
  BOTTOM_SLIDE_UP_ICON_THUMB_PX,
  BOTTOM_SLIDE_UP_OUTER_PAD_H,
  BOTTOM_SLIDE_UP_PAD_X,
  BOTTOM_SLIDE_UP_RADIUS,
  BOTTOM_SLIDE_UP_THUMB_PX,
  BOTTOM_SLIDE_UP_THUMB_RADIUS,
  BOTTOM_SLIDE_UP_WIDE_MIN_W,
  BOTTOM_SLIDE_UP_ANIM_DURATION_S,
  BOTTOM_SLIDE_UP_ANIM_EASING,
  BOTTOM_SLIDE_UP_ANIM_FROM_BOTTOM_PX,
  getBottomSlideUpThumbSrc,
  POPUP_EMPTY_BACKGROUND,
  POPUP_TYPE_IDS,
} from '../config/popupTypes'

const SMV_TEXT_FONT = `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif`

function XMark({ color, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

export default function BottomSlideUpPreview({ state, tr }) {
  const mode = state.bottomSlideAppMode ?? 'light'
  const isLightApp = mode === 'light'

  const barBg = isLightApp ? '#000000' : '#F1F2F3'
  const textColor = isLightApp ? '#FFFFFF' : '#222222'
  const closeBtnBg = isLightApp ? '#3D3D3D' : '#E3E3E4'
  const closeIconColor = isLightApp ? '#F3F3F3' : '#222222'

  const overlayAlpha = (state.overlayOpacity ?? 70) / 100

  const [visible, setVisible] = useState(true)
  /** IAM 퇴장: slide-down 후 숨김 */
  const [exiting, setExiting] = useState(false)
  const exitDoneRef = useRef(false)

  const barSrc = resolvePublicAssetUrl(getBottomSlideUpThumbSrc(state))
  const imgOk = Boolean(barSrc)
  const isIconType = state.popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP_ICON
  const thumbPx = isIconType
    ? BOTTOM_SLIDE_UP_ICON_THUMB_PX
    : BOTTOM_SLIDE_UP_THUMB_PX
  const thumbRadius = BOTTOM_SLIDE_UP_THUMB_RADIUS

  const fromB = BOTTOM_SLIDE_UP_ANIM_FROM_BOTTOM_PX
  const iosB = BOTTOM_SLIDE_UP_BOTTOM
  const d = BOTTOM_SLIDE_UP_ANIM_DURATION_S
  const ease = BOTTOM_SLIDE_UP_ANIM_EASING

  useEffect(() => {
    setVisible(true)
    setExiting(false)
    exitDoneRef.current = false
  }, [
    mode,
    state.overlayOpacity,
    state.imageSource,
    state.bottomSlideUpText,
    state.popupType,
    state.bottomSlideUpIconPresetId,
  ])

  const showBar = visible || exiting

  const finishExit = useCallback(() => {
    if (exitDoneRef.current) return
    exitDoneRef.current = true
    setVisible(false)
    setExiting(false)
  }, [])

  useEffect(() => {
    if (!exiting) return
    const fallbackMs = Math.max(400, BOTTOM_SLIDE_UP_ANIM_DURATION_S * 1000 + 200)
    const id = window.setTimeout(finishExit, fallbackMs)
    return () => window.clearTimeout(id)
  }, [exiting, finishExit])

  function handleAnimationEnd(e) {
    if (!exiting) return
    const name = String(e.animationName || '')
    if (!name.includes('BsuIosPreviewSlideDown')) return
    finishExit()
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[inherit] bg-white"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-colors"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayAlpha})` }}
      />
      {showBar ? (
        <>
        <style>{`
          @keyframes BsuIosPreviewSlideUp {
            from { bottom: ${fromB}px; }
            to { bottom: ${iosB}px; }
          }
          @keyframes BsuIosPreviewSlideDown {
            from { bottom: ${iosB}px; }
            to { bottom: ${fromB}px; }
          }
          .bsu-preview-ios-up {
            animation: BsuIosPreviewSlideUp ${d}s ${ease} forwards;
          }
          .bsu-preview-ios-down {
            animation: BsuIosPreviewSlideDown ${d}s ${ease} forwards;
          }
          @container (min-width: ${BOTTOM_SLIDE_UP_WIDE_MIN_W}px) {
            .bsu-slide-outer { padding-left: 0 !important; padding-right: 0 !important; }
          }
        `}</style>
        <div
          className={`bsu-slide-outer absolute z-10 left-0 right-0 flex justify-center box-border ${
            exiting ? 'bsu-preview-ios-down' : 'bsu-preview-ios-up'
          }`}
          style={{
            paddingLeft: BOTTOM_SLIDE_UP_OUTER_PAD_H,
            paddingRight: BOTTOM_SLIDE_UP_OUTER_PAD_H,
            minHeight: BOTTOM_SLIDE_UP_BAR_HEIGHT,
          }}
          onAnimationEnd={handleAnimationEnd}
        >
          <div
            className="flex w-full flex-row items-center box-border"
            style={{
              maxWidth: BOTTOM_SLIDE_UP_CONTENT_MAX_W,
              height: BOTTOM_SLIDE_UP_BAR_HEIGHT,
              paddingLeft: BOTTOM_SLIDE_UP_PAD_X,
              paddingRight: BOTTOM_SLIDE_UP_PAD_X,
              borderRadius: BOTTOM_SLIDE_UP_RADIUS,
              backgroundColor: barBg,
              gap: BOTTOM_SLIDE_UP_GAP,
            }}
          >
            <div
              className={`flex-shrink-0 overflow-hidden ${isIconType ? 'flex items-center justify-center' : ''}`}
              style={{
                width: thumbPx,
                height: thumbPx,
                borderRadius: thumbRadius,
                backgroundColor: imgOk ? 'transparent' : POPUP_EMPTY_BACKGROUND,
              }}
            >
              {imgOk ? (
                <img
                  src={barSrc ?? ''}
                  alt=""
                  draggable={false}
                  className={
                    isIconType
                      ? 'max-h-full max-w-full object-contain'
                      : 'h-full w-full object-cover'
                  }
                  style={{ display: 'block' }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                  —
                </div>
              )}
            </div>

            <div className="min-h-0 min-w-0 flex-1 flex items-center">
              <p
                style={{
                  margin: 0,
                  width: '100%',
                  fontSize: 13,
                  lineHeight: '18px',
                  fontWeight: 500,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: textColor,
                  fontFamily: SMV_TEXT_FONT,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                }}
              >
                {state.bottomSlideUpText ?? ''}
              </p>
            </div>

            <button
              type="button"
              className="flex flex-shrink-0 items-center justify-center"
              style={{
                width: BOTTOM_SLIDE_UP_CLOSE_PX,
                height: BOTTOM_SLIDE_UP_CLOSE_PX,
                borderRadius: '50%',
                border: 'none',
                boxShadow: 'none',
                padding: 0,
                cursor: 'pointer',
                backgroundColor: closeBtnBg,
              }}
              aria-label={tr.close || 'Close'}
              onClick={() => setExiting(true)}
            >
              <XMark color={closeIconColor} size={16} />
            </button>
          </div>
        </div>
        </>
      ) : null}
    </div>
  )
}
