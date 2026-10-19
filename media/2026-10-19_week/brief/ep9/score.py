# Original score for the reel: warm marimba + tabla-ish pulse + pad, foley hits on beats,
# music ducked under the voice, one shared room (short reverb), mastered later with ffmpeg loudnorm.
import json, wave, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

R = '/home/claude/reel/build/'
SR = 48000
tl = json.load(open(R + 'timeline.json'))
TOTAL = tl['total']
N = int(TOTAL * SR)
rng = np.random.default_rng(7)

def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    e = np.minimum(t / a, 1.0) * np.exp(-t / d)
    return e

def lp(x, f, o=2):
    return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)

def hp(x, f, o=2):
    return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)

def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)

def add(buf, x, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf): return
    x = x[: len(buf) - i]
    buf[i:i + len(x)] += x * g

def note(f):  # midi -> hz
    return 440 * 2 ** ((f - 69) / 12)

def marimba(f, dur=0.9):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) * env(n, .002, .35) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * env(n, .001, .06)
    return x

def tabla(f=110, dur=0.5, bend=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(f * (1 + bend * np.exp(-t / .03))) / SR
    return np.sin(ph) * env(n, .001, .16) + 0.2 * bp(rng.standard_normal(n), 800, 3000) * env(n, .001, .01)

def shaker(dur=0.08):
    n = int(dur * SR)
    return hp(rng.standard_normal(n), 5000) * env(n, .004, .025)

def whoosh(dur=0.45, up=True):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n); k = 512
    for s in range(0, n, k):
        fr = s / n if up else 1 - s / n
        out[s:s + k] = bp(noise[s:s + k], 300 + 3000 * fr, 600 + 6000 * fr, 1)
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return out * shape

def hit(dur=0.6):  # soft impact: sub thump + body
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(55 * (1 + 1.5 * np.exp(-t / .04))) / SR
    return np.sin(ph) * env(n, .001, .22) + 0.25 * lp(rng.standard_normal(n), 1500) * env(n, .001, .03)

def pop(f=900, dur=0.12):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.8 * np.exp(-t / .015))) / SR
    return np.sin(ph) * env(n, .001, .045)

def tick(dur=0.05):
    n = int(dur * SR)
    return bp(rng.standard_normal(n), 2500, 6000) * env(n, .0005, .008)

def chime(f=1318.5, dur=2.2):
    n = int(dur * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * m * t) * env(n, .003, d) * g for m, d, g in [(1, .9, 1), (2.01, .5, .3), (3.0, .3, .15)])

# ---------------- music ----------------
music = np.zeros(N)
BPM = 96; beat = 60 / BPM
# D major pentatonic patterns (midi)
patA = [74, 76, 78, 81, 78, 76, 74, 69]
patB = [74, 78, 81, 83, 81, 78, 76, 78]
bass = [50, 50, 47, 45]
REST = (tl['beats'][4]['words'][-3]['s'] - 0.1, tl['beats'][4]['end'] + 0.25)  # silence on "The brain is."
t0 = 0.0; k = 0
while t0 < TOTAL - 0.5:
    bar = int(t0 / (beat * 4))
    if not (REST[0] <= t0 < REST[1]):
        pat = patA if (bar // 2) % 2 == 0 else patB
        if k % 2 == 0 or bar % 4 == 3:
            add(music, marimba(note(pat[k % 8])), t0, 0.22)
        if k % 8 == 0:
            add(music, tabla(98), t0, 0.5)
        if k % 8 == 3 or k % 8 == 6:
            add(music, tabla(147, .3, .1), t0, 0.28)
        if k % 2 == 1:
            add(music, shaker(), t0, 0.07)
        if k % 8 == 0:
            n = int(beat * 4 * SR); tt = np.arange(n) / SR
            f = note(bass[bar % 4])
            pad = sum(np.sign(np.sin(2 * np.pi * f * d * tt)) for d in (1, 1.004, 0.996)) / 3
            pad = lp(pad, 700) * np.minimum(tt / .3, 1) * np.minimum((beat * 4 - tt) / .3, 1)
            add(music, pad, t0, 0.10)
    t0 += beat / 2; k += 1
# fade in quickly, swell into end card
music *= np.clip(np.arange(N) / SR / 0.4, 0, 1)

# ---------------- foley ----------------
fx = np.zeros(N)
B = {b['id']: b for b in tl['beats']}
def W(bid, word):
    for w in B[bid]['words']:
        if w['w'].lower().strip('“”".,:?!') == word: return w['s']
    raise KeyError(word)
add(fx, hit(), 0.02, 0.6)                       # frame-one hook lands
add(fx, whoosh(0.5), 1.0, 0.25)                 # glyph morphs into a body
for b in tl['beats'][1:]:
    add(fx, whoosh(0.4), b['start'] - 0.3, 0.22)  # carry between beats
for w in ['we', 'definitely', 'humanoid']:
    add(fx, pop(700), W(2, w), 0.35)
add(fx, hit(), W(2, 'humanoid'), 0.35)
t = W(3, '2027')
for i in range(10): add(fx, tick(), t + i * 0.07, 0.4)
add(fx, hit(), t + 0.75, 0.45)
add(fx, chime(1760, 1.2), W(3, 'really'), 0.18)
for w, f in [('doors', 660), ('stairs', 880), ('keyboards', 1100)]:
    add(fx, pop(f), W(4, w), 0.45)
add(fx, pop(500), W(5, 'body'), 0.4)
add(fx, hit(0.9), W(5, 'brain'), 0.7)
add(fx, chime(880, 2.0), W(5, 'brain') + 0.05, 0.2)
ts = W(6, 'one')
for i in range(int((B[6]['end'] - ts) / 0.5)): add(fx, tick(), ts + i * 0.5, 0.3)
for i in range(6): add(fx, pop(1200 + 60 * i, .08), W(6, 'humanoid') + i * 0.14, 0.18)
add(fx, pop(800), W(7, 'brain'), 0.35); add(fx, pop(1000), W(7, 'body'), 0.35)
add(fx, hit(), W(7, 'first'), 0.55)
add(fx, pop(900), W(8, 'yes'), 0.45); add(fx, pop(700), W(8, 'no'), 0.45)
add(fx, chime(1318.5, 2.2), tl['endCard'] + 0.05, 0.3)
add(fx, chime(1975.5, 2.0), tl['endCard'] + 0.12, 0.12)

# ---------------- voice + ducking ----------------
w = wave.open(R + 'vo_track.wav'); vo = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / 24000, vo)
venv = lp(np.abs(vo), 6, 1); venv = venv / (venv.max() + 1e-9)
duck = 1 - 0.55 * np.clip(venv * 4, 0, 1)
duck = lp(duck, 4, 1)

# room: short synthetic IR shared by music and fx
irn = int(0.6 * SR); ir = rng.standard_normal(irn) * np.exp(-np.arange(irn) / SR / 0.18); ir = lp(ir, 5000); ir /= np.abs(ir).sum() / 6
bed = music * duck + fx
bed = bed + 0.18 * fftconvolve(bed, ir)[:N]
mix = vo * 1.0 + bed * 0.55
mix = np.stack([mix, mix], 1)
mix /= np.abs(mix).max() / 0.8
o = wave.open(R + 'mix_raw.wav', 'w'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
o.writeframes((mix * 32767).astype(np.int16).tobytes()); o.close()
print('ok', TOTAL)
