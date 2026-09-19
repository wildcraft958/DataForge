function countBars(grid) {
  if (!grid || !grid.length) return 0
  const cols = grid[0].length
  let count = 0
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < grid.length; r++) {
      if (grid[r][c] !== 0) { count++; break }
    }
  }
  return count
}

const TAG_COLORS = [
  'bg-pw-blue/20 text-pw-blue border-pw-blue/30',
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
]

export default function DemoContext({ demos = [], complexity }) {
  const TOKEN_BUDGET = 1024
  const estimatedTokens = 770

  return (
    <div className="card mb-5 flex flex-wrap items-center gap-3 px-5 py-4">
      <span className="eyebrow text-navy-500 mr-1">Demos:</span>
      {demos.map((demo, i) => {
        const bars = countBars(demo.input)
        const matches = bars === complexity
        return (
          <span
            key={i}
            className={`
              inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border
              transition-colors duration-300
              ${TAG_COLORS[i % TAG_COLORS.length]}
            `}
          >
            {bars} bars
            {matches && (
              <span className="text-[10px] text-pw-accent font-semibold">match</span>
            )}
          </span>
        )
      })}
      <span className="ml-auto cite">
        {estimatedTokens} / {TOKEN_BUDGET} tokens
      </span>
    </div>
  )
}
