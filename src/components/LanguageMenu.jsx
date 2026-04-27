import { useEffect, useRef, useState } from 'react'
import { LANGUAGE_OPTIONS } from '../translations'

/** 헤더 우측 — 언어 버튼 (테두리형, 지구본) */
export const HEADER_ACTION_BTN_BASE =
  'flex items-center justify-center rounded-lg border border-zinc-600/80 bg-zinc-800/90 text-zinc-300 shadow-sm ring-1 ring-black/20 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-40 disabled:pointer-events-none'

export const HEADER_LANG_BUTTON_CLASS = `${HEADER_ACTION_BTN_BASE} h-10 w-10 shrink-0`

/** HTML 복사 — 설정 패널 슬롯 URL「적용」버튼과 동일 시안(브랜드 그린) */
export const HEADER_COPY_HTML_BUTTON_CLASS =
  'flex shrink-0 items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium whitespace-nowrap leading-none text-white shadow-sm transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-40 disabled:pointer-events-none min-h-[2.5rem]'

/** 설정 사이드바 하단 고정 — 스티키 블록 전체가 하나의 면 버튼(패딩 영역 포함) */
export const PANEL_STICKY_COPY_HTML_FOOTER_BTN_CLASS =
  'sticky bottom-0 z-50 flex w-full shrink-0 flex-col gap-2 border-t border-black/15 bg-brand px-5 py-6 text-left transition-colors hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-brand active:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:pointer-events-none'

export const PANEL_STICKY_COPY_HTML_BUTTON_CLASS =
  'flex w-full items-center justify-center rounded-lg bg-brand px-4 py-3.5 text-sm font-medium leading-none text-white shadow-sm transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-40 disabled:pointer-events-none min-h-[3rem]'

function LanguageGlobeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

/** 헤더용 언어 선택 (지구본 버튼 + 드롭다운) */
export default function LanguageMenu({ language, onLanguageChange, t }) {
  const tr = t || {}
  const langMenuRef = useRef(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onDoc = (e) => {
      if (!langMenuRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={langMenuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={HEADER_LANG_BUTTON_CLASS}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={tr.languageSettingLabel || '언어 설정'}
      >
        <LanguageGlobeIcon />
      </button>
      {open && (
        <ul
          className="absolute right-0 top-full z-[70] mt-1 w-max max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-zinc-700/90 bg-zinc-950 py-0 shadow-2xl ring-1 ring-black/40 ring-brand/10"
          role="listbox"
          aria-label={tr.sectionLanguage || 'Language'}
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <li key={opt.code} className="w-full" role="none">
              <button
                type="button"
                role="option"
                aria-selected={language === opt.code}
                onClick={() => {
                  onLanguageChange(opt.code)
                  setOpen(false)
                }}
                className={`flex w-full min-w-0 items-center whitespace-nowrap px-3 py-2.5 text-left text-sm transition ${
                  language === opt.code
                    ? 'bg-brand/15 text-zinc-100'
                    : 'text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <span className="shrink-0 font-medium tabular-nums text-zinc-400">{opt.code}</span>
                <span className="mx-1.5 shrink-0 text-zinc-600">–</span>
                <span className="min-w-0">{opt.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
