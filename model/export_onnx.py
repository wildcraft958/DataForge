"""Export the trained model to ONNX for browser inference.

Usage:
    python3 -m model.export_onnx \
        --model checkpoints/model_final.pt \
        --output web/public/model.onnx
"""

import argparse

import torch

from model.architecture import OrderingTransformer
from model.tokenizer import VOCAB_SIZE, PAD, MAX_SEQ_LEN


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, required=True)
    parser.add_argument("--output", type=str, required=True)
    args = parser.parse_args()

    model = OrderingTransformer(
        vocab_size=VOCAB_SIZE,
        pad_token=PAD,
        max_seq_len=MAX_SEQ_LEN,
    )
    state = torch.load(args.model, map_location="cpu", weights_only=True)
    if "model_state_dict" in state:
        state = state["model_state_dict"]
    model.load_state_dict(state)
    model.eval()

    dummy = torch.randint(0, VOCAB_SIZE, (1, 512))

    torch.onnx.export(
        model,
        dummy,
        args.output,
        input_names=["input_ids"],
        output_names=["logits"],
        dynamic_axes={
            "input_ids": {0: "batch", 1: "seq_len"},
            "logits": {0: "batch", 1: "seq_len"},
        },
        opset_version=17,
    )

    import os
    size_mb = os.path.getsize(args.output) / (1024 * 1024)
    print(f"Exported to {args.output} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
