"""Smoke test: training loop runs 2 epochs on a tiny dataset without crashing."""

import json
import tempfile
import os

import numpy as np
import pytest
import torch

from generator.ordering import generate_ordering_task
from model.tokenizer import VOCAB_SIZE, PAD, MAX_SEQ_LEN
from model.architecture import OrderingTransformer


def _make_tiny_dataset(path, n_tasks=4):
    tasks = []
    for seed in range(n_tasks):
        task = generate_ordering_task(n_bars=3, seed=seed)
        demo_task = generate_ordering_task(n_bars=3, seed=seed + 100)
        tasks.append({
            "complexity": 3,
            "condition": "covered",
            "seed": seed,
            "demos": [
                {"input": task["input"].tolist(), "output": task["output"].tolist()},
                {"input": demo_task["input"].tolist(), "output": demo_task["output"].tolist()},
            ],
            "query_input": task["input"].tolist(),
            "query_output": task["output"].tolist(),
        })
    with open(path, "w") as f:
        json.dump(tasks, f)


class TestTrainSmoke:
    def test_training_loop_runs(self, tmp_path):
        data_path = tmp_path / "train.json"
        _make_tiny_dataset(str(data_path))

        from model.train import OrderingDataset, compute_loss

        dataset = OrderingDataset(str(data_path), condition="covered")
        assert len(dataset) > 0

        model = OrderingTransformer(
            vocab_size=VOCAB_SIZE, pad_token=PAD, max_seq_len=MAX_SEQ_LEN
        )
        optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

        model.train()
        loader = torch.utils.data.DataLoader(dataset, batch_size=2, shuffle=True)

        losses = []
        for epoch in range(2):
            for batch in loader:
                optimizer.zero_grad()
                loss = compute_loss(model, batch, "cpu")
                loss.backward()
                optimizer.step()
                losses.append(loss.item())

        assert len(losses) >= 2
        assert all(l > 0 for l in losses)

    def test_loss_decreases(self, tmp_path):
        data_path = tmp_path / "train.json"
        _make_tiny_dataset(str(data_path), n_tasks=8)

        from model.train import OrderingDataset, compute_loss

        dataset = OrderingDataset(str(data_path), condition="covered")
        model = OrderingTransformer(
            vocab_size=VOCAB_SIZE, pad_token=PAD, max_seq_len=MAX_SEQ_LEN
        )
        optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
        model.train()
        loader = torch.utils.data.DataLoader(dataset, batch_size=4, shuffle=True)

        epoch_losses = []
        for epoch in range(10):
            total = 0
            count = 0
            for batch in loader:
                optimizer.zero_grad()
                loss = compute_loss(model, batch, "cpu")
                loss.backward()
                optimizer.step()
                total += loss.item()
                count += 1
            epoch_losses.append(total / count)

        assert epoch_losses[-1] < epoch_losses[0], (
            f"Loss did not decrease: {epoch_losses[0]:.3f} -> {epoch_losses[-1]:.3f}"
        )
