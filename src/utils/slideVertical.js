import {
  SLIDE_MODAL_VERTICAL_MAX_IMAGES,
  SLIDE_MODAL_VERTICAL_MIN_IMAGES,
} from '../config/popupTypes'

/**
 * 순환 피크용 트랙: [마지막 dup, 0 … n−1, 첫 dup]  (실슬 n ≥ 3)
 */
export function getSmvCarouselTrack(arr) {
  const imgs = normalizeSlideVerticalImages(arr)
  const n = imgs.length
  if (n < SLIDE_MODAL_VERTICAL_MIN_IMAGES) {
    const pad = []
    while (pad.length < SLIDE_MODAL_VERTICAL_MIN_IMAGES) pad.push(null)
    return getSmvCarouselTrack(pad)
  }
  const last = imgs[n - 1]
  const first = imgs[0]
  return [
    { key: 'dup-last', src: last },
    ...imgs.map((src, i) => ({ key: `s${i}`, src })),
    { key: 'dup-first', src: first },
  ]
}

/**
 * 길이 3~6 유지 (빈 값은 null). 빈 배열이면 최소 3칸 null.
 */
export function normalizeSlideVerticalImages(arr) {
  const raw = [...(arr || [])].slice(0, SLIDE_MODAL_VERTICAL_MAX_IMAGES)
  let targetLen = raw.length
  if (targetLen < SLIDE_MODAL_VERTICAL_MIN_IMAGES) {
    targetLen = SLIDE_MODAL_VERTICAL_MIN_IMAGES
  }
  const a = raw.slice()
  while (a.length < targetLen) a.push(null)
  return a
}

/** HTML 복사 가능: 최소 3장이고, 열린 슬롯은 모두 이미지가 있어야 함 */
export function slideVerticalHasAllImages(arr) {
  const im = normalizeSlideVerticalImages(arr)
  if (im.length < SLIDE_MODAL_VERTICAL_MIN_IMAGES) return false
  return im.every((src) => Boolean(src))
}

/**
 * Carousel SMV·Simple Icon 등: 제목 필수 (설명은 비어 있어도 됨).
 */
export function slideVerticalHasRequiredText(title, _description, _popupType) {
  return String(title ?? '').trim().length > 0
}

/**
 * 슬롯 `from` → `to`로 아이템을 옮긴 뒤, 직전 `slideVerticalPreviewIndex`를
 * 동일한 “이미지”를 가리키도록 보정한다.
 */
export function remapSlideVerticalPreviewIndex(preview, from, to, slotCount) {
  const maxIdx = Math.max(0, slotCount - 1)
  let p0 = Math.max(0, Math.min(maxIdx, preview | 0))
  if (p0 === from) return to
  if (from < to) {
    if (p0 > from && p0 <= to) return p0 - 1
  } else if (from > to) {
    if (p0 >= to && p0 < from) return p0 + 1
  }
  return p0
}

/** 미리보기 카드 순서 재배치(layout)용 안정적인 React key */
export function newSmvSlotKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `smv-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/** `slideVerticalImages` 길이에 맞춰 슬롯 키 배열을 패딩·트림 */
export function normalizeSlideVerticalSlotKeys(imageArray, keys) {
  const imgs = normalizeSlideVerticalImages(imageArray)
  const next = [...(keys || [])]
  while (next.length < imgs.length) next.push(newSmvSlotKey())
  return next.slice(0, imgs.length)
}
