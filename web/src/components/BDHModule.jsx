/**
 * BDH substrate section: side-by-side KV cache and Hebbian memory,
 * with equations and limitation statement.
 */
import KVCacheViz from './KVCacheViz'
import HebbianViz from './HebbianViz'

export default function BDHModule({ demos = [] }) {
  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Two Memory Architectures
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        How a Transformer and BDH-CQ store demonstrations differently.
      </p>

      <div className="flex flex-wrap items-start gap-8 mb-8">
        <KVCacheViz demoCount={demos.length} />
        <HebbianViz demos={demos} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 max-w-xl">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Hebbian Update Rule
        </h3>
        <div className="font-mono text-sm text-gray-800 space-y-1">
          <p>Write: σ<sub>t</sub> = σ<sub>t-1</sub> + x<sup>T</sup> · v</p>
          <p>Read:&nbsp; o<sub>t</sub> = x · σ<sub>t</sub></p>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Each demonstration writes a rank-1 outer product into the fixed-size
          synaptic state σ. Reading multiplies the current query by σ. No growing
          cache, but interference appears when σ fills.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Source: Pathway BDH Explainer Chapter 2, "From Attention to Synapses."
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 max-w-xl">
        <strong>Simplified illustration.</strong> This is not the official BDH
        implementation. It omits low-rank compression, the positional operator U,
        excitatory/inhibitory circuits, and ReLU gating. N = 16 for visual clarity;
        real BDH uses much larger dimensions.
      </div>

      <div className="mt-6 max-w-xl">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Limitation
        </h3>
        <p className="text-sm text-gray-600">
          This is session-scoped adaptation. Demonstrations are absorbed into σ
          for the current task. When the session ends, σ resets to zero. Consolidating
          useful fast state into durable slow weights remains an open problem
          (Dragon Hatchling, arXiv:2509.26507, §Conclusion).
        </p>
      </div>
    </section>
  )
}
