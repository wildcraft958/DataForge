export default function EvidenceTable() {
  return (
    <section className="mt-8 pt-4 sm:mt-12 sm:pt-8 border-t border-navy-700/40">
      <h2 className="text-xl font-bold text-white mb-1">
        Evidence
      </h2>
      <p className="text-sm text-navy-300 mb-6">
        Developer-reported numbers from BDH-CQ (arXiv:2608.09888, Table 3).
        No public model weights exist. Numbers below are from the paper, not
        our reproduction.
      </p>

      <div className="overflow-x-auto mb-8">
        <table className="text-sm border-collapse w-full max-w-2xl">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">Task</th>
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">Uncovered</th>
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">Covered</th>
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">Source</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Ordering, length 8</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-pw-error font-mono">0/24</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-pw-success font-mono">12/24</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-400 text-xs">BDH-CQ Table 3, pass@1</td>
            </tr>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Ordering, length 8</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-pw-error font-mono">0/24</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-pw-success font-mono">13/24</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-400 text-xs">BDH-CQ Table 3, pass@2</td>
            </tr>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Nesting, depth 5</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-amber-400 font-mono">15/24</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-pw-success font-mono">16/24</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-400 text-xs">BDH-CQ Table 3, pass@1</td>
            </tr>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 text-navy-100">Nesting, depth 5</td>
              <td className="px-4 py-2.5 text-amber-400 font-mono">19/24</td>
              <td className="px-4 py-2.5 text-pw-success font-mono">24/24</td>
              <td className="px-4 py-2.5 text-navy-400 text-xs">BDH-CQ Table 3, pass@2</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-white mb-3">
        System Comparison
      </h3>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse w-full max-w-3xl">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">System</th>
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">How it adapts</th>
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">Weight updates at inference?</th>
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">Cost / task</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-medium text-pw-cyan">BDH-CQ</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Recurrent state absorbs demos</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">No</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-mono text-pw-success">$0.00070</td>
            </tr>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-medium text-navy-100">HRM</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Optimizes on augmented demo pairs</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Yes (backward pass)</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-mono text-navy-100">$1.48</td>
            </tr>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-medium text-navy-100">TRM</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Learned identity embedding per puzzle</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Yes (backward pass)</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-mono text-navy-100">$1.76</td>
            </tr>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 font-medium text-navy-100">CoT LLMs</td>
              <td className="px-4 py-2.5 text-navy-100">Demos in context, reasoning in tokens</td>
              <td className="px-4 py-2.5 text-navy-100">No</td>
              <td className="px-4 py-2.5 text-navy-300 font-mono">Scales with trace</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
