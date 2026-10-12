"""Render an Instagram/LinkedIn carousel in the Omnix house style (cream, sun header, ink + orange).

Usage:
    python3 tools/carousel.py carousel.json OUT_DIR

carousel.json: {"name": "tue_stack", "slides": [
    {"kicker": "THE OMNIX STACK", "title": ["Brain. Body.", "Bank account."],
     "body": "Every intelligent system will need all three.", "tag": "Swipe"} , ...]}
Optional per slide: "list": ["item", ...] (rendered as an orange-dotted list), "note": small grey line at the bottom.
Output: OUT_DIR/<name>_<n>.png at 1080x1350.
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "media", "statement_cards", "b1_world.png")
BG, INK, ORANGE, GREY = (252, 251, 244), (26, 24, 22), (232, 145, 12), (140, 136, 128)
FD = "/usr/share/fonts/opentype/inter"
W, H, X = 1080, 1350, 110


def f(kind, size):
    return ImageFont.truetype({"reg": f"{FD}/Inter-Regular.otf", "semi": f"{FD}/Inter-SemiBold.otf",
                               "bold": f"{FD}/Inter-Bold.otf", "mono": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"}[kind], size)


def wrap(text, font, maxw):
    out, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if font.getlength(t) <= maxw:
            cur = t
        else:
            out.append(cur)
            cur = w
    if cur:
        out.append(cur)
    return out


def render(spec, out_dir):
    header = Image.open(SRC).convert("RGB").crop((100, 475, 700, 615))
    slides = spec["slides"]
    n = len(slides)
    paths = []
    for i, s in enumerate(slides, 1):
        im = Image.new("RGB", (W, H), BG)
        d = ImageDraw.Draw(im)
        im.paste(header, (100, 80))
        fp = f("mono", 28)
        pg = f"{i}/{n}"
        d.text((W - X - fp.getlength(pg), 125), pg, font=fp, fill=GREY)
        maxw = W - 2 * X
        size = 84
        while size > 48 and any(f("semi", size).getlength(t) > maxw for t in s["title"]):
            size -= 4
        ft = f("semi", size)
        fb = f("reg", 46)
        body = wrap(s.get("body", ""), fb, maxw) if s.get("body") else []
        items = s.get("list", [])
        block = 50 + int(size * 1.2) * len(s["title"]) + 40 + 64 * len(body) + (30 + 70 * len(items) if items else 0)
        y = max(300, (H - block) // 2)
        if s.get("kicker"):
            d.text((X, y), s["kicker"], font=f("mono", 30), fill=ORANGE)
        y += 60
        for t in s["title"]:
            d.text((X, y), t, font=ft, fill=INK)
            y += int(size * 1.2)
        y += 30
        for t in body:
            d.text((X, y), t, font=fb, fill=INK)
            y += 64
        if items:
            y += 30
            fl = f("semi", 46)
            for it in items:
                d.ellipse((X, y + 20, X + 16, y + 36), fill=ORANGE)
                d.text((X + 40, y), it, font=fl, fill=INK)
                y += 70
        fs, fsb = f("reg", 30), f("semi", 30)
        if s.get("note"):
            for k, line in enumerate(wrap(s["note"], fs, maxw)):
                d.text((X, H - 220 + k * 40), line, font=fs, fill=GREY)
        d.text((X, 1232), "theomnix.org", font=fs, fill=GREY)
        tag = s.get("tag", "")
        d.text((W - X - fsb.getlength(tag), 1232), tag, font=fsb, fill=ORANGE)
        p = os.path.join(out_dir, f"{spec['name']}_{i}.png")
        im.save(p)
        paths.append(p)
    return paths


if __name__ == "__main__":
    spec, out = json.load(open(sys.argv[1])), sys.argv[2]
    os.makedirs(out, exist_ok=True)
    for p in render(spec, out):
        print(p)
