/**
 * `public/` 정적 자산(simple-icon 등) 절대 URL.
 * WebView·Braze IAM 등에서는 반드시 https 절대 경로가 필요하다.
 *
 * 우선순위:
 * 1. `import.meta.env.VITE_PUBLIC_ASSET_BASE_URL` — 배포 호스트·모바일 싱크 등 고정 베이스
 * 2. `window.location.origin` + `import.meta.env.BASE_URL` — 브라우저 로컬 미리보기
 */
export function getPublicAssetBaseUrl() {
  try {
    const env =
      typeof import.meta !== 'undefined'
        ? import.meta.env?.VITE_PUBLIC_ASSET_BASE_URL
        : undefined
    if (env != null && String(env).trim() !== '') {
      return String(env).trim().replace(/\/$/, '')
    }
    if (typeof window === 'undefined' || !window.location?.origin) return ''
    const origin = String(window.location.origin).replace(/\/$/, '')
    let base = import.meta.env.BASE_URL || '/'
    if (!base.startsWith('/')) base = '/' + base
    base = base.replace(/\/+$/, '')
    return origin + base
  } catch {
    return ''
  }
}

/**
 * @param {string|null|undefined} raw — `/simple-icon/gift.png` 또는 이미 절대인 URL
 * @returns {string}
 */
export function resolvePublicAssetUrl(raw) {
  const s = raw == null ? '' : String(raw)
  if (!s || s.startsWith('data:') || /^https?:\/\//i.test(s)) return s
  const root = getPublicAssetBaseUrl()
  if (!root) return s
  const path = s.startsWith('/') ? s : `/${s}`
  return `${root}${path}`
}
