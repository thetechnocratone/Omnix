import sys; sys.path.insert(0, '../engine')
from audio import *

D = 35.0
mu, fx = buf(D), buf(D)
SA = hz('D3')  # D Kafi: D E F G A B C
deg = lambda d, o=0: SA * 2 ** ((([0, 2, 3, 5, 7, 9, 10][d % 7]) + 12 * (d // 7) + 12 * o) / 12)

def waiting_bed(t0, t1, seed=0):
    # clock + drone + heartbeat sub: the "waiting" texture that opens and closes the loop
    L = t1 - t0
    place(mu, st(drone(SA / 2, L + 0.5) * 0.9), t0)
    place(mu, st(pad([deg(0, -1), deg(4, -1), deg(2)], L + 0.6, a=0.4, r=0.5, cutoff=900)), t0, 0.9)
    k = 0; t = t0
    while t < t1 - 0.05:
        place(fx, st(sfx_tick(3000 if k % 2 == 0 else 2300), -0.15 if k % 2 else 0.15), t, 0.55)
        if k % 2 == 0: place(mu, st(sub(SA / 2, 0.22, r=0.15)), t, 0.6)
        t += 0.5; k += 1

waiting_bed(0.0, 7.0)
place(fx, st(sfx_impact(1.6, 50)), 0.0, 0.7)
# calendar pages flipping faster and faster 1.9 → 6.4
t = 1.9; gap = 0.42
while t < 6.4:
    place(fx, st(sfx_paper(0.14), 0.4), t, 0.5); t += gap; gap = max(0.09, gap * 0.86)
# "Now?" — hush, then a riser into the flip
place(fx, st(sfx_riser(0.85, 160, 2200)), 7.02, 0.9)
place(fx, st(sfx_impact(1.8, 46)), 7.86, 1.0)
place(fx, st(sfx_whoosh(0.4, 3000, 400)), 7.80, 0.6)

# ---- groove 7.86 → 25.0 and 30.83 → 32.9 ----
BEAT = (D - 7.86) / 44  # 11 bars of 4 beats
prog = [0, 5, 6, 0]  # i - VI - VII - i in D Kafi (roots: D, B, C, D)
def groove(t0, t1, full=True):
    b = 0; t = t0
    while t < t1 - 0.02:
        bar, beat = divmod(b, 4)
        root = deg(prog[bar % 4], -1)
        if beat in (0, 2) or (beat == 1 and bar % 2 == 1): place(mu, st(kick(punch=1.0 if beat == 0 else 0.7)), t, 0.95 if full else 0.6)
        if beat in (1, 3) and full: place(mu, st(clap(), 0.05), t, 0.42)
        for e in range(2):
            place(mu, st(hat(), 0.35 if e else -0.2), t + e * BEAT / 2, 0.5 if e else 0.3)
        if full:
            for s16 in range(4): place(mu, st(shaker(), 0.5), t + s16 * BEAT / 4, 0.25 if s16 % 2 else 0.15)
        if beat == 0: place(mu, st(sub(root, BEAT * 3.6)), t, 0.9)
        if beat == 2 and full: place(mu, st(sub(root * (1.5 if bar % 2 else 1), BEAT * 1.6)), t, 0.6)
        # tabla accents
        if beat == 3: place(mu, st(tabla_na(deg(0, 1) * 1.0)), t + BEAT / 2, 0.55)
        if beat == 1 and bar % 2 == 0: place(mu, st(tabla_ge(SA / 2.1)), t, 0.5)
        # plucked arpeggio, pentatonic, 8ths
        if full:
            arp = [0, 2, 4, 7, 4, 2, 7, 9]
            for e in range(2):
                n = arp[(b * 2 + e) % 8] + prog[bar % 4]
                place(mu, st(pluck(deg(n, 1), 0.9, 0.35), -0.3 if e else 0.3), t + e * BEAT / 2, 0.32)
        if beat == 0: place(mu, st(pad([root * 2, root * 3, root * 2 * 2 ** (3 / 12) * (1 if prog[bar % 4] == 0 else 1.0)], BEAT * 4 + 0.3, a=0.25, r=0.4, cutoff=1600 if full else 700)), t, 0.5)
        b += 1; t = t0 + b * BEAT

groove(7.86, 25.0)
# the catch: half-time, filtered
t = 25.09
place(fx, st(sfx_whoosh(0.6, 3500, 300)), 25.0, 0.5)
place(mu, st(pad([deg(0, -1), deg(2, -1), deg(4, -1), deg(0)], 5.8, a=0.6, r=0.8, cutoff=650)), 25.1, 0.9)
for k in range(5): place(mu, st(kick(0.9, punch=0.4)), 25.09 + k * BEAT * 2, 0.45); place(mu, st(sub(deg(0, -1), BEAT * 1.8)), 25.09 + k * BEAT * 2, 0.6)
place(fx, st(sfx_thunk(110)), 27.55, 0.8)
place(fx, st(sfx_thunk(90)), 29.79, 0.6)
place(fx, st(sfx_whoosh(0.5, 400, 4000)), 30.55, 0.55)
groove(30.83, 32.95)
# footsteps of the shopping robot
for k in range(7): place(fx, st(tabla_na(900 + (k % 2) * 140, 0.25) * 0.6, -0.6 + k * 0.2), 30.95 + k * 0.29, 0.35)
# back to waiting → loop
waiting_bed(32.95, D)
place(fx, st(sfx_impact(1.2, 52)), 33.91, 0.55)

# ---- event SFX ----
place(fx, st(sfx_whoosh(0.5, 600, 5000)), 9.05, 0.5)
t = 10.6
while t < 12.0: place(fx, st(sfx_type(), 0.2), t, 0.45); t += 0.055
place(fx, st(sfx_ding(1760)), 12.08, 0.45)
place(fx, st(sfx_coin()), 14.78, 0.8)
place(fx, st(sfx_riser(1.0, 500, 1500)), 15.0, 0.25)
for tt_, pan in ((16.64, -0.5), (17.28, 0.0), (18.52, 0.5)):
    place(fx, st(sfx_pop(560), pan), tt_, 0.6); place(fx, st(sfx_coin(0.6, 2900), pan), tt_ + 0.42, 0.55)
place(fx, st(sfx_whoosh(0.35, 800, 3000)), 19.25, 0.4)
place(fx, st(sfx_scratch(0.45)), 20.3, 0.7)
for k in range(3): place(fx, st(sfx_pop(480 + k * 90), -0.5 + k * 0.5), 21.47 + k * 0.12, 0.5)
t = 23.3
while t < 24.6: place(fx, st(sfx_tick(3400), 0.1), t, 0.3); t += 0.11
place(fx, st(sfx_ding(1320)), 24.6, 0.35)

mu = reverb(mu, 0.18, 1.6, 7000); fx = reverb(fx, 0.22, 1.2, 8000)
write('music.wav', mu[:int(D * SR)]); write('sfx.wav', fx[:int(D * SR)], 0.8)
print('ok')
