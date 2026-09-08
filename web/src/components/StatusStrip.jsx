/**
 * Shows exact match, dimension check, and cell error percentage.
 */
export default function StatusStrip({ prediction, groundTruth }) {
  if (!prediction || !groundTruth) return null

  const rows = groundTruth.length
  const cols = groundTruth[0].length
  const predRows = prediction.length
  const predCols = prediction[0]?.length ?? 0

  const dimsMatch = predRows === rows && predCols === cols
  let cellErrors = 0
  let totalCells = rows * cols

  if (dimsMatch) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (prediction[r][c] !== groundTruth[r][c]) cellErrors++
      }
    }
  }

  const exactMatch = dimsMatch && cellErrors === 0
  const errorPct = dimsMatch ? ((cellErrors / totalCells) * 100).toFixed(1) : '—'

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-100 rounded text-sm font-mono">
      <StatusItem
        ok={exactMatch}
        label={exactMatch ? 'Exact match' : 'Mismatch'}
      />
      <StatusItem
        ok={dimsMatch}
        label={dimsMatch ? `Dims ${rows}×${cols}` : `Dims ${predRows}×${predCols} ≠ ${rows}×${cols}`}
      />
      <StatusItem
        ok={cellErrors === 0}
        label={`Cell error: ${errorPct}%`}
      />
    </div>
  )
}

function StatusItem({ ok, label }) {
  return (
    <span className={ok ? 'text-green-700' : 'text-red-600'}>
      {ok ? '✓' : '✗'} {label}
    </span>
  )
}
