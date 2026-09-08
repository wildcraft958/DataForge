import { useState, useEffect, useRef } from 'react'
import GridRenderer, { ARC_COLORS } from './GridRenderer'

export default function OutputComparison({
  prediction,
  groundTruth,
  gridSize = 160,
  complexity = 3,
  covered = false,
}) {
  const [revealedRows, setRevealedRows] = useState(10)
  const [playing, setPlaying] = useState(false)
  const predKeyRef = useRef('')
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function startReveal(rowCount) {
    clearTimers()
    setRevealedRows(0)
    setPlaying(true)
    const newTimers = Array.from({ length: rowCount }, (_, i) =>
      setTimeout(() => {
        setRevealedRows(i + 1)
        if (i === rowCount - 1) setPlaying(false)
      }, (i + 1) * 70)
    )
    timersRef.current = newTimers
  }

  useEffect(() => {
    if (!prediction) return
    const key = JSON.stringify(prediction)
    if (key === predKeyRef.current) return
    predKeyRef.current = key
    startReveal(prediction.length)
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

  const allRevealed = revealedRows >= rows

  function getExplanation() {
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
        headline: 'Correct (low complexity)',
        body: `Even without matching demonstrations, ${complexity} bars is simple enough for the model to handle. Try a higher complexity to see where coverage matters.`,
      }
    }
    if (!correct && !covered) {
      return {
        tone: 'error',
        headline: 'Failed without coverage',
        body: `The model was trained on ${complexity}-bar tasks and can solve them. But the demonstrations only showed easy examples (≤3 bars). Without a single example at this difficulty, the model cannot apply what it knows. Flip the coverage toggle to add one.`,
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
        <h3 className="text-sm font-medium text-navy-300">
          Model Output
        </h3>
        <button
          onClick={() => prediction && startReveal(prediction.length)}
          disabled={playing || !prediction}
          className={`
            ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
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
          {playing ? 'Playing...' : 'Replay'}
        </button>
      </div>
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
      </div>

      {allRevealed && (
        <div
          className={`mt-2 rounded-xl border ${tone.border} ${tone.bg} px-4 py-3`}
          style={{ animation: 'fadeSlideIn 0.35s ease forwards' }}
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span className={`text-lg font-bold ${tone.iconColor} leading-none mt-0.5`}>
              {tone.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className={`text-sm font-semibold ${tone.headlineColor}`}>
                  {explanation.headline}
                </span>
                <span className="text-xs font-mono text-navy-400">
                  {accuracy}% cells correct · {wrongCells}/{totalCells} wrong
                </span>
              </div>
              <p className="text-xs text-navy-300 mt-1.5 leading-relaxed max-w-md">
                {explanation.body}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
