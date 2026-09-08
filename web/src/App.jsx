import { useState, useMemo, useEffect } from 'react'
import Controls from './components/Controls'
import DemoPanel from './components/DemoPanel'
import GridRenderer from './components/GridRenderer'
import OutputComparison from './components/OutputComparison'
import StatusStrip from './components/StatusStrip'
import LiveBadge from './components/LiveBadge'
import BDHModule from './components/BDHModule'
import EvidenceTable from './components/EvidenceTable'
import GuidedFlow from './components/GuidedFlow'

function App() {
  const [complexity, setComplexity] = useState(3)
  const [covered, setCovered] = useState(false)
  const [guidedActive, setGuidedActive] = useState(true)
  const [tasks, setTasks] = useState(null)
  const [precomputed, setPrecomputed] = useState(null)

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

  const prediction = useMemo(() => {
    if (!precomputed || !currentTask) return null
    const match = precomputed.find(
      (p) => p.complexity === complexity && p.condition === condition && p.seed === currentTask.seed
    )
    return match?.prediction || null
  }, [precomputed, currentTask, complexity, condition])

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Demonstration Coverage and Extrapolation
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              DataForge 2026, Pathway track
            </p>
          </div>
          <LiveBadge isLive={false} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Controls
            complexity={complexity}
            onComplexityChange={setComplexity}
            covered={covered}
            onCoveredChange={setCovered}
            disabled={guidedActive && covered && complexity < 8}
          />
        </div>

        {currentTask ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              <div>
                <DemoPanel demos={currentTask.demos} gridSize={120} />
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Query
                  </h3>
                  <GridRenderer
                    grid={currentTask.query_input}
                    size={160}
                    label="Input"
                  />
                </div>

                {prediction ? (
                  <OutputComparison
                    prediction={prediction}
                    groundTruth={currentTask.query_output}
                    gridSize={160}
                  />
                ) : (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Expected Output
                    </h3>
                    <GridRenderer
                      grid={currentTask.query_output}
                      size={160}
                      label="Ground truth"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Model predictions appear here after training.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <StatusStrip
              prediction={prediction}
              groundTruth={currentTask.query_output}
            />

            <BDHModule demos={currentTask.demos} />

            <EvidenceTable />
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
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
    </div>
  )
}

export default App
