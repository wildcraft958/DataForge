"""Training loop for the ordering transformer.

Usage (local):
    python3 -m model.train --data data/train_tasks.json --epochs 30

Usage (Colab):
    Upload this repo. Run the generator export first, then:
    !python3 -m model.train --data data/train_tasks.json --epochs 30 --device cuda

Trains on COVERED condition tasks only. The model learns to solve all
complexities when the right demos are present. At inference, swapping to
UNCOVERED demos tests whether it extrapolates.
"""

import argparse
import json
import math
import os
import time

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

from model.architecture import OrderingTransformer
from model.tokenizer import (
    VOCAB_SIZE,
    PAD,
    MAX_SEQ_LEN,
    encode_grid,
    encode_task,
    pad_sequence,
)


class OrderingDataset(Dataset):
    """Loads tasks from JSON exported by generator/export.py."""

    def __init__(self, path: str, condition: str = "covered"):
        with open(path) as f:
            all_tasks = json.load(f)
        self.tasks = [t for t in all_tasks if t["condition"] == condition]

    def __len__(self):
        return len(self.tasks)

    def __getitem__(self, idx):
        t = self.tasks[idx]
        demos = [
            {
                "input": np.array(d["input"]),
                "output": np.array(d["output"]),
            }
            for d in t["demos"]
        ]
        query_in = np.array(t["query_input"])
        query_out = np.array(t["query_output"])

        tokens = encode_task(demos, query_in, query_out)
        tokens = pad_sequence(tokens, MAX_SEQ_LEN)
        return torch.tensor(tokens, dtype=torch.long)


def compute_loss(model, batch, device):
    """Next-token prediction loss, ignoring PAD positions."""
    batch = batch.to(device)
    inputs = batch[:, :-1]
    targets = batch[:, 1:]
    logits = model(inputs)
    loss = nn.functional.cross_entropy(
        logits.reshape(-1, VOCAB_SIZE),
        targets.reshape(-1),
        ignore_index=PAD,
    )
    return loss


def train(args):
    device = torch.device(args.device)
    print(f"Device: {device}")

    dataset = OrderingDataset(args.data, condition="covered")
    print(f"Training on {len(dataset)} covered tasks")

    loader = DataLoader(
        dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=0,
        drop_last=True,
    )

    model = OrderingTransformer(
        vocab_size=VOCAB_SIZE,
        d_model=args.d_model,
        n_heads=args.n_heads,
        n_layers=args.n_layers,
        d_ff=args.d_ff,
        max_seq_len=MAX_SEQ_LEN,
        pad_token=PAD,
    ).to(device)

    n_params = sum(p.numel() for p in model.parameters())
    print(f"Model parameters: {n_params:,}")

    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=0.01)

    total_steps = len(loader) * args.epochs
    warmup_steps = min(500, total_steps // 10)

    def lr_schedule(step):
        if step < warmup_steps:
            return step / max(warmup_steps, 1)
        progress = (step - warmup_steps) / max(total_steps - warmup_steps, 1)
        return 0.5 * (1 + math.cos(math.pi * progress))

    scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lr_schedule)

    os.makedirs(args.checkpoint_dir, exist_ok=True)

    step = 0
    for epoch in range(args.epochs):
        model.train()
        epoch_loss = 0.0
        t0 = time.time()

        for batch in loader:
            loss = compute_loss(model, batch, device)
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()

            epoch_loss += loss.item()
            step += 1

        avg_loss = epoch_loss / len(loader)
        elapsed = time.time() - t0
        lr = scheduler.get_last_lr()[0]
        print(f"Epoch {epoch+1}/{args.epochs}  loss={avg_loss:.4f}  lr={lr:.6f}  time={elapsed:.1f}s")

        if (epoch + 1) % 5 == 0 or epoch == args.epochs - 1:
            path = os.path.join(args.checkpoint_dir, f"checkpoint_epoch{epoch+1}.pt")
            torch.save({
                "epoch": epoch + 1,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "loss": avg_loss,
            }, path)
            print(f"  Saved {path}")

    final_path = os.path.join(args.checkpoint_dir, "model_final.pt")
    torch.save(model.state_dict(), final_path)
    print(f"Final model saved to {final_path}")


def main():
    parser = argparse.ArgumentParser(description="Train the ordering transformer")
    parser.add_argument("--data", type=str, required=True)
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--d-model", type=int, default=256)
    parser.add_argument("--n-heads", type=int, default=8)
    parser.add_argument("--n-layers", type=int, default=6)
    parser.add_argument("--d-ff", type=int, default=1024)
    parser.add_argument("--device", type=str, default="cpu")
    parser.add_argument("--checkpoint-dir", type=str, default="checkpoints")
    args = parser.parse_args()
    train(args)


if __name__ == "__main__":
    main()
