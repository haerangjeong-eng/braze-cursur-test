/** 줄바꿈·자동 줄바꿈 모두 포함해 maxLines “보이는 줄” 안에 들어가는 최대 접두사 */
export function clampTextToVisualLineBudget(text, opts) {
  const {
    widthPx,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    maxLines,
    lineHeightPx,
    fontSizePx,
    fontWeight,
    fontFamily,
    textAlign,
  } = opts
  const maxScroll =
    paddingTop + paddingBottom + maxLines * lineHeightPx
  const div = document.createElement('div')
  Object.assign(div.style, {
    position: 'absolute',
    visibility: 'hidden',
    left: '-9999px',
    top: '0',
    width: `${widthPx}px`,
    boxSizing: 'border-box',
    padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    fontSize: `${fontSizePx}px`,
    lineHeight: `${lineHeightPx}px`,
    fontWeight: String(fontWeight ?? 400),
    fontFamily: fontFamily ?? 'sans-serif',
    textAlign: textAlign ?? 'start',
  })
  document.body.appendChild(div)
  try {
    let lo = 0
    let hi = text.length
    let best = 0
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      div.textContent = text.slice(0, mid)
      const h = div.scrollHeight
      if (h <= maxScroll + 1) {
        best = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return text.slice(0, best)
  } finally {
    document.body.removeChild(div)
  }
}
