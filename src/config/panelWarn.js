/**
 * 설정 패널·헤더 경고 문단 — 타이포·입력 대비 여백 전역 통일
 */

/** 입력·textarea 바로 아래(클램프·버튼 1줄 경고 등) */
export const PANEL_WARN_AFTER_INPUT_CLASS =
  'mt-2 text-xs text-amber-400/90 leading-relaxed whitespace-pre-line'

/**
 * 같은 세로 묶음에서 부모 gap으로만 위 간격을 줄 때(필수 입력 안내 등)
 */
export const PANEL_WARN_SIBLING_CLASS =
  'text-xs text-amber-400/90 leading-relaxed whitespace-pre-line'

/** 헤더 복사 영역 — 좁은 폭에서는 좌측, lg 이상에서는 우측 정렬 — 세로 간격은 부모 gap */
export const HEADER_WARN_LINE_CLASS =
  'text-xs text-amber-400/90 leading-relaxed text-left lg:text-right whitespace-pre-line'
