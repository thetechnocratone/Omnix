// Tweet-style reel v2 (owner's reference look): minimal post card, words fade in one by one.
'use strict';
window.__noGrain = true;
const D = 13.0;
const BG = '#FBFAF3', INK = '#151515', GREY = '#73706A', ORG = '#E8920E', ORG_SOFT = '#F3C27A';
const SIZE = 72, LH = 93, X0 = 111;
const BLACK = [['AI', 'can', 'copy', "anyone's"], ['voice.', 'Even', 'your', "mom's."]];
const ORANGE = [['Pick', 'a', 'family', 'code', 'word'], ['before', 'you', 'need', 'one.']];
const T = { head: 0.15, black: 0.75, step: 0.27, orange: 4.3, endc: 11.0 };
const Y = { avatar: 648, body: 872, org: 1112 };
window.COMP = { dur: D, draw(t) { draw(t); } };

function mix(a, b, k) { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; }
function tick(X, Y0, r) { save(() => { x.translate(X, Y0); x.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, q = i % 2 ? r * 0.84 : r; x.lineTo(Math.cos(a) * q, Math.sin(a) * q); } x.closePath(); x.fillStyle = '#1D9BF0'; x.fill();
  line([[-r * 0.38, r * 0.02], [-r * 0.1, r * 0.3], [r * 0.42, -r * 0.3]], '#fff', r * 0.2); }); }
function header(a) { alpha(a, () => {
  circ(183, Y.avatar, 72); fillStroke('#FFFFFF', '#EAE6DC', 3); img('logo', 183, Y.avatar, 128);
  txt('omnix', 285, Y.avatar - 10, { size: 46, w: 700, fam: 'inter', align: 'left', color: INK });
  tick(285 + tw('omnix', 46, 700, 'inter') + 28, Y.avatar - 26, 21);
  txt('@omnixteam', 285, Y.avatar + 46, { size: 38, w: 400, fam: 'inter', align: 'left', color: GREY }); }); }
function words(lines, t0, Y0, w, from, to, t, idx0) {
  let k = idx0;
  lines.forEach((L, li) => { let X = X0;
    L.forEach(wd => { const st = t0 + (k - idx0) * T.step; const q = cl((t - st) / 0.42);
      if (q > 0) { const e = E.cubicO(q);
        txt(wd, X, Y0 + li * LH + (1 - e) * 10, { size: SIZE, w, fam: 'inter', align: 'left', color: mix(from, to, e), a: cl(q * 2.2) }); }
      X += tw(wd + ' ', SIZE, w, 'inter'); k++; }); });
  return k;
}
function draw(t) {
  x.fillStyle = BG; x.fillRect(0, 0, W, H);
  const out = 1 - inv(T.endc, T.endc + 0.45, t);
  if (out > 0) alpha(out, () => {
    header(E.cubicO(inv(T.head, T.head + 0.5, t)));
    words(BLACK, T.black, Y.body, 400, '#C9C5BB', INK, t, 0);
    words(ORANGE, T.orange, Y.org, 600, ORG_SOFT, ORG, t, 0);
  });
  // end card: glowing mark, site, product line
  const e = inv(T.endc + 0.25, T.endc + 0.9, t);
  if (e > 0) alpha(e, () => {
    const pulse = 1 + 0.04 * Math.sin((t - T.endc) * 3);
    save(() => { const g = x.createRadialGradient(W / 2, 930, 10, W / 2, 930, 190 * pulse); g.addColorStop(0, 'rgba(240,150,20,0.35)'); g.addColorStop(1, 'rgba(240,150,20,0)'); x.fillStyle = g; x.fillRect(0, 700, W, 460); });
    img('logo', W / 2, 930, 150 * (0.94 + 0.06 * E.backO(e)));
    txt('theomnix.org', W / 2, 1060, { size: 34, w: 600, fam: 'inter', color: INK });
    txt('OmniChain · coming soon', W / 2, 1106, { size: 30, w: 500, fam: 'inter', color: ORG, a: inv(T.endc + 0.6, T.endc + 1.1, t) });
  });
}
