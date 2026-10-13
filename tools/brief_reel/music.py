"""Tanpura-style drone bed. Usage: python3 music.py OUT.wav SECONDS [seed]"""
import sys, wave, numpy as np
out, D = sys.argv[1], float(sys.argv[2]); seed = int(sys.argv[3]) if len(sys.argv) > 3 else 1
sr = 44100; n = int(sr * D); y = np.zeros(n); rng = np.random.default_rng(seed)
Sa = [130.81, 138.59, 146.83, 123.47][seed % 4]; Pa = Sa * 1.5
def pluck(f, dur=4.5, amp=1.0):
    t = np.arange(int(sr * dur)) / sr; s = np.zeros_like(t)
    for h in range(1, 14):
        a = (1 / h ** 0.9) * np.exp(-t * (0.35 + 0.12 * h)) * (1 + 0.6 * np.sin(2 * np.pi * (0.4 + 0.05 * h) * t + h) * (h > 3))
        s += a * np.sin(2 * np.pi * f * h * t * (1 + 0.0004 * h) + rng.random() * 6)
    return amp * s * np.minimum(1, t / 0.01)
t0, i = 0.0, 0
while t0 < D - 1:
    p = pluck([Pa, Sa * 2, Sa * 2, Sa][i % 4], amp=1.1 if i % 4 == 3 else 0.9)
    s = int(t0 * sr); e = min(n, s + len(p)); y[s:e] += p[:e - s]; t0 += 1.25; i += 1
t = np.arange(n) / sr
y += 0.25 * (np.sin(2 * np.pi * Sa / 2 * t) + 0.5 * np.sin(2 * np.pi * Sa * t + 1)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t))
f = np.ones(n); f[:2 * sr] = np.linspace(0, 1, 2 * sr); f[-3 * sr:] = np.linspace(1, 0, 3 * sr); y *= f
r = y.copy()
for dl, g in [(0.031, .35), (0.047, .3), (0.071, .25), (0.113, .2)]:
    k = int(dl * sr); r[k:] += g * y[:-k]
r = r / np.abs(r).max() * 0.85
with wave.open(out, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((r * 32767).astype(np.int16).tobytes())
