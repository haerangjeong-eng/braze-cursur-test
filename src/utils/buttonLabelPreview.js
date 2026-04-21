import {
  SMV_BTN_W,
  isCarouselThumbPopupType,
  isSimpleIconModalPopupType,
} from '../config/popupTypes'

/** 미리보기 버튼 좌우 안쪽 여백(px) — Preview.jsx 버튼 텍스트 영역과 동일 */
export const BUTTON_LABEL_HORIZONTAL_PAD_PX = 16

/** Preview.jsx choice 버튼 외형 너비와 동일 */
export const CHOICE_SINGLE_BUTTON_OUTER_W_PX = 300
export const CHOICE_DUAL_BUTTON_OUTER_W_PX = 146

export const BUTTON_LABEL_FONT_SIZE_PX = 15
export const BUTTON_LABEL_FONT_WEIGHT = 500
/** fontSize 15 × line-height 1.2 */
export const BUTTON_LABEL_LINE_HEIGHT_PX = 18
export const BUTTON_LABEL_FONT_FAMILY =
  "'DM Sans', system-ui, sans-serif"

/**
 * 미리보기에서 버튼 라벨 텍스트가 줄바꿈 없이 들어가는 최대 너비(내용 영역).
 * Carousel / Simple Icon: 270 − 32. Choice 1개: 300 − 32. Choice 2개: 각 146 − 32.
 */
export function getPreviewButtonLabelInnerWidthPx(popupType, buttonCount = 1) {
  const inset = 2 * BUTTON_LABEL_HORIZONTAL_PAD_PX

  if (
    isCarouselThumbPopupType(popupType) ||
    isSimpleIconModalPopupType(popupType)
  ) {
    return SMV_BTN_W - inset
  }

  const n = buttonCount ?? 1
  if (n >= 2) return CHOICE_DUAL_BUTTON_OUTER_W_PX - inset
  return CHOICE_SINGLE_BUTTON_OUTER_W_PX - inset
}
