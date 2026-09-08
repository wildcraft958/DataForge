import { useState, useEffect, useRef } from 'react'
import GridRenderer from './GridRenderer'

export default function DemoPanel({ demos, gridSize = 120 }) {
  const [visibleCount, setVisibleCount] = useState(demos?.length || 0)
  const taskKeyRef = useRef('')

  useEffect(() => {
    if (!demos || demos.length === 0) return
    const key = JSON.stringify(demos[0]?.input?.[0])
    if (key === taskKeyRef.current) return
    taskKeyRef.current = key

    setVisibleCount(0)
    const timers = demos.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), (i + 1) * 350)
    )
    return () => timers.forEach(clearTimeout)
  }, [demos])

  if (!demos || demos.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 mb-1">
        <h3 className="text-sm font-medium text-navy-300">
          Demonstrations
        </h3>
        <div className="flex gap-1">
          {demos.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: i < visibleCount ? '#5468FF' : '#1A2844',
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {demos.map((demo, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{
              opacity: i < visibleCount ? 1 : 0.15,
              transform: i < visibleCount ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            <span className="text-xs font-mono text-navy-500 w-4 shrink-0 text-right">
              {i + 1}
            </span>
            <GridRenderer grid={demo.input} size={gridSize} />
            <svg width="16" height="12" viewBox="0 0 16 12" className="shrink-0">
              <path
                d="M0 6h12M10 2l4 4-4 4"
                stroke={i < visibleCount ? '#5468FF' : '#1A2844'}
                strokeWidth="1.5"
                fill="none"
                style={{ transition: 'stroke 0.3s ease' }}
              />
            </svg>
            <GridRenderer grid={demo.output} size={gridSize} />
          </div>
        ))}
      </div>
    </div>
  )
}
