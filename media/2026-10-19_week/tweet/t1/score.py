import sys; sys.path.insert(0, '/home/claude/omnix/tools/reel_lab/engine')
from audio import *
D = 18.0
mu, fx = buf(D), buf(D)
SA = hz('G3'); maj = [0, 2, 4, 5, 7, 9, 11]
def N(d, o=0): return SA * 2 ** ((maj[d % 7] + 12 * (d // 7) + 12 * o) / 12)
BEAT = 60 / 120
def groove(t0, t1, full=True):
    b = 0; t = t0; prog = [0, 4, 5, 3]
    while t < t1 - 0.02:
        bar, bt = divmod(b, 4); r = prog[bar % 4]
        if bt in (0, 2): place(mu, st(kick(1.05, 0.38, 0.8)), t, 0.8)
        if bt in (1, 3): place(mu, st(clap(), 0.05), t, 0.42)
        for e in range(2): place(mu, st(hat(), 0.4 if e else -0.3), t + e * BEAT / 2, 0.3 if e else 0.18)
        if bt == 0: place(mu, st(sub(N(r, -1), BEAT * 3.6)), t, 0.8); place(mu, st(pad([N(r), N(r + 2), N(r + 4)], BEAT * 4.1, a=0.05, r=0.3, cutoff=1800)), t, 0.3)
        if full:
            for e in range(2): place(mu, st(pluck(N([0, 2, 4, 7, 4, 2, 4, 5][(b * 2 + e) % 8] + r, 1), 0.5, 0.55), -0.25 if e else 0.25), t + e * BEAT / 2, 0.26)
        b += 1; t = t0 + b * BEAT
# loop-safe: the groove runs the whole film, with comedic stops
groove(0.0, 2.6)
place(fx, st(sfx_whoosh(0.7, 300, 2500)), 0.9, 0.5); place(fx, st(sfx_thunk(110)), 2.35, 0.5)
# record-scratch stop for "(okay... hop.)"
place(fx, st(sfx_scratch(0.35)), 2.65, 0.6); place(fx, st(sfx_pop(500)), 2.75, 0.5)
place(mu, st(pad([N(0), N(2), N(4)], 1.6, a=0.05, r=0.6, cutoff=900)), 2.75, 0.35)
groove(4.4, 12.7)
place(fx, st(sfx_impact(0.8, 70)), 4.4, 0.6)
place(fx, st(sfx_whoosh(0.5, 2500, 400)), 4.95, 0.45); place(fx, st(sfx_ding(1568)), 5.3, 0.4)
for i in range(6): place(fx, st(sfx_type(), 0.1), 5.9 + i * 0.22, 0.55)
for i in range(4): place(fx, st(sfx_tick(2200), -0.2), 7.9 + i * 0.33, 0.25)
for i, st_ in enumerate((9.2, 9.55, 10.8, 11.1, 11.4)): place(fx, st(sfx_pop(560 + 60 * i)), st_, 0.35)
place(fx, st(sfx_riser(0.6, 300, 2000)), 12.2, 0.4)
place(fx, st(sfx_impact(1.2, 60)), 12.8, 0.7)
place(mu, st(pad([N(0, -1), N(4, -1), N(2), N(4)], 3.6, a=0.05, r=1.0, cutoff=2400)), 12.8, 0.7)
place(mu, st(bell(N(4, 1), 2.5)), 12.8, 0.4); place(fx, st(sfx_pop(620)), 14.6, 0.5)
groove(16.0, D)
place(fx, st(sfx_whoosh(0.4, 400, 2500)), 16.2, 0.4)
mu = reverb(mu, 0.15, 1.3, 7500); fx = reverb(fx, 0.15, 1.0, 8000)
write('music.wav', mu[:int(D * SR)]); write('sfx.wav', fx[:int(D * SR)], 0.8)
print('ok')
