import {
  isBottomSlideUpType,
  isCarouselThumbPopupType,
  isChoiceButtonModalType,
  isSlideModalAutoSquareType,
  POPUP_TYPE_IDS,
  SLIDE_MODAL_11_MIN_IMAGES,
  SLIDE_MODAL_VERTICAL_MIN_IMAGES,
} from '../config/popupTypes'
import { SIMPLE_ICON_VARIANT_ICON } from '../config/simpleIcon'
import { slideModal11HasAllImages } from './slideModal11'
import { slideVerticalHasAllImages } from './slideVertical'

function hasTrim(str) {
  return String(str ?? '').trim().length > 0
}

function choiceModalHasAllButtonLabels(state) {
  const n = state.buttonCount ?? 1
  if (!String(state.button1?.label ?? '').trim()) return false
  if (n >= 2 && !String(state.button2?.label ?? '').trim()) return false
  return true
}

/** `{n}` 등 플레이스홀더 치환 */
export function formatCopyHtmlToastMessage(template, vars = {}) {
  let s = String(template ?? '')
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(String(v))
  }
  return s
}

/**
 * @typedef {'min_images'|'upload_image'|'bottom_slide_text'|'title'|'button'|'title_and_button'|'deeplink'} CopyHtmlFailReason
 */

/**
 * 첫 번째 검증 실패만 반환 (토스트 1개와 동일).
 * @returns {{ reason: CopyHtmlFailReason, minImages?: number } | null}
 */
function getFirstCopyHtmlFailure(state) {
  const pt = state.popupType

  if (isCarouselThumbPopupType(pt) && !slideVerticalHasAllImages(state.slideVerticalImages)) {
    return { reason: 'min_images', minImages: SLIDE_MODAL_VERTICAL_MIN_IMAGES }
  }

  if (isSlideModalAutoSquareType(pt) && !slideModal11HasAllImages(state.slideImages)) {
    return { reason: 'min_images', minImages: SLIDE_MODAL_11_MIN_IMAGES }
  }

  if (isSlideModalAutoSquareType(pt) && !hasTrim(state.slideModal11Deeplink)) {
    return { reason: 'deeplink' }
  }

  if (isChoiceButtonModalType(pt) && !state.imageSource) {
    return { reason: 'upload_image' }
  }

  if (
    pt === POPUP_TYPE_IDS.SIMPLE_ICON_MODAL &&
    state.simpleIconVariant !== SIMPLE_ICON_VARIANT_ICON &&
    !state.imageSource
  ) {
    return { reason: 'upload_image' }
  }

  if (pt === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP && !state.imageSource) {
    return { reason: 'upload_image' }
  }

  if (isBottomSlideUpType(pt) && !hasTrim(state.bottomSlideUpText)) {
    return { reason: 'bottom_slide_text' }
  }

  if (isBottomSlideUpType(pt) && !hasTrim(state.bottomSlideUpDeeplink)) {
    return { reason: 'deeplink' }
  }

  const carouselOrSimpleIcon =
    isCarouselThumbPopupType(pt) || pt === POPUP_TYPE_IDS.SIMPLE_ICON_MODAL

  if (carouselOrSimpleIcon) {
    const titleOk = hasTrim(state.slideVerticalTitle)
    const btnOk = hasTrim(state.button1?.label)
    if (!titleOk && !btnOk) return { reason: 'title_and_button' }
    if (!titleOk) return { reason: 'title' }
    if (!btnOk) return { reason: 'button' }
    if (!hasTrim(state.button1?.deeplink)) return { reason: 'deeplink' }
  }

  if (isChoiceButtonModalType(pt) && !choiceModalHasAllButtonLabels(state)) {
    return { reason: 'button' }
  }

  if (isChoiceButtonModalType(pt)) {
    if (!hasTrim(state.button1?.deeplink)) return { reason: 'deeplink' }
    if ((state.buttonCount ?? 1) >= 2 && !hasTrim(state.button2?.deeplink)) {
      return { reason: 'deeplink' }
    }
  }

  return null
}

/**
 * HTML 복사 허용 여부 (패널·토스트와 동일 규칙).
 */
export function isCopyHtmlValid(state) {
  return getFirstCopyHtmlFailure(state) === null
}

/**
 * HTML 복사 불가 시 토스트에 띄울 문구.
 */
/**
 * 패널에서 코드 복사 조건 미충족 시 강조할 영역 플래그 (토스트와 독립적으로 모든 미충족 항목).
 */
export function getCopyHtmlPanelIssues(state) {
  const pt = state.popupType
  /** @type {Record<string, boolean>} */
  const issues = {
    carouselMinImages: false,
    slide11MinImages: false,
    slideModal11Deeplink: false,
    uploadImage: false,
    bottomSlideText: false,
    title: false,
    smvButton: false,
    smvDeeplink: false,
    simpleIconDeeplink: false,
    bottomSlideDeeplink: false,
    choiceButton1: false,
    choiceButton2: false,
    choiceDeeplink1: false,
    choiceDeeplink2: false,
  }

  if (isCarouselThumbPopupType(pt) && !slideVerticalHasAllImages(state.slideVerticalImages)) {
    issues.carouselMinImages = true
  }

  if (isSlideModalAutoSquareType(pt) && !slideModal11HasAllImages(state.slideImages)) {
    issues.slide11MinImages = true
  }

  if (isSlideModalAutoSquareType(pt) && !hasTrim(state.slideModal11Deeplink)) {
    issues.slideModal11Deeplink = true
  }

  if (isChoiceButtonModalType(pt) && !state.imageSource) {
    issues.uploadImage = true
  }

  if (
    pt === POPUP_TYPE_IDS.SIMPLE_ICON_MODAL &&
    state.simpleIconVariant !== SIMPLE_ICON_VARIANT_ICON &&
    !state.imageSource
  ) {
    issues.uploadImage = true
  }

  if (pt === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP && !state.imageSource) {
    issues.uploadImage = true
  }

  if (isBottomSlideUpType(pt) && !hasTrim(state.bottomSlideUpText)) {
    issues.bottomSlideText = true
  }

  if (isBottomSlideUpType(pt) && !hasTrim(state.bottomSlideUpDeeplink)) {
    issues.bottomSlideDeeplink = true
  }

  const carouselOrSimpleIcon =
    isCarouselThumbPopupType(pt) || pt === POPUP_TYPE_IDS.SIMPLE_ICON_MODAL

  if (carouselOrSimpleIcon) {
    if (!hasTrim(state.slideVerticalTitle)) issues.title = true
    if (!hasTrim(state.button1?.label)) issues.smvButton = true
  }

  if (isCarouselThumbPopupType(pt) && !hasTrim(state.button1?.deeplink)) {
    issues.smvDeeplink = true
  }

  if (pt === POPUP_TYPE_IDS.SIMPLE_ICON_MODAL && !hasTrim(state.button1?.deeplink)) {
    issues.simpleIconDeeplink = true
  }

  if (isChoiceButtonModalType(pt)) {
    if (!String(state.button1?.label ?? '').trim()) issues.choiceButton1 = true
    if (
      (state.buttonCount ?? 1) >= 2 &&
      !String(state.button2?.label ?? '').trim()
    ) {
      issues.choiceButton2 = true
    }
    if (!hasTrim(state.button1?.deeplink)) issues.choiceDeeplink1 = true
    if (
      (state.buttonCount ?? 1) >= 2 &&
      !hasTrim(state.button2?.deeplink)
    ) {
      issues.choiceDeeplink2 = true
    }
  }

  return issues
}

/** 복사 시도 전에는 패널 경고 링·문구를 숨길 때 사용 */
export const EMPTY_COPY_HTML_PANEL_ISSUES = {
  carouselMinImages: false,
  slide11MinImages: false,
  slideModal11Deeplink: false,
  uploadImage: false,
  bottomSlideText: false,
  title: false,
  smvButton: false,
  smvDeeplink: false,
  simpleIconDeeplink: false,
  bottomSlideDeeplink: false,
  choiceButton1: false,
  choiceButton2: false,
  choiceDeeplink1: false,
  choiceDeeplink2: false,
}

export function getCopyHtmlInvalidMessage(state, tr) {
  const t = tr || {}
  const fail = getFirstCopyHtmlFailure(state)
  if (!fail) return ''

  switch (fail.reason) {
    case 'min_images':
      return formatCopyHtmlToastMessage(t.copyHtmlToastMinImages, {
        n: fail.minImages ?? 0,
      })
    case 'upload_image':
      return t.copyHtmlToastUploadImage ?? ''
    case 'bottom_slide_text':
      return t.copyHtmlToastBottomSlideTextRequired ?? ''
    case 'title':
      return t.copyHtmlToastTitleRequired ?? ''
    case 'button':
      return t.copyHtmlToastButtonRequired ?? ''
    case 'title_and_button':
      return t.copyHtmlToastTitleAndButtonRequired ?? ''
    case 'deeplink':
      return t.copyHtmlToastDeeplinkRequired ?? ''
    default:
      return ''
  }
}
