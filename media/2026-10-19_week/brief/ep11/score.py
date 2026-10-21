# Original score for the one-take spy-chip reel.
# Problem half: sub-bass drone, warehouse room tone, sparse clock ticks at 68 BPM, no melody.
# The shift ("nobody fixes this alone"): a warm D-major chord blooms, soft piano arrives.
# The end returns to the exact opening state so the loop is seamless in sound too.
import json, wave, re, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

R = '/home/claude/spychip/build/'
SR = 48000
tl = json.load(open(R + 'timeline.json'))
TOTAL = round(round(tl['total'] * 30) / 30, 4); N = int(TOTAL * SR)
rng = np.random.default_rng(7)
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
def tone(f, dur, a=.01, d=1.0, parts=((1, 1),)):
    n = int(dur * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * m * t) * g for m, g in parts) * env(n, a, d)
def bell(f, dur=1.6, d=.7): return tone(f, dur, .002, d, ((1, 1), (2.01, .35), (3.02, .14), (4.17, .06)))
def piano(f, dur=2.4): return tone(f, dur, .004, .8, ((1, 1), (2, .4), (3, .18), (4, .08))) * (1 + 0 * f)
def tick(f=2600, g=1.0):
    n = int(.03 * SR); return bp(rng.standard_normal(n), f * .6, min(f * 1.6, 20000)) * env(n, .0004, .006) * g
def thunk():
    n = int(.6 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(70 * (1 + 1.4 * np.exp(-t / .03))) / SR) * env(n, .001, .14)
    return body + .4 * lp(rng.standard_normal(n), 900) * env(n, .001, .05)
def whoosh(dur=.8, lo=300, hi=4000):
    n = int(dur * SR); noise = rng.standard_normal(n); out = np.zeros(n); k = 512
    for s in range(0, n, k):
        fr = s / n; out[s:s + k] = bp(noise[s:s + k], lo + (hi - lo) * .4 * fr, lo * 2 + (hi - lo) * fr, 1)
    return out * np.sin(np.pi * np.arange(n) / n) ** 2
def fwump(dur=.9):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(45 + 30 * np.exp(-t / .2)) / SR) * env(n, .03, .35) + .25 * lp(rng.standard_normal(n), 600) * env(n, .02, .2)
def coin(f):
    n = int(.35 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .6 * np.sin(2 * np.pi * f * 2.76 * t) + .3 * np.sin(2 * np.pi * f * 5.4 * t)) * env(n, .0005, .07)
def jingle():
    out = np.zeros(int(.5 * SR))
    for i in range(5): add(out, coin(2400 + 600 * rng.random()), i * .03 + .02 * rng.random(), .5)
    return out
def scan(dur=1.35):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 500 * 2 ** (2 * t / dur)                     # rising two octaves
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (.6 + .4 * (np.sin(2 * np.pi * 14 * t) > 0))
    return lp(x, 4000) * np.minimum(t / .05, 1) * np.minimum((dur - t) / .08, 1)
def zip_(dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 300 + 1500 * t / dur
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .3 * np.sin(np.pi * t / dur) ** 2
def pop(f=1200):
    n = int(.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f * (1 + .8 * np.exp(-t / .012))) / SR) * env(n, .001, .04)
def knock():
    n = int(.25 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 180 * t) * env(n, .001, .05) + .5 * bp(rng.standard_normal(n), 800, 3000) * env(n, .0005, .015)
def scrape(dur=.6):
    n = int(dur * SR); return bp(rng.standard_normal(n), 900, 4000) * np.sin(np.pi * np.arange(n) / n) * .5
def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 2000, 9000) * (t / dur) ** 2
    return x + .3 * np.sin(2 * np.pi * np.cumsum(800 + 1600 * t / dur) / SR) * (t / dur) ** 2

# ---------------------------------------------------------------- music
shift = E(T, 35.2, 37.0) * (1 - E(T, 49.1, 50.3))
dark = 1 - shift
music = np.zeros(N)
# sub-bass drone on D (continuous; same level at frame 0 and at the end)
d1, d2 = hz(26), hz(38)
music += dark * (.55 * np.sin(2 * np.pi * d1 * T) + .22 * np.sin(2 * np.pi * d2 * T + .3 * np.sin(2 * np.pi * .11 * T)))
# low dark cluster pad, slow breathing, no melody
pad = sum(np.sin(2 * np.pi * hz(m) * T * (1 + dt)) for m, dt in [(50, 0), (53, .0015), (57, -.001), (50, .003)])
music += dark * .05 * lp(pad, 700) * (.7 + .3 * np.sin(2 * np.pi * T / 7.06))
# sparse ticking at 68 BPM
beat = 60 / 68
k = 0; t0 = 0.0
while t0 < TOTAL:
    g = float(dark[min(int(t0 * SR), N - 1)])
    if g > .02:
        add(music, tick(2800, .35 if k % 4 == 0 else .18), t0, g)
        if k % 8 == 6: add(music, tick(1800, .12), t0 + beat / 2, g)
    t0 += beat; k += 1
# the bloom: warm D major (add9), then I - vi - IV - V under soft piano
prog = [[50, 54, 57, 64, 62], [47, 50, 54, 61, 59], [43, 50, 55, 59, 62], [45, 49, 52, 57, 61]]
BAR = beat * 4
start = 36.55
warm = np.zeros(N)
for i in range(4):
    tt = start + i * BAR
    if tt > 49.6: break
    ch = prog[i % 4]
    n = int((BAR + 2.5) * SR); t = np.arange(n) / SR
    chord = sum(np.sin(2 * np.pi * hz(m) * t) + .3 * np.sin(2 * np.pi * hz(m) * 2.003 * t) for m in ch)
    chord *= np.minimum(t / (1.6 if i == 0 else .6), 1) * np.exp(-np.maximum(t - BAR, 0) / .8)
    add(warm, lp(chord, 1800), tt, .05 if i else .07)
    add(warm, np.sin(2 * np.pi * hz(ch[0] - 12) * t) * np.minimum(t / .3, 1) * np.exp(-np.maximum(t - BAR, 0) / .6), tt, .22)
    for j, m in enumerate([ch[2] + 12, ch[3] + 12, ch[4] + 12, ch[3] + 12]):
        add(warm, piano(hz(m)), tt + .5 + j * beat, .1)
music += warm * E(T, 35.8, 36.6) * (1 - E(T, 49.0, 50.0))

# ---------------------------------------------------------------- sound effects
fx = np.zeros(N)
room = lp(rng.standard_normal(N), 380) * .05 + .012 * np.sin(2 * np.pi * 100 * T) + hp(lp(rng.standard_normal(N), 3000), 1500) * .006
fx += room * dark
# sound logo at frame 0: 0.6 s rising three-note chime
for i, m in enumerate([69, 73, 76]): add(fx, bell(hz(m + 12), 1.2, .45), .0 + i * .17, .22)
add(fx, riser(2.2), 2.6, .08)                                       # lid seam glows
add(fx, whoosh(1.4, 200, 2500), 5.5, .22)                           # swing along the shelf
add(fx, whoosh(1.0, 200, 3000), 7.9, .12)
add(fx, scrape(.25), W(2, 'reseller'), .25)                         # the tag swings in
add(fx, whoosh(1.3, 300, 6000), 9.7, .3); add(fx, fwump(), 10.25, .55)   # through the lid seam
add(fx, whoosh(.9, 300, 6000), 10.95, .25); add(fx, fwump(.7), 11.35, .4)  # through the case
add(fx, tone(3200, .25, .002, .08), W(3, 'watched'), .06)          # the lens focuses
for i in range(24): add(fx, tick(4200, .5), 12.0 + i * 2.0 / 24, .25)   # words lighting up on the screen
for i in range(4): add(fx, jingle(), W(3, 'grab') + i * .13 + .55, .35)
add(fx, zip_(1.2), 15.2, .1); add(fx, whoosh(1.2, 400, 3000), 15.2, .15)
for i in range(130):                                                # coin trickle; densest while the counter rolls
    tt = 16.25 + (i / 130) ** 1.5 * 7.2
    add(fx, coin(1800 + 1400 * rng.random()), tt + .02 * rng.random(), .16 * (1.2 if 16.5 < tt < 17.9 else .6))
add(fx, whoosh(1.1, 200, 2500), 23.5, .22)
add(fx, scan(1.35), 26.0, .16); add(fx, bell(hz(88), 1.0, .3), W(5, 'authenticity') + .1, .12)
add(fx, tone(55, 1.2, .05, .5), W(5, 'separate'), .35)
add(fx, whoosh(1.3, 200, 2500), 30.0, .25)
for i in range(7):
    add(fx, thunk(), 30.85 + i * .2 + .3, .45 if i == 0 else .3)  # PAUSED tags land, row by row
    add(fx, tick(900, .6), 31.65 + i * .42, .3)                     # the row's lights go down
add(fx, thunk(), 31.8, .35)
for i in range(7): add(fx, scrape(.5), 33.1 + i * .1, .12)          # resellers trimmed
add(fx, whoosh(2.0, 150, 2200), 34.9, .25); add(fx, riser(1.6), 35.0, .06)
for i, p in enumerate(['makers', 'sellers', 'buyers', 'regulators']): add(fx, pop(900 + 160 * i), W(7, p), .25)
for i in range(4): add(fx, knock(), 41.45 + i * .12 + .3, .3)
for i, w in enumerate(['of', 'every', 'handoff']): add(fx, bell(hz(81 + [0, 4, 7][i]), 1.0, .35), W(7, w), .12)
add(fx, whoosh(1.4, 200, 2500), 43.45, .15)
for i, tt in enumerate([43.73, 44.0, 44.3, 44.67]): add(fx, pop(1300 + 120 * i), tt, .15)
add(fx, whoosh(1.2, 150, 2600), 44.85, .25)
add(fx, bell(hz(86), 2.2, .9), 45.55, .2); add(fx, bell(hz(93), 2.0, .8), 45.62, .1)   # the seal
add(fx, pop(1000), 46.6, .2); add(fx, pop(1500), W(8, 'yes'), .3); add(fx, pop(1100), W(8, 'no'), .3)
add(fx, whoosh(1.2, 200, 2000), 49.1, .12)

# ---------------------------------------------------------------- voice, ducking (~14 dB), room, master
w = wave.open(R + 'vo_track.wav'); vo = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
vo = np.interp(T, np.arange(len(vo)) / 24000, vo)
venv = lp(np.abs(vo), 6, 1); venv /= venv.max() + 1e-9
duck = lp(1 - .8 * np.clip(venv * 4, 0, 1), 4, 1)                 # 0.2 = -14 dB under the voice
irn = int(.6 * SR); ir = rng.standard_normal(irn) * np.exp(-np.arange(irn) / SR / .22); ir = lp(ir, 5000); ir /= np.abs(ir).sum() / 6
bed = music * duck + fx * (1 - .35 * np.clip(venv * 4, 0, 1))
bed = bed + .18 * fftconvolve(bed, ir)[:N]
mixd = vo * 1.0 + bed * .5
f = int(.015 * SR); mixd[:f] *= np.linspace(0, 1, f); mixd[-f:] *= np.linspace(1, 0, f)
mixd = np.stack([mixd, mixd], 1); mixd /= np.abs(mixd).max() / .8
o = wave.open(R + 'mix_raw.wav', 'w'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
o.writeframes((mixd * 32767).astype(np.int16).tobytes()); o.close()
print('ok', TOTAL)
