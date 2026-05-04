import {
  PREVIEW_PHONE_IPHONE_13_14_H,
  PREVIEW_PHONE_IPHONE_13_14_W,
} from './popupTypes'

/** 미리보기 폰·태블릿 프레임 — HTML 내보내기와 무관 (빌더 전용) */
export const PREVIEW_DEVICE_PRESET_DEFAULT_ID = 'iphone_13_14'

/**
 * @typedef {{ id: string, width: number, height: number, labelKey: string }} PreviewDevicePreset
 */

/** @type {readonly PreviewDevicePreset[]} */
export const PREVIEW_DEVICE_PRESETS = [
  {
    id: 'iphone_13_14',
    width: PREVIEW_PHONE_IPHONE_13_14_W,
    height: PREVIEW_PHONE_IPHONE_13_14_H,
    labelKey: 'previewDeviceIphone1314',
  },
  /** iPhone SE (3세대) 논리 크기(pt) */
  {
    id: 'iphone_se',
    width: 375,
    height: 667,
    labelKey: 'previewDeviceIphoneSE',
  },
  /** iPad Pro 11″ 클래스 세로(pt) */
  {
    id: 'ipad_11',
    width: 834,
    height: 1194,
    labelKey: 'previewDeviceIpad11',
  },
]

/**
 * @param {string} [id]
 * @returns {PreviewDevicePreset}
 */
export function getPreviewDevicePreset(id) {
  return (
    PREVIEW_DEVICE_PRESETS.find((p) => p.id === id) ?? PREVIEW_DEVICE_PRESETS[0]
  )
}
