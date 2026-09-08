import { useState } from 'react'

const QUESTIONS = [
  {
    prompt: 'Why did the model fail when you removed the matching example?',
    options: [
      { text: 'The model is too small to sort 8 bars.', correct: false },
      { text: 'The demonstrations did not cover this difficulty, so the model could not apply what it knows.', correct: true },
      { text: 'The model was not trained on 8-bar tasks.', correct: false },
    ],
    correctFeedback: 'Exactly right. The model has the capability. It trained on 8-bar tasks. Only the inference-time demonstrations were missing.',
    wrongFeedback: 'Not quite. The model trained on all complexities (2 through 8) and can solve them. It failed because the demonstrations only showed 2-3 bar examples. The capability is there; the coverage is not.',
  },
  {
    prompt: 'Which of these is a limitation of this demo?',
    options: [
      { text: 'The model cannot learn at all.', correct: false },
      { text: 'Demonstration adaptation is session-scoped; the model does not retain knowledge across sessions.', correct: true },
      { text: 'The model only works for small grids.', correct: false },
    ],
    correctFeedback: 'Correct. The synaptic state resets to zero after each session. Consolidating fast adaptation into durable weights remains an open problem (Dragon Hatchling, arXiv:2509.26507).',
    wrongFeedback: 'Not quite. The model works on 10x10 grids and can learn from demonstrations. The real limitation is that this adaptation is session-scoped: it resets after each task set.',
  },
]

function Question({ q, onComplete }) {
  const [selected, setSelected] = useState(null)
  const answered = selected !== null
  const isCorrect = answered && q.options[selected].correct

  return (
    <div>
      <p className="text-sm text-navy-200 mb-3">{q.prompt}</p>
      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          let style = 'border-navy-700/50 bg-navy-900/30 hover:border-navy-600'
          if (answered && i === selected) {
            style = opt.correct
              ? 'border-emerald-500/60 bg-emerald-500/[0.08]'
              : 'border-red-500/60 bg-red-500/[0.08]'
          }
          return (
            <button
              key={i}
              onClick={() => {
                if (!answered) {
                  setSelected(i)
                  if (onComplete) onComplete()
                }
              }}
              disabled={answered}
              className={`text-left px-4 py-3 rounded-lg border text-sm transition-all duration-200 ${style} ${answered ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className="text-navy-200">{opt.text}</span>
            </button>
          )
        })}
      </div>
      {answered && (
        <div
          className={`mt-3 text-sm ${isCorrect ? 'text-emerald-300' : 'text-navy-300'}`}
          style={{ animation: 'fadeSlideIn 0.3s ease forwards' }}
        >
          {isCorrect ? q.correctFeedback : q.wrongFeedback}
        </div>
      )}
    </div>
  )
}

export default function SelfTestCard({ visible }) {
  const [step, setStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  if (!visible || dismissed) return null

  return (
    <div
      className="rounded-xl border border-pw-blue/30 bg-pw-blue/[0.04] p-5 mb-6"
      style={{ animation: 'fadeSlideIn 0.4s ease forwards' }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">
            Quick check {step + 1}/{QUESTIONS.length}
          </h3>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-navy-500 hover:text-navy-300 transition-colors text-xs shrink-0"
          aria-label="Dismiss self-test"
        >
          Dismiss
        </button>
      </div>

      <Question
        key={step}
        q={QUESTIONS[step]}
        onComplete={() => {
          if (step < QUESTIONS.length - 1) {
            setTimeout(() => setStep(step + 1), 2000)
          }
        }}
      />
    </div>
  )
}
