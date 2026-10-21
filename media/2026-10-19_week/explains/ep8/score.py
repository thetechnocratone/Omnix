# Original score: bright, playful synth-pop at 120 BPM. At "here's why it matters" it strips back to a quiet
# bass and soft pad; the beat builds back for the vote so the end matches frame 0 and the loop is seamless.
import json, wave, re, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

R = '/home/claude/zine/build/'
SR = 48000
tl = json.load(open(R + 'timeline.json'))
TOTAL = round(round(tl['total'] * 30) / 30, 4); N = int(TOTAL * SR)
rng = np.random.default_rng(3)
T = np.arange(N) / SR

def cl(x): return np.clip(x, 0, 1)
def E(t, a, b):
    x = cl((t - a) / (b - a)); return np.where(x < .5, 4 * x ** 3, 1 - (-2 * x + 2) ** 3 / 2)
def env(n, a=.005, d=.3):
    t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def add(buf, x, t, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= len(buf): return
    x = x[:len(buf) - i]; buf[i:i + len(x)] += x * g
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def W(b, word, n=1):
    c = 0
    for w in tl['beats'][b - 1]['words']:
        if re.sub(r"[“”\".,:?!]", "", w['w'].lower()) == word:
            c += 1
            if c == n: return w['s']
    raise KeyError(word)

# ---------------------------------------------------------------- instruments
def kick():
    n = int(.35 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-t / .03)) / SR) * env(n, .001, .16)
def clap():
    n = int(.25 * SR); x = bp(rng.standard_normal(n), 900, 5000)
    e = sum(env(n, .001, .012) * (np.arange(n) >= int(k * .009 * SR)) for k in range(3)) + env(n, .001, .09) * .6
    return x * e
def hat(d=.04): n = int(.08 * SR); return hp(rng.standard_normal(n), 8000) * env(n, .0005, d)
def saw(f, n): t = np.arange(n) / SR; return 2 * ((f * t) % 1) - 1
def pluck(f, dur=.25, bright=4000):
    n = int(dur * SR); x = saw(f, n) + .5 * saw(f * 1.006, n)
    return lp(x, bright) * env(n, .002, .12)
def bass(f, dur=.24):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .35 * lp(saw(f, n), 900)) * env(n, .003, .2)
def pad(fs, dur, cut=1500):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(saw(f, n) + saw(f * 1.004, n) for f in fs)
    return lp(x, cut) * np.minimum(t / .3, 1) * np.minimum((dur - t) / .4, 1)
def bell(f, dur=1.2, d=.45):
    n = int(dur * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * m * t) * g for m, g in [(1, 1), (2.01, .35), (3.02, .14)]) * env(n, .002, d)

# ---------------------------------------------------------------- music
BPM = 120; b = 60 / BPM; s16 = b / 4
prog = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]]   # C - Am - F - G (maj7 colours)
roots = [36, 33, 29, 31]
hook = [72, 74, 76, 79, 76, 74, 72, 67]
full = 1 - E(T, 27.7, 28.3) + E(T, 44.6, 46.4)          # 1 = full band, 0 = stripped back
full = np.clip(full, 0, 1)
drums = np.zeros(N); synth = np.zeros(N); low = np.zeros(N)
t0 = 0.0; k = 0
while t0 < TOTAL:
    bar = int(k // 16); ch = prog[bar % 4]; step = k % 16
    g = float(full[min(int(t0 * SR), N - 1)])
    if step % 4 == 0: add(drums, kick(), t0, .9 * g)
    if step in (4, 12): add(drums, clap(), t0, .45 * g)
    if step % 2 == 1: add(drums, hat(), t0, .16 * g)
    if step in (0, 3, 6, 8, 11, 14): add(low, bass(hz(roots[bar % 4] + (12 if step in (6, 14) else 0))), t0, .5)
    if step % 2 == 0: add(synth, pluck(hz(ch[(step // 2) % 4] + 12)), t0, .12 * g)
    if bar % 2 == 1 and step % 2 == 0 and g > .05: add(synth, pluck(hz(hook[(step // 2) % 8]), .3, 5000), t0, .10 * g)
    t0 += s16; k += 1
pads = np.zeros(N)
for i in range(int(TOTAL / (16 * s16)) + 1):
    add(pads, pad([hz(m) for m in prog[i % 4]], 16 * s16 + .4, 1200), i * 16 * s16, .03)
music = drums + synth + low * (.55 + .45 * full) + pads * (1.3 - .5 * full)

# ---------------------------------------------------------------- sound effects
fx = np.zeros(N)
def rustle(dur=.4):
    n = int(dur * SR); x = bp(rng.standard_normal(n), 1500, 7000)
    return x * (np.abs(lp(rng.standard_normal(n), 30)) * 3) * np.sin(np.pi * np.arange(n) / n)
def rip(dur=.35):
    n = int(dur * SR); x = bp(rng.standard_normal(n), 800, 6000) * (rng.random(n) > .55)
    return x * np.sin(np.pi * np.arange(n) / n) ** .5
def shutter():
    n = int(.12 * SR); x = bp(rng.standard_normal(n), 2000, 8000)
    e = env(n, .0005, .008) + np.roll(env(n, .0005, .012), int(.05 * SR)) * .8
    return x * e
def thud():
    n = int(.5 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(60 + 80 * np.exp(-t / .02)) / SR) * env(n, .001, .12) + .5 * lp(rng.standard_normal(n), 1200) * env(n, .001, .03)
def crowd(dur=3.2):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(bp(rng.standard_normal(n), 250 + 80 * k, 900 + 200 * k) for k in range(4))
    return x * np.sin(np.pi * t / dur) ** 1.5 * (1 + .3 * np.sin(2 * np.pi * 3.1 * t))
def pop(f=1200):
    n = int(.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f * (1 + .8 * np.exp(-t / .012))) / SR) * env(n, .001, .04)
def boop(f, d=.18): n = int(d * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * env(n, .002, .06)

# sound logo at frame 0
for i, m in enumerate([69, 73, 76]): add(fx, bell(hz(m + 12), 1.0, .4), i * .17, .2)
cuts = [2.35, 5.2, 6.75, 9.3, 11.25, 13.25, 15.35, 17.45, 21.05, 22.95, 25.05, 27.95, 29.5, 31.85, 34.25, 35.95, 37.85, 39.9, 42.45, 43.65, 46.45, 49.75]
tears = {5.2, 9.3, 13.25, 17.45, 25.05, 29.5, 34.25, 39.9, 43.65}
for c in cuts:
    add(fx, rip() if c in tears else rustle(), c, .35 if c in tears else .3)
add(fx, rustle(.6), 2.35, .3)
# shutters on slap-ins
slaps = [W(1, 'pregnant'), *[W(2, 'babyqueen') - .12 + i * .07 for i in range(0, 9, 2)], W(2, 'five'), W(2, 'five') + .3, W(2, 'members'), W(2, 'members') + .3, W(2, 'all'),
         *[W(2, 'made') + i * .08 for i in range(5)], W(2, 'northeast'), W(3, 'said'), W(4, 'admitted'), W(5, "here's"), W(5, 'matters'),
         *[W(5, 'most') + i * .15 for i in range(3)], W(6, 'platforms'), W(6, 'creators'), W(6, 'viewers'), *[42.75 + i * .12 for i in range(3)],
         W(7, 'should'), W(7, 'ai'), W(7, 'fake'), W(7, 'life'), W(7, 'events')]
for s in slaps: add(fx, shutter(), s, .3)
add(fx, thud(), W(2, 'from') + .2, .3)                               # map pin
for i in range(8): add(fx, boop(500 + 60 * i, .06), W(2, 'about') - .2 + i * .1, .08)   # dots tick up
add(fx, rip(.25), 11.6, .1)
add(fx, crowd(3.4), 17.6, .4)                                        # 75 million: crowd swell
for i in range(14): add(fx, pop(900 + 70 * i), 17.5 + i * .05, .08)
for i in range(8): add(fx, shutter(), W(4, 'furious') + i * .09, .22)
add(fx, rip(.5), 22.95, .5)
add(fx, thud(), W(4, 'stunt'), .6)                                   # STUNT? stamp
add(fx, thud(), W(6, 'says'), .7); add(fx, bell(hz(88), 1.2, .4), W(6, 'says') + .08, .12)   # the label stamp
for i in range(4): add(fx, pop(1100 + 150 * i), W(6, 'proof') + i * .1, .2)
for i in range(6): add(fx, rustle(.12), W(6, "can't") - .2 + i * .12, .18)  # eraser
add(fx, bell(hz(84), 1.2, .5), W(6, 'together'), .12)
add(fx, pop(1500), W(7, 'a'), .35); add(fx, pop(1100), W(7, 'b'), .35)

# ---------------------------------------------------------------- voice, ducking (~14 dB), room, master
w = wave.open(R + 'vo_track.wav'); vo = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
vo = np.interp(T, np.arange(len(vo)) / 24000, vo)
venv = lp(np.abs(vo), 6, 1); venv /= venv.max() + 1e-9
duck = lp(1 - .8 * np.clip(venv * 4, 0, 1), 4, 1)
irn = int(.4 * SR); ir = rng.standard_normal(irn) * np.exp(-np.arange(irn) / SR / .12); ir = lp(ir, 6000); ir /= np.abs(ir).sum() / 6
bed = music * .55 * duck + fx * (1 - .35 * np.clip(venv * 4, 0, 1))
bed = bed + .14 * fftconvolve(bed, ir)[:N]
mixd = vo + bed * .5
f = int(.015 * SR); mixd[:f] *= np.linspace(0, 1, f); mixd[-f:] *= np.linspace(1, 0, f)
mixd = np.stack([mixd, mixd], 1); mixd /= np.abs(mixd).max() / .8
o = wave.open(R + 'mix_raw.wav', 'w'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
o.writeframes((mixd * 32767).astype(np.int16).tobytes()); o.close()
print('ok', TOTAL)
