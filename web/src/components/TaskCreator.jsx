import { useState, useMemo, useCallback } from 'react'
import GridRenderer, { ARC_COLORS } from './GridRenderer'

const GRID_ROWS = 10
const GRID_COLS = 10
const MIN_BARS = 2
const MAX_BARS = 8
const AVAILABLE_COLORS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shufflePositions(n) {
  const all = Array.from({ length: GRID_COLS }, (_, i) => i)
  for (let i = all.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all.slice(0, n)
}

function pickColors(n) {
  const shuffled = [...AVAILABLE_COLORS]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, n)
}

function generateRandomBars(n) {
  const colors = pickColors(n)
  return Array.from({ length: n }, (_, i) => ({
    color: colors[i],
    height: randomInt(1, 8),
  }))
}

function barsToGrid(bars, positions) {
  const grid = Array.from({ length: GRID_ROWS }, () => new Array(GRID_COLS).fill(0))
  bars.forEach((bar, i) => {
    const x = positions[i]
    if (x === undefined) return
    for (let row = GRID_ROWS - bar.height; row < GRID_ROWS; row++) {
      grid[row][x] = bar.color
    }
  })
  return grid
}

function computeGroundTruth(bars) {
  const sorted = [...bars].sort((a, b) => a.height - b.height)
  return barsToGrid(sorted, Array.from({ length: sorted.length }, (_, i) => i))
}

function countErrors(pred, truth) {
  let wrong = 0
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (pred[r][c] !== truth[r][c]) wrong++
    }
  }
  return wrong
}

export default function TaskCreator({ onnx, demos, covered }) {
  const [open, setOpen] = useState(false)
  const [bars, setBars] = useState(() => generateRandomBars(4))
  const [positions, setPositions] = useState(() => shufflePositions(4))
  const [prediction, setPrediction] = useState(null)
  const [running, setRunning] = useState(false)

  const inputGrid = useMemo(() => barsToGrid(bars, positions), [bars, positions])
  const groundTruth = useMemo(() => computeGroundTruth(bars), [bars])

  const updateBar = useCallback((idx, field, value) => {
    setBars(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b))
    setPrediction(null)
  }, [])

  const addBar = useCallback(() => {
    if (bars.length >= MAX_BARS) return
    const usedColors = bars.map(b => b.color)
    const free = AVAILABLE_COLORS.filter(c => !usedColors.includes(c))
    const color = free.length > 0 ? free[0] : AVAILABLE_COLORS[0]
    const newBars = [...bars, { color, height: randomInt(1, 8) }]
    setBars(newBars)
    setPositions(shufflePositions(newBars.length))
    setPrediction(null)
  }, [bars])

  const removeBar = useCallback(() => {
    if (bars.length <= MIN_BARS) return
    const newBars = bars.slice(0, -1)
    setBars(newBars)
    setPositions(shufflePositions(newBars.length))
    setPrediction(null)
  }, [bars])

  const randomize = useCallback(() => {
    const n = bars.length
    setBars(generateRandomBars(n))
    setPositions(shufflePositions(n))
    setPrediction(null)
  }, [bars.length])

  const runModel = useCallback(async () => {
    if (!onnx.ready || !demos) return
    setRunning(true)
    setPrediction(null)
    try {
      const result = await onnx.predict(demos, inputGrid)
      setPrediction(result)
    } catch {
      setPrediction(null)
    }
    setRunning(false)
  }, [onnx, demos, inputGrid])

  const errors = prediction ? countErrors(prediction, groundTruth) : null

  if (!open) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setOpen(true)}
          className="w-full text-left px-4 py-3 rounded-xl border border-navy-700/40 bg-navy-900/30 hover:border-pw-cyan/30 transition-colors group"
        >
          <span className="text-sm font-medium text-navy-300 group-hover:text-white transition-colors">
            Create your own task
          </span>
          <span className="text-xs text-navy-500 ml-2">
            Design a bar arrangement and run the model on it
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-xl border border-navy-700/40 bg-navy-900/30 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Create your own task</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-navy-400 hover:text-white transition-colors"
        >
          Collapse
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={removeBar}
          disabled={bars.length <= MIN_BARS}
          className="text-xs px-2.5 py-1 rounded-lg border border-navy-700/50 bg-navy-900/40 text-navy-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          - Bar
        </button>
        <span className="text-xs font-mono text-navy-400">{bars.length} bars</span>
        <button
          onClick={addBar}
          disabled={bars.length >= MAX_BARS}
          className="text-xs px-2.5 py-1 rounded-lg border border-navy-700/50 bg-navy-900/40 text-navy-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          + Bar
        </button>
        <button
          onClick={randomize}
          className="text-xs px-3 py-1 rounded-lg border border-navy-700/50 bg-navy-900/40 text-navy-300 hover:text-white hover:border-pw-cyan/40 transition-colors ml-2"
        >
          Randomize
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {bars.map((bar, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-navy-800/50 border border-navy-700/30">
            <div className="flex gap-1">
              {AVAILABLE_COLORS.filter(c => c === bar.color || !bars.some((b, j) => j !== i && b.color === c)).slice(0, 5).map(c => (
                <button
                  key={c}
                  onClick={() => updateBar(i, 'color', c)}
                  className="w-4 h-4 rounded-sm border transition-all"
                  style={{
                    backgroundColor: ARC_COLORS[c],
                    borderColor: c === bar.color ? '#fff' : 'transparent',
                    transform: c === bar.color ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={bar.height}
              onChange={e => updateBar(i, 'height', Number(e.target.value))}
              className="w-14 accent-pw-cyan"
            />
            <span className="text-[10px] font-mono text-navy-400">h={bar.height}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-6 items-start mb-4">
        <div>
          <span className="text-xs font-mono text-navy-400 mb-1.5 block">Your input</span>
          <GridRenderer grid={inputGrid} size={140} />
        </div>
        <div>
          <span className="text-xs font-mono text-navy-400 mb-1.5 block">Expected (sorted)</span>
          <GridRenderer grid={groundTruth} size={140} />
        </div>
        {prediction && (
          <div>
            <span className="text-xs font-mono text-navy-400 mb-1.5 block">Model prediction</span>
            <GridRenderer grid={prediction} size={140} />
            <div className="mt-2">
              {errors === 0 ? (
                <span className="text-xs font-mono text-green-400">100% correct</span>
              ) : (
                <span className="text-xs font-mono text-red-400">{errors}/{GRID_ROWS * GRID_COLS} cells wrong</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={runModel}
          disabled={!onnx.ready || running || !demos}
          className="text-xs px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-pw-blue text-white hover:bg-pw-blue/80"
        >
          {running ? 'Running...' : 'Run model'}
        </button>
        {!onnx.ready && (
          <span className="text-[10px] text-navy-500">ONNX model loading...</span>
        )}
        {onnx.ready && (
          <span className="relative inline-block group cursor-help">
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-navy-600 text-[8px] font-bold text-navy-400 group-hover:text-white group-hover:border-pw-cyan transition-colors">i</span>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-[10px] text-navy-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
              Uses model deployed in browser using ONNX Runtime Web
            </span>
          </span>
        )}
        {onnx.ready && prediction && (
          <span className="text-[10px] text-navy-500">
            This task was never in the training set.
          </span>
        )}
      </div>
      {running && onnx.progress && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-navy-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-pw-cyan transition-all duration-150"
              style={{ width: `${(onnx.progress.step / onnx.progress.total) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-navy-400 shrink-0">
            Greedy &middot; 1024 max &middot; Token {onnx.progress.step}/{onnx.progress.total}
          </span>
        </div>
      )}
    </div>
  )
}
