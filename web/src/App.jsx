import { useState, useMemo, useEffect } from 'react'
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

function App() {
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
            <p className="text-xs font-mono text-pw-cyan tracking-wider mb-1.5">
              DataForge 2026 · Pathway Track
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              Demonstration Coverage
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAboutOpen(true)}
              className="text-xs font-medium text-navy-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-navy-700/50 hover:border-navy-600"
            >
              About
            </button>
            <LiveBadge isLive={isLive} progress={onnx.progress} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pw-blue to-transparent" />
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-6 pb-2">
        <p className="text-base sm:text-lg text-navy-200 max-w-2xl leading-relaxed">
          A model fails on hard problems not because it lacks the capability,
          but because the demonstrations did not cover that difficulty.
        </p>
        <p className="text-sm text-pw-cyan/80 mt-1.5 font-medium">
          Change the examples. Watch it recover.
        </p>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="mb-4 px-4 py-3 rounded-lg border border-navy-700/40 bg-navy-900/40">
          <p className="text-xs font-mono text-navy-400">
            <span className="text-pw-cyan font-semibold">Claim:</span>{' '}
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

            <EvidenceTable />

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

      {aboutOpen && <AboutPage onClose={() => setAboutOpen(false)} />}
    </div>
  )
}

export default App
