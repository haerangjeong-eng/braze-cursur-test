import {
  SMV_BTN_H,
  SMV_COLUMN_W,
  SMV_GAP_SLIDE_TEXT,
  SMV_GAP_TEXT_BTN,
  SMV_PAD_BOTTOM,
  SMV_PAD_TOP,
  SMV_SLIDE_H,
  SMV_TITLE_DESC_GAP,
} from '../config/popupTypes'

export const SMV_PREVIEW_FONT =
  "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif"

/**
 * 팝업 본문(270px) 기준으로 보이는 줄 수 (최대 maxLines). 공백만 있으면 0.
 */
export function measureSmvVisualLineCount(text, options) {
  const s = String(text ?? '').trim()
  if (!s) return 0
  const {
    widthPx = SMV_COLUMN_W,
    lineHeightPx,
    fontSizePx,
    fontWeight,
    fontFamily = SMV_PREVIEW_FONT,
    maxLines,
    textAlign = 'center',
  } = options

  const div = document.createElement('div')
  Object.assign(div.style, {
    position: 'absolute',
    visibility: 'hidden',
    left: '-9999px',
    top: '0',
    width: `${widthPx}px`,
    boxSizing: 'border-box',
    padding: '0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    fontSize: `${fontSizePx}px`,
    lineHeight: `${lineHeightPx}px`,
    fontWeight: String(fontWeight ?? 400),
    fontFamily,
    textAlign,
  })
  div.textContent = s
  document.body.appendChild(div)
  try {
    const lines = Math.ceil(div.scrollHeight / lineHeightPx)
    return Math.min(maxLines, Math.max(1, lines))
  } finally {
    document.body.removeChild(div)
  }
}

/** 흰색 모달 영역(슬라이드~버튼 패딩 포함) 최소 높이(px) */
export function computeSmvWhitePanelHeightPx(
  title,
  description,
  slideHeightPx = SMV_SLIDE_H,
  includeDescriptionBlock = true,
  padTopPx = SMV_PAD_TOP
) {
  const titleLines = measureSmvVisualLineCount(title, {
    widthPx: SMV_COLUMN_W,
    lineHeightPx: 28,
    fontSizePx: 20,
    fontWeight: 700,
    maxLines: 2,
  })
  const descLines = includeDescriptionBlock
    ? measureSmvVisualLineCount(description, {
        widthPx: SMV_COLUMN_W,
        lineHeightPx: 20,
        fontSizePx: 13,
        fontWeight: 400,
        maxLines: 2,
      })
    : 0
  const titlePx = titleLines * 28
  const descPx = descLines * 20
  const textStackAfterTitle =
    titlePx +
    (includeDescriptionBlock ? SMV_TITLE_DESC_GAP + descPx : 0)

  return (
    padTopPx +
    slideHeightPx +
    SMV_GAP_SLIDE_TEXT +
    textStackAfterTitle +
    SMV_GAP_TEXT_BTN +
    SMV_BTN_H +
    SMV_PAD_BOTTOM
  )
}
