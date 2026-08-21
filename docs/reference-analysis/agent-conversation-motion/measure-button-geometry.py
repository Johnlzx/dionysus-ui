"""Measure the saturated-green transition silhouette in dense reference frames."""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path

import numpy as np
from PIL import Image


TIMESTAMP_PATTERN = re.compile(r"frame_t(?P<seconds>\d+)_(?P<millis>\d+)\.(?:jpg|png)$")


def timestamp(path: Path) -> float:
    match = TIMESTAMP_PATTERN.match(path.name)
    if not match:
        raise ValueError(f"Unsupported frame name: {path.name}")
    return int(match.group("seconds")) + int(match.group("millis")) / 1000


def measure(path: Path) -> dict[str, float | int | str]:
    pixels = np.asarray(Image.open(path).convert("RGB"), dtype=np.int16)
    height, width, _ = pixels.shape
    x_offset = int(width * 0.42)
    y_offset = int(height * 0.42)
    region = pixels[y_offset:, x_offset:]
    red, green, blue = region[..., 0], region[..., 1], region[..., 2]
    chroma = np.maximum.reduce((red, green, blue)) - np.minimum.reduce((red, green, blue))
    mask = (
        (green - red > 7)
        & (green - blue > 4)
        & (chroma > 16)
        & (green < 225)
        & (green > 45)
    )

    row_counts = mask.sum(axis=1)
    column_counts = mask.sum(axis=0)
    rows = np.flatnonzero(row_counts >= 6)
    columns = np.flatnonzero(column_counts >= 6)

    if not rows.size or not columns.size:
        return {
            "frame": path.name,
            "time_s": timestamp(path),
            "x": 0,
            "y": 0,
            "width": 0,
            "height": 0,
            "aspect_ratio": 0,
            "green_pixels": int(mask.sum()),
        }

    left, right = int(columns[0]), int(columns[-1])
    top, bottom = int(rows[0]), int(rows[-1])
    measured_width = right - left + 1
    measured_height = bottom - top + 1
    return {
        "frame": path.name,
        "time_s": timestamp(path),
        "x": left + x_offset,
        "y": top + y_offset,
        "width": measured_width,
        "height": measured_height,
        "aspect_ratio": round(measured_width / measured_height, 4),
        "green_pixels": int(mask[top : bottom + 1, left : right + 1].sum()),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("frames", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    frames = sorted(args.frames.glob("frame_t*.*"), key=timestamp)
    measurements = [measure(frame) for frame in frames]
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(measurements[0]))
        writer.writeheader()
        writer.writerows(measurements)


if __name__ == "__main__":
    main()
