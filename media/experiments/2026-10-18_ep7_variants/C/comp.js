// Variant C · "The Documentary" — editorial serif type, big serif numbers, a map with pinned cards and thread.
'use strict';
const K = { s73: 3.7, q3: 6.99, s18: 9.99, nums: 11.52, chain: 12.52, n138: 14.42, x402: 18.42, most: 22.62, mach: 24.87, data: 27.27, two: 30.1, nobody: 34.34,
  tiny: 36.38, total: 38.17, count: 40.57, but: 43.47, s73b: 45.97, s18b: 47.83, stop: 49.23, end: 51.7 };
let G;
// phrase-level captions: break only at sentence ends and at the listed word indices
const BRK = [2, 14, 21, 26, 31, 42, 50, 55, 58, 64, 69, 77, 81, 85, 91, 100, 108, 110, 112];
window.COMP = { dur: K.end, init() { G = []; let s0 = 0; WORDS.forEach((w, i) => { if (BRK.includes(i) || i === WORDS.length - 1 || (i - s0) >= 6) { G.push([s0, i]); s0 = i + 1; } }); }, draw(t) { drawC(t); } };
const SER = 'serif';
const INKC = '#2A211A';

function capC(t) {
  const k = activeGroup(G, WORDS, t, 0.5); if (k < 0) return;
  const [a, b] = G[k]; const size = 70, gap = 18, maxw = 900;
  const ws = []; for (let i = a; i <= b; i++) ws.push({ i, s: WORDS[i][0], w: tw(WORDS[i][0], size, 400, SER === 'serif' ? 'serif' : 'serif') });
  const lines = [[]]; let lw = 0;
  for (const w of ws) { if (lw + w.w > maxw && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.w + gap; }
  const baseY = 1395 - (lines.length - 1) * 40;
  const out = 1 - inv(WORDS[b][2] + 0.35, WORDS[b][2] + 0.6, t) * (k + 1 < G.length && WORDS[G[k + 1][0]][1] - WORDS[b][2] > 0.6 ? 1 : 0);
  lines.forEach((L, li) => {
    const tot = L.reduce((s, w) => s + w.w, 0) + gap * (L.length - 1); let cx = W / 2 - tot / 2;
    L.forEach(w => {
      const st = WORDS[w.i][1]; const q = E.cubicO(inv(st - 0.08, st + 0.3, t));
      const num = /^\d/.test(w.s);
      alpha(q * out, () => {
        save(() => { x.shadowColor = 'rgba(240,138,18,0.35)'; x.shadowBlur = 18;
          txt(w.s, cx + w.w / 2, baseY + li * 82 + (1 - q) * 14, { size, w: 400, fam: 'serif', it: num, color: num ? C.safDeep : INKC }); });
      });
      cx += w.w + gap;
    });
  });
}
// paper card with pin + soft shadow
function card(X0, Y0, w, h, rot, fn, o = {}) {
  at(X0, Y0, o.s || 1, rot, () => {
    save(() => { x.fillStyle = 'rgba(60,40,20,0.18)'; x.filter = 'blur(10px)'; rr(-w / 2 + 10, -h / 2 + 18, w, h, 6); x.fill(); });
    rr(-w / 2, -h / 2, w, h, 6); fillStroke(o.fill || '#FFFBF3', 'rgba(42,33,26,0.25)', 2);
    fn();
    if (o.pin !== false) { circ(0, -h / 2 + 18, 11); fillStroke(C.red, 'rgba(0,0,0,0.3)', 2); circ(-3, -h / 2 + 15, 3); x.fillStyle = 'rgba(255,255,255,0.6)'; x.fill(); }
  });
}
function thread(pts, p, col = C.red, lw = 3) { // draw a polyline progressively
  let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  let rem = L * cl(p); const out = [pts[0]];
  for (let i = 1; i < pts.length && rem > 0; i++) { const d = seg[i - 1]; const q = Math.min(1, rem / d); out.push([lerp(pts[i - 1][0], pts[i][0], q), lerp(pts[i - 1][1], pts[i][1], q)]); rem -= d; }
  if (out.length > 1) line(out, col, lw);
}
function serifNum(n, unit, X0, Y0, size, o = {}) {
  const nw = tw(n, size, 400, 'serif', true); const uw = unit ? tw(unit, size * 0.32, 600, 'sans', false, 3) : 0;
  txt(n, X0 - uw / 2 - 10, Y0, { size, w: 400, fam: 'serif', it: true, color: o.color || INKC });
  if (unit) txt(unit, X0 + nw / 2 - uw / 2 + 4, Y0 - size * 0.08, { size: size * 0.32, w: 600, align: 'left', ls: 3, color: o.ucolor || C.safDeep });
}
// world map made of dots (stylised continents from a coarse mask)
const MAP = [
  '..............................................',
  '.....######.........#####.......########......',
  '...##########......#######....############....',
  '....#########......######....###############..',
  '.....#######........####......#############...',
  '......#####........######......##########.....',
  '.......###.........#######.......#####........',
  '........##..........#####.........###...##....',
  '.........###........####...........#...####...',
  '.........####........##...................#...',
  '..........###.................................',
  '...........#..................................'];
function worldMap(a, t) {
  alpha(a, () => {
    const s = 22, ox = W / 2 - MAP[0].length * s / 2, oy = 700;
    MAP.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '#') { circ(ox + c * s, oy + r * s, 5.5); x.fillStyle = 'rgba(42,33,26,0.32)'; x.fill(); } }));
    // payments: arcs between random land points
    const land = []; MAP.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '#') land.push([ox + c * s, oy + r * s]); }));
    for (let i = 0; i < 26; i++) {
      const A = land[Math.floor(hash(i * 2.3) * land.length)], B = land[Math.floor(hash(i * 5.1 + 1) * land.length)];
      const ph = ((t * 0.6 + hash(i * 9.7)) % 1);
      const mx = (A[0] + B[0]) / 2, my = Math.min(A[1], B[1]) - 60;
      const P = q => [(1 - q) ** 2 * A[0] + 2 * (1 - q) * q * mx + q * q * B[0], (1 - q) ** 2 * A[1] + 2 * (1 - q) * q * my + q * q * B[1]];
      const pts = []; for (let k = 0; k <= 12; k++) pts.push(P(Math.max(0, ph - 0.25) + k / 12 * Math.min(ph, 0.25)));
      line(pts, 'rgba(240,138,18,0.55)', 3); const h = P(ph); circ(h[0], h[1], 6); x.fillStyle = C.saf; x.fill();
    }
  });
}

function drawC(t) {
  paper(t, { c0: '#FBF4E8', c1: '#F3E8D6', c2: '#E2CFB0', gridSize: 90, gy: t * 4 });
  // slow documentary drift; gentle push-ins on key numbers
  const z = 1 + 0.04 * Math.sin(t * 0.21) + 0.06 * E.sineIO(inv(K.s73 - 0.3, K.q3, t)) * (1 - inv(K.q3, K.q3 + 1, t)) + 0.05 * E.sineIO(inv(K.s18, K.nums, t)) * (1 - inv(K.nums, K.nums + 1, t));
  withCam({ x: W / 2 + Math.sin(t * 0.13) * 20, y: H / 2 + Math.cos(t * 0.11) * 16, z }, t, () => {
    // --- 0 → 11.5: the two numbers on pinned cards
    const s1 = 1 - inv(K.nums - 0.2, K.nums + 0.6, t), s1b = inv(K.s73b - 0.4, K.s73b, t) * (1 - inv(K.stop + 0.6, K.stop + 1.2, t));
    const opening = Math.max(s1, 0);
    if (opening > 0) alpha(opening, () => {
      // calendar card (left, falls back as 18 lands)
      const back = E.cubicIO(inv(K.q3, K.s18 + 0.2, t));
      card(lerp(W / 2, 330, back), lerp(780, 700, back), 520, 560, lerp(-0.02, -0.07, back), () => {
        txt('LATE 2025', 0, -170, { size: 30, w: 700, ls: 6, color: C.mute });
        const n = Math.min(73, Math.floor(lerp(1, 73, E.cubicO(inv(0.0, 1.1, t)))));
        serifNum(String(n), '', 0, 80, 300, {}); txt('days', 0, 170, { size: 64, w: 400, fam: 'serif', it: true, color: C.safDeep });
      }, { s: lerp(1, 0.6, back) });
      if (t > K.q3 - 0.2) {
        const p = E.cubicO(inv(K.q3, K.s18 + 0.4, t));
        thread([[330, 520], [560, 640], [740, 980]], p);
        card(740, lerp(1100, 1010, E.cubicO(inv(K.s18 - 0.4, K.s18 + 0.4, t))), 520, 560, 0.03, () => {
          txt('Q3 2026', 0, -170, { size: 30, w: 700, ls: 6, color: C.mute });
          serifNum('18', '', 0, 80, 300, { color: C.safDeep }); txt('minutes', 0, 170, { size: 64, w: 400, fam: 'serif', it: true, color: INKC });
        }, { s: 0.78 * cl(inv(K.s18 - 0.5, K.s18 - 0.1, t)) + 0.0001 });
      }
    });
    // --- 11.5 → 22.5: the map, Chainalysis, 138 million, x402
    const mp = inv(K.nums - 0.3, K.nums + 0.6, t) * (1 - inv(K.most - 0.3, K.most + 0.3, t));
    if (mp > 0) {
      worldMap(mp, t);
      alpha(mp, () => {
        card(300, 470, 420, 190, -0.05, () => { txt('SOURCE', 0, -30, { size: 24, w: 700, ls: 5, color: C.mute }); txt('Chainalysis', 0, 30, { size: 58, w: 400, fam: 'serif' }); txt('Geography of Crypto, 2026', 0, 72, { size: 22, w: 600, color: C.mute }); }, { s: cl(inv(K.chain - 0.3, K.chain + 0.1, t)) + 0.0001 });
        const n = E.expoO(inv(K.n138 - 0.2, K.n138 + 1.4, t));
        if (t > K.n138 - 0.3) { save(() => { x.fillStyle = 'rgba(251,244,232,0.85)'; rr(150, 1000, 780, 240, 30); x.fill(); });
          serifNum(Math.round(138 * n) + '', 'MILLION+', W / 2, 1150, 190, { color: INKC }); txt('payments made by AI agents', W / 2, 1215, { size: 34, w: 400, fam: 'serif', it: true, color: C.mute }); }
        if (t > K.x402 - 0.2) card(800, 520, 400, 210, 0.05, () => { txt('x402', 0, 6, { size: 74, w: 600, fam: 'mono', color: C.safDeep }); txt('payment standard · Coinbase, 2025', 0, 64, { size: 21, w: 600, color: C.mute }); }, { s: cl(inv(K.x402 - 0.2, K.x402 + 0.2, t)) + 0.0001 });
        if (t > K.x402) thread([[420, 500], [600, 470], [690, 520]], inv(K.x402, K.x402 + 0.6, t));
      });
    }
    // --- 22.6 → 24.8: under ten cents
    const ct = inv(K.most - 0.2, K.most + 0.3, t) * (1 - inv(K.mach - 0.3, K.mach + 0.2, t));
    if (ct > 0) alpha(ct, () => {
      at(W / 2, 760, 1, 0, () => ILL.coin({ r: 150, spin: 0.4 + Math.sin(t * 0.8) * 0.3, label: '¢' }));
      serifNum('87%', '', W / 2, 1110, 170, { color: C.safDeep }); txt('of payments were under $0.10', W / 2, 1180, { size: 38, w: 400, fam: 'serif', it: true, color: C.mute });
    });
    // --- 24.9 → 29.9: machines paying machines
    const mm = inv(K.mach - 0.2, K.mach + 0.3, t) * (1 - inv(K.two - 0.3, K.two + 0.2, t));
    if (mm > 0) alpha(mm, () => {
      card(260, 820, 300, 360, -0.04, () => at(0, 40, 0.85, 0, () => ILL.robot({ look: 0.6, blink: t % 3 < 0.1 })), {});
      card(820, 820, 300, 360, 0.04, () => at(0, 40, 0.85, 0, () => ILL.robot({ look: -0.6, smile: true, blink: (t + 1) % 3 < 0.1 })), {});
      line([[410, 820], [670, 820]], 'rgba(198,69,44,0.7)', 3, [10, 8]);
      for (let k = 0; k < 3; k++) { const q = ((t - K.mach) * 0.7 + k / 3) % 1; at(lerp(410, 670, q), 820 - Math.sin(q * Math.PI) * 40, 0.5, 0, () => ILL.coin({ r: 34, spin: q * 8 })); }
      [['data', K.data, -0.06], ['computing', 27.97, 0.04], ['code reviews', 28.87, -0.03]].forEach(([s, st, r], i) => {
        if (t > st - 0.1) card(250 + i * 290, 1130, 250, 100, r, () => txt(s, 0, 14, { size: 40, w: 400, fam: 'serif', it: true }), { s: E.backO(inv(st - 0.1, st + 0.25, t)) + 0.0001, pin: true });
      });
    });
    // --- 30.1 → 34.2: within an hour, 4% → 67%
    const hr = inv(K.two - 0.2, K.two + 0.3, t) * (1 - inv(K.nobody - 0.2, K.nobody + 0.2, t));
    if (hr > 0) alpha(hr, () => {
      card(W / 2, 830, 760, 640, -0.01, () => {
        txt('Wallets that spend within an hour of funding', 0, -250, { size: 30, w: 600, color: C.mute });
        const g1 = E.cubicO(inv(K.two + 0.3, K.two + 1.2, t)), g2 = E.cubicO(inv(K.two + 1.0, K.two + 2.4, t));
        const base = 200, maxh = 380;
        rr(-230, base - maxh * 0.04 * g1, 160, maxh * 0.04 * g1, 8); fillStroke(C.line, INKC, 3);
        rr(70, base - maxh * 0.67 * g2, 160, maxh * 0.67 * g2, 8); fillStroke(C.saf, INKC, 3);
        line([[-300, base], [300, base]], INKC, 3);
        txt('4%', -150, base - maxh * 0.04 * g1 - 24, { size: 64, w: 400, fam: 'serif', it: true, a: g1 });
        txt('67%', 150, base - maxh * 0.67 * g2 - 24, { size: 84, w: 400, fam: 'serif', it: true, color: C.safDeep, a: g2 });
        txt('Q3 2025', -150, base + 52, { size: 26, w: 700, ls: 3, color: C.mute }); txt('Q3 2026', 150, base + 52, { size: 26, w: 700, ls: 3, color: C.mute });
      });
    });
    // --- 34.3 → 36.2: nobody is clicking approve
    const nb = inv(K.nobody - 0.2, K.nobody + 0.2, t) * (1 - inv(K.tiny - 0.3, K.tiny + 0.1, t));
    if (nb > 0) alpha(nb, () => {
      at(W / 2, 820, 1, -0.12, () => { rr(-280, -90, 560, 180, 16); fillStroke(null, 'rgba(198,69,44,0.75)', 10); txt('APPROVE', 0, 34, { size: 104, w: 800, color: 'rgba(198,69,44,0.75)', ls: 6 }); });
      txt('no one at the desk', W / 2, 1060, { size: 46, w: 400, fam: 'serif', it: true, color: C.mute, a: inv(35.0, 35.5, t) });
    });
    // --- 36.3 → 43.4: the caveats, as footnotes
    const cv = inv(K.tiny - 0.2, K.tiny + 0.2, t) * (1 - inv(K.but - 0.3, K.but + 0.2, t));
    if (cv > 0) alpha(cv, () => {
      txt('What the numbers don’t say', W / 2, 560, { size: 62, w: 400, fam: 'serif', it: true });
      line([[260, 600], [820, 600]], C.saf, 3);
      [['1', 'The payments are tiny.', K.tiny], ['2', 'Total dollar value: not disclosed.', K.total], ['3', 'A count is not demand.', K.count]].forEach(([n, s, st], i) => {
        const q = E.cubicO(inv(st - 0.1, st + 0.4, t));
        alpha(q, () => { txt(n, 190, 760 + i * 150, { size: 60, w: 400, fam: 'serif', it: true, color: C.safDeep, align: 'left' }); txt(s, 260, 760 + i * 150 + (1 - q) * 10, { size: 46, w: 400, fam: 'serif', align: 'left' }); });
      });
    });
    // --- 43.5 → 45.9: a new kind of customer: lotus draws over a rising sun
    const lo = inv(K.but - 0.3, K.but + 0.3, t) * (1 - inv(K.s73b - 0.4, K.s73b, t));
    if (lo > 0) alpha(lo, () => {
      const r = E.cubicO(inv(K.but, K.s73b, t));
      save(() => { x.beginPath(); x.rect(0, 0, W, 1000); x.clip(); circ(W / 2, 1000 - r * 160, 210); fillStroke('rgba(240,138,18,0.28)', null, 0); });
      line([[200, 1000], [880, 1000]], INKC, 3);
      at(W / 2, 960, 2.4, 0, () => ILL.lotusLine({ p: inv(K.but, K.s73b - 0.2, t), color: C.safDeep, lw: 3 }));
    });
    // --- 45.97 → end: both numbers side by side, then the line
    if (s1b > 0) alpha(s1b, () => {
      card(310, 760, 420, 460, -0.05, () => { txt('LATE 2025', 0, -150, { size: 26, w: 700, ls: 6, color: C.mute }); serifNum('73', '', 0, 60, 230); txt('days', 0, 140, { size: 54, w: 400, fam: 'serif', it: true, color: C.safDeep }); });
      if (t > K.s18b - 0.2) { card(770, 790, 420, 460, 0.04, () => { txt('Q3 2026', 0, -150, { size: 26, w: 700, ls: 6, color: C.mute }); serifNum('18', '', 0, 60, 230, { color: C.safDeep }); txt('minutes', 0, 140, { size: 54, w: 400, fam: 'serif', it: true }); }, { s: E.backO(inv(K.s18b - 0.2, K.s18b + 0.2, t)) + 0.0001 });
        thread([[400, 700], [560, 640], [690, 720]], inv(K.s18b, K.s18b + 0.6, t)); }
    });
  }, 0.7);
  // end card (screen space)
  const ec = inv(K.stop + 0.8, K.stop + 1.3, t);
  if (ec > 0) alpha(ec, () => {
    x.fillStyle = 'rgba(251,244,232,0.94)'; x.fillRect(0, 0, W, H);
    img('logo', W / 2, 760, 300);
    txt('The machines have stopped waiting.', W / 2, 1000, { size: 56, w: 400, fam: 'serif', it: true });
    txt('Source: Chainalysis via CoinDesk, Blockhead · Oct 2026', W / 2, 1090, { size: 26, w: 500, color: C.mute });
  });
  // series mark
  txt('THE BRIEF', W / 2, 165, { size: 26, w: 700, ls: 10, color: C.mute });
  line([[W / 2 - 40, 190], [W / 2 + 40, 190]], C.saf, 3);
  if (ec < 0.5) capC(t);
  grainOver(t); grainOver(t + 0.5); vignette(0.26);
}
