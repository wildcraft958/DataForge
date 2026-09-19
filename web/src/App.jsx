import { useState, useMemo, useEffect, lazy, Suspense } from 'react'
import TraceLabBoundary from './components/TraceLabBoundary'
import Controls from './components/Controls'
import DemoPanel from './components/DemoPanel'
import GridRenderer from './components/GridRenderer'
import OutputComparison from './components/OutputComparison'
import SelfTestCard from './components/SelfTestCard'
import LiveBadge from './components/LiveBadge'
import BDHModule from './components/BDHModule'
import MemoryCompact from './components/MemoryCompact'
import DemoContext from './components/DemoContext'
import EvidenceTable from './components/EvidenceTable'
import GuidedFlow from './components/GuidedFlow'
import AboutPage from './components/AboutPage'
import TaskCreator from './components/TaskCreator'
import WhyItMattersCard from './components/WhyItMattersCard'
import useOnnxInference from './hooks/useOnnxInference'

const TraceLab = lazy(() => import('./tracelab/TraceLab'))

const VIEWS = [
  { id: 'write', n: '1', label: 'The Write', sub: 'S ← S + φ(K) ⊗ V' },
  { id: 'consequence', n: '2', label: 'The Consequence', sub: 'the coverage cliff' },
]

function App() {
  const [view, setView] = useState('write')
  const [complexity, setComplexity] = useState(3)
  const [covered, setCovered] = useState(true)
  const [guidedActive, setGuidedActive] = useState(true)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [tasks, setTasks] = useState(null)
  const [precomputed, setPrecomputed] = useState(null)
  const [livePrediction, setLivePrediction] = useState(null)
  const onnx = useOnnxInference()

  useEffect(() => {
    fetch('/tasks.json')
      .then((r) => r.json())
      .then(setTasks)
      .catch(() => setTasks(null))
    fetch('/precomputed.json')
      .then((r) => r.json())
      .then(setPrecomputed)
      .catch(() => setPrecomputed(null))
  }, [])

  const condition = covered ? 'covered' : 'uncovered'

  const currentTask = useMemo(() => {
    if (!tasks) return null
    return tasks.find(
      (t) => t.complexity === complexity && t.condition === condition
    ) || null
  }, [tasks, complexity, condition])

  useEffect(() => {
    if (!onnx.ready || !currentTask) { setLivePrediction(null); return }
    let cancelled = false
    onnx.predict(currentTask.demos, currentTask.query_input).then((pred) => {
      if (!cancelled) setLivePrediction(pred)
    })
    return () => { cancelled = true }
  }, [onnx.ready, onnx.predict, currentTask])

  const precomputedPrediction = useMemo(() => {
    if (!precomputed || !currentTask) return null
    const match = precomputed.find(
      (p) => p.complexity === complexity && p.condition === condition && p.seed === currentTask.seed
    )
    return match?.prediction || null
  }, [precomputed, currentTask, complexity, condition])

  const isLive = onnx.ready && livePrediction !== null
  const prediction = isLive ? livePrediction : precomputedPrediction

  return (
    <div className="page-canvas min-h-screen bg-navy-950 text-navy-100 pb-28 font-sans">
      {/* Deck chrome: one translucent strip, the run label on the left and the
          honesty badge on the right, visible on every scroll position. */}
      <div className="sticky top-0 z-40 border-b border-[#e9e9e9] bg-[#ffffffbf] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-pw-indigo shrink-0" />
          <span className="eyebrow text-navy-100 truncate">What BDH Remembers</span>
          <span className="text-navy-700 hidden sm:inline">/</span>
          <span className="eyebrow text-navy-500 hidden sm:inline truncate">
            {VIEWS.find((v) => v.id === view)?.label}
          </span>
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <button
              onClick={() => setAboutOpen(true)}
              className="eyebrow text-navy-400 hover:text-navy-100 transition-colors px-3.5 py-2 rounded-full border border-[#e9e9e9] hover:border-navy-600"
            >
              About
            </button>
            {view === 'consequence' && <LiveBadge isLive={isLive} progress={onnx.progress} />}
          </div>
        </div>
      </div>

      <header className="max-w-7xl mx-auto px-6 pt-10 sm:pt-14 pb-6">
        <p className="eyebrow text-pw-accent mb-4">
          DataForge 2026 · Pathway Track
        </p>
        <h1 className="h-page">
          What BDH Remembers
        </h1>
        <p className="lead mt-4 max-w-2xl">
          Two views of one synaptic state matrix.
        </p>

        <nav className="mt-8 grid sm:grid-cols-2 gap-3" aria-label="Views">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              aria-current={view === v.id ? 'page' : undefined}
              className={`text-left px-5 py-4 rounded-2xl border transition-colors ${
                view === v.id
                  ? 'border-pw-cyan bg-pw-cyan/10'
                  : 'border-[#e9e9e9] bg-[#fff] hover:border-navy-600'
              }`}
            >
              <span className={`block eyebrow ${view === v.id ? 'text-navy-100' : 'text-navy-400'}`}>
                {v.n} · {v.label}
              </span>
              <span className={`block text-sm font-mono mt-1.5 ${view === v.id ? 'text-pw-accent' : 'text-navy-500'}`}>
                {v.sub}
              </span>
            </button>
          ))}
        </nav>
      </header>

      {view === 'write' ? (
        <>
          <div className="max-w-7xl mx-auto px-6 pt-4 pb-2">
            <p className="lead max-w-3xl">
              BDH keeps what it learns in one fixed-size synaptic matrix.
              Each token writes a single outer product into it.
            </p>
            <p className="text-base font-medium text-pw-accent mt-3">
              Step through a sentence and watch the write happen.
            </p>
          </div>
          <TraceLabBoundary>
            <Suspense fallback={
              <div className="max-w-7xl mx-auto px-6 py-16 text-center text-sm text-navy-400">
                Loading the trained linear-attention model…
              </div>
            }>
              <TraceLab />
            </Suspense>
          </TraceLabBoundary>
        </>
      ) : (
      <>
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-2">
        <p className="lead max-w-3xl">
          Because that matrix is fixed in size and only ever added to, what it
          holds is decided entirely by what you wrote into it.
        </p>
        <p className="text-base font-medium text-pw-accent mt-3">
          Change the examples. Watch it fail, then recover.
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="card card-accent mb-5 px-6 py-5">
          <p className="eyebrow text-pw-accent mb-2">Claim:</p>
          <p className="text-lg text-navy-200 max-w-4xl">
            The same weights that score 100% at 8 bars with matched demos score 0% with 2-bar demos. Context, not capability.
          </p>
        </div>
        <div className="mb-8">
          <Controls
            complexity={complexity}
            onComplexityChange={setComplexity}
            covered={covered}
            onCoveredChange={setCovered}
          />
        </div>

        {currentTask ? (
          <>
            <DemoContext demos={currentTask.demos} complexity={complexity} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-6 items-start">
              <div className="card p-5 sm:p-6">
                <DemoPanel demos={currentTask.demos} gridSize={130} />
              </div>

              <div className="flex flex-col gap-5 sm:gap-6">
                <div className="card p-5 sm:p-6">
                  <h3 className="eyebrow text-navy-500 mb-4">
                    Query Input
                  </h3>
                  <GridRenderer
                    grid={currentTask.query_input}
                    size={140}
                  />
                </div>

                {prediction ? (
                  <OutputComparison
                    prediction={prediction}
                    groundTruth={currentTask.query_output}
                    queryInput={currentTask.query_input}
                    gridSize={140}
                    complexity={complexity}
                    covered={covered}
                    demos={currentTask.demos}
                  />
                ) : (
                  <div className="card p-5 sm:p-6">
                    <h3 className="eyebrow text-navy-500 mb-4">
                      Expected Output
                    </h3>
                    <GridRenderer
                      grid={currentTask.query_output}
                      size={140}
                    />
                    <p className="text-xs text-navy-500 mt-2">
                      Prediction appears after loading.
                    </p>
                  </div>
                )}

                <MemoryCompact
                  demoCount={currentTask.demos.length}
                  demos={currentTask.demos}
                />
              </div>
            </div>

            <SelfTestCard visible={!guidedActive} />

            <BDHModule />

            <EvidenceTable precomputed={precomputed} complexity={complexity} />

            <WhyItMattersCard />

            <TaskCreator onnx={onnx} demos={currentTask.demos} covered={covered} />
          </>
        ) : (
          <div className="text-center py-16 text-navy-400">
            {tasks === null ? 'Loading task data...' : 'No task found for this configuration.'}
          </div>
        )}
      </main>

      <GuidedFlow
        complexity={complexity}
        covered={covered}
        active={guidedActive}
        onComplete={() => setGuidedActive(false)}
      />
      </>
      )}

      {aboutOpen && <AboutPage onClose={() => setAboutOpen(false)} />}
    </div>
  )
}

export default App
