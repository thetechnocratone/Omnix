"""Shared engine for Omnix reels: brand palette, fonts, easing, original music, ffmpeg writer.

Everything is generated in code (Pillow + numpy + ffmpeg); no outside services, no licensed audio.
"""
import os
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(ROOT, "media", "statement_cards", "b1_world.png")

W, H, FPS = 1080, 1920, 30
CREAM = (252, 251, 244)
INK = (26, 24, 22)
ORANGE = (232, 145, 12)
GREY = (140, 136, 128)
NIGHT = (11, 15, 26)
NIGHT2 = (22, 28, 44)
SOFT = (210, 205, 195)

FD = "/usr/share/fonts/opentype/inter"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
MONOB = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"


def font(kind, size):
    path = {
        "reg": f"{FD}/Inter-Regular.otf",
        "med": f"{FD}/Inter-Medium.otf",
        "semi": f"{FD}/Inter-SemiBold.otf",
        "bold": f"{FD}/Inter-Bold.otf",
        "mono": MONO,
        "monob": MONOB,
    }[kind]
    return ImageFont.truetype(path, size)


def ease(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def ease_back(t):
    """Overshoot ease, for a little 'pop'."""
    t = max(0.0, min(1.0, t))
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2


def lerp(c1, c2, a):
    a = max(0.0, min(1.0, a))
    return tuple(int(c1[i] + (c2[i] - c1[i]) * a) for i in range(3))


def sun_logo(size):
    """The Omnix sun logo, cropped from the house card template."""
    im = Image.open(TEMPLATE).convert("RGB").crop((106, 481, 232, 607))
    return im.resize((size, size), Image.LANCZOS)


def header_strip(scale=1.2):
    """Logo + 'omnix @omnixteam' header from the house template (on cream)."""
    h = Image.open(TEMPLATE).convert("RGB").crop((100, 475, 700, 615))
    return h.resize((int(h.width * scale), int(h.height * scale)), Image.LANCZOS)


def fit_font(kind, lines, max_w, start, floor=40):
    s = start
    while s > floor:
        f = font(kind, s)
        if all(f.getlength(t) <= max_w for t in lines):
            return f, s
        s -= 2
    raise ValueError(f"Lines too long to fit: {lines}")


def wrap(text, f, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if f.getlength(trial) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


# ---------------------------------------------------------------- music
CHORDS = {
    "calm": [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66], [164.81, 207.65, 246.94]],
    "tech": [[146.83, 174.61, 220.0], [116.54, 146.83, 174.61], [130.81, 164.81, 196.0], [110.0, 138.59, 164.81]],
    "warm": [[196.0, 246.94, 293.66], [164.81, 196.0, 246.94], [130.81, 164.81, 196.0], [146.83, 185.0, 220.0]],
}


def music(seconds, path, mood="calm", bpm=100, beat=False, clicks=None, sr=44100):
    """Original, royalty-free bed. mood: calm | tech | warm. beat=True adds a soft kick + hat.
    Returns the list of beat times (seconds) so visuals can sync to them."""
    n = int(seconds * sr)
    t = np.arange(n) / sr
    out = np.zeros(n)
    chords = CHORDS.get(mood, CHORDS["calm"])
    seg = seconds / 4
    arp_steps = 16 if mood == "tech" else 8
    for i, ch in enumerate(chords):
        s, e = int(i * seg * sr), int(min(seconds, (i + 1) * seg + 0.6) * sr)
        tt = t[s:e] - t[s]
        env = np.minimum(1, tt / 0.8) * np.exp(-tt * 0.15)
        tail = np.clip((e / sr - t[s:e]) / 0.6, 0, 1)
        for f in ch:
            out[s:e] += 0.10 * env * tail * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt))
        for k in range(arp_steps):
            st = s + int(k * seg / arp_steps * sr)
            ln = min(int(0.45 * sr), n - st)
            if ln <= 0:
                continue
            ta = np.arange(ln) / sr
            f = ch[k % 3] * (4 if mood == "tech" else 2)
            out[st:st + ln] += 0.06 * np.exp(-ta * 7) * np.sin(2 * np.pi * f * ta)
    beats = []
    if beat:
        step = 60.0 / bpm
        bt = 0.0
        while bt < seconds - 0.2:
            beats.append(bt)
            st = int(bt * sr)
            ln = min(int(0.25 * sr), n - st)
            ta = np.arange(ln) / sr
            freq = 110 * np.exp(-ta * 30) + 45
            out[st:st + ln] += 0.35 * np.exp(-ta * 18) * np.sin(2 * np.pi * np.cumsum(freq) / sr)
            hs = int((bt + step / 2) * sr)
            hl = min(int(0.05 * sr), n - hs)
            if hl > 0:
                out[hs:hs + hl] += 0.04 * np.random.default_rng(int(bt * 100)).standard_normal(hl) * np.exp(-np.arange(hl) / sr * 80)
            bt += step
    rng = np.random.default_rng(7)
    for ct in clicks or []:  # short mechanical ticks (split-flap etc.)
        st = int(ct * sr)
        ln = min(int(0.012 * sr), n - st)
        if ln > 0:
            out[st:st + ln] += 0.05 * rng.standard_normal(ln) * np.exp(-np.arange(ln) / sr * 400)
    fade = np.minimum(1, t / 0.8) * np.minimum(1, (seconds - t) / 1.2)
    out = out * fade
    out = out / (np.abs(out).max() + 1e-9) * 0.6
    stereo = np.stack([out, np.roll(out, 300)], axis=1)
    wavfile.write(path, sr, (stereo * 32767).astype(np.int16))
    return beats


# ---------------------------------------------------------------- writer
def render(frame_fn, seconds, out_path, mood="calm", beat=False, bpm=100, clicks=None):
    """Call frame_fn(t, beats) -> PIL.Image for every frame, mux with generated music."""
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "bed.wav")
        beats = music(seconds, wav, mood=mood, beat=beat, bpm=bpm, clicks=clicks)
        ff = subprocess.Popen(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
             "-r", str(FPS), "-i", "-", "-i", wav, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium",
             "-crf", "18", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out_path],
            stdin=subprocess.PIPE)
        for f in range(int(seconds * FPS)):
            im = frame_fn(f / FPS, beats)
            ff.stdin.write(im.convert("RGB").tobytes())
        ff.stdin.close()
        if ff.wait() != 0:
            raise RuntimeError("ffmpeg failed")
    return out_path


def blank(color=CREAM):
    im = Image.new("RGB", (W, H), color)
    return im, ImageDraw.Draw(im)


def end_card(im, d, p, tag, dark=False):
    """Logo + theomnix.org + tag, fading in with progress p (0..1)."""
    bg = NIGHT if dark else CREAM
    logo = sun_logo(220)
    if dark:
        # knock out the cream square around the logo
        mask = Image.new("L", logo.size, 0)
        ImageDraw.Draw(mask).ellipse((4, 4, 216, 216), fill=255)
        layer = Image.blend(Image.new("RGB", logo.size, bg), logo, p)
        im.paste(layer, ((W - 220) // 2, 700), mask)
    else:
        im.paste(Image.blend(Image.new("RGB", logo.size, bg), logo, p), ((W - 220) // 2, 700))
    fb, fr = font("semi", 38), font("reg", 38)
    site = "theomnix.org"
    d.text(((W - fb.getlength(site)) // 2, 980), site, font=fb, fill=lerp(bg, CREAM if dark else INK, p))
    d.text(((W - fr.getlength(tag)) // 2, 1040), tag, font=fr, fill=lerp(bg, ORANGE, p))
