import { isCarouselThumbPopupType, POPUP_TYPE_IDS } from '../config/popupTypes'
import { SIMPLE_ICON_VARIANT_ICON } from '../config/simpleIcon'
import { slideModal11HasAllImages } from './slideModal11'
import {
  slideVerticalHasAllImages,
  slideVerticalHasRequiredText,
} from './slideVertical'

/**
 * HTML 복사 허용 여부 (패널·헤더 경고와 동일 규칙).
 */
export function getCopyHtmlValidationFlags(state) {
  const carousel = isCarouselThumbPopupType(state.popupType)

  const carouselMissingImages =
    carousel && !slideVerticalHasAllImages(state.slideVerticalImages)

  const carouselMissingTitle =
    carousel &&
    !slideVerticalHasRequiredText(
      state.slideVerticalTitle,
      state.slideVerticalDescription,
      state.popupType
    )

  const slideModal11MissingImages =
    state.popupType === POPUP_TYPE_IDS.SLIDE_MODAL_1_1 &&
    !slideModal11HasAllImages(state.slideImages)

  const simpleIconMissingThumbImage =
    state.popupType === POPUP_TYPE_IDS.SIMPLE_ICON_MODAL &&
    state.simpleIconVariant !== SIMPLE_ICON_VARIANT_ICON &&
    !state.imageSource

  const simpleIconMissingTitle =
    state.popupType === POPUP_TYPE_IDS.SIMPLE_ICON_MODAL &&
    !slideVerticalHasRequiredText(
      state.slideVerticalTitle,
      state.slideVerticalDescription,
      POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL
    )

  const bottomSlideMissingImage =
    state.popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP && !state.imageSource

  const bottomSlideMissingText =
    state.popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP &&
    String(state.bottomSlideUpText ?? '').trim().length === 0

  return {
    carouselMissingImages,
    carouselMissingTitle,
    slideModal11MissingImages,
    simpleIconMissingThumbImage,
    simpleIconMissingTitle,
    bottomSlideMissingImage,
    bottomSlideMissingText,
  }
}

export function isCopyHtmlValid(state) {
  const f = getCopyHtmlValidationFlags(state)
  return !(
    f.carouselMissingImages ||
    f.carouselMissingTitle ||
    f.slideModal11MissingImages ||
    f.simpleIconMissingThumbImage ||
    f.simpleIconMissingTitle ||
    f.bottomSlideMissingImage ||
    f.bottomSlideMissingText
  )
}

/**
 * HTML 복사 불가 시 토스트에 띄울 문구 (우선순위는 패널 기존 안내와 동일).
 */
export function getCopyHtmlInvalidMessage(state, tr) {
  const t = tr || {}
  const f = getCopyHtmlValidationFlags(state)
  if (f.carouselMissingImages) return t.smvCopyRequiresAllImages ?? ''
  if (f.carouselMissingTitle) return t.smvCopyRequiresTitle ?? ''
  if (f.slideModal11MissingImages) return t.slideModal11CopyRequiresAllImages ?? ''
  if (f.simpleIconMissingThumbImage) return t.simpleIconCopyRequiresThumbImage ?? ''
  if (f.simpleIconMissingTitle) return t.smvCopyRequiresTitle ?? ''
  if (f.bottomSlideMissingImage) return t.copyHtmlBottomSlideNeedsImage ?? ''
  if (f.bottomSlideMissingText) return t.copyHtmlBottomSlideNeedsText ?? ''
  return ''
}
