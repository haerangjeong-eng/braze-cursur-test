/** 코드/HTML 추출 시 목표 최대 바이트 (약 300KB) */
export const EXPORT_IMAGE_MAX_BYTES = 300 * 1024

function dataUrlToBlobSize(dataUrl) {
  if (!dataUrl?.startsWith('data:')) return 0
  const base64 = dataUrl.split(',')[1]
  if (!base64) return 0
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return (base64.length * 3) / 4 - padding
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = src
  })
}

/**
 * 업로드/붙여넣기 등 data URL 이미지를 Canvas로 JPEG 재인코딩하며 목표 용량 이하로 맞춥니다.
 * GIF는 원본 유지 (압축 생략), 용량 초과 시 경고 문자열 반환.
 *
 * @param {string} dataUrl
 * @returns {Promise<{ dataUrl: string, compressed: boolean, warning?: string }>}
 */
export async function compressImageDataUrlForExport(dataUrl) {
  if (!dataUrl?.startsWith('data:')) {
    return { dataUrl, compressed: false }
  }

  const mimeMatch = dataUrl.match(/^data:([^;,]+)/)
  const mime = (mimeMatch?.[1] || '').toLowerCase()

  if (mime === 'image/gif') {
    const size = dataUrlToBlobSize(dataUrl)
    const warning = size > EXPORT_IMAGE_MAX_BYTES ? 'gif_large' : undefined
    return { dataUrl, compressed: false, warning }
  }

  let img
  try {
    img = await loadImage(dataUrl)
  } catch {
    return { dataUrl, compressed: false }
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return { dataUrl, compressed: false }

  const w0 = img.naturalWidth || img.width
  const h0 = img.naturalHeight || img.height
  if (!w0 || !h0) return { dataUrl, compressed: false }

  const scales = [1, 0.85, 0.7, 0.55, 0.4, 0.3]
  const qualities = []
  for (let q = 0.92; q >= 0.4; q -= 0.04) qualities.push(q)
  qualities.push(0.35, 0.3, 0.25)

  for (const scale of scales) {
    canvas.width = Math.max(1, Math.round(w0 * scale))
    canvas.height = Math.max(1, Math.round(h0 * scale))
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    for (const q of qualities) {
      const jpeg = canvas.toDataURL('image/jpeg', q)
      if (dataUrlToBlobSize(jpeg) <= EXPORT_IMAGE_MAX_BYTES) {
        const changed = jpeg !== dataUrl || scale < 1 || q < 0.92
        return { dataUrl: jpeg, compressed: changed }
      }
    }
  }

  canvas.width = Math.max(1, Math.round(w0 * 0.25))
  canvas.height = Math.max(1, Math.round(h0 * 0.25))
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const last = canvas.toDataURL('image/jpeg', 0.22)
  return { dataUrl: last, compressed: true }
}
