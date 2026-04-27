/**
 * WCAG 2.1 상대 휘도(Relative Luminance) 및 명도 대비(Contrast Ratio)
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
const WHITE_LUMINANCE = 1

/** sRGB (0–1) -> 선형 값. WCAG 2.1 */
function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/**
 * Hex -> 상대 휘도 (0–1). WCAG 2.1 Relative Luminance.
 */
export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb01(hex)
  const R = srgbToLinear(r)
  const G = srgbToLinear(g)
  const B = srgbToLinear(b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

/**
 * 명도 대비 (1–21). (L_light + 0.05) / (L_dark + 0.05)
 */
export function contrastRatio(luminanceA, luminanceB) {
  const [light, dark] = luminanceA >= luminanceB ? [luminanceA, luminanceB] : [luminanceB, luminanceA]
  return (light + 0.05) / (dark + 0.05)
}

/** 흰색(#FFFFFF)과 배경 hex 사이 대비. 소수점 1자리. */
export function contrastWithWhite(hex) {
  const L = relativeLuminance(hex)
  return Math.round(contrastRatio(WHITE_LUMINANCE, L) * 10) / 10
}

export function meetsContrastWithWhite(hex, minRatio = 3.1) {
  return contrastWithWhite(hex) >= minRatio
}

/**
 * 대비가 minRatio 미만이면 어둡게 조정해 최소 minRatio가 되도록 한 hex 반환.
 */
export function ensureContrastWithWhite(hex, minRatio = 3.1) {
  const ratio = contrastWithWhite(hex)
  if (ratio >= minRatio) return hex
  const targetL = (1.05 / minRatio) - 0.05
  const [r, g, b] = hexToRgb01(hex)
  const L = relativeLuminance(hex)
  if (L <= 0) return hex
  const scale = targetL / L
  const r2 = Math.min(1, r * scale)
  const g2 = Math.min(1, g * scale)
  const b2 = Math.min(1, b * scale)
  return rgb01ToHex(r2, g2, b2)
}

const BLACK_LUMINANCE = 0

/** 검정(#000000) 글자와 배경 사이 대비 (WCAG). 소수점 1자리. */
export function contrastWithBlack(hex) {
  const L = relativeLuminance(hex)
  return Math.round(contrastRatio(BLACK_LUMINANCE, L) * 10) / 10
}

export function meetsContrastWithBlack(hex, minRatio = 3) {
  return contrastWithBlack(hex) >= minRatio
}

/**
 * 글자색·배경색 WCAG 대비 (배경 vs 텍스트 휘도).
 */
export function contrastBetween(bgHex, fgHex) {
  const Lbg = relativeLuminance(bgHex)
  const Lfg = relativeLuminance(fgHex)
  return Math.round(contrastRatio(Lbg, Lfg) * 10) / 10
}

export function meetsContrastBetween(bgHex, fgHex, minRatio = 3) {
  return contrastBetween(bgHex, fgHex) >= minRatio - 1e-9
}

/**
 * 검정 글자 대비 부족 시 배경을 밝혀 minRatio 이상 맞춤.
 */
export function ensureContrastWithBlack(hex, minRatio = 3) {
  if (contrastWithBlack(hex) >= minRatio) return hex
  let cur = hex
  for (let i = 0; i < 120; i++) {
    const [r, g, b] = hexToRgb01(cur)
    const r2 = Math.min(1, r + (1 - r) * 0.06)
    const g2 = Math.min(1, g + (1 - g) * 0.06)
    const b2 = Math.min(1, b + (1 - b) * 0.06)
    cur = rgb01ToHex(r2, g2, b2)
    if (contrastWithBlack(cur) >= minRatio) return cur
  }
  return '#ffffff'
}

function hexToRgb01(hex) {
  const n = (hex || '#000000').replace(/^#/, '')
  const v = parseInt(n.length === 3 ? n.replace(/(.)/g, '$1$1') : n, 16)
  const r = ((v >> 16) & 0xff) / 255
  const g = ((v >> 8) & 0xff) / 255
  const b = (v & 0xff) / 255
  return [r, g, b]
}

function rgb01ToHex(r, g, b) {
  const R = Math.round(Math.max(0, Math.min(1, r)) * 255)
  const G = Math.round(Math.max(0, Math.min(1, g)) * 255)
  const B = Math.round(Math.max(0, Math.min(1, b)) * 255)
  return `#${[R, G, B].map((x) => x.toString(16).padStart(2, '0')).join('')}`
}
