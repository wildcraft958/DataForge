"""Deterministic generator for the ordering task family.

Colored bars of varying heights on a grid. Rule: sort shortest to
tallest, left to right. Complexity = number of bars (2 through 8).
"""

import numpy as np


def generate_ordering_task(
    n_bars: int,
    grid_w: int = 10,
    grid_h: int = 10,
    seed: int = 0,
) -> dict:
    """Generate one ordering task.

    Returns a dict with "input" and "output" numpy arrays of shape
    (grid_h, grid_w), dtype int. Background is 0. Each bar is a
    single color (1-9) filling cells from the bottom row upward.
    """
    rng = np.random.default_rng(seed)

    heights = rng.choice(range(1, grid_h), size=n_bars, replace=False)
    colors = rng.choice(range(1, 10), size=n_bars, replace=False)

    bar_positions = _evenly_spaced_positions(n_bars, grid_w)

    input_order = rng.permutation(n_bars)
    input_grid = _place_bars(
        grid_w, grid_h, bar_positions, heights[input_order], colors[input_order]
    )

    sorted_indices = np.argsort(heights)
    output_grid = _place_bars(
        grid_w, grid_h, bar_positions, heights[sorted_indices], colors[sorted_indices]
    )

    return {"input": input_grid, "output": output_grid}


def _evenly_spaced_positions(n_bars: int, grid_w: int) -> list[int]:
    """Return n_bars evenly spaced column indices within grid_w."""
    spacing = grid_w / (n_bars + 1)
    return [int(round(spacing * (i + 1))) for i in range(n_bars)]


def _place_bars(
    grid_w: int,
    grid_h: int,
    positions: list[int],
    heights: np.ndarray,
    colors: np.ndarray,
) -> np.ndarray:
    """Return a grid with bars placed at the given positions."""
    grid = np.zeros((grid_h, grid_w), dtype=int)
    for pos, h, c in zip(positions, heights, colors):
        col = min(pos, grid_w - 1)
        for row in range(grid_h - 1, grid_h - 1 - int(h), -1):
            grid[row, col] = int(c)
    return grid
