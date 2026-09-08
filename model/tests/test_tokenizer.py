"""Tests for the task tokenizer.

Vocab: 0-9 (colors/background), 10 (ROW_SEP), 11 (GRID_SEP), 12 (PAD).
A task sequence: [demo1_in, GRID_SEP, demo1_out, GRID_SEP, ..., query_in, GRID_SEP]
The model predicts the query output tokens that follow.
"""

import numpy as np
import pytest

from model.tokenizer import (
    GRID_SEP,
    PAD,
    ROW_SEP,
    VOCAB_SIZE,
    encode_grid,
    encode_task,
    decode_grid,
    pad_sequence,
)


class TestVocabConstants:
    def test_vocab_size(self):
        assert VOCAB_SIZE == 13

    def test_special_tokens(self):
        assert ROW_SEP == 10
        assert GRID_SEP == 11
        assert PAD == 12


class TestEncodeGrid:
    def test_small_grid(self):
        grid = np.array([[1, 2], [3, 4]])
        tokens = encode_grid(grid)
        assert tokens == [1, 2, ROW_SEP, 3, 4]

    def test_single_row(self):
        grid = np.array([[5, 0, 3]])
        tokens = encode_grid(grid)
        assert tokens == [5, 0, 3]

    def test_three_rows(self):
        grid = np.zeros((3, 2), dtype=int)
        grid[2, 0] = 7
        tokens = encode_grid(grid)
        assert tokens == [0, 0, ROW_SEP, 0, 0, ROW_SEP, 7, 0]


class TestDecodeGrid:
    def test_roundtrip(self):
        grid = np.array([[1, 2, 0], [0, 3, 4], [5, 0, 6]])
        tokens = encode_grid(grid)
        recovered = decode_grid(tokens, rows=3, cols=3)
        np.testing.assert_array_equal(recovered, grid)

    def test_decode_with_known_tokens(self):
        tokens = [1, 2, ROW_SEP, 3, 4]
        grid = decode_grid(tokens, rows=2, cols=2)
        expected = np.array([[1, 2], [3, 4]])
        np.testing.assert_array_equal(grid, expected)


class TestEncodeTask:
    def test_structure(self):
        """Task encoding has the right separator pattern."""
        demo_in = np.array([[1]])
        demo_out = np.array([[2]])
        query_in = np.array([[3]])
        query_out = np.array([[4]])

        demos = [{"input": demo_in, "output": demo_out}]
        tokens = encode_task(demos, query_in, query_out)

        assert GRID_SEP in tokens
        sep_positions = [i for i, t in enumerate(tokens) if t == GRID_SEP]
        assert len(sep_positions) == 3

    def test_query_output_at_end(self):
        """The query output tokens are the last tokens before any padding."""
        demo_in = np.array([[1, 0], [0, 0]])
        demo_out = np.array([[0, 1], [0, 0]])
        query_in = np.array([[2, 0], [0, 0]])
        query_out = np.array([[0, 2], [0, 0]])

        demos = [{"input": demo_in, "output": demo_out}]
        tokens = encode_task(demos, query_in, query_out)

        query_out_tokens = encode_grid(query_out)
        assert tokens[-len(query_out_tokens):] == query_out_tokens


class TestPadSequence:
    def test_pads_to_length(self):
        seq = [1, 2, 3]
        padded = pad_sequence(seq, max_len=6)
        assert padded == [1, 2, 3, PAD, PAD, PAD]

    def test_no_padding_needed(self):
        seq = [1, 2, 3]
        padded = pad_sequence(seq, max_len=3)
        assert padded == [1, 2, 3]

    def test_truncates_if_too_long(self):
        seq = list(range(10))
        padded = pad_sequence(seq, max_len=5)
        assert len(padded) == 5
        assert padded == [0, 1, 2, 3, 4]
