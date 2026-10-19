# Original score: pulsing pluck arp + sub + hats, glitch ticks on every cut, terminal key clicks,
# music drops out on "the real risk is this one habit" and returns brighter on the fix. Voice ducks the bed.
import json, wave, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

R = '/home/claude/deposit/build/'
SR = 48000
tl = json.load(open(R + 'timeline.json'))
TOTAL = tl['total']; N = int(TOTAL * SR)
CUT = {c['id']: c['t'] for c in tl['cuts']}
rng = np.random.default_rng(11)

def env(n, a=.005, d=.3):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def add(buf, x, t, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= len(buf): return
    x = x[:len(buf) - i]; buf[i:i + len(x)] += x * g
def hz(m): return 440 * 2 ** ((m - 69) / 12)

def pluck(f, dur=.35, bright=2500):
    n = int(dur * SR); t = np.arange(n) / SR
    saw = 2 * ((f * t) % 1) - 1
    return lp(saw, bright) * env(n, .002, .09)
def sub(f, dur=.4):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(f * (1 + .6 * np.exp(-t / .03))) / SR
    return np.sin(ph) * env(n, .002, .18)
def hat(dur=.05): n = int(dur * SR); return hp(rng.standard_normal(n), 7000) * env(n, .001, .012)
def glitch(dur=.09):
    n = int(dur * SR); x = rng.standard_normal(n)
    x = np.sign(x) * (np.abs(x) > 1.2)  # crushed
    return bp(x, 1500, 9000) * env(n, .0005, .03)
def click(): n = int(.018 * SR); return bp(rng.standard_normal(n), 2000, 7000) * env(n, .0003, .004)
def hit(dur=.7):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(50 * (1 + 2 * np.exp(-t / .04))) / SR
    return np.sin(ph) * env(n, .001, .25) + .3 * lp(rng.standard_normal(n), 1800) * env(n, .001, .04)
def whoosh(dur=.4):
    n = int(dur * SR); noise = rng.standard_normal(n); out = np.zeros(n); k = 512
    for s in range(0, n, k):
        fr = s / n; out[s:s + k] = bp(noise[s:s + k], 400 + 3000 * fr, 900 + 6000 * fr, 1)
    return out * np.sin(np.pi * np.arange(n) / n) ** 2
def beep(f, dur=.12):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * env(n, .002, .05)
def chime(f, dur=2.0):
    n = int(dur * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * m * t) * env(n, .003, d) * g for m, d, g in [(1, .9, 1), (2.01, .5, .3), (3, .3, .15)])

# ---------------- music
music = np.zeros(N)
BPM = 112; s16 = 60 / BPM / 4
minor = [62, 65, 69, 72, 69, 65, 64, 65]          # D dorian-ish, tense
major = [62, 66, 69, 74, 69, 66, 71, 69]          # D major, relieved (the fix)
bassm = [38, 38, 41, 36]; bassM = [38, 38, 43, 45]
drop0, drop1 = CUT['picture'] - 0.15, CUT['picture'] + 0.55
t0 = 0.0; k = 0
while t0 < TOTAL - .3:
    bar = int(t0 / (s16 * 16))
    fixed = t0 >= drop1
    if not (drop0 <= t0 < drop1):
        pat = major if fixed else minor
        add(music, pluck(hz(pat[k % 8] + (12 if k % 16 >= 12 else 0)), bright=3500 if fixed else 2200), t0, .16)
        if k % 4 == 0: add(music, sub(hz((bassM if fixed else bassm)[bar % 4])), t0, .55)
        if k % 4 == 2: add(music, hat(), t0, .10)
        if k % 8 == 4: add(music, hat(.12), t0, .07)
    t0 += s16; k += 1
music *= np.clip(np.arange(N) / SR / .25, 0, 1)

# ---------------- foley
fx = np.zeros(N)
B = {b['id']: b for b in tl['beats']}
def W(b, word, n=1):
    import re; c = 0
    for w in B[b]['words']:
        if re.sub(r"[“”\".,:?!]", "", w['w'].lower()) == word:
            c += 1
            if c == n: return w['s']
    raise KeyError(word)
def coin(f=2600):
    n = int(.25 * SR); t = np.arange(n) / SR
    return (np.sin(2*np.pi*f*t) + .5*np.sin(2*np.pi*f*2.7*t)) * env(n, .001, .07)
add(fx, hit(), .02, .7)
for c in tl['cuts'][1:-1]:
    add(fx, glitch(), c['t'], .3)
    for i in range(4): add(fx, click(), c['t'] + .12 + i * .045 + rng.uniform(0, .02), .22)
add(fx, chime(2637, .8), CUT['spotless'] + .25, .14)                       # sparkle
add(fx, hit(.6), W(1, 'damage'), .45)
for i in range(8): add(fx, click(), W(1, '₹20000') + i * .06, .25)          # counter dropping
add(fx, beep(330, .25), W(2, 'proof'), .35); add(fx, beep(330, .25), W(2, 'receipt'), .35)
add(fx, whoosh(.6), CUT['picture'] - .1, .35)
add(fx, chime(1318.5, 1.4), CUT['picture'] + .55, .25)
for w in ['wall', 'tap', 'tile']: add(fx, beep(1568, .1), W(4, w), .22)
for i in range(7): add(fx, click(), CUT['report'] + .9 + i * .35, .25)       # report lines typing
add(fx, hit(.5), W(5, 'locked'), .5); add(fx, beep(262, .25), W(5, 'edit'), .3)
for i in range(5): add(fx, coin(2400 + 120 * i), W(6, 'deposit') + .2 + i * .09, .18)
add(fx, beep(330, .2), W(6, "landlord's"), .25); add(fx, beep(330, .2), W(6, 'yours'), .25)
add(fx, hit(.5), W(6, 'code'), .4)
for i in range(6): add(fx, beep(1400 + 80 * i, .05), CUT['moveout'] + 1.4 + i * .15, .12)
add(fx, beep(990, .15), W(7, '₹1200'), .3)
for i in range(10): add(fx, coin(2200 + 90 * i), W(8, '₹48800') + i * .12, .16)
add(fx, coin(1800), W(8, '₹1200'), .25)
add(fx, chime(1568, 1.6), W(8, 'seconds'), .22)
add(fx, hit(.8), W(9, 'proof'), .7)
add(fx, whoosh(.45), CUT['tag'] + .2, .22)
add(fx, chime(1318.5, 2.2), tl['endCard'] + .05, .3); add(fx, chime(1975.5, 2.0), tl['endCard'] + .12, .12)

# ---------------- voice, ducking, room
w = wave.open(R + 'vo_track.wav'); vo = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / 24000, vo)
venv = lp(np.abs(vo), 6, 1); venv /= venv.max() + 1e-9
duck = lp(1 - .55 * np.clip(venv * 4, 0, 1), 4, 1)
irn = int(.5 * SR); ir = rng.standard_normal(irn) * np.exp(-np.arange(irn) / SR / .15); ir = lp(ir, 5000); ir /= np.abs(ir).sum() / 6
bed = music * duck + fx
bed = bed + .15 * fftconvolve(bed, ir)[:N]
mix = vo + bed * .55
mix = np.stack([mix, mix], 1); mix /= np.abs(mix).max() / .8
o = wave.open(R + 'mix_raw.wav', 'w'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
o.writeframes((mix * 32767).astype(np.int16).tobytes()); o.close()
print('ok', TOTAL)
