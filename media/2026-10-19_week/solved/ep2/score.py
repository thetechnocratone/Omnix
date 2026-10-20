# Original score: pulsing pluck arp + sub + hats, glitch ticks on every cut, terminal key clicks,
# music drops out on "the real risk is this one habit" and returns brighter on the fix. Voice ducks the bed.
import json, wave, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

R = '/home/claude/fakemed/build/'
SR = 48000
tl = json.load(open(R + 'timeline.json'))
TOTAL = tl['total']; N = int(TOTAL * SR)
CUTD = {c['id']: c['t'] for c in tl['cuts']}
def CUT(k): return CUTD[k]
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

B0 = {b['id']: b for b in tl['beats']}
def W0(b, word, n=1):
    import re; c = 0
    for w in B0[b]['words']:
        if re.sub(r"[“”\".,:?!]", "", w['w'].lower()) == word:
            c += 1
            if c == n: return w['s']
    raise KeyError(word)
# ---------------- music
music = np.zeros(N)
BPM = 112; s16 = 60 / BPM / 4
minor = [62, 65, 69, 72, 69, 65, 64, 65]          # D dorian-ish, tense
major = [62, 66, 69, 74, 69, 66, 71, 69]          # D major, relieved (the fix)
bassm = [38, 38, 41, 36]; bassM = [38, 38, 43, 45]
drop0, drop1 = 0.0, CUT('boot') + 0.6
calm = CUT('boot')
t0 = 0.0; k = 0
while t0 < TOTAL - .3:
    bar = int(t0 / (s16 * 16))
    fixed = t0 >= calm
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
def pop2(f=1500):
    n = int(.09 * SR); t = np.arange(n) / SR
    ph = 2*np.pi*np.cumsum(f*(1+.9*np.exp(-t/.012)))/SR
    return np.sin(ph)*env(n,.001,.035)
def doorbell():
    n = int(1.6*SR); t = np.arange(n)/SR
    d1 = sum(np.sin(2*np.pi*f*m*t)*g for f in [659.3] for m,g in [(1,1),(2.76,.25),(5.4,.08)])*env(n,.002,.5)
    n2 = int(1.6*SR); d2 = sum(np.sin(2*np.pi*f*m*t)*g for f in [523.3] for m,g in [(1,1),(2.76,.25),(5.4,.08)])*env(n2,.002,.6)
    out = np.zeros(int(2.4*SR)); out[:n] += d1; out[int(.55*SR):int(.55*SR)+n2] += d2
    return out
def bigglitch():
    n = int(.6*SR); x = rng.standard_normal(n); st_ = np.repeat(rng.standard_normal(n//400+1), 400)[:n]
    y = np.sign(x)*(np.abs(x)>.6)*np.sign(st_); y = bp(y, 300, 8000)*env(n,.001,.25)
    return y + .6*sub(45,.6)
def slowclick():
    n = int(.5*SR); t = np.arange(n)/SR
    x = bp(rng.standard_normal(n), 400, 2500)*env(n,.002,.06)
    return x + .8*np.sin(2*np.pi*90*t)*env(n,.002,.18)
def alarm(dur=1.4):
    n = int(dur*SR); t = np.arange(n)/SR
    f = 880 + 220*np.sign(np.sin(2*np.pi*3*t))
    return lp(np.sign(np.sin(2*np.pi*np.cumsum(f)/SR)), 3000)*np.minimum(t/.01,1)*np.exp(-t/.8)
def heartbeat():
    n = int(.5*SR); t = np.arange(n)/SR
    one = np.sin(2*np.pi*55*t)*env(n,.004,.08)
    out = np.zeros(int(.9*SR)); out[:n] += one; out[int(.22*SR):int(.22*SR)+n] += .7*one
    return lp(out, 200)
def hum(dur, f=58):
    n = int(dur*SR); t = np.arange(n)/SR
    x = np.sin(2*np.pi*f*t) + .5*np.sin(2*np.pi*f*1.5*t*(1+.002*np.sin(2*np.pi*.3*t))) + .3*bp(rng.standard_normal(n), 80, 400)
    return lp(x, 600)*np.minimum(t/1.0,1)*np.minimum((dur-t)/.4,1)*(.7+.3*np.sin(2*np.pi*.25*t))
def boot():
    out = np.zeros(int(1.6*SR))
    for i,f in enumerate([523.3, 659.3, 784, 1046.5]):
        x = chime(f, 1.2); out[int(i*.11*SR):int(i*.11*SR)+len(x)] += x*.6
    return out
def buzz(dur=.5):
    n = int(dur*SR); t = np.arange(n)/SR
    return lp(np.sign(np.sin(2*np.pi*140*t)) + .5*np.sign(np.sin(2*np.pi*147*t)), 2500)*env(n,.003,.3)
def success():
    out = np.zeros(int(1.4*SR)); a = chime(1046.5,1.0); b = chime(1568,1.2)
    out[:len(a)] += a; out[int(.13*SR):int(.13*SR)+len(b)] += b
    return out
B0b = CUT('boot')
add(fx, hum(B0b + .3), 0, .5)
k = 0; tt = .4
while tt < B0b - .5:
    add(fx, heartbeat(), tt, .55); tt += 1.05; k += 1
add(fx, hit(.6), .02, .45); add(fx, glitch(.12), .3, .3)
for i in range(6): add(fx, click(), .05 + i*.05, .2)
add(fx, glitch(.2), W(1,'tablet') + .5, .5); add(fx, hit(.9), W(1,'tablet') + .5, .7)       # FAKE? stamp in hook
add(fx, hit(.7), W(1,'fake'), .6); add(fx, glitch(.15), W(1,'fake'), .4)
for c in tl['cuts'][1:-1]:
    add(fx, glitch(.06), c['t'], .18)
    for i in range(3): add(fx, click(), c['t'] + .12 + i * .045, .16)
for i in range(22): add(fx, click(), CUT('counter') + .3 + i*.06, .25)
for i in range(14): add(fx, beep(330 if i % 3 == 0 else 660, .05), CUT('grid') + .2 + i*.12, .1)
for w in ['paracetamol','diabetes','antibiotics']: add(fx, beep(262,.15), W(2,w), .25)
add(fx, hit(.7), W(3,'fake'), .6)
add(fx, hit(.5), W(3,'delhi'), .5)
for i in range(8): add(fx, beep(1400, .04), CUT('same') + .4 + i*.18, .1)
add(fx, beep(330,.3), W(4,"can't"), .3)
add(fx, boot(), CUT('boot') + .25, .5)
for i in range(24): add(fx, click(), CUT('boot') + .1 + i*.04, .2)
for i in range(4): add(fx, slowclick(), CUT('stampid') + .2 + i*.38, .3)
for i,w in enumerate(['distributor','chemist','home']): add(fx, beep(1046.5*(1.12**i), .1), W(6,w), .25)
add(fx, whoosh(.8), CUT('journey') + .1, .25)
for i in range(3): add(fx, beep(1760, .06), W(7,'scans') + i*.12, .25)
add(fx, beep(2093, .1), W(7,'second') - .3, .3)
add(fx, success(), W(8,'verified'), .45)
add(fx, buzz(), W(8,'fake'), .5); add(fx, buzz(.35), W(8,'holds'), .35)
add(fx, pop2(1400), W(8,'alerts'), .45); add(fx, hit(.6), W(8,'flagged'), .45); add(fx, whoosh(.5), W(8,'flagged') + .1, .25)
for i,w in enumerate([('guessing',1),('pills',1),('proof',1)]): add(fx, hit(.5), W(9,w[0]) - .1, .45)
add(fx, chime(784, 2.2), W(9,'proof'), .3); add(fx, chime(1174.7, 2.0), W(9,'proof') + .08, .2)
add(fx, whoosh(.45), CUT('cta') + .2, .22); add(fx, pop2(1500), W(10,'send'), .4)
add(fx, glitch(.2), CUT('loop'), .3)

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
