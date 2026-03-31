export default function JsonOutput({ data, rawState }) {
  const displayData = { ...data }
  if (rawState.imageSource?.startsWith('data:')) {
    displayData.imageSource = '[Base64 Image]'
  }

  const jsonString = JSON.stringify(displayData, null, 2)

  return (
    <div className="max-w-full">
      <p className="text-xs font-medium text-zinc-500 mb-2">실시간 결과 (JSON)</p>
      <pre className="json-output p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 overflow-x-auto max-h-40 overflow-y-auto">
        {jsonString}
      </pre>
    </div>
  )
}
