"""Week 1 gate: validate the coverage cliff.

Usage:
    python3 -m model.validate --model checkpoints/model_final.pt --data data/val_tasks.json

Prints a table:
    Complexity | Covered EM | Uncovered EM | Gap

Gate passes when complexity 8 shows:
    covered EM >= 50%, uncovered EM <= 20%, gap >= 30pp.
"""

import argparse
import json
from collections import defaultdict

import numpy as np
import torch

from model.architecture import OrderingTransformer
from model.tokenizer import (
    VOCAB_SIZE,
    PAD,
    GRID_SEP,
    MAX_SEQ_LEN,
    encode_grid,
    encode_task,
    decode_grid,
    pad_sequence,
)


def load_model(path: str, device: str = "cpu") -> OrderingTransformer:
    model = OrderingTransformer(
        vocab_size=VOCAB_SIZE,
        pad_token=PAD,
        max_seq_len=MAX_SEQ_LEN,
    )
    state = torch.load(path, map_location=device, weights_only=True)
    if "model_state_dict" in state:
        state = state["model_state_dict"]
    model.load_state_dict(state)
    model.eval()
    return model.to(device)


def predict_output(model, demos, query_input, device="cpu"):
    """Autoregressively generate the query output grid."""
    tokens = []
    for d in demos:
        tokens.extend(encode_grid(d["input"]))
        tokens.append(GRID_SEP)
        tokens.extend(encode_grid(d["output"]))
        tokens.append(GRID_SEP)
    tokens.extend(encode_grid(query_input))
    tokens.append(GRID_SEP)

    rows, cols = query_input.shape
    target_len = rows * cols + (rows - 1)

    with torch.no_grad():
        for _ in range(target_len):
            x = torch.tensor([tokens[-MAX_SEQ_LEN:]], dtype=torch.long, device=device)
            logits = model(x)
            next_token = logits[0, -1].argmax().item()
            tokens.append(next_token)

    generated = tokens[-(target_len):]
    return decode_grid(generated, rows, cols)


def exact_match(pred: np.ndarray, target: np.ndarray) -> bool:
    return np.array_equal(pred, target)


def validate(args):
    device = torch.device(args.device)
    model = load_model(args.model, device=str(device))

    with open(args.data) as f:
        tasks = json.load(f)

    results = defaultdict(lambda: {"covered": [], "uncovered": []})

    for t in tasks:
        comp = t["complexity"]
        condition = t["condition"]
        demos = [
            {"input": np.array(d["input"]), "output": np.array(d["output"])}
            for d in t["demos"]
        ]
        query_in = np.array(t["query_input"])
        query_out = np.array(t["query_output"])

        pred = predict_output(model, demos, query_in, device=str(device))
        em = exact_match(pred, query_out)
        results[comp][condition].append(em)

    print(f"\n{'Complexity':>10} | {'Covered EM':>10} | {'Uncovered EM':>12} | {'Gap':>6}")
    print("-" * 50)

    gate_pass = True
    for comp in sorted(results.keys()):
        cov = results[comp]["covered"]
        uncov = results[comp]["uncovered"]
        cov_em = sum(cov) / len(cov) * 100 if cov else 0
        uncov_em = sum(uncov) / len(uncov) * 100 if uncov else 0
        gap = cov_em - uncov_em
        print(f"{comp:>10} | {cov_em:>9.1f}% | {uncov_em:>11.1f}% | {gap:>5.1f}pp")

        if comp == 8:
            if cov_em < 50:
                gate_pass = False
                print(f"  FAIL: covered EM {cov_em:.1f}% < 50%")
            if uncov_em > 20:
                gate_pass = False
                print(f"  FAIL: uncovered EM {uncov_em:.1f}% > 20%")
            if gap < 30:
                gate_pass = False
                print(f"  FAIL: gap {gap:.1f}pp < 30pp")

    print()
    if gate_pass:
        print("WEEK 1 GATE: PASS")
    else:
        print("WEEK 1 GATE: FAIL")
    return gate_pass


def main():
    parser = argparse.ArgumentParser(description="Validate the coverage cliff")
    parser.add_argument("--model", type=str, required=True)
    parser.add_argument("--data", type=str, required=True)
    parser.add_argument("--device", type=str, default="cpu")
    args = parser.parse_args()
    validate(args)


if __name__ == "__main__":
    main()
