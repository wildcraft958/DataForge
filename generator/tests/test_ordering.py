"""Tests for the ordering task generator.

Written before the implementation (TDD). Each test names one property
of generate_ordering_task(n_bars, grid_w, grid_h, seed).
"""

import numpy as np
import pytest

from generator.ordering import generate_ordering_task


class TestGenerateOrderingTask:
    """Eight tests covering the generator contract."""

    def test_grid_dimensions(self):
        """Returned grids have the requested width and height."""
        task = generate_ordering_task(n_bars=4, grid_w=10, grid_h=10, seed=0)
        assert task["input"].shape == (10, 10)
        assert task["output"].shape == (10, 10)

    def test_correct_number_of_bars(self):
        """Both grids contain exactly n_bars distinct nonzero columns."""
        for n in range(2, 9):
            task = generate_ordering_task(n_bars=n, grid_w=10, grid_h=10, seed=42)
            input_cols = _nonzero_columns(task["input"])
            output_cols = _nonzero_columns(task["output"])
            assert len(input_cols) == n, f"input has {len(input_cols)} bars, expected {n}"
            assert len(output_cols) == n, f"output has {len(output_cols)} bars, expected {n}"

    def test_output_is_sorted_by_height(self):
        """Output bars are ordered shortest to tallest, left to right."""
        task = generate_ordering_task(n_bars=5, grid_w=10, grid_h=10, seed=7)
        heights = _bar_heights_left_to_right(task["output"])
        assert heights == sorted(heights)
        assert len(set(heights)) == len(heights), "heights must be distinct"

    def test_same_bars_in_input_and_output(self):
        """Input and output contain the same set of (color, height) bars."""
        task = generate_ordering_task(n_bars=6, grid_w=10, grid_h=10, seed=99)
        input_bars = _extract_bars(task["input"])
        output_bars = _extract_bars(task["output"])
        assert sorted(input_bars) == sorted(output_bars)

    def test_deterministic_with_seed(self):
        """The same seed produces identical grids."""
        a = generate_ordering_task(n_bars=4, grid_w=10, grid_h=10, seed=123)
        b = generate_ordering_task(n_bars=4, grid_w=10, grid_h=10, seed=123)
        np.testing.assert_array_equal(a["input"], b["input"])
        np.testing.assert_array_equal(a["output"], b["output"])

    def test_different_seeds_differ(self):
        """Different seeds produce different input grids."""
        a = generate_ordering_task(n_bars=4, grid_w=10, grid_h=10, seed=0)
        b = generate_ordering_task(n_bars=4, grid_w=10, grid_h=10, seed=1)
        assert not np.array_equal(a["input"], b["input"])

    def test_distinct_colors(self):
        """All bars use distinct colors from the range 1-9."""
        task = generate_ordering_task(n_bars=8, grid_w=10, grid_h=10, seed=55)
        bars = _extract_bars(task["input"])
        colors = [c for c, _ in bars]
        assert len(set(colors)) == len(colors), "colors must be distinct"
        assert all(1 <= c <= 9 for c in colors), "colors must be in 1-9"

    def test_bars_grow_from_bottom(self):
        """Each bar fills cells from the bottom row upward with no gaps."""
        task = generate_ordering_task(n_bars=3, grid_w=10, grid_h=10, seed=10)
        grid = task["input"]
        for col_idx in range(grid.shape[1]):
            col = grid[:, col_idx]
            if col.any():
                nonzero = np.nonzero(col)[0]
                bottom = grid.shape[0] - 1
                expected = list(range(bottom, bottom - len(nonzero), -1))
                assert list(nonzero) == sorted(expected), (
                    f"column {col_idx}: bar cells are not contiguous from the bottom"
                )


# --- helpers ---

def _nonzero_columns(grid: np.ndarray) -> list[int]:
    """Return column indices that contain at least one nonzero cell."""
    return [c for c in range(grid.shape[1]) if grid[:, c].any()]


def _bar_heights_left_to_right(grid: np.ndarray) -> list[int]:
    """Return bar heights in left-to-right order."""
    heights = []
    for c in range(grid.shape[1]):
        col = grid[:, c]
        h = int(np.count_nonzero(col))
        if h > 0:
            heights.append(h)
    return heights


def _extract_bars(grid: np.ndarray) -> list[tuple[int, int]]:
    """Return a list of (color, height) for each bar in the grid."""
    bars = []
    for c in range(grid.shape[1]):
        col = grid[:, c]
        nonzero = col[col != 0]
        if len(nonzero) > 0:
            color = int(nonzero[0])
            bars.append((color, len(nonzero)))
    return bars
