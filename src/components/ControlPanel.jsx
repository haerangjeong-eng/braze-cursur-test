import { useRef, useState } from 'react'
import {
  contrastWithWhite,
  ensureContrastWithWhite,
  meetsContrastWithWhite,
} from '../utils/contrast'
import { LANGUAGE_OPTIONS } from '../translations'
import { POPUP_TYPE_OPTIONS } from '../config/popupTypes'

const MIN_CONTRAST = 3.1

const Section = ({ title, children, className = '' }) => (
  <div className={`py-5 px-5 border-b border-zinc-800 last:border-b-0 ${className}`}>
    <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
      {title}
    </h2>
    {children}
  </div>
)

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-300 mb-1.5">
    {children}
  </label>
)

function ContrastFeedback({ hex }) {
  const ratio = contrastWithWhite(hex)
  const pass = ratio >= MIN_CONTRAST
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={`text-sm font-medium ${pass ? 'text-emerald-400' : 'text-red-400'}`}
      >
        Contrast: {ratio.toFixed(1)}:1
      </span>
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded ${
          pass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        }`}
      >
        {pass ? 'Pass' : 'Fail'}
      </span>
    </div>
  )
}

export default function ControlPanel({ state, setImage, update, updateButton, t }) {
  const fileInputRef = useRef(null)
  const [contrastWarning, setContrastWarning] = useState({ button1: false, button2: false })
  const tr = t || {}

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result, 'file')
    reader.readAsDataURL(file)
  }

  const handleUrlSubmit = (e) => {
    e.preventDefault()
    const url = e.target.url?.value?.trim()
    if (url) setImage(url, 'url')
  }

  const handleBgColorChange = (which, hex) => {
    const meets = meetsContrastWithWhite(hex, MIN_CONTRAST)
    if (!meets) {
      setContrastWarning((w) => ({ ...w, [which]: true }))
      const corrected = ensureContrastWithWhite(hex, MIN_CONTRAST)
      updateButton(which, 'bgColor', corrected)
    } else {
      setContrastWarning((w) => ({ ...w, [which]: false }))
      updateButton(which, 'bgColor', hex)
    }
  }

  return (
    <div className="py-2">
      <Section title={tr.popupType || 'Popup Type'}>
        <div>
          <select
            id="popup-type-select"
            aria-label={tr.popupType || 'Popup Type'}
            value={state.popupType || 'square'}
            onChange={(e) => update('popupType', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-surface-800 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          >
            {POPUP_TYPE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {tr[opt.labelKey] || opt.id}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Language / 언어">
        <div>
          <Label htmlFor="lang-select">Select language</Label>
          <select
            id="lang-select"
            value={state.language || 'KR'}
            onChange={(e) => update('language', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-surface-800 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.code} – {opt.name}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title={tr.sectionBg || '배경 이미지'}>
        <div className="space-y-4">
          <div>
            <Label>{tr.imageUpload || '이미지 업로드'}</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-lg bg-surface-700 hover:bg-surface-600 text-zinc-200 text-sm font-medium border border-zinc-700 transition-colors"
            >
              {tr.chooseFile || '파일 선택'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <Label>{tr.imageUrl || '이미지 URL'}</Label>
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                name="url"
                type="url"
                placeholder="https://..."
                className="flex-1 px-3 py-2 rounded-lg bg-surface-800 border border-zinc-700 text-zinc-200 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium"
              >
                {tr.apply || '적용'}
              </button>
            </form>
          </div>
        </div>
      </Section>

      <Section title={tr.sectionButtonVisibility || 'Button visibility'}>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">{tr.btnVisibilityOff || 'OFF'}</span>
          <button
            type="button"
            role="switch"
            aria-checked={state.buttonsVisible !== false}
            aria-label={tr.sectionButtonVisibility || 'Button visibility'}
            onClick={() => update('buttonsVisible', !(state.buttonsVisible ?? true))}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              state.buttonsVisible !== false ? 'bg-cyan-600' : 'bg-surface-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                state.buttonsVisible !== false ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-sm text-zinc-400">{tr.btnVisibilityOn || 'ON'}</span>
        </div>
        <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
          {tr.btnVisibilityHint || 'Turn ON to configure button count and styles.'}
        </p>
      </Section>

      {state.buttonsVisible !== false && (
        <>
      <Section title={tr.sectionButtonCount || '버튼 개수'}>
        <div className="space-y-3" role="radiogroup" aria-label={tr.sectionButtonCount || 'Button count'}>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="button-count"
              checked={state.buttonCount === 1}
              onChange={() => update('buttonCount', 1)}
              className="w-4 h-4 shrink-0 border-zinc-600 bg-surface-800 text-cyan-600 focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-0 focus:ring-offset-zinc-900 accent-cyan-500"
            />
            <span className="text-sm text-zinc-300 group-hover:text-zinc-200">{tr.one ?? '1개'}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="button-count"
              checked={state.buttonCount === 2}
              onChange={() => update('buttonCount', 2)}
              className="w-4 h-4 shrink-0 border-zinc-600 bg-surface-800 text-cyan-600 focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-0 focus:ring-offset-zinc-900 accent-cyan-500"
            />
            <span className="text-sm text-zinc-300 group-hover:text-zinc-200">{tr.two ?? '2개'}</span>
          </label>
        </div>
      </Section>

      <Section title={tr.sectionButton1 || '버튼 1 스타일'}>
        <div className="space-y-4">
          <div>
            <Label>{tr.text || '텍스트'}</Label>
            <input
              type="text"
              value={state.button1.label}
              onChange={(e) => updateButton('button1', 'label', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div>
            <Label>{tr.bgColor || '배경색 (글자색은 흰색 고정)'}</Label>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="color"
                value={state.button1.bgColor}
                onChange={(e) => handleBgColorChange('button1', e.target.value)}
              />
              <ContrastFeedback hex={state.button1.bgColor} />
            </div>
            {contrastWarning.button1 && (
              <p className="mt-2 text-amber-400 text-sm">
                {tr.contrastWarning || '흰색 텍스트가 잘 보이지 않는 너무 밝은 색상입니다. 명도 대비 3.1:1 이상이 되도록 자동 보정했습니다.'}
              </p>
            )}
          </div>
        </div>
      </Section>

      {state.buttonCount === 2 && (
        <Section title={tr.sectionButton2 || '버튼 2 스타일'}>
          <div className="space-y-4">
            <div>
              <Label>{tr.text || '텍스트'}</Label>
              <input
                type="text"
                value={state.button2.label}
                onChange={(e) => updateButton('button2', 'label', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <Label>{tr.bgColor || '배경색 (글자색은 흰색 고정)'}</Label>
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="color"
                  value={state.button2.bgColor}
                  onChange={(e) => handleBgColorChange('button2', e.target.value)}
                />
                <ContrastFeedback hex={state.button2.bgColor} />
              </div>
              {contrastWarning.button2 && (
                <p className="mt-2 text-amber-400 text-sm">
                  {tr.contrastWarning || '흰색 텍스트가 잘 보이지 않는 너무 밝은 색상입니다. 명도 대비 3.1:1 이상이 되도록 자동 보정했습니다.'}
                </p>
              )}
            </div>
          </div>
        </Section>
      )}
        </>
      )}
    </div>
  )
}
