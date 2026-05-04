import { PREVIEW_DEVICE_PRESETS } from '../config/previewDevicePresets'

/** 일반 스마트폰 (노치 없는 단순 실루엣) */
function IconPhoneDefault({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <line x1="10" y1="6" x2="14" y2="6" opacity="0.45" strokeWidth="1.25" />
    </svg>
  )
}

/** 작은 화면(SE 계열) — 세로가 더 짧게 */
function IconPhoneCompact({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <rect x="8" y="5" width="8" height="14" rx="1.8" />
      <line x1="10" y1="8" x2="14" y2="8" opacity="0.45" strokeWidth="1.25" />
    </svg>
  )
}

/** 태블릿 가로형 실루엣 */
function IconTablet({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.6" />
      <line x1="9" y1="7.5" x2="15" y2="7.5" opacity="0.35" strokeWidth="1.25" />
    </svg>
  )
}

function iconForPreset(presetId) {
  switch (presetId) {
    case 'iphone_se':
      return IconPhoneCompact
    case 'ipad_11':
      return IconTablet
    default:
      return IconPhoneDefault
  }
}

/**
 * @param {{ value: string, onChange: (id: string) => void, t: Record<string, string> }} props
 */
export default function PreviewDevicePicker({ value, onChange, t }) {
  const tr = t || {}
  const groupLabel = tr.previewScreenSize ?? 'Preview screen'

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-zinc-800/90 bg-zinc-950/80 p-0.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm"
      role="radiogroup"
      aria-label={groupLabel}
    >
      {PREVIEW_DEVICE_PRESETS.map((p) => {
        const selected = value === p.id
        const label = tr[p.labelKey] ?? p.id
        const hint = `${label} (${p.width}×${p.height})`
        const Icon = iconForPreset(p.id)
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={hint}
            title={hint}
            onClick={() => onChange(p.id)}
            className={`rounded-full p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
              selected
                ? 'bg-zinc-800/90 text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                : 'text-zinc-500 hover:bg-zinc-900/90 hover:text-zinc-300'
            }`}
          >
            <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          </button>
        )
      })}
    </div>
  )
}
