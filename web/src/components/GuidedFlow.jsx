import { useState, useCallback, useEffect, useRef } from 'react'

const STEPS = [
  {
    text: 'The model sorts 3 bars correctly. The demonstrations include a matching example.',
    waitFor: null,
  },
  {
    text: 'Drag the slider to 8. The model still works because the demos cover this difficulty.',
    waitFor: 'complexity_8',
  },
  {
    text: 'Now flip the toggle to remove the matching example.',
    waitFor: null,
    highlightToggle: true,
  },
  {
    text: 'The same model, the same question. Only the examples changed.',
    waitFor: 'uncovered',
  },
  {
    text: 'Look at the memory comparison below the output. The Hebbian matrix absorbed different demonstrations than before.',
    waitFor: null,
  },
  {
    text: 'That is the claim: coverage, not capability. Explore freely.',
    action: 'unlock',
    waitFor: null,
  },
]

export default function GuidedFlow({
  complexity,
  covered,
  onComplete,
  active,
}) {
  const [step, setStep] = useState(0)
  const autoAdvanceRef = useRef(null)

  const advance = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      onComplete?.()
    }
  }, [step, onComplete])

  const current = STEPS[step]

  const canAdvance = (() => {
    if (!current.waitFor) return true
    if (current.waitFor === 'complexity_8') return complexity >= 8
    if (current.waitFor === 'uncovered') return !covered
    if (current.waitFor === 'covered') return covered
    return true
  })()

  useEffect(() => {
    if (!active || !current.waitFor || !canAdvance) return
    autoAdvanceRef.current = setTimeout(advance, 600)
    return () => clearTimeout(autoAdvanceRef.current)
  }, [active, canAdvance, current.waitFor, advance])

  if (!active) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-navy-700/40"
      style={{
        backgroundColor: 'rgba(11, 17, 32, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-navy-100 leading-relaxed">{current.text}</p>
          <div className="flex gap-1 mt-2.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full flex-1 transition-colors duration-300"
                style={{
                  background: i <= step
                    ? 'linear-gradient(90deg, #5468FF, #28BAFF)'
                    : '#1A2844',
                }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={advance}
          disabled={!canAdvance}
          className={`
            px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200
            ${canAdvance
              ? 'bg-pw-blue text-white hover:shadow-[0_0_16px_rgba(84,104,255,0.4)] hover:bg-pw-blue/90'
              : 'bg-navy-700/50 text-navy-400 cursor-not-allowed'
            }
          `}
        >
          {step < STEPS.length - 1
            ? (current.waitFor && !canAdvance ? 'Waiting...' : 'Next')
            : 'Start exploring'
          }
        </button>
      </div>
    </div>
  )
}
