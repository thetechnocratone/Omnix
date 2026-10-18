import sys; sys.path.insert(0, '/home/claude/omnix/tools/reel_lab/engine')
from audio import *
D = 49.3
mu, fx = buf(D), buf(D)
SA = hz('A2'); maj = [0, 2, 4, 5, 7, 9, 11]; mnr = [0, 2, 3, 5, 7, 8, 10]
def N(d, o=0, sc=mnr): return SA * 2 ** ((sc[d % 7] + 12 * (d // 7) + 12 * o) / 12)
BEAT = 60 / 92
# hazy, slow lo-fi in A minor; lifts to A major at the end
def bar_beat(t0, t1, prog, sc, lvl=1.0):
    t = t0; b = 0
    while t < t1 - 0.02:
        bar, bt = divmod(b, 4); r = prog[bar % len(prog)]
        if bt in (0, 2): place(mu, st(kick(0.9, 0.35, 0.5)), t, 0.4 * lvl)
        if bt in (1, 3): place(mu, st(clap()), t, 0.16 * lvl)
        for e in range(2): place(mu, st(hat(), 0.3), t + e * BEAT / 2, 0.08 * lvl)
        if bt == 0:
            place(mu, st(sub(N(r, -1, sc), BEAT * 3.6)), t, 0.5 * lvl)
            place(mu, st(pad([N(r, 0, sc), N(r + 2, 0, sc), N(r + 4, 0, sc)], BEAT * 4.2, a=0.4, r=0.6, cutoff=1100)), t, 0.38 * lvl)
        if bt in (0, 2): place(mu, st(marimba(N(r + (4 if bt else 2), 1, sc), 1.0), 0.25), t + BEAT * 0.5, 0.22 * lvl)
        b += 1; t = t0 + b * BEAT
place(mu, st(drone(SA, 3.8)), 0, 0.3)
for k, n in enumerate([4, 2, 0]): place(mu, st(piano(N(n, 1), 1.8, 0.5)), 0.3 + k * 0.5, 0.6)
place(fx, st(sfx_whoosh(0.7, 300, 1200)), 2.4, 0.35)
bar_beat(3.6, 42.6, [0, 5, 3, 4], mnr)
t = 3.9
while t < 5.6: place(fx, st(sfx_paper(0.08), 0.2), t, 0.12); t += 0.11   # crackle of the fire
for st_, n in ((3.65, 6), (7.25, 6), (14.15, 6), (19.25, 6), (24.75, 6)):  # diary typing
    for i in range(14): place(fx, st(sfx_type(), -0.2 + 0.03 * i), st_ + 0.2 + i * 0.06, 0.18)
place(fx, st(sfx_riser(1.4, 300, 900)), 15.2, 0.2); place(fx, st(sfx_thunk(110)), 16.7, 0.35)   # AQI needle
place(fx, st(sfx_whoosh(1.0, 2500, 600)), 20.4, 0.3); place(fx, st(sfx_pop(1400)), 21.5, 0.25)   # shrink to 2.5 µm
for i in range(5): place(fx, st(sfx_pop(500 + i * 60), -0.4 + 0.2 * i), 26.0 + i * 0.4, 0.22)   # particles into lungs
for k, st_ in enumerate((30.8, 33.0, 35.5, 38.0)): place(fx, st(sfx_tick(2200)), st_, 0.35); place(mu, st(bell(N(k * 2, 1), 1.4)), st_, 0.2)
place(fx, st(sfx_paper(0.25)), 40.4, 0.35)
# nobody beats me alone: beat drops, then warm major lift as hands rise
place(fx, st(sfx_scratch(0.3)), 42.7, 0.25)
place(mu, st(pad([N(0, 0, maj), N(2, 0, maj), N(4, 0, maj), N(7, 0, maj)], 6.6, a=0.5, r=1.6, cutoff=2200)), 42.8, 0.6)
for k, (d, dt) in enumerate([(4, 0), (5, .35), (7, .7), (9, 1.2), (11, 1.7), (14, 2.3)]): place(mu, st(piano(N(d, 1, maj), 2.2, 0.55)), 43.4 + dt, 0.7)
for i in range(9): place(fx, st(sfx_pop(420 + i * 30), -0.6 + i * 0.15), 44.6 + i * 0.12, 0.2)
place(mu, st(bell(N(7, 1, maj), 2.5)), 47.3, 0.35)
mu[int((D - 1.4) * SR):int(D * SR)] *= np.linspace(1, 0.35, int(1.4 * SR))[:, None]   # tail back into the loop
mu = reverb(mu, 0.25, 2.0, 6000); fx = reverb(fx, 0.15, 1.0, 8000)
write('music.wav', mu[:int(D * SR)]); write('sfx.wav', fx[:int(D * SR)], 0.7)
print('ok')
