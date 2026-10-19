# Seamless loop bed: I-vi-IV-ii-V in F, one chord per bar, the V resolves into bar 1 when the reel loops.
# Rendered twice back-to-back and the second pass is kept, so reverb/piano tails wrap into the start.
import sys; sys.path.insert(0, '/home/claude/omnix-repo/tools/reel_lab/engine')
from audio import *
BPM = 72; BAR = 60 / BPM * 4          # 3.333 s
D = BAR * 5                            # 16.667 s = loop length
F0 = hz('F3'); maj = [0, 2, 4, 5, 7, 9, 11]
def N(d, o=0): return F0 * 2 ** ((maj[d % 7] + 12 * (d // 7) + 12 * o) / 12)
prog = [[0, 2, 4, 6], [5, 7, 9, 11], [3, 5, 7, 9], [1, 3, 5, 7], [4, 6, 8, 10]]
mel = [None, 9, None, 8, 6]            # tiny top-line answer on bars 2, 4, 5
mu = buf(D * 2)
for rep in range(2):
    for i, ch in enumerate(prog):
        t = rep * D + i * BAR
        place(mu, st(sub(N(ch[0], -1), BAR * 1.02, a=0.06, r=0.5)), t, 0.3)
        place(mu, st(pad([N(d, -1) for d in ch], BAR * 1.2, a=0.6, r=1.0, cutoff=900, det=0.08)), t, 0.4)
        for k, d in enumerate(ch[1:]):
            place(mu, st(piano(N(d), 2.8, 0.36), -0.25 + 0.25 * k), t + 0.05 + k * 0.08, 0.5)
        if mel[i] is not None:
            place(mu, st(piano(N(mel[i], 1), 2.2, 0.3), 0.2), t + BAR * 0.5, 0.32)
mu = lp(mu, 2600)
mu = reverb(mu, 0.3, 2.6, 4000)
loop = mu[int(D * SR):int(2 * D * SR)]
write('music.wav', loop)
print('ok', round(D, 3))
