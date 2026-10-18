import sys; sys.path.insert(0, '../engine')
from audio import *

D = 25.0
mu, fx = buf(D), buf(D)
SA = hz('E3')
minor = [0, 2, 3, 5, 7, 8, 10]
def N(d, o=0): return SA * 2 ** ((minor[d % 7] + 12 * (d // 7) + 12 * o) / 12)
BEAT = 60 / 112

# intro: a held pad + soft pulse (the agent waking)
place(mu, st(pad([N(0, -1), N(4, -1), N(2)], 2.9, a=0.4, r=0.6, cutoff=1100)), 0, 0.7)
for k in range(5): place(mu, st(sub(N(0, -1), 0.25)), k * BEAT, 0.45)
place(fx, st(sfx_pop(680)), 1.0, 0.4)
# 2.8 → 4.5 days racing, 4.6 snap to 18 minutes
t, gap = 2.9, 0.3
while t < 4.45: place(fx, st(sfx_paper(0.1), 0.3), t, 0.4); place(fx, st(sfx_tick(2600), -0.2), t, 0.25); t += gap; gap = max(0.06, gap * 0.82)
place(fx, st(sfx_riser(0.5, 400, 2400)), 4.1, 0.5)
place(fx, st(sfx_impact(1.2, 60)), 4.6, 0.65)

def beat_section(t0, t1, full=True):
    b = 0; t = t0; prog = [0, 5, 3, 6]
    while t < t1 - 0.02:
        bar, bt = divmod(b, 4); r = prog[bar % 4]
        if bt in (0, 2) or (bt == 3 and bar % 2): place(mu, st(kick(1.0, 0.4, 0.7)), t + (BEAT / 2 if bt == 3 else 0), 0.75)
        if bt in (1, 3): place(mu, st(clap(), 0.05), t, 0.35)
        for e in range(4): place(mu, st(hat(), 0.4 if e % 2 else -0.3), t + e * BEAT / 4, 0.32 if e % 2 == 0 else 0.18)
        if bt == 0: place(mu, st(sub(N(r, -1), BEAT * 3.6)), t, 0.75); place(mu, st(pad([N(r), N(r + 2), N(r + 4)], BEAT * 4.1, a=0.08, r=0.3, cutoff=1300)), t, 0.35)
        if full:
            for e in range(2): place(mu, st(pluck(N([0, 2, 4, 6, 4, 2, 7, 4][(b * 2 + e) % 8] + r, 1), 0.6, 0.6), -0.25 if e else 0.25), t + e * BEAT / 2, 0.22)
        b += 1; t = t0 + b * BEAT

beat_section(4.6, 15.5)
# typing bursts for each log line
lines = [(6.6, 'wallet funded'), (8.6, 'GET /live-data'), (9.1, '← 402 Payment Required'), (9.6, 'pay <10¢ → access ✓'), (10.6, 'GET /compute'),
         (11.0, '← 402 · pay <10¢ → ✓'), (11.9, 'GET /code-review'), (12.3, '← 402 · pay <10¢ → ✓'), (13.5, 'ask a human to approve?'), (14.3, 'not needed')]
for t0, s in lines:
    for k in range(len(s)):
        if s[k] != ' ': place(fx, st(sfx_type(), 0.15 + 0.1 * ((k % 3) - 1)), t0 + k / 40, 0.28)
for pt in (6.95, 10.05, 11.5, 12.8): place(fx, st(sfx_ding(1760)), pt, 0.22)
for pt in (9.6, 11.0, 12.3): place(fx, st(sfx_coin(0.7, 2900)), pt + 0.25, 0.45)
place(fx, st(sfx_glitch(0.2)), 9.1, 0.3)
place(fx, st(sfx_scratch(0.35)), 14.35, 0.55)
# receipts
place(fx, st(sfx_whoosh(0.5, 500, 4000)), 15.3, 0.4)
beat_section(15.6, 20.4, full=False)
for pt in (15.8, 16.9, 18.0): place(fx, st(sfx_pop(560)), pt, 0.55); place(fx, st(sfx_thunk(150)), pt, 0.3)
# punchline: a stop, then a resolving chord
place(fx, st(sfx_riser(0.6, 300, 2000)), 19.9, 0.4)
place(mu, st(kick(0.9, 0.6)), 20.5, 0.6)
place(mu, st(pad([N(5, -1), N(0), N(2), N(4)], 3.6, a=0.05, r=1.2, cutoff=2200)), 20.5, 0.8)
place(mu, st(bell(N(4, 1), 3.0)), 20.5, 0.4); place(mu, st(bell(N(2, 1), 3.0)), 21.9, 0.35)
# back to the start for the loop
place(mu, st(pad([N(0, -1), N(4, -1), N(2)], 1.3, a=0.3, r=0.2, cutoff=1100)), 23.7, 0.6)
place(fx, st(sfx_pop(680)), 24.0, 0.35)

mu = reverb(mu, 0.16, 1.4, 7000); fx = reverb(fx, 0.16, 1.0, 8000)
write('music.wav', mu[:int(D * SR)]); write('sfx.wav', fx[:int(D * SR)], 0.8)
print('ok')
