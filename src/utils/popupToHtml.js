/**
 * 현재 팝업 state를 인라인 스타일 기반 HTML 문자열로 변환 (복사용)
 */
import {
  BOTTOM_SLIDE_UP_BAR_HEIGHT,
  BOTTOM_SLIDE_UP_BOTTOM,
  BOTTOM_SLIDE_UP_CLOSE_PX,
  BOTTOM_SLIDE_UP_GAP,
  BOTTOM_SLIDE_UP_MARGIN_H,
  BOTTOM_SLIDE_UP_PAD_X,
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
  getSmvCarouselTrack,
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

const CLOSE_ICON_SVG =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>'

const SMV_TEXT_FONT =
  "'Inter',system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans KR',sans-serif"
function smvCarouselStyles(carouselSlideW) {
  return (
    '<style>.smv-hide-scrollbar{scrollbar-width:none;-ms-overflow-style:none}.smv-hide-scrollbar::-webkit-scrollbar{width:0;height:0}' +
    '.smv-carousel-view{scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-x;scroll-behavior:smooth}' +
    '.smv-carousel-view.smv-carousel-instant{scroll-behavior:auto!important}' +
    `.smv-carousel-slide{flex:0 0 ${carouselSlideW}px;scroll-snap-align:center}</style>`
  )
}

/**
 * @param {object} state
 * @param {object} t
 * @returns {string}
 */
function getSlideModalVerticalHtml(state, t) {
  if (!slideVerticalHasAllImages(state.slideVerticalImages)) {
    return '<!-- Slide_Modal_Vertical: Fill at least 3 slots and every open slot with an image before exporting HTML. -->'
  }
  if (
    !slideVerticalHasRequiredText(
      state.slideVerticalTitle,
      state.slideVerticalDescription,
      state.popupType
    )
  ) {
    return '<!-- Carousel SMV: Enter a title before exporting HTML. -->'
  }
  const slideH = getSmvCarouselSlideHeight(state.popupType)
  const overlayRgba = `rgba(0,0,0,${(state.overlayOpacity ?? 70) / 100})`
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

  const trackSlides = getSmvCarouselTrack(images)
  const itemsHtml = trackSlides
    .map((item) => {
      const src = escapeHtml(item.src)
      return `<div class="smv-carousel-slide" style="height:${slideH}px;border-radius:${SMV_SLIDE_RADIUS}px;overflow:hidden;"><img src="${src}" alt="" draggable="false" style="width:100%;height:100%;object-fit:cover;display:block;-webkit-user-drag:none;user-select:none;"></div>`
    })
    .join('')

  const descSectionHtml = `<div style="height:${SMV_TITLE_DESC_GAP}px;flex-shrink:0;"></div>
      <div style="width:${SMV_COLUMN_W}px;flex-shrink:0;box-sizing:border-box;"><p style="${descBlockStyle}">${desc}</p></div>`

  const carouselCss = smvCarouselStyles(SMV_CAROUSEL_SLIDE_W)
  const initialTrackIdx = slideIdx + 1
  const n = total
  const smvCarouselScript = `<script>(function(){
var n=${n};
var el=document.querySelector("[data-smv-carousel]");
if(!el)return;
var track=el.firstElementChild;
if(!track)return;
var slides=track.children;
function centerIdx(){
  var vr=el.getBoundingClientRect();
  var mid=vr.left+vr.clientWidth/2;
  var best=0,bd=1e9;
  for(var i=0;i<slides.length;i++){
    var r=slides[i].getBoundingClientRect();
    var c=r.left+r.width/2;
    var d=Math.abs(c-mid);
    if(d<bd){bd=d;best=i;}
  }
  return best;
}
function logicalFromTrack(ti){
  if(ti===0)return n-1;
  if(ti===n+1)return 0;
  return ti-1;
}
function setDotsFromTrack(ti){
  var w=el.parentElement;
  if(!w)return;
  var d=w.querySelectorAll("[data-smv-dot]");
  var logical=logicalFromTrack(ti);
  for(var j=0;j<d.length;j++){
    d[j].style.backgroundColor=(j===logical)?"#00DC64":"#ffffff";
  }
}
function runInstant(fn,done){
  el.classList.add("smv-carousel-instant");
  try{fn();}finally{
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        el.classList.remove("smv-carousel-instant");
        if(done)done();
      });
    });
  }
}
var suppress=false;
function settle(){
  if(suppress)return;
  var ti=centerIdx();
  if(ti===0){
    suppress=true;
    runInstant(function(){
      if(slides[n])slides[n].scrollIntoView({inline:"center",block:"nearest",behavior:"auto"});
    },function(){suppress=false;});
    setDotsFromTrack(ti);
    return;
  }
  if(ti===n+1){
    suppress=true;
    runInstant(function(){
      if(slides[1])slides[1].scrollIntoView({inline:"center",block:"nearest",behavior:"auto"});
    },function(){suppress=false;});
    setDotsFromTrack(ti);
    return;
  }
  setDotsFromTrack(ti);
}
var t;
el.addEventListener("scroll",function(){
  clearTimeout(t);
  if(!suppress)setDotsFromTrack(centerIdx());
  t=setTimeout(settle,100);
},{passive:true});
runInstant(function(){
  if(slides[${initialTrackIdx}])slides[${initialTrackIdx}].scrollIntoView({inline:"center",block:"nearest",behavior:"auto"});
});
})();<\/script>`

  return `<!-- Popup ${popupW}x${popupH} (slide_modal_vertical, builder) -->
${carouselCss}
<div style="position:relative;width:${popupW}px;margin:0 auto;box-sizing:border-box;">
  <div style="position:absolute;inset:0;background:${overlayRgba};z-index:10;pointer-events:none;"></div>
  <div style="position:relative;z-index:20;width:${popupW}px;min-height:${Math.round(popupH)}px;height:auto;background:#ffffff;border-radius:${r}px;overflow:hidden;box-sizing:border-box;">
    <div style="display:flex;flex-direction:column;align-items:center;padding-top:${SMV_PAD_TOP}px;padding-bottom:${SMV_PAD_BOTTOM}px;padding-left:${SMV_CONTENT_PAD_X}px;padding-right:${SMV_CONTENT_PAD_X}px;box-sizing:border-box;">
      <div style="width:${SMV_MODAL_W}px;margin-left:-${SMV_CONTENT_PAD_X}px;margin-right:-${SMV_CONTENT_PAD_X}px;position:relative;flex-shrink:0;">
      <div data-smv-carousel="1" class="smv-hide-scrollbar smv-carousel-view" style="position:relative;width:${SMV_MODAL_W}px;height:${slideH}px;overflow-x:auto;overflow-y:hidden;">
        <div style="display:flex;flex-direction:row;gap:${SMV_CAROUSEL_GAP}px;height:100%;width:max-content;">
          ${itemsHtml}
        </div>
      </div>
      <div aria-hidden="true" style="position:absolute;left:0;top:0;width:${SMV_MODAL_W}px;height:${slideH}px;pointer-events:none;z-index:15;">
        <div style="position:absolute;left:0;right:0;bottom:8px;display:flex;justify-content:center;align-items:center;gap:4px;pointer-events:none;">${dotsHtml}</div>
      </div>
      </div>
      <div style="height:${SMV_GAP_SLIDE_TEXT}px;flex-shrink:0;"></div>
      <div style="width:${SMV_COLUMN_W}px;flex-shrink:0;box-sizing:border-box;"><p style="${titleBlockStyle}">${title}</p></div>
      ${descSectionHtml}
      <div style="height:${SMV_GAP_TEXT_BTN}px;flex-shrink:0;"></div>
      <button type="button" style="width:${SMV_BTN_W}px;height:${SMV_BTN_H}px;border-radius:${SMV_BTN_RADIUS}px;background:${SMV_BTN_BG};color:#ffffff;font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-sizing:border-box;flex-shrink:0;">${btnLabel}</button>
    </div>
  </div>
  <footer style="display:flex;align-items:center;justify-content:space-between;width:${popupW}px;min-height:20px;padding:12px 0 0 4px;box-sizing:border-box;">
    <button type="button" style="color:#fff;font-size:${FOOTER_FONT_SIZE}px;background:transparent;border:none;padding:0;cursor:pointer;">${dontShowAgain}</button>
    <button type="button" style="color:#fff;font-size:${FOOTER_FONT_SIZE}px;background:transparent;border:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:4px;">${closeText} ${CLOSE_ICON_SVG}</button>
  </footer>
</div>
${smvCarouselScript}`
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
    return '<!-- Simple Icon Modal (Thumb type): Add a thumb image before exporting HTML. -->'
  }
  if (
    !slideVerticalHasRequiredText(
      state.slideVerticalTitle,
      state.slideVerticalDescription,
      POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL
    )
  ) {
    return '<!-- Simple Icon Modal: Enter a title before exporting HTML. -->'
  }
  const mediaH = getSimpleIconMediaHeightPx(state)
  const popupH = computeSmvWhitePanelHeightPx(
    state.slideVerticalTitle,
    state.slideVerticalDescription,
    mediaH,
    true,
    SMV_SIMPLE_ICON_PAD_TOP
  )
  const overlayRgba = `rgba(0,0,0,${(state.overlayOpacity ?? 70) / 100})`
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

  const descSectionHtml = `<div style="height:${SMV_TITLE_DESC_GAP}px;flex-shrink:0;"></div>
      <div style="width:${SMV_COLUMN_W}px;flex-shrink:0;box-sizing:border-box;"><p style="${descBlockStyle}">${desc}</p></div>`

  let mediaBlockHtml
  if (isIcon) {
    const src = escapeHtml(getSimpleIconPresetSrc(state.simpleIconPresetId))
    mediaBlockHtml = `<div style="width:${SMV_MODAL_W}px;margin-left:-${SMV_CONTENT_PAD_X}px;margin-right:-${SMV_CONTENT_PAD_X}px;height:${mediaH}px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
        <img src="${src}" alt="" draggable="false" style="width:${SIMPLE_ICON_ICON_PX}px;height:${SIMPLE_ICON_ICON_PX}px;object-fit:contain;display:block;-webkit-user-drag:none;user-select:none;">
      </div>`
  } else {
    const tw = getSimpleIconThumbDimensions(state.simpleIconThumbSize ?? 'small')
    const inner =
      state.imageSource != null && String(state.imageSource).trim() !== ''
        ? `<img src="${escapeHtml(state.imageSource)}" alt="" draggable="false" style="width:100%;height:100%;object-fit:cover;display:block;-webkit-user-drag:none;user-select:none;">`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#a1a1aa;font-size:12px;background:${POPUP_EMPTY_BACKGROUND};">${noImageText}</div>`
    mediaBlockHtml = `<div style="width:${SMV_MODAL_W}px;margin-left:-${SMV_CONTENT_PAD_X}px;margin-right:-${SMV_CONTENT_PAD_X}px;height:${mediaH}px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
        <div style="width:${tw.width}px;height:${tw.height}px;overflow:hidden;border-radius:0;background:${POPUP_EMPTY_BACKGROUND};">${inner}</div>
      </div>`
  }

  return `<!-- Popup ${popupW}x${Math.round(popupH)} (simple_icon_modal, builder) -->
<div style="position:relative;width:${popupW}px;margin:0 auto;box-sizing:border-box;">
  <div style="position:absolute;inset:0;background:${overlayRgba};z-index:10;pointer-events:none;"></div>
  <div style="position:relative;z-index:20;width:${popupW}px;min-height:${Math.round(popupH)}px;height:auto;background:#ffffff;border-radius:${r}px;overflow:hidden;box-sizing:border-box;">
    <div style="display:flex;flex-direction:column;align-items:center;padding-top:${SMV_SIMPLE_ICON_PAD_TOP}px;padding-bottom:${SMV_PAD_BOTTOM}px;padding-left:${SMV_CONTENT_PAD_X}px;padding-right:${SMV_CONTENT_PAD_X}px;box-sizing:border-box;">
      ${mediaBlockHtml}
      <div style="height:${SMV_GAP_SLIDE_TEXT}px;flex-shrink:0;"></div>
      <div style="width:${SMV_COLUMN_W}px;flex-shrink:0;box-sizing:border-box;"><p style="${titleBlockStyle}">${title}</p></div>
      ${descSectionHtml}
      <div style="height:${SMV_GAP_TEXT_BTN}px;flex-shrink:0;"></div>
      <button type="button" style="width:${SMV_BTN_W}px;height:${SMV_BTN_H}px;border-radius:${SMV_BTN_RADIUS}px;background:${SMV_BTN_BG};color:#ffffff;font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-sizing:border-box;flex-shrink:0;">${btnLabel}</button>
    </div>
  </div>
  <footer style="display:flex;align-items:center;justify-content:space-between;width:${popupW}px;min-height:20px;padding:12px 0 0 4px;box-sizing:border-box;">
    <button type="button" style="color:#fff;font-size:${FOOTER_FONT_SIZE}px;background:transparent;border:none;padding:0;cursor:pointer;">${dontShowAgain}</button>
    <button type="button" style="color:#fff;font-size:${FOOTER_FONT_SIZE}px;background:transparent;border:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:4px;">${closeText} ${CLOSE_ICON_SVG}</button>
  </footer>
</div>`
}

function getBottomSlideUpHtml(state, t) {
  const isIconType = state.popupType === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP_ICON
  if (!isIconType && !state.imageSource) {
    return '<!-- Bottom Slide Up: Add left image before exporting HTML. -->'
  }
  if (!String(state.bottomSlideUpText ?? '').trim()) {
    return '<!-- Bottom Slide Up: Enter description text before exporting HTML. -->'
  }
  const mode = state.bottomSlideAppMode ?? 'light'
  const isLight = mode === 'light'
  const overlayRgba = `rgba(0,0,0,${(state.overlayOpacity ?? 70) / 100})`
  const barBg = isLight ? '#000000' : '#F1F2F3'
  const textColor = isLight ? '#FFFFFF' : '#222222'
  const closeBg = isLight ? '#3D3D3D' : '#E3E3E4'
  const closeStroke = isLight ? '#F3F3F3' : '#222222'
  const closeBorder = 'none'

  const msg = escapeHtml(state.bottomSlideUpText ?? '')
  const thumbSrc = getBottomSlideUpThumbSrc(state)
  const img = escapeHtml(thumbSrc ?? '')
  const thumbPx = isIconType
    ? BOTTOM_SLIDE_UP_ICON_THUMB_PX
    : BOTTOM_SLIDE_UP_THUMB_PX
  const thumbRadius = `${BOTTOM_SLIDE_UP_THUMB_RADIUS}px`
  const thumbImgStyle = isIconType
    ? 'max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;display:block;'
    : 'width:100%;height:100%;object-fit:cover;display:block;'
  const thumbBoxStyle = isIconType
    ? `flex-shrink:0;width:${thumbPx}px;height:${thumbPx}px;border-radius:${thumbRadius};overflow:hidden;background:${POPUP_EMPTY_BACKGROUND};display:flex;align-items:center;justify-content:center;`
    : `flex-shrink:0;width:${thumbPx}px;height:${thumbPx}px;border-radius:${thumbRadius};overflow:hidden;background:${POPUP_EMPTY_BACKGROUND};`

  const W = 390
  const H = 844
  const variantLabel = isIconType ? 'icon' : 'character'

  return `<!-- Bottom Slide Up (${mode}, ${variantLabel}) -->
<style>@keyframes bsu-up{from{transform:translate3d(0,72px,0);opacity:0}to{transform:translate3d(0,0,0);opacity:1}}</style>
<div style="position:relative;width:${W}px;height:${H}px;background:#ffffff;margin:0 auto;overflow:hidden;font-family:${SMV_TEXT_FONT};box-sizing:border-box;">
  <div aria-hidden="true" style="position:absolute;inset:0;background:${overlayRgba};pointer-events:none;"></div>
  <div data-bsu-root style="position:absolute;left:${BOTTOM_SLIDE_UP_MARGIN_H}px;right:${BOTTOM_SLIDE_UP_MARGIN_H}px;bottom:${BOTTOM_SLIDE_UP_BOTTOM}px;width:calc(100% - ${BOTTOM_SLIDE_UP_MARGIN_H * 2}px);max-width:${W - BOTTOM_SLIDE_UP_MARGIN_H * 2}px;height:${BOTTOM_SLIDE_UP_BAR_HEIGHT}px;z-index:1;display:flex;flex-direction:row;align-items:center;box-sizing:border-box;padding-left:${BOTTOM_SLIDE_UP_PAD_X}px;padding-right:${BOTTOM_SLIDE_UP_PAD_X}px;gap:${BOTTOM_SLIDE_UP_GAP}px;border-radius:${BOTTOM_SLIDE_UP_RADIUS}px;background:${barBg};animation:bsu-up 0.3s cubic-bezier(0.22,1,0.36,1) both;">
    <div style="${thumbBoxStyle}">
      <img src="${img}" alt="" style="${thumbImgStyle}">
    </div>
    <div style="flex:1;min-width:0;display:flex;align-items:center;">
      <p style="margin:0;width:100%;font-size:13px;line-height:18px;font-weight:500;color:${textColor};white-space:pre-wrap;word-break:break-word;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;">${msg}</p>
    </div>
    <button type="button" onclick="this.closest('[data-bsu-root]').style.display='none'" aria-label="${escapeHtml(t.close || 'Close')}" style="flex-shrink:0;width:${BOTTOM_SLIDE_UP_CLOSE_PX}px;height:${BOTTOM_SLIDE_UP_CLOSE_PX}px;border-radius:50%;border:${closeBorder};padding:0;cursor:pointer;background:${closeBg};display:flex;align-items:center;justify-content:center;color:${closeStroke};">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  </div>
</div>`
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
  if (
    isSlideModalAutoSquareType(cfg.id) &&
    !slideModal11HasAllImages(state.slideImages)
  ) {
    return '<!-- Auto Square Slide: Add at least 2 images and fill every open slot (max 6) before exporting HTML. -->'
  }
  const overlayRgba = `rgba(0,0,0,${(state.overlayOpacity ?? 70) / 100})`
  const popupW = cfg.width
  const popupH = cfg.height
  const isSlideModal = isSlideModalAutoSquareType(cfg.id)
  const slideImages = isSlideModal
    ? normalizeSlideModal11Images(state.slideImages)
    : state.slideImages || []
  const slideIdx = Math.min(
    Math.max(0, state.slidePreviewIndex ?? 0),
    Math.max(0, slideImages.length - 1)
  )
  const slideSrc = slideImages.length ? slideImages[slideIdx] : null
  const imgSrc = state.imageSource
  const displaySrc = isSlideModal ? slideSrc : imgSrc
  const hasImage = Boolean(displaySrc)
  const showButtons = (state.buttonCount ?? 1) >= 1 && !cfg.noButtons
  const noImageText = escapeHtml(t.noImage || '이미지 없음')
  const dontShowAgain = escapeHtml(t.dontShowAgain || "Don't show again")
  const closeText = escapeHtml(t.close || 'Close')
  const emptyBg = POPUP_EMPTY_BACKGROUND

  const slidePaginationHtml =
    isSlideModal && slideImages.length > 0
      ? `<div aria-hidden="true" style="position:absolute;left:0;right:0;bottom:8px;z-index:15;display:flex;justify-content:center;align-items:center;gap:4px;pointer-events:none;">${slideImages
          .map((_, i) => {
            const bg = i === slideIdx ? '#00DC64' : '#ffffff'
            return `<span style="width:6px;height:6px;border-radius:50%;background-color:${bg};transition:background-color 0.35s ease;flex-shrink:0;"></span>`
          })
          .join('')}</div>`
      : ''

  const bgContent = hasImage
    ? `<img src="${escapeHtml(displaySrc)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">`
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

  const buttonsHtml = isTwo
    ? `
    <button type="button" style="width:${DUAL_BUTTON_WIDTH}px;height:${BUTTON_HEIGHT}px;border-radius:${BUTTON_RADIUS}px;background-color:${btn1Bg};color:${btn1Fg};font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;${btnPad}">${btnLabel(btn1Label)}</button>
    <button type="button" style="width:${DUAL_BUTTON_WIDTH}px;height:${BUTTON_HEIGHT}px;border-radius:${BUTTON_RADIUS}px;background-color:${btn2Bg};color:${btn2Fg};font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;${btnPad}">${btnLabel(btn2Label)}</button>
  `
    : `
    <button type="button" style="width:${SINGLE_BUTTON_WIDTH}px;height:${BUTTON_HEIGHT}px;border-radius:${BUTTON_RADIUS}px;background-color:${btn1Bg};color:${btn1Fg};font-size:15px;font-weight:500;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;${btnPad}">${btnLabel(btn1Label)}</button>
  `

  const gapStyle = isTwo ? `gap:${DUAL_BUTTON_GAP}px;` : ''
  const r = POPUP_CONTAINER_BORDER_RADIUS
  const btnPosStyle =
    cfg.buttonBottom != null
      ? `left:50%;transform:translateX(-50%);bottom:${cfg.buttonBottom}px;`
      : `left:50%;transform:translateX(-50%);top:${cfg.buttonTop}px;`

  const innerBgLayer = `<div style="position:absolute;inset:0;z-index:0;background:transparent;">${bgContent}</div>`

  const buttonsBlock = showButtons
    ? `<div style="position:absolute;${btnPosStyle}height:${BUTTON_HEIGHT}px;display:flex;align-items:center;justify-content:center;${gapStyle}z-index:10;">
      ${buttonsHtml.trim()}
    </div>`
    : ''

  return `<!-- Popup ${popupW}x${popupH} (${cfg.id}, builder) -->
<div style="position:relative;width:${popupW}px;margin:0 auto;box-sizing:border-box;">
  <div style="position:absolute;inset:0;background:${overlayRgba};z-index:10;pointer-events:none;"></div>
  <div style="position:relative;z-index:20;width:${popupW}px;height:${popupH}px;background:transparent;border-radius:${r}px;overflow:hidden;box-sizing:border-box;">
    ${innerBgLayer}
    ${slidePaginationHtml}
    ${buttonsBlock}
  </div>
  <footer style="display:flex;align-items:center;justify-content:space-between;width:${popupW}px;min-height:20px;padding:12px 0 0 4px;box-sizing:border-box;">
    <button type="button" style="color:#fff;font-size:${FOOTER_FONT_SIZE}px;background:transparent;border:none;padding:0;cursor:pointer;">${dontShowAgain}</button>
    <button type="button" style="color:#fff;font-size:${FOOTER_FONT_SIZE}px;background:transparent;border:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:4px;">${closeText} ${CLOSE_ICON_SVG}</button>
  </footer>
</div>`
}
