import { useState, useCallback } from 'react'
import ControlPanel from './components/ControlPanel'
import Preview from './components/Preview'
import JsonOutput from './components/JsonOutput'
import { getT } from './translations'
import { getPopupHtml } from './utils/popupToHtml'

// 대비 3.1 이상 되는 기본 버튼 색 (흰색 텍스트용)
const DEFAULT_BUTTON1_BG = '#1d4ed8' // blue-700, contrast ~5.5:1
const DEFAULT_BUTTON2_BG = '#475569'  // slate-600, contrast ~5:1

const defaultState = {
  language: 'KR',
  imageSource: null,
  imageSourceType: null,
  buttonCount: 1,
  button1: {
    label: '확인',
    bgColor: DEFAULT_BUTTON1_BG,
    textColor: '#0f172a',
  },
  button2: {
    label: '취소',
    bgColor: DEFAULT_BUTTON2_BG,
    textColor: '#f8fafc',
  },
  overlayOpacity: 70,
  cornerRadius: 16,
}

export default function App() {
  const [state, setState] = useState(defaultState)
  const [copiedHtml, setCopiedHtml] = useState(false)

  const handleCopyHtml = useCallback(async () => {
    const html = getPopupHtml(state, getT(state.language))
    try {
      await navigator.clipboard.writeText(html)
      setCopiedHtml(true)
      setTimeout(() => setCopiedHtml(false), 2000)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }, [state])

  const setImage = useCallback((source, type) => {
    setState((s) => ({ ...s, imageSource: source, imageSourceType: type }))
  }, [])

  const update = useCallback((key, value) => {
    setState((s) => {
      const next = { ...s, [key]: value }
      if (key === 'language') {
        const t = getT(value)
        next.button1 = { ...s.button1, label: t.defaultButton1 }
        next.button2 = { ...s.button2, label: t.defaultButton2 }
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

  const exportJson = () => {
    const payload = {
      language: state.language,
      imageSource: state.imageSource?.startsWith('data:') ? '[Base64 Image]' : state.imageSource,
      imageSourceType: state.imageSourceType,
      buttonCount: state.buttonCount,
      button1: state.button1,
      button2: state.button2,
      overlayOpacity: state.overlayOpacity,
      cornerRadius: state.cornerRadius,
    }
    return payload
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
          1:1 모바일 팝업 빌더
        </h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          설정 패널에서 옵션을 변경하면 미리보기에 실시간 반영됩니다.
        </p>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        <aside className="w-full lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-900/30 overflow-y-auto">
          <ControlPanel
            state={state}
            setImage={setImage}
            update={update}
            updateButton={updateButton}
            t={getT(state.language)}
          />
        </aside>

        <section className="flex-1 flex flex-col min-h-0 bg-zinc-950">
          <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
            <Preview state={state} t={getT(state.language)} />
          </div>

          <div className="border-t border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={handleCopyHtml}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
              >
                {copiedHtml ? getT(state.language).copied : getT(state.language).copyHtml}
              </button>
              <span className="text-xs text-zinc-500">
                현재 팝업 디자인을 HTML 코드로 복사합니다.
              </span>
            </div>
            <JsonOutput data={exportJson()} rawState={state} />
          </div>
        </section>
      </main>
    </div>
  )
}
