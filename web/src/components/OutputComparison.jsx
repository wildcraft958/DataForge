/**
 * Shows predicted output vs ground truth with a diff overlay.
 * Cells that differ are highlighted with a red border.
 */
import GridRenderer from './GridRenderer'

const ARC_COLORS = [
  '#000000', '#0074D9', '#FF4136', '#2ECC40', '#FFDC00',
  '#AAAAAA', '#F012BE', '#FF851B', '#7FDBFF', '#B10DC9',
]

export default function OutputComparison({
  prediction,
  groundTruth,
  gridSize = 160,
}) {
  if (!prediction || !groundTruth) return null

  const rows = groundTruth.length
  const cols = groundTruth[0].length
  const cellSize = Math.floor(gridSize / Math.max(rows, cols))
  const w = cellSize * cols
  const h = cellSize * rows

  const correct = prediction.every((row, r) =>
    row.every((val, c) => val === groundTruth[r][c])
  )

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
        Model Output
      </h3>
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-gray-500 font-mono">Prediction</span>
          <svg width={w + 1} height={h + 1} viewBox={`0 0 ${w + 1} ${h + 1}`}>
            {prediction.map((row, r) =>
              row.map((val, c) => {
                const differs = val !== groundTruth[r][c]
                return (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={c * cellSize + 0.5}
                      y={r * cellSize + 0.5}
                      width={cellSize}
                      height={cellSize}
                      fill={ARC_COLORS[val] || '#000'}
                      stroke="#333"
                      strokeWidth={0.5}
                    />
                    {differs && (
                      <rect
                        x={c * cellSize + 1.5}
                        y={r * cellSize + 1.5}
                        width={cellSize - 2}
                        height={cellSize - 2}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                    )}
                  </g>
                )
              })
            )}
          </svg>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-gray-500 font-mono">Ground Truth</span>
          <GridRenderer grid={groundTruth} size={gridSize} />
        </div>

        <div className="flex items-center">
          <span
            className={`
              text-2xl font-bold
              ${correct ? 'text-green-600' : 'text-red-500'}
            `}
          >
            {correct ? '✓' : '✗'}
          </span>
        </div>
      </div>
    </div>
  )
}
