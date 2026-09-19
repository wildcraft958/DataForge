import { Component } from 'react'

// The trace view is the more fragile of the two: it runs a second model and
// carries imported CSS. A failure here must not take the coverage demo with it.
export default class TraceLabBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <p className="text-sm text-navy-200 mb-5">
          The live trace could not start. The mechanism it shows is below, and
          the coverage view is unaffected.
        </p>
        <div className="rounded-lg border border-navy-700/50 bg-navy-900/60 px-5 py-5 font-mono text-sm text-pw-cyan space-y-2">
          <p>C = φ(K) ⊗ V</p>
          <p>S ← S + C</p>
          <p>context = φ(Q)ᵀS / (φ(Q)ᵀZ + ε)</p>
        </div>
        <p className="text-xs text-navy-400 mt-4">
          Pathway, BDH Explainer Chapter 2. Dragon Hatchling, arXiv:2509.26507.
        </p>
        <button
          onClick={() => this.setState({ failed: false })}
          className="mt-5 px-4 py-2 rounded-lg text-xs font-semibold bg-pw-blue text-white"
        >
          Try again
        </button>
      </div>
    )
  }
}
