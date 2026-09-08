/**
 * Renders a 10x10 ARC-style colored grid from a 2D array.
 * Colors 0-9 map to the standard ARC palette.
 */

const ARC_COLORS = [
  '#000000', // 0: black (background)
  '#0074D9', // 1: blue
  '#FF4136', // 2: red
  '#2ECC40', // 3: green
  '#FFDC00', // 4: yellow
  '#AAAAAA', // 5: grey
  '#F012BE', // 6: magenta
  '#FF851B', // 7: orange
  '#7FDBFF', // 8: cyan
  '#B10DC9', // 9: maroon
]

export default function GridRenderer({ grid, size = 200, label }) {
  if (!grid || grid.length === 0) return null

  const rows = grid.length
  const cols = grid[0].length
  const cellSize = Math.floor(size / Math.max(rows, cols))
  const gridWidth = cellSize * cols
  const gridHeight = cellSize * rows

  return (
    <div className="inline-flex flex-col items-center gap-1">
      {label && (
        <span className="text-xs text-gray-500 font-mono">{label}</span>
      )}
      <svg
        width={gridWidth + 1}
        height={gridHeight + 1}
        viewBox={`0 0 ${gridWidth + 1} ${gridHeight + 1}`}
      >
        {grid.map((row, r) =>
          row.map((val, c) => (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize + 0.5}
              y={r * cellSize + 0.5}
              width={cellSize}
              height={cellSize}
              fill={ARC_COLORS[val] || '#000'}
              stroke="#333"
              strokeWidth={0.5}
            />
          ))
        )}
      </svg>
    </div>
  )
}
