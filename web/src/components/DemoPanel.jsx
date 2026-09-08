/**
 * Shows 3 demonstration pairs (input -> output) for the current task.
 */
import GridRenderer from './GridRenderer'

export default function DemoPanel({ demos, gridSize = 120 }) {
  if (!demos || demos.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
        Demonstrations
      </h3>
      <div className="flex flex-col gap-4">
        {demos.map((demo, i) => (
          <div key={i} className="flex items-center gap-3">
            <GridRenderer grid={demo.input} size={gridSize} label={`Demo ${i + 1} in`} />
            <span className="text-gray-400 text-lg">&rarr;</span>
            <GridRenderer grid={demo.output} size={gridSize} label={`Demo ${i + 1} out`} />
          </div>
        ))}
      </div>
    </div>
  )
}
