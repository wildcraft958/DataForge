export default function WhyItMattersCard() {
  return (
    <div className="my-8 rounded-xl border border-pw-blue/20 bg-pw-blue/[0.04] px-5 py-4">
      <h3 className="text-sm font-semibold text-pw-cyan mb-2">
        Why this matters beyond a toy demo
      </h3>
      <p className="text-sm text-navy-200 leading-relaxed mb-2">
        GPT-6 Astra (OpenAI, Sep 2026) and Claude Opus 5 (Anthropic, 2026) use
        the same mechanism you just tested: in-context learning from
        demonstrations. Von Oswald et al.{' '}
        <span className="text-navy-400">(arXiv:2212.07677)</span> showed that a
        transformer forward pass implements gradient-descent-style updates on
        internal representations. The demonstrations are a training signal, not
        passive context.
      </p>
      <p className="text-sm text-navy-200 leading-relaxed">
        When someone prompts a frontier model with three easy examples and then
        asks a hard question, the same coverage failure applies. Min et al.{' '}
        <span className="text-navy-400">(arXiv:2202.12837)</span> found that the
        distribution of demonstrations matters more than label correctness. Our
        4.2M model makes the effect visible. Frontier models make it
        consequential.
      </p>
    </div>
  )
}
