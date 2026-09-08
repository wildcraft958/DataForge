"""Export ordering tasks to JSON files for training, validation, and the web frontend.

Usage:
    python3 -m generator.export [--train-seeds 1500] [--val-seeds 25] [--web-seeds 10]

Produces:
    data/train_tasks.json   Training set (covered + uncovered)
    data/val_tasks.json     Validation set
    web/src/data/tasks.json Frontend subset
"""

import argparse
import json
import os
from pathlib import Path

from generator.ordering import generate_ordering_task

COMPLEXITIES = list(range(2, 9))
UNCOVERED_MAX = 3


def make_demos(complexity: int, condition: str, seed: int):
    """Return 3 demo pairs for the given condition.

    covered: one demo matches the query complexity.
    uncovered: all demos have n_bars <= UNCOVERED_MAX.
    """
    rng_offset = seed * 1000
    demos = []
    if condition == "covered":
        demos.append(generate_ordering_task(complexity, seed=rng_offset + 1))
        easy = min(complexity - 1, UNCOVERED_MAX) if complexity > 2 else 2
        demos.append(generate_ordering_task(easy, seed=rng_offset + 2))
        demos.append(generate_ordering_task(2, seed=rng_offset + 3))
    else:
        for i in range(3):
            n = min(UNCOVERED_MAX, 2 + i)
            demos.append(generate_ordering_task(n, seed=rng_offset + i + 1))
    return demos


def build_task_entry(complexity: int, condition: str, seed: int) -> dict:
    """Build one task entry with demos and a query."""
    demos = make_demos(complexity, condition, seed)
    query = generate_ordering_task(complexity, seed=seed)
    return {
        "complexity": complexity,
        "condition": condition,
        "seed": seed,
        "demos": [
            {"input": d["input"].tolist(), "output": d["output"].tolist()}
            for d in demos
        ],
        "query_input": query["input"].tolist(),
        "query_output": query["output"].tolist(),
    }


def generate_split(seeds_per_complexity: int, seed_start: int = 0) -> list[dict]:
    """Generate tasks for all complexities and both conditions."""
    tasks = []
    for comp in COMPLEXITIES:
        for s in range(seed_start, seed_start + seeds_per_complexity):
            tasks.append(build_task_entry(comp, "covered", s))
            tasks.append(build_task_entry(comp, "uncovered", s))
    return tasks


def main():
    parser = argparse.ArgumentParser(description="Export ordering tasks to JSON")
    parser.add_argument("--train-seeds", type=int, default=1500)
    parser.add_argument("--val-seeds", type=int, default=25)
    parser.add_argument("--web-seeds", type=int, default=10)
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent

    data_dir = root / "data"
    data_dir.mkdir(exist_ok=True)

    web_data_dir = root / "web" / "src" / "data"
    web_data_dir.mkdir(parents=True, exist_ok=True)

    print(f"Generating training set ({args.train_seeds} seeds x {len(COMPLEXITIES)} complexities x 2 conditions)...")
    train = generate_split(args.train_seeds, seed_start=0)
    _write_json(data_dir / "train_tasks.json", train)

    val_start = args.train_seeds
    print(f"Generating validation set ({args.val_seeds} seeds)...")
    val = generate_split(args.val_seeds, seed_start=val_start)
    _write_json(data_dir / "val_tasks.json", val)

    print(f"Generating web set ({args.web_seeds} seeds)...")
    web = generate_split(args.web_seeds, seed_start=val_start + args.val_seeds)
    _write_json(web_data_dir / "tasks.json", web)

    print("Done.")
    print(f"  train: {len(train)} tasks -> {data_dir / 'train_tasks.json'}")
    print(f"  val:   {len(val)} tasks -> {data_dir / 'val_tasks.json'}")
    print(f"  web:   {len(web)} tasks -> {web_data_dir / 'tasks.json'}")


def _write_json(path: Path, data):
    with open(path, "w") as f:
        json.dump(data, f)
    size_mb = os.path.getsize(path) / (1024 * 1024)
    print(f"  Wrote {path.name} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
