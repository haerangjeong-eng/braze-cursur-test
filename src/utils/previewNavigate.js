/** 미리보기: https는 새 탭, 그 외(앱 스킴 등)는 동일 창 — 내보낸 HTML과 유사 */
export function tryPreviewNavigateToDeeplink(raw) {
  const url = typeof raw === 'string' ? raw.trim() : ''
  if (!url) return
  try {
    if (/^https?:\/\//i.test(url)) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = url
    }
  } catch {
    /* invalid URL */
  }
}
