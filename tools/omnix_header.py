"""Shared tweet-style header for Omnix cards: sun logo, "Omnix" + blue verified tick, @omnixteam.

Omnix is verified on both X and Instagram (blue tick), so every tweet-style card/reel and any
design that shows the account header must use this header (never a header without the tick).

    from omnix_header import header
    img = header(scale=1.0, bg=(252, 251, 244))   # RGB image, ~600x140 at scale 1
"""
import math
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(ROOT, "tools", "brief_reel", "assets", "logo.png")
FONT_DIR = "/usr/share/fonts/opentype/inter"
BLUE = (29, 155, 240)
INK = (26, 24, 22)
GREY = (120, 116, 108)


def badge(size):
    """Blue scalloped verified badge with a white check, drawn at 4x then downsampled."""
    s = size * 4
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c, n = s / 2, 12
    pts = []
    for i in range(n * 16):
        a = 2 * math.pi * i / (n * 16)
        r = s * 0.44 + s * 0.04 * math.cos(n * a)
        pts.append((c + r * math.cos(a), c + r * math.sin(a)))
    d.polygon(pts, fill=BLUE)
    w = max(2, int(s * 0.085))
    d.line([(s * 0.30, s * 0.52), (s * 0.44, s * 0.65), (s * 0.71, s * 0.37)], fill="white", width=w, joint="curve")
    for x, y in [(s * 0.30, s * 0.52), (s * 0.71, s * 0.37)]:
        d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill="white")
    return im.resize((size, size), Image.LANCZOS)


def header(scale=1.0, bg=(252, 251, 244), name="Omnix", handle="@omnixteam"):
    k = scale
    W, H = int(640 * k), int(140 * k)
    im = Image.new("RGB", (W, H), bg)
    logo = Image.open(LOGO).convert("RGBA").resize((int(120 * k), int(120 * k)), Image.LANCZOS)
    im.paste(logo, (int(10 * k), int(10 * k)), logo)
    d = ImageDraw.Draw(im)
    fb = ImageFont.truetype(f"{FONT_DIR}/Inter-Bold.otf", int(46 * k))
    fr = ImageFont.truetype(f"{FONT_DIR}/Inter-Regular.otf", int(34 * k))
    x = int(150 * k)
    d.text((x, int(22 * k)), name, font=fb, fill=INK)
    bsz = int(40 * k)
    bx = x + int(fb.getlength(name)) + int(10 * k)
    b = badge(bsz)
    im.paste(b, (bx, int(29 * k)), b)
    d.text((x, int(80 * k)), handle, font=fr, fill=GREY)
    return im


if __name__ == "__main__":
    header(1.5).save("/tmp/omnix_header_preview.png")
