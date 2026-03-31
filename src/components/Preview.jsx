/**
 * 디자인 가이드:
 * - 팝업 컨테이너: border-radius 8px, overflow:hidden, 그림자 없음
 * - 이미지 없음: 짙은 기본 배경 / 이미지 있음: 배경 투명 + 이미지
 * - 버튼: Square top 280px / Vertical bottom 26px, buttonsVisible 시만 표시
 */
import {
  getPopupTypeConfig,
  POPUP_BASE_WIDTH,
  POPUP_CONTAINER_BORDER_RADIUS,
  POPUP_EMPTY_BACKGROUND,
} from '../config/popupTypes'

const POPUP_SIDE_MARGIN = 20
const BUTTON_HEIGHT = 48
const BUTTON_RADIUS = 8
const SINGLE_BUTTON_WIDTH = 300
const DUAL_BUTTON_WIDTH = 146
const DUAL_BUTTON_GAP = 8
const BUTTON_TEXT_COLOR = '#FFFFFF'
const BUTTON_FONT_SIZE = 15
const FOOTER_TEXT_COLOR = '#FFFFFF'
const FOOTER_FONT_SIZE = 15

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

export default function Preview({ state, t }) {
  const tr = t || {}
  const cfg = getPopupTypeConfig(state.popupType)
  const hasImage = Boolean(state.imageSource)
  const showButtons = state.buttonsVisible !== false

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

  const gap = state.buttonCount === 2 ? DUAL_BUTTON_GAP : 0
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
      <div className="absolute inset-0 flex items-center justify-center p-3 bg-white overflow-y-auto">
        <div
          className="absolute inset-0 z-10 transition-colors pointer-events-none"
          style={overlayStyle}
        />
        <div
          className="relative z-20 flex flex-col items-center flex-shrink-0 my-auto"
          style={{ marginLeft: POPUP_SIDE_MARGIN, marginRight: POPUP_SIDE_MARGIN }}
        >
          <div className="relative flex-none" style={popupContainerStyle}>
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundColor: hasImage ? 'transparent' : POPUP_EMPTY_BACKGROUND,
              }}
            >
              {hasImage ? (
                <img
                  src={state.imageSource}
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
                {state.buttonCount === 1 ? (
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
                    }}
                  >
                    {state.button1.label}
                  </button>
                ) : (
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
                      }}
                    >
                      {state.button1.label}
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
                      }}
                    >
                      {state.button2.label}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <footer
            className="flex items-center justify-between w-full flex-shrink-0"
            style={{
              width: POPUP_BASE_WIDTH,
              minHeight: 20,
              paddingLeft: 10,
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
    </div>
  )
}
