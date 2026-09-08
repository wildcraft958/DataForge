# AI Disclosure

This document records all AI assistance used in this project, as required by DataForge 2026 submission rules.

## AI Tools Used

| Tool | Purpose | Scope |
|------|---------|-------|
| Claude Code (Anthropic, Opus 4.6) | Code generation, architecture design, planning, writing | All components |

## Code

AI-assisted code is present in all components:

- `generator/`: ordering task generator and export script
- `model/`: transformer architecture, tokenizer, training loop, validation, ONNX export
- `bdh-toy/`: simplified Hebbian memory module
- `web/`: React frontend, all components, ONNX inference hook

Every generated file was reviewed and tested by a human team member. All 28 Python tests and 5 JavaScript tests pass.

## Data

The ordering task generator produces synthetic data. No external datasets are used. No AI-generated data is included.

## Assets

No AI-generated images, audio, or video. All visualizations are SVG rendered by React components from task data.

## Weights

The toy transformer model (4.2M parameters) is trained from scratch on synthetic data. No pretrained weights are used.

## Writing

AI assisted with drafting documentation (README, concept summary, blog, this disclosure). All text was reviewed and edited by the team.

## What AI Did Not Do

- BDH-CQ evidence numbers come from arXiv:2608.09888 Table 3, not from AI. We did not run BDH-CQ.
- The Hebbian visualization is labeled as a simplified illustration. It does not claim to be an official BDH implementation.
- No citations or numbers were invented.
