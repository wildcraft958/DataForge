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
    <div className="min-h-screen bg-navy-950 text-navy-100 pb-28 font-sans">
      <header className="relative px-6 pt-6 pb-5">
        <div className="max-w-5xl mx-auto flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-pw-accent tracking-wider mb-1.5">
              DataForge 2026 · Pathway Track
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              What BDH Remembers
            </h1>
            <p className="text-xs text-navy-400 mt-1">
              Two views of one synaptic state matrix.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAboutOpen(true)}
              className="text-xs font-medium text-navy-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-navy-700/50 hover:border-navy-600"
            >
              About
            </button>
            {view === 'consequence' && <LiveBadge isLive={isLive} progress={onnx.progress} />}
          </div>
        </div>

        <nav className="max-w-5xl mx-auto mt-5 flex gap-2" aria-label="Views">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              aria-current={view === v.id ? 'page' : undefined}
              className={`flex-1 text-left px-4 py-2.5 rounded-lg border transition-colors ${
                view === v.id
                  ? 'border-pw-cyan/60 bg-pw-cyan/10'
                  : 'border-navy-700/50 hover:border-navy-600 bg-navy-900/30'
              }`}
            >
              <span className={`text-xs font-semibold ${view === v.id ? 'text-white' : 'text-navy-300'}`}>
                {v.n} · {v.label}
              </span>
              <span className={`block text-[11px] font-mono mt-0.5 ${view === v.id ? 'text-pw-accent' : 'text-navy-500'}`}>
                {v.sub}
              </span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pw-blue to-transparent" />
      </header>

      {view === 'write' ? (
        <>
          <div className="max-w-5xl mx-auto px-6 pt-6 pb-2">
            <p className="text-base sm:text-lg text-navy-200 max-w-2xl leading-relaxed">
              BDH keeps what it learns in one fixed-size synaptic matrix.
              Each token writes a single outer product into it.
            </p>
            <p className="text-sm text-pw-accent/80 mt-1.5 font-medium">
              Step through a sentence and watch the write happen.
            </p>
          </div>
          <TraceLabBoundary>
            <Suspense fallback={
              <div className="max-w-5xl mx-auto px-6 py-16 text-center text-sm text-navy-400">
                Loading the trained linear-attention model…
              </div>
            }>
              <TraceLab />
            </Suspense>
          </TraceLabBoundary>
        </>
      ) : (
      <>
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-2">
        <p className="text-base sm:text-lg text-navy-200 max-w-2xl leading-relaxed">
          Because that matrix is fixed in size and only ever added to, what it
          holds is decided entirely by what you wrote into it.
        </p>
        <p className="text-sm text-pw-accent/80 mt-1.5 font-medium">
          Change the examples. Watch it fail, then recover.
        </p>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="mb-4 px-4 py-3 rounded-lg border border-navy-700/40 bg-navy-900/40">
          <p className="text-xs font-mono text-navy-400">
            <span className="text-pw-accent font-semibold">Claim:</span>{' '}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6">
              <DemoPanel demos={currentTask.demos} gridSize={130} />

              <div className="flex flex-col gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-navy-300 mb-3">
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
                  />
                ) : (
                  <div>
                    <h3 className="text-sm font-medium text-navy-300 mb-3">
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
