/**
 * First-visit guided flow. 6 steps, under 90 seconds.
 * Controls the complexity slider and coverage toggle through a script.
 */
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-800">{current.text}</p>
          <div className="flex gap-1 mt-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 ${
                  i <= step ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <button
          onClick={advance}
          disabled={!canAdvance}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${canAdvance
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
