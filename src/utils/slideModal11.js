import {
  SLIDE_MODAL_11_MAX_IMAGES,
  SLIDE_MODAL_11_MIN_IMAGES,
} from '../config/popupTypes'
import { newSmvSlotKey } from './slideVertical'

/**
 * 길이 2~6 유지 (빈 값은 null).
 */
export function normalizeSlideModal11Images(arr) {
  const raw = [...(arr || [])].slice(0, SLIDE_MODAL_11_MAX_IMAGES)
  let targetLen = raw.length
  if (targetLen < SLIDE_MODAL_11_MIN_IMAGES) {
    targetLen = SLIDE_MODAL_11_MIN_IMAGES
  }
  const a = raw.slice()
  while (a.length < targetLen) a.push(null)
  return a
}

/** HTML 복사 가능: 열린 슬롯마다 이미지가 있어야 함 */
export function slideModal11HasAllImages(arr) {
  const im = normalizeSlideModal11Images(arr)
  return im.every((src) => Boolean(src))
}

export function normalizeSlideModal11SlotKeys(imageArray, keys) {
  const imgs = normalizeSlideModal11Images(imageArray)
  const next = [...(keys || [])]
  while (next.length < imgs.length) next.push(newSmvSlotKey())
  return next.slice(0, imgs.length)
}
