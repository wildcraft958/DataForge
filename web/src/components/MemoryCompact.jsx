import { useState, useEffect } from 'react'

const N = 16
const CELL_PX = 9
const MAX_SLOTS = 24

function createProjection(seed = 42) {
  let s = seed
  function rand() {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return (s / 0x7fffffff) * 2 - 1
  }
  const mat = []
  for (let i = 0; i < 100; i++) {
    const row = []
    for (let j = 0; j < N; j++) row.push(rand())
    mat.push(row)
  }
  return mat
}

const PROJECTION = createProjection()

function gridToVector(grid) {
  const flat = grid.flat()
  const vec = new Array(N).fill(0)
  for (let i = 0; i < Math.min(flat.length, PROJECTION.length); i++) {
    for (let j = 0; j < N; j++) {
      vec[j] += flat[i] * PROJECTION[i][j]
    }
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1
  return vec.map((v) => v / norm)
}

function hebbianWrite(sigma, x, v) {
  const next = sigma.map((row) => [...row])
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      next[i][j] += x[i] * v[j]
    }
  }
  return next
}

function frobeniusNorm(sigma) {
  let sum = 0
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      sum += sigma[i][j] * sigma[i][j]
    }
  }
  return Math.sqrt(sum)
}

function zeroMatrix() {
  return Array.from({ length: N }, () => new Array(N).fill(0))
}

const CACHE_COLORS = [
  '#1e6bdd', '#15803D', '#F59E0B', '#D6383B',
  '#A855F7', '#DB2777', '#0a85eb', '#65A30D',
]

export default function MemoryCompact({ demoCount = 0, demos = [] }) {
  const [sigma, setSigma] = useState(zeroMatrix)

  useEffect(() => {
    let s = zeroMatrix()
    for (const demo of demos) {
      const x = gridToVector(demo.input)
      const v = gridToVector(demo.output)
      s = hebbianWrite(s, x, v)
    }
    setSigma(s)
  }, [demos])

  const maxAbs = Math.max(1e-6, ...sigma.flat().map(Math.abs))
  const energy = frobeniusNorm(sigma)
  const filled = Math.min(demoCount * 3, MAX_SLOTS)
  const w = N * CELL_PX
  const h = N * CELL_PX

  return (
    <div className="rounded-xl border border-navy-700/40 bg-navy-800/40 p-4">
      <h4 className="text-xs font-semibold text-navy-300 mb-3 tracking-wide">
        Memory Comparison
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="text-[10px] font-mono text-navy-400 block mb-1.5">
            Transformer KV Cache
          </span>
          <div className="flex items-end gap-[2px] h-20 bg-navy-900/40 rounded-lg p-2">
            {Array.from({ length: MAX_SLOTS }, (_, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all duration-300"
                style={{
                  height: i < filled ? '100%' : '0%',
                  backgroundColor: i < filled
                    ? CACHE_COLORS[i % CACHE_COLORS.length]
                    : 'transparent',
                  opacity: i < filled ? 0.85 : 0,
                  minHeight: i < filled ? 4 : 0,
                }}
              />
            ))}
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-xs font-mono text-navy-300">
              {filled}<span className="text-navy-500">/{MAX_SLOTS}</span>
            </span>
            <span className="text-[10px] text-navy-500">grows with tokens</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono text-navy-400 block mb-1.5">
            Pathway BDH Synaptic State (S)
          </span>
          <div className="flex justify-center">
            <svg
              width={w}
              height={h}
              viewBox={`0 0 ${w} ${h}`}
              className="rounded"
              role="img"
              aria-label="Hebbian synaptic matrix heatmap"
            >
              {sigma.map((row, i) =>
                row.map((val, j) => {
                  const intensity = Math.abs(val) / maxAbs
                  const r = val >= 0 ? 84 : 248
                  const g = val >= 0 ? 104 : 113
                  const b = val >= 0 ? 255 : 113
                  return (
                    <rect
                      key={`${i}-${j}`}
                      x={j * CELL_PX}
                      y={i * CELL_PX}
                      width={CELL_PX}
                      height={CELL_PX}
                      fill={`rgba(${r},${g},${b},${intensity.toFixed(3)})`}
                      stroke="#ffffff"
                      strokeWidth={0.3}
                    />
                  )
                })
              )}
            </svg>
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-xs font-mono text-navy-300">
              {energy.toFixed(1)} <span className="text-navy-500">energy</span>
            </span>
            <span className="text-[10px] text-navy-500">fixed size</span>
          </div>
        </div>
      </div>
    </div>
  )
}
