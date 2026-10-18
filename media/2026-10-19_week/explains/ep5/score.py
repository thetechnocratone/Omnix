import sys; sys.path.insert(0, '/home/claude/omnix/tools/reel_lab/engine')
from audio import *

D = 62.4
mu, fx = buf(D), buf(D)
SA = hz('D3')
maj = [0, 2, 4, 5, 7, 9, 11]
def N(d, o=0): return SA * 2 ** ((maj[d % 7] + 12 * (d // 7) + 12 * o) / 12)
def chord(t0, degs, dur, vel=0.5, o=0):
    for k, d in enumerate(degs): place(mu, st(piano(N(d, o), dur, vel), -0.3 + 0.2 * k), t0 + k * 0.03, 0.6)
def strings(t0, degs, dur, cut=1800, g=0.45): place(mu, st(pad([N(d, -1) for d in degs], dur, a=dur * 0.4, r=dur * 0.35, cutoff=cut, det=0.08)), t0, g)
def glide(f0, f1, dur):
    t = tt(dur); f = f0 * (f1 / f0) ** (t / dur); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) * 0.4

place(mu, st(drone(SA / 2, D)), 0, 0.35)
# curious opening: piano figure + hop whooshes in time with the bouncing car
for k, (d, dt) in enumerate([(4, 0), (5, .4), (7, .8), (9, 1.6), (7, 2.0), (11, 2.4), (9, 3.2)]): place(mu, st(piano(N(d, 1), 2.2, 0.55)), 0.05 + dt, 0.8)
for k in range(3): place(fx, st(sfx_whoosh(0.6, 300, 1800)), 0.25 + k * 1.82, 0.35); place(fx, st(sfx_thunk(120)), 1.05 + k * 1.82, 0.35)
for st_ in (2.9, 3.4, 3.9): place(fx, st(sfx_pop(620)), st_, 0.35)
strings(5.4, [0, 4, 7], 4.2, 1500, 0.4)
for i, st_ in enumerate((5.94, 6.19, 6.44)): place(fx, st(sfx_paper(0.2), -0.4 + 0.4 * i), st_, 0.35)
for i, n in enumerate((0, 2, 4)): place(mu, st(bell(N(n, 1), 2.2)), 8.1 + i * 0.25, 0.3)
# 1 · weight: steady pulse = "every second", then the fall
chord(9.22, [0, 4, 7], 3.0, 0.5, 0)
for k in range(9): place(mu, st(sub(SA / 2, 0.3)), 9.4 + k * 0.92, 0.55); place(mu, st(tabla_na(N(0, 1), 0.3)), 15.67 + k * 0.33, 0.18 if k < 6 else 0)
place(fx, st(glide(1400, 300, 1.1)), 17.9, 0.6); place(fx, st(sfx_impact(1.0, 55)), 18.9, 0.7)
# 2 · energy: fuel cubes tick in, battery drains in falling blips
chord(19.52, [3, 5, 7], 3.0, 0.5, 0)
t = 22.0
while t < 23.5: place(fx, st(sfx_tick(2600), 0.2), t, 0.22); t += 0.03
place(fx, st(sfx_ding(1175)), 22.3, 0.4)
for k in range(8): place(fx, st(sfx_pop(900 - k * 80), 0.3), 26.4 + k * 0.33, 0.35)
place(fx, st(glide(500, 120, 0.6)), 28.9, 0.5)
strings(19.4, [3, 5, 7], 10.0, 1400, 0.35)
# 3 · opposites: seesaw thunk, then the mash-up
chord(29.54, [5, 7, 9], 3.0, 0.5, 0)
place(fx, st(sfx_thunk(90)), 30.35, 0.55); place(fx, st(sfx_whoosh(0.4, 1500, 3500)), 30.9, 0.3); place(fx, st(sfx_thunk(140)), 35.9, 0.5)
place(fx, st(sfx_whoosh(0.8, 300, 1200)), 38.6, 0.4); place(fx, st(sfx_thunk(70)), 39.5, 0.5)
for st_ in (41.05, 42.2): place(fx, st(sfx_pop(520)), st_, 0.4)
strings(29.4, [5, 7, 9], 13.8, 1500, 0.35)
# hop vs flight, prototypes, the hard part
place(fx, st(sfx_whoosh(0.9, 400, 1600)), 43.4, 0.35)
chord(46.49, [0, 2, 4], 3.0, 0.45, 0)
place(mu, st(pad([N(0), N(4), N(7)], 7.0, a=1.0, r=1.5, cutoff=2200)), 46.4, 0.4)
place(fx, st(sfx_riser(1.2, 300, 1500)), 50.4, 0.25); place(fx, st(sfx_thunk(110)), 51.6, 0.4)
# heavy, hungry, hard: three stamps on the three cards
for st_ in (56.03, 56.73, 57.53): place(fx, st(sfx_thunk(130)), st_, 0.6)
chord(53.46, [0, 4, 7], 3.0, 0.55, -1)
# engineers can't stop trying: lift
strings(58.0, [0, 4, 7, 11], 4.4, 2400, 0.55)
for k, (d, dt) in enumerate([(7, 0), (9, .4), (11, .8), (14, 1.4)]): place(mu, st(piano(N(d, 1), 2.6, 0.55)), 58.26 + dt, 0.8)
place(mu, st(bell(N(14, 0), 3.0)), 60.9, 0.35)
mu[int((D - 1.5) * SR):int(D * SR)] *= np.linspace(1, 0, int(1.5 * SR))[:, None]
mu = reverb(mu, 0.28, 2.4, 6000); fx = reverb(fx, 0.2, 1.4, 8000)
write('music.wav', mu[:int(D * SR)]); write('sfx.wav', fx[:int(D * SR)], 0.7)
print('ok')
