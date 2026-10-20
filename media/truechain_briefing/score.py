"""Original score + sound design for the TrueChain briefing (all synthesised here: no samples, no licence needed).

python3 score.py  ->  music.wav, sfx.wav   (48 kHz stereo, same length as the film)
Felt piano and warm pads at 92 BPM. Arc: near-silent cold open -> sparse minor (scenes 2-3) ->
major lift at the TrueChain reveal (4-5) -> almost silence for Limits (6) -> gentle resolve (7-8).
"""
import sys, os, json, re
import numpy as np
sys.path.insert(0, '/home/claude/omnix/tools/reel_lab/engine')
from audio import *  # noqa: F401,F403  (SR, buf, place, st, piano, pad, sub, bell, lp, hp, reverb, sfx_*)
HERE = os.path.dirname(os.path.abspath(__file__))
s = open(f"{HERE}/comp/timeline.js").read(); TL = json.loads(s[s.index('{'):s.rindex('}') + 1])
TOTAL, SCN = TL['total'], TL['scenes']
BPM = 92; BEAT = 60 / BPM; BAR = 4 * BEAT
rng = np.random.default_rng(7)


def wt(lid, word, end=False, nth=0):
    ws = [w for w in next(l for l in TL['lines'] if l['id'] == lid)['words']
          if re.sub(r"[^\w%$.]", "", w[0].lower()).startswith(word.lower())]
    w = ws[nth] if len(ws) > nth else ws[0]
    return w[2 if end else 1]


def N(n): return hz(n)
CH = {  # bass, voicing
    'Am7': ('A2', ['A3', 'C4', 'E4', 'G4']), 'Fmaj7': ('F2', ['F3', 'A3', 'C4', 'E4']), 'Dm9': ('D2', ['F3', 'A3', 'C4', 'E4']),
    'Esus4': ('E2', ['E3', 'A3', 'B3', 'E4']), 'Cadd9': ('C3', ['G3', 'C4', 'D4', 'E4']), 'G/B': ('B2', ['G3', 'B3', 'D4', 'G4']),
    'C/E': ('E2', ['G3', 'C4', 'E4', 'G4']), 'Dm7': ('D2', ['F3', 'A3', 'C4', 'D4']), 'Gsus4': ('G2', ['G3', 'C4', 'D4', 'G4']),
    'G': ('G2', ['G3', 'B3', 'D4', 'G4']),
}


def felt(f, dur=3.0, vel=0.5):          # felt piano: soft hammer, darker tone
    return lp(piano(f, dur, vel) + 0.35 * piano(f * 1.0015, dur, vel * 0.9), 1700 + 1400 * vel, 2)


def section(mus, t0, t1, prog, bars_per=2, arp='quarter', vel=0.4, pad_gain=0.5, cutoff=1500, pulse=0.0, bass=0.35, fade_in=1.5, fade_out=1.5):
    seg = buf(t1 - t0 + 6); t = 0.0; k = 0
    while t < t1 - t0:
        name = prog[k % len(prog)]; b, voi = CH[name]; dur = BAR * bars_per
        place(seg, st(pad([N(n) for n in voi], dur + 1.2, a=1.2, r=1.4, cutoff=cutoff, det=0.08), 0), t, pad_gain)
        if bass: place(seg, st(lp(sub(N(b), dur, a=0.4, r=0.8), 400), 0), t, bass)
        nb = int(bars_per * 4)
        if arp == 'sparse':
            for j in range(0, nb, 2):
                if rng.random() < 0.7: place(seg, st(felt(N(voi[(j // 2 + k) % 4]) * 2, 3.2, vel), rng.uniform(-.3, .3)), t + j * BEAT, 1)
        elif arp == 'quarter':
            pat = [0, 2, 1, 3, 2, 1, 3, 2]
            for j in range(nb):
                if j % 4 in (0, 2) or rng.random() < 0.35:
                    place(seg, st(felt(N(voi[pat[j % 8]]) * 2, 2.6, vel * (1.0 if j % 4 == 0 else 0.8)), rng.uniform(-.35, .35)), t + j * BEAT, 1)
        elif arp == 'eighth':
            pat = [0, 2, 3, 1, 2, 3, 1, 2]
            for j in range(nb * 2):
                if j % 2 == 0 or rng.random() < 0.55:
                    place(seg, st(felt(N(voi[pat[j % 8]]) * 2, 2.2, vel * (1.0 if j % 8 == 0 else 0.75)), rng.uniform(-.4, .4)), t + j * BEAT / 2, 1)
        elif arp == 'half':
            for j in range(0, nb, 2): place(seg, st(felt(N(voi[(j // 2) % 4]) * 2, 3.6, vel), 0), t + j * BEAT, 1)
        if pulse:
            for j in range(nb):
                if j % 2 == 0: place(seg, st(lp(kick(0.75, 0.4, 0.1), 900), 0), t + j * BEAT, pulse)
        t += dur; k += 1
    n = int((t1 - t0) * SR); seg = seg[:n + int(fade_out * SR)]
    e = np.ones(len(seg)); fi = int(fade_in * SR); e[:fi] = np.linspace(0, 1, fi) ** 2
    fo = int(fade_out * SR); e[n - fo // 2:n + fo - fo // 2] *= np.linspace(1, 0, fo); e[n + fo - fo // 2:] = 0
    place(mus, seg * e[:, None], t0)


def main():
    mus = buf(TOTAL + 2); sfx = buf(TOTAL + 2)
    # --- music
    place(mus, st(lp(pad([N('A3'), N('E4')], 3.2, a=1.0, r=1.6, cutoff=900), 900), 0), 0.3, 0.55)       # the single soft tone
    section(mus, 3.0, 20.0, ['Am7', 'Fmaj7'], 2, 'sparse', vel=0.32, pad_gain=0.28, cutoff=900, bass=0.0, fade_in=3)
    section(mus, 19.4, SCN[3] - 0.6, ['Am7', 'Fmaj7', 'Dm9', 'Esus4'], 2, 'quarter', vel=0.34, pad_gain=0.42, cutoff=1200, pulse=0.10, bass=0.30)
    section(mus, SCN[3] - 0.3, SCN[5] + 0.5, ['Cadd9', 'G/B', 'Am7', 'Fmaj7'], 2, 'eighth', vel=0.36, pad_gain=0.46, cutoff=2100, pulse=0.11, bass=0.32, fade_in=0.4)
    section(mus, SCN[5] - 0.3, SCN[6] + 0.2, ['Fmaj7', 'Fmaj7'], 4, 'none', vel=0.0, pad_gain=0.20, cutoff=800, bass=0.0, fade_in=1.0, fade_out=2.0)
    section(mus, SCN[6] - 0.4, SCN[7] + 0.3, ['Fmaj7', 'C/E', 'Dm7', 'G'], 2, 'quarter', vel=0.30, pad_gain=0.36, cutoff=1500, bass=0.22, fade_in=2.0)
    section(mus, SCN[7] - 0.3, TL['endCard'] + 0.2, ['Fmaj7', 'Gsus4', 'Cadd9'], 2, 'half', vel=0.34, pad_gain=0.40, cutoff=1600, bass=0.26, fade_in=1.2, fade_out=1.0)
    # resolve: final chord under the end card, let it ring out
    ec = TL['endCard']; b, voi = CH['Cadd9']
    place(mus, st(pad([N(n) for n in voi + ['G4']], TOTAL - ec, a=0.6, r=4.5, cutoff=1500, det=0.08), 0), ec, 0.42)
    place(mus, st(lp(sub(N('C2'), TOTAL - ec, a=0.5, r=4), 400), 0), ec, 0.26)
    for i, n in enumerate(['C3', 'G3', 'D4', 'E4', 'G4']): place(mus, st(felt(N(n) * 2, 8, 0.36), (i - 2) * 0.15), ec + 0.05 + i * 0.09, 0.9)
    mus = reverb(mus, wet=0.22, sec=2.4, bright=5000)
    fo = int(2.0 * SR); n = int(TOTAL * SR); mus[n - fo:n] *= np.linspace(1, 0, fo)[:, None]; mus[n:] = 0
    write(f"{HERE}/music.wav", mus[:n])

    # --- sound design (subtle, low)
    def S(src, t, g, pan=0.0): place(sfx, st(src, pan), t, g)
    _i = lp(sfx_impact(0.9, 46), 500) * 0.5; _t = lp(sfx_thunk(80), 900) * 1.2; thud = _i.copy(); thud[:len(_t)] += _t
    tick = lambda: lp(sfx_tick(2600, 0.05), 6000)
    paper = lambda: lp(sfx_paper(0.16), 6500)
    def muted(f=196, dur=1.2):
        tt_ = np.arange(int(dur * SR)) / SR; return lp(np.sin(2 * np.pi * f * tt_) * 0.6 + 0.25 * np.sin(4 * np.pi * f * tt_), 700) * np.minimum(1, tt_ / 0.02) * np.exp(-tt_ * 3.2)
    def air(dur=0.9): return lp(sfx_whoosh(dur, 300, 1800, 1.0), 2500)
    chime = bell(N('C6'), 2.5) * 0.8 + bell(N('G6'), 2.5) * 0.35
    S(thud, 1.99, 0.55); S(air(1.2), 2.3, 0.10); S(air(1.6), 4.6, 0.08)
    S(muted(196), wt('L02', 'some') - 0.02, 0.32); S(paper(), wt('L02', 'opened') - 0.25, 0.35); S(air(1.0), 18.1, 0.09)
    S(tick(), wt('L03', '467', True), 0.30)
    for i, tt_ in enumerate([33.9, 34.5, 34.8]): S(paper(), tt_ + 0.4, 0.22, (i - 1) * 0.3)
    S(tick(), max(wt('L05', 'ten', True) + 0.3, 41.2 + 2.0), 0.28)
    for i in range(46): S(lp(sfx_tick(rng.uniform(1800, 3400), 0.03), 5000), 43.3 + rng.uniform(0, 1.6), 0.05 * rng.uniform(.5, 1), rng.uniform(-.6, .6))
    for i in range(3): S(paper(), 49.6 + 0.5 + i * 0.12, 0.20, (i - 1) * 0.4)
    # scene 3
    S(tick(), wt('L07', 'billion'), 0.26)
    for w in ['returns', 'refunds', 'reverse', 'support']: S(paper(), wt('L08', w) - 0.1, 0.2)
    S(tick(), wt('L09', 'three', True) + 0.2, 0.26)
    for r in range(3): S(paper(), 92.2 + 1.0 + r * 0.35, 0.18)
    S(tick(), wt('L10', 'fifty') - 0.2, 0.26)
    # scene 4: chime on the logo, a paper-tick for every ledger entry, stamp, QR click
    S(chime, 105.55, 0.30)
    for w in [('brand', 0), ('suppliers', 0.6), ('distributors', 0), ('sale', -0.2)]:
        tt_ = wt('L12', w[0]) + w[1]; S(paper(), tt_, 0.28); S(tick(), tt_ + 0.05, 0.22)
    S(lp(sfx_thunk(120), 1500), wt('L13', 'summary') + 0.25, 0.4)
    S(lp(sfx_tick(3800, 0.03), 7000), wt('L14', 'history') - 0.05, 0.35)
    # scene 5
    S(muted(147, 1.4), wt('L16', 'hold') - 0.3, 0.38)
    for w in ['verified', 'attention', 'found', 'trusted']: S(tick(), wt('L19', w) - 0.2, 0.2)
    S(paper(), wt('L18', 'record') - 0.2, 0.22)
    # scene 7-8
    for w in ['disputes', 'returns', 'stolen', 'conversion', 'terms']: S(paper(), wt('L22', w) - 0.2, 0.16)
    for w in ['two', 'agree', 'read']: S(tick(), wt('L24', w) - 0.2, 0.18)
    S(chime, TL['endCard'] + 0.02, 0.22)
    write(f"{HERE}/sfx.wav", sfx[:n], peak=0.5)
    print("music.wav + sfx.wav", TOTAL)


if __name__ == '__main__':
    main()
