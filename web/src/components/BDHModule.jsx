export default function BDHModule() {
  return (
    <section className="mt-10 pt-6 sm:mt-14 sm:pt-10 border-t border-navy-700/40">
      <h2 className="text-xl font-bold text-white mb-2">
        How the Hebbian Memory Works
      </h2>
      <p className="text-xs font-mono text-pw-cyan/70 mb-2">
        Learning goal: describe how BDH-CQ stores demonstrations differently from a Transformer.
      </p>
      <p className="text-sm text-navy-300 mb-6">
        The memory comparison above shows how a Transformer KV cache and a Hebbian
        synaptic matrix respond to the same demonstrations. Here is the mathematics
        behind the Hebbian update.
      </p>

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
