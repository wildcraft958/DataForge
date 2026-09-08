import { useState, useEffect } from 'react'
import { ARC_COLORS } from './GridRenderer'

function extractBars(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const bars = []
  for (let c = 0; c < cols; c++) {
    let height = 0
    let color = 0
    for (let r = rows - 1; r >= 0; r--) {
      if (grid[r][c] !== 0 && (color === 0 || grid[r][c] === color)) {
        if (color === 0) color = grid[r][c]
        height++
      } else {
        break
      }
    }
    if (height > 0 && color > 0) {
      bars.push({ color, height, column: c })
    }
  }
  return bars
}

export default function SortingGrid({ inputGrid, outputGrid, size = 140, animate = false }) {
  const [phase, setPhase] = useState('idle')

  useEffect(() => {
    if (!animate) { setPhase('idle'); return }
    setPhase('input')
    const t1 = setTimeout(() => setPhase('sorting'), 600)
    const t2 = setTimeout(() => setPhase('done'), 1500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [animate])

  if (!inputGrid || !outputGrid) return null

  const rows = inputGrid.length
  const cols = inputGrid[0].length
  const cellSize = Math.floor(size / Math.max(rows, cols))
  const w = cellSize * cols
  const h = cellSize * rows

  const inputBars = extractBars(inputGrid)
  const outputBars = extractBars(outputGrid)

  const barPairs = inputBars.map(bar => {
    const target = outputBars.find(t => t.color === bar.color)
    return { ...bar, targetColumn: target ? target.column : bar.column }
  })

  const sorting = phase === 'sorting' || phase === 'done'

  return (
    <div
      style={{
        padding: 3,
        borderRadius: 6,
        backgroundColor: '#0F1D35',
        border: '1.5px solid #2A4570',
      }}
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="block"
        style={{ borderRadius: 3 }}
        role="img"
        aria-label="Bars sorting animation"
      >
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (
            <rect
              key={`bg-${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill={ARC_COLORS[0]}
              stroke="#0F1D35"
              strokeWidth={1.2}
              rx={1.5}
            />
          ))
        )}
        {barPairs.map(bar => {
          const dx = sorting ? (bar.targetColumn - bar.column) * cellSize : 0
          return (
            <g
              key={bar.color}
              style={{
                transform: `translateX(${dx}px)`,
                transition: phase === 'sorting'
                  ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'none',
              }}
            >
              {Array.from({ length: bar.height }, (_, hi) => (
                <rect
                  key={hi}
                  x={bar.column * cellSize}
                  y={(rows - 1 - hi) * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={ARC_COLORS[bar.color]}
                  stroke="#0F1D35"
                  strokeWidth={1.2}
                  rx={1.5}
                />
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
