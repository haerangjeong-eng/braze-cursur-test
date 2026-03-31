/**
 * 팝업 타입별 크기·버튼 위치 (기준 너비 352px)
 * 컨테이너: 8px 라운딩 + overflow:hidden (그림자 없음)
 */
export const POPUP_BASE_WIDTH = 352

export const POPUP_CONTAINER_BORDER_RADIUS = 8

/** 이미지 없을 때 팝업 내부 기본 배경 (짙은 톤) */
export const POPUP_EMPTY_BACKGROUND = '#18181b'

/** Square: 버튼 행 상단 = 팝업 상단에서 280px */
export const BUTTON_TOP_SQUARE = 280

/**
 * Vertical: 버튼 행 하단 = 팝업 컨테이너 하단 테두리에서 26px 위 (bottom-up)
 */
export const BUTTON_BOTTOM_VERTICAL = 26

export const POPUP_TYPE_IDS = {
  SQUARE: 'square',
  VERTICAL: 'vertical',
}

/** @typedef {'square' | 'vertical'} PopupTypeId */

/**
 * @param {PopupTypeId} id
 * @returns {{
 *   id: PopupTypeId,
 *   width: number,
 *   height: number,
 *   aspectRatio: string,
 *   buttonTop?: number,
 *   buttonBottom?: number,
 * }}
 */
export function getPopupTypeConfig(id) {
  const key = id === POPUP_TYPE_IDS.VERTICAL ? POPUP_TYPE_IDS.VERTICAL : POPUP_TYPE_IDS.SQUARE
  if (key === POPUP_TYPE_IDS.VERTICAL) {
    const w = POPUP_BASE_WIDTH
    return {
      id: POPUP_TYPE_IDS.VERTICAL,
      width: w,
      height: 586.6,
      aspectRatio: '3/5',
      buttonBottom: BUTTON_BOTTOM_VERTICAL,
    }
  }
  const w = POPUP_BASE_WIDTH
  return {
    id: POPUP_TYPE_IDS.SQUARE,
    width: w,
    height: w,
    aspectRatio: '1/1',
    buttonTop: BUTTON_TOP_SQUARE,
  }
}

export const POPUP_TYPE_OPTIONS = [
  { id: POPUP_TYPE_IDS.SQUARE, labelKey: 'popupTypeSquare' },
  { id: POPUP_TYPE_IDS.VERTICAL, labelKey: 'popupTypeVertical' },
]
