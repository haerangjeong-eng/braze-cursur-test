/**
 * 현재 팝업 state를 인라인 스타일 기반 HTML 문자열로 변환 (복사용)
 * — 빌더 미리보기(PreviewDeviceFrame·폰 목업 등)는 여기 포함되지 않음.
 */
import { getPublicAssetBaseUrl, resolvePublicAssetUrl } from './assetUrl'
import {
  BOTTOM_SLIDE_UP_BAR_HEIGHT,
  BOTTOM_SLIDE_UP_BOTTOM,
  BOTTOM_SLIDE_UP_BOTTOM_ANDROID,
  BOTTOM_SLIDE_UP_CLOSE_PX,
  BOTTOM_SLIDE_UP_ANIM_DURATION_S,
  BOTTOM_SLIDE_UP_ANIM_EASING,
  BOTTOM_SLIDE_UP_ANIM_FROM_BOTTOM_PX,
  BOTTOM_SLIDE_UP_CONTENT_MAX_W,
  BOTTOM_SLIDE_UP_GAP,
  BOTTOM_SLIDE_UP_SCREEN_W,
  BOTTOM_SLIDE_UP_OUTER_PAD_H,
  BOTTOM_SLIDE_UP_PAD_X,
  BOTTOM_SLIDE_UP_WIDE_MIN_W,
  BOTTOM_SLIDE_UP_RADIUS,
  BOTTOM_SLIDE_UP_ICON_THUMB_PX,
  BOTTOM_SLIDE_UP_THUMB_PX,
  BOTTOM_SLIDE_UP_THUMB_RADIUS,
  getBottomSlideUpThumbSrc,
  getPopupTypeConfig,
  POPUP_CONTAINER_BORDER_RADIUS,
  POPUP_EMPTY_BACKGROUND,
  isSlideModalAutoSquareType,
  POPUP_TYPE_IDS,
  SMV_BTN_BG,
  SMV_BTN_H,
  SMV_BTN_RADIUS,
  SMV_BTN_W,
  SMV_CAROUSEL_GAP,
  SMV_CAROUSEL_SLIDE_W,
  SMV_COLUMN_W,
  SMV_CONTENT_PAD_X,
  SMV_GAP_SLIDE_TEXT,
  SMV_GAP_TEXT_BTN,
  SMV_MODAL_W,
  SMV_PAD_BOTTOM,
  SMV_PAD_TOP,
  SMV_SIMPLE_ICON_PAD_TOP,
  SMV_SLIDE_RADIUS,
  getSmvCarouselSlideHeight,
  SMV_TITLE_DESC_GAP,
} from '../config/popupTypes'
import {
  computeSmvWhitePanelHeightPx,
  measureSmvVisualLineCount,
  SMV_PREVIEW_FONT,
} from '../utils/smvTextMeasure'
import {
  normalizeSlideVerticalImages,
  slideVerticalHasAllImages,
  slideVerticalHasRequiredText,
} from '../utils/slideVertical'
import {
  normalizeSlideModal11Images,
  slideModal11HasAllImages,
} from '../utils/slideModal11'
import {
  getSimpleIconMediaHeightPx,
  getSimpleIconPresetSrc,
  getSimpleIconThumbDimensions,
  SIMPLE_ICON_ICON_PX,
  SIMPLE_ICON_VARIANT_ICON,
} from '../config/simpleIcon'

const BUTTON_HEIGHT = 48
const BUTTON_RADIUS = 4
const BUTTON_HORIZONTAL_PADDING = 14
const SINGLE_BUTTON_WIDTH = 300
const DUAL_BUTTON_WIDTH = 146
const DUAL_BUTTON_GAP = 8
const FOOTER_FONT_SIZE = 15

function exportOverlayRgba(state) {
  return `rgba(0,0,0,${(state?.overlayOpacity ?? 70) / 100})`
}

function exportFooterRow(popupW, dontShowAgainEscaped, closeTextEscaped) {
  const footStyle = `display:flex;align-items:center;justify-content:space-between;width:100%;max-width:${popupW}px;min-height:20px;padding:0;box-sizing:border-box;margin-top:10px;background:transparent;`
  return `<footer style="${footStyle}">
    <button type="button" onclick="brazeDismiss()" style="color:#fff;font-size:${FOOTER_FONT_SIZE}px;background:transparent;border:none;padding:0;cursor:pointer;">${dontShowAgainEscaped}</button>
    <button type="button" onclick="brazeDismiss()" style="color:#fff;font-size:${FOOTER_FONT_SIZE}px;background:transparent;border:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:4px;">${closeTextEscaped} ${CLOSE_ICON_SVG}</button>
  </footer>`
}

/**
 * Braze IAM Studio 패턴: 전체 뷰포트 fixed 딤 + 중앙 스테이지.
 * - body/html은 wrapHtmlDocument에서 height:100%와 맞춤
 * - 스테이지 padding 18px (Studio `.modal_wrapper`와 동일)
 * - 540px–1024px: 컬럼 width 50%, max-width 설계 폭 (Studio 미디어쿼리 대응)
 * - studioResponsiveShell: IAM Studio와 동일 — 스테이지 가로 10% 패딩, 컬럼 width 100%·max 설계폭(예: 310), 600–1024px에서 50%
 *
 * @param {{ shellPaddingPx?: number, studioResponsiveShell?: boolean }} [options]
 */
function exportIamViewportShell(state, columnWidthPx, innerColumnHtml, options = {}) {
  const overlayRgba = exportOverlayRgba(state)
  const pad = options.shellPaddingPx ?? 18
  const w = columnWidthPx
  const studioShell = options.studioResponsiveShell === true
  const stagePad = studioShell ? `${pad}px 10%` : `${pad}px`
  const columnRules = studioShell
    ? `[data-iam-col]{width:100%;max-width:${w}px;margin-left:auto;margin-right:auto;box-sizing:border-box;flex-shrink:0;}
@media screen and (min-width:600px) and (max-width:1024px){
  [data-iam-col]{width:50%!important;max-width:${w}px!important;}
}`
    : `[data-iam-col]{width:${w}px;max-width:100%;margin-left:auto;margin-right:auto;box-sizing:border-box;flex-shrink:0;}
@media screen and (min-width:540px) and (max-width:1024px){
  [data-iam-col]{width:50%!important;max-width:${w}px!important;}
}`
  return `<style>
[data-braze-iam-shell]{position:relative;width:100%;min-height:100%;min-height:100dvh;box-sizing:border-box;}
${columnRules}
</style>
<div data-braze-iam-stack data-braze-iam-shell style="position:relative;width:100%;min-height:100vh;min-height:100dvh;box-sizing:border-box;">
  <div style="position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;min-height:100vh;min-height:100dvh;background:${overlayRgba};z-index:0;pointer-events:none;"></div>
  <div data-braze-stage style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;width:100%;min-height:100vh;min-height:100dvh;padding:${stagePad};">
    <div data-iam-col>
${innerColumnHtml}
    </div>
  </div>
</div>`
}

/** 복사 시 브라우저에서 프리셋 PNG 등 상대 경로를 절대 URL로 */
export function getExportAssetBaseUrl() {
  return getPublicAssetBaseUrl()
}

export function resolveExportAssetUrl(state, raw) {
  return resolvePublicAssetUrl(raw)
}

function htmlLangAttr(state) {
  const m = {
    EN: 'en',
    KR: 'ko',
    ID: 'id',
    TH: 'th',
    TW: 'zh-Hant',
    SP: 'es',
    DE: 'de',
    FR: 'fr',
  }
  return escapeHtml(m[state?.language] || 'en')
}

/** 검증 실패 등 짧은 안내용 — UTF-8 문서 경계만 */
function wrapMinimalUtf8Doc(innerHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;background:#fff;">
${innerHtml}
</body>
</html>`
}

function wrapHtmlDocument(state, innerHtml) {
  const lang = htmlLangAttr(state)
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>In-app message</title>
<style>
/* IAM Studio 유사: 루트 높이 100% + 가로만 넘침 방지 (딤·모달이 뷰포트 기준) */
html,body{height:100%;margin:0;}
body{overflow-x:hidden;background:transparent;-webkit-text-size-adjust:100%;}
#braze-iam-wrap{min-height:100%;min-height:100dvh;box-sizing:border-box;width:100%;}
</style>
</head>
<body style="margin:0;background:transparent;">
<!-- IAM markup only (builder preview phone bezel is not included) -->
<div id="braze-iam-wrap" style="min-height:100%;min-height:100dvh;box-sizing:border-box;width:100%;padding:0;">
${innerHtml}
</div>
</body>
</html>`
}

/** Braze JS 브리지 닫기 + 로드 후 4초 자동 닫힘 */
function buildBrazeBridgeAndAutoCloseScript() {
  return `<script>(function(){
function brazeDismiss(){try{
if(window.brazeBridge&&typeof brazeBridge.closeMessage==='function'){brazeBridge.closeMessage();return;}
if(window.appboyBridge&&typeof appboyBridge.closeMessage==='function'){appboyBridge.closeMessage();return;}
}catch(e){}}
window.brazeDismiss=brazeDismiss;
window.addEventListener('load',function(){setTimeout(function(){brazeDismiss();},4000);});
})();<\/script>`
}

/** Bottom Slide Up: IAM과 동일 — `bottom` 키프레임 퇴장 후 bridge 닫기 (buildBraze 이후에 삽입) */
function buildBottomSlideUpDismissOverride() {
  const fallbackMs = Math.max(400, BOTTOM_SLIDE_UP_ANIM_DURATION_S * 1000 + 200)
  return `<script>(function(){
var _prev=window.brazeDismiss;
function doClose(){try{
if(window.brazeBridge&&typeof brazeBridge.closeMessage==='function'){brazeBridge.closeMessage();return;}
if(window.appboyBridge&&typeof appboyBridge.closeMessage==='function'){appboyBridge.closeMessage();return;}
}catch(e){}}
window.brazeDismiss=function(){
var slide=document.querySelector("[data-bsu-slide]");
if(!slide){_prev();return;}
if(slide.getAttribute("data-bsu-exit")==="1"){_prev();return;}
slide.setAttribute("data-bsu-exit","1");
var ios=/ipad|iphone|ipod|macintosh/i.test(navigator.userAgent||"");
slide.classList.remove("bsu-bottom-slide-up","bsu-ios-bottom-slide-up");
slide.classList.add(ios?"bsu-ios-bottom-slide-down":"bsu-bottom-slide-down");
var called=0;
function finish(){
if(called++)return;
slide.removeAttribute("data-bsu-exit");
slide.removeEventListener("animationend",onEnd);
doClose();
}
function onEnd(e){
var n=String((e&&e.animationName)||"");
if(n.indexOf("SlideDown")===-1)return;
finish();
}
slide.addEventListener("animationend",onEnd);
setTimeout(finish,${fallbackMs});
};
})();<\/script>`
}

function finalizeHtmlExport(state, visualHtml) {
  return wrapHtmlDocument(state, visualHtml + buildBrazeBridgeAndAutoCloseScript())
}

const BUTTON_TEXT_CLAMP =
  'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;line-height:1.2;text-align:center;max-width:100%;'

function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 비어 있지 않은 경우에만 `onclick`으로 `window.location` 할당 (JSON으로 이스케이프) */
function buttonNavigateOnclickAttr(url) {
  const u = String(url ?? '').trim()
  if (!u) return ''
  const json = JSON.stringify(u)
  return ` onclick="(function(){var u=${json};if(u)try{window.location.href=u;}catch(e){}})()"`
}

const CLOSE_ICON_SVG =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>'

const SMV_TEXT_FONT =
  "'Inter',system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans KR',sans-serif"

/**
 * Carousel SMV export — IAM Studio·WebView와 동일하게 jQuery + Slick
 * (네이티브 overflow-x 스크롤은 WebView에서 막히는 경우가 많음)
 */
function smvSlickAssets(slideH, slideW, gapHalf, r) {
  return (
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"/>' +
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"/>' +
    `<style>
.smv-slick-wrap{position:relative;width:100%;}
.smv-slick-wrap .slick-list,.smv-slick-wrap .slick-track,.smv-slick-wrap .slick-slide{height:${slideH}px;}
.smv-slick-wrap .slick-slide>div{height:100%;}
.smv-slick-wrap .smv-slick-frame{width:${slideW}px;margin:0 ${gapHalf}px;height:100%;border-radius:${r}px;overflow:hidden;box-sizing:border-box;}
.smv-slick-wrap .smv-slick-frame img{width:100%;height:100%;object-fit:cover;display:block;-webkit-user-drag:none;user-select:none;}
</style>`
  )
}

/**
 * @param {object} state
 * @param {object} t
 * @returns {string}
 */
function getSlideModalVerticalHtml(state, t) {
  if (!slideVerticalHasAllImages(state.slideVerticalImages)) {
    return wrapMinimalUtf8Doc(
      '<!-- Slide_Modal_Vertical: Fill at least 3 slots and every open slot with an image before exporting HTML. -->'
    )
  }
  if (
    !slideVerticalHasRequiredText(
      state.slideVerticalTitle,
      state.slideVerticalDescription,
      state.popupType
    )
  ) {
    return wrapMinimalUtf8Doc('<!-- Carousel SMV: Enter a title before exporting HTML. -->')
  }
  const slideH = getSmvCarouselSlideHeight(state.popupType)
  const popupW = SMV_MODAL_W
  const popupH = computeSmvWhitePanelHeightPx(
    state.slideVerticalTitle,
    state.slideVerticalDescription,
    slideH,
    true
  )
  const r = POPUP_CONTAINER_BORDER_RADIUS
  const images = normalizeSlideVerticalImages(state.slideVerticalImages)
  const slideIdx = Math.min(
    Math.max(0, state.slideVerticalPreviewIndex ?? 0),
    images.length - 1
  )
  const total = images.length
  const dotsHtml = images
    .map((_, i) => {
      const bg = i === slideIdx ? '#00DC64' : '#ffffff'
      return `<span data-smv-dot="${i}" style="width:6px;height:6px;border-radius:50%;background-color:${bg};transition:background-color 0.35s ease;flex-shrink:0;"></span>`
    })
    .join('')
  const dontShowAgain = escapeHtml(t.dontShowAgain || "Don't show again")
  const closeText = escapeHtml(t.close || 'Close')
  const title = escapeHtml(state.slideVerticalTitle ?? '')
  const desc = escapeHtml(state.slideVerticalDescription ?? '')
  const btnLabel = escapeHtml(state.button1?.label ?? 'Read Now')

  const titleLines = measureSmvVisualLineCount(state.slideVerticalTitle ?? '', {
    widthPx: SMV_COLUMN_W,
    lineHeightPx: 28,
    fontSizePx: 20,
    fontWeight: 700,
    fontFamily: SMV_PREVIEW_FONT,
    maxLines: 2,
  })
  const descLines = measureSmvVisualLineCount(state.slideVerticalDescription ?? '', {
    widthPx: SMV_COLUMN_W,
    lineHeightPx: 20,
    fontSizePx: 13,
    fontWeight: 400,
    fontFamily: SMV_PREVIEW_FONT,
    maxLines: 2,
  })
  const titleBlockStyle =
    titleLines === 0
      ? 'display:none;'
      : `word-break:break-word;white-space:pre-wrap;line-height:28px;font-size:20px;font-weight:700;color:#000;margin:0;width:100%;text-align:center;font-family:${SMV_TEXT_FONT};display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${titleLines};overflow:hidden;text-overflow:ellipsis;max-height:${titleLines * 28}px;`
  const descBlockStyle =
    descLines === 0
      ? 'display:none;'
      : `word-break:break-word;white-space:pre-wrap;line-height:20px;font-size:13px;font-weight:400;color:#000;margin:0;width:100%;text-align:center;font-family:${SMV_TEXT_FONT};display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${descLines};overflow:hidden;text-overflow:ellipsis;max-height:${descLines * 20}px;`

  const gapHalf = SMV_CAROUSEL_GAP / 2
  const itemsHtmlSlick = images
    .map((srcRaw) => {
      const src = escapeHtml(srcRaw)
      return `<div><div class="smv-slick-frame"><img src="${src}" alt="" draggable="false"/></div></div>`
    })
    .join('')

  const padX2 = SMV_CONTENT_PAD_X * 2
  const descSectionHtml = `<div style="height:${SMV_TITLE_DESC_GAP}px;flex-shrink:0;"></div>
      <div style="width:100%;max-width:${SMV_COLUMN_W}px;flex-shrink:0;box-sizing:border-box;"><p style="${descBlockStyle}">${desc}</p></div>`

  const slickHead = smvSlickAssets(slideH, SMV_CAROUSEL_SLIDE_W, gapHalf, SMV_SLIDE_RADIUS)
  const jqSrc = 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js'
  const slickSrc = 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js'
  const n = total
  const smvSlickInit = `<script>(function(){
var N=${n};
function syncDots(idx){
var dots=document.querySelectorAll("[data-smv-dot]");
if(!dots.length)return;
var i=((idx%N)+N)%N;
for(var j=0;j<dots.length;j++){
dots[j].style.backgroundColor=(j===i)?"#00DC64":"#ffffff";
}
}
function boot(){
if(typeof window.jQuery==="undefined"||!window.jQuery.fn||!window.jQuery.fn.slick){setTimeout(boot,50);return;}
var $s=window.jQuery(".smv-slick-slider");
if(!$s.length)return;
$s.slick({
arrows:false,
dots:false,
infinite:true,
speed:300,
touchThreshold:300,
slidesToShow:1,
slidesToScroll:1,
initialSlide:${slideIdx},
swipe:true,
draggable:true,
centerMode:true,
variableWidth:true,
edgeFriction:0.15
});
$s.on("afterChange",function(ev,slick,currentSlide){
syncDots(typeof currentSlide==="number"?currentSlide:0);
});
syncDots(${slideIdx});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
else boot();
})();<\/script>`

  const body = `<!-- Popup ${popupW}x${popupH} (slide_modal_vertical, slick export) -->
${slickHead}
${exportIamViewportShell(
    state,
    popupW,
    `  <div style="position:relative;width:100%;box-sizing:border-box;">
  <div style="position:relative;width:100%;max-width:${popupW}px;min-height:${Math.round(popupH)}px;height:auto;background:#ffffff;border-radius:${r}px;overflow:hidden;box-sizing:border-box;">
    <div style="display:flex;flex-direction:column;align-items:center;padding-top:${SMV_PAD_TOP}px;padding-bottom:${SMV_PAD_BOTTOM}px;padding-left:${SMV_CONTENT_PAD_X}px;padding-right:${SMV_CONTENT_PAD_X}px;box-sizing:border-box;">
      <div style="width:calc(100% + ${padX2}px);margin-left:-${SMV_CONTENT_PAD_X}px;margin-right:-${SMV_CONTENT_PAD_X}px;position:relative;flex-shrink:0;">
      <div class="smv-slick-wrap" style="position:relative;width:100%;height:${slideH}px;">
        <div class="smv-slick-slider">${itemsHtmlSlick}</div>
      </div>
      <div aria-hidden="true" style="position:absolute;left:0;top:0;right:0;width:100%;height:${slideH}px;pointer-events:none;z-index:15;">
        <div style="position:absolute;left:0;right:0;bottom:8px;display:flex;justify-content:center;align-items:center;gap:4px;pointer-events:none;">${dotsHtml}</div>
      </div>
      </div>
      <div style="height:${SMV_GAP_SLIDE_TEXT}px;flex-shrink:0;"></div>
      <div style="width:100%;max-width:${SMV_COLUMN_W}px;flex-shrink:0;box-sizing:border-box;"><p style="${titleBlockStyle}">${title}</p></div>
      ${descSectionHtml}
      <div style="height:${SMV_GAP_TEXT_BTN}px;flex-shrink:0;"></div>
      <button type="button"${buttonNavigateOnclickAttr(state.button1?.deeplink)} style="width:100%;max-width:${SMV_BTN_W}px;height:${SMV_BTN_H}px;border-radius:${SMV_BTN_RADIUS}px;background:${SMV_BTN_BG};color:#ffffff;font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-sizing:border-box;flex-shrink:0;">${btnLabel}</button>
    </div>
  </div>
  ${exportFooterRow(popupW, dontShowAgain, closeText)}
</div>`,
    { studioResponsiveShell: true }
  )}
<script src="${jqSrc}"><\/script>
<script src="${slickSrc}"><\/script>
${smvSlickInit}`
  return finalizeHtmlExport(state, body)
}

/**
 * Auto Square Slide — IAM Studio와 동일하게 jQuery + Slick 캐러셀 (export)
 * (네이티브 overflow 스크롤은 WebView/미리보기에서 막히는 경우가 많음)
 */
function slideModal11SlickAssets(popupW, popupH, r) {
  return (
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"/>' +
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"/>' +
    `<style>
.sm11-panel .sm11-slick-wrap{position:absolute;inset:0;}
.sm11-panel .sm11-slick-wrap .slick-list,
.sm11-panel .sm11-slick-wrap .slick-track,
.sm11-panel .sm11-slick-wrap .slick-slide{height:${popupH}px;}
.sm11-panel .sm11-slick-wrap .slick-slide>div{height:100%;}
.sm11-panel .sm11-slick-wrap .slick-slide img{width:100%;height:100%;object-fit:cover;display:block;border-radius:${r}px;-webkit-user-drag:none;}
</style>`
  )
}

function getSlideModal11Html(state, t, cfg) {
  const popupW = cfg.width
  const popupH = cfg.height
  const r = POPUP_CONTAINER_BORDER_RADIUS
  const landing11 = String(state.slideModal11Deeplink ?? '').trim()
  const imgNav = buttonNavigateOnclickAttr(state.slideModal11Deeplink)
  const imgCursor = landing11 ? 'cursor:pointer;' : ''
  const images = normalizeSlideModal11Images(state.slideImages).filter(Boolean)
  const n = images.length
  const slideIdx = Math.min(
    Math.max(0, state.slidePreviewIndex ?? 0),
    Math.max(0, n - 1)
  )
  const dontShowAgain = escapeHtml(t.dontShowAgain || "Don't show again")
  const closeText = escapeHtml(t.close || 'Close')

  const dotsHtml = images
    .map((_, i) => {
      const bg = i === slideIdx ? '#00DC64' : '#ffffff'
      return `<span data-sm11-dot="${i}" style="width:6px;height:6px;border-radius:50%;background-color:${bg};transition:background-color 0.35s ease;flex-shrink:0;"></span>`
    })
    .join('')

  const jqSrc = 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js'
  const slickSrc = 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js'

  if (n <= 1) {
    const src = images[0] != null ? escapeHtml(images[0]) : ''
    const singleImg = src
      ? `<img src="${src}" alt="" draggable="false" style="width:100%;height:100%;object-fit:cover;display:block;${imgCursor}"${imgNav}/>`
      : `<div style="width:100%;height:100%;background:${POPUP_EMPTY_BACKGROUND};"></div>`
    const singleCss = `<style>.sm11-panel-single{position:relative;width:${popupW}px;height:${popupH}px;border-radius:${r}px;overflow:hidden;box-sizing:border-box;}</style>`
    const body = `<!-- Popup ${popupW}x${popupH} (${cfg.id}, auto_square export, single) -->
${singleCss}
${exportIamViewportShell(
      state,
      popupW,
      `  <div data-sm11-export style="position:relative;width:100%;box-sizing:border-box;">
  <div class="sm11-panel sm11-panel-single" style="position:relative;width:${popupW}px;height:${popupH}px;background:transparent;box-sizing:border-box;">
    <div style="position:absolute;inset:0;">${singleImg}</div>
    <div aria-hidden="true" style="position:absolute;left:0;right:0;bottom:8px;z-index:15;display:flex;justify-content:center;align-items:center;gap:4px;pointer-events:none;">
      ${dotsHtml}
    </div>
  </div>
  ${exportFooterRow(popupW, dontShowAgain, closeText)}
</div>`
    )}
`
    return finalizeHtmlExport(state, body)
  }

  const itemsHtmlSlick = images
    .map((src) => {
      const esc = escapeHtml(src)
      return `<div><img src="${esc}" alt="" draggable="false" style="${imgCursor}"${imgNav}/></div>`
    })
    .join('')

  const slickHead = slideModal11SlickAssets(popupW, popupH, r)

  const slickInit = `<script>(function(){
var N=${n};
function syncDots(idx){
var dots=document.querySelectorAll("[data-sm11-dot]");
if(!dots.length)return;
var i=((idx%N)+N)%N;
for(var j=0;j<dots.length;j++){
dots[j].style.backgroundColor=(j===i)?"#00DC64":"#ffffff";
}
}
function boot(){
if(typeof window.jQuery==="undefined"||!window.jQuery.fn||!window.jQuery.fn.slick){setTimeout(boot,50);return;}
var $s=window.jQuery(".sm11-slick-slider");
if(!$s.length)return;
$s.slick({
arrows:false,
dots:false,
infinite:true,
speed:300,
touchThreshold:300,
slidesToShow:1,
slidesToScroll:1,
initialSlide:${slideIdx},
swipe:true,
draggable:true,
edgeFriction:0.15
});
$s.on("afterChange",function(ev,slick,currentSlide){syncDots(currentSlide);});
syncDots(${slideIdx});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
else boot();
})();<\/script>`

  const body = `<!-- Popup ${popupW}x${popupH} (${cfg.id}, auto_square slick export) -->
${slickHead}
${exportIamViewportShell(
    state,
    popupW,
    `  <div data-sm11-export style="position:relative;width:100%;box-sizing:border-box;">
  <div class="sm11-panel" style="position:relative;width:${popupW}px;height:${popupH}px;background:transparent;border-radius:${r}px;overflow:hidden;box-sizing:border-box;">
    <div class="sm11-slick-wrap">
      <div class="sm11-slick-slider slick_slider">${itemsHtmlSlick}</div>
    </div>
    <div aria-hidden="true" style="position:absolute;left:0;right:0;bottom:8px;z-index:15;display:flex;justify-content:center;align-items:center;gap:4px;pointer-events:none;">
      ${dotsHtml}
    </div>
  </div>
  ${exportFooterRow(popupW, dontShowAgain, closeText)}
</div>`
  )}
<script src="${jqSrc}"><\/script>
<script src="${slickSrc}"><\/script>
${slickInit}`
  return finalizeHtmlExport(state, body)
}

/**
 * @param {object} state
 * @param {object} t
 * @returns {string}
 */
function getSimpleIconModalHtml(state, t) {
  const isIcon = state.simpleIconVariant === SIMPLE_ICON_VARIANT_ICON
  if (
    !isIcon &&
    !state.imageSource
  ) {
    return wrapMinimalUtf8Doc(
      '<!-- Simple Icon Modal (Thumb type): Add a thumb image before exporting HTML. -->'
    )
  }
  if (
    !slideVerticalHasRequiredText(
      state.slideVerticalTitle,
      state.slideVerticalDescription,
      POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL
    )
  ) {
    return wrapMinimalUtf8Doc('<!-- Simple Icon Modal: Enter a title before exporting HTML. -->')
  }
  const mediaH = getSimpleIconMediaHeightPx(state)
  const popupH = computeSmvWhitePanelHeightPx(
    state.slideVerticalTitle,
    state.slideVerticalDescription,
    mediaH,
    true,
    SMV_SIMPLE_ICON_PAD_TOP
  )
  const popupW = SMV_MODAL_W
  const r = POPUP_CONTAINER_BORDER_RADIUS
  const dontShowAgain = escapeHtml(t.dontShowAgain || "Don't show again")
  const closeText = escapeHtml(t.close || 'Close')
  const title = escapeHtml(state.slideVerticalTitle ?? '')
  const desc = escapeHtml(state.slideVerticalDescription ?? '')
  const btnLabel = escapeHtml(state.button1?.label ?? 'Read Now')
  const noImageText = escapeHtml(t.noImage || 'No image')

  const titleLines = measureSmvVisualLineCount(state.slideVerticalTitle ?? '', {
    widthPx: SMV_COLUMN_W,
    lineHeightPx: 28,
    fontSizePx: 20,
    fontWeight: 700,
    fontFamily: SMV_PREVIEW_FONT,
    maxLines: 2,
  })
  const descLines = measureSmvVisualLineCount(state.slideVerticalDescription ?? '', {
    widthPx: SMV_COLUMN_W,
    lineHeightPx: 20,
    fontSizePx: 13,
    fontWeight: 400,
    fontFamily: SMV_PREVIEW_FONT,
    maxLines: 2,
  })
  const titleBlockStyle =
    titleLines === 0
      ? 'display:none;'
      : `word-break:break-word;white-space:pre-wrap;line-height:28px;font-size:20px;font-weight:700;color:#000;margin:0;width:100%;text-align:center;font-family:${SMV_TEXT_FONT};display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${titleLines};overflow:hidden;text-overflow:ellipsis;max-height:${titleLines * 28}px;`
  const descBlockStyle =
    descLines === 0
      ? 'display:none;'
      : `word-break:break-word;white-space:pre-wrap;line-height:20px;font-size:13px;font-weight:400;color:#000;margin:0;width:100%;text-align:center;font-family:${SMV_TEXT_FONT};display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${descLines};overflow:hidden;text-overflow:ellipsis;max-height:${descLines * 20}px;`

  const padX2 = SMV_CONTENT_PAD_X * 2
  const descSectionHtml = `<div style="height:${SMV_TITLE_DESC_GAP}px;flex-shrink:0;"></div>
      <div style="width:100%;max-width:${SMV_COLUMN_W}px;flex-shrink:0;box-sizing:border-box;"><p style="${descBlockStyle}">${desc}</p></div>`

  let mediaBlockHtml
  if (isIcon) {
    const src = escapeHtml(resolveExportAssetUrl(state, getSimpleIconPresetSrc(state.simpleIconPresetId)))
    mediaBlockHtml = `<div style="width:calc(100% + ${padX2}px);margin-left:-${SMV_CONTENT_PAD_X}px;margin-right:-${SMV_CONTENT_PAD_X}px;height:${mediaH}px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
        <img src="${src}" alt="" draggable="false" style="width:${SIMPLE_ICON_ICON_PX}px;height:${SIMPLE_ICON_ICON_PX}px;object-fit:contain;display:block;-webkit-user-drag:none;user-select:none;">
      </div>`
  } else {
    const tw = getSimpleIconThumbDimensions(state.simpleIconThumbSize ?? 'small')
    const inner =
      state.imageSource != null && String(state.imageSource).trim() !== ''
        ? `<img src="${escapeHtml(resolveExportAssetUrl(state, state.imageSource))}" alt="" draggable="false" style="width:100%;height:100%;object-fit:cover;display:block;-webkit-user-drag:none;user-select:none;">`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#a1a1aa;font-size:12px;background:${POPUP_EMPTY_BACKGROUND};">${noImageText}</div>`
    mediaBlockHtml = `<div style="width:calc(100% + ${padX2}px);margin-left:-${SMV_CONTENT_PAD_X}px;margin-right:-${SMV_CONTENT_PAD_X}px;height:${mediaH}px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
        <div style="width:${tw.width}px;height:${tw.height}px;overflow:hidden;border-radius:0;background:${POPUP_EMPTY_BACKGROUND};">${inner}</div>
      </div>`
  }

  const simpleBody = `<!-- Popup ${popupW}x${Math.round(popupH)} (simple_icon_modal, builder) -->
${exportIamViewportShell(
    state,
    popupW,
    `  <div style="position:relative;width:100%;box-sizing:border-box;">
  <div style="position:relative;width:100%;max-width:${popupW}px;min-height:${Math.round(popupH)}px;height:auto;background:#ffffff;border-radius:${r}px;overflow:hidden;box-sizing:border-box;">
    <div style="display:flex;flex-direction:column;align-items:center;padding-top:${SMV_SIMPLE_ICON_PAD_TOP}px;padding-bottom:${SMV_PAD_BOTTOM}px;padding-left:${SMV_CONTENT_PAD_X}px;padding-right:${SMV_CONTENT_PAD_X}px;box-sizing:border-box;">
      ${mediaBlockHtml}
      <div style="height:${SMV_GAP_SLIDE_TEXT}px;flex-shrink:0;"></div>
      <div style="width:100%;max-width:${SMV_COLUMN_W}px;flex-shrink:0;box-sizing:border-box;"><p style="${titleBlockStyle}">${title}</p></div>
      ${descSectionHtml}
      <div style="height:${SMV_GAP_TEXT_BTN}px;flex-shrink:0;"></div>
      <button type="button"${buttonNavigateOnclickAttr(state.button1?.deeplink)} style="width:100%;max-width:${SMV_BTN_W}px;height:${SMV_BTN_H}px;border-radius:${SMV_BTN_RADIUS}px;background:${SMV_BTN_BG};color:#ffffff;font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-sizing:border-box;flex-shrink:0;">${btnLabel}</button>
    </div>
  </div>
  ${exportFooterRow(popupW, dontShowAgain, closeText)}
</div>`,
    { studioResponsiveShell: true }
  )}
`
  return finalizeHtmlExport(state, simpleBody)
}

function getBottomSlideUpHtml(state, t) {
  const isIconType = state.popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP_ICON
  if (!isIconType && !state.imageSource) {
    return wrapMinimalUtf8Doc(
      '<!-- Bottom Slide Up: Add left image before exporting HTML. -->'
    )
  }
  if (!String(state.bottomSlideUpText ?? '').trim()) {
    return wrapMinimalUtf8Doc(
      '<!-- Bottom Slide Up: Enter description text before exporting HTML. -->'
    )
  }
  const mode = state.bottomSlideAppMode ?? 'light'
  const isLight = mode === 'light'
  const barBg = isLight ? '#000000' : '#F1F2F3'
  const textColor = isLight ? '#FFFFFF' : '#222222'
  const closeBg = isLight ? '#3D3D3D' : '#E3E3E4'
  const closeStroke = isLight ? '#F3F3F3' : '#222222'
  const closeBorder = 'none'

  const msg = escapeHtml(state.bottomSlideUpText ?? '')
  const landing = String(state.bottomSlideUpDeeplink ?? '').trim()
  const barPointer = landing ? 'cursor:pointer;' : ''
  const barOnclick = buttonNavigateOnclickAttr(state.bottomSlideUpDeeplink)
  const thumbSrc = getBottomSlideUpThumbSrc(state)
  const img = escapeHtml(resolveExportAssetUrl(state, thumbSrc ?? ''))
  const thumbPx = isIconType
    ? BOTTOM_SLIDE_UP_ICON_THUMB_PX
    : BOTTOM_SLIDE_UP_THUMB_PX
  const thumbRadius = `${BOTTOM_SLIDE_UP_THUMB_RADIUS}px`
  const thumbBoxBg = POPUP_EMPTY_BACKGROUND
  const thumbImgStyle = isIconType
    ? 'max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;display:block;'
    : 'width:100%;height:100%;object-fit:cover;display:block;'
  const thumbBoxStyle = isIconType
    ? `flex-shrink:0;width:${thumbPx}px;height:${thumbPx}px;border-radius:${thumbRadius};overflow:hidden;background:${thumbBoxBg};display:flex;align-items:center;justify-content:center;`
    : `flex-shrink:0;width:${thumbPx}px;height:${thumbPx}px;border-radius:${thumbRadius};overflow:hidden;background:${thumbBoxBg};`

  const W = BOTTOM_SLIDE_UP_SCREEN_W
  const variantLabel = isIconType ? 'icon' : 'character'

  const shellBg = '#ffffff'
  const fromB = BOTTOM_SLIDE_UP_ANIM_FROM_BOTTOM_PX
  const d = BOTTOM_SLIDE_UP_ANIM_DURATION_S
  const ease = BOTTOM_SLIDE_UP_ANIM_EASING
  const androidB = BOTTOM_SLIDE_UP_BOTTOM_ANDROID
  const iosB = BOTTOM_SLIDE_UP_BOTTOM

  const bsuBody = `<!-- Bottom Slide Up (${mode}, ${variantLabel}) — IAM bottom 키프레임·${d}s ${ease} -->
<style>
@keyframes bsuBottomSlideUp{from{bottom:${fromB}px}to{bottom:${androidB}px}}
@keyframes bsuIosBottomSlideUp{from{bottom:${fromB}px}to{bottom:${iosB}px}}
@keyframes bsuBottomSlideDown{from{bottom:${androidB}px}to{bottom:${fromB}px}}
@keyframes bsuIosBottomSlideDown{from{bottom:${iosB}px}to{bottom:${fromB}px}}
.bsu-bottom-slide-up{animation:bsuBottomSlideUp ${d}s ${ease} forwards;}
.bsu-ios-bottom-slide-up{animation:bsuIosBottomSlideUp ${d}s ${ease} forwards;}
.bsu-bottom-slide-down{animation:bsuBottomSlideDown ${d}s ${ease} forwards;}
.bsu-ios-bottom-slide-down{animation:bsuIosBottomSlideDown ${d}s ${ease} forwards;}
[data-bsu-slide]{position:absolute;left:0;right:0;z-index:1;display:flex;justify-content:center;align-items:center;box-sizing:border-box;padding:0 ${BOTTOM_SLIDE_UP_OUTER_PAD_H}px;min-height:${BOTTOM_SLIDE_UP_BAR_HEIGHT}px;}
@media screen and (min-width:${BOTTOM_SLIDE_UP_WIDE_MIN_W}px){
  [data-bsu-slide]{padding-left:0!important;padding-right:0!important;}
}
</style>
${exportIamViewportShell(
    state,
    W,
    `  <div style="position:relative;width:100%;box-sizing:border-box;">
  <div style="position:relative;width:100%;max-width:${W}px;min-height:100vh;margin:0 auto;overflow:hidden;font-family:${SMV_TEXT_FONT};box-sizing:border-box;background:${shellBg};">
  <div data-bsu-slide>
    <div data-bsu-root style="width:100%;max-width:${BOTTOM_SLIDE_UP_CONTENT_MAX_W}px;height:${BOTTOM_SLIDE_UP_BAR_HEIGHT}px;display:flex;flex-direction:row;align-items:center;box-sizing:border-box;padding-left:${BOTTOM_SLIDE_UP_PAD_X}px;padding-right:${BOTTOM_SLIDE_UP_PAD_X}px;gap:${BOTTOM_SLIDE_UP_GAP}px;border-radius:${BOTTOM_SLIDE_UP_RADIUS}px;background:${barBg};${barPointer}"${barOnclick}>
    <div style="${thumbBoxStyle}">
      <img src="${img}" alt="" style="${thumbImgStyle}">
    </div>
    <div style="flex:1;min-width:0;display:flex;align-items:center;">
      <p style="margin:0;width:100%;font-size:13px;line-height:18px;font-weight:500;color:${textColor};white-space:pre-wrap;word-break:break-word;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;">${msg}</p>
    </div>
    <button type="button" onclick="if(event&&event.stopPropagation)event.stopPropagation();brazeDismiss()" aria-label="${escapeHtml(t.close || 'Close')}" style="flex-shrink:0;width:${BOTTOM_SLIDE_UP_CLOSE_PX}px;height:${BOTTOM_SLIDE_UP_CLOSE_PX}px;border-radius:50%;border:${closeBorder};padding:0;cursor:pointer;background:${closeBg};display:flex;align-items:center;justify-content:center;color:${closeStroke};">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  </div>
  </div>
  </div>
</div>
<script>(function(){
function boot(){
var s=document.querySelector("[data-bsu-slide]");
if(!s)return;
var ios=/ipad|iphone|ipod|macintosh/i.test(navigator.userAgent||"");
s.classList.add(ios?"bsu-ios-bottom-slide-up":"bsu-bottom-slide-up");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();<\/script>`
  )}
`
  return wrapHtmlDocument(
    state,
    bsuBody + buildBrazeBridgeAndAutoCloseScript() + buildBottomSlideUpDismissOverride()
  )
}

/**
 * @param {object} state - App state (popupType, button1, button2, …)
 * @param {object} t - translations
 * @returns {string} HTML string
 */
export function getPopupHtml(state, t = {}) {
  const cfg = getPopupTypeConfig(state.popupType)
  if (
    cfg.id === POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL ||
    cfg.id === POPUP_TYPE_IDS.CAROUSEL_THUMB_HORIZONTAL ||
    cfg.id === POPUP_TYPE_IDS.CAROUSEL_SNS ||
    cfg.id === POPUP_TYPE_IDS.CAROUSEL_STORYTELLING
  ) {
    return getSlideModalVerticalHtml(state, t)
  }
  if (cfg.id === POPUP_TYPE_IDS.SIMPLE_ICON_MODAL) {
    return getSimpleIconModalHtml(state, t)
  }
  if (
    cfg.id === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP ||
    cfg.id === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP_ICON
  ) {
    return getBottomSlideUpHtml(state, t)
  }
  if (isSlideModalAutoSquareType(cfg.id)) {
    if (!slideModal11HasAllImages(state.slideImages)) {
      return wrapMinimalUtf8Doc(
        '<!-- Auto Square Slide: Add at least 2 images and fill every open slot (max 6) before exporting HTML. -->'
      )
    }
    return getSlideModal11Html(state, t, cfg)
  }
  const popupW = cfg.width
  const popupH = cfg.height
  const imgSrc = state.imageSource
  const hasImage = Boolean(imgSrc)
  const showButtons = (state.buttonCount ?? 1) >= 1 && !cfg.noButtons
  const noImageText = escapeHtml(t.noImage || '이미지 없음')
  const dontShowAgain = escapeHtml(t.dontShowAgain || "Don't show again")
  const closeText = escapeHtml(t.close || 'Close')
  const emptyBg = POPUP_EMPTY_BACKGROUND

  const bgContent = hasImage
    ? `<img src="${escapeHtml(resolveExportAssetUrl(state, imgSrc))}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">`
    : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#a1a1aa;font-size:14px;background:${emptyBg};">${noImageText}</div>`

  const isTwo = (state.buttonCount ?? 1) === 2
  const btn1Label = escapeHtml(state.button1?.label ?? '확인')
  const btn2Label = escapeHtml(state.button2?.label ?? '취소')
  const btn1Bg = state.button1?.bgColor ?? '#005c7a'
  const btn2Bg = state.button2?.bgColor ?? '#1d8637'
  const btn1Fg = escapeHtml(state.button1?.textColor ?? '#ffffff')
  const btn2Fg = escapeHtml(state.button2?.textColor ?? '#ffffff')

  const btnPad = `padding-left:${BUTTON_HORIZONTAL_PADDING}px;padding-right:${BUTTON_HORIZONTAL_PADDING}px;box-sizing:border-box;`
  const btnLabel = (label) =>
    `<span style="${BUTTON_TEXT_CLAMP}">${label}</span>`

  const btn1Nav = buttonNavigateOnclickAttr(state.button1?.deeplink)
  const btn2Nav = buttonNavigateOnclickAttr(state.button2?.deeplink)
  const buttonsHtml = isTwo
    ? `
    <button type="button"${btn1Nav} style="flex:1 1 0;min-width:0;max-width:${DUAL_BUTTON_WIDTH}px;height:${BUTTON_HEIGHT}px;border-radius:${BUTTON_RADIUS}px;background-color:${btn1Bg};color:${btn1Fg};font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;${btnPad}">${btnLabel(btn1Label)}</button>
    <button type="button"${btn2Nav} style="flex:1 1 0;min-width:0;max-width:${DUAL_BUTTON_WIDTH}px;height:${BUTTON_HEIGHT}px;border-radius:${BUTTON_RADIUS}px;background-color:${btn2Bg};color:${btn2Fg};font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;${btnPad}">${btnLabel(btn2Label)}</button>
  `
    : `
    <button type="button"${btn1Nav} style="width:100%;max-width:${SINGLE_BUTTON_WIDTH}px;height:${BUTTON_HEIGHT}px;border-radius:${BUTTON_RADIUS}px;background-color:${btn1Bg};color:${btn1Fg};font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;${btnPad}">${btnLabel(btn1Label)}</button>
  `

  const gapStyle = isTwo ? `gap:${DUAL_BUTTON_GAP}px;` : ''
  const r = POPUP_CONTAINER_BORDER_RADIUS
  const btnEdgeStyle =
    cfg.buttonBottom != null
      ? `bottom:${cfg.buttonBottom}px;`
      : `top:${cfg.buttonTop}px;`
  const btnRowJustify = isTwo ? 'space-between' : 'center'

  const innerBgLayer = `<div style="position:absolute;inset:0;z-index:0;background:transparent;">${bgContent}</div>`

  const buttonsBlock = showButtons
    ? `<div style="position:absolute;left:0;right:0;${btnEdgeStyle}height:${BUTTON_HEIGHT}px;display:flex;align-items:center;justify-content:${btnRowJustify};box-sizing:border-box;width:100%;padding:0 20px;${gapStyle}z-index:10;">
      ${buttonsHtml.trim()}
    </div>`
    : ''

  const defaultBody = `<!-- Popup ${popupW}x${popupH} (${cfg.id}, builder) -->
${exportIamViewportShell(
    state,
    popupW,
    `  <div style="position:relative;width:100%;box-sizing:border-box;">
  <div style="position:relative;width:100%;max-width:${popupW}px;margin:0 auto;box-sizing:border-box;">
  <div style="position:relative;z-index:20;width:100%;max-width:${popupW}px;height:${popupH}px;background:transparent;border-radius:${r}px;overflow:hidden;box-sizing:border-box;">
    ${innerBgLayer}
    ${buttonsBlock}
  </div>
  ${exportFooterRow(popupW, dontShowAgain, closeText)}
</div>
</div>`
  )}
`
  return finalizeHtmlExport(state, defaultBody)
}

