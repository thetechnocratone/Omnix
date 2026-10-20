# Original score: pulsing pluck arp + sub + hats, glitch ticks on every cut, terminal key clicks,
# music drops out on "the real risk is this one habit" and returns brighter on the fix. Voice ducks the bed.
import json, wave, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

R = '/home/claude/preipo/build/'
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
drop0, drop1 = CUT('black'), CUT('black') + 0.5
calm = 999
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
def chaching():
    n = int(.7*SR); t = np.arange(n)/SR
    bell = sum(np.sin(2*np.pi*f*t)*g for f,g in [(2093,1),(2637,.7),(3136,.5),(4186,.3)])*env(n,.002,.25)
    return bell + .5*bp(rng.standard_normal(n),3000,9000)*env(n,.001,.04)
def scratch():
    n = int(.55*SR); t = np.arange(n)/SR
    f = 900*np.exp(-t*5) + 120
    return lp(np.sign(np.sin(2*np.pi*np.cumsum(f)/SR)) * (.6 + .4*rng.standard_normal(n)), 3500) * np.minimum(t/.01,1)*np.exp(-t/.25)
def drone(dur=2.6, f=110):
    n = int(dur*SR); t = np.arange(n)/SR
    x = sum(np.sin(2*np.pi*f*m*t*(1-.06*t/dur))*g for m,g in [(1,1),(2,.4),(3.01,.2)])
    return lp(x, 1500)*np.minimum(t/.2,1)*np.minimum((dur-t)/.3,1)
def echo(x, d=.28, fb=.55, n=5):
    out = np.zeros(len(x) + int(d*SR*n)); 
    for k in range(n): out[int(k*d*SR):int(k*d*SR)+len(x)] += x*(fb**k)
    return out
add(fx, slowclick(), .02, .7); add(fx, hit(.5), .05, .35)                 # BUY tap
add(fx, whoosh(.5), .1, .25); add(fx, chaching(), W(1,'buy'), .55)
for i in range(6): add(fx, click(), .05 + i*.05, .2)
add(fx, scratch(), W(1,'dollars') + .08, .7); add(fx, hit(.8), W(1,'dollars') + .12, .7)
for c in tl['cuts'][1:-1]:
    add(fx, glitch(), c['t'], .25)
    for i in range(4): add(fx, click(), c['t'] + .12 + i * .045 + rng.uniform(0, .02), .2)
add(fx, slowclick(), W(1,'listed'), .4)
for i in range(8): add(fx, chaching() * .35, CUT('cascade') + .3 + i * .55, .25)
for i in range(16): add(fx, click(), CUT('inspect') + .1 + i*.05, .3)
add(fx, hit(.6), W(3,'but'), .5)
for w in ['votes', 'rights', 'legal']: add(fx, beep(1568, .1), W(4, w), .25)
add(fx, glitch(.15), W(5,'shadow'), .35)
add(fx, hit(.7), W(5,'issue'), .6)
for w, n in [('ownership',1), ('votes',1), ('dividends',1), ('legal',1)]: add(fx, hit(.7), W(6, w, n), .8)
add(fx, slowclick(), W(7,'cash'), .5)
for i in range(3): add(fx, beep(1200 + 100*i, .06), W(7,'cash') + .4 + i*.35, .15)
add(fx, drone(2.8), CUT('frozen') + .1, .35)
for i in range(20): add(fx, click(), CUT('consent') + .1 + i*.045, .25)
add(fx, slowclick(), W(8,'written'), .5)
add(fx, echo(whoosh(.8)), CUT('detach') + .3, .35); add(fx, echo(beep(330,.4), .3, .5, 6), W(9,'shadow'), .3)
add(fx, whoosh(.45), CUT('cta') + .2, .22); add(fx, pop2(1500), W(10,'send'), .4)
add(fx, glitch(.2), CUT('loop'), .35); add(fx, whoosh(.5), CUT('loop') + .1, .2)

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
