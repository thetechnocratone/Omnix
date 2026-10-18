import sys; sys.path.insert(0, '/home/claude/omnix/tools/reel_lab/engine')
from audio import *
# warm, slow, low-centred bed like the owner's reference: soft felt piano + pad + sub, no drums
D = 13.0
mu, fx = buf(D), buf(D)
F = hz('F3'); maj = [0, 2, 4, 5, 7, 9, 11]
def N(d, o=0): return F * 2 ** ((maj[d % 7] + 12 * (d // 7) + 12 * o) / 12)
BAR = 60 / 66 * 4 / 2          # half-bars at 66 bpm, ~1.82 s per chord
prog = [[0, 2, 4, 6], [5, 7, 9, 11], [3, 5, 7, 9], [4, 6, 8, 10], [0, 2, 4, 6], [5, 7, 9, 11], [3, 5, 7, 9]]
t = 0.0
for i, ch in enumerate(prog):
    if t > D - 1.0: break
    root = ch[0]
    place(mu, st(sub(N(root, -1), BAR * 1.05, a=0.06, r=0.5)), t, 0.32)
    place(mu, st(pad([N(d, -1) for d in ch], BAR * 1.25, a=0.5, r=0.9, cutoff=900, det=0.08)), t, 0.42)
    for k, d in enumerate(ch[1:]):                       # gentle rolled piano voicing
        place(mu, st(piano(N(d), 2.6, 0.38), -0.25 + 0.25 * k), t + 0.05 + k * 0.07, 0.5)
    if i in (2, 3, 4):                                   # little melody when the orange line lands
        place(mu, st(piano(N(ch[3] + 2, 1) if i == 2 else N(ch[2], 1), 2.2, 0.32), 0.2), t + BAR * 0.5, 0.35)
    t += BAR
# resolution on the end card
place(mu, st(pad([N(0, -1), N(4, -1), N(7, -1), N(9, -1)], 2.4, a=0.3, r=1.4, cutoff=1100)), 11.0, 0.5)
place(mu, st(bell(N(7, 1), 2.4)), 11.25, 0.18)
place(mu, st(piano(N(4, 1), 2.4, 0.3)), 11.25, 0.35)
mu = lp(mu, 2600)
mu[:int(0.25 * SR)] *= np.linspace(0, 1, int(0.25 * SR))[:, None]
mu[int((D - 1.4) * SR):int(D * SR)] *= np.linspace(1, 0, int(1.4 * SR))[:, None]
mu = reverb(mu, 0.3, 2.6, 4000)
write('music.wav', mu[:int(D * SR)]); write('sfx.wav', fx[:int(D * SR)] + 1e-6, 0.1)
print('ok')
