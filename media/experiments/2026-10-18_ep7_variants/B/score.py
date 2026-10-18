import sys; sys.path.insert(0, '../engine')
from audio import *

D = 49.4
mu, fx = buf(D), buf(D)
SA = hz('D3')  # D major pentatonic for warmth: D E F# A B
pent = [0, 2, 4, 7, 9]
def P(i, o=0): return SA * 2 ** ((pent[i % 5] + 12 * (i // 5) + 12 * o) / 12)

# 0 → 2.4 : music-box motif as the pocket money is handed over
for k, (n, tt_) in enumerate([(5, 0.0), (7, 0.35), (9, 0.7), (8, 1.05), (10, 1.4)]):
    place(mu, st(marimba(P(n, 1), 1.4), -0.3 + k * 0.15), tt_, 0.55)
place(mu, st(pad([P(0), P(2), P(4)], 2.8, a=0.3, r=0.8, cutoff=1400)), 0.0, 0.6)
place(fx, st(sfx_coin()), 1.22, 0.75)
# 2.56 → 8.9 : days fly by (ticks speeding up, paper flips, swirl)
place(mu, st(drone(SA / 2, 6.8)), 2.4, 0.8)
place(fx, st(sfx_whoosh(1.4, 300, 1500)), 2.7, 0.3)
t, gap = 2.9, 0.38
while t < 8.2:
    place(fx, st(sfx_tick(2900 if int(t * 10) % 2 else 2200), 0.2), t, 0.4)
    if gap < 0.2: place(fx, st(sfx_paper(0.12), -0.3), t + 0.02, 0.25)
    t += gap; gap = max(0.08, gap * 0.9)
place(fx, st(sfx_riser(0.6, 300, 2000)), 9.08, 0.7)
place(fx, st(sfx_pop(700)), 9.69, 0.8); place(fx, st(sfx_impact(1.0, 70)), 9.69, 0.45)

BEAT = 60 / 102
def groove(t0, t1, kick_on=True, lite=False):
    b = 0; t = t0; chords = [0, 3, 4, 2]
    while t < t1 - 0.02:
        bar, beat = divmod(b, 4); ch = chords[bar % 4]
        if kick_on and beat in (0, 2): place(mu, st(kick(1.05, 0.38, 0.6)), t, 0.6)
        if not lite and beat in (1, 3): place(mu, st(tabla_na(P(0, 1) * 1.0)), t, 0.4)
        if beat == 0 or (beat == 2 and bar % 2): place(mu, st(tabla_ge(SA / 2.2)), t + (BEAT / 2 if beat == 2 else 0), 0.45)
        for s in range(2): place(mu, st(shaker(), 0.4), t + s * BEAT / 2, 0.2 if s else 0.12)
        if beat == 0: place(mu, st(sub(P(ch, -1), BEAT * 3.5)), t, 0.65)
        # marimba ostinato (8ths)
        pat = [0, 2, 4, 2, 5, 4, 2, 4]
        for e in range(2):
            n = pat[(beat * 2 + e) % 8] + ch
            place(mu, st(marimba(P(n, 1), 0.7), -0.35 if e else 0.35), t + e * BEAT / 2, 0.34 if not lite else 0.24)
        if beat == 0: place(mu, st(pad([P(ch), P(ch + 2), P(ch + 4)], BEAT * 4.2, a=0.3, r=0.5, cutoff=1500)), t, 0.32)
        b += 1; t = t0 + b * BEAT

groove(9.69, 34.8)
# catch: thin out
place(fx, st(sfx_whoosh(0.6, 3000, 400)), 34.6, 0.45)
place(mu, st(pad([P(0, -1), P(2, -1), P(4, -1)], 5.2, a=0.6, r=1.0, cutoff=700)), 34.86, 0.9)
place(mu, st(drone(SA / 2, 5.0)), 34.86, 0.5)
place(fx, st(sfx_thunk(120)), 37.65, 0.5); place(fx, st(sfx_thunk(95)), 38.75, 0.5)
# lesson for builders: groove returns without kick, then full
groove(39.75, 41.5, kick_on=False, lite=True)
groove(41.51, 45.5)
place(fx, st(sfx_pop(620)), 43.11, 0.7); place(fx, st(sfx_thunk(160)), 43.13, 0.35)
for k in range(3): place(fx, st(tabla_na(1000 + k * 120, 0.25), 0.6 - k * 0.2), 43.6 + k * 0.25, 0.3)
# ending: resolve
place(mu, st(pad([P(0), P(2), P(4), P(0, 1)], 4.2, a=0.05, r=2.0, cutoff=2000)), 45.56, 0.6)
for k, n in enumerate([0, 2, 4, 5]): place(mu, st(marimba(P(n, 1), 1.6)), 45.56 + k * 0.12, 0.45)
place(fx, st(sfx_ding(1175)), 45.6, 0.45)
place(mu, st(kick(0.9, 0.6)), 45.56, 0.5)

# purchases + gate
for st_ in (12.41, 13.36, 14.52):
    place(fx, st(sfx_whoosh(0.3, 1200, 3500)), st_ + 0.1, 0.25); place(fx, st(sfx_coin(0.7, 2700)), st_ + 0.58, 0.6); place(fx, st(sfx_pop(820)), st_ + 0.62, 0.35)
place(fx, st(sfx_scratch(0.4)), 20.68, 0.6)
place(fx, st(sfx_coin()), 25.55, 0.7)
place(fx, st(sfx_whoosh(0.4, 500, 2500)), 26.25, 0.45); place(fx, st(sfx_thunk(130)), 26.75, 0.5)
place(fx, st(sfx_glitch(0.22)), 27.45, 0.4)
place(fx, st(sfx_whoosh(1.0, 300, 4000)), 29.7, 0.5)
t = 31.5
while t < 33.0: place(fx, st(sfx_type(), 0.2), t, 0.4); t += 0.06
place(fx, st(sfx_ding(1568)), 33.05, 0.4)

mu = reverb(mu, 0.2, 1.6, 7000); fx = reverb(fx, 0.2, 1.1, 8000)
write('music.wav', mu[:int(D * SR)]); write('sfx.wav', fx[:int(D * SR)], 0.8)
print('ok')
