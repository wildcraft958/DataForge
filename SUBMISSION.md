# SUBMISSION.md: DataForge 2026, Pathway Track

## Topic: Demonstration Coverage and Extrapolation

## The Claim

A system that learns a rule from demonstrations applies it reliably only within the complexity range those demonstrations covered. Adding a single demonstration at the harder level, changing nothing else, restores performance.

## Audience

Undergraduate CS students and early-career ML engineers who use few-shot prompting but have not thought about why it fails on hard cases. The reader knows what a neural network does and has given a model examples before asking a question.

## Learning Objectives

After using this artifact, the learner can:

1. Explain that in-context learning success depends on the complexity range of the demonstrations, not just the trained capability of the model.
2. Inspect the gap between demonstration complexity and query complexity, and predict whether the model will fail.
3. Describe how BDH-CQ stores demonstrations differently from a Transformer (recurrent synaptic state vs. growing KV cache) and why both are still subject to coverage limits.
4. Name the open limitation: this is session-scoped adaptation, not durable cross-session learning.
5. Manipulate a real concept variable (coverage toggle) and observe an immediate consequence (model output changes).
6. Compare model output with ground truth and identify where the model fails.
7. Recognize at least one misconception: "the model cannot do this" vs. "the demonstrations did not reach that far."

These map to the seven "Your Mission" learning outcomes (Pathway PS, page 7).

## Architecture Overview

The artifact is a single-page React application with three modules.

```
+---------------------------------------------------------------+
|                   MODULE 1: LIVE EXPLORER                     |
|                                                               |
|  +----------+  +--------+  +-------------+--------------+     |
|  |  DEMOS   |  | QUERY  |  | MODEL OUT   | ORACLE OUT   |     |
|  | (3 pairs)|  | (input)|  |             |              |     |
|  |          |  |        |  |   [diff overlay in red]     |     |
|  +----------+  +--------+  +-------------+--------------+     |
|                                                               |
|  Status: Exact match | Dims OK | Cell error: 0%              |
|  [LIVE] or [PRECOMPUTED] badge                                |
|                                                               |
|  [======= Complexity: 2 -------------------- 8 =======]      |
|  [ ] Add supporting demonstration at current level            |
|                                                               |
+---------------------------------------------------------------+
|                  MODULE 2: BDH SUBSTRATE                      |
|                                                               |
|  +----------------------+  +--------------------------+       |
|  | TRANSFORMER KV VIEW  |  | HEBBIAN MEMORY VIEW      |       |
|  |                      |  |                          |       |
|  | Growing list of      |  | Fixed NxN matrix sigma   |       |
|  | key-value pairs      |  | with outer-product       |       |
|  | (bars grow with      |  | writes (heatmap,         |       |
|  |  each demo)          |  | changes on each demo)    |       |
|  |                      |  |                          |       |
|  | Cost: O(n^2) in      |  | Cost: O(1) per token     |       |
|  | sequence length      |  | but finite capacity      |       |
|  +----------------------+  +--------------------------+       |
|                                                               |
|  Equations sourced from: Pathway BDH Explainer Ch. 2          |
|  Label: SIMPLIFIED ILLUSTRATION, not official BDH             |
|                                                               |
+---------------------------------------------------------------+
|               MODULE 3: EVIDENCE & COMPARISON                 |
|                                                               |
|  Our toy model results (live or precomputed, labeled)         |
|  BDH-CQ Table 3 numbers (developer-reported, labeled)        |
|  Comparison table: BDH-CQ vs HRM/TRM vs CoT LLMs            |
|  Limitation: session-scoped, not durable                      |
|  Open problem: fast-state to slow-weight consolidation        |
+---------------------------------------------------------------+
```

## Precomputed-First Architecture

The UI works from precomputed JSON on day 7, before ONNX export exists. ONNX Runtime Web loads the model in the background. When ONNX is ready, the badge flips from PRECOMPUTED to LIVE and live results replace the precomputed ones. If ONNX inference is too slow (110 forward passes x ~50 ms = 5.5 s), the badge stays on PRECOMPUTED. This is not a fallback. It is the primary path. The badge is honest at all times.

## Five Components, in Build Order

### A. Task Generator (Python, offline)

A deterministic generator for the ordering task family. Colored bars of varying heights on a 10x10 grid. The rule: sort shortest-to-tallest, left-to-right. Complexity = number of bars (2 through 8).

Algorithm for `generate_ordering_task(n_bars, grid_w=10, grid_h=10, seed)`:

1. Seed the RNG.
2. Sample `n_bars` distinct heights from 1 to 8 and `n_bars` distinct colors from 1 to 9.
3. Input grid: place bars at evenly spaced x-positions in a random permutation. Each bar fills cells from the bottom row upward.
4. Output grid: same bars placed left-to-right in ascending height order. Bar colors preserved.

Coverage conditions:

- Covered: at least one of the 3 demos has n_bars == query complexity.
- Uncovered: all 3 demos have n_bars <= 3.
- The query grid is identical between covered and uncovered for the same seed. Only the demos change.

Task bank sizes:

- Training: 7 complexities x 1,500 seeds x 2 conditions = 21,000 task sets
- Validation: 25 seeds per complexity
- Frontend: 10 seeds per complexity

arc-task-gen verdict: Pathway's `pathwaycom/arc-task-gen` (MIT license) generates random ARC tasks via LLM and supports Ollama. It is unsuitable for this project for two reasons. First, it generates random ARC tasks, not the ordering family. Second, it targets evaluation-scale batches (32 to 400 tasks), not training-scale (10,000+). Its stratified generator has an `object_sorting_rank` mechanic worth testing as a stretch experiment. Cited in the README.

Second task family (stretch, week 3): Nested containment. Recolor cells inside nested rectangular frames. Complexity = nesting depth (1 through 5). These fail differently from ordering: ordering breaks the grid shape, nesting gets one cell wrong.

Files:

- `generator/ordering.py`
- `generator/export.py`
- `generator/tests/test_ordering.py` (8 tests, written first)

### B. Model (PyTorch, train on Colab)

Small decoder-only transformer.

| Parameter    | Value |
|-------------|-------|
| Layers      | 6     |
| d_model     | 256   |
| Heads       | 8     |
| FFN width   | 1024  |
| Vocab       | 13 (colors 0-9, ROW_SEP, GRID_SEP, PAD) |
| Parameters  | ~4.2M |
| Max seq len | 1024  |

Tokenization: grid rows flattened with ROW_SEP between rows, GRID_SEP between grids. A full task (3 demo pairs + query input) is ~776 tokens.

Training: all tasks use COVERED demos. The model learns it can solve all complexities. AdamW, lr 3e-4, cosine warmup, batch 32, ~30 epochs. Estimated 2 to 6 hours on a T4.

ONNX export for browser inference. Autoregressive decoding: 110 forward passes x ~50 ms = 5.5 s. If too slow, the badge stays on PRECOMPUTED.

Files:

- `model/tokenizer.py`
- `model/architecture.py`
- `model/train.py` (Colab-compatible)
- `model/validate.py` (the week 1 gate script)
- `model/export_onnx.py`
- `model/generate_precomputed.py`
- `model/tests/test_tokenizer.py`
- `model/tests/test_architecture.py`

### C. BDH Toy Substrate (~80 lines JS)

Implements the simplified Hebbian outer-product write/read rule from Pathway's BDH Explainer Chapter 2, "From Attention to Synapses":

```
Write: sigma_t = sigma_{t-1} + x^T * v
Read:  o_t = x * sigma_t
```

N = 16 for visual clarity. Grids encoded to 16-dimensional vectors via a fixed random projection matrix.

As demos are written, the learner watches the sigma heatmap light up. When capacity overflows, interference appears. On session reset, the heatmap vanishes.

Always labeled: "Simplified illustration of the BDH update rule. Not official BDH."

What this omits: low-rank compression, positional operator U, excitatory/inhibitory circuits, ReLU gating.

Before writing from scratch, study the official (toy) BDH implementation at github.com/pathwaycom/bdh (linked on PS page 8). If the code is suitable, fork it and add the heatmap visualization as the meaningful contribution. Cite it either way.

Files:

- `bdh-toy/hebbian.js`
- `bdh-toy/tests/hebbian.test.js` (5 tests)

### D. Interface (React + Vite + Tailwind)

Single-page app with three sections.

Section 1 (Live Explorer): Demo panel (3 pairs), query panel, output comparison with diff overlay, status strip, LIVE/PRECOMPUTED badge, complexity slider (2 to 8), coverage toggle.

Section 2 (BDH Substrate): Side-by-side KV cache visualization (growing bars) and Hebbian heatmap (fixed NxN matrix). When demos change, both panels update. Comparison table (BDH-CQ vs HRM vs CoT LLMs). Equations. Limitation statement.

Section 3 (Evidence): Developer-reported BDH-CQ numbers from Table 3, our model results (live or precomputed), labeled by source.

Guided-then-sandbox flow (6 steps, under 90 seconds):

1. Open at complexity 3, covered, already correct.
2. Text: "Drag the slider to 8." The model still works because demos cover this difficulty.
3. Text: "Flip the toggle to remove the matching example."
4. User flips to uncovered. The model fails. Same question, same weights, only the examples changed.
5. Text: "Scroll down to the BDH section."
6. Text: "That is the claim: coverage, not capability. Explore freely." All controls unlock.

ONNX Runtime Web loads the model in the background. Precomputed JSON shows instantly. When ONNX is ready, badge flips to LIVE.

Files:

- `web/src/components/GridRenderer.jsx`
- `web/src/components/DemoPanel.jsx`
- `web/src/components/QueryPanel.jsx`
- `web/src/components/OutputComparison.jsx`
- `web/src/components/StatusStrip.jsx`
- `web/src/components/LiveBadge.jsx`
- `web/src/components/Controls.jsx`
- `web/src/components/KVCacheViz.jsx`
- `web/src/components/HebbianViz.jsx`
- `web/src/components/BDHModule.jsx`
- `web/src/components/EvidenceTable.jsx`
- `web/src/components/GuidedFlow.jsx`
- `web/src/hooks/useOnnxInference.js`
- `web/src/App.jsx`

### E. Written Deliverables

- `README.md`: claim, audience, prerequisites, objectives, architecture, live/precomputed/synthetic/animated labels, reproduction instructions, credits, licenses, setup instructions for any notebook or local component
- `docs/concept-summary.md` (render to PDF, 500 to 950 words). Self-contained briefing for an average data scientist. Comparison table encouraged. Every sentence contributes a definition, mechanism, evidence, limitation, or connection.
- `docs/blog.md` (render to PDF, separate deliverable from the concept summary)
- `docs/judge-qa.md` (10+ anticipated questions with rehearsed answers)
- `LICENCES.md`: source and license record for code, data, weights, graphics, fonts, and reused components
- `AI_DISCLOSURE.md`: AI assistance, code, data, asset, and license disclosure

## Week 1 Gate

Run `model/validate.py` on the trained model. Print a table:

```
Complexity | Covered EM | Uncovered EM | Gap
    8      |   >= 50%   |   <= 20%     | >= 30pp
```

All three conditions must hold. If they do not:

1. Make sure that uncovered demos truly have n_bars <= 3 (data bug).
2. Increase model to d_model 384, 8 layers (~8M params).
3. Double training data (3,000 seeds per complexity).
4. Try 8x8 grids instead of 10x10.
5. Last resort: switch task family.

Do not proceed to week 2 without passing this gate.

## Verified BDH-CQ Evidence (from SOTA search)

Table 3 (pass@1 / pass@2):

- Ordering length 8, short context: 0/24, 0/24
- Ordering length 8, supported: 12/24, 13/24
- Nesting depth 5, short: 15/24, 19/24
- Nesting depth 5, supported: 16/24, 24/24

Ladder experiment (richer than Table 3):

- Ordering: saturated through 5, falls to 29/36 at 6, 8/24 at 7, 1/24 at 8
- Propagation/copying: no ceiling (48/48 at distances 2 to 8)

Include both in the evidence section. Some operations extrapolate; some do not.

## One-Page Concept Summary Skeleton

When the artifact is complete, write this section last.

P1, Claim (~60 words): The falsifiable sentence. One line on why it matters.

P2, Design pressure (~90 words): In-context learning exists so models can adapt without retraining. The naive assumption: failure on hard instances means the model lacks capability. Why that is wrong.

P3, Mechanism (~130 words): When demonstrations arrive, what changes. Transformer: growing KV cache, re-attended every step. BDH-CQ: fixed-size recurrent state, latent iteration, answer-only decoding. Trade-off: no growing cache, but finite capacity and interference.

P4, Our artifact (~110 words): What we built. What is live, what is precomputed. The model is ours and small. Training spans the full complexity range. Context is the only variable.

P5, Evidence (~150 words): Our result. Then Pathway's result: developer-reported, no public model weights, independent black-box audit. Numbers: 0/24 to 13/24, 19/24 to 24/24. Byte-identical inputs.

P6, Comparison (~110 words): Three-row table. BDH-CQ vs HRM/TRM vs CoT LLMs. Compare on adaptation mechanism, cost, observability.

P7, Limitations (~110 words): Three honest ones. (1) Our model is tiny and single-family. (2) BDH-CQ internals are proprietary. (3) Session-scoped only; consolidation into durable weights is unsolved.

P8, Continue learning (~70 words): Primary sources. The next question.

Quality test from the PS: paste it into a fresh AI chat with zero context. If the AI can accurately explain the claim, mechanism, BDH's role, evidence, and limitations, it passes.

## Papers to Cite

Must-cite (central to the claim):

1. BDH-CQ report. Engdahl, Kosowski, Chorowski, Stamirowska, Uznanski, Jiang, Phadke, Kinas, Zhong. arXiv:2608.09888, Aug 2026. Table 3 + ladder experiments.
2. Dragon Hatchling. Kosowski, Uznanski, Chorowski, Stamirowska, Bartoszkiewicz. arXiv:2509.26507, Sep 2025. Architecture, Hebbian derivation.
3. Coconut. Hao et al. "Training Large Language Models to Reason in a Continuous Latent Space." arXiv:2412.06769, Dec 2024. Latent reasoning baseline.

Cite also:

4. Von Oswald et al. "Transformers Learn In-Context by Gradient Descent." arXiv:2212.07677, ICML 2023. ICL as implicit meta-learning.
5. Min et al. "Rethinking the Role of Demonstrations." arXiv:2202.12837, EMNLP 2022. Demo distribution matters more than label correctness.
6. HRM. Wang et al. arXiv:2506.21734, 2025. Contrast: adaptation by optimization.
7. TRM / Tiny Recursive Models. 7M params, 45% ARC-AGI-1. Contrast: recursive improvement via backward pass.
8. Recurrent Depth. Geiping et al. arXiv:2502.05171, 2025.
9. ConceptARC. Moskvichev, Odouard, Mitchell. TMLR 2023.
10. Chollet. arXiv:1911.01547.

Design precedent:

- Transformer Explainer (Georgia Tech, CHI 2026): runs GPT-2 live in-browser via ONNX Runtime, progressive disclosure, adjustable parameters, D3.js. Our architecture mirrors this.

Rule: before submission, make sure that every citation matches the actual paper.

## Team Roles and Schedule

| Person | Owns | Core task |
|--------|------|-----------|
| P1, ML | Generator + Model | Task generation, model training, ONNX export, validation |
| P2, Frontend | Interface + BDH viz | React app, grid renderer, ONNX integration, heatmap, guided flow |
| P3, Research | BDH module + claims | Reads papers, writes BDH section, verifies all claims, defense prep |
| P4, Writer | README, PDF, disclosures | Written deliverables, reproduction testing, license tracking, QA |

### Day 0: Scaffolding (all, 2 hours)

- `git init`, `.gitignore`, directory tree
- `npm create vite@latest web -- --template react`, install Tailwind
- `generator/requirements.txt` (numpy), `model/requirements.txt` (torch, numpy, onnx, onnxruntime)
- Stub files: README.md, LICENCES.md, AI_DISCLOSURE.md
- Initial commit

Make sure that `cd web && npm run dev` serves a page. Make sure that Python imports work.

### Days 1 to 7: Foundation (week 1)

| Person | Work | Done when |
|--------|------|-----------|
| P1 | Generator tests, generator, task bank, model architecture, tokenizer, training loop, VALIDATE | All 8 generator tests pass. Training loss decreases. Week 1 gate passes. |
| P2 | GridRenderer, DemoPanel, QueryPanel, OutputComparison, StatusStrip, LiveBadge, Controls. Wire precomputed JSON. | Full UI renders from mock precomputed data. Slider and toggle update the display. |
| P3 | Read Dragon Hatchling and BDH-CQ papers cover-to-cover. Write notes on the Hebbian update derivation. | Can explain the write/read equations from memory. |
| P4 | README skeleton, license research, AI disclosure log, repo structure. | README has all section headers. Disclosure log is active. |

### Days 8 to 14: Integration (week 2)

| Person | Work | Done when |
|--------|------|-----------|
| P1 | ONNX export, make sure that ONNX output matches PyTorch, generate precomputed.json, help P2 integrate. | ONNX file loads in browser. Precomputed JSON covers all conditions. |
| P2 | ONNX Runtime Web integration, KV cache viz, Hebbian heatmap, BDH module layout, guided flow. | End-to-end demo works. Both memory panels animate. Guided flow completes in under 90 seconds. |
| P3 | Write BDH section text and equations, build evidence table content, make sure that every claim has a citation. | BDH section is technically complete. Every number traces to a paper. |
| P4 | First draft of one-page concept summary, license record, start judge Q&A with P3. | Summary exists and passes the AI quality test. |

### Days 15 to 21: Polish (week 3)

- P1: if feasible, second task family (nesting); edge cases; precomputed data
- P2: mobile responsiveness, loading states, cross-browser test, visual polish
- P3: review ALL claims against primary sources, write judge Q&A, defense prep
- P4: README final, reproduction test (clone from scratch, follow instructions)

### Days 22 to 28: Ship (submit 2 days early)

- Final model saved, ONNX parity tested
- Deploy to Vercel (free tier, zero-config for Vite)
- Cross-browser test (Chrome, Firefox, Safari, mobile)
- PDF export of concept summary and blog
- Live-defense rehearsal
- Submit 48 hours before deadline

## Comparison Table (for concept summary and BDH module)

| System | How it adapts | Updates weights at inference? | Cost per ARC task |
|--------|--------------|------------------------------|-------------------|
| BDH-CQ | Recurrent state absorbs demos | No | $0.00070 |
| HRM | Optimizes on augmented demo pairs | Yes (backward pass) | $1.48 |
| TRM | Learned identity embedding per puzzle | Yes (backward pass) | $1.76 |
| CoT LLMs | Demos in context, reasoning in tokens | No | Scales with trace |

## Risks

| Risk | Mitigation |
|------|------------|
| Model does not show coverage cliff | Day 7 gate. Fallback: increase model size, change task, use precomputed BDH-CQ numbers only. |
| ONNX inference too slow in-browser | Precomputed-first architecture. ONNX is a bonus. Honest badge. |
| Citation error (major penalty) | P3 makes sure that every citation matches the paper. Second review on day 14. |
| BDH toy mislabeled as official | Disclaimer banner is a constant in the component. Review day 14. |
| Mobile layout breaks | Test on day 12. Tailwind responsive utilities. |

## Deployment

Vercel free tier. `npm run build` in `/web/`, deploy `dist/`. If the ONNX model exceeds Vercel's asset limit, host it on GitHub Releases and load via URL.

## Deliverables Checklist (from PS pages 10 to 12)

- [ ] Public artifact URL (opens without sign-in)
- [ ] Public source code repository
- [ ] Blog as PDF (separate from concept summary)
- [ ] Complete README (claim, audience, prerequisites, objectives, architecture, role of every component, live/precomputed/synthetic/animated labels, reproduction instructions, credits, licenses)
- [ ] Clear setup instructions for any notebook or local component
- [ ] One-page concept summary PDF (500 to 950 words, self-contained briefing, passes the "give it to a fresh AI" quality test)
- [ ] 3+ primary papers from 2022 to 2026 cited beside technical claims
- [ ] Source and license record (code, data, weights, graphics, fonts, reused)
- [ ] AI assistance, code, data, asset, and license disclosure
- [ ] LIVE/PRECOMPUTED badge works correctly and honestly
- [ ] BDH toy labeled as simplified illustration, not official BDH
- [ ] Guided flow completes in under 90 seconds (60-second test in rubric)
- [ ] Mobile responsive
- [ ] Every number traces to a specific section of a specific paper
- [ ] Comparison table in concept summary (encouraged by PS)
- [ ] All seven "Your Mission" learning outcomes addressed
- [ ] Submitted 48 hours early

## What "done" looks like

A stranger opens the URL. The page is already showing a working puzzle. They drag a slider. The AI breaks. They flip a toggle. It comes back. They scroll down and watch two memory architectures respond to the same demonstrations. One grows; one rewrites. They read three paragraphs that connect this to a real frontier system, with honest labels and real numbers. They leave understanding something true that they did not know before.
