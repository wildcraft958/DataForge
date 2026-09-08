"""Tests for the decoder-only transformer architecture."""

import torch
import pytest

from model.architecture import OrderingTransformer
from model.tokenizer import VOCAB_SIZE, PAD, MAX_SEQ_LEN


def _default_model():
    return OrderingTransformer(
        vocab_size=VOCAB_SIZE,
        d_model=256,
        n_heads=8,
        n_layers=6,
        d_ff=1024,
        max_seq_len=MAX_SEQ_LEN,
        pad_token=PAD,
    )


class TestOrderingTransformer:
    def test_output_shape(self):
        """Forward pass returns logits of shape (batch, seq_len, vocab_size)."""
        model = _default_model()
        x = torch.randint(0, VOCAB_SIZE, (2, 64))
        logits = model(x)
        assert logits.shape == (2, 64, VOCAB_SIZE)

    def test_parameter_count(self):
        """Model has roughly 4-5M parameters."""
        model = _default_model()
        n_params = sum(p.numel() for p in model.parameters())
        assert 3_000_000 < n_params < 6_000_000, f"got {n_params}"

    def test_causal_mask(self):
        """Position i cannot attend to position j > i."""
        model = _default_model()
        model.eval()
        x = torch.randint(0, VOCAB_SIZE, (1, 32))
        with torch.no_grad():
            logits_full = model(x)
        x_short = x[:, :16]
        with torch.no_grad():
            logits_short = model(x_short)
        torch.testing.assert_close(
            logits_full[:, :16, :], logits_short, atol=1e-5, rtol=1e-5
        )

    def test_pad_token_ignored_in_loss_mask(self):
        """The loss helper ignores PAD positions."""
        model = _default_model()
        x = torch.randint(0, VOCAB_SIZE, (1, 32))
        x[0, 20:] = PAD
        logits = model(x)
        assert logits.shape == (1, 32, VOCAB_SIZE)

    def test_single_token_forward(self):
        """Model handles a single-token input."""
        model = _default_model()
        x = torch.tensor([[5]])
        logits = model(x)
        assert logits.shape == (1, 1, VOCAB_SIZE)

    def test_max_seq_len_forward(self):
        """Model handles a full-length sequence."""
        model = _default_model()
        x = torch.randint(0, VOCAB_SIZE, (1, MAX_SEQ_LEN))
        logits = model(x)
        assert logits.shape == (1, MAX_SEQ_LEN, VOCAB_SIZE)
