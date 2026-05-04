/** Simple Icon Modal — Thumb (no R) vs preset Icon */

export const SIMPLE_ICON_VARIANT_THUMB = 'thumb'
export const SIMPLE_ICON_VARIANT_ICON = 'icon'

export const SIMPLE_ICON_THUMB_SMALL_W = 146
export const SIMPLE_ICON_THUMB_SMALL_H = 132
export const SIMPLE_ICON_THUMB_LARGE_W = 120
export const SIMPLE_ICON_THUMB_LARGE_H = 110
export const SIMPLE_ICON_ICON_PX = 70

/** Icon Type 선택 시 제목·설명 기본값 (미리보기 2줄 기준) */
export const SIMPLE_ICON_ICON_DEFAULT_TITLE =
  'Personalized pick for\nschool romance fans'
export const SIMPLE_ICON_ICON_DEFAULT_DESCRIPTION =
  'If you read New Series more than 3 times, you will receive 3 Coins.'

/** `public/simple-icon/*` — 배포 시 서브경로(GitHub Pages 등)에서 깨지지 않도록 BASE_URL 사용 */
function simpleIconAsset(file) {
  const base = import.meta.env.BASE_URL || '/'
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}simple-icon/${file}`
}

/**
 * 순서: 선물 → … → 타임딜 B → (Bottom Slide / Simple Icon 공용 추가) 기프트&쿠키 … 기프트카드
 */
export const SIMPLE_ICON_PRESETS = [
  { id: 'gift', src: simpleIconAsset('gift.png'), labelKey: 'simpleIconPresetGift' },
  { id: 'chart', src: simpleIconAsset('chart.png'), labelKey: 'simpleIconPresetChart' },
  { id: 'rocket', src: simpleIconAsset('rocket.png'), labelKey: 'simpleIconPresetRocket' },
  { id: 'hourglass', src: simpleIconAsset('hourglass.png'), labelKey: 'simpleIconPresetHourglass' },
  { id: 'hands', src: simpleIconAsset('hands.png'), labelKey: 'simpleIconPresetHands' },
  { id: 'coins', src: simpleIconAsset('coins.png'), labelKey: 'simpleIconPresetCoins' },
  { id: 'gift_cookie', src: simpleIconAsset('gift_cookie.png'), labelKey: 'simpleIconPresetGiftCookie' },
  { id: 'stopwatch_deal', src: simpleIconAsset('stopwatch_deal.png'), labelKey: 'simpleIconPresetStopwatchDeal' },
  { id: 'oven_cookie', src: simpleIconAsset('oven_cookie.png'), labelKey: 'simpleIconPresetOvenCookie' },
  { id: 'tv_play', src: simpleIconAsset('tv_play.png'), labelKey: 'simpleIconPresetTvPlay' },
  { id: 'book_arrow', src: simpleIconAsset('book_arrow.png'), labelKey: 'simpleIconPresetBookArrow' },
  { id: 'gift_card', src: simpleIconAsset('gift_card.png'), labelKey: 'simpleIconPresetGiftCard' },
]

export function getSimpleIconPresetSrc(presetId) {
  const id = presetId ?? SIMPLE_ICON_PRESETS[0].id
  const hit = SIMPLE_ICON_PRESETS.find((p) => p.id === id)
  return hit?.src ?? SIMPLE_ICON_PRESETS[0].src
}

export function getSimpleIconThumbDimensions(thumbSize) {
  return thumbSize === 'large'
    ? { width: SIMPLE_ICON_THUMB_LARGE_W, height: SIMPLE_ICON_THUMB_LARGE_H }
    : { width: SIMPLE_ICON_THUMB_SMALL_W, height: SIMPLE_ICON_THUMB_SMALL_H }
}

/**
 * @param {object} state
 * @returns {number}
 */
export function getSimpleIconMediaHeightPx(state) {
  const v = state.simpleIconVariant ?? SIMPLE_ICON_VARIANT_THUMB
  if (v === SIMPLE_ICON_VARIANT_ICON) return SIMPLE_ICON_ICON_PX
  const sz = state.simpleIconThumbSize ?? 'small'
  return sz === 'large' ? SIMPLE_ICON_THUMB_LARGE_H : SIMPLE_ICON_THUMB_SMALL_H
}
