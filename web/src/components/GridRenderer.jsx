const ARC_COLORS = [
  '#172A4A', // 0: empty cell (dark blue, clearly distinct from page #0A0F1C)
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

export default function GridRenderer({ grid, size = 200, label, ariaLabel }) {
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
      <div
        style={{
          padding: 3,
          borderRadius: 6,
          backgroundColor: '#0F1D35',
          border: '1.5px solid #2A4570',
        }}
      >
        <svg
          width={gridWidth}
          height={gridHeight}
          viewBox={`0 0 ${gridWidth} ${gridHeight}`}
          className="block"
          style={{ borderRadius: 3 }}
          role="img"
          aria-label={ariaLabel || label || 'Grid visualization'}
        >
          {grid.map((row, r) =>
            row.map((val, c) => (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill={ARC_COLORS[val] || '#172A4A'}
                stroke="#0F1D35"
                strokeWidth={1.2}
                rx={1.5}
              />
            ))
          )}
        </svg>
      </div>
    </div>
  )
}
