import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import ControlPanel from './components/ControlPanel'
import Preview from './components/Preview'
import PreviewDevicePicker from './components/PreviewDevicePicker'
import {
  getPreviewDevicePreset,
  PREVIEW_DEVICE_PRESET_DEFAULT_ID,
} from './config/previewDevicePresets'
import { getT } from './translations'
import { getPopupHtml } from './utils/popupToHtml'
import { compressImageDataUrlForExport } from './utils/compressImageDataUrl'
import {
  getPopupUiGroupId,
  isSlideModalAutoSquareType,
  POPUP_TYPE_IDS,
  SLIDE_MODAL_11_MAX_IMAGES,
  SLIDE_MODAL_11_MIN_IMAGES,
  SLIDE_MODAL_VERTICAL_MIN_IMAGES,
  SLIDE_MODAL_VERTICAL_MAX_IMAGES,
  SMV_BTN_BG,
} from './config/popupTypes'
import {
  SIMPLE_ICON_ICON_DEFAULT_DESCRIPTION,
  SIMPLE_ICON_ICON_DEFAULT_TITLE,
  SIMPLE_ICON_VARIANT_ICON,
  SIMPLE_ICON_VARIANT_THUMB,
} from './config/simpleIcon'
import {
  normalizeSlideModal11Images,
  normalizeSlideModal11SlotKeys,
} from './utils/slideModal11'
import {
  newSmvSlotKey,
  normalizeSlideVerticalImages,
  normalizeSlideVerticalSlotKeys,
  remapSlideVerticalPreviewIndex,
  slideVerticalHasAllImages,
} from './utils/slideVertical'
import { getCopyHtmlInvalidMessage, isCopyHtmlValid } from './utils/copyHtmlValidation'

/** Choice Button Modal (1:1 · 3:4 · 3:5) 기본 버튼 배경 — 미리보기 텍스트는 흰색 고정 */
const CHOICE_BUTTON_MODAL_DEFAULT_BUTTON1_BG = '#005c7a'
const CHOICE_BUTTON_MODAL_DEFAULT_BUTTON2_BG = '#1d8637'

/** Carousel Storytelling Type 전환 시 기본 카피 */
const STORYTELLING_DEFAULT_TITLE = '<발톱앞의 기사> (띄어쓰기) 3장 요약해드려요!'
const STORYTELLING_DEFAULT_BUTTON_LABEL = '지금 바로 작품 보러가기'

/** Carousel Slide Modal — Thumb Type(Vertical·Horizontal·SNS) 기본 제목·설명 */
const CAROUSEL_THUMB_DEFAULT_TITLE = 'My Comeback as the Youngest Member'
const CAROUSEL_THUMB_DEFAULT_DESCRIPTION =
  'If you read New Series more than 3 times, you will receice 3 Coins.'

const DEFAULT_BOTTOM_SLIDE_UP_TEXT =
  '잠깐! 휴재의 아쉬움을 달래드릴게요!\n<마루는 강쥐> 지금 보러가기'

/** 캐러셀(Vertical / Horizontal / 1:1) 하위 전환 시 복사는 유지, 그룹 밖에서 들어올 때만 기본 카피 적용 */
function isCarouselThumbTypeVariant(pt) {
  return (
    pt === POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL ||
    pt === POPUP_TYPE_IDS.CAROUSEL_THUMB_HORIZONTAL ||
    pt === POPUP_TYPE_IDS.CAROUSEL_SNS ||
    pt === POPUP_TYPE_IDS.CAROUSEL_STORYTELLING
  )
}

const defaultState = {
  language: 'KR',
  popupType: POPUP_TYPE_IDS.SQUARE,
  imageSource: null,
  imageSourceType: null,
  buttonsVisible: true,
  buttonCount: 1,
  button1: {
    label: '확인',
    bgColor: CHOICE_BUTTON_MODAL_DEFAULT_BUTTON1_BG,
    textColor: '#ffffff',
    deeplink: '',
  },
  button2: {
    label: '취소',
    bgColor: CHOICE_BUTTON_MODAL_DEFAULT_BUTTON2_BG,
    textColor: '#000000',
    deeplink: '',
  },
  overlayOpacity: 70,
  cornerRadius: 14,
  slideImages: [],
  slideImagesSlotKeys: [newSmvSlotKey(), newSmvSlotKey()],
  slidePreviewIndex: 0,
  /** Slide_Modal_1:1(Auto Square) 이미지 영역 탭 시 이동 URL */
  slideModal11Deeplink: '',
  slideVerticalImages: [null, null, null],
  slideVerticalSlotKeys: [
    newSmvSlotKey(),
    newSmvSlotKey(),
    newSmvSlotKey(),
  ],
  slideVerticalPreviewIndex: 0,
  slideVerticalTitle: CAROUSEL_THUMB_DEFAULT_TITLE,
  slideVerticalDescription: CAROUSEL_THUMB_DEFAULT_DESCRIPTION,
  simpleIconVariant: SIMPLE_ICON_VARIANT_THUMB,
  simpleIconThumbSize: 'small',
  simpleIconPresetId: 'gift',
  /** Bottom Slide Up — Icon Type 좌측 프리셋 (Character Type은 imageSource) */
  bottomSlideUpIconPresetId: 'gift',
  bottomSlideUpText: DEFAULT_BOTTOM_SLIDE_UP_TEXT,
  /** Bottom Slide Up 바 전체 탭 시 이동할 URL·스킴 */
  bottomSlideUpDeeplink: '',
  /** light = 앱 라이트 모드 프리뷰(검정 바), dark = 앱 다크 모드 프리뷰(밝은 바) */
  bottomSlideAppMode: 'light',
}

export default function App() {
  const [state, setState] = useState(defaultState)
  /** HTML 복사 피드백 — 버튼 위 토스트 (성공·경고·오류) */
  const [copyToast, setCopyToast] = useState(null)
  /** 복사 실패 시에만 패널 경고(링·문구) 표시 — 팝업 타입 변경 시 초기화 */
  const [copyValidationHintsVisible, setCopyValidationHintsVisible] = useState(false)
  /** 미리보기 폰·태블릿 프레임 (HTML 복사와 무관) */
  const [previewDevicePresetId, setPreviewDevicePresetId] = useState(
    PREVIEW_DEVICE_PRESET_DEFAULT_ID
  )
  const previewDevice = useMemo(
    () => getPreviewDevicePreset(previewDevicePresetId),
    [previewDevicePresetId]
  )
  /** 미리보기 패널에서 딥 탭 시 숨김 — Bottom Slide Up은 Preview 내부에서 비활성 */
  const [previewDismissed, setPreviewDismissed] = useState(false)

  useEffect(() => {
    setCopyValidationHintsVisible(false)
  }, [state.popupType])

  useEffect(() => {
    setPreviewDismissed(false)
  }, [state.popupType])

  useEffect(() => {
    if (!copyToast) return
    const id = window.setTimeout(() => setCopyToast(null), 3200)
    return () => window.clearTimeout(id)
  }, [copyToast])

  const handleCopyHtml = useCallback(async () => {
    const t = getT(state.language)
    if (!isCopyHtmlValid(state)) {
      setCopyValidationHintsVisible(true)
      const msg = getCopyHtmlInvalidMessage(state, t)
      if (msg) setCopyToast({ message: msg, variant: 'warning' })
      return
    }
    let imageSource = state.imageSource
    if (imageSource?.startsWith('data:')) {
      try {
        const { dataUrl, warning } = await compressImageDataUrlForExport(imageSource)
        imageSource = dataUrl
        if (warning === 'gif_large') {
          window.alert(t.gifLargeWarning)
        }
      } catch (e) {
        console.error('Image compression failed', e)
      }
    }
    let slideImages = isSlideModalAutoSquareType(state.popupType)
      ? normalizeSlideModal11Images(state.slideImages)
      : state.slideImages || []
    if (slideImages.length) {
      const next = []
      for (let i = 0; i < slideImages.length; i++) {
        let src = slideImages[i]
        if (!src) {
          next.push(null)
          continue
        }
        if (src?.startsWith('data:')) {
          try {
            const { dataUrl, warning } = await compressImageDataUrlForExport(src)
            src = dataUrl
            if (warning === 'gif_large') {
              window.alert(t.gifLargeWarning)
            }
          } catch (e) {
            console.error('Slide image compression failed', e)
          }
        }
        next.push(src)
      }
      slideImages = next
    }
    let slideVerticalImages = normalizeSlideVerticalImages(state.slideVerticalImages)
    if (slideVerticalHasAllImages(state.slideVerticalImages)) {
      const next = []
      for (let i = 0; i < slideVerticalImages.length; i++) {
        let src = slideVerticalImages[i]
        if (src?.startsWith('data:')) {
          try {
            const { dataUrl, warning } = await compressImageDataUrlForExport(src)
            src = dataUrl
            if (warning === 'gif_large') {
              window.alert(t.gifLargeWarning)
            }
          } catch (e) {
            console.error('Slide vertical image compression failed', e)
          }
        }
        next.push(src)
      }
      slideVerticalImages = next
    }
    const html = getPopupHtml(
      { ...state, imageSource, slideImages, slideVerticalImages },
      t
    )
    try {
      await navigator.clipboard.writeText(html)
      setCopyValidationHintsVisible(false)
      setCopyToast({
        message: t.copyHtmlCompleteMessage,
        variant: 'success',
      })
    } catch (err) {
      console.error('Copy failed', err)
      setCopyToast({
        message: t.copyHtmlClipboardFailed,
        variant: 'danger',
      })
    }
  }, [state])

  const setImage = useCallback((source, type) => {
    setState((s) => ({ ...s, imageSource: source, imageSourceType: type }))
  }, [])

  const update = useCallback((key, value) => {
    setState((s) => {
      const next = { ...s, [key]: value }
      if (key === 'simpleIconVariant' && value === SIMPLE_ICON_VARIANT_ICON) {
        next.slideVerticalTitle = SIMPLE_ICON_ICON_DEFAULT_TITLE
        next.slideVerticalDescription = SIMPLE_ICON_ICON_DEFAULT_DESCRIPTION
      }
      if (key === 'buttonCount' && value === 2) {
        next.button2 = {
          ...next.button2,
          textColor: s.button2?.textColor ?? '#000000',
        }
      }
      if (key === 'language') {
        const t = getT(value)
        next.button1 = { ...s.button1, label: t.defaultButton1 }
        next.button2 = { ...s.button2, label: t.defaultButton2 }
      }
      if (key === 'popupType') {
        const prevGroup = getPopupUiGroupId(s.popupType)
        const nextGroup = getPopupUiGroupId(value)
        if (value === POPUP_TYPE_IDS.CAROUSEL_STORYTELLING) {
          next.button1 = {
            ...s.button1,
            label: STORYTELLING_DEFAULT_BUTTON_LABEL,
            bgColor: SMV_BTN_BG,
          }
          next.slideVerticalTitle = STORYTELLING_DEFAULT_TITLE
          next.slideVerticalDescription = CAROUSEL_THUMB_DEFAULT_DESCRIPTION
          const sv = normalizeSlideVerticalImages(s.slideVerticalImages)
          next.slideVerticalImages = sv
          next.slideVerticalSlotKeys = normalizeSlideVerticalSlotKeys(sv, s.slideVerticalSlotKeys)
          next.slideVerticalPreviewIndex = Math.min(
            s.slideVerticalPreviewIndex ?? 0,
            Math.max(0, sv.length - 1)
          )
        } else if (isSlideModalAutoSquareType(value)) {
          const imgs = normalizeSlideModal11Images(s.slideImages)
          next.slideImages = imgs
          next.slideImagesSlotKeys = normalizeSlideModal11SlotKeys(imgs, s.slideImagesSlotKeys)
          next.slidePreviewIndex = Math.min(
            s.slidePreviewIndex ?? 0,
            Math.max(0, imgs.length - 1)
          )
        } else if (value === POPUP_TYPE_IDS.SIMPLE_ICON_MODAL) {
          next.button1 = { ...s.button1, label: 'Read Now', bgColor: SMV_BTN_BG }
        } else if (
          value === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP ||
          value === POPUP_TYPE_IDS.BOTTOM_SLIDE_UP_ICON
        ) {
          if (!String(s.bottomSlideUpText ?? '').trim()) {
            next.bottomSlideUpText = DEFAULT_BOTTOM_SLIDE_UP_TEXT
          }
          next.bottomSlideAppMode = s.bottomSlideAppMode ?? 'light'
        } else if (
          value === POPUP_TYPE_IDS.SLIDE_MODAL_VERTICAL ||
          value === POPUP_TYPE_IDS.CAROUSEL_THUMB_HORIZONTAL ||
          value === POPUP_TYPE_IDS.CAROUSEL_SNS
        ) {
          next.button1 = { ...s.button1, label: 'Read Now', bgColor: SMV_BTN_BG }
          if (!isCarouselThumbTypeVariant(s.popupType)) {
            next.slideVerticalTitle = CAROUSEL_THUMB_DEFAULT_TITLE
            next.slideVerticalDescription = CAROUSEL_THUMB_DEFAULT_DESCRIPTION
          }
          const sv = normalizeSlideVerticalImages(s.slideVerticalImages)
          next.slideVerticalImages = sv
          next.slideVerticalSlotKeys = normalizeSlideVerticalSlotKeys(sv, s.slideVerticalSlotKeys)
          next.slideVerticalPreviewIndex = Math.min(
            s.slideVerticalPreviewIndex ?? 0,
            Math.max(0, sv.length - 1)
          )
        } else if (nextGroup === 'choice' && prevGroup !== 'choice') {
          next.button1 = {
            ...s.button1,
            bgColor: CHOICE_BUTTON_MODAL_DEFAULT_BUTTON1_BG,
            textColor: '#ffffff',
          }
          next.button2 = {
            ...s.button2,
            bgColor: CHOICE_BUTTON_MODAL_DEFAULT_BUTTON2_BG,
            textColor: '#000000',
          }
        }
      }
      return next
    })
  }, [])

  const updateButton = useCallback((which, field, value) => {
    setState((s) => ({
      ...s,
      [which]: { ...s[which], [field]: value },
    }))
  }, [])

  const setSlideModal11Slot = useCallback((slotIndex, fileUrlOrNull) => {
    if (fileUrlOrNull === null) {
      setState((s) => {
        const arr = normalizeSlideModal11Images(s.slideImages)
        arr[slotIndex] = null
        return { ...s, slideImages: arr }
      })
      return
    }
    if (typeof fileUrlOrNull === 'string') {
      const url = fileUrlOrNull.trim()
      if (!url) return
      setState((s) => {
        const arr = normalizeSlideModal11Images(s.slideImages)
        arr[slotIndex] = url
        return { ...s, slideImages: arr }
      })
      return
    }
    const file = fileUrlOrNull
    if (!file?.type?.startsWith('image')) return
    const reader = new FileReader()
    reader.onload = () => {
      setState((s) => {
        const arr = normalizeSlideModal11Images(s.slideImages)
        arr[slotIndex] = reader.result
        return { ...s, slideImages: arr }
      })
    }
    reader.readAsDataURL(file)
  }, [])

  const reorderSlideModal11Images = useCallback((fromIndex, toIndex) => {
    setState((s) => {
      const arr = normalizeSlideModal11Images(s.slideImages)
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= arr.length ||
        toIndex >= arr.length
      ) {
        return s
      }
      const keys = normalizeSlideModal11SlotKeys(arr, s.slideImagesSlotKeys)
      const next = [...arr]
      const nextKeys = [...keys]
      const [item] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, item)
      const [keyItem] = nextKeys.splice(fromIndex, 1)
      nextKeys.splice(toIndex, 0, keyItem)
      const prevIdx = s.slidePreviewIndex ?? 0
      const nextPreview = remapSlideVerticalPreviewIndex(
        prevIdx,
        fromIndex,
        toIndex,
        next.length
      )
      return {
        ...s,
        slideImages: next,
        slideImagesSlotKeys: nextKeys,
        slidePreviewIndex: nextPreview,
      }
    })
  }, [])

  const appendSlideModal11Slot = useCallback(() => {
    setState((s) => {
      const arr = normalizeSlideModal11Images(s.slideImages)
      if (arr.length >= SLIDE_MODAL_11_MAX_IMAGES) return s
      const keys = normalizeSlideModal11SlotKeys(arr, s.slideImagesSlotKeys)
      return {
        ...s,
        slideImages: [...arr, null],
        slideImagesSlotKeys: [...keys, newSmvSlotKey()],
      }
    })
  }, [])

  const removeSlideModal11Slot = useCallback((slotIndex) => {
    setState((s) => {
      const arr = normalizeSlideModal11Images(s.slideImages)
      if (
        slotIndex < SLIDE_MODAL_11_MIN_IMAGES ||
        slotIndex >= arr.length ||
        arr.length <= SLIDE_MODAL_11_MIN_IMAGES
      ) {
        return s
      }
      const keys = normalizeSlideModal11SlotKeys(arr, s.slideImagesSlotKeys)
      const next = arr.filter((_, i) => i !== slotIndex)
      const nextKeys = keys.filter((_, i) => i !== slotIndex)
      let preview = s.slidePreviewIndex ?? 0
      if (preview === slotIndex) {
        preview = Math.max(0, slotIndex - 1)
      } else if (preview > slotIndex) {
        preview -= 1
      }
      preview = Math.min(preview, Math.max(0, next.length - 1))
      return {
        ...s,
        slideImages: next,
        slideImagesSlotKeys: nextKeys,
        slidePreviewIndex: preview,
      }
    })
  }, [])

  const setSlideVerticalSlot = useCallback((slotIndex, fileUrlOrNull) => {
    if (fileUrlOrNull === null) {
      setState((s) => {
        const arr = normalizeSlideVerticalImages(s.slideVerticalImages)
        arr[slotIndex] = null
        return { ...s, slideVerticalImages: arr }
      })
      return
    }
    if (typeof fileUrlOrNull === 'string') {
      const url = fileUrlOrNull.trim()
      if (!url) return
      setState((s) => {
        const arr = normalizeSlideVerticalImages(s.slideVerticalImages)
        arr[slotIndex] = url
        return { ...s, slideVerticalImages: arr }
      })
      return
    }
    const file = fileUrlOrNull
    if (!file?.type?.startsWith('image')) return
    const reader = new FileReader()
    reader.onload = () => {
      setState((s) => {
        const arr = normalizeSlideVerticalImages(s.slideVerticalImages)
        arr[slotIndex] = reader.result
        return { ...s, slideVerticalImages: arr }
      })
    }
    reader.readAsDataURL(file)
  }, [])

  const reorderSlideVerticalImages = useCallback((fromIndex, toIndex) => {
    setState((s) => {
      const arr = normalizeSlideVerticalImages(s.slideVerticalImages)
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= arr.length ||
        toIndex >= arr.length
      ) {
        return s
      }
      const keys = normalizeSlideVerticalSlotKeys(arr, s.slideVerticalSlotKeys)
      const next = [...arr]
      const nextKeys = [...keys]
      const [item] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, item)
      const [keyItem] = nextKeys.splice(fromIndex, 1)
      nextKeys.splice(toIndex, 0, keyItem)
      const prevIdx = s.slideVerticalPreviewIndex ?? 0
      const nextPreview = remapSlideVerticalPreviewIndex(
        prevIdx,
        fromIndex,
        toIndex,
        next.length
      )
      return {
        ...s,
        slideVerticalImages: next,
        slideVerticalSlotKeys: nextKeys,
        slideVerticalPreviewIndex: nextPreview,
      }
    })
  }, [])

  const appendSlideVerticalSlot = useCallback(() => {
    setState((s) => {
      const arr = normalizeSlideVerticalImages(s.slideVerticalImages)
      if (arr.length >= SLIDE_MODAL_VERTICAL_MAX_IMAGES) return s
      const keys = normalizeSlideVerticalSlotKeys(arr, s.slideVerticalSlotKeys)
      return {
        ...s,
        slideVerticalImages: [...arr, null],
        slideVerticalSlotKeys: [...keys, newSmvSlotKey()],
      }
    })
  }, [])

  const removeSlideVerticalSlot = useCallback((slotIndex) => {
    setState((s) => {
      const arr = normalizeSlideVerticalImages(s.slideVerticalImages)
      if (
        slotIndex < SLIDE_MODAL_VERTICAL_MIN_IMAGES ||
        slotIndex >= arr.length ||
        arr.length <= SLIDE_MODAL_VERTICAL_MIN_IMAGES
      ) {
        return s
      }
      const keys = normalizeSlideVerticalSlotKeys(arr, s.slideVerticalSlotKeys)
      const next = arr.filter((_, i) => i !== slotIndex)
      const nextKeys = keys.filter((_, i) => i !== slotIndex)
      let preview = s.slideVerticalPreviewIndex ?? 0
      if (preview === slotIndex) {
        preview = Math.max(0, slotIndex - 1)
      } else if (preview > slotIndex) {
        preview -= 1
      }
      preview = Math.min(preview, Math.max(0, next.length - 1))
      return {
        ...s,
        slideVerticalImages: next,
        slideVerticalSlotKeys: nextKeys,
        slideVerticalPreviewIndex: preview,
      }
    })
  }, [])

  const t = getT(state.language)
  const [headerHelpOpen, setHeaderHelpOpen] = useState(false)
  const headerHelpLeaveTimerRef = useRef(null)
  const clearHeaderHelpLeaveTimer = useCallback(() => {
    if (headerHelpLeaveTimerRef.current != null) {
      clearTimeout(headerHelpLeaveTimerRef.current)
      headerHelpLeaveTimerRef.current = null
    }
  }, [])
  const onHeaderHelpEnter = useCallback(() => {
    clearHeaderHelpLeaveTimer()
    setHeaderHelpOpen(true)
  }, [clearHeaderHelpLeaveTimer])
  const onHeaderHelpLeave = useCallback(() => {
    clearHeaderHelpLeaveTimer()
    headerHelpLeaveTimerRef.current = setTimeout(() => {
      setHeaderHelpOpen(false)
      headerHelpLeaveTimerRef.current = null
    }, 180)
  }, [clearHeaderHelpLeaveTimer])

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-zinc-950">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="box-border flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-zinc-800/90 bg-zinc-950/55 lg:w-[380px] lg:min-w-[380px] lg:max-w-[380px] lg:shrink-0 lg:border-b-0 lg:border-r">
          <ControlPanel
            state={state}
            setImage={setImage}
            update={update}
            updateButton={updateButton}
            setSlideModal11Slot={setSlideModal11Slot}
            reorderSlideModal11Images={reorderSlideModal11Images}
            appendSlideModal11Slot={appendSlideModal11Slot}
            removeSlideModal11Slot={removeSlideModal11Slot}
            setSlideVerticalSlot={setSlideVerticalSlot}
            reorderSlideVerticalImages={reorderSlideVerticalImages}
            appendSlideVerticalSlot={appendSlideVerticalSlot}
            removeSlideVerticalSlot={removeSlideVerticalSlot}
            t={t}
            onCopyHtml={handleCopyHtml}
            copyToast={copyToast}
            copyValidationHintsVisible={copyValidationHintsVisible}
            headerHelpOpen={headerHelpOpen}
            onHeaderHelpEnter={onHeaderHelpEnter}
            onHeaderHelpLeave={onHeaderHelpLeave}
          />
        </aside>

        <section className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-950">
          <div className="flex min-h-0 flex-1 flex-col items-center gap-4 p-6 lg:p-10">
            <div className="flex shrink-0 justify-center">
              <PreviewDevicePicker
                value={previewDevicePresetId}
                onChange={setPreviewDevicePresetId}
                t={t}
              />
            </div>
            <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
              {previewDismissed ? (
                <div className="flex min-h-[220px] w-full max-w-sm flex-col items-center justify-center gap-4 rounded-xl border border-zinc-700/90 bg-zinc-900/50 px-6 py-10 text-center">
                  <p className="text-sm text-zinc-400">
                    {t.previewBackdropClosedHint ??
                      '미리보기를 닫았습니다. 다시 보려면 아래를 누르세요.'}
                  </p>
                  <button
                    type="button"
                    className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900"
                    onClick={() => setPreviewDismissed(false)}
                  >
                    {t.previewBackdropShowAgain ?? '미리보기 다시 보기'}
                  </button>
                </div>
              ) : (
                <Preview
                  state={state}
                  t={t}
                  previewScreenW={previewDevice.width}
                  previewScreenH={previewDevice.height}
                  previewDevicePresetId={previewDevicePresetId}
                  onSlideVerticalPreviewIndexChange={(idx) =>
                    update('slideVerticalPreviewIndex', idx)
                  }
                  onSlidePreviewIndexChange={(idx) => update('slidePreviewIndex', idx)}
                  onBackdropDismiss={() => setPreviewDismissed(true)}
                />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
