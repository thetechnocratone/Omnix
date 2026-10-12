"""Turn an Omnix statement card spec into a 9:16 reel (1080x1920, ~12 s, with an original music bed).

Words of the black line rise in one by one, the orange twist lands after a beat,
then an end card shows the sun logo, theomnix.org and the tag.

Usage:
    python3 tools/card_reel.py cards.json OUT_DIR [--seconds 12] [--music path.wav]

Same cards.json format as tools/statement_card.py. Without --music, a royalty-free
ambient bed is synthesised in code (no licensing issues). Needs ffmpeg, Pillow, numpy, scipy.
"""
import argparse
import json
import os
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "media", "statement_cards", "b1_world.png")
W, H, FPS = 1080, 1920, 30
BG = (252, 251, 244)
INK = (26, 24, 22)
ORANGE = (232, 145, 12)
GREY = (140, 136, 128)
FD = "/usr/share/fonts/opentype/inter"
REG = ImageFont.truetype(f"{FD}/Inter-Regular.otf", 72)
SEMI = ImageFont.truetype(f"{FD}/Inter-SemiBold.otf", 72)
SMALL = ImageFont.truetype(f"{FD}/Inter-Regular.otf", 38)
SMALLB = ImageFont.truetype(f"{FD}/Inter-SemiBold.otf", 38)
X, LH = 110, 96


def ease(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def lerp(c1, c2, a):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * a) for i in range(3))


def words(lines, font, y0, start, stagger):
    """Return [(word, x, y, t_start)] for each word, laid out line by line."""
    out, t, y = [], start, y0
    for line in lines:
        x = X
        for w in line.split(" "):
            out.append((w, x, y, t))
            x += font.getlength(w + " ")
            t += stagger
        y += LH
    return out, t


def music(seconds, path, sr=44100):
    """Calm ambient bed: soft pad chords + light arpeggio, original and royalty-free."""
    n = int(seconds * sr)
    t = np.arange(n) / sr
    out = np.zeros(n)
    chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66], [164.81, 207.65, 246.94]]
    seg = seconds / 4
    for i, ch in enumerate(chords):
        s, e = int(i * seg * sr), int(min(seconds, (i + 1) * seg + 0.6) * sr)
        tt = t[s:e] - t[s]
        env = np.minimum(1, tt / 0.8) * np.exp(-tt * 0.15)
        tail = np.clip((e / sr - t[s:e]) / 0.6, 0, 1)
        for f in ch:
            out[s:e] += 0.10 * env * tail * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt))
        for k in range(8):  # arpeggio
            st = s + int(k * seg / 8 * sr)
            ln = min(int(0.5 * sr), n - st)
            if ln <= 0:
                continue
            ta = np.arange(ln) / sr
            f = ch[k % 3] * 2
            out[st:st + ln] += 0.07 * np.exp(-ta * 6) * np.sin(2 * np.pi * f * ta)
    fade = np.minimum(1, t / 1.0) * np.minimum(1, (seconds - t) / 1.5)
    out = out * fade
    out = out / (np.abs(out).max() + 1e-9) * 0.6
    stereo = np.stack([out, np.roll(out, 300)], axis=1)
    wavfile.write(path, sr, (stereo * 32767).astype(np.int16))


def render(card, out_dir, seconds=12.0, music_path=None):
    header = Image.open(SRC).convert("RGB").crop((100, 475, 700, 615))
    header = header.resize((int(header.width * 1.2), int(header.height * 1.2)))
    logo = Image.open(SRC).convert("RGB").crop((106, 481, 232, 607)).resize((220, 220))
    l1, l2 = card["l1"], card["l2"]
    global REG, SEMI, LH
    size = 72
    while size > 44:
        REG = ImageFont.truetype(f"{FD}/Inter-Regular.otf", size)
        SEMI = ImageFont.truetype(f"{FD}/Inter-SemiBold.otf", size)
        if all(SEMI.getlength(t) <= W - 2 * X for t in l1 + l2):
            break
        size -= 2
    else:
        raise ValueError("Lines too long, split them")
    LH = int(size * 1.33)
    hh = header.height
    block = hh + 70 + LH * len(l1) + 50 + LH * len(l2)
    y0 = max(260, (H - block) // 2 - 60)  # stay clear of IG's bottom UI
    w1, t_end1 = words(l1, REG, y0 + hh + 70, 0.9, 0.16)
    w2, t_end2 = words(l2, SEMI, y0 + hh + 70 + LH * len(l1) + 50, t_end1 + 0.9, 0.2)
    end_start = seconds - 3.0
    tag = card.get("tag", "")

    with tempfile.TemporaryDirectory() as tmp:
        wav = music_path or os.path.join(tmp, "bed.wav")
        if not music_path:
            music(seconds, wav)
        out = os.path.join(out_dir, card["name"] + "_reel.mp4")
        ff = subprocess.Popen(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
             "-r", str(FPS), "-i", "-", "-i", wav, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium",
             "-crf", "18", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out],
            stdin=subprocess.PIPE)
        for f in range(int(seconds * FPS)):
            t = f / FPS
            im = Image.new("RGB", (W, H), BG)
            d = ImageDraw.Draw(im)
            fade_out = 1 - ease((t - end_start) / 0.5)
            if fade_out > 0:
                a = ease(t / 0.6) * fade_out
                if a > 0:
                    im.paste(Image.blend(Image.new("RGB", header.size, BG), header, a), (100, y0 - int(20 * (1 - a))))
                for word, x, y, ts in w1:
                    p = ease((t - ts) / 0.45) * fade_out
                    if p > 0:
                        d.text((x, y + int(28 * (1 - p))), word, font=REG, fill=lerp(BG, INK, p))
                for word, x, y, ts in w2:
                    p = ease((t - ts) / 0.45) * fade_out
                    if p > 0:
                        d.text((x, y + int(28 * (1 - p))), word, font=SEMI, fill=lerp(BG, ORANGE, p))
            if t >= end_start + 0.3:
                p = ease((t - end_start - 0.3) / 0.6)
                lg = Image.blend(Image.new("RGB", logo.size, BG), logo, p)
                im.paste(lg, ((W - 220) // 2, 700))
                site = "theomnix.org"
                d.text(((W - SMALLB.getlength(site)) // 2, 980), site, font=SMALLB, fill=lerp(BG, INK, p))
                d.text(((W - SMALL.getlength(tag)) // 2, 1040), tag, font=SMALL, fill=lerp(BG, ORANGE, p))
            ff.stdin.write(im.tobytes())
        ff.stdin.close()
        ff.wait()
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("out")
    ap.add_argument("--seconds", type=float, default=12.0)
    ap.add_argument("--music")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    for c in json.load(open(a.spec)):
        print(render(c, a.out, a.seconds, a.music))
