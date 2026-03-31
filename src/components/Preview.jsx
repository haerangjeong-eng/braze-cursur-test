/**
 * 디자인 가이드:
 * - 팝업 본체: 350 x 350 px 고정, 양옆 여백 20px
 * - 내부 버튼: y = 280px, 1개 300x48 / 2개 각 146x48 gap 8px, 텍스트 15px 흰색
 * - 푸터: 팝업 바로 아래, 15px 흰색, 양쪽 끝 정렬
 */
const POPUP_SIZE = 350
const POPUP_SIDE_MARGIN = 20
const BUTTON_TOP = 280
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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ width: 20, height: 20 }}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

export default function Preview({ state, t }) {
  const tr = t || {}
  const overlayStyle = {
    backgroundColor: `rgba(0, 0, 0, ${state.overlayOpacity / 100})`,
  }
  const popupStyle = {
    width: POPUP_SIZE,
    height: POPUP_SIZE,
    borderRadius: `${state.cornerRadius}px`,
  }

  return (
    <div className="relative w-full max-w-[390px] aspect-[390/844] rounded-[2.5rem] border-0 bg-zinc-900 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center p-3 bg-white overflow-y-auto">
        {/* Overlay */}
        <div
          className="absolute inset-0 z-10 transition-colors pointer-events-none"
          style={overlayStyle}
        />
        {/* 중앙 정렬: 팝업 + 12px 간격 + 푸터, 양옆 20px 여백 */}
        <div
          className="relative z-20 flex flex-col items-center flex-shrink-0 my-auto"
          style={{ marginLeft: POPUP_SIDE_MARGIN, marginRight: POPUP_SIDE_MARGIN }}
        >
          {/* 팝업 본체 350x350 고정 */}
          <div
            className="relative flex-none overflow-hidden shadow-xl"
            style={popupStyle}
          >
            <div className="absolute inset-0 z-0 bg-zinc-800">
              {state.imageSource ? (
                <img
                  src={state.imageSource}
                  alt="Popup background"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">
                  {tr.noImage || '배경 이미지 없음'}
                </div>
              )}
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 flex items-center z-10"
              style={{
                top: BUTTON_TOP,
                height: BUTTON_HEIGHT,
                gap: state.buttonCount === 2 ? DUAL_BUTTON_GAP : 0,
              }}
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
          </div>
          {/* 푸터 (15px 흰색, 양쪽 끝 정렬) */}
          <footer
            className="flex items-center justify-between w-full flex-shrink-0"
            style={{
              width: POPUP_SIZE,
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
