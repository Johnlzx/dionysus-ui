#!/usr/bin/env python3
"""Extract and measure the rainbow-loading transition in a reference video."""

from __future__ import annotations

import argparse
import csv
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


def run(*args: str) -> str:
    result = subprocess.run(args, check=True, capture_output=True, text=True)
    return result.stdout


def frame_times(video: Path) -> list[float]:
    payload = json.loads(
        run(
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "frame=best_effort_timestamp_time",
            "-of",
            "json",
            str(video),
        )
    )
    return [float(item["best_effort_timestamp_time"]) for item in payload["frames"]]


def extract_window(video: Path, output: Path, start: float, end: float) -> list[tuple[float, Path]]:
    times = [value for value in frame_times(video) if start <= value <= end]
    frame_dir = output / "lossless"
    frame_dir.mkdir(parents=True, exist_ok=True)
    run(
        "ffmpeg",
        "-y",
        "-v",
        "error",
        "-i",
        str(video),
        "-vf",
        f"select='between(t,{start},{end})'",
        "-fps_mode",
        "vfr",
        str(frame_dir / "frame-%04d.png"),
    )
    paths = sorted(frame_dir.glob("frame-*.png"))
    if len(paths) != len(times):
        raise RuntimeError(f"timestamp/frame mismatch: {len(times)} timestamps, {len(paths)} images")
    return list(zip(times, paths, strict=True))


def nearest(frames: list[tuple[float, Path]], timestamp: float) -> tuple[float, Path]:
    return min(frames, key=lambda item: abs(item[0] - timestamp))


def make_contact_sheet(frames: list[tuple[float, Path]], output: Path) -> None:
    targets = [1.900, 1.933, 1.967, 2.000, 2.033, 2.067, 2.100, 2.133,
               2.167, 2.200, 2.233, 2.283, 2.333, 2.400, 2.500, 2.650]
    selected = [nearest(frames, target) for target in targets]
    columns = 4
    tile_width = 730
    tile_height = 415
    label_height = 42
    sheet = Image.new("RGB", (columns * tile_width, 4 * (tile_height + label_height)), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 25)
    for index, (timestamp, path) in enumerate(selected):
        image = Image.open(path).convert("RGB").resize((tile_width, tile_height), Image.Resampling.LANCZOS)
        x = (index % columns) * tile_width
        y = (index // columns) * (tile_height + label_height)
        sheet.paste(image, (x, y + label_height))
        draw.text((x + 14, y + 8), f"t = {timestamp:.3f}s", fill="black", font=font)
    sheet.save(output / "transition-keyframes-labeled.jpg", quality=94, subsampling=0)


def load_small(path: Path, width: int = 730) -> np.ndarray:
    image = Image.open(path).convert("RGB")
    height = round(image.height * width / image.width)
    return np.asarray(image.resize((width, height), Image.Resampling.BILINEAR), dtype=np.float32)


def measure(frames: list[tuple[float, Path]], output: Path) -> None:
    baseline_time, baseline_path = nearest(frames, 2.650)
    baseline = load_small(baseline_path)
    height, width, _ = baseline.shape
    top = round(height * 0.04)
    bottom = round(height * 0.80)

    rows: list[dict[str, float]] = []
    for timestamp, path in frames:
        image = load_small(path)
        delta = np.abs(image - baseline)
        roi = image[top:bottom]
        roi_delta = delta[top:bottom]
        chroma = roi.max(axis=2) - roi.min(axis=2)
        column_chroma = np.median(chroma, axis=0)
        column_delta = np.mean(roi_delta, axis=(0, 2))
        signal = column_chroma + 0.45 * column_delta
        peak_x = int(np.argmax(signal))
        weights = np.maximum(signal - np.percentile(signal, 45), 0)
        centroid = float(np.sum(np.arange(width) * weights) / max(np.sum(weights), 1))
        rows.append(
            {
                "timestamp_s": timestamp,
                "mean_abs_delta": float(delta.mean()),
                "p95_abs_delta": float(np.percentile(delta, 95)),
                "median_chroma": float(np.median(chroma)),
                "p95_chroma": float(np.percentile(chroma, 95)),
                "peak_x_norm": peak_x / (width - 1),
                "centroid_x_norm": centroid / (width - 1),
            }
        )

    with (output / "frame-metrics.csv").open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    strongest = max((row for row in rows if row["timestamp_s"] >= 1.93), key=lambda row: row["p95_chroma"])
    print(json.dumps({"baseline_s": baseline_time, "strongest": strongest}, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("video", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--start", type=float, default=1.85)
    parser.add_argument("--end", type=float, default=2.70)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    frames = extract_window(args.video, args.out, args.start, args.end)
    make_contact_sheet(frames, args.out)
    measure(frames, args.out)


if __name__ == "__main__":
    main()
