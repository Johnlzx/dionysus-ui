"""Build the timestamp-aligned component crop used by comparison-report.md."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
REFERENCE = ROOT / "reference-detail/open-frames/frames"
CANDIDATE = ROOT / "candidate/deterministic-open"
OUTPUT = ROOT / "candidate/final-open-side-by-side.jpg"

PAIRS = [
    ("0ms", "frame_t0_250.jpg", "t000.png"),
    ("17ms", "frame_t0_267.jpg", "t017.png"),
    ("50ms", "frame_t0_300.jpg", "t050.png"),
    ("100ms", "frame_t0_350.jpg", "t100.png"),
    ("150ms", "frame_t0_400.jpg", "t150.png"),
    ("180ms", "frame_t0_433.jpg", "t180.png"),
    ("300ms", "frame_t0_550.jpg", "t300.png"),
]


def label(image: Image.Image, text: str) -> Image.Image:
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default(size=18)
    draw.rounded_rectangle((8, 8, 128, 37), radius=7, fill=(12, 12, 12, 210))
    draw.text((17, 13), text, font=font, fill="white")
    return image


def candidate_crop(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGB")
    crop = image.crop((328, 0, 940, 720))
    return crop.resize((340, 400), Image.Resampling.LANCZOS)


def main() -> None:
    tile_width = 340
    tile_height = 400
    gap = 12
    header = 46
    canvas = Image.new(
        "RGB",
        (tile_width * 2 + gap * 3, header + len(PAIRS) * (tile_height + gap)),
        "#111111",
    )
    draw = ImageDraw.Draw(canvas)
    heading = ImageFont.load_default(size=20)
    draw.text((gap, 12), "Reference", font=heading, fill="white")
    draw.text((tile_width + gap * 2, 12), "Repaired candidate", font=heading, fill="white")

    for index, (relative_time, reference_name, candidate_name) in enumerate(PAIRS):
        y = header + index * (tile_height + gap)
        reference = label(Image.open(REFERENCE / reference_name).convert("RGB"), relative_time)
        candidate = label(candidate_crop(CANDIDATE / candidate_name), relative_time)
        canvas.paste(reference, (gap, y))
        canvas.paste(candidate, (tile_width + gap * 2, y))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUTPUT, quality=91, optimize=True)


if __name__ == "__main__":
    main()
