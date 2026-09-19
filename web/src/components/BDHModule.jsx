export default function BDHModule() {
  return (
    <section className="mt-10 pt-6 sm:mt-14 sm:pt-10 border-t border-navy-700/40">
      <h2 className="text-xl font-bold text-white mb-2">
        How the Synaptic Memory Works
      </h2>
      <p className="text-xs font-mono text-pw-accent/70 mb-2">
        Learning goal: describe how BDH-CQ stores demonstrations differently from a Transformer.
      </p>
      <p className="text-sm text-navy-300 mb-6">
        The memory comparison above shows how a Transformer KV cache and a synaptic
        matrix respond to the same demonstrations. Here is the mathematics behind
        the write.
      </p>

      <div className="bg-navy-800/50 border border-navy-700/40 rounded-2xl p-6 mb-6 max-w-2xl">
        <h3 className="text-base font-semibold text-navy-100 mb-3">
          Synaptic Update Rule
        </h3>
        <div className="font-mono text-base text-pw-accent space-y-1.5">
          <p>Write: S<sub>t</sub> = S<sub>t-1</sub> + x<sup>T</sup> · v</p>
          <p>Read:&nbsp; o<sub>t</sub> = x · S<sub>t</sub></p>
        </div>
        <p className="text-sm text-navy-300 mt-4 leading-relaxed">
          Each demonstration writes a rank-1 outer product into the fixed-size
          synaptic state S. Reading multiplies the current query by S. No growing
          cache, but interference appears when S fills.
        </p>
        <p className="text-sm text-pw-accent/90 mt-4 leading-relaxed">
          The exact <span className="font-mono">φ(K) ⊗ V</span> form of this rule runs on
          trained weights in view 1, where every value is computed in the browser.
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
          This is session-scoped adaptation. Demonstrations are absorbed into S
          for the current task. When the session ends, S resets to zero. Consolidating
          useful fast state into durable slow weights remains an open problem
          (Dragon Hatchling, arXiv:2509.26507, Conclusion).
        </p>
      </div>
    </section>
  )
}
