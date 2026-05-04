/**
 * 팝업 타입별 크기·버튼 위치 (기준 너비 352px)
 * 컨테이너: 14px 라운딩 + overflow:hidden (그림자 없음)
 */
import { getSimpleIconPresetSrc } from './simpleIcon'

export const POPUP_BASE_WIDTH = 352

/** IAM 스테이지 좌우 패딩(px) — 실무 가이드(그 외 팝업·캐러셀·Simple Icon 공통 스테이지) */
export const IAM_STAGE_PAD_PX = 18

export const POPUP_CONTAINER_BORDER_RADIUS = 14

/** Auto Square Slide (Slide_Modal_1:1) — 슬롯 최소·최대 장수 */
export const SLIDE_MODAL_11_MIN_IMAGES = 2
export const SLIDE_MODAL_11_MAX_IMAGES = 6

/** @deprecated SLIDE_MODAL_11_MAX_IMAGES 사용 */
export const SLIDE_MODAL_MAX_IMAGES = SLIDE_MODAL_11_MAX_IMAGES

/** Slide_Modal_Vertical — 가로 스크롤 슬라이드 (최소·최대 장수) */
export const SLIDE_MODAL_VERTICAL_MIN_IMAGES = 3
export const SLIDE_MODAL_VERTICAL_MAX_IMAGES = 6

/**
 * Slide_Modal_Vertical — 모달 310×571 · 본문 컬럼 270 · 캐러셀은 모달 너비(310) edge-to-edge
 * 캐러셀 슬라이드 폭·간격으로 좌우 피크 · contents itemSpacing 20 (슬라이드↔텍스트 등)
 */
export const SMV_MODAL_W = 310
export const SMV_MODAL_H = 571
export const SMV_COLUMN_W = 270
/** Edge-to-edge 캐러셀: 뷰포트(모달 너비)보다 좁게 잡아 좌우에 이전/다음 장이 피크로 보임 (본문 컬럼 270과 동일) */
export const SMV_CAROUSEL_SLIDE_W = 270
export const SMV_CAROUSEL_GAP = 8
/** @deprecated 레거시; SMV_CAROUSEL_SLIDE_W 사용 */
export const SMV_SLIDE_CARD_W = SMV_CAROUSEL_SLIDE_W
/** @deprecated 레거시; SMV_CAROUSEL_GAP 사용 */
export const SMV_SLIDE_GAP = SMV_CAROUSEL_GAP
/** @deprecated 스냅 스크롤 사용 */
export const SMV_SLIDE_STEP = SMV_CAROUSEL_SLIDE_W + SMV_CAROUSEL_GAP
/** Slide_Modal_Vertical (Thumb Vertical) — 캐러셀 슬라이드 세로 높이 */
export const SMV_SLIDE_H = 348
/** Carousel Thumb Horizontal — Vertical과 동일 구조, 슬라이드 높이만 축소 */
export const SMV_SLIDE_H_THUMB_HORIZONTAL = 180
/** SNS Type — 슬라이드 270×270 (1:1, SMV_CAROUSEL_SLIDE_W와 동일) */
export const SMV_SLIDE_H_SNS = SMV_CAROUSEL_SLIDE_W
export const SMV_SLIDE_RADIUS = 4

/** Vertical / Thumb 변형 공통: 타입별 캐러셀 슬라이드 높이(px) */
export function getSmvCarouselSlideHeight(popupType) {
  if (popupType === POPUP_TYPE_IDS.CAROUSEL_THUMB_HORIZONTAL) {
    return SMV_SLIDE_H_THUMB_HORIZONTAL
  }
  if (popupType === POPUP_TYPE_IDS.CAROUSEL_SNS) {
    return SMV_SLIDE_H_SNS
  }
  if (popupType === POPUP_TYPE_IDS.CAROUSEL_STORYTELLING) {
    return SMV_SLIDE_H_SNS
  }
  return SMV_SLIDE_H
}

/**
 * 캐러셀 슬라이드 모달 외곽 높이(SMV_MODAL_H 기준, 슬라이드 높이 차이만 반영)
 */
export function getCarouselSlideModalOuterHeight(popupType) {
  const slideH = getSmvCarouselSlideHeight(popupType)
  return SMV_MODAL_H - SMV_SLIDE_H + slideH
}
/** 캐러셀 중앙 슬라이드 카드(뷰포트 기준) — 페이지네이션은 이 사각형 기준 우·하단 6px */
export const SMV_CAROUSEL_PAGINATION_INSET = 6
/** 뷰포트 내 중앙 슬롯의 left 오프셋 (=(모달폭−슬라이드폭)/2) */
export const SMV_CAROUSEL_CENTER_SLOT_LEFT =
  (SMV_MODAL_W - SMV_CAROUSEL_SLIDE_W) / 2
export const SMV_TITLE_H = 56
export const SMV_DESC_H = 40
export const SMV_TITLE_DESC_GAP = 7
export const SMV_BTN_W = 270
export const SMV_BTN_H = 46
export const SMV_BTN_RADIUS = 4
/** Carousel Slide modal (Vertical / Horizontal thumb) 전용 버튼 배경 — Choice 모달 기본색과 구분 */
export const SMV_BTN_BG = '#00DC64'
/** 모달 좌우 inset (310 − 270) / 2 */
export const SMV_CONTENT_PAD_X = (SMV_MODAL_W - SMV_COLUMN_W) / 2
/** Figma modal: top inset 14, bottom inset 20 */
export const SMV_PAD_TOP = 14
/** Simple Icon Modal 전용 상단 inset (carousel SMV는 SMV_PAD_TOP 유지) */
export const SMV_SIMPLE_ICON_PAD_TOP = 26
export const SMV_PAD_BOTTOM = 20
/** contents 프레임에서 slide↔text, text↔btn 사이 (itemSpacing 20) */
export const SMV_GAP_SLIDE_TEXT = 20
export const SMV_GAP_TEXT_BTN = 20

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
  /** 세로 3:4 (버튼 위치 가이드는 3:5와 동일 — 하단 기준) */
  VERTICAL_3_4: 'vertical_3_4',
  /** 1:1, 버튼 없음 고정, 도트 인디케이터 */
  SLIDE_MODAL_1_1: 'slide_modal_1_1',
  /** 4:5, 슬롯·동작은 SLIDE_MODAL_1_1과 동일 */
  SLIDE_MODAL_4_5: 'slide_modal_4_5',
  /** 세로형 슬라이드 + 텍스트 + 기본 CTA (Read Now) */
  SLIDE_MODAL_VERTICAL: 'slide_modal_vertical',
  CAROUSEL_THUMB_HORIZONTAL: 'carousel_thumb_horizontal',
  CAROUSEL_SNS: 'carousel_sns',
  CAROUSEL_STORYTELLING: 'carousel_storytelling',
  SIMPLE_ICON_MODAL: 'simple_icon_modal',
  /** Bottom Slide Up — 왼쪽 썸네일 크게·커버 (기존) */
  BOTTOM_SLIDE_UP: 'bottom_slide_up',
  /** Bottom Slide Up — 왼쪽 아이콘 크기·contain·원형 */
  BOTTOM_SLIDE_UP_ICON: 'bottom_slide_up_icon',
}

/** 설정 패널 · JSON용 표시 이름 */
export const POPUP_TYPE_DISPLAY_NAME = {
  [POPUP_TYPE_IDS.SQUARE]: '1:1',
  [POPUP_TYPE_IDS.VERTICAL_3_4]: '3:4',
  [POPUP_TYPE_IDS.VERTICAL]: '3:5',
  [POPUP_TYPE_IDS.SLIDE_MODAL_1_1]: 'Auto Square Slide',
  [POPUP_TYPE_IDS.SLIDE_MODAL_4_5]: 'Auto Square Slide',
  [POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL]: 'Vertical',
  [POPUP_TYPE_IDS.CAROUSEL_THUMB_HORIZONTAL]: 'Horizontal',
  [POPUP_TYPE_IDS.CAROUSEL_SNS]: 'SNS Type',
  [POPUP_TYPE_IDS.CAROUSEL_STORYTELLING]: 'Storytelling Type',
  [POPUP_TYPE_IDS.SIMPLE_ICON_MODAL]: 'Simple Icon Modal',
  [POPUP_TYPE_IDS.BOTTOM_SLIDE_UP]: 'Character Type',
  [POPUP_TYPE_IDS.BOTTOM_SLIDE_UP_ICON]: 'Icon Type',
}

export function getPopupTypeDisplayName(id) {
  if (id == null) return ''
  return POPUP_TYPE_DISPLAY_NAME[id] ?? String(id)
}

/** 커스텀 드롭다운 상단 그룹 (선택 시 기본 하위 타입 적용) */
export const POPUP_UI_GROUPS = [
  { id: 'choice', label: 'Choice Button Modal' },
  { id: 'auto_square', label: 'Auto Square Slide' },
  { id: 'carousel', label: 'Carousel Slide Modal' },
  { id: 'simple_icon', label: 'Simple Icon Modal' },
  { id: 'bottom_slide', label: 'Bottom Slide Up' },
]

export const POPUP_GROUP_DEFAULT_POPUP_TYPE = {
  choice: POPUP_TYPE_IDS.SQUARE,
  auto_square: POPUP_TYPE_IDS.SLIDE_MODAL_1_1,
  carousel: POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL,
  simple_icon: POPUP_TYPE_IDS.SIMPLE_ICON_MODAL,
  bottom_slide: POPUP_TYPE_IDS.BOTTOM_SLIDE_UP,
}

/** Choice Button Modal — 1:1 · 3:4 · 3:5 */
export function isChoiceButtonModalType(popupType) {
  return (
    popupType === POPUP_TYPE_IDS.SQUARE ||
    popupType === POPUP_TYPE_IDS.VERTICAL_3_4 ||
    popupType === POPUP_TYPE_IDS.VERTICAL
  )
}

export function getPopupUiGroupId(popupType) {
  if (isChoiceButtonModalType(popupType)) {
    return 'choice'
  }
  if (isSlideModalAutoSquareType(popupType)) return 'auto_square'
  if (
    popupType === POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL ||
    popupType === POPUP_TYPE_IDS.CAROUSEL_THUMB_HORIZONTAL ||
    popupType === POPUP_TYPE_IDS.CAROUSEL_SNS ||
    popupType === POPUP_TYPE_IDS.CAROUSEL_STORYTELLING
  ) {
    return 'carousel'
  }
  if (popupType === POPUP_TYPE_IDS.SIMPLE_ICON_MODAL) return 'simple_icon'
  if (
    popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP ||
    popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP_ICON
  ) {
    return 'bottom_slide'
  }
  return 'choice'
}

/** Bottom Slide Up — Character / Icon 공통 분기 */
export function isBottomSlideUpType(popupType) {
  return (
    popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP ||
    popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP_ICON
  )
}

/** Bottom Slide 바 좌측 미디어 URL — Character=업로드, Icon=프리셋 */
export function getBottomSlideUpThumbSrc(state) {
  if (state.popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP_ICON) {
    return getSimpleIconPresetSrc(state.bottomSlideUpIconPresetId)
  }
  return state.imageSource ?? null
}

export function isCarouselThumbPopupType(popupType) {
  return (
    popupType === POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL ||
    popupType === POPUP_TYPE_IDS.CAROUSEL_THUMB_HORIZONTAL ||
    popupType === POPUP_TYPE_IDS.CAROUSEL_SNS ||
    popupType === POPUP_TYPE_IDS.CAROUSEL_STORYTELLING
  )
}

export function isSimpleIconModalPopupType(popupType) {
  return popupType === POPUP_TYPE_IDS.SIMPLE_ICON_MODAL
}

/** Auto Square Slide 그룹 — 1:1 · 4:5 공통 슬롯 슬라이드 */
export function isSlideModalAutoSquareType(popupType) {
  return (
    popupType === POPUP_TYPE_IDS.SLIDE_MODAL_1_1 ||
    popupType === POPUP_TYPE_IDS.SLIDE_MODAL_4_5
  )
}

/**
 * 빌더 미리보기 폰 목업 스크린 — iPhone 13·14 (일반 모델) 논리 해상도(pt).
 * HTML 내보내기에는 넣지 않음(미리보기 전용).
 */
export const PREVIEW_PHONE_IPHONE_13_14_W = 390
export const PREVIEW_PHONE_IPHONE_13_14_H = 844

/** Bottom Slide Up — 스크린 가로(pt); 미리보기 iPhone 13·14와 동일 */
export const BOTTOM_SLIDE_UP_SCREEN_W = PREVIEW_PHONE_IPHONE_13_14_W
/** @deprecated BSU는 BOTTOM_SLIDE_UP_OUTER_PAD_H 사용(Studio: 슬라이드 래퍼 가로 패딩) */
export const BOTTOM_SLIDE_UP_MARGIN_H = 16
/** IAM Studio: 좁은 뷰포트에서 슬라이드 래퍼 가로 패딩 15px */
export const BOTTOM_SLIDE_UP_OUTER_PAD_H = 15
/** Studio `.content-wrapper` — 바 최대 폭 */
export const BOTTOM_SLIDE_UP_CONTENT_MAX_W = 480
/** Studio: (min-width: 599px)에서 슬라이드 래퍼 padding 0 */
export const BOTTOM_SLIDE_UP_WIDE_MIN_W = 599
/** IAM 키프레임 종료 bottom(px) — Android / 일반 WebView */
export const BOTTOM_SLIDE_UP_BOTTOM_ANDROID = 63
/** IAM 키프레임 종료 bottom(px) — iOS Safari/WebView */
export const BOTTOM_SLIDE_UP_BOTTOM = 96
/** IAM 애니메이션: 등장·퇴장 duration(s), easing */
export const BOTTOM_SLIDE_UP_ANIM_DURATION_S = 0.2
export const BOTTOM_SLIDE_UP_ANIM_EASING = 'ease-out'
/** IAM: 키프레임 시작 bottom(px) */
export const BOTTOM_SLIDE_UP_ANIM_FROM_BOTTOM_PX = -100
export const BOTTOM_SLIDE_UP_BAR_HEIGHT = 82
export const BOTTOM_SLIDE_UP_RADIUS = 6
export const BOTTOM_SLIDE_UP_THUMB_PX = 50
export const BOTTOM_SLIDE_UP_THUMB_RADIUS = 4
/** Bottom Slide Up — Icon Type 좌측 미디어 (contain · 원형) */
export const BOTTOM_SLIDE_UP_ICON_THUMB_PX = 40
export const BOTTOM_SLIDE_UP_CLOSE_PX = 22
export const BOTTOM_SLIDE_UP_PAD_X = 15
export const BOTTOM_SLIDE_UP_GAP = 10
/** 이미지·텍스트·닫기 제외 후 텍스트 영역 최대 폭 (타입별 썸네일 폭 반영) */
export function getBottomSlideUpThumbPx(popupType) {
  return popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP_ICON
    ? BOTTOM_SLIDE_UP_ICON_THUMB_PX
    : BOTTOM_SLIDE_UP_THUMB_PX
}

export function getBottomSlideUpTextClampWidth(popupType) {
  const thumbPx = getBottomSlideUpThumbPx(popupType)
  const barW = Math.min(
    BOTTOM_SLIDE_UP_CONTENT_MAX_W,
    BOTTOM_SLIDE_UP_SCREEN_W - BOTTOM_SLIDE_UP_OUTER_PAD_H * 2
  )
  return (
    barW -
    BOTTOM_SLIDE_UP_PAD_X * 2 -
    thumbPx -
    BOTTOM_SLIDE_UP_GAP * 2 -
    BOTTOM_SLIDE_UP_CLOSE_PX
  )
}

/**
 * @param {string} id
 * @returns {{
 *   id: string,
 *   width: number,
 *   height: number,
 *   aspectRatio: string,
 *   buttonTop?: number,
 *   buttonBottom?: number,
 *   noButtons?: boolean,
 * }}
 */
export function getPopupTypeConfig(id) {
  const w = POPUP_BASE_WIDTH
  switch (id) {
    case POPUP_TYPE_IDS.VERTICAL: {
      return {
        id: POPUP_TYPE_IDS.VERTICAL,
        width: w,
        height: 586.6,
        aspectRatio: '3/5',
        buttonBottom: BUTTON_BOTTOM_VERTICAL,
      }
    }
    case POPUP_TYPE_IDS.VERTICAL_3_4: {
      return {
        id: POPUP_TYPE_IDS.VERTICAL_3_4,
        width: w,
        height: (w * 4) / 3,
        aspectRatio: '3/4',
        buttonBottom: BUTTON_BOTTOM_VERTICAL,
      }
    }
    case POPUP_TYPE_IDS.SLIDE_MODAL_1_1: {
      return {
        id: POPUP_TYPE_IDS.SLIDE_MODAL_1_1,
        width: w,
        height: w,
        aspectRatio: '1/1',
        noButtons: true,
      }
    }
    case POPUP_TYPE_IDS.SLIDE_MODAL_4_5: {
      return {
        id: POPUP_TYPE_IDS.SLIDE_MODAL_4_5,
        width: w,
        height: (w * 5) / 4,
        aspectRatio: '4/5',
        noButtons: true,
      }
    }
    case POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL:
    case POPUP_TYPE_IDS.CAROUSEL_THUMB_HORIZONTAL:
    case POPUP_TYPE_IDS.CAROUSEL_SNS:
    case POPUP_TYPE_IDS.CAROUSEL_STORYTELLING: {
      return {
        id,
        width: SMV_MODAL_W,
        height: getCarouselSlideModalOuterHeight(id),
        aspectRatio: 'custom',
        noButtons: true,
      }
    }
    case POPUP_TYPE_IDS.BOTTOM_SLIDE_UP:
    case POPUP_TYPE_IDS.BOTTOM_SLIDE_UP_ICON: {
      return {
        id,
        width: BOTTOM_SLIDE_UP_SCREEN_W,
        height: PREVIEW_PHONE_IPHONE_13_14_H,
        aspectRatio: 'custom',
        noButtons: true,
      }
    }
    case POPUP_TYPE_IDS.SIMPLE_ICON_MODAL: {
      return {
        id: POPUP_TYPE_IDS.SIMPLE_ICON_MODAL,
        width: SMV_MODAL_W,
        height: SMV_MODAL_H,
        aspectRatio: 'custom',
        noButtons: true,
      }
    }
    default: {
      return {
        id: POPUP_TYPE_IDS.SQUARE,
        width: w,
        height: w,
        aspectRatio: '1/1',
        buttonTop: BUTTON_TOP_SQUARE,
      }
    }
  }
}

export const POPUP_TYPE_OPTIONS = [
  { id: POPUP_TYPE_IDS.SQUARE, labelKey: 'popupTypeSquare' },
  { id: POPUP_TYPE_IDS.VERTICAL, labelKey: 'popupTypeVertical' },
  { id: POPUP_TYPE_IDS.VERTICAL_3_4, labelKey: 'popupTypeVertical34' },
  { id: POPUP_TYPE_IDS.SLIDE_MODAL_1_1, labelKey: 'popupTypeSlideModal11' },
  { id: POPUP_TYPE_IDS.SLIDE_MODAL_4_5, labelKey: 'popupTypeSlideModal45' },
  { id: POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL, labelKey: 'popupTypeSlideModalVertical' },
]
