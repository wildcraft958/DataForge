export default function BDHModule() {
  return (
    <section className="mt-10 sm:mt-16">
      <p className="text-sm font-mono text-pw-violet mb-3">
        Learning goal: describe how BDH-CQ stores demonstrations differently from a Transformer.
      </p>
      <h2 className="h-section mb-4">
        How the Synaptic Memory Works
      </h2>
      <p className="lead mb-7 max-w-3xl">
        The memory comparison above shows how a Transformer KV cache and a synaptic
        matrix respond to the same demonstrations. Here is the mathematics behind
        the write.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="card card-accent-violet p-6 sm:p-7">
          <h3 className="h-card mb-4">
            Synaptic Update Rule
          </h3>
          <div className="font-mono text-lg text-pw-accent space-y-2">
            <p>Write: S<sub>t</sub> = S<sub>t-1</sub> + x<sup>T</sup> · v</p>
            <p>Read:&nbsp; o<sub>t</sub> = x · S<sub>t</sub></p>
          </div>
          <p className="text-sm text-navy-300 mt-5 leading-relaxed">
            Each demonstration writes a rank-1 outer product into the fixed-size
            synaptic state S. Reading multiplies the current query by S. No growing
            cache, but interference appears when S fills.
          </p>
          <p className="text-sm text-pw-accent/90 mt-4 leading-relaxed">
            The exact <span className="font-mono">φ(K) ⊗ V</span> form of this rule runs on
            trained weights in view 1, where every value is computed in the browser.
          </p>
          <p className="cite mt-5">
            Source: Pathway BDH Explainer Chapter 2, "From Attention to Synapses."
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="card card-accent-red bg-pw-error/5 px-6 py-5 text-sm text-pw-error/80 leading-relaxed">
            <span className="font-semibold text-pw-error">Simplified illustration.</span>{' '}
            This is not the official BDH implementation. It omits low-rank compression,
            the positional operator U, excitatory/inhibitory circuits, and ReLU gating.
            N = 16 for visual clarity; real BDH uses much larger dimensions.
          </div>

          <div className="card p-6 sm:p-7">
            <h3 className="h-card mb-3">
              Limitation
            </h3>
            <p className="text-sm text-navy-300 leading-relaxed">
              This is session-scoped adaptation. Demonstrations are absorbed into S
              for the current task. When the session ends, S resets to zero. Consolidating
              useful fast state into durable slow weights remains an open problem
              (Dragon Hatchling, arXiv:2509.26507, Conclusion).
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
