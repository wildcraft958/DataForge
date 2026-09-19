import { useState, useEffect, useRef } from 'react'

const N = 16
const CELL_PX = 18

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

export default function HebbianViz({ demos = [] }) {
  const [sigma, setSigma] = useState(zeroMatrix)
  const prevCountRef = useRef(0)

  useEffect(() => {
    let s = zeroMatrix()
    for (const demo of demos) {
      const x = gridToVector(demo.input)
      const v = gridToVector(demo.output)
      s = hebbianWrite(s, x, v)
    }
    setSigma(s)
    prevCountRef.current = demos.length
  }, [demos])

  const maxAbs = Math.max(
    1e-6,
    ...sigma.flat().map(Math.abs)
  )

  const energy = frobeniusNorm(sigma)
  const w = N * CELL_PX
  const h = N * CELL_PX

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-[280px]">
      <div className="bg-navy-800/60 border border-navy-700/40 rounded-2xl p-6">
        <h4 className="text-base font-bold text-white tracking-wide mb-1">
          Pathway BDH Synaptic Memory (S)
        </h4>
        <p className="text-sm text-navy-300 mb-4">
          Fixed-size matrix. All demonstrations compress into one state.
        </p>
        <div className="flex justify-center">
          <svg
            width={w + 1}
            height={h + 1}
            viewBox={`0 0 ${w + 1} ${h + 1}`}
            className="rounded-lg"
            style={{
              filter: energy > 0.5 ? `drop-shadow(0 0 12px rgba(30, 107, 221, 0.25))` : 'none',
            }}
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
                    x={j * CELL_PX + 0.5}
                    y={i * CELL_PX + 0.5}
                    width={CELL_PX}
                    height={CELL_PX}
                    fill={`rgba(${r},${g},${b},${intensity.toFixed(3)})`}
                    stroke="#ffffff"
                    strokeWidth={0.4}
                    rx={1}
                  />
                )
              })
            )}
          </svg>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-white font-mono">
            {energy.toFixed(2)}
            <span className="text-base text-navy-400 font-normal"> energy</span>
          </span>
          <span className="text-xs text-navy-400 font-mono">
            {N}x{N} fixed matrix
          </span>
        </div>
        <p className="text-sm text-navy-400 mt-3 leading-relaxed">
          No growing cache, but finite capacity.
          Older writes interfere when the matrix fills.
        </p>
        <button
          onClick={() => {
            const x = Array.from({ length: N }, () => (Math.random() * 2 - 1))
            const norm = Math.sqrt(x.reduce((s, v) => s + v * v, 0)) || 1
            const xn = x.map(v => v / norm)
            setSigma(prev => hebbianWrite(prev, xn, xn))
          }}
          className="mt-3 text-xs px-3 py-1.5 rounded-lg border border-navy-700/50 bg-navy-900/40 text-navy-300 hover:text-white hover:border-pw-cyan/40 transition-colors"
        >
          Write random vector
        </button>
      </div>
    </div>
  )
}
