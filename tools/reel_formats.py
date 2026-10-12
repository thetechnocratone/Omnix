"""Omnix reel formats. Each takes a spec dict and an output path and renders a 1080x1920 reel.

Formats (pick by topic):
  terminal  - A.L.K.I. thinking: goal typed in a terminal, plan steps tick off, answer lands big.  (A.L.K.I.)
  chain     - Blocks drop in on the beat, hash, link up and spell the sentence; twist lands below. (OmniChain)
  chat      - DM-style satire between two parties, typing dots, popping bubbles.                    (humour, any topic)
  lineart   - A lotus/yantra pattern draws itself stroke by stroke, then the line appears.          (values, Bharat, vision)
  splitflap - Airport departures board flips letter by letter, with flap clicks.                    (announcements, punchlines)
  card      - The original rising-words statement card (tools/card_reel.py).                        (anything)
"""
import hashlib
import math
import random

from PIL import Image, ImageDraw

from reelkit import (CREAM, GREY, H, INK, NIGHT, NIGHT2, ORANGE, SOFT, W, blank, ease, ease_back, end_card, fit_font,
                     font, header_strip, lerp, render, wrap)


def _rise_words(d, lines, f, x0, y0, lh, t0, stagger, t, color, bg, fade=1.0):
    """Draw words rising in one by one. Returns time the last word starts."""
    tt, y = t0, y0
    for line in lines:
        x = x0
        for w in line.split(" "):
            p = ease((t - tt) / 0.45) * fade
            if p > 0:
                d.text((x, y + int(26 * (1 - p))), w, font=f, fill=lerp(bg, color, p))
            x += f.getlength(w + " ")
            tt += stagger
        y += lh
    return tt


# ======================================================================= terminal
def terminal(spec, out, seconds=15.0):
    goal = spec["goal"]
    steps = spec["steps"]
    l1, l2, tag = spec["l1"], spec["l2"], spec.get("tag", "A.L.K.I. · coming soon")
    mono, monob = font("mono", 37), font("monob", 37)
    wx0, wx1 = 60, 1020
    maxw = wx1 - wx0 - 80
    goal_lines = wrap("> goal: " + goal, mono, maxw)
    step_lines = [wrap(f"[{i + 1}/{len(steps)}] {s}", mono, maxw - 50) for i, s in enumerate(steps)]
    big1, s1 = fit_font("reg", l1, W - 220, 68)
    big2, s2 = fit_font("semi", l2, W - 220, s1)
    LH = int(s1 * 1.3)
    content = 100 + 50 * len(goal_lines) + 86 + sum(46 * len(x) + 14 for x in step_lines) + 30
    block = content + 90 + LH * (len(l1) + len(l2)) + 30
    wy0 = max(200, (H - block) // 2 - 60)
    wy1 = wy0 + content

    T_WIN = 0.2
    T_TYPE = 0.7
    cps = 32.0
    type_len = sum(len(x) for x in goal_lines)
    T_THINK = T_TYPE + type_len / cps + 0.3
    T_STEPS = T_THINK + 1.2
    STEP_GAP = 0.9
    T_ANS = T_STEPS + STEP_GAP * len(steps) + 0.4
    T_END = seconds - 2.8

    def frame(t, beats):
        im, d = blank(NIGHT)
        fade = 1 - ease((t - T_END) / 0.5)
        if fade > 0:
            a = ease((t - T_WIN) / 0.5) * fade
            d.rounded_rectangle((wx0, wy0, wx1, wy1), radius=28, fill=lerp(NIGHT, NIGHT2, a))
            for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
                d.ellipse((wx0 + 30 + i * 40, wy0 + 28, wx0 + 52 + i * 40, wy0 + 50), fill=lerp(NIGHT, c, a))
            d.text((wx0 + 180, wy0 + 22), "alki — agent session", font=font("mono", 26), fill=lerp(NIGHT, GREY, a))
            y = wy0 + 100
            # typed goal
            shown = int(max(0, (t - T_TYPE)) * cps)
            for gl in goal_lines:
                part = gl[:max(0, shown)]
                shown -= len(gl)
                d.text((wx0 + 40, y), part, font=monob, fill=lerp(NIGHT, CREAM, fade))
                y += 50
            if T_TYPE < t < T_THINK and int(t * 3) % 2 == 0:
                pass
            # cursor
            if t < T_THINK and int(t * 2.5) % 2 == 0 and t > T_WIN:
                cx = wx0 + 40 + mono.getlength(goal_lines[-1][:max(0, int((t - T_TYPE) * cps) - sum(len(x) for x in goal_lines[:-1]))]) if t > T_TYPE else wx0 + 40
                d.rectangle((cx + 4, y - 48, cx + 22, y - 12), fill=ORANGE)
            # thinking
            if t > T_THINK:
                y += 20
                dots = "." * (1 + int((t - T_THINK) * 3) % 3) if t < T_STEPS else "..."
                label = "planning" + dots if t < T_STEPS else "plan ready"
                d.text((wx0 + 40, y), label, font=mono, fill=lerp(NIGHT, GREY, fade))
                y += 66
            # steps
            for i, sl in enumerate(step_lines):
                ts = T_STEPS + i * STEP_GAP
                p = ease((t - ts) / 0.35) * fade
                if p <= 0:
                    continue
                done = t > ts + 0.55
                mark = "✓" if done else "›"
                d.text((wx0 + 40, y), mark, font=monob, fill=lerp(NIGHT, ORANGE if done else GREY, p))
                for j, line in enumerate(sl):
                    d.text((wx0 + 90, y + j * 46), line, font=mono, fill=lerp(NIGHT, CREAM if done else SOFT, p))
                y += 46 * len(sl) + 14
            # answer
            ay = wy1 + 90
            last = _rise_words(d, l1, big1, 110, ay, LH, T_ANS, 0.14, t, CREAM, NIGHT, fade)
            _rise_words(d, l2, big2, 110, ay + LH * len(l1) + 30, LH, last + 0.6, 0.18, t, ORANGE, NIGHT, fade)
        if t > T_END + 0.3:
            end_card(im, d, ease((t - T_END - 0.3) / 0.6), tag, dark=True)
        return im

    return render(frame, seconds, out, mood="tech", beat=False)


# ======================================================================= chain
def chain(spec, out, seconds=14.0):
    blocks = spec["blocks"]
    l2, tag = spec["l2"], spec.get("tag", "OmniChain · in development")
    bpm = 100
    step = 60 / bpm
    n = len(blocks)
    bw, bh, gap = 820, 128, 46
    bx = (W - bw) // 2
    fword, _ = fit_font("semi", blocks, bw - 80, 58)
    fhash = font("mono", 24)
    big2, s2 = fit_font("semi", l2, W - 220, 64)
    stack = n * (bh + gap) - gap + 40 + int(s2 * 1.3) * len(l2)
    top = max(220, (H - stack) // 2 - 40)
    hashes = ["0x" + hashlib.sha256(b.encode()).hexdigest()[:10] for b in blocks]
    drop_times = [1.0 + i * 2 * step for i in range(n)]  # every other beat
    T_TWIST = drop_times[-1] + 1.4
    T_END = seconds - 2.8
    rnd = random.Random(3)

    def frame(t, beats):
        im, d = blank(CREAM)
        fade = 1 - ease((t - T_END) / 0.5)
        if fade > 0:
            # genesis label
            d.text((bx, top - 60), "GENESIS", font=font("monob", 24), fill=lerp(CREAM, GREY, ease(t / 0.6) * fade))
            for i, word in enumerate(blocks):
                td = drop_times[i]
                p = ease_back((t - td) / 0.45)
                if t < td:
                    continue
                y_final = top + i * (bh + gap)
                y = int(y_final - 260 * (1 - p))
                a = min(1.0, (t - td) / 0.2) * fade
                # link to previous
                if i > 0 and t > td + 0.3:
                    lp = ease((t - td - 0.3) / 0.3)
                    ly0 = top + (i - 1) * (bh + gap) + bh
                    ly1 = ly0 + int(gap * lp)
                    for lx in (W // 2 - 60, W // 2 + 60):
                        d.line((lx, ly0, lx, ly1), fill=lerp(CREAM, ORANGE, fade), width=6)
                d.rounded_rectangle((bx, y, bx + bw, y + bh), radius=22, fill=lerp(CREAM, (255, 255, 255), a),
                                    outline=lerp(CREAM, ORANGE if i == n - 1 else SOFT, a), width=4)
                # hash scramble then settle
                hs = hashes[i]
                if t < td + 0.6:
                    hs = "0x" + "".join(rnd.choice("0123456789abcdef") for _ in range(10))
                d.text((bx + 34, y + 16), f"block {i + 1}  {hs}", font=fhash, fill=lerp(CREAM, GREY, a))
                wp = ease((t - td - 0.5) / 0.35) * fade
                d.text((bx + 34, y + 50), word, font=fword, fill=lerp(CREAM, INK, wp))
                if t > td + 0.7:
                    d.text((bx + bw - 70, y + 16), "✓", font=font("monob", 30), fill=lerp(CREAM, ORANGE, wp))
            ty = top + n * (bh + gap) + 40
            _rise_words(d, l2, big2, 110, ty, int(s2 * 1.3), T_TWIST, 0.18, t, ORANGE, CREAM, fade)
        if t > T_END + 0.3:
            end_card(im, d, ease((t - T_END - 0.3) / 0.6), tag)
        return im

    return render(frame, seconds, out, mood="calm", beat=True, bpm=bpm)


# ======================================================================= chat
def chat(spec, out, seconds=None):
    title = spec.get("title", "")
    msgs = spec["messages"]  # [["L"|"R", text], ...]
    names = {"L": spec.get("left", "Most AI"), "R": spec.get("right", "A.L.K.I.")}
    tag = spec.get("tag", "theomnix.org")
    f = font("reg", 42)
    fn = font("semi", 26)
    maxw = 640
    pad = 30
    laid = []
    for side, text in msgs:
        lines = wrap(text, f, maxw - 2 * pad)
        bw = int(max(f.getlength(x) for x in lines)) + 2 * pad
        bh = len(lines) * 56 + 2 * pad - 8
        laid.append((side, lines, bw, bh))
    times, tt = [], 1.0
    for side, lines, bw, bh in laid:
        typing = 0.5 + 0.02 * sum(len(x) for x in lines)
        times.append((tt, tt + typing))
        tt += typing + 0.9
    if seconds is None:
        seconds = max(12.0, tt + 3.5)
    T_END = seconds - 2.8
    head_h = 200

    def bubble(side, lines, bw, bh):
        img = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
        dd = ImageDraw.Draw(img)
        if side == "R":
            dd.rounded_rectangle((0, 0, bw - 1, bh - 1), radius=34, fill=ORANGE + (255,))
            col = (255, 255, 255)
        else:
            dd.rounded_rectangle((0, 0, bw - 1, bh - 1), radius=34, fill=(255, 255, 255, 255), outline=SOFT + (255,), width=3)
            col = INK
        for j, line in enumerate(lines):
            dd.text((pad, pad - 6 + j * 56), line, font=f, fill=col)
        return img

    bubbles = [bubble(*x) for x in laid]

    def frame(t, beats):
        im, d = blank(CREAM)
        fade = 1 - ease((t - T_END) / 0.5)
        if fade > 0:
            # header bar
            d.rectangle((0, 0, W, head_h), fill=lerp(CREAM, (255, 255, 255), fade))
            d.line((0, head_h, W, head_h), fill=lerp(CREAM, SOFT, fade), width=2)
            hdr = f"{names['L']}  ·  {names['R']}" if not title else title
            fh = font("semi", 40)
            d.text(((W - fh.getlength(hdr)) // 2, 110), hdr, font=fh, fill=lerp(CREAM, INK, fade))
            # stack visible messages; scroll if needed
            visible = []
            for i, (side, lines, bw, bh) in enumerate(laid):
                t_type, t_show = times[i]
                if t >= t_type:
                    visible.append(i)
            heights = [laid[i][3] + 70 for i in visible]
            total = sum(heights)
            avail = 1560 - (head_h + 60)
            y = head_h + 60 - max(0, total - avail)
            for i in visible:
                side, lines, bw, bh = laid[i]
                t_type, t_show = times[i]
                x = W - 60 - bw if side == "R" else 60
                if y + bh > head_h:
                    d.text((x + (bw - fn.getlength(names[side]) - 10 if side == "R" else 10), y), names[side], font=fn,
                           fill=lerp(CREAM, ORANGE if side == "R" else GREY, fade))
                by = y + 40
                if t < t_show:
                    # typing dots
                    tw, th = 140, 80
                    tx = W - 60 - tw if side == "R" else 60
                    d.rounded_rectangle((tx, by, tx + tw, by + th), radius=34, fill=lerp(CREAM, (255, 255, 255), fade),
                                        outline=lerp(CREAM, SOFT, fade), width=3)
                    for k in range(3):
                        bounce = math.sin((t * 8) - k * 0.8)
                        cy = by + 40 - int(8 * max(0, bounce))
                        d.ellipse((tx + 32 + k * 30, cy - 8, tx + 48 + k * 30, cy + 8), fill=lerp(CREAM, GREY, fade))
                    y += th + 70
                else:
                    p = ease_back((t - t_show) / 0.35)
                    sc = max(0.05, 0.6 + 0.4 * p)
                    b = bubbles[i].resize((max(1, int(bw * sc)), max(1, int(bh * sc))))
                    bx = x + (bw - b.width if side == "R" else 0)
                    if fade < 1:
                        alpha = b.getchannel("A").point(lambda v: int(v * fade))
                        b.putalpha(alpha)
                    if by + b.height > head_h:
                        im.paste(b, (bx, by), b)
                    y += bh + 70
            # re-draw header on top (for scroll)
            d.rectangle((0, 0, W, head_h), fill=lerp(CREAM, (255, 255, 255), fade))
            d.line((0, head_h, W, head_h), fill=lerp(CREAM, SOFT, fade), width=2)
            d.text(((W - fh.getlength(hdr)) // 2, 110), hdr, font=fh, fill=lerp(CREAM, INK, fade))
        if t > T_END + 0.3:
            end_card(im, d, ease((t - T_END - 0.3) / 0.6), tag)
        return im

    return render(frame, seconds, out, mood="warm", beat=True, bpm=96)


# ======================================================================= lineart
def _lotus_paths(cx, cy, r):
    """Generic lotus/yantra pattern as a list of polylines (no specific sacred diagram reproduced)."""
    paths = []

    def circle(rad, n=180):
        return [(cx + rad * math.cos(2 * math.pi * k / n - math.pi / 2), cy + rad * math.sin(2 * math.pi * k / n - math.pi / 2))
                for k in range(n + 1)]

    paths.append(circle(r))
    paths.append(circle(r * 0.93))
    # 12 outer petals
    for k in range(12):
        a = 2 * math.pi * k / 12 - math.pi / 2
        pts = []
        for s in range(41):
            u = s / 40
            ang = a + (u - 0.5) * (2 * math.pi / 12) * 1.15
            rr = r * 0.62 + r * 0.30 * math.sin(math.pi * u)
            pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
        paths.append(pts)
    paths.append(circle(r * 0.62))
    # 8 inner petals
    for k in range(8):
        a = 2 * math.pi * k / 8 - math.pi / 2
        pts = []
        for s in range(41):
            u = s / 40
            ang = a + (u - 0.5) * (2 * math.pi / 8) * 1.1
            rr = r * 0.38 + r * 0.22 * math.sin(math.pi * u)
            pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
        paths.append(pts)
    # two interlocking triangles
    for rot in (-math.pi / 2, math.pi / 2):
        tri = [(cx + r * 0.36 * math.cos(rot + 2 * math.pi * k / 3), cy + r * 0.36 * math.sin(rot + 2 * math.pi * k / 3)) for k in range(4)]
        paths.append(tri)
    paths.append(circle(r * 0.08, 60))
    return paths


def _length(pts):
    return sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))


def _partial(pts, frac):
    if frac >= 1:
        return pts
    total = _length(pts) * frac
    out, acc = [pts[0]], 0.0
    for i in range(len(pts) - 1):
        seg = math.dist(pts[i], pts[i + 1])
        if acc + seg >= total:
            u = (total - acc) / seg if seg else 0
            out.append((pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u))
            return out
        acc += seg
        out.append(pts[i + 1])
    return out


def lineart(spec, out, seconds=14.0):
    l1, l2, tag = spec["l1"], spec["l2"], spec.get("tag", "Vasudhaiva Kutumbakam")
    cx, cy, r = W // 2, 700, 360
    paths = _lotus_paths(cx, cy, r)
    T_DRAW0, T_DRAW1 = 0.4, 6.0
    lens = [_length(p) for p in paths]
    total = sum(lens)
    starts, acc = [], 0.0
    for L in lens:
        starts.append(acc / total)
        acc += L
    f1, s1 = fit_font("reg", l1, W - 220, 64)
    f2, s2 = fit_font("semi", l2, W - 220, s1)
    LH = int(s1 * 1.3)
    T_TXT = 4.6
    T_END = seconds - 2.8

    def frame(t, beats):
        im, d = blank(CREAM)
        fade = 1 - ease((t - T_END) / 0.5)
        if fade > 0:
            g = (t - T_DRAW0) / (T_DRAW1 - T_DRAW0)
            g = 1 - (1 - max(0, min(1, g))) ** 2
            for i, p in enumerate(paths):
                s0 = starts[i]
                s1_ = s0 + lens[i] / total
                if g <= s0:
                    break
                frac = min(1.0, (g - s0) / (s1_ - s0))
                pts = _partial(p, frac)
                col = lerp(CREAM, ORANGE if i % 3 else (240, 180, 90), fade)
                if len(pts) > 1:
                    d.line(pts, fill=col, width=5 if i < 2 else 4, joint="curve")
            # gentle glow pulse at the centre after drawing
            if t > T_DRAW1:
                pr = 0.5 + 0.5 * math.sin((t - T_DRAW1) * 3)
                rr = int(r * 0.08 + 10 * pr)
                d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=lerp(CREAM, ORANGE, fade * 0.9))
            ty = cy + r + 110
            last = _rise_words(d, l1, f1, 110, ty, LH, T_TXT, 0.15, t, INK, CREAM, fade)
            _rise_words(d, l2, f2, 110, ty + LH * len(l1) + 30, LH, last + 0.7, 0.18, t, ORANGE, CREAM, fade)
        if t > T_END + 0.3:
            end_card(im, d, ease((t - T_END - 0.3) / 0.6), tag)
        return im

    return render(frame, seconds, out, mood="warm", beat=False)


# ======================================================================= splitflap
def splitflap(spec, out, seconds=13.0):
    l1, l2, tag = spec["l1"], spec["l2"], spec.get("tag", "theomnix.org")
    label = spec.get("label", "NOW BOARDING")
    cols = 15
    rows = []
    for ln in l1:
        for part in wrap(ln, _Mono(cols), cols):
            rows.append((part.upper(), CREAM))
    for ln in l2:
        for part in wrap(ln, _Mono(cols), cols):
            rows.append((part.upper(), ORANGE))
    if any(len(r[0]) > cols for r in rows):
        raise ValueError("splitflap words must be ≤ 15 characters")
    tw, th, tg = 60, 92, 6
    bw = cols * (tw + tg) - tg
    x0 = (W - bw) // 2
    y0 = (H - len(rows) * (th + 18)) // 2 - 20
    fbig = font("monob", 58)
    charset = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,'!?-·"
    rnd = random.Random(11)
    T0 = 1.2
    settle = {}
    clicks = []
    for ri, (text, col) in enumerate(rows):
        pad = text.ljust(cols)
        for ci, ch in enumerate(pad):
            ts = T0 + ri * 0.55 + ci * 0.07
            spins = 4 + rnd.randint(0, 6) if ch != " " else 0
            settle[(ri, ci)] = (ts, spins, ch)
            for k in range(spins + 1):
                clicks.append(ts + k * 0.06)
    T_END = seconds - 2.8

    def frame(t, beats):
        im, d = blank(NIGHT)
        fade = 1 - ease((t - T_END) / 0.5)
        if fade > 0:
            fl = font("monob", 30)
            d.text((x0, y0 - 80), label, font=fl, fill=lerp(NIGHT, ORANGE, ease(t / 0.6) * fade))
            d.text((x0 + bw - fl.getlength("OMNIX"), y0 - 80), "OMNIX", font=fl, fill=lerp(NIGHT, GREY, ease(t / 0.6) * fade))
            for ri, (text, col) in enumerate(rows):
                y = y0 + ri * (th + 18)
                for ci in range(cols):
                    x = x0 + ci * (tw + tg)
                    d.rounded_rectangle((x, y, x + tw, y + th), radius=8, fill=lerp(NIGHT, NIGHT2, fade))
                    d.line((x, y + th // 2, x + tw, y + th // 2), fill=lerp(NIGHT, NIGHT, fade), width=2)
                    ts, spins, ch = settle[(ri, ci)]
                    if t < ts:
                        continue
                    k = int((t - ts) / 0.06)
                    if k < spins:
                        shown = charset[(hash((ri, ci, k)) % (len(charset) - 1)) + 1]
                        c = SOFT
                    else:
                        shown, c = ch, col
                    if shown.strip():
                        cw = fbig.getlength(shown)
                        d.text((x + (tw - cw) / 2, y + 10), shown, font=fbig, fill=lerp(NIGHT2, c, fade))
        if t > T_END + 0.3:
            end_card(im, d, ease((t - T_END - 0.3) / 0.6), tag, dark=True)
        return im

    return render(frame, seconds, out, mood="tech", beat=False, clicks=[c for c in clicks if c < seconds])


class _Mono:
    """Fake 'font' so reelkit.wrap() can wrap by character count."""

    def __init__(self, n):
        self.n = n

    def getlength(self, s):
        return len(s)


FORMATS = {"terminal": terminal, "chain": chain, "chat": chat, "lineart": lineart, "splitflap": splitflap}
