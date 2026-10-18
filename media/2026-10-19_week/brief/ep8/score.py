import sys; sys.path.insert(0, '/home/claude/omnix/tools/reel_lab/engine')
from audio import *

D = 47.1
mu, fx = buf(D), buf(D)
SA = hz('E3')
minor = [0, 2, 3, 5, 7, 8, 10]          # E natural minor, a "sneaky" plucked feel
def N(d, o=0): return SA * 2 ** ((minor[d % 7] + 12 * (d // 7) + 12 * o) / 12)
BEAT = 60 / 104

def sneak(t0, t1, level=1.0, kick_on=True):
    b = 0; t = t0; bass = [0, 0, 5, 4]
    while t < t1 - 0.02:
        bar, bt = divmod(b, 4)
        if kick_on and bt in (0, 2): place(mu, st(kick(1.0, 0.4, 0.6)), t, 0.55 * level)
        if bt in (1, 3): place(mu, st(tabla_na(N(0, 1))), t, 0.32 * level)
        for e in range(2): place(mu, st(shaker(), 0.4), t + e * BEAT / 2, 0.14 * level)
        if bt == 0: place(mu, st(sub(N(bass[bar % 4], -1), BEAT * 3.4)), t, 0.6 * level)
        # tiptoe pizzicato: staccato plucks on the off-beats
        pat = [0, None, 2, 4, None, 3, 2, None]
        for e in range(2):
            n = pat[(bt * 2 + e) % 8]
            if n is not None: place(mu, st(pluck(N(n + bass[bar % 4], 1), 0.35, 0.3), -0.3 if e else 0.3), t + e * BEAT / 2, 0.36 * level)
        b += 1; t = t0 + b * BEAT

# 0 → 5.3: curious, quiet
place(mu, st(pad([N(0, -1), N(4, -1), N(2)], 5.6, a=0.6, r=0.6, cutoff=900)), 0, 0.6)
for k, (n, tt_) in enumerate([(4, 0.1), (2, 0.6), (0, 1.1), (7, 2.3), (6, 2.8)]): place(mu, st(marimba(N(n, 1), 1.2)), tt_, 0.45)
place(fx, st(sfx_thunk(120)), 3.75, 0.7); place(fx, st(sfx_tick(1800)), 3.9, 0.4)   # the door's lock clicks
sneak(5.39, 29.9)
for i in range(6): place(fx, st(sfx_pop(500 + i * 40), -0.5 + i * 0.2), 5.6 + i * 0.12, 0.3)
place(fx, st(sfx_glitch(0.3)), 9.9, 0.45); place(fx, st(sfx_glitch(0.25)), 10.3, 0.4)
t = 11.5
while t < 13.3: place(fx, st(sfx_paper(0.1), 0.2), t, 0.35); t += 0.095
place(fx, st(sfx_ding(1320)), 13.35, 0.35)
place(fx, st(sfx_impact(0.9, 80) * 0.6), 16.9, 0.5)   # ACCESS DENIED
place(fx, st(sfx_scratch(0.3)), 17.2, 0.4)
place(fx, st(sfx_whoosh(0.5, 400, 2200)), 18.4, 0.45)
t = 21.0
while t < 22.0: place(fx, st(sfx_paper(0.08), 0.3), t, 0.3); t += 0.045
place(fx, st(sfx_thunk(160)), 21.05, 0.5)
place(fx, st(sfx_riser(0.6, 400, 1600)), 25.0, 0.25)
place(fx, st(sfx_coin()), 27.6, 0.7); place(fx, st(sfx_ding(1568)), 28.3, 0.4)
# not evil / too eager: music drops out, a cartoon wobble
place(mu, st(pad([N(0), N(2), N(4)], 3.0, a=0.2, r=0.6, cutoff=1200)), 29.9, 0.5)
place(fx, st(sfx_scratch(0.35)), 30.4, 0.5)
for k in range(6): place(fx, st(sfx_pop(700 + (k % 2) * 160)), 31.31 + k * 0.1, 0.3)
sneak(32.9, 36.5)
place(fx, st(sfx_impact(1.0, 70)), 34.1, 0.7); place(fx, st(sfx_coin(0.5, 1800)), 34.15, 0.4)   # the lock snaps
place(fx, st(sfx_pop(640)), 35.3, 0.4)
# good news: warm major turn
for k, n in enumerate([0, 2, 4]): place(mu, st(marimba(N(n, 1) * 2 ** (4 / 12 if n == 2 else 0), 1.6)), 36.58 + k * 0.12, 0.4)
place(mu, st(pad([SA, SA * 2 ** (4 / 12), SA * 1.5], 3.8, a=0.3, r=0.8, cutoff=1600)), 36.5, 0.6)
place(fx, st(sfx_thunk(140)), 37.5, 0.55); place(fx, st(sfx_thunk(140)), 38.9, 0.55)
# lesson: keys jingle away, one stays
place(mu, st(pad([SA, SA * 2 ** (4 / 12), SA * 1.5, SA * 2], 6.9, a=0.8, r=1.5, cutoff=2000)), 40.2, 0.6)
for k in range(10): place(fx, st(sfx_coin(0.4, 3200 + 300 * (k % 3)), -0.6 + k * 0.12), 42.6 + k * 0.17, 0.18)
place(mu, st(bell(SA * 4, 3.0)), 45.2, 0.4)
mu[int((D - 1.5) * SR):int(D * SR)] *= np.linspace(1, 0, int(1.5 * SR))[:, None]
mu = reverb(mu, 0.18, 1.5, 7000); fx = reverb(fx, 0.18, 1.1, 8000)
write('music.wav', mu[:int(D * SR)]); write('sfx.wav', fx[:int(D * SR)], 0.8)
print('ok')
