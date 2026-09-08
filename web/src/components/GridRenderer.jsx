const ARC_COLORS = [
  '#0D1117', // 0: background
  '#3B82F6', // 1: blue
  '#EF4444', // 2: red
  '#22C55E', // 3: green
  '#EAB308', // 4: yellow
  '#9CA3AF', // 5: grey
  '#D946EF', // 6: magenta
  '#F97316', // 7: orange
  '#06B6D4', // 8: cyan
  '#A855F7', // 9: purple
]

export { ARC_COLORS }

export default function GridRenderer({ grid, size = 200, label }) {
  if (!grid || grid.length === 0) return null

  const rows = grid.length
  const cols = grid[0].length
  const cellSize = Math.floor(size / Math.max(rows, cols))
  const gridWidth = cellSize * cols
  const gridHeight = cellSize * rows

  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      {label && (
        <span className="text-xs font-mono text-navy-400">{label}</span>
      )}
      <svg
        width={gridWidth + 1}
        height={gridHeight + 1}
        viewBox={`0 0 ${gridWidth + 1} ${gridHeight + 1}`}
        className="rounded max-w-full h-auto"
      >
        {grid.map((row, r) =>
          row.map((val, c) => (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize + 0.5}
              y={r * cellSize + 0.5}
              width={cellSize}
              height={cellSize}
              fill={ARC_COLORS[val] || '#0D1117'}
              stroke="#1A2844"
              strokeWidth={0.5}
              rx={1}
            />
          ))
        )}
      </svg>
    </div>
  )
}
