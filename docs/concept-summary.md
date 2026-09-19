# What BDH Remembers: Demonstration Coverage and Extrapolation

## The Claim

A model that learns from demonstrations fails on hard problems not because it lacks the capability, but because the demonstrations did not cover that difficulty. Adding one demonstration at the harder level restores performance. The weights do not change. The question does not change. Only the examples change.

Pathway's BDH shows why. It holds what it learns in one synaptic matrix S of fixed size, and each token writes a single outer product into it. Because S never grows and is only ever added to, what S holds is decided by what you wrote into it. Capability was never the variable. S was.

## The Task

We use an ordering task: colored bars on a 10x10 grid, sorted by height. Complexity is the number of bars (2 to 8). Each task set has three demonstration pairs and one query.

**Covered:** at least one demo matches the query complexity. **Uncovered:** all demos have at most 3 bars. The query grid is identical in both conditions. Only the demonstrations differ.

## The Models

We trained two, and each carries half of the argument.

The first is a two-layer causal linear-attention model (32 dimensions, 16 feature dimensions, feature map ELU(x) + 1). It runs in the browser and exposes the write itself: `C = phi(K) x V`, then `S = S + C`, read as `context = phi(Q)S / (phi(Q)Z + e)`. That is the form Pathway derives in BDH Explainer Chapter 2. Every number on screen is computed live from trained weights, and clicking one cell of C shows the multiplication behind it.

The second is a decoder-only transformer (6 layers, 256 dimensions, 8 heads, ~4.2 million parameters), trained on 10,500 covered tasks across all complexities. Given matching demonstrations, it solved every level.

## Results

| Complexity | Covered EM | Uncovered EM | Gap | Uncovered set holds a match? |
|---|---|---|---|---|
| 2 | 100% | 100% | 0 pp | yes |
| 3 | 100% | 0% | 100 pp | yes |
| 5 | 100% | 0% | 100 pp | no |
| 6 | 100% | 40% | 60 pp | no |
| 8 | 100% | 0% | 100 pp | no |

EM is exact match, cell for cell, ten seeds per cell.

Complexity 2 and 3 do not test coverage. The uncovered set is always 2, 3 and 3 bars, so at those two complexities it still holds a match. At 2 bars the model is correct in both settings, which is the control we want. At 3 bars it fails in the uncovered setting although a match is present. That gap has some other cause, and we do not count it as evidence. The claim rests on complexity 4 and above. Complexity 6 recovers to 40 percent, so the fall is not monotonic and we do not claim it is.

## The Meta-Learning Connection

In-context learning is implicit meta-learning. Von Oswald et al. (arXiv:2212.07677, ICML 2023) showed that a transformer forward pass implements gradient-descent-style updates on its internal representations. Demonstrations are not passive context. They are a training signal processed in one pass.

Min et al. (arXiv:2202.12837, EMNLP 2022) found that the distribution of demonstrations matters more than label correctness. That predicts our result: what breaks in-context learning is not wrong examples but missing difficulty.

The mechanism is not toy-specific. GPT-6 Astra (OpenAI, September 2026) and Claude Opus 5 learn from demonstrations the same way. Our small model makes the effect cheap to see.

## Connection to BDH-CQ

BDH-CQ is a 150-million-parameter model on Pathway's Dragon Hatchling architecture (arXiv:2608.09888). It holds demonstrations in that same fixed-size synaptic state rather than a growing key-value cache, and scores 29.5% pass@2 on ARC-AGI-1 at $0.00070 per task.

It shows the same cliff, on the same task family. At ordering length 8 it scores 0/24 without supporting examples and 12/24 with them (Table 3). At nesting depth 5 the same change moves 15/24 to 16/24, so operations differ in how much they depend on coverage.

The ladder experiment traces the edge: ordering holds through length 5, then falls to 29/36 at 6, 8/24 at 7 and 1/24 at 8. Propagation and copying never fall (48/48 at all distances). Some operations extrapolate and some do not.

## System Comparison

| System | Adaptation | Weight updates | Memory | ARC-AGI-1 | Cost per task |
|---|---|---|---|---|---|
| BDH-CQ | Recurrent state absorbs demos | No | Fixed-size matrix | 29.5% pass@2 | $0.00070 |
| HRM | Gradient optimization on demo pairs | Yes | Growing buffers | 40.3% (27M params) | $1.48 |
| TRM | Learned identity embedding per puzzle | Yes | Growing buffers | 45% (7M params) | $1.76 |

HRM and TRM both score higher than BDH-CQ, and both need a backward pass at inference. That is where their cost sits. ARC Prize reports $1.48 and $1.76 per task, quoted in Section 8 of the BDH-CQ report, against $0.00070: a gap near 2,000 times. Read BDH-CQ as the accuracy-per-dollar result, not the accuracy result. An independent black-box audit by co-authors at Bielik and NYU reproduced the 29.5% score (Section 5), covering accuracy but not cost.

## Strengths and Limitations

The claim is falsifiable and reproducible in under 60 seconds. Both models are real and run in the browser. Every number traces to a paper or to committed data.

Both train on synthetic families, and the cliff we measure is specific to ordering. Propagation does not show it, even in BDH-CQ's own results.

View 1 runs the kernelised write on trained weights, which is the real rule, but at two layers and 32 dimensions. The heatmap in view 2 is a simplified illustration that omits low-rank compression, the positional operator and gating. Neither is BDH.

All BDH-CQ numbers are developer-reported. We did not run BDH-CQ: no public weights exist and its dimensions stay proprietary. No independent team reproduced it, and none tested it outside the ARC family. Treat it as an early demonstration: one paper, one team, one benchmark.

Adaptation here is session-scoped. Neither model retains anything between sessions. Consolidating fast synaptic state into durable weights is open (arXiv:2509.26507, Conclusion).

## Key References

1. BDH-CQ report, arXiv:2608.09888, August 2026
2. Dragon Hatchling, arXiv:2509.26507, September 2025
3. Coconut (latent reasoning baseline), arXiv:2412.06769, December 2024
4. Von Oswald et al., "Transformers Learn In-Context by Gradient Descent," arXiv:2212.07677, ICML 2023
5. Min et al., "Rethinking the Role of Demonstrations," arXiv:2202.12837, EMNLP 2022
