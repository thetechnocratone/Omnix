"""Render Omnix statement cards in the house template.

Cream background, sun logo + 'Omnix' + blue verified tick + @omnixteam header, a black line, then an orange twist line,
theomnix.org bottom-left and an orange tag bottom-right. 1080x1350 (4:5).

Usage:
    python3 tools/statement_card.py cards.json OUT_DIR

cards.json is a list of objects:
    {"name": "sr1_zero",
     "l1": ["Bharat gave the world zero."],          # black line(s), max ~24 chars each
     "l2": ["We're building what", "comes after one."], # orange line(s), max ~24 chars each
     "tag": "Built in Bharat"}                        # short footer tag
Lines longer than the card width raise an error: split them into more lines.
"""
import json
import os
import sys

import sys as _s; _s.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from omnix_header import header as header_img
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "media", "statement_cards", "b1_world.png")

BG = (252, 251, 244)
INK = (26, 24, 22)
ORANGE = (232, 145, 12)
GREY = (140, 136, 128)
FONT_DIR = "/usr/share/fonts/opentype/inter"
REG = ImageFont.truetype(f"{FONT_DIR}/Inter-Regular.otf", 60)
SEMI = ImageFont.truetype(f"{FONT_DIR}/Inter-SemiBold.otf", 60)
SMALL = ImageFont.truetype(f"{FONT_DIR}/Inter-Regular.otf", 30)
SMALLB = ImageFont.truetype(f"{FONT_DIR}/Inter-SemiBold.otf", 30)
X, LH = 110, 80


def render(card, out_dir):
    header = header_img(1.0, BG)  # verified (blue tick) header, see tools/omnix_header.py
    l1, l2 = card["l1"], card["l2"]
    for t in l1 + l2:
        if SEMI.getlength(t) > 1080 - 2 * X:
            raise ValueError(f"Line too long, split it: {t!r}")
    im = Image.new("RGB", (1080, 1350), BG)
    d = ImageDraw.Draw(im)
    block = 140 + 60 + LH * len(l1) + 40 + LH * len(l2)
    y = (1350 - block) // 2
    im.paste(header, (100, y))
    y += 200
    for t in l1:
        d.text((X, y), t, font=REG, fill=INK)
        y += LH
    y += 40
    for t in l2:
        d.text((X, y), t, font=SEMI, fill=ORANGE)
        y += LH
    d.text((X, 1232), "theomnix.org", font=SMALL, fill=GREY)
    tag = card.get("tag", "")
    d.text((1080 - X - SMALLB.getlength(tag), 1232), tag, font=SMALLB, fill=ORANGE)
    path = os.path.join(out_dir, card["name"] + ".png")
    im.save(path)
    return path


if __name__ == "__main__":
    spec, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    for c in json.load(open(spec)):
        print(render(c, out))
