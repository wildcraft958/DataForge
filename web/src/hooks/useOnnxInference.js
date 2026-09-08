import { useState, useEffect, useRef, useCallback } from 'react'
import * as ort from 'onnxruntime-web'

ort.env.wasm.wasmPaths = '/'
ort.env.wasm.numThreads = 1

const ROW_SEP = 10
const GRID_SEP = 11
const MAX_SEQ_LEN = 1024

function encodeGrid(grid) {
  const tokens = []
  for (let i = 0; i < grid.length; i++) {
    if (i > 0) tokens.push(ROW_SEP)
    for (let j = 0; j < grid[i].length; j++) {
      tokens.push(grid[i][j])
    }
  }
  return tokens
}

function decodeGrid(tokens, rows, cols) {
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(0))
  let r = 0, c = 0
  for (const t of tokens) {
    if (t === ROW_SEP) { r++; c = 0 }
    else { grid[r][c] = t; c++ }
  }
  return grid
}

export default function useOnnxInference() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(null)
  const sessionRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function loadModel() {
      setLoading(true)
      setError(null)
      try {
        const sess = await ort.InferenceSession.create('/model.onnx')
        if (!cancelled) {
          sessionRef.current = sess
          setSession(sess)
        }
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadModel()
    return () => { cancelled = true }
  }, [])

  const predict = useCallback(async (demos, queryInput) => {
    const sess = sessionRef.current
    if (!sess) return null

    const tokens = []
    for (const d of demos) {
      tokens.push(...encodeGrid(d.input))
      tokens.push(GRID_SEP)
      tokens.push(...encodeGrid(d.output))
      tokens.push(GRID_SEP)
    }
    tokens.push(...encodeGrid(queryInput))
    tokens.push(GRID_SEP)

    const rows = queryInput.length
    const cols = queryInput[0].length
    const targetLen = rows * cols + (rows - 1)

    setProgress({ step: 0, total: targetLen })
    for (let step = 0; step < targetLen; step++) {
      setProgress({ step: step + 1, total: targetLen })
      const ctx = tokens.slice(-MAX_SEQ_LEN)
      const input = new ort.Tensor(
        'int64',
        BigInt64Array.from(ctx.map(BigInt)),
        [1, ctx.length]
      )
      const results = await sess.run({ input_ids: input })
      const logits = results.logits.data
      const vocabSize = results.logits.dims[2]
      const lastStart = (ctx.length - 1) * vocabSize
      let bestToken = 0, bestVal = -Infinity
      for (let v = 0; v < vocabSize; v++) {
        const val = Number(logits[lastStart + v])
        if (val > bestVal) { bestVal = val; bestToken = v }
      }
      tokens.push(bestToken)
    }

    setProgress(null)
    const generated = tokens.slice(-targetLen)
    return decodeGrid(generated, rows, cols)
  }, [])

  return {
    ready: session !== null,
    loading,
    error,
    progress,
    predict,
  }
}
