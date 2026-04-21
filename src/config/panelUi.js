/**
 * 설정 사이드바 공통 토큰 — R(rounded-lg), border-zinc-700, surface-800 계열 통일
 */

export const PANEL_R = 'rounded-lg'

/** 섹션 제목 — 팝업 템플릿 라벨과 위계·톤 맞춤 */
export const PANEL_SECTION_TITLE_CLASS =
  'mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500'

/** 상단「팝업 템플릿」카드 = 슬라이드 슬롯 카드와 동일 보더·R, 패딩만 p-4 */
export const PANEL_TEMPLATE_CARD_CLASS = `${PANEL_R} border border-green-400 bg-surface-800/50 p-4 shadow-[0_8px_28px_-8px_rgba(0,0,0,0.45)]`

/** 템플릿 카드 안 라벨 — 섹션 제목과 동일 타이포, mb만 살짝 줄임 */
export const PANEL_TEMPLATE_LABEL_CLASS =
  'mb-3 block text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500'

/** 슬라이드·캐러셀 슬롯 행(motion.li) */
export const PANEL_SLIDE_CARD_BASE =
  'relative rounded-lg border bg-surface-800/50 p-3 transition-opacity'

export const PANEL_SLIDE_CARD_BORDER_IDLE = 'border-zinc-700'

export const PANEL_SLIDE_CARD_BORDER_DROP = 'border-brand/60 ring-2 ring-brand/25'

/** 배경 이미지 없음 플레이스홀더 */
export const PANEL_IMAGE_EMPTY_PLACEHOLDER_CLASS =
  `${PANEL_R} border border-zinc-600/60 bg-zinc-950/25 py-2 text-center text-xs text-zinc-500`

/** 슬롯 추가(이미지 추가) 전체 폭 버튼 — 실선 테두리 */
export const PANEL_ADD_ROW_BUTTON_CLASS = `${PANEL_R} w-full border border-zinc-600 bg-zinc-900/40 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-800/80`

/** 미리보기 이전·다음 등 보조 버튼 */
export const PANEL_AUX_BUTTON_CLASS = `${PANEL_R} border border-zinc-700 bg-surface-700 px-3 py-1.5 text-sm text-zinc-200`

/** App Mode 등 인셋 토글 컨테이너 */
export const PANEL_INSET_TOGGLE_WRAP_CLASS = `${PANEL_R} flex items-center gap-2 border border-zinc-700 bg-surface-800/50 p-1`

/** 인셋 토글 트랙 안 세그먼트(App Mode·버튼 개수 등) */
export const PANEL_INSET_TOGGLE_BUTTON_CLASS =
  'flex-1 min-w-0 rounded-lg py-2 text-xs font-semibold transition-colors'
export const PANEL_INSET_TOGGLE_BUTTON_ACTIVE_CLASS =
  'bg-brand/25 text-white ring-1 ring-brand/35'
export const PANEL_INSET_TOGGLE_BUTTON_IDLE_CLASS =
  'text-zinc-400 hover:text-zinc-200'

/** 드래그 프리뷰(포털) 카드 — 일반 카드와 동일 보더, 살짝 브랜드 링만 */
export const PANEL_DRAG_PORTAL_CARD_CLASS = `${PANEL_R} fixed z-[200] border border-zinc-700 bg-surface-800 p-3 shadow-2xl ring-1 ring-brand/25 pointer-events-none select-none overflow-hidden`
