"""Render owned conceptual social artwork; no gameplay captures or generated imagery.

Run with Python 3 + Pillow (build/runtime do not require either). Uses the site's
Avenir Next face on macOS; SOCIAL_FONT may select another locally licensed face.
No font files are redistributed. Output is RGB PNG, 1200 × 630.
"""

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/images/social"
FONT = os.environ.get("SOCIAL_FONT", "/System/Library/Fonts/Avenir Next.ttc")
BG, TEXT, MUTED, GOLD, GREEN, LINE = (
    "#101110", "#f1f0ec", "#c2c3bc", "#f8bd57", "#59604b", "#343d2f"
)


def text(draw, xy, value, size, fill=TEXT):
    draw.text(xy, value, font=ImageFont.truetype(FONT, size), fill=fill)


def botanical(draw):
    """Original stylised frond, echoing the portfolio's botanical linework."""
    draw.line([(1110, 516), (1080, 420), (1020, 312), (1000, 215)], fill=GREEN, width=2)
    for index in range(8):
        y = 258 + index * 29
        x = 1004 + index * 12
        draw.line([(x, y), (x - 47, y - 30), (x - 65, y - 68)], fill=GREEN, width=2)
        draw.line([(x, y), (x + 39, y - 44), (x + 47, y - 77)], fill=GREEN, width=2)


def node(draw, xy, label):
    x, y = xy
    draw.ellipse((x - 6, y - 6, x + 6, y + 6), fill=GOLD)
    text(draw, (x + 20, y - 15), label, 20)


def render(name, category, title, subtitle, kind):
    image = Image.new("RGB", (1200, 630), BG)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 9, 630), fill=GOLD)
    draw.line((60, 105, 1140, 105), fill=LINE, width=1)
    text(draw, (60, 45), "MOHD. PARAMASVARA", 23)
    text(draw, (60, 145), category, 20, GOLD)
    for index, line in enumerate(title):
        text(draw, (56, 198 + index * 76), line, 65)
    for index, line in enumerate(subtitle):
        text(draw, (60, 378 + index * 34), line, 25, MUTED)
    draw.line((60, 531, 1140, 531), fill=LINE, width=1)
    text(draw, (60, 556), "mohd.paramasvara.online", 22, MUTED)
    text(draw, (852, 562), "CONCEPTUAL ILLUSTRATION", 15, MUTED)
    botanical(draw)
    if kind == "work":
        points = [(815, 239), (815, 340), (815, 441)]
        draw.line(points, fill=GOLD, width=2)
        for point, label in zip(points, ["ARCHITECTURE", "MODERNISATION", "LEADERSHIP"]):
            node(draw, point, label)
    elif kind == "ntm":
        for index, label in enumerate(["SIMULATION", "INTERFACE", "PERSISTENCE"]):
            y = 223 + index * 101
            draw.rounded_rectangle((780, y, 1090, y + 65), radius=5, fill=BG, outline=GREEN, width=2)
            text(draw, (800, y + 18), label, 20)
            if index < 2:
                draw.line((805, y + 65, 805, y + 101), fill=GOLD, width=2)
    else:
        points = [(810, 236), (860, 337), (810, 438)]
        draw.line(points, fill=GOLD, width=2)
        for point, label in zip(points, ["OBSERVE", "DECIDE", "REVIEW"]):
            node(draw, point, label)
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"{name}.png"
    image.save(path, optimize=True)
    print(f"{path.relative_to(ROOT)}: 1200×630, {path.stat().st_size:,} bytes")


render("work-with-me", "ENGINEERING ENGAGEMENTS", ["Complex systems.", "Clear direction."],
       ["Software architecture, modernisation", "and technical leadership."], "work")
render("no-two-mondays", "ENGINEERING CASE STUDY", ["No Two Mondays", "Built for change."],
       ["An extensible simulation.", "Human-directed engineering with AI."], "ntm")
render("incident-zero", "INTERACTIVE ENGINEERING STORY", ["Incident Zero", "Follow the evidence."],
       ["A fictional investigation with synthetic data.", "Includes an optional arcade prototype."], "incident")
