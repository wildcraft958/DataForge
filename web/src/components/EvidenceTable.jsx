import CoverageCliffChart from './CoverageCliffChart'

export default function EvidenceTable({ precomputed, complexity }) {
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
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Ordering, length 8</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-pw-error font-mono">0/24</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-pw-success font-mono">12/24</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-400 text-xs">BDH-CQ Table 3, pass@1</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60"><span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">developer-reported</span></td>
            </tr>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Ordering, length 8</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-pw-error font-mono">0/24</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-pw-success font-mono">13/24</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-400 text-xs">BDH-CQ Table 3, pass@2</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60"><span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">developer-reported</span></td>
            </tr>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Nesting, depth 5</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-amber-400 font-mono">15/24</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-pw-success font-mono">16/24</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-400 text-xs">BDH-CQ Table 3, pass@1</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60"><span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">developer-reported</span></td>
            </tr>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 text-navy-100">Nesting, depth 5</td>
              <td className="px-4 py-2.5 text-amber-400 font-mono">19/24</td>
              <td className="px-4 py-2.5 text-pw-success font-mono">24/24</td>
              <td className="px-4 py-2.5 text-navy-400 text-xs">BDH-CQ Table 3, pass@2</td>
              <td className="px-4 py-2.5"><span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">developer-reported</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-white mb-3">
        Coverage Cliff
      </h3>
      <p className="text-sm text-navy-300 mb-4">
        Our model (bars) vs BDH-CQ ordering pass rates (dots, arXiv:2608.09888).
        Both show the same cliff. Coverage is the bottleneck.
      </p>
      <div className="mb-8">
        <CoverageCliffChart precomputed={precomputed} complexity={complexity} />
      </div>

      <h3 className="text-base font-semibold text-white mb-3">
        Ladder Experiment
      </h3>
      <p className="text-sm text-navy-300 mb-4">
        BDH-CQ ordering pass rates by length (arXiv:2608.09888). Performance saturates
        through length 5 then drops sharply.
      </p>
      <div className="overflow-x-auto mb-4">
        <table className="text-sm border-collapse w-full max-w-2xl">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">Length</th>
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">Pass</th>
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">Max</th>
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">Rate</th>
            </tr>
          </thead>
          <tbody>
            {[
              [2, 36, 36], [3, 36, 36], [4, 36, 36], [5, 36, 36],
              [6, 29, 36], [7, 8, 24], [8, 1, 24],
            ].map(([len, pass, max]) => {
              const rate = Math.round((pass / max) * 100)
              const color = rate >= 90 ? 'text-pw-success' : rate >= 50 ? 'text-amber-400' : 'text-pw-error'
              return (
                <tr key={len} className="hover:bg-navy-800/30 transition-colors">
                  <td className="px-4 py-2 border-b border-navy-800/60 text-navy-100 font-mono">{len}</td>
                  <td className="px-4 py-2 border-b border-navy-800/60 font-mono text-navy-100">{pass}</td>
                  <td className="px-4 py-2 border-b border-navy-800/60 font-mono text-navy-400">{max}</td>
                  <td className={`px-4 py-2 border-b border-navy-800/60 font-mono font-bold ${color}`}>{rate}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-navy-400 mb-8">
        Contrast: propagation/copying tasks show no cliff (48/48 at distances 2-8).
        Some operations extrapolate; ordering does not.
      </p>

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
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">ARC-AGI-1</th>
              <th className="px-4 py-2.5 border-b border-navy-700/60 font-semibold text-white">Cost / task</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-medium text-pw-accent">BDH-CQ</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Recurrent state absorbs demos</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">No</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-mono text-navy-100">29.5% <span className="text-navy-400">(150M)</span></td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-mono text-pw-success">$0.00070</td>
            </tr>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-medium text-navy-100">HRM</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Optimizes on augmented demo pairs</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Yes (backward pass)</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-mono text-navy-100">40.3% <span className="text-navy-400">(27M)</span></td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-mono text-navy-100">$1.48</td>
            </tr>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-medium text-navy-100">TRM</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Learned identity embedding per puzzle</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 text-navy-100">Yes (backward pass)</td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-mono text-navy-100">45% <span className="text-navy-400">(7M)</span></td>
              <td className="px-4 py-2.5 border-b border-navy-800/60 font-mono text-navy-100">$1.76</td>
            </tr>
            <tr className="hover:bg-navy-800/30 transition-colors">
              <td className="px-4 py-2.5 font-medium text-navy-100">CoT LLMs</td>
              <td className="px-4 py-2.5 text-navy-100">Demos in context, reasoning in tokens</td>
              <td className="px-4 py-2.5 text-navy-100">No</td>
              <td className="px-4 py-2.5 text-navy-400 font-mono">varies</td>
              <td className="px-4 py-2.5 text-navy-300 font-mono">Scales with trace</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-navy-300 mt-3 leading-relaxed max-w-2xl">
          <span className="font-semibold text-navy-100">Read this as cost, not accuracy.</span>{' '}
          HRM and TRM both score higher than BDH-CQ, and both need a backward pass per task.
          That is where their cost sits. BDH-CQ is the accuracy-per-dollar result.
        </p>
        <p className="text-xs text-navy-400 mt-3">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium mr-1.5">
            developer-reported
          </span>
          BDH-CQ figures: arXiv:2608.09888. HRM and TRM costs: ARC Prize, quoted in Section 8 of the same report.
        </p>
        <p className="text-[10px] text-navy-500 mt-1">
          HRM: arXiv:2506.21734, 40.3% with 27M params. TRM: Tiny Recursive Models, 45% with 7M params.
          An independent black-box audit by co-authors at Bielik and NYU reproduced BDH-CQ&apos;s 29.5% (Section 5). It covered accuracy, not cost.
        </p>
      </div>
    </section>
  )
}
