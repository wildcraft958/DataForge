import { useState } from 'react'
import CoverageCliffChart from './CoverageCliffChart'

// Four data panels used to stack as four full-height sections, which made the
// page read as a spreadsheet dump. They are the same four tables behind one tab
// strip now. Every number and every citation is unchanged.
const TABS = ['Coverage Cliff', 'Evidence', 'Ladder Experiment', 'System Comparison']

const TH = 'px-4 py-3 border-b border-navy-700/60 eyebrow text-navy-500 text-left align-bottom'
const TD = 'px-4 py-3 border-b border-[#e9e9e9]'

function SourceTag() {
  return (
    <span className="pill border-amber-400/40 bg-amber-500/10 text-amber-400 !px-2.5 !py-1 !text-[10px] !tracking-[0.06em]">
      developer-reported
    </span>
  )
}

function EvidencePanel() {
  return (
    <>
      <p className="text-sm text-navy-300 mb-6 max-w-3xl">
        Developer-reported numbers from BDH-CQ (arXiv:2608.09888, Table 3).
        No public model weights exist. Numbers below are from the paper, not
        our reproduction.
      </p>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr>
              <th className={TH}>Task</th>
              <th className={TH}>Uncovered</th>
              <th className={TH}>Covered</th>
              <th className={TH}>Source</th>
              <th className={TH}>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Ordering, length 8', '0/24', '12/24', 'BDH-CQ Table 3, pass@1', 'text-pw-error'],
              ['Ordering, length 8', '0/24', '13/24', 'BDH-CQ Table 3, pass@2', 'text-pw-error'],
              ['Nesting, depth 5', '15/24', '16/24', 'BDH-CQ Table 3, pass@1', 'text-amber-400'],
              ['Nesting, depth 5', '19/24', '24/24', 'BDH-CQ Table 3, pass@2', 'text-amber-400'],
            ].map(([task, unc, cov, source, uncColor], i) => (
              <tr key={i} className="hover:bg-navy-800/30 transition-colors">
                <td className={`${TD} text-navy-100`}>{task}</td>
                <td className={`${TD} ${uncColor} font-mono font-semibold`}>{unc}</td>
                <td className={`${TD} text-pw-success font-mono font-semibold`}>{cov}</td>
                <td className={`${TD} text-navy-400 text-xs font-mono`}>{source}</td>
                <td className={TD}><SourceTag /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function CoverageCliffPanel({ precomputed, complexity }) {
  return (
    <>
      <p className="text-sm text-navy-300 mb-6 max-w-3xl">
        Our model (bars) vs BDH-CQ ordering pass rates (dots, arXiv:2608.09888).
        Both show the same cliff. Coverage is the bottleneck.
      </p>
      <CoverageCliffChart precomputed={precomputed} complexity={complexity} />
    </>
  )
}

function LadderPanel() {
  return (
    <>
      <p className="text-sm text-navy-300 mb-6 max-w-3xl">
        BDH-CQ ordering pass rates by length (arXiv:2608.09888). Performance saturates
        through length 5 then drops sharply.
      </p>
      <div className="overflow-x-auto mb-4">
        <table className="text-sm border-collapse w-full max-w-2xl">
          <thead>
            <tr>
              <th className={TH}>Length</th>
              <th className={TH}>Pass</th>
              <th className={TH}>Max</th>
              <th className={TH}>Rate</th>
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
                  <td className={`${TD} text-navy-100 font-mono`}>{len}</td>
                  <td className={`${TD} font-mono text-navy-100`}>{pass}</td>
                  <td className={`${TD} font-mono text-navy-400`}>{max}</td>
                  <td className={`${TD} font-mono font-bold ${color}`}>{rate}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="cite max-w-3xl">
        Contrast: propagation/copying tasks show no cliff (48/48 at distances 2-8).
        Some operations extrapolate; ordering does not.
      </p>
    </>
  )
}

function SystemComparisonPanel() {
  return (
    <div className="overflow-x-auto">
      <table className="text-sm border-collapse w-full">
        <thead>
          <tr>
            <th className={TH}>System</th>
            <th className={TH}>How it adapts</th>
            <th className={TH}>Weight updates at inference?</th>
            <th className={TH}>ARC-AGI-1</th>
            <th className={TH}>Cost / task</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-navy-800/30 transition-colors">
            <td className={`${TD} font-semibold text-pw-accent`}>BDH-CQ</td>
            <td className={`${TD} text-navy-100`}>Recurrent state absorbs demos</td>
            <td className={`${TD} text-navy-100`}>No</td>
            <td className={`${TD} font-mono text-navy-100`}>29.5% <span className="text-navy-400">(150M)</span></td>
            <td className={`${TD} font-mono text-pw-success font-semibold`}>$0.00070</td>
          </tr>
          <tr className="hover:bg-navy-800/30 transition-colors">
            <td className={`${TD} font-semibold text-navy-100`}>HRM</td>
            <td className={`${TD} text-navy-100`}>Optimizes on augmented demo pairs</td>
            <td className={`${TD} text-navy-100`}>Yes (backward pass)</td>
            <td className={`${TD} font-mono text-navy-100`}>40.3% <span className="text-navy-400">(27M)</span></td>
            <td className={`${TD} font-mono text-navy-100`}>$1.48</td>
          </tr>
          <tr className="hover:bg-navy-800/30 transition-colors">
            <td className={`${TD} font-semibold text-navy-100`}>TRM</td>
            <td className={`${TD} text-navy-100`}>Learned identity embedding per puzzle</td>
            <td className={`${TD} text-navy-100`}>Yes (backward pass)</td>
            <td className={`${TD} font-mono text-navy-100`}>45% <span className="text-navy-400">(7M)</span></td>
            <td className={`${TD} font-mono text-navy-100`}>$1.76</td>
          </tr>
          <tr className="hover:bg-navy-800/30 transition-colors">
            <td className={`${TD} font-semibold text-navy-100`}>CoT LLMs</td>
            <td className={`${TD} text-navy-100`}>Demos in context, reasoning in tokens</td>
            <td className={`${TD} text-navy-100`}>No</td>
            <td className={`${TD} text-navy-400 font-mono`}>varies</td>
            <td className={`${TD} text-navy-300 font-mono`}>Scales with trace</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-navy-300 mt-5 leading-relaxed max-w-3xl">
        <span className="font-semibold text-navy-100">Read this as cost, not accuracy.</span>{' '}
        HRM and TRM both score higher than BDH-CQ, and both need a backward pass per task.
        That is where their cost sits. BDH-CQ is the accuracy-per-dollar result.
      </p>
      <p className="cite mt-4 flex flex-wrap items-center gap-2">
        <SourceTag />
        BDH-CQ figures: arXiv:2608.09888. HRM and TRM costs: ARC Prize, quoted in Section 8 of the same report.
      </p>
      <p className="cite mt-2">
        HRM: arXiv:2506.21734, 40.3% with 27M params. TRM: Tiny Recursive Models, 45% with 7M params.
        An independent black-box audit by co-authors at Bielik and NYU reproduced BDH-CQ&apos;s 29.5% (Section 5). It covered accuracy, not cost.
      </p>
    </div>
  )
}

export default function EvidenceTable({ precomputed, complexity }) {
  const [tab, setTab] = useState(TABS[0])

  return (
    <section className="mt-10 sm:mt-16">
      <h2 className="h-section mb-6">
        Evidence
      </h2>

      <div className="card card-accent-violet p-5 sm:p-7">
        <div className="flex flex-wrap gap-2 mb-7" role="tablist" aria-label="Evidence">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full eyebrow transition-colors border ${
                tab === t
                  ? 'border-pw-violet bg-pw-violet/10 text-pw-violet'
                  : 'border-[#e9e9e9] text-navy-400 hover:border-navy-600 hover:text-navy-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Coverage Cliff' && (
          <CoverageCliffPanel precomputed={precomputed} complexity={complexity} />
        )}
        {tab === 'Evidence' && <EvidencePanel />}
        {tab === 'Ladder Experiment' && <LadderPanel />}
        {tab === 'System Comparison' && <SystemComparisonPanel />}
      </div>
    </section>
  )
}
