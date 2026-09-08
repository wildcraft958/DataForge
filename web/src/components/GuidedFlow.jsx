import { useState, useCallback } from 'react'

const STEPS = [
  {
    text: 'This model learned a sorting rule from three examples. It works at this difficulty.',
    action: null,
    waitFor: null,
  },
  {
    text: 'Drag the slider right and watch what happens.',
    action: null,
    waitFor: 'complexity_8',
  },
  {
    text: 'The model was trained on all difficulties. It can do this. But its examples only went up to 3.',
    action: null,
    waitFor: null,
  },
  {
    text: 'Flip the toggle to add one example at the current difficulty.',
    action: null,
    waitFor: 'covered',
    highlightToggle: true,
  },
  {
    text: 'Nothing about the model changed. Nothing about the question changed. Only the examples did.',
    action: null,
    waitFor: null,
  },
  {
    text: 'That is the claim. Explore freely.',
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

  const advance = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      onComplete?.()
    }
  }, [step, onComplete])

  const current = STEPS[step]

  if (!active) return null

  const canAdvance = (() => {
    if (!current.waitFor) return true
    if (current.waitFor === 'complexity_8') return complexity >= 8
    if (current.waitFor === 'covered') return covered
    return true
  })()

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
