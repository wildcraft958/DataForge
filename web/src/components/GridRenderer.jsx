// ARC hues, darkened so every bar separates from the light empty cell and from
// each other. Blue and cyan sit far apart on purpose: they identify two
// different bars in the same grid.
const ARC_COLORS = [
  '#e9e9e9', // 0: empty cell (light grey, clearly distinct from page #f6f6f6)
  '#1e6bdd', // 1: blue
  '#D6383B', // 2: red
  '#15803D', // 3: green
  '#D9A404', // 4: yellow
  '#8c8c8c', // 5: grey
  '#C061FF', // 6: magenta
  '#EA6A0A', // 7: orange
  '#0AA5C9', // 8: cyan
  '#8B3FD1', // 9: purple
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
          backgroundColor: '#ffffff',
          border: '1.5px solid #c8c8c8',
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
                fill={ARC_COLORS[val] || '#e9e9e9'}
                stroke="#ffffff"
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
