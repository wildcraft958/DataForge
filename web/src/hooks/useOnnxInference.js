import { useState, useEffect, useRef, useCallback } from 'react'

let sharedWorker = null
let workerRefCount = 0
let workerReady = false
let workerError = null
const pendingCallbacks = new Map()
const readyListeners = new Set()

function getWorker() {
  if (!sharedWorker) {
    sharedWorker = new Worker(
      new URL('../workers/onnx.worker.js', import.meta.url),
      { type: 'module' }
    )
    sharedWorker.onmessage = (e) => {
      const msg = e.data
      if (msg.type === 'ready') {
        workerReady = true
        readyListeners.forEach((fn) => fn())
      } else if (msg.type === 'error') {
        workerError = msg.message
        readyListeners.forEach((fn) => fn())
      } else if (msg.type === 'progress') {
        const cb = pendingCallbacks.get(msg.id)
        if (cb && cb.onProgress) cb.onProgress(msg.step, msg.total)
      } else if (msg.type === 'predict-result') {
        const cb = pendingCallbacks.get(msg.id)
        if (cb) { cb.resolve(msg.grid); pendingCallbacks.delete(msg.id) }
      } else if (msg.type === 'predict-error') {
        const cb = pendingCallbacks.get(msg.id)
        if (cb) { cb.reject(new Error(msg.message)); pendingCallbacks.delete(msg.id) }
      }
    }
    sharedWorker.postMessage({ type: 'load' })
  }
  workerRefCount++
  return sharedWorker
}

function releaseWorker() {
  workerRefCount--
  if (workerRefCount <= 0) {
    if (sharedWorker) sharedWorker.terminate()
    sharedWorker = null
    workerRefCount = 0
    workerReady = false
    workerError = null
  }
}

let nextId = 0

export default function useOnnxInference() {
  const [ready, setReady] = useState(workerReady)
  const [loading, setLoading] = useState(!workerReady && !workerError)
  const [error, setError] = useState(workerError)
  const [progress, setProgress] = useState(null)
  const workerRef = useRef(null)

  useEffect(() => {
    const w = getWorker()
    workerRef.current = w

    if (workerReady) {
      setReady(true)
      setLoading(false)
    } else if (workerError) {
      setError(workerError)
      setLoading(false)
    }

    const listener = () => {
      if (workerReady) { setReady(true); setLoading(false) }
      if (workerError) { setError(workerError); setLoading(false) }
    }
    readyListeners.add(listener)

    return () => {
      readyListeners.delete(listener)
      releaseWorker()
    }
  }, [])

  const predict = useCallback((demos, queryInput) => {
    const w = workerRef.current
    if (!w || !workerReady) return Promise.resolve(null)

    const id = nextId++
    return new Promise((resolve, reject) => {
      pendingCallbacks.set(id, {
        resolve,
        reject,
        onProgress: (step, total) => setProgress({ step, total }),
      })
      w.postMessage({ type: 'predict', id, demos, queryInput })
    }).finally(() => setProgress(null))
  }, [])

  return { ready, loading, error, progress, predict }
}
