import { useState, useMemo } from 'react'
import Controls from './components/Controls'
import DemoPanel from './components/DemoPanel'
import GridRenderer from './components/GridRenderer'
import OutputComparison from './components/OutputComparison'
import LiveBadge from './components/LiveBadge'

function App() {
  const [complexity, setComplexity] = useState(3)
  const [covered, setCovered] = useState(false)
  const [tasks, setTasks] = useState(null)
  const [precomputed, setPrecomputed] = useState(null)

  useMemo(() => {
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
    )
  }, [tasks, complexity, condition])

  const currentPrediction = useMemo(() => {
    if (!precomputed) return null
    return precomputed.find(
      (p) => p.complexity === complexity && p.condition === condition
    )
  }, [precomputed, complexity, condition])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Demonstration Coverage and Extrapolation
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Interactive explainer &mdash; DataForge 2026, Pathway track
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
          />
        </div>

        {currentTask ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

              {currentPrediction ? (
                <OutputComparison
                  prediction={currentPrediction.prediction}
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
                    Model predictions will appear here after training.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            {tasks === null
              ? 'Loading task data...'
              : 'No task found for this configuration.'
            }
          </div>
        )}
      </main>
    </div>
  )
}

export default App
