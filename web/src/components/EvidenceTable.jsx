/**
 * Evidence section: comparison table and BDH-CQ reported numbers.
 */
export default function EvidenceTable() {
  return (
    <section className="mt-8 pt-4 sm:mt-12 sm:pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Evidence
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Developer-reported numbers from BDH-CQ (arXiv:2608.09888, Table 3).
        No public model weights exist. Numbers below are from the paper, not
        our reproduction.
      </p>

      <div className="overflow-x-auto mb-8">
        <table className="text-sm border-collapse w-full max-w-2xl">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2 border border-gray-200 font-semibold">Task</th>
              <th className="px-3 py-2 border border-gray-200 font-semibold">Uncovered</th>
              <th className="px-3 py-2 border border-gray-200 font-semibold">Covered</th>
              <th className="px-3 py-2 border border-gray-200 font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2 border border-gray-200">Ordering, length 8</td>
              <td className="px-3 py-2 border border-gray-200 text-red-600 font-mono">0/24</td>
              <td className="px-3 py-2 border border-gray-200 text-green-700 font-mono">12/24</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-500">BDH-CQ Table 3, pass@1</td>
            </tr>
            <tr>
              <td className="px-3 py-2 border border-gray-200">Ordering, length 8</td>
              <td className="px-3 py-2 border border-gray-200 text-red-600 font-mono">0/24</td>
              <td className="px-3 py-2 border border-gray-200 text-green-700 font-mono">13/24</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-500">BDH-CQ Table 3, pass@2</td>
            </tr>
            <tr>
              <td className="px-3 py-2 border border-gray-200">Nesting, depth 5</td>
              <td className="px-3 py-2 border border-gray-200 text-amber-600 font-mono">15/24</td>
              <td className="px-3 py-2 border border-gray-200 text-green-700 font-mono">16/24</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-500">BDH-CQ Table 3, pass@1</td>
            </tr>
            <tr>
              <td className="px-3 py-2 border border-gray-200">Nesting, depth 5</td>
              <td className="px-3 py-2 border border-gray-200 text-amber-600 font-mono">19/24</td>
              <td className="px-3 py-2 border border-gray-200 text-green-700 font-mono">24/24</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-500">BDH-CQ Table 3, pass@2</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        System Comparison
      </h3>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse w-full max-w-3xl">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2 border border-gray-200 font-semibold">System</th>
              <th className="px-3 py-2 border border-gray-200 font-semibold">How it adapts</th>
              <th className="px-3 py-2 border border-gray-200 font-semibold">Weight updates at inference?</th>
              <th className="px-3 py-2 border border-gray-200 font-semibold">Cost / task</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2 border border-gray-200 font-medium">BDH-CQ</td>
              <td className="px-3 py-2 border border-gray-200">Recurrent state absorbs demos</td>
              <td className="px-3 py-2 border border-gray-200">No</td>
              <td className="px-3 py-2 border border-gray-200 font-mono">$0.00070</td>
            </tr>
            <tr>
              <td className="px-3 py-2 border border-gray-200 font-medium">HRM</td>
              <td className="px-3 py-2 border border-gray-200">Optimizes on augmented demo pairs</td>
              <td className="px-3 py-2 border border-gray-200">Yes (backward pass)</td>
              <td className="px-3 py-2 border border-gray-200 font-mono">$1.48</td>
            </tr>
            <tr>
              <td className="px-3 py-2 border border-gray-200 font-medium">TRM</td>
              <td className="px-3 py-2 border border-gray-200">Learned identity embedding per puzzle</td>
              <td className="px-3 py-2 border border-gray-200">Yes (backward pass)</td>
              <td className="px-3 py-2 border border-gray-200 font-mono">$1.76</td>
            </tr>
            <tr>
              <td className="px-3 py-2 border border-gray-200 font-medium">CoT LLMs</td>
              <td className="px-3 py-2 border border-gray-200">Demos in context, reasoning in tokens</td>
              <td className="px-3 py-2 border border-gray-200">No</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-500">Scales with trace</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
