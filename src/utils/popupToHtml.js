/**
 * 현재 팝업 state를 인라인 스타일 기반 HTML 문자열로 변환 (복사용)
 */
import {
  getPopupTypeConfig,
  POPUP_CONTAINER_BORDER_RADIUS,
  POPUP_EMPTY_BACKGROUND,
} from '../config/popupTypes'

const BUTTON_HEIGHT = 48
const BUTTON_RADIUS = 8
const SINGLE_BUTTON_WIDTH = 300
const DUAL_BUTTON_WIDTH = 146
const DUAL_BUTTON_GAP = 8
const FOOTER_FONT_SIZE = 15

function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const CLOSE_ICON_SVG =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>'

/**
 * @param {object} state - App state (popupType, button1, button2, …)
 * @param {object} t - translations
 * @returns {string} HTML string
 */
export function getPopupHtml(state, t = {}) {
  const cfg = getPopupTypeConfig(state.popupType)
  const overlayRgba = `rgba(0,0,0,${(state.overlayOpacity ?? 70) / 100})`
  const popupW = cfg.width
  const popupH = cfg.height
  const imgSrc = state.imageSource
  const hasImage = Boolean(imgSrc)
  const showButtons = state.buttonsVisible !== false
  const noImageText = escapeHtml(t.noImage || '배경 이미지 없음')
  const dontShowAgain = escapeHtml(t.dontShowAgain || "Don't show again")
  const closeText = escapeHtml(t.close || 'Close')
  const emptyBg = POPUP_EMPTY_BACKGROUND

  const bgContent = hasImage
    ? `<img src="${escapeHtml(imgSrc)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">`
    : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#a1a1aa;font-size:14px;background:${emptyBg};">${noImageText}</div>`

  const isTwo = state.buttonCount === 2
  const btn1Label = escapeHtml(state.button1?.label ?? '확인')
  const btn2Label = escapeHtml(state.button2?.label ?? '취소')
  const btn1Bg = state.button1?.bgColor ?? '#1d4ed8'
  const btn2Bg = state.button2?.bgColor ?? '#475569'

  const buttonsHtml = isTwo
    ? `
    <button type="button" style="width:${DUAL_BUTTON_WIDTH}px;height:${BUTTON_HEIGHT}px;border-radius:${BUTTON_RADIUS}px;background-color:${btn1Bg};color:#fff;font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${btn1Label}</button>
    <button type="button" style="width:${DUAL_BUTTON_WIDTH}px;height:${BUTTON_HEIGHT}px;border-radius:${BUTTON_RADIUS}px;background-color:${btn2Bg};color:#fff;font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${btn2Label}</button>
  `
    : `
    <button type="button" style="width:${SINGLE_BUTTON_WIDTH}px;height:${BUTTON_HEIGHT}px;border-radius:${BUTTON_RADIUS}px;background-color:${btn1Bg};color:#fff;font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${btn1Label}</button>
  `

  const gapStyle = isTwo ? `gap:${DUAL_BUTTON_GAP}px;` : ''
  const r = POPUP_CONTAINER_BORDER_RADIUS
  const btnPosStyle =
    cfg.buttonBottom != null
      ? `left:50%;transform:translateX(-50%);bottom:${cfg.buttonBottom}px;`
      : `left:50%;transform:translateX(-50%);top:${cfg.buttonTop}px;`

  const innerBgLayer = `<div style="position:absolute;inset:0;z-index:0;background:transparent;">${bgContent}</div>`

  const buttonsBlock = showButtons
    ? `<div style="position:absolute;${btnPosStyle}height:${BUTTON_HEIGHT}px;display:flex;align-items:center;justify-content:center;${gapStyle}z-index:10;">
      ${buttonsHtml.trim()}
    </div>`
    : ''

  return `<!-- Popup ${popupW}x${popupH} (${cfg.id}, builder) -->
<div style="position:relative;width:${popupW}px;margin:0 auto;box-sizing:border-box;">
  <div style="position:absolute;inset:0;background:${overlayRgba};z-index:10;pointer-events:none;"></div>
  <div style="position:relative;z-index:20;width:${popupW}px;height:${popupH}px;background:transparent;border-radius:${r}px;overflow:hidden;box-sizing:border-box;">
    ${innerBgLayer}
    ${buttonsBlock}
  </div>
  <footer style="display:flex;align-items:center;justify-content:space-between;width:${popupW}px;min-height:20px;padding:12px 10px 0 10px;box-sizing:border-box;">
    <button type="button" style="color:#fff;font-size:${FOOTER_FONT_SIZE}px;background:transparent;border:none;padding:0;cursor:pointer;">${dontShowAgain}</button>
    <button type="button" style="color:#fff;font-size:${FOOTER_FONT_SIZE}px;background:transparent;border:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:4px;">${closeText} ${CLOSE_ICON_SVG}</button>
  </footer>
</div>`
}
