/**
 * Simplified Hebbian memory from Pathway BDH Explainer Ch. 2, Step 4.
 *
 * Write: sigma_t = sigma_{t-1} + x^T * v   (outer-product accumulation)
 * Read:  o_t = x * sigma_t                  (matrix-vector product, then ReLU)
 *
 * This omits low-rank compression, positional operator U,
 * excitatory/inhibitory circuits, ReLU gating on the read,
 * and elementwise product masking from the full BDH architecture.
 */
export default class HebbianMemory {
  /**
   * @param {number} n - dimension of the square sigma matrix (default 16)
   */
  constructor(n = 16) {
    this.n = n;
    this.sigma = this._zeros();
  }

  /**
   * Outer-product write: sigma[i][j] += x[i] * v[j]
   * @param {number[]} x - key vector, length n
   * @param {number[]} v - value vector, length n
   */
  write(x, v) {
    const { n, sigma } = this;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        sigma[i][j] += x[i] * v[j];
      }
    }
  }

  /**
   * Query: o[j] = sum_i(x[i] * sigma[i][j]), then ReLU (clamp negatives to 0)
   * @param {number[]} x - query vector, length n
   * @returns {number[]} output vector, length n
   */
  read(x) {
    const { n, sigma } = this;
    const out = new Array(n);
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += x[i] * sigma[i][j];
      }
      out[j] = Math.max(0, sum);
    }
    return out;
  }

  /** Zero the sigma matrix. */
  reset() {
    this.sigma = this._zeros();
  }

  /**
   * Frobenius norm of sigma: sqrt(sum of all squared entries).
   * @returns {number}
   */
  energy() {
    const { n, sigma } = this;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        sum += sigma[i][j] * sigma[i][j];
      }
    }
    return Math.sqrt(sum);
  }

  /**
   * Returns a deep copy of the sigma matrix (for heatmap visualization).
   * @returns {number[][]}
   */
  getSigma() {
    return this.sigma.map((row) => row.slice());
  }

  /** @private */
  _zeros() {
    const { n } = this;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n).fill(0);
    }
    return m;
  }
}
