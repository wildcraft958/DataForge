import { useState, useEffect, useRef } from 'react'
import GridRenderer from './GridRenderer'

export default function DemoPanel({ demos, gridSize = 140 }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [playing, setPlaying] = useState(false)
  const taskKeyRef = useRef('')
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function startAnimation(count) {
    clearTimers()
    setVisibleCount(0)
    setPlaying(true)
    const newTimers = Array.from({ length: count }, (_, i) =>
      setTimeout(() => {
        setVisibleCount(i + 1)
        if (i === count - 1) setPlaying(false)
      }, (i + 1) * 450)
    )
    timersRef.current = newTimers
  }

  useEffect(() => {
    if (!demos || demos.length === 0) return
    const key = JSON.stringify(demos[0]?.input?.[0])
    if (key === taskKeyRef.current) return
    taskKeyRef.current = key
    startAnimation(demos.length)
    return () => {
      clearTimers()
      taskKeyRef.current = ''
    }
  }, [demos])

  function handleReplay() {
    if (!demos || demos.length === 0) return
    startAnimation(demos.length)
  }

  if (!demos || demos.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h3 className="text-base font-semibold text-white">
          Demonstrations
        </h3>
        <div className="flex gap-1.5 items-center">
          {demos.map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i < visibleCount ? '#5468FF' : '#1A2844',
                boxShadow: i < visibleCount ? '0 0 6px rgba(84, 104, 255, 0.5)' : 'none',
              }}
            />
          ))}
        </div>
        <button
          onClick={handleReplay}
          disabled={playing}
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

      <div className="flex flex-col gap-5">
        {demos.map((demo, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl px-4 py-3"
            style={{
              opacity: i < visibleCount ? 1 : 0.1,
              transform: i < visibleCount ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease, background-color 0.4s ease',
              backgroundColor: i < visibleCount ? 'rgba(26, 40, 68, 0.35)' : 'transparent',
            }}
          >
            <span className="text-sm font-mono text-navy-400 w-5 shrink-0 text-right font-bold">
              {i + 1}
            </span>
            <div>
              <GridRenderer grid={demo.input} size={gridSize} />
            </div>
            <svg width="24" height="16" viewBox="0 0 24 16" className="shrink-0">
              <path
                d="M0 8h18M15 3l5 5-5 5"
                stroke={i < visibleCount ? '#5468FF' : '#1A2844'}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'stroke 0.4s ease' }}
              />
            </svg>
            <div>
              <GridRenderer grid={demo.output} size={gridSize} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
