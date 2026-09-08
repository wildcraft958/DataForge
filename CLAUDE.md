# CLAUDE.md — DataForge 2026 Pathway Track

## Project summary

This is a hackathon submission for DataForge 2026, Pathway track. The team builds an interactive web explainer that teaches one idea. When the demonstrations do not cover that complexity range, the model fails on hard problems. The model still holds the capability. Adding one demonstration at the harder level restores it.

The artifact contains three modules: a live explorer with a trained model, a BDH memory substrate comparison, and an evidence section.

## Rubric (100 points, Pathway PS page 9)

| Criterion | Points |
|-----------|--------|
| Technical correctness and depth | 25 |
| Technical ownership and live defense | 15 |
| Learning effectiveness (60-second test) | 15 |
| Interactive substrate and honesty | 15 |
| BDH/BDH-CQ integration and evidence | 10 |
| Craft, accessibility, provenance | 10 |
| One-page concept summary | 10 |

Weak = static decks, animations passed off as real computation, bolted-on BDH.
Strong = one clear claim, real substrate, honest labeling, BDH that teaches.

## Seven learning outcomes (PS page 7)

A strong submission lets a learner:
1. Understand one precise technical claim
2. Manipulate a real concept variable
3. Observe an immediate, meaningful consequence
4. Compare system output with ground truth
5. Explain the concept back in their own words
6. Understand where the concept appears in BDH or BDH-CQ
7. Recognize at least one limitation, failure case, or misconception

## Repository structure

```
/
├── generator/          # Python, custom ordering task generator
│   ├── ordering.py     # Ordering task family (bars sorted by height)
│   ├── nesting.py      # Nested containment task family (stretch goal)
│   ├── export.py       # Exports tasks.json and precomputed.json
│   └── tests/
│       └── test_ordering.py  # 8 tests, written first (TDD)
│
├── model/              # Python, PyTorch training
│   ├── architecture.py # Decoder-only transformer, 6 layers, 4.2M params
│   ├── tokenizer.py    # Grid to token sequence with separators
│   ├── train.py        # Training script (Colab-compatible)
│   ├── validate.py     # Week 1 gate: validates coverage cliff exists
│   ├── export_onnx.py  # PyTorch to ONNX conversion
│   ├── generate_precomputed.py  # Precomputed results JSON
│   └── tests/
│       ├── test_tokenizer.py
│       └── test_architecture.py
│
├── bdh-toy/            # JS, simplified Hebbian memory illustration
│   ├── hebbian.js      # ~80 lines, outer-product write + read
│   └── tests/
│       └── hebbian.test.js  # 5 tests
│
├── web/                # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GridRenderer.jsx
│   │   │   ├── DemoPanel.jsx
│   │   │   ├── QueryPanel.jsx
│   │   │   ├── OutputComparison.jsx
│   │   │   ├── StatusStrip.jsx
│   │   │   ├── Controls.jsx
│   │   │   ├── KVCacheViz.jsx
│   │   │   ├── HebbianViz.jsx
│   │   │   ├── BDHModule.jsx
│   │   │   ├── EvidenceTable.jsx
│   │   │   ├── GuidedFlow.jsx
│   │   │   └── LiveBadge.jsx
│   │   ├── hooks/
│   │   │   └── useOnnxInference.js
│   │   ├── data/
│   │   │   ├── precomputed.json
│   │   │   └── tasks.json
│   │   └── App.jsx
│   ├── public/
│   │   └── model.onnx
│   └── package.json
│
├── docs/
│   ├── concept-summary.md    # One-page summary (render to PDF, 500-950 words)
│   ├── blog.md               # Blog post (render to PDF, SEPARATE deliverable)
│   ├── judge-qa.md           # 10+ anticipated judge questions with answers
│   └── figures/
│
├── SUBMISSION.md
├── README.md
├── LICENCES.md
├── AI_DISCLOSURE.md
└── CLAUDE.md
```

## Key decisions

### arc-task-gen verdict: write a custom generator

Pathway's `pathwaycom/arc-task-gen` (MIT license) generates random ARC tasks via LLM. It supports Ollama via OPENAI_BASE_URL (free). Two blockers remain:
1. It generates random ARC tasks, not the specific ordering family (sort bars by height).
2. It targets evaluation-scale batches (32-400 tasks), not training-scale (10,000+).

Write a custom deterministic generator (~200 lines of Python). Cite arc-task-gen in the README as "evaluated, unsuitable for our task family."

### Precomputed-first architecture

The UI always works from `precomputed.json`. ONNX Runtime Web loads the model in the background. When ONNX is ready, the badge flips from PRECOMPUTED to LIVE and live results replace precomputed. This means:
- The UI works from day 7 regardless of ONNX export timing
- If ONNX inference is too slow in-browser (~50ms x 110 passes = 5.5s), the badge stays PRECOMPUTED. The user still gets the full experience.
- The LIVE/PRECOMPUTED badge is always honest (15 rubric points for interactive substrate)

### Official BDH toy implementation

An official toy BDH implementation exists at github.com/pathwaycom/bdh (linked on PS page 8). Before writing the Hebbian toy from scratch, study this implementation. If the code is suitable, fork it and add the heatmap visualization. Cite it either way. The PS states: "Forks must add a meaningful contribution."

## Technical constraints

### The claim must be provable in the artifact

Every design decision serves one question: does the demo show that coverage (not capability) determines extrapolation? If a feature does not serve that, cut it.

### The model must be trained on the FULL complexity range

Train on bar counts 2 through 8. At inference, the variable you manipulate is which demonstrations the model sees, NOT what it was trained on. If you train only on easy tasks, the demo proves a boring point. The correct demo proves: the model CAN solve hard tasks but fails without coverage.

### BDH-CQ cannot be run

There are no public model weights. The technical report states that dimensions and update rules remain proprietary. Never claim we ran BDH-CQ. Use published equations, architecture diagrams, documented evaluations, and labeled precomputed results only.

### The BDH toy is a SIMPLIFIED ILLUSTRATION

The Hebbian memory module implements:
```
sigma_t = sigma_{t-1} + x_t^T * v_t    (write)
o_t = x_t * sigma_t                     (read)
```
This comes from Pathway's BDH Explainer Chapter 2 ("From Attention to Synapses"), Step 4. It omits: low-rank compression (E, D_x, D_y matrices), positional operator U, excitatory/inhibitory circuits, ReLU gating on the read, elementwise product masking. Always label it as simplified. Never present it as official BDH.

### Source for BDH equations

- Pathway BDH Explainer Ch. 2: https://pathway.com/research/bdh-explainer/bdh-architecture-derivation
- Dragon Hatchling paper: arXiv:2509.26507, §2 and Table 1
- BDH-CQ report: arXiv:2608.09888

### Verified BDH-CQ evidence

Table 3 (pass@1 / pass@2):
- Ordering length 8, short context: 0/24, 0/24
- Ordering length 8, supported: 12/24, 13/24
- Nesting depth 5, short: 15/24, 19/24
- Nesting depth 5, supported: 16/24, 24/24

Ladder experiment (richer than Table 3, include in evidence section):
- Ordering: saturated through 5, falls to 29/36 at 6, 8/24 at 7, 1/24 at 8
- Propagation/copying: no ceiling (48/48 at distances 2-8)
- Include both in the evidence section: some operations extrapolate, some do not

Cost comparison:
- BDH-CQ: $0.00070 per task
- HRM: $1.48 per task
- TRM: $1.76 per task
- Independent black-box audit by co-authors at Bielik and NYU

### LIVE/PRECOMPUTED badge

At all times, a visible badge must show whether the current output came from the ONNX model running live in-browser or from precomputed.json. This is a scoring criterion (15 points for interactive substrate honesty). Never hide it.

## Model specification

### Architecture
```python
class GridTransformer(nn.Module):
    # Decoder-only transformer
    # d_model: 256
    # n_layers: 6
    # n_heads: 8
    # d_ff: 1024
    # vocab_size: 13 (0-9 colors + ROW_SEP(10) + GRID_SEP(11) + PAD(12))
    # max_seq_len: 1024
    # ~4.2M parameters
```

### Tokenization

Grid rows flattened with ROW_SEP (10) between rows. GRID_SEP (11) between grids. PAD (12) for padding. A full task (3 demo pairs + query input) is ~776 tokens.

Input: `[demo1_in ROW_SEP ... GRID_SEP demo1_out GRID_SEP ... query_in]`
Target: `[query_out]`

### Training

- Dataset: ~10,000 tasks, complexity uniformly sampled 2-8
- All training tasks use COVERED demonstrations (demos match query complexity)
- At inference, create UNCOVERED conditions by swapping demos to lower complexity
- Optimizer: AdamW, lr 3e-4
- LR schedule: cosine warmup
- Batch size: 32
- ~30 epochs, estimated 2-6 hours on a T4

### Week 1 gate (the single most critical milestone)

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

If this gate does not pass, do not proceed to week 2.

## Task generator specification

### Ordering family

**Input grid:** WxH grid (10x10). N colored bars of varying heights (1-8 cells tall) placed at random x-positions. Background is black (color 0). Each bar is a distinct color (colors 1-9).

**Output grid:** Same bars rearranged so that they sit left-to-right in order of ascending height. Bar colors preserved.

**Complexity parameter:** N = number of bars (2 through 8).

**Coverage conditions:**
- Covered: at least one of the 3 demos has n_bars == query complexity
- Uncovered: all 3 demos have n_bars <= 3
- Invariant: the query grid is identical between covered and uncovered for the same seed

**Output files:**
- `train_tasks.json`: 7 complexities x 1,500 seeds x 2 conditions = 21,000 task sets
- `val_tasks.json`: 25 seeds per complexity reserved for validation
- `web/src/data/tasks.json`: 10 seeds per complexity for the frontend

## Frontend specification

### Grid renderer

- Each cell is a colored square
- Color palette: standard ARC-AGI colors (black, blue, red, green, yellow, grey, magenta, orange, cyan, maroon)
- Cell size: ~20px on desktop, ~14px on mobile
- Grid border: 1px grey

### Diff overlay

- Cells where model output != oracle output: red border + semi-transparent red fill
- Cells where they match: normal rendering

### Hebbian heatmap

- NxN grid where N = 16 (number of "neurons" in the toy)
- Cell color intensity = absolute value of sigma[i][j]
- Animate: when a new demo is written, flash the cells that changed
- Show total energy (Frobenius norm of sigma) as a number

### KV cache visualization

- A vertical stack of colored bars, one per token in the KV cache
- Grows as demos are added
- Label: current size / maximum size

### Guided flow (6 steps, under 90 seconds)

1. Open at complexity 3, uncovered, already correct
2. "Drag the slider right."
3. User drags to 8. Model collapses.
4. Toggle pulses. "Flip the toggle to add one example at the current difficulty."
5. User flips. Model recovers.
6. "Explore freely." All controls unlock.

## Code style

- React functional components with hooks
- Tailwind for styling
- No unnecessary dependencies
- Every component must be understandable by someone reading it for the first time
- Comments that explain WHY, not WHAT

## Papers to cite

Must-cite (central to the claim):
1. BDH-CQ report, arXiv:2608.09888, Aug 2026 (Table 3 + ladder experiments)
2. Dragon Hatchling, arXiv:2509.26507, Sep 2025 (architecture, Hebbian derivation)
3. Coconut, arXiv:2412.06769, Dec 2024 (latent reasoning baseline)

Cite for contrast:
4. HRM, arXiv:2506.21734, 2025 (adaptation by optimization)
5. TRM / Tiny Recursive Models, 7M params, 45% ARC-AGI-1 (recursive improvement via backward pass)
6. Recurrent Depth, arXiv:2502.05171, 2025

Design precedent:
- Transformer Explainer (Georgia Tech, CHI 2026): runs GPT-2 live in-browser via ONNX Runtime, progressive disclosure, adjustable parameters, D3.js visualizations. Our architecture mirrors this.

Rule: before submission, make sure that every citation matches the actual paper.

## Things to never do

- Never claim we ran BDH-CQ or reproduced their results
- Never present the Hebbian toy as official BDH
- Never hide whether output is live or precomputed
- Never invent citations or numbers
- Never add a control that does not map to a real concept variable
- Never add content that does not serve the central claim

## Things to always do

- Label every evidence source (developer-reported vs independently reproduced vs our result)
- State limitations explicitly
- Cite beside the claim, not in a bibliography
- If ONNX is slower than 1 second, badge it as PRECOMPUTED
- Open with a preset already running, no blank canvas
- Before shipping, test on mobile

## Deliverables checklist (Pathway PS pages 10-12)

- [ ] Public artifact URL (opens without sign-in)
- [ ] Public source code repository
- [ ] Blog as PDF (separate from concept summary)
- [ ] Complete README (claim, audience, prerequisites, objectives, architecture, live/precomputed/synthetic/animated labels, reproduction instructions, credits, licenses)
- [ ] Clear setup instructions for any notebook or local component
- [ ] One-page concept summary PDF (500-950 words, self-contained briefing, passes the "give it to a fresh AI" quality test)
- [ ] 3+ primary papers from 2022-2026 cited beside technical claims
- [ ] Source and license record (code, data, weights, graphics, fonts, reused)
- [ ] AI assistance, code, data, asset, and license disclosure
- [ ] LIVE/PRECOMPUTED badge works correctly and honestly
- [ ] BDH toy labeled as simplified illustration, not official BDH
- [ ] Guided flow completes in under 90 seconds (60-second test in rubric)
- [ ] Mobile responsive
- [ ] Every number traces to a specific section of a specific paper
- [ ] Comparison table in concept summary (encouraged by PS)
- [ ] All seven learning outcomes addressed
- [ ] Submitted 48 hours early
