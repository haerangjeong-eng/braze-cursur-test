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

/**
 * 코드 복사 검증 미충족 영역 — 얇은 테두리 + 은은한 배경 (ring-offset 없이 여백 일관)
 */
export const PANEL_SECTION_WARN_RING_CLASS =
  'rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3 shadow-[inset_0_1px_0_0_rgba(251,191,36,0.07)]'

/**
 * 위 강조 박스 바로 아래 검증 문구 — 상단 여백 8px 고정.
 * 부모 `space-y-*`가 자식에 더 큰 margin-top을 줄 때도 이미지 블록과 동일하게 맞추려고 `!mt-2` 사용.
 */
export const PANEL_COPY_VALIDATE_MSG_CLASS =
  '!mt-2 pl-3 text-[11px] leading-snug text-amber-200/85'
