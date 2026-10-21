# Original score: documentary piano + soft strings, ~80 BPM. Serious A minor through the problem half,
# a gentle lift into C major at the fold to the table, hopeful close, then back to the opening for the loop.
import json, wave, re, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

R = '/home/claude/europe/build/'
SR = 48000
tl = json.load(open(R + 'timeline.json'))
TOTAL = round(round(tl['total'] * 30) / 30, 4); N = int(TOTAL * SR)
rng = np.random.default_rng(9)
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

def piano(f, dur=2.6, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * m * t * (1 + .0004 * m * m)) * g * np.exp(-t * (1.2 + .9 * m)) for m, g in [(1, 1), (2, .45), (3, .2), (4, .1), (5, .05)])
    return x * np.minimum(t / .004, 1) * vel
def strings(fs, dur, cut=1600):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for f in fs:
        for dt in (-.003, 0, .004):
            ph = 2 * np.pi * f * (1 + dt) * t + .002 * np.sin(2 * np.pi * 5.2 * t)
            x += 2 * ((ph / (2 * np.pi)) % 1) - 1
    return lp(x, cut) * np.minimum(t / 1.2, 1) * np.minimum((dur - t) / 1.0, 1)
def bell(f, dur=1.8, d=.6):
    n = int(dur * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * m * t) * g for m, g in [(1, 1), (2.01, .3), (3.02, .12)]) * env(n, .002, d)

BPM = 80; beat = 60 / BPM; BAR = beat * 4
minor = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]     # Am F C G
major = [[48, 52, 55, 59], [53, 57, 60, 64], [45, 48, 52, 55], [55, 59, 62, 65]]   # Cmaj7 F Am G
LIFT = 33.2; BACK = 57.8
music = np.zeros(N)
bar = 0; t0 = 0.0
while t0 < TOTAL:
    lifted = LIFT <= t0 < BACK
    ch = (major if lifted else minor)[bar % 4]
    root = ch[0] - 12
    add(music, piano(hz(root - 12), 3.2, .5), t0, .30)
    add(music, piano(hz(root), 3.0, .5), t0, .22)
    # gentle eighth-note figure: sparse and low in the problem half, opens up after the lift
    figure = [0, 1, 2, 1, 2, 1, 0, 2] if lifted else [0, 2, 1, 2]
    step = beat / 2 if lifted else beat
    for k, idx in enumerate(figure):
        add(music, piano(hz(ch[idx % len(ch)] + 12), 2.0, .9 if k == 0 else .6), t0 + k * step, .11)
    if lifted and bar % 2 == 1: add(music, piano(hz(ch[-1] + 24), 2.4, .7), t0 + beat * 2.5, .07)
    st = strings([hz(m) for m in ch[:3]], BAR + 1.0, 1400 if not lifted else 2200)
    add(music, st, t0, .018 if not lifted else .026)
    t0 += BAR; bar += 1
music *= .95
music = music + .25 * fftconvolve(music, rng.standard_normal(int(1.6 * SR)) * np.exp(-np.arange(int(1.6 * SR)) / SR / .6) * .02)[:N]

# ---------------------------------------------------------------- sound effects
fx = np.zeros(N)
def squeak(dur=.45):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 1900 + 500 * np.sin(2 * np.pi * 6 * t)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 + bp(rng.standard_normal(n), 2500, 7000) * .8
    return tone * np.sin(np.pi * t / dur) ** .6 * (.6 + .4 * (np.sin(2 * np.pi * 11 * t) > 0))
def stamp():
    n = int(.4 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(90 + 60 * np.exp(-t / .02)) / SR) * env(n, .001, .09) + .4 * lp(rng.standard_normal(n), 1500) * env(n, .001, .03)
def murmur(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(bp(rng.standard_normal(n), 200 + 90 * k, 800 + 160 * k) for k in range(5))
    return x * np.sin(np.pi * t / dur) ** 1.2 * (1 + .25 * np.sin(2 * np.pi * 2.3 * t))
def whoosh(dur=.9, lo=200, hi=2500):
    n = int(dur * SR); noise = rng.standard_normal(n); out = np.zeros(n); k = 512
    for s in range(0, n, k):
        fr = s / n; out[s:s + k] = bp(noise[s:s + k], lo + (hi - lo) * .4 * fr, lo * 2 + (hi - lo) * fr, 1)
    return out * np.sin(np.pi * np.arange(n) / n) ** 2
def slide(dur=.3): n = int(dur * SR); return bp(rng.standard_normal(n), 600, 3000) * np.sin(np.pi * np.arange(n) / n) * .5
def tick(): n = int(.04 * SR); return bp(rng.standard_normal(n), 2000, 7000) * env(n, .0005, .006)

for i, m in enumerate([69, 73, 76]): add(fx, bell(hz(m + 12), 1.2, .45), i * .17, .2)      # sound logo
for i in range(6): add(fx, tick(), W(1, 'cities') + i * .1, .25)
for i in range(6): add(fx, tick(), W(1, 'triggers') + i * .12, .2)
add(fx, squeak(.7), W(1, 'living') - .05, .16)                      # marker circles COST OF LIVING
add(fx, stamp(), W(2, 'september'), .6)                               # 17 SEP stamp
for w in ['spain', 'belgium', 'italy', 'portugal', 'albania']: add(fx, squeak(.4), W(2, w) - .12, .1)
add(fx, stamp(), W(3, 'october'), .35)
add(fx, murmur(4.2), 17.6, .12)                                       # crowd under the counter
for w in ['rent', 'food', 'schools', 'public']: add(fx, slide(), W(4, w) - .1, .35)
add(fx, slide(.4), 25.1, .3)
for w in ['company', 'government']:
    add(fx, squeak(.4), W(5, w), .14); add(fx, squeak(.35), W(5, w) + .22, .12)
add(fx, whoosh(1.2), 32.9, .2); add(fx, whoosh(1.2), 57.7, .2)
seats = [W(6, 'citizens'), W(6, 'broken') + .1, W(6, 'governments'), W(6, 'builders'), W(6, 'businesses'), W(7, 'tech')]
notes = [76, 79, 81, 84, 86, 88]
for s, m in zip(seats, notes): add(fx, bell(hz(m), 1.6, .55), s, .13)   # warm chime per seat
for w in ['open', 'ai', 'robots']: add(fx, bell(hz(91), .9, .3), W(7, w), .06)
for i, m in enumerate([72, 76, 79, 84]): add(fx, bell(hz(m), 2.2, .9), W(7, 'picture') + i * .12, .09)
for i in range(3): add(fx, slide(.25), W(8, 'what') + i * .15, .25)
for w in ['housing', 'food', 'school']: add(fx, bell(hz(84), .6, .2), W(8, w), .08)

# ---------------------------------------------------------------- voice, ducking (~14 dB), master
w = wave.open(R + 'vo_track.wav'); vo = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
vo = np.interp(T, np.arange(len(vo)) / 24000, vo)
venv = lp(np.abs(vo), 6, 1); venv /= venv.max() + 1e-9
duck = lp(1 - .8 * np.clip(venv * 4, 0, 1), 4, 1)
bed = music * .7 * duck + fx * (1 - .3 * np.clip(venv * 4, 0, 1))
mixd = vo + bed * .5
f = int(.015 * SR); mixd[:f] *= np.linspace(0, 1, f); mixd[-f:] *= np.linspace(1, 0, f)
mixd = np.stack([mixd, mixd], 1); mixd /= np.abs(mixd).max() / .8
o = wave.open(R + 'mix_raw.wav', 'w'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
o.writeframes((mixd * 32767).astype(np.int16).tobytes()); o.close()
print('ok', TOTAL)
