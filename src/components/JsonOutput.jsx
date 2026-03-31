import { useState } from 'react'

function ChevronIcon({ expanded }) {
  return (
    <svg
      className={`w-4 h-4 text-zinc-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export default function JsonOutput({ data, rawState, t }) {
  const tr = t || {}
  const [expanded, setExpanded] = useState(false)

  const displayData = { ...data }
  if (rawState.imageSource?.startsWith('data:')) {
    displayData.imageSource = '[Base64 Image]'
  }

  const jsonString = JSON.stringify(displayData, null, 2)

  return (
    <div className="max-w-full mt-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex items-center justify-between w-full gap-2 text-left py-1 rounded-md hover:bg-zinc-800/50 transition-colors -mx-1 px-1"
      >
        <span className="text-xs font-medium text-zinc-500">
          {tr.realtimeJsonTitle || '실시간 결과 (JSON)'}
        </span>
        <ChevronIcon expanded={expanded} />
      </button>
      {expanded && (
        <pre className="json-output mt-2 p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 overflow-x-auto max-h-40 overflow-y-auto text-sm">
          {jsonString}
        </pre>
      )}
    </div>
  )
}
