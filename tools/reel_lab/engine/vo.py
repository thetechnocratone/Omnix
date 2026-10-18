"""Tighten a voiceover's pauses and remap its word timings.

Usage: python3 vo.py DIR MAX_GAP [t=gap ...]
  DIR has vo_raw.wav + words_raw.json ([[text, start_ms, end_ms], ...])
  MAX_GAP  longest pause (s) to keep; longer pauses shrink to it
  t=gap    a pause that starts near time t (s, raw clock) keeps `gap` seconds instead
Writes DIR/vo.wav (48 kHz mono, lightly mastered) and DIR/words.json ([[text, start_s, end_s], ...]).
"""
import sys, json, wave, numpy as np
from scipy.signal import resample_poly

d, maxgap = sys.argv[1], float(sys.argv[2])
over = {}
for a in sys.argv[3:]:
    k, v = a.split("="); over[float(k)] = float(v)

w = wave.open(f"{d}/vo_raw.wav"); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
x = resample_poly(x, 2, 1) if sr == 24000 else x; sr = 48000
hop = sr // 100
rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
sil = 20 * np.log10(rms + 1e-9) < -42
runs, i = [], 0
while i < len(sil):
    if sil[i]:
        j = i
        while j < len(sil) and sil[j]: j += 1
        runs.append((i / 100, j / 100)); i = j
    else: i += 1

# knots: piecewise-linear map raw time -> new time
knots = [(0.0, 0.0)]; segs = []; cur_raw = 0.0; cur_new = 0.0
lead = runs[0][1] if runs and runs[0][0] == 0 else 0.0
start_raw = max(0.0, lead - 0.12)
cur_raw = start_raw; knots = [(start_raw, 0.0)]
tail_end = len(x) / sr
for a, b in runs:
    if a <= start_raw: continue
    if b >= tail_end - 0.02:  # trailing silence
        b = tail_end
    g = b - a
    keep = maxgap
    for t, v in over.items():
        if abs(a - t) < 0.6: keep = v
    if g > keep:
        # keep audio up to a + keep/2, skip to b - keep/2
        cut_a, cut_b = a + keep / 2, b - keep / 2
        segs.append((cur_raw, cut_a))
        cur_new += cut_a - cur_raw; knots.append((cut_a, cur_new))
        cur_raw = cut_b; knots.append((cut_b, cur_new))
segs.append((cur_raw, tail_end)); cur_new += tail_end - cur_raw; knots.append((tail_end, cur_new))

def warp(t):
    for (r0, n0), (r1, n1) in zip(knots, knots[1:]):
        if r0 <= t <= r1:
            return n0 + (t - r0) * ((n1 - n0) / (r1 - r0) if r1 > r0 else 0)
    return knots[-1][1] if t > knots[-1][0] else 0.0

parts = []
fade = int(0.006 * sr)
for a, b in segs:
    s = x[int(a * sr):int(b * sr)].copy()
    if len(s) > 2 * fade:
        s[:fade] *= np.linspace(0, 1, fade); s[-fade:] *= np.linspace(1, 0, fade)
    parts.append(s)
y = np.concatenate(parts)
y = y / (np.abs(y).max() + 1e-9) * 0.89
with wave.open(f"{d}/vo.wav", "wb") as o:
    o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
    o.writeframes((y * 32767).astype(np.int16).tobytes())
words = json.load(open(f"{d}/words_raw.json"))
out = [[t, round(warp(a / 1000), 3), round(warp(b / 1000), 3)] for t, a, b in words]
json.dump(out, open(f"{d}/words.json", "w"))
print(f"{len(x)/sr:.2f}s -> {len(y)/sr:.2f}s, {len(segs)} segments")
