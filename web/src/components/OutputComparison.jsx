import { useState, useEffect, useRef } from 'react'
import GridRenderer, { ARC_COLORS } from './GridRenderer'

export default function OutputComparison({
  prediction,
  groundTruth,
  gridSize = 160,
}) {
  const [revealedRows, setRevealedRows] = useState(10)
  const predKeyRef = useRef('')

  useEffect(() => {
    if (!prediction) return
    const key = JSON.stringify(prediction)
    if (key === predKeyRef.current) return
    predKeyRef.current = key

    setRevealedRows(0)
    const rows = prediction.length
    const timers = Array.from({ length: rows }, (_, i) =>
      setTimeout(() => setRevealedRows(i + 1), (i + 1) * 70)
    )
    return () => timers.forEach(clearTimeout)
  }, [prediction])

  if (!prediction || !groundTruth) return null

  const rows = groundTruth.length
  const cols = groundTruth[0].length
  const cellSize = Math.floor(gridSize / Math.max(rows, cols))
  const w = cellSize * cols
  const h = cellSize * rows

  const correct = prediction.every((row, r) =>
    row.every((val, c) => val === groundTruth[r][c])
  )

  const allRevealed = revealedRows >= rows

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-navy-300">
        Model Output
      </h3>
      <div className="flex flex-wrap items-start gap-4 sm:gap-6">
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs font-mono text-navy-400">Prediction</span>
          <div
            className="rounded-lg transition-shadow duration-700"
            style={{
              boxShadow: allRevealed
                ? correct
                  ? '0 0 24px rgba(52, 211, 153, 0.25)'
                  : '0 0 24px rgba(248, 113, 113, 0.25)'
                : 'none',
            }}
          >
            <svg width={w + 1} height={h + 1} viewBox={`0 0 ${w + 1} ${h + 1}`} className="rounded max-w-full h-auto">
              {prediction.map((row, r) =>
                row.map((val, c) => {
                  const differs = val !== groundTruth[r][c]
                  const visible = r < revealedRows
                  return (
                    <g key={`${r}-${c}`}>
                      <rect
                        x={c * cellSize + 0.5}
                        y={r * cellSize + 0.5}
                        width={cellSize}
                        height={cellSize}
                        fill={visible ? (ARC_COLORS[val] || '#0D1117') : '#0D1117'}
                        stroke="#1A2844"
                        strokeWidth={0.5}
                        rx={1}
                        style={{ transition: 'fill 0.12s ease' }}
                      />
                      {visible && differs && allRevealed && (
                        <rect
                          x={c * cellSize + 1.5}
                          y={r * cellSize + 1.5}
                          width={cellSize - 2}
                          height={cellSize - 2}
                          fill="rgba(248, 113, 113, 0.12)"
                          stroke="#F87171"
                          strokeWidth={1.5}
                          rx={1}
                        />
                      )}
                    </g>
                  )
                })
              )}
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs font-mono text-navy-400">Ground Truth</span>
          <GridRenderer grid={groundTruth} size={gridSize} />
        </div>

        {allRevealed && (
          <div
            className="flex items-center self-center"
            style={{ animation: 'fadeSlideIn 0.3s ease forwards' }}
          >
            <span
              className={`text-3xl font-bold ${correct ? 'text-pw-success' : 'text-pw-error'}`}
            >
              {correct ? '✓' : '✗'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
