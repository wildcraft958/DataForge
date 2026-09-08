/**
 * Hebbian memory heatmap: NxN sigma matrix visualization.
 * Implements the simplified BDH write rule:
 *   sigma_t = sigma_{t-1} + x^T * v
 * Shows how the synaptic state accumulates as demos are written.
 */
import { useState, useEffect, useRef } from 'react'

const N = 16
const CELL_PX = 10

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
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        BDH Synaptic Memory (σ)
      </h4>
      <svg width={w + 1} height={h + 1} viewBox={`0 0 ${w + 1} ${h + 1}`}>
        {sigma.map((row, i) =>
          row.map((val, j) => {
            const intensity = Math.abs(val) / maxAbs
            const r = val >= 0 ? 59 : 239
            const g = val >= 0 ? 130 : 68
            const b = val >= 0 ? 246 : 68
            return (
              <rect
                key={`${i}-${j}`}
                x={j * CELL_PX + 0.5}
                y={i * CELL_PX + 0.5}
                width={CELL_PX}
                height={CELL_PX}
                fill={`rgba(${r},${g},${b},${intensity.toFixed(3)})`}
                stroke="#e5e7eb"
                strokeWidth={0.3}
              />
            )
          })
        )}
      </svg>
      <span className="text-xs text-gray-500 font-mono text-center">
        Energy: {energy.toFixed(2)}
      </span>
      <p className="text-xs text-gray-400 max-w-[10rem]">
        Fixed size. No growing cache. But finite capacity: older writes interfere when the matrix fills.
      </p>
    </div>
  )
}
