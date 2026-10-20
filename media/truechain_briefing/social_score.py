"""Score + SFX for the 1:1 social cut -> social_music.wav, social_sfx.wav (reuses the master's instruments)."""
import json, re, numpy as np, score as S
from audio import *  # noqa
H = S.HERE; s = open(f"{H}/comp/social_tl.js").read(); TL = json.loads(s[s.index('{'):s.rindex('}') + 1]); TOTAL = TL['total']
def wt(lid, word, end=False):
    ws = [w for w in next(l for l in TL['lines'] if l['id'] == lid)['words'] if re.sub(r"[^\w%$.]", "", w[0].lower()).startswith(word.lower())]
    return ws[0][2 if end else 1]
mus = buf(TOTAL + 2); sfx = buf(TOTAL + 2)
S.section(mus, 0.0, 13.2, ['Am7', 'Fmaj7'], 2, 'sparse', vel=0.34, pad_gain=0.34, cutoff=1000, bass=0.12, fade_in=0.3)
S.section(mus, 12.8, 34.8, ['Am7', 'Fmaj7', 'Dm9', 'Esus4'], 2, 'quarter', vel=0.34, pad_gain=0.42, cutoff=1200, pulse=0.10, bass=0.30, fade_in=0.6)
S.section(mus, 34.4, TL['endCard'] + 0.2, ['Cadd9', 'G/B', 'Am7', 'Fmaj7'], 2, 'eighth', vel=0.36, pad_gain=0.46, cutoff=2100, pulse=0.11, bass=0.32, fade_in=0.4)
ec = TL['endCard']; b, voi = S.CH['Cadd9']
place(mus, st(pad([S.N(n) for n in voi + ['G4']], TOTAL - ec, a=0.6, r=3.5, cutoff=1500, det=0.08), 0), ec, 0.42)
place(mus, st(lp(sub(S.N('C2'), TOTAL - ec, a=0.5, r=3), 400), 0), ec, 0.26)
for i, n in enumerate(['C3', 'G3', 'D4', 'E4', 'G4']): place(mus, st(S.felt(S.N(n) * 2, 6, 0.36), (i - 2) * 0.15), ec + 0.05 + i * 0.09, 0.9)
mus = reverb(mus, wet=0.22, sec=2.4, bright=5000); n = int(TOTAL * SR); fo = int(1.5 * SR); mus[n - fo:n] *= np.linspace(1, 0, fo)[:, None]
write(f"{H}/social_music.wav", mus[:n])
def X(src, t, g, pan=0.0): place(sfx, st(src, pan), t, g)
tick = lambda: lp(sfx_tick(2600, 0.05), 6000); paper = lambda: lp(sfx_paper(0.16), 6500)
tt_ = np.arange(int(1.2 * SR)) / SR; muted = lp(np.sin(2 * np.pi * 196 * tt_) * 0.6, 700) * np.minimum(1, tt_ / 0.02) * np.exp(-tt_ * 3.2)
chime = bell(S.N('C6'), 2.5) * 0.8 + bell(S.N('G6'), 2.5) * 0.35
X(muted, wt('L02', 'some'), 0.32); X(paper(), wt('L02', 'opened') - 0.25, 0.35); X(tick(), wt('L03', '467', True), 0.3)
X(tick(), wt('L09', 'three', True) + 0.2, 0.26); X(chime, 35.35, 0.3)
for w, d in [('brand', 0), ('suppliers', 0.6), ('distributors', 0), ('sale', -0.2)]: X(paper(), wt('L12', w) + d, 0.28); X(tick(), wt('L12', w) + d + 0.05, 0.22)
X(lp(sfx_tick(3800, 0.03), 7000), wt('L14', 'history') - 0.1, 0.35); X(chime, ec + 0.02, 0.22)
write(f"{H}/social_sfx.wav", sfx[:n], peak=0.5); print("social audio", TOTAL)
