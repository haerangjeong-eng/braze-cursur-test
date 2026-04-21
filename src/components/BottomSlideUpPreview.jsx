import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BOTTOM_SLIDE_UP_BAR_HEIGHT,
  BOTTOM_SLIDE_UP_BOTTOM,
  BOTTOM_SLIDE_UP_CLOSE_PX,
  BOTTOM_SLIDE_UP_GAP,
  BOTTOM_SLIDE_UP_MARGIN_H,
  BOTTOM_SLIDE_UP_PAD_X,
  BOTTOM_SLIDE_UP_RADIUS,
  BOTTOM_SLIDE_UP_THUMB_PX,
  BOTTOM_SLIDE_UP_THUMB_RADIUS,
  POPUP_EMPTY_BACKGROUND,
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

  useEffect(() => {
    setVisible(true)
  }, [
    mode,
    state.overlayOpacity,
    state.imageSource,
    state.bottomSlideUpText,
    state.popupType,
  ])

  const imgOk = Boolean(state.imageSource)

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[inherit] bg-white"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-colors"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayAlpha})` }}
      />
      {visible ? (
        <motion.div
          key={`${mode}-${state.imageSource ?? ''}-${(state.bottomSlideUpText ?? '').slice(0, 20)}`}
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-10 flex flex-row items-center box-border"
          style={{
            left: BOTTOM_SLIDE_UP_MARGIN_H,
            right: BOTTOM_SLIDE_UP_MARGIN_H,
            bottom: BOTTOM_SLIDE_UP_BOTTOM,
            width: `calc(100% - ${BOTTOM_SLIDE_UP_MARGIN_H * 2}px)`,
            height: BOTTOM_SLIDE_UP_BAR_HEIGHT,
            paddingLeft: BOTTOM_SLIDE_UP_PAD_X,
            paddingRight: BOTTOM_SLIDE_UP_PAD_X,
            borderRadius: BOTTOM_SLIDE_UP_RADIUS,
            backgroundColor: barBg,
            gap: BOTTOM_SLIDE_UP_GAP,
          }}
        >
          <div
            className="flex-shrink-0 overflow-hidden"
            style={{
              width: BOTTOM_SLIDE_UP_THUMB_PX,
              height: BOTTOM_SLIDE_UP_THUMB_PX,
              borderRadius: BOTTOM_SLIDE_UP_THUMB_RADIUS,
              backgroundColor: imgOk ? 'transparent' : POPUP_EMPTY_BACKGROUND,
            }}
          >
            {imgOk ? (
              <img
                src={state.imageSource}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
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
            className="flex flex-shrink-0 items-center justify-center transition-opacity hover:opacity-90"
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
            onClick={() => setVisible(false)}
          >
            <XMark color={closeIconColor} size={16} />
          </button>
        </motion.div>
      ) : null}
    </div>
  )
}
