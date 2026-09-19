import { useState, useEffect, useRef } from 'react'
import GridRenderer, { ARC_COLORS } from './GridRenderer'
import { countBars } from './DemoContext'

function extractBars(grid) {
  if (!grid) return []
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

export default function OutputComparison({
  prediction,
  groundTruth,
  queryInput,
  gridSize = 160,
  complexity = 3,
  covered = false,
  demos = [],
}) {
  const [phase, setPhase] = useState('idle')
  const predKeyRef = useRef('')
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function startAnimation() {
    clearTimers()
    setPhase('input')
    timersRef.current = [
      setTimeout(() => setPhase('sorting'), 600),
      setTimeout(() => setPhase('done'), 1500),
    ]
  }

  useEffect(() => {
    if (!prediction) return
    const key = JSON.stringify(prediction)
    if (key === predKeyRef.current) return
    predKeyRef.current = key
    startAnimation()
    return () => {
      clearTimers()
      predKeyRef.current = ''
    }
  }, [prediction])

  if (!prediction || !groundTruth) return null

  const rows = groundTruth.length
  const cols = groundTruth[0].length
  const cellSize = Math.floor(gridSize / Math.max(rows, cols))
  const w = cellSize * cols
  const h = cellSize * rows

  const wrongCells = prediction.reduce(
    (sum, row, r) => sum + row.reduce((s, val, c) => s + (val !== groundTruth[r][c] ? 1 : 0), 0),
    0
  )
  const totalCells = rows * cols
  const accuracy = Math.round(((totalCells - wrongCells) / totalCells) * 100)
  const correct = wrongCells === 0

  const sorting = phase === 'sorting' || phase === 'done'
  const showDiff = phase === 'done'
  const playing = phase !== 'idle' && phase !== 'done'

  const inputBars = extractBars(queryInput)
  const predBars = extractBars(prediction)

  const barPairs = inputBars.map(bar => {
    const target = predBars.find(t => t.color === bar.color)
    return {
      ...bar,
      targetColumn: target ? target.column : bar.column,
    }
  })

  // Uncovered demonstrations are capped at three bars, so at two and three bars
  // the uncovered set still contains a match and the two conditions describe the
  // same thing. Branching on the toggle alone printed a sentence the demo chips
  // directly contradicted.
  const matchingDemos = demos.filter((d) => countBars(d.input) === complexity).length

  function getExplanation() {
    if (!covered && matchingDemos > 0) {
      return {
        tone: correct ? 'success' : 'warning',
        headline: correct ? 'Correct, and both conditions match here' : 'Wrong, but not for want of coverage',
        body: `Uncovered means demonstrations of three bars or fewer. At ${complexity} bars that still includes ${matchingDemos} matching example${matchingDemos === 1 ? '' : 's'}, so both settings cover this query. The two only separate from 4 bars upward, which is where the gap opens.`,
      }
    }
    if (correct && covered) {
      return {
        tone: 'success',
        headline: 'Correct',
        body: `The demonstrations included ${complexity}-bar examples. The model saw how to sort at this difficulty and applied the same rule.`,
      }
    }
    if (correct && !covered) {
      return {
        tone: 'success',
        headline: 'Correct without coverage',
        body: `No demonstration reached ${complexity} bars, and the model solved it anyway. The fall is not a clean staircase, and we show it as measured rather than smoothing it.`,
      }
    }
    if (!correct && !covered) {
      return {
        tone: 'error',
        headline: 'Failed without coverage',
        body: `The model was trained on ${complexity}-bar tasks and can solve them. These demonstrations top out at three bars, so not one of them showed it this difficulty. Flip the coverage toggle to add one.`,
        bdh: 'BDH-CQ shows the same cliff: 0/24 without coverage, 12/24 with (arXiv:2608.09888, Table 3).',
      }
    }
    return {
      tone: 'warning',
      headline: 'Partial errors with coverage',
      body: `The demonstrations cover this difficulty, but the model still made ${wrongCells} cell error${wrongCells === 1 ? '' : 's'}. No model is perfect; some tasks are harder than others at the same complexity.`,
    }
  }

  const explanation = getExplanation()

  const toneStyles = {
    success: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/[0.06]',
      icon: '✓',
      iconColor: 'text-emerald-400',
      headlineColor: 'text-emerald-300',
    },
    error: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/[0.06]',
      icon: '✗',
      iconColor: 'text-red-400',
      headlineColor: 'text-red-300',
    },
    warning: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/[0.06]',
      icon: '~',
      iconColor: 'text-amber-400',
      headlineColor: 'text-amber-300',
    },
  }
  const tone = toneStyles[explanation.tone]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h3 className="eyebrow text-navy-500">
          Model Output
        </h3>
        <button
          onClick={() => prediction && startAnimation()}
          disabled={playing || !prediction}
          className={`
            ml-auto flex items-center gap-2 px-4 py-2 rounded-full eyebrow
            transition-all duration-200
            ${playing
              ? 'bg-navy-700/30 text-navy-500 cursor-not-allowed'
              : 'bg-navy-800/60 text-navy-200 hover:bg-navy-700/60 hover:text-white border border-navy-700/50'
            }
          `}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
            {playing ? (
              <>
                <rect x="3" y="2" width="3" height="10" rx="0.5" fill="currentColor" />
                <rect x="8" y="2" width="3" height="10" rx="0.5" fill="currentColor" />
              </>
            ) : (
              <path d="M3 1.5v11l9-5.5L3 1.5z" fill="currentColor" />
            )}
          </svg>
          {playing ? 'Solving...' : 'Replay'}
        </button>
      </div>
      <div className="flex flex-wrap items-start gap-4 sm:gap-6">
        <div className="flex flex-col items-center gap-1.5">
          <span className="cite">Prediction</span>
          <div
            className="rounded-lg transition-shadow duration-700"
            style={{
              boxShadow: showDiff
                ? correct
                  ? '0 0 24px rgba(21, 128, 61, 0.25)'
                  : '0 0 24px rgba(214, 56, 59, 0.25)'
                : 'none',
            }}
          >
            <div
              style={{
                padding: 3,
                borderRadius: 6,
                backgroundColor: '#ffffff',
                border: '1.5px solid #c8c8c8',
              }}
            >
              <svg
                width={w}
                height={h}
                viewBox={`0 0 ${w} ${h}`}
                className="block"
                style={{ borderRadius: 3 }}
                role="img"
                aria-label="Model prediction with sorting animation"
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
                      stroke="#ffffff"
                      strokeWidth={1.2}
                      rx={1.5}
                    />
                  ))
                )}
                {barPairs.map(bar => {
                  const dx = sorting
                    ? (bar.targetColumn - bar.column) * cellSize
                    : 0
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
                          stroke="#ffffff"
                          strokeWidth={1.2}
                          rx={1.5}
                        />
                      ))}
                    </g>
                  )
                })}
                {showDiff && prediction.map((row, r) =>
                  row.map((val, c) => {
                    if (val === groundTruth[r][c]) return null
                    // A white halo under the red border. A wrong cell can hold
                    // any bar colour, including the red one, so a red border on
                    // its own disappears on exactly the cells that matter most.
                    return (
                      <g key={`diff-${r}-${c}`} style={{ animation: 'fadeSlideIn 0.3s ease forwards' }}>
                        <rect
                          x={c * cellSize + 1.5}
                          y={r * cellSize + 1.5}
                          width={cellSize - 3}
                          height={cellSize - 3}
                          fill="rgba(214, 56, 59, 0.45)"
                          stroke="#ffffff"
                          strokeWidth={3.5}
                          rx={1}
                        />
                        <rect
                          x={c * cellSize + 1.5}
                          y={r * cellSize + 1.5}
                          width={cellSize - 3}
                          height={cellSize - 3}
                          fill="none"
                          stroke="#8F1216"
                          strokeWidth={2}
                          rx={1}
                        />
                      </g>
                    )
                  })
                )}
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="cite">Ground Truth</span>
          <GridRenderer grid={groundTruth} size={gridSize} />
        </div>
      </div>

      {showDiff && (
        <div
          className={`mt-3 rounded-2xl border ${tone.border} ${tone.bg} px-5 py-4`}
          style={{ animation: 'fadeSlideIn 0.35s ease forwards' }}
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span className={`text-lg font-bold ${tone.iconColor} leading-none mt-0.5`}>
              {tone.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className={`text-base font-semibold ${tone.headlineColor}`}>
                  {explanation.headline}
                </span>
                <span className="text-xs font-mono text-navy-400">
                  {accuracy}% cells correct · {wrongCells}/{totalCells} wrong
                </span>
              </div>
              <p className="text-sm text-navy-300 mt-2 leading-relaxed max-w-lg">
                {explanation.body}
              </p>
              {explanation.bdh && (
                <p className="cite mt-2">
                  {explanation.bdh}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
