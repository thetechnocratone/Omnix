"""Omnix reel audio kit: synthesised instruments, SFX palette, room reverb, mixing helpers.
Everything is original and generated here (no samples, no licensing).
Stereo float buffers at SR=48000, shape (n, 2).
"""
import numpy as np, wave, subprocess
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
_rng = np.random.default_rng(11)

def buf(sec): return np.zeros((int(sec * SR) + SR, 2))
def tt(dur): return np.arange(int(dur * SR)) / SR
def env_ad(dur, a=0.005, d=0.3, curve=1.0):
    t = tt(dur); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d) ** curve; return e
def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100) / (SR / 2), 'low', output='sos'), x, axis=0)
def hp(x, f, order=2):
    return sosfilt(butter(order, f / (SR / 2), 'high', output='sos'), x, axis=0)
def bp(x, f1, f2, order=2):
    return sosfilt(butter(order, [f1 / (SR / 2), min(f2, SR / 2 - 100) / (SR / 2)], 'band', output='sos'), x, axis=0)
def noise(dur): return _rng.standard_normal(int(dur * SR))
def st(mono, pan=0.0):  # constant-power pan, -1..1
    a = (pan + 1) * np.pi / 4; return np.stack([mono * np.cos(a), mono * np.sin(a)], 1)
def place(dst, src, t, gain=1.0):
    i = int(t * SR)
    if i < 0: src = src[-i:]; i = 0
    j = min(len(dst), i + len(src))
    if j > i: dst[i:j] += src[:j - i] * gain
def hz(note):  # note as semitones from A4=440 or name like 'C3'
    if isinstance(note, (int, float)): return 440 * 2 ** (note / 12)
    names = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}
    n = names[note[0]]; rest = note[1:]
    if rest and rest[0] in '#b': n += 1 if rest[0] == '#' else -1; rest = rest[1:]
    return 440 * 2 ** ((n + (int(rest) - 4) * 12) / 12)

# ---------- room ----------
_IR = {}
def ir(sec=1.8, bright=6000, seed=3):
    k = (sec, bright, seed)
    if k not in _IR:
        r = np.random.default_rng(seed); n = int(sec * SR); t = np.arange(n) / SR
        L = r.standard_normal(n) * np.exp(-t * 6.9 / sec); R = r.standard_normal(n) * np.exp(-t * 6.9 / sec)
        L, R = lp(L, bright), lp(R, bright)
        e = np.stack([L, R], 1); e[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
        _IR[k] = e / np.sqrt((e ** 2).sum() / 2)
    return _IR[k]
def reverb(x, wet=0.25, sec=1.8, bright=6000, predelay=0.015):
    e = ir(sec, bright)
    out = np.stack([fftconvolve(x[:, c], e[:, c])[:len(x)] for c in range(2)], 1)
    d = int(predelay * SR); out = np.concatenate([np.zeros((d, 2)), out[:-d]]) if d else out
    return x * (1 - wet * 0.4) + out * wet

# ---------- instruments (mono) ----------
def kick(pitch=1.0, dur=0.45, punch=1.0):
    t = tt(dur); f = (45 + 95 * np.exp(-t * 28)) * pitch
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 6.5) + 0.25 * np.tanh(3 * np.sin(ph)) * np.exp(-t * 14)
    s[:240] += noise(0.005)[:240] * 0.3 * punch * np.linspace(1, 0, 240)
    return s * 0.9
def clap(dur=0.35):
    t = tt(dur); n = bp(noise(dur), 900, 5000)
    e = sum(np.exp(-np.maximum(t - d, 0) * 60) * (t >= d) for d in (0, 0.011, 0.023)) * 0.5 + np.exp(-t * 12) * 0.6
    return n * e * 0.5
def hat(dur=0.06, open_=False):
    d = 0.25 if open_ else dur; t = tt(d); return hp(noise(d), 7000) * np.exp(-t * (14 if open_ else 70)) * 0.35
def shaker(dur=0.12):
    t = tt(dur); return bp(noise(dur), 4000, 11000) * np.minimum(1, t / 0.03) * np.exp(-t * 30) * 0.4
def tabla_na(f=520, dur=0.6):
    t = tt(dur); s = np.zeros_like(t)
    for h, (m, a, d) in enumerate([(1, 1, 9), (2, .6, 12), (3, .45, 15), (4, .3, 18), (5.02, .15, 22)]):
        s += a * np.sin(2 * np.pi * f * m * t * (1 + 0.012 * np.exp(-t * 30))) * np.exp(-t * d)
    s += bp(noise(dur), 2000, 7000) * np.exp(-t * 80) * 0.5
    return s * 0.35
def tabla_ge(f=82, dur=0.7):
    t = tt(dur); fr = f * (1 + 0.35 * np.exp(-t * 7) - 0.1 * np.exp(-t * 2))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 4.5) + 0.3 * np.sin(4 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 9)
    return s * 0.6
def sub(f, dur, a=0.01, r=0.12):
    t = tt(dur); e = np.minimum(1, t / a) * np.minimum(1, (dur - t) / r).clip(0, 1)
    ph = 2 * np.pi * f * t; return np.tanh(1.3 * (np.sin(ph) + 0.15 * np.sin(2 * ph))) * e * 0.55
def pluck(f, dur=1.4, bright=0.5):
    n = int(dur * SR); P = max(2, int(SR / f)); b = (_rng.random(P) * 2 - 1)
    b = lp(b, 2000 + 8000 * bright, 1)
    y = np.zeros(n); y[:P] = b
    for i in range(P, n): y[i] = 0.996 * 0.5 * (y[i - P] + y[i - P + 1])
    return y * 0.5
def marimba(f, dur=1.0):
    t = tt(dur); s = np.sin(2 * np.pi * f * t) * np.exp(-t * 4) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 16) + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 40)
    return s * np.minimum(1, t / 0.002) * 0.45
def piano(f, dur=2.5, vel=0.8):
    t = tt(dur); s = np.zeros_like(t); B = 0.0004
    for h in range(1, 12):
        fh = f * h * np.sqrt(1 + B * h * h)
        if fh > 16000: break
        s += (vel ** (h * 0.4)) / h ** 1.1 * np.sin(2 * np.pi * fh * t + h) * (np.exp(-t * (0.9 + 0.35 * h)) * 0.75 + 0.25 * np.exp(-t * 0.35 * h))
    s += lp(noise(dur), 3000) * np.exp(-t * 90) * 0.04
    return s * np.minimum(1, t / 0.003) * 0.32 * vel
def pad(freqs, dur, a=0.8, r=1.2, cutoff=1800, det=0.12):
    t = tt(dur); s = np.zeros_like(t)
    for f in freqs:
        for k, dv in enumerate((-det, 0, det)):
            ph = (f * 2 ** (dv / 12) * t + k * 0.33) % 1.0
            s += (2 * ph - 1) * 0.3
    s = lp(s, cutoff, 2)
    e = np.minimum(1, t / a) * np.clip((dur - t) / r, 0, 1)
    return s * e / max(1, len(freqs)) * 0.55
def bell(f, dur=2.0):
    t = tt(dur); return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * d) for m, a, d in [(1, 1, 1.6), (2.76, .5, 3), (5.4, .25, 6), (8.93, .12, 9)]) * 0.25
def drone(sa, dur):
    t = tt(dur); y = np.zeros_like(t)
    y += 0.25 * (np.sin(2 * np.pi * sa / 2 * t) + 0.5 * np.sin(2 * np.pi * sa * t + 1) + 0.25 * np.sin(2 * np.pi * sa * 1.5 * t + 2))
    return y * (0.75 + 0.25 * np.sin(2 * np.pi * 0.08 * t)) * 0.5

# ---------- SFX palette (mono, peaks ~0.8) ----------
def sfx_whoosh(dur=0.45, f0=500, f1=4500, gain=1.0):
    n = int(dur * SR); x = noise(dur); out = np.zeros(n); blk = 480
    for i in range(0, n, blk):
        p = i / n; fc = f0 * (f1 / f0) ** p
        seg = x[max(0, i - 2000):i + blk]
        out[i:i + blk] = bp(seg, fc * 0.6, fc * 1.6)[-len(out[i:i + blk]):]
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    return out * e * 0.9 * gain
def sfx_impact(dur=1.4, low=58):
    t = tt(dur); f = low * (1 + 0.9 * np.exp(-t * 18))
    b = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    n = lp(noise(dur), 1800) * np.exp(-t * 10) * 0.6
    return np.tanh(1.6 * (b + n)) * 0.8
def sfx_tick(f=3200, dur=0.05):
    t = tt(dur); return (np.sin(2 * np.pi * f * t) * 0.6 + bp(noise(dur), 2000, 8000) * 0.5) * np.exp(-t * 160) * 0.7
def sfx_tock(f=1800): return sfx_tick(f, 0.06) * 0.9
def sfx_coin(dur=0.9, f=2600):
    t = tt(dur); s = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * d) for m, a, d in [(1, 1, 6), (1.47, .7, 7), (2.09, .5, 9), (2.76, .35, 11), (3.6, .2, 14)])
    s2 = np.zeros_like(s); k = int(0.045 * SR); s2[k:] = s[:-k] * 0.45
    return (s + s2) * np.minimum(1, t / 0.001) * 0.32
def sfx_pop(f=520, dur=0.12):
    t = tt(dur); fr = f * (1 + 0.8 * np.exp(-t * 60)); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 35) * 0.6
def sfx_riser(dur=1.2, f0=200, f1=1800):
    t = tt(dur); p = t / dur; f = f0 * (f1 / f0) ** (p ** 1.5)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + bp(noise(dur), 1500, 9000) * 0.3 * p
    return s * p ** 2 * 0.8
def sfx_thunk(f=140):
    t = tt(0.35); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 18) + bp(noise(0.35), 600, 2500) * np.exp(-t * 60) * 0.6) * 0.8
def sfx_paper(dur=0.18):
    t = tt(dur); return bp(noise(dur), 1500, 7000) * (np.exp(-t * 25) * (1 + 0.6 * np.sin(2 * np.pi * 45 * t))) * 0.5
def sfx_type():
    t = tt(0.04); return (bp(noise(0.04), 1500, 6000) * np.exp(-t * 200) + np.sin(2 * np.pi * 900 * t) * np.exp(-t * 300) * 0.3) * 0.6
def sfx_ding(f=1320):
    return bell(f, 1.6) * 1.4
def sfx_scratch(dur=0.3):  # strike-through marker
    t = tt(dur); return bp(noise(dur), 800, 4000) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t)) * np.sin(np.pi * t / dur) * 0.45
def sfx_glitch(dur=0.25):
    t = tt(dur); s = np.sign(np.sin(2 * np.pi * 180 * t * (1 + 3 * (t * 37 % 1)))) * 0.2; return bp(s, 300, 5000) * np.sin(np.pi * t / dur) * 0.8

# ---------- output ----------
def write(path, x, peak=0.89):
    x = x / (np.abs(x).max() + 1e-9) * peak
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def mix(video, vo, music, sfx, out, music_gain=0.32, sfx_gain=0.75, vo_gain=1.0, duck=True):
    """Voice over music with sidechain ducking, SFX on top, master to -14 LUFS / -1.5 dBTP."""
    inputs = ["-i", video]
    graph = []; mixes = []
    idx = 1
    if vo:
        inputs += ["-i", vo]; graph.append(f"[{idx}:a]aresample=48000,highpass=f=80,equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,volume={vo_gain},asplit=2[vo][vsc]"); vi = idx; idx += 1
    inputs += ["-i", music]; graph.append(f"[{idx}:a]volume={music_gain}[mu]"); idx += 1
    if vo and duck:
        graph.append("[mu][vsc]sidechaincompress=threshold=0.04:ratio=5:attack=20:release=350[mud]"); mixes.append("[mud]")
    else: mixes.append("[mu]")
    if vo: mixes.append("[vo]")
    if sfx:
        inputs += ["-i", sfx]; graph.append(f"[{idx}:a]volume={sfx_gain}[sx]"); mixes.append("[sx]"); idx += 1
    graph.append("".join(mixes) + f"amix=inputs={len(mixes)}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(graph), "-map", "0:v", "-map", "[a]",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-shortest", "-movflags", "+faststart", out], check=True)
