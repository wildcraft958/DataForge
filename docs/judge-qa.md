# Judge Q&A: Live Defence Preparation

12 anticipated questions with rehearsed answers for the DataForge 2026 Pathway track presentation.

## 1. Is this just bias-variance tradeoff?

No. Bias-variance tradeoff is about model capacity. You change the model to fix it.

In our demo, the model stays the same. Same ~4.2 million parameters, same weights, same architecture. When the demos cover that difficulty, it scores 100% on complexity 8. When they do not, it scores 0%. The only thing that changes is the input context: which three demonstrations the model reads.

This is an in-context learning phenomenon. The model does not retrain. It reads the demos as part of its input sequence and uses them to infer the task. Coverage of the demo distribution determines success, not the model's complexity.

## 2. Why does the model fail without coverage?

The model learned to use demonstrations as templates. It reads a demo pair (input grid, output grid) and extracts the sorting rule from that example.

With only 2-bar and 3-bar demos, the model sees bars sorted in groups of two or three. It cannot figure out how to arrange 8 bars from those examples. The pattern matching does not extend beyond the demo distribution.

At complexity 6 uncovered, the model still gets 28% correct. Some partial transfer happens from the easy demos. At complexity 8, that transfer drops to 0%.

## 3. Why not use the real BDH-CQ model?

No public weights exist. The BDH-CQ technical report (arXiv:2608.09888) states that dimensions and update rules remain proprietary. We cannot run it, and we do not claim to have run it.

Every BDH-CQ number in our evidence table comes from Table 3 of that paper. We label each number as "developer-reported" to make this clear.

## 4. How is your Hebbian toy different from real BDH?

Our toy implements one equation from BDH Explainer Chapter 2, Step 4:

- Write: sigma_t = sigma_{t-1} + x^T * v (outer-product accumulation)
- Read: o_t = x * sigma_t (matrix-vector product)

It omits five components of the full BDH architecture:

1. Low-rank compression (E, D_x, D_y matrices)
2. Positional operator U
3. Excitatory/inhibitory circuits
4. ReLU gating on the read path
5. Elementwise product masking

The dimension is N=16 for visual clarity. Real BDH uses much larger dimensions. The toy is always labeled "Simplified illustration. This is not the official BDH implementation."

## 5. Does this generalize beyond ordering tasks?

Yes, for some operations. No, for others.

BDH-CQ Table 3 shows the same coverage cliff on nesting tasks (depth 5): uncovered 15/24, covered 16/24 at pass@1. At pass@2 the gap widens: 19/24 uncovered, 24/24 covered.

The ladder experiment (same paper) shows ordering saturates through complexity 5, then falls: 29/36 at 6, 8/24 at 7, 1/24 at 8.

But propagation and copying tasks show no cliff at all: 48/48 at distances 2 through 8. Some operations extrapolate naturally. The coverage cliff is task-dependent, not universal. We state this in the evidence section.

## 6. What if you trained on uncovered demos too?

The model learns to handle both conditions. When the demos do not match query complexity, it uses a fallback strategy.

That is not the point of the demo. The point is that standard training (covered demos only, which is how few-shot systems work in practice) creates a blind spot. Users assume the model "cannot do hard tasks." The real issue is that the examples did not reach that far.

## 7. Why a small model instead of a large LLM?

Three reasons:

1. Control: we train from scratch and control every variable. A large LLM brings pre-trained knowledge that confounds the demo.
2. Transparency: at ~4.2 million parameters, we can explain every design choice. The model does nothing we did not build.
3. Browser execution: the ONNX model is 19 MB. It can run live in-browser via ONNX Runtime Web. A large LLM cannot.

The small model is a teaching tool, not a production system. Its job is to make the coverage cliff visible and manipulable.

## 8. How honest is the LIVE/PRECOMPUTED badge?

The badge reflects the actual data source at all times.

PRECOMPUTED (orange) means the prediction came from a JSON file generated offline with the same model weights. When the page loads, this is the default state.

LIVE (green) means ONNX Runtime Web loaded the model in the browser and ran inference on the current task. When the ONNX session is ready, the badge flips automatically.

If ONNX fails to load or runs too slowly, the badge stays on PRECOMPUTED. We never hide the data source.

## 9. What are the limitations?

1. Session-scoped adaptation only. The model reads demos for one task and forgets them. It does not learn across tasks or sessions.
2. The Hebbian toy uses N=16. Real BDH uses much larger dimensions. The toy shows the principle, not the scale.
3. Our task family is synthetic. Colored bars on a grid are not natural data. The ordering rule is simple by design so the coverage cliff is unambiguous.
4. We test one model architecture (decoder-only transformer). A different architecture, such as a recurrent model, can behave differently.
5. Consolidating fast synaptic state into durable slow weights remains an open problem (Dragon Hatchling, arXiv:2509.26507, Conclusion).

## 10. How does BDH-CQ achieve $0.00070 per task?

BDH-CQ uses a recurrent synaptic state to absorb demonstrations. The state has a fixed size. It does not grow with the number of demos.

At inference, BDH-CQ does not run a backward pass. It reads the demos, updates the state, and generates the answer in one forward pass.

HRM ($1.48/task) and TRM ($1.76/task) both require gradient updates per puzzle. That means a full backward pass through the model for each new task. That is roughly 2000 times more expensive than BDH-CQ's forward-only approach.

This cost comparison comes from an independent black-box audit by co-authors at Bielik and NYU, reported in arXiv:2608.09888.

## 11. Can you reproduce BDH-CQ's Table 3 results?

No. No public weights, no public inference code, and the report states that architecture dimensions are proprietary. We cannot run the model.

We cite their numbers and label every one as "developer-reported, not our reproduction." The evidence table in our artifact states this above the data.

## 12. What do you do with more time?

Three extensions, in order of value:

1. Add the nesting task family (nested containment, depth 2 to 5). This shows the coverage cliff on a second, structurally different operation.
2. Add a ladder experiment visualization. Instead of a binary covered/uncovered toggle, a slider gradually increases demo complexity from 2 to 8. The learner watches accuracy fall off at the boundary.
3. Replace the standard attention layer with a BDH-style recurrent layer. This lets the learner compare how two memory architectures respond to the same coverage gap, using the same training data.

## 13. How did you cite your sources?

Three must-cite papers, all from 2024-2026:

1. BDH-CQ report (arXiv:2608.09888, Aug 2026): Table 3 numbers, ladder experiments, cost comparison
2. Dragon Hatchling (arXiv:2509.26507, Sep 2025): architecture, Hebbian update derivation
3. Coconut (arXiv:2412.06769, Dec 2024): latent reasoning baseline

Every number traces to a specific section of a specific paper. Citations sit beside the claim, not in a bibliography at the end.

## 14. Is this a meta-learning problem?

Yes. In-context learning is implicit meta-learning. Von Oswald et al. (arXiv:2212.07677, ICML 2023) showed that a transformer forward pass implements gradient-descent-style weight updates on its internal representations. The model reads demonstrations and adapts in a single pass, without any backward pass or weight change.

MAML and other meta-learning methods learn to adapt from a few examples. A transformer does the same thing, but the adaptation happens inside the forward pass. Our demo makes that visible: the model sees three examples and infers a rule. When the examples cover the difficulty, the rule works. When they do not, it fails. That is a meta-learning failure, not a capacity failure.

Min et al. (arXiv:2202.12837) found that the distribution of demonstrations matters more than their label correctness. The structure of the demo set, not its size, determines success. This is consistent with meta-learning theory: the support set must represent the task distribution.

## 15. Does this apply to large models like GPT-6 Astra?

Yes. The mechanism is the same at any scale. GPT-6 Astra (OpenAI, Sep 2026) and Claude Opus 5 (Anthropic, 2026) both use in-context learning. When a user gives three easy examples and asks a hard question, the coverage gap applies.

Our toy model has 4.2 million parameters. The gap is 100 percentage points at complexity 8. BDH-CQ has 150 million parameters and shows the same cliff on the same task family (0/24 to 12/24 at ordering length 8). More parameters do not fix the problem. The right demonstrations do.

The 100-percentage-point gap will not appear on every task at frontier scale. Pre-trained knowledge fills some gaps. But on novel tasks where the model must rely on the provided examples, the coverage cliff is real. Our demo lets a learner see it, test it, and understand why it happens.

## 16. What is the one thing a learner takes away?

A model that fails on a hard problem does not necessarily lack the capability. Often it lacks a demonstration at that difficulty level. Adding one example at the right complexity can restore full performance.

The misconception we correct: "the model cannot do this" versus "the demonstrations did not cover this."
