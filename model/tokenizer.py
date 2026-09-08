"""Tokenizer for ordering tasks.

Vocab (13 tokens):
    0-9     Cell colors (0 = background)
    10      ROW_SEP   (separates rows within a grid)
    11      GRID_SEP  (separates grids in a task sequence)
    12      PAD       (right-padding to max_len)

A task sequence:
    demo1_in GRID_SEP demo1_out GRID_SEP ... query_in GRID_SEP query_out
"""

import numpy as np

ROW_SEP = 10
GRID_SEP = 11
PAD = 12
VOCAB_SIZE = 13
MAX_SEQ_LEN = 1024


def encode_grid(grid: np.ndarray) -> list[int]:
    """Flatten a 2D grid into tokens, rows joined by ROW_SEP."""
    tokens = []
    for i, row in enumerate(grid):
        if i > 0:
            tokens.append(ROW_SEP)
        tokens.extend(int(v) for v in row)
    return tokens


def decode_grid(tokens: list[int], rows: int, cols: int) -> np.ndarray:
    """Reconstruct a grid from a flat token list (inverse of encode_grid)."""
    grid = np.zeros((rows, cols), dtype=int)
    r, c = 0, 0
    for t in tokens:
        if t == ROW_SEP:
            r += 1
            c = 0
        elif t == PAD:
            break
        else:
            grid[r, c] = t
            c += 1
    return grid


def encode_task(
    demos: list[dict],
    query_input: np.ndarray,
    query_output: np.ndarray,
) -> list[int]:
    """Encode a full task (demos + query) into a token sequence."""
    tokens = []
    for demo in demos:
        tokens.extend(encode_grid(demo["input"]))
        tokens.append(GRID_SEP)
        tokens.extend(encode_grid(demo["output"]))
        tokens.append(GRID_SEP)
    tokens.extend(encode_grid(query_input))
    tokens.append(GRID_SEP)
    tokens.extend(encode_grid(query_output))
    return tokens


def pad_sequence(seq: list[int], max_len: int = MAX_SEQ_LEN) -> list[int]:
    """Pad or truncate a sequence to max_len."""
    if len(seq) > max_len:
        return seq[:max_len]
    return seq + [PAD] * (max_len - len(seq))
