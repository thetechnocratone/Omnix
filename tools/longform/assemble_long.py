"""Stitch per-segment voice clips into one track for a long-form 16:9 film and write timings.

Usage: python3 assemble_long.py FILM_DIR
Needs FILM_DIR/draft.json and FILM_DIR/vo_segs/000.wav, 001.wav ... (one clip per seg, in order).
Part (sentence) boundaries inside each clip are found from the longest pauses.
Writes FILM_DIR/vo.wav and FILM_DIR/episode.json.
"""
import json, sys, os, subprocess, wave
import numpy as np
ep = sys.argv[1]; SR = 24000
d = json.load(open(os.path.join(ep, "draft.json")))
REEL = d.get("reel", False)
TITLE, CHAP, GAP = (0.6, 3.4, 0.55) if REEL else (5.0, 3.4, 0.75)
OUTRO = 4.0 if REEL else 8.0

def load(fn):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", fn, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    m = np.where(np.abs(a) > 0.01)[0]
    return a[max(0, m[0] - int(0.03 * SR)): m[-1] + int(0.08 * SR)] if len(m) else a

def pauses(a):
    fr = int(0.02 * SR); n = len(a) // fr
    e = np.sqrt((a[:n * fr].reshape(n, fr) ** 2).mean(1)); sil = e < 0.008
    out = []; i = 0
    while i < n:
        if sil[i]:
            j = i
            while j < n and sil[j]: j += 1
            if j < n and i > 0: out.append(((i + j) / 2 * 0.02, (j - i) * 0.02, i * 0.02, j * 0.02))
            i = j
        else: i += 1
    return out

t = TITLE; buf = [np.zeros(int(t * SR))]; segs = []
for si, s in enumerate(d["segs"]):
    if s.get("chapter") and si > 0:
        buf.append(np.zeros(int(CHAP * SR))); t += CHAP
    elif si > 0:
        buf.append(np.zeros(int(GAP * SR))); t += GAP
    a = load(os.path.join(ep, "vo_segs", f"{si:03d}.wav")); L = len(a) / SR
    np_ = len(s["parts"]); ps = pauses(a)
    # choose np_-1 longest pauses, prefer ones that roughly match the text proportions
    lens = np.array([len(p) for p in s["parts"]], float); exp = np.cumsum(lens)[:-1] / lens.sum() * L
    cuts = []
    for e_ in exp:
        cand = [p for p in ps if p not in cuts]
        if not cand: break
        best = max(cand, key=lambda p: p[1] * 3 - abs(p[0] - e_) * 0.6)
        cuts.append(best)
    while len(cuts) < np_ - 1:
        e_ = exp[len(cuts)]; cuts.append((e_, 0, e_, e_))
    cuts = sorted(cuts)
    parts = []
    for pi, txt in enumerate(s["parts"]):
        a0 = 0.0 if pi == 0 else cuts[pi - 1][3]
        b0 = cuts[pi][2] if pi < len(cuts) else L
        parts.append([txt, round(t + a0, 3), round(t + b0, 3)])
    segs.append({"text": " ".join(s["parts"]), "scene": s["scene"], "a": s.get("a", {}), "keys": s.get("keys", []),
                 "chapter": s.get("chapter"), "start": round(t, 3), "end": round(t + L, 3), "parts": parts})
    buf.append(a); t += L
tail = 0.6 if REEL else 1.2
buf.append(np.zeros(int(tail * SR))); t += tail
y = np.concatenate(buf)
with wave.open(os.path.join(ep, "vo.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
out = {k: d[k] for k in ("film", "title", "subtitle", "signoff", "disclaimer", "sources") if k in d}
n = 0
for s in segs:
    if s["chapter"]: n += 1; s["chapterNo"] = n
out.update(segs=segs, endStart=round(t, 2), total=round(t + OUTRO + 0.5, 2), intro=TITLE, outro=OUTRO, vertical=REEL)
json.dump(out, open(os.path.join(ep, "episode.json"), "w"), indent=1)
print(f"voice ends {t:.1f}s, total {t+9:.1f}s, {len(segs)} segs")
