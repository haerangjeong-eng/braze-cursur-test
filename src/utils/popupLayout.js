import {
  getPopupTypeConfig,
  isBottomSlideUpType,
  POPUP_TYPE_IDS,
  PREVIEW_PHONE_IPHONE_13_14_H,
  PREVIEW_PHONE_IPHONE_13_14_W,
  SMV_MODAL_W,
  SMV_SIMPLE_ICON_PAD_TOP,
} from '../config/popupTypes'
import { getSimpleIconMediaHeightPx } from '../config/simpleIcon'
import { computeSmvWhitePanelHeightPx } from './smvTextMeasure'

/**
 * 미리보기·푸터 폭 등에 사용하는 최종 프레임 크기 (Simple Icon은 제목/설명 줄 수에 따라 높이 변동).
 * @param {object} state
 * @param {{ previewScreenW?: number, previewScreenH?: number }} [previewFrame] 빌더 미리보기 폰 프레임(pt). 생략 시 iPhone 13·14.
 * @returns {{ width: number, height: number }}
 */
export function resolvePopupPreviewDimensions(state, previewFrame = {}) {
  const cfg = getPopupTypeConfig(state.popupType)
  const pw =
    previewFrame.previewScreenW ?? PREVIEW_PHONE_IPHONE_13_14_W
  const ph =
    previewFrame.previewScreenH ?? PREVIEW_PHONE_IPHONE_13_14_H
  if (isBottomSlideUpType(state.popupType)) {
    return { width: pw, height: ph }
  }
  if (state.popupType !== POPUP_TYPE_IDS.SIMPLE_ICON_MODAL) {
    return { width: cfg.width, height: cfg.height }
  }
  const mediaH = getSimpleIconMediaHeightPx(state)
  const h = computeSmvWhitePanelHeightPx(
    state.slideVerticalTitle,
    state.slideVerticalDescription,
    mediaH,
    true,
    SMV_SIMPLE_ICON_PAD_TOP
  )
  return { width: SMV_MODAL_W, height: h }
}
