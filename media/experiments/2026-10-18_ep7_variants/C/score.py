import sys; sys.path.insert(0, '../engine')
from audio import *

D = 51.7
mu, fx = buf(D), buf(D)
SA = hz('D3')
kafi = [0, 2, 3, 5, 7, 9, 10]
def N(d, o=0): return SA * 2 ** ((kafi[d % 7] + 12 * (d // 7) + 12 * o) / 12)

# low drone through the whole film, dipping for the caveats
place(mu, st(drone(SA / 2, D)), 0, 0.55)
# piano motif: a slow descending figure, repeated with variations
motif = [(7, 0), (6, .75), (4, 1.5), (5, 2.25), (4, 3.0), (2, 3.75)]
def phrase(t0, shift=0, vel=0.7, o=1):
    for d, dt in motif: place(mu, st(piano(N(d + shift, o), 3.2, vel), 0.1 if d % 2 else -0.1), t0 + dt, 0.9)
def chord(t0, degs, dur, vel=0.5, o=0):
    for k, d in enumerate(degs): place(mu, st(piano(N(d, o), dur, vel), -0.3 + 0.2 * k), t0 + k * 0.03, 0.6)
# strings: slow pads that swell at the big numbers
def strings(t0, degs, dur, cut=1600, g=0.5):
    place(mu, st(pad([N(d, -1) for d in degs], dur, a=dur * 0.45, r=dur * 0.4, cutoff=cut, det=0.08), 0), t0, g)

phrase(0.1, 0, 0.6)
chord(3.7, [0, 4, 7], 4.0, 0.55, -1)
strings(3.4, [0, 4, 7], 7.5, 1400, 0.45)
place(fx, st(sfx_paper(0.25), -0.3), 0.05, 0.4)
place(fx, st(sfx_whoosh(0.9, 300, 1600)), 6.6, 0.25)
place(fx, st(sfx_paper(0.25), 0.3), 9.6, 0.4)
chord(9.99, [5, 9, 12], 4.0, 0.6, -1)   # B-flat colour lands on 18 minutes
place(mu, st(bell(N(7, 1), 3.0)), 9.99, 0.5)
phrase(11.5, 2, 0.55)
strings(11.5, [0, 3, 7], 10.5, 1900, 0.5)
place(mu, st(sub(N(0, -1), 1.6)), 14.42, 0.6); place(mu, st(bell(N(4, 1), 3.0)), 14.42, 0.35)
place(fx, st(sfx_paper(0.2), 0.4), 18.3, 0.35)
chord(22.62, [0, 4, 7], 3.0, 0.45, 0)
place(fx, st(sfx_coin(1.0, 2300)), 22.7, 0.35)
phrase(24.87, -1, 0.5)
strings(24.6, [5, 9, 12], 9.5, 1500, 0.45)
for st_ in (27.27, 27.97, 28.87): place(fx, st(sfx_paper(0.15), 0.2), st_ - 0.05, 0.3)
chord(30.1, [3, 7, 10], 3.5, 0.5, -1)
place(mu, st(bell(N(9, 1), 3.0)), 32.4, 0.35)
# nobody at the desk: everything thins, a single low note
place(fx, st(sfx_thunk(90)), 34.34, 0.45)
place(mu, st(piano(N(0, -1), 4.0, 0.5)), 34.4, 0.8)
# caveats: three soft notes, one per footnote
for st_, d in ((36.38, 4), (38.17, 3), (40.57, 2)): place(mu, st(piano(N(d), 3.0, 0.45)), st_, 0.8); place(fx, st(sfx_type(), 0.1), st_ - 0.05, 0.25)
strings(36.2, [0, 3, 7], 7.0, 700, 0.35)
# a new kind of customer: lift
strings(43.3, [0, 4, 7, 11], 9.3, 2200, 0.55)
phrase(43.47, 4, 0.6)
chord(45.97, [0, 4, 7], 3.0, 0.55, -1)
chord(47.83, [5, 9, 12], 4.0, 0.6, -1)
place(mu, st(bell(N(7, 1), 4.0)), 49.23, 0.45)
chord(50.0, [0, 4, 7, 11], 3.0, 0.45, 0)

# fade drone at the end
mu[int((D - 2.0) * SR):int(D * SR)] *= np.linspace(1, 0, int(2.0 * SR))[:, None]
mu = reverb(mu, 0.32, 2.8, 5500); fx = reverb(fx, 0.25, 2.0, 7000)
write('music.wav', mu[:int(D * SR)]); write('sfx.wav', fx[:int(D * SR)], 0.6)
print('ok')
