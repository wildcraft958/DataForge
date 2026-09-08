import KVCacheViz from './KVCacheViz'
import HebbianViz from './HebbianViz'

export default function BDHModule({ demos = [] }) {
  return (
    <section className="mt-10 pt-6 sm:mt-14 sm:pt-10 border-t border-navy-700/40">
      <h2 className="text-2xl font-bold text-white mb-2">
        Two Memory Architectures
      </h2>
      <p className="text-base text-navy-300 mb-8">
        How a Transformer and BDH-CQ store demonstrations differently.
        Add demonstrations above and watch both systems respond.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <KVCacheViz demoCount={demos.length} />
        <HebbianViz demos={demos} />
      </div>

      <div className="bg-navy-800/50 border border-navy-700/40 rounded-2xl p-6 mb-6 max-w-2xl">
        <h3 className="text-base font-semibold text-navy-100 mb-3">
          Hebbian Update Rule
        </h3>
        <div className="font-mono text-base text-pw-cyan space-y-1.5">
          <p>Write: σ<sub>t</sub> = σ<sub>t-1</sub> + x<sup>T</sup> · v</p>
          <p>Read:&nbsp; o<sub>t</sub> = x · σ<sub>t</sub></p>
        </div>
        <p className="text-sm text-navy-300 mt-4 leading-relaxed">
          Each demonstration writes a rank-1 outer product into the fixed-size
          synaptic state σ. Reading multiplies the current query by σ. No growing
          cache, but interference appears when σ fills.
        </p>
        <p className="text-xs text-navy-400 mt-3">
          Source: Pathway BDH Explainer Chapter 2, "From Attention to Synapses."
        </p>
      </div>

      <div className="bg-pw-error/5 border border-pw-error/20 rounded-2xl px-6 py-4 text-sm text-pw-error/80 max-w-2xl leading-relaxed">
        <span className="font-semibold text-pw-error">Simplified illustration.</span>{' '}
        This is not the official BDH implementation. It omits low-rank compression,
        the positional operator U, excitatory/inhibitory circuits, and ReLU gating.
        N = 16 for visual clarity; real BDH uses much larger dimensions.
      </div>

      <div className="mt-8 max-w-2xl">
        <h3 className="text-base font-semibold text-navy-100 mb-2">
          Limitation
        </h3>
        <p className="text-sm text-navy-300 leading-relaxed">
          This is session-scoped adaptation. Demonstrations are absorbed into σ
          for the current task. When the session ends, σ resets to zero. Consolidating
          useful fast state into durable slow weights remains an open problem
          (Dragon Hatchling, arXiv:2509.26507, Conclusion).
        </p>
      </div>
    </section>
  )
}
