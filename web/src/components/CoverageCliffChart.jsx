import { useMemo } from 'react'

const BDH_CQ_LADDER = [
  { complexity: 2, rate: 100 },
  { complexity: 3, rate: 100 },
  { complexity: 4, rate: 100 },
  { complexity: 5, rate: 100 },
  { complexity: 6, rate: 80.6 },
  { complexity: 7, rate: 33.3 },
  { complexity: 8, rate: 4.2 },
]

const LEFT = 56
const RIGHT = 500
const TOP = 20
const BOTTOM = 220
const WIDTH = RIGHT - LEFT
const HEIGHT = BOTTOM - TOP
const GROUP_W = WIDTH / 7
const BAR_W = 20
const BAR_GAP = 4

function groupX(c) {
  return LEFT + (c - 2) * GROUP_W + GROUP_W / 2
}

function yFromRate(rate) {
  return BOTTOM - (rate / 100) * HEIGHT
}

export default function CoverageCliffChart({ precomputed, complexity }) {
  const accuracyData = useMemo(() => {
    if (!precomputed) return null
    const acc = {}
    for (let c = 2; c <= 8; c++) {
      for (const cond of ['covered', 'uncovered']) {
        const entries = precomputed.filter(
          (p) => p.complexity === c && p.condition === cond
        )
        const correct = entries.filter((e) => e.correct).length
        acc[`${c}-${cond}`] = entries.length > 0 ? (correct / entries.length) * 100 : 0
      }
    }
    return acc
  }, [precomputed])

  if (!accuracyData) return null

  const complexities = [2, 3, 4, 5, 6, 7, 8]
  const gridLines = [0, 25, 50, 75, 100]

  const bdhPoints = BDH_CQ_LADDER.map((d) => ({
    x: groupX(d.complexity),
    y: yFromRate(d.rate),
  }))
  const bdhPolyline = bdhPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="w-full max-w-[800px] mx-auto" style={{ aspectRatio: '2 / 1' }}>
    <svg
      viewBox="0 0 520 260"
      role="img"
      aria-label="Bar chart: exact-match accuracy vs complexity for covered and uncovered conditions, with BDH-CQ reference data"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
      {/* Grid lines */}
      {gridLines.map((pct) => {
        const y = yFromRate(pct)
        return (
          <line
            key={pct}
            x1={LEFT}
            x2={RIGHT}
            y1={y}
            y2={y}
            stroke="#e9e9e9"
            strokeDasharray="4 4"
          />
        )
      })}

      {/* Y-axis labels */}
      {gridLines.map((pct) => (
        <text
          key={pct}
          x={48}
          y={yFromRate(pct) + 4}
          textAnchor="end"
          fill="#6e6e6e"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          {pct}%
        </text>
      ))}

      {/* Y-axis title */}
      <text
        x={14}
        y={TOP + HEIGHT / 2}
        textAnchor="middle"
        fill="#6e6e6e"
        fontSize="10"
        transform={`rotate(-90, 14, ${TOP + HEIGHT / 2})`}
      >
        Exact match %
      </text>

      {/* Active complexity highlight */}
      <rect
        x={groupX(complexity) - 30}
        y={TOP - 2}
        width={60}
        height={HEIGHT + 6}
        rx={6}
        fill="rgba(30, 107, 221, 0.08)"
        stroke="#1e6bdd"
        strokeWidth={1}
        strokeDasharray="4 2"
        opacity={0.5}
      />

      {/* Bars for each complexity */}
      {complexities.map((c) => {
        const cx = groupX(c)
        const covRate = accuracyData[`${c}-covered`]
        const uncRate = accuracyData[`${c}-uncovered`]
        const covH = Math.max((covRate / 100) * HEIGHT, covRate > 0 ? 2 : 0)
        const uncH = Math.max((uncRate / 100) * HEIGHT, uncRate > 0 ? 2 : 0)

        return (
          <g key={c}>
            {/* Covered bar */}
            <rect
              x={cx - BAR_W - BAR_GAP / 2}
              y={BOTTOM - covH}
              width={BAR_W}
              height={covH}
              fill="#15803D"
              opacity={0.85}
              rx={2}
            />
            {/* Uncovered bar */}
            <rect
              x={cx + BAR_GAP / 2}
              y={BOTTOM - uncH}
              width={BAR_W}
              height={uncH}
              fill="#D6383B"
              opacity={0.85}
              rx={2}
            />
          </g>
        )
      })}

      {/* BDH-CQ overlay: dashed line */}
      <polyline
        points={bdhPolyline}
        fill="none"
        stroke="#28BAFF"
        strokeWidth={1.5}
        strokeDasharray="6 3"
      />

      {/* BDH-CQ overlay: dots */}
      {bdhPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="#28BAFF"
          opacity={0.9}
        />
      ))}

      {/* X-axis labels */}
      {complexities.map((c) => (
        <text
          key={c}
          x={groupX(c)}
          y={238}
          textAnchor="middle"
          fill={c === complexity ? '#1e6bdd' : '#4b4b4b'}
          fontSize="11"
          fontFamily="var(--font-mono)"
          fontWeight={c === complexity ? 'bold' : 'normal'}
        >
          {c}
        </text>
      ))}

      {/* X-axis title */}
      <text
        x={(LEFT + RIGHT) / 2}
        y={254}
        textAnchor="middle"
        fill="#6e6e6e"
        fontSize="10"
      >
        Complexity (bars)
      </text>

      {/* Legend */}
      <rect x={310} y={4} width={12} height={8} rx={1} fill="#15803D" opacity={0.85} />
      <text x={326} y={11} fill="#4b4b4b" fontSize="9">Covered</text>

      <rect x={370} y={4} width={12} height={8} rx={1} fill="#D6383B" opacity={0.85} />
      <text x={386} y={11} fill="#4b4b4b" fontSize="9">Uncovered</text>

      <circle cx={440} cy={8} r={3} fill="#28BAFF" opacity={0.9} />
      <line x1={444} x2={456} y1={8} y2={8} stroke="#28BAFF" strokeWidth={1.5} strokeDasharray="4 2" />
      <text x={460} y={11} fill="#4b4b4b" fontSize="9">BDH-CQ</text>
    </svg>
    </div>
  )
}
