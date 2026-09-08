"""Generate precomputed model outputs for the web frontend.

Usage:
    python3 -m model.generate_precomputed \
        --model checkpoints/model_final.pt \
        --tasks web/src/data/tasks.json \
        --output web/src/data/precomputed.json

Runs the trained model on every task in the web task set and stores
predictions alongside the ground truth. The frontend uses this data
when ONNX inference is not available or not yet loaded.
"""

import argparse
import json

import numpy as np

from model.validate import load_model, predict_output


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, required=True)
    parser.add_argument("--tasks", type=str, required=True)
    parser.add_argument("--output", type=str, required=True)
    parser.add_argument("--device", type=str, default="cpu")
    args = parser.parse_args()

    model = load_model(args.model, args.device)

    with open(args.tasks) as f:
        tasks = json.load(f)

    results = []
    for i, t in enumerate(tasks):
        demos = [
            {"input": np.array(d["input"]), "output": np.array(d["output"])}
            for d in t["demos"]
        ]
        query_in = np.array(t["query_input"])
        query_out = np.array(t["query_output"])

        pred = predict_output(model, demos, query_in, args.device)
        correct = bool(np.array_equal(pred, query_out))

        results.append({
            "complexity": t["complexity"],
            "condition": t["condition"],
            "seed": t["seed"],
            "prediction": pred.tolist(),
            "correct": correct,
        })

        if (i + 1) % 10 == 0:
            print(f"  {i+1}/{len(tasks)}")

    with open(args.output, "w") as f:
        json.dump(results, f)

    n_correct = sum(1 for r in results if r["correct"])
    print(f"Done. {n_correct}/{len(results)} correct. Saved to {args.output}")


if __name__ == "__main__":
    main()
