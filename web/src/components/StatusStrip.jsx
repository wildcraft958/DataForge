export default function StatusStrip({ prediction, groundTruth }) {
  if (!prediction) {
    return (
      <div className="flex items-center px-4 py-2.5 bg-navy-800/40 rounded-lg text-sm font-mono text-navy-500 border border-navy-700/30">
        Awaiting model output
      </div>
    )
  }

  const rows = groundTruth.length
  const cols = groundTruth[0].length
  const predRows = prediction.length
  const predCols = prediction[0]?.length ?? 0

  const dimsMatch = predRows === rows && predCols === cols
  let cellErrors = 0
  const totalCells = rows * cols

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
    <div
      className="flex items-center gap-5 px-5 py-3 rounded-lg text-sm font-mono border"
      style={{
        backgroundColor: exactMatch ? 'rgba(52, 211, 153, 0.06)' : 'rgba(248, 113, 113, 0.06)',
        borderColor: exactMatch ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)',
      }}
    >
      <StatusItem ok={exactMatch} label={exactMatch ? 'Exact match' : 'Mismatch'} />
      <span className="text-navy-700">|</span>
      <StatusItem
        ok={dimsMatch}
        label={dimsMatch ? `Dims ${rows}×${cols}` : `Dims ${predRows}×${predCols} ≠ ${rows}×${cols}`}
      />
      <span className="text-navy-700">|</span>
      <StatusItem ok={cellErrors === 0} label={`Cell error ${errorPct}%`} />
    </div>
  )
}

function StatusItem({ ok, label }) {
  return (
    <span className={ok ? 'text-pw-success' : 'text-pw-error'}>
      {ok ? '✓' : '✗'} {label}
    </span>
  )
}
