import { useState } from 'react'

/**
 * Standard attention against linear attention, as sequence length grows.
 *
 * The earlier version could not make its own point. Its grid used
 * `repeat(N, 1fr)` with square cells, so the block stayed exactly as wide as
 * its column whatever N was: dragging the slider only subdivided the same
 * square into smaller pieces. Nothing grew, which is the one thing the
 * comparison exists to show.
 *
 * Cells are a fixed size here, so the pairwise block genuinely grows with N
 * while the state block beside it never changes.
 */

const CELL = 13
const GAP = 2
const MIN = 3
const MAX = 18

export default function Comparison() {
  const [tokens, setTokens] = useState(8)

  const pairs = tokens * tokens
  const side = tokens * CELL + (tokens - 1) * GAP
  const track = MAX * CELL + (MAX - 1) * GAP // reserve the full extent so nothing reflows

  return (
    <section className="panel comparison">
      <h2>
        Scaling comparison <b>Presentation only</b>
      </h2>

      <p className="cmp-intro">
        Both sides read the same sentence. Only one of them grows.
      </p>

      <label className="cmp-slider">
        <span>Sequence length</span>
        <input
          aria-label="Sequence length"
          type="range"
          min={MIN}
          max={MAX}
          value={tokens}
          onChange={(e) => setTokens(+e.target.value)}
        />
        <b>{tokens}</b>
        <span className="cmp-unit">tokens</span>
      </label>

      <div className="compare-grid">
        <div className="cmp-side">
          <strong>Standard self-attention</strong>
          <div className="cmp-stage" style={{ minHeight: track }}>
            <div
              className="pairwise"
              style={{
                gridTemplateColumns: `repeat(${tokens}, ${CELL}px)`,
                gap: GAP,
                width: side,
                height: side,
              }}
              aria-hidden="true"
            >
              {Array.from({ length: pairs }, (_, i) => (
                <i key={i} />
              ))}
            </div>
          </div>
          <div className="cmp-readout">
            <span className="cmp-num cmp-grow">{pairs.toLocaleString()}</span>
            <small>
              pairwise scores, {tokens}&sup2;. Every token compared with every token.
            </small>
          </div>
        </div>

        <div className="cmp-side">
          <strong>Linear attention</strong>
          <div className="cmp-stage" style={{ minHeight: track }}>
            <div className="fixed-state" aria-hidden="true">
              <span className="fs-sym">S</span>
              <span className="fs-dim">d_feature &times; d_value</span>
              <span className="fs-sym">Z</span>
            </div>
          </div>
          <div className="cmp-readout">
            <span className="cmp-num cmp-fixed">528</span>
            <small>
              state cells: S is 16 &times; 32, plus 16 for Z. The same number at 3
              tokens and at 48.
            </small>
          </div>
        </div>
      </div>

      <p className="cite cmp-note">
        Cell counts, not runtime. Both sides still read every token once, so work
        grows with length on each. What changes is what has to be held: pairwise
        scores grow with the square of the length, the state does not grow at all.
      </p>
    </section>
  )
}
