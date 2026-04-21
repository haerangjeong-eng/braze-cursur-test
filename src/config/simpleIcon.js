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

const BASE = '/simple-icon'

/** 순서: 선물 → 그래프 → 우상향 → 타임딜 A → 축하 → 타임딜 B */
export const SIMPLE_ICON_PRESETS = [
  { id: 'gift', src: `${BASE}/gift.png`, labelKey: 'simpleIconPresetGift' },
  { id: 'chart', src: `${BASE}/chart.png`, labelKey: 'simpleIconPresetChart' },
  { id: 'rocket', src: `${BASE}/rocket.png`, labelKey: 'simpleIconPresetRocket' },
  { id: 'hourglass', src: `${BASE}/hourglass.png`, labelKey: 'simpleIconPresetHourglass' },
  { id: 'hands', src: `${BASE}/hands.png`, labelKey: 'simpleIconPresetHands' },
  { id: 'coins', src: `${BASE}/coins.png`, labelKey: 'simpleIconPresetCoins' },
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
