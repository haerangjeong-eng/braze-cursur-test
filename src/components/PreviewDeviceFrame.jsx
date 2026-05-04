import { PREVIEW_DEVICE_PRESET_DEFAULT_ID } from '../config/previewDevicePresets'

/** 목업 본체 — 빌더 배경(zinc-950)과 아주 약간만 대비 */
const PREVIEW_FRAME_BODY_BG = '#161618'
const PREVIEW_FRAME_BODY_SHADOW =
  '0 20px 44px -16px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.035)'

/**
 * 빌더 미리보기 전용 — 기기별 베젤·스크린 안쪽(흰색).
 * HTML 내보내기에는 포함되지 않음.
 * innerRadiusPx: SE(iphone_se)는 직각 스크린(0) 권장.
 *
 * @typedef {{
 *   padX: number,
 *   padTop: number,
 *   padBottom: number,
 *   outerRadiusPx: number,
 *   innerRadiusPx: number,
 *   variant: 'iphone_notch' | 'iphone_classic' | 'ipad',
 * }} FrameMetrics
 */

/** @param {string} presetId */
function getFrameMetrics(presetId) {
  switch (presetId) {
    case 'iphone_se':
      return {
        padX: 18,
        padTop: 58,
        padBottom: 72,
        outerRadiusPx: 36,
        innerRadiusPx: 0,
        variant: 'iphone_classic',
      }
    case 'ipad_11':
      return {
        padX: 18,
        padTop: 18,
        padBottom: 18,
        outerRadiusPx: 24,
        innerRadiusPx: 14,
        variant: 'ipad',
      }
    case 'iphone_13_14':
    default:
      return {
        padX: 12,
        padTop: 13,
        padBottom: 13,
        outerRadiusPx: 52,
        innerRadiusPx: 38,
        variant: 'iphone_notch',
      }
  }
}

/**
 * @param {{
 *   presetId?: string,
 *   screenW: number,
 *   screenH: number,
 *   children: import('react').ReactNode,
 * }} props
 */
const SE_CLASSIC_EARPIECE_H = 6
const SE_CLASSIC_HOME_SIZE = 40

export default function PreviewDeviceFrame({
  presetId = PREVIEW_DEVICE_PRESET_DEFAULT_ID,
  screenW,
  screenH,
  children,
}) {
  const m = getFrameMetrics(presetId)
  const outerW = screenW + m.padX * 2
  const outerH = screenH + m.padTop + m.padBottom

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        maxWidth: outerW,
        aspectRatio: `${outerW} / ${outerH}`,
        background: PREVIEW_FRAME_BODY_BG,
        borderRadius: m.outerRadiusPx,
        boxShadow: PREVIEW_FRAME_BODY_SHADOW,
      }}
    >
      {/* iPhone 13·14 — Dynamic Island (블랙 베젤 위, 스크린 상단과 맞닿음) */}
      {m.variant === 'iphone_notch' ? (
        <div
          className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2"
          aria-hidden
          style={{
            top: Math.max(6, m.padTop * 0.35),
            width: '31%',
            minWidth: 104,
            maxWidth: 128,
            height: 29,
            borderRadius: 9999,
            background: '#0a0a0c',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        />
      ) : null}

      {/* iPhone SE — 넓은 상·하 베젤; 이어피스·홈 버튼은 스크린 밖 블랙 띠 안에만 */}
      {m.variant === 'iphone_classic' ? (
        <>
          <div
            className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2"
            aria-hidden
            style={{
              top: (m.padTop - SE_CLASSIC_EARPIECE_H) / 2,
              width: '34%',
              minWidth: 76,
              maxWidth: 102,
              height: SE_CLASSIC_EARPIECE_H,
              borderRadius: 4,
              background: '#0e0e10',
            }}
          />
          <div
            className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 rounded-full border border-zinc-600/35 bg-[#121214]"
            aria-hidden
            style={{
              bottom: (m.padBottom - SE_CLASSIC_HOME_SIZE) / 2,
              width: SE_CLASSIC_HOME_SIZE,
              height: SE_CLASSIC_HOME_SIZE,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          />
        </>
      ) : null}

      {/* iPad — 상단 중앙 펜슬·카메라 자리를 가늘게 표현 (장식) */}
      {m.variant === 'ipad' ? (
        <div
          className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#0c0c0e]"
          aria-hidden
          style={{
            top: Math.max(7, m.padTop * 0.42),
            width: 8,
            height: 8,
          }}
        />
      ) : null}

      <div
        className="absolute overflow-hidden bg-white"
        style={{
          left: m.padX,
          top: m.padTop,
          right: m.padX,
          bottom: m.padBottom,
          ...(m.innerRadiusPx > 0
            ? { borderRadius: m.innerRadiusPx }
            : { borderRadius: 0 }),
        }}
      >
        {/* inline-size: Bottom Slide Up 등이 뷰포트 대신 '스크린' 너비로 미디어 분기 (15px 가로 여백 유지) */}
        <div
          className="relative h-full min-h-0 w-full [container-type:inline-size]"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
