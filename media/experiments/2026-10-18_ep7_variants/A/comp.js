// Variant A · "The Loop" — kinetic, fast, ends where it starts.
'use strict';
const KEYS = new Set(['73', 'days.', '18', 'minutes.', '138', 'million', '10', 'cents.', 'Data.', 'computing', 'power.', 'code', 'checks.', 'approve.', 'Two', 'three', 'hour', 'catch:', 'tiny,', 'count', 'demand.', 'Not', 'yet.', 'shopping.', 'wait?']);
const HIDE = new Set([0, 17]);
const T = { // beat times (s) from the tightened VO
  now: 7.06, eighteen: 7.86, chain: 9.24, n138: 10.64, under: 14.7, data: 16.64, comp: 17.28, code: 18.52,
  human: 19.37, two: 21.47, catchT: 25.09, notyet: 29.79, but: 30.83, remember: 32.91, end: 35.0
};
let G;
window.COMP = {
  dur: T.end,
  init() { G = capGroups(WORDS, 3, [1, 15, 18, 28, 33, 38, 43, 55, 61, 69]); },
  draw(t) { drawA(t); }
};

function brand(t) {
  img('logo', 104, 150, 58);
  txt('THE BRIEF', 146, 162, { size: 30, w: 800, align: 'left', ls: 5 });
  txt('BY OMNIX', 160 + tw('THE BRIEF', 30, 800, 'sans', false, 5), 162, { size: 30, w: 600, align: 'left', ls: 5, color: C.saf });
}

// big number with "odometer" flip from a -> b (strings, same length) at time t0
function bigNumber(t, X, Y, size, from, to, t0, dur = 0.42) {
  const chars = Math.max(from.length, to.length); const cw = size * 0.62;
  for (let i = 0; i < chars; i++) {
    const a = from[i] || '', b = to[i] || '';
    const p = E.expoO(inv(t0 + i * 0.05, t0 + i * 0.05 + dur, t));
    const cx = X + (i - (chars - 1) / 2) * cw;
    save(() => {
      x.beginPath(); x.rect(cx - cw / 2 - 10, Y - size * 0.86, cw + 20, size * 1.02); x.clip();
      if (p < 1) txt(a, cx, Y - p * size, { size, w: 900, color: C.ink, a: 1 - p * 0.6 });
      if (p > 0) txt(b, cx, Y + (1 - p) * size, { size, w: 900, color: C.ink });
    });
  }
}

function pill(s, X, Y, size, bg, fg, a = 1, sc = 1) {
  const w = tw(s, size, 800, 'sans', false, 4) + size * 1.1, h = size * 1.55;
  alpha(a, () => at(X, Y, sc, 0, () => { rr(-w / 2, -h / 2, w, h, h / 2); fillStroke(bg, null, 0); txt(s, 0, size * 0.36, { size, w: 800, color: fg, ls: 4 }); }));
}

function captions(t) {
  const k = activeGroup(G, WORDS, t); if (k < 0) return;
  const [a, b] = G[k];
  if (HIDE.has(a)) return; /* the picture already says these words */ const size = 88, gap = 24, maxw = 940;
  // layout words into lines
  const ws = []; for (let i = a; i <= b; i++) ws.push({ i, s: WORDS[i][0], w: tw(WORDS[i][0], size, 800) });
  const lines = [[]]; let lw = 0;
  for (const w of ws) { if (lw + w.w > maxw && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.w + gap; }
  const baseY = 1390 - (lines.length - 1) * 54;
  const gin = E.cubicO(inv(WORDS[a][1] - 0.06, WORDS[a][1] + 0.12, t));
  lines.forEach((L, li) => {
    const tot = L.reduce((s, w) => s + w.w, 0) + gap * (L.length - 1); let cx = W / 2 - tot / 2;
    L.forEach(w => {
      const st = WORDS[w.i][1]; const on = t >= st - 0.04;
      const sp = spring(t - st + 0.04, 3.2, 0.5); const key = KEYS.has(w.s);
      const Y = baseY + li * 108;
      const col = key && on ? C.saf : C.ink;
      const pop = on ? (key ? 0.82 + 0.18 * sp : 0.9 + 0.1 * sp) : 0.9;
      alpha(on ? 1 : 0.18, () => at(cx + w.w / 2, Y - (on ? (1 - sp) * 18 : 0), pop, 0, () => {
        if (key && on) { // marker swipe behind keyword
          const q = E.expoO(inv(st, st + 0.25, t));
          save(() => { x.fillStyle = 'rgba(240,138,18,0.16)'; rr(-w.w / 2 - 10, -size * 0.72, (w.w + 20) * q, size * 0.95, 14); x.fill(); });
        }
        txt(w.s, 0, 0, { size, w: 800, color: col });
      }));
      cx += w.w + gap;
    });
  });
  // fade whole group in quickly at start
  void gin;
}

// ---- scene pieces ----
function waitingScene(t, a) { // robot on a bench beside a wallet, calendar tearing
  alpha(a, () => at(540, 1100, 1.25, 0, () => { x.translate(-540, -1100);
    const lt = t;
    shadow(540, 1255, 520, 26, 0.10);
    // bench
    rr(270, 1150, 540, 26, 12); fillStroke('#D9BE92', C.ink, 6); line([[310, 1176], [310, 1250]], C.ink, 10); line([[770, 1176], [770, 1250]], C.ink, 10);
    const tap = Math.sin(lt * 9) * 0.5 + 0.5;
    at(430, 1000, 0.95, 0, () => ILL.robot({ blink: (lt % 2.6) < 0.12, look: 0.6, bob: -tap * 4, armL: 0.1 }));
    at(660, 1100, 0.6, -0.12, () => ILL.wallet({ open: 0 }));
    // tearing calendar pages counter
    const days = Math.min(73, Math.floor(lerp(1, 73, E.sineIO(inv(1.9, 6.4, t)))));
    at(820, 760, 0.62, 0.06, () => { ILL.calendar(); txt(String(days), 0, 70, { size: 96, w: 900 }); });
  }));
}

function dotField(t, a) { // 138M payments: dots flood in on a grid
  alpha(a, () => {
    const cols = 26, rows = 18, s = 34, ox = W / 2 - (cols - 1) * s / 2, oy = 520;
    const fill = E.cubicIO(inv(T.chain + 0.3, T.n138 + 1.3, t));
    const n = Math.floor(fill * cols * rows);
    for (let i = 0; i < cols * rows; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const order = (hash(i * 3.1) * 0.35 + r / rows * 0.65);
      const on = order < fill;
      const pop = on ? 1 : 0.35;
      circ(ox + c * s, oy + r * s, 9 * pop * (on && fill >= 1 ? 0.8 + 0.25 * Math.sin(t * 5 + i * 1.7) : 1)); x.fillStyle = on ? (hash(i) < 0.87 ? C.saf : C.ink) : 'rgba(31,26,21,0.12)'; x.fill();
    }
    void n;
  });
}

function counter(t, X, Y, a) {
  const v = Math.floor(138000000 * E.expoO(inv(T.n138 - 0.3, T.n138 + 1.4, t)));
  const s = v.toLocaleString('en-US') + (v >= 138000000 ? '+' : '');
  alpha(a, () => { save(() => { x.fillStyle = 'rgba(245,236,221,0.92)'; rr(X - 400, Y - 150, 800, 230, 40); x.fill(); x.strokeStyle = C.ink; x.lineWidth = 6; x.stroke(); });
    txt(s, X, Y + 6, { size: 112, w: 900, color: C.ink });
    txt('PAYMENTS BY AI AGENTS', X, Y + 62, { size: 30, w: 700, color: C.mute, ls: 4 }); });
}

function sourceChip(s, X, Y, a) { alpha(a, () => { const w = tw(s, 26, 600, 'sans', false, 2) + 48; rr(X - w / 2, Y - 26, w, 52, 26); fillStroke(C.ink, null, 0); txt(s, X, Y + 9, { size: 26, w: 600, color: C.paper, ls: 2 }); }); }

function drawA(t) {
  paper(t, { gy: t * 14 });
  // ---------- hero numerals 0 → 9.2 (and the loop return 33.6 → end) ----------
  const heroIn = 1 - E.cubicIO(inv(T.chain - 0.3, T.chain + 0.5, t));
  const heroBack = E.expoO(inv(T.remember + 1.0, T.remember + 1.6, t));
  const hero = Math.max(heroIn, heroBack);
  const kk = kick(t, T.eighteen, 22, 0.5), kb = kick(t, T.remember + 1.2, 14, 0.4);
  // camera: start tight on the number, pull back to reveal the waiting robot, snap back on "Now?"
  const z = track([[0, 1.0], [1.8, 1.0], [3.2, 0.92, 'cubicIO'], [6.8, 0.9], [T.now + 0.1, 1.04, 'expoO'], [T.eighteen, 1.04], [T.eighteen + 0.5, 1.0, 'expoO']], t);
  withCam({ x: W / 2 + kk[0] + kb[0], y: H / 2 + kk[1] + kb[1], z }, t, () => {
    // waiting scene sits under the numerals
    const wait = cl(inv(1.7, 2.3, t)) * (1 - inv(T.now - 0.1, T.now + 0.15, t));
    waitingScene(t, wait);
    const waitBack = inv(T.remember, T.remember + 0.5, t) * (1 - inv(T.remember + 0.95, T.remember + 1.25, t));
    waitingScene(t - T.remember + 2.0, waitBack);
    if (hero > 0) alpha(hero, () => {
      const lift = track([[0, 0], [1.75, 0], [2.4, -330, 'expoO'], [T.now - 0.1, -330], [T.now + 0.25, 0, 'expoO']], t);
      const sc = track([[0, 1], [1.75, 1], [2.4, 0.5, 'expoO'], [T.now - 0.1, 0.5], [T.now + 0.25, 1, 'expoO']], t);
      const backAt = T.remember + 1.0;
      const isBack = t >= backAt;
      const ly = isBack ? 0 : lift, ls = isBack ? 1 : sc;
      at(W / 2, 830 + ly, ls, 0, () => {
        const from = '73', to = '18';
        if (isBack) bigNumber(t, 0, 140, 560, '18', '73', backAt, 0.4);
        else bigNumber(t, 0, 140, 560, from, to, T.eighteen);
        const isMin = !isBack && t >= T.eighteen + 0.1;
        pill(isMin ? 'MINUTES' : 'DAYS', 0, 300, 62, isMin ? C.saf : C.ink, isMin ? C.ink : C.paper, 1, isMin ? 0.8 + 0.2 * spring(t - T.eighteen - 0.1, 3, 0.4) : 1);
        // stopwatch zip on the flip
        const zz = inv(T.eighteen - 0.05, T.eighteen + 0.9, t) * (1 - inv(T.chain - 0.4, T.chain, t));
        if (!isBack && zz > 0) alpha(Math.min(1, zz * 4), () => at(330, -260, 0.55, 0, () => ILL.stopwatch({ r: 110, sweep: E.expoO(zz) * 0.3 })));
      });
    });
    // "Now?" hush: soft saffron ring breathing behind
    const hush = inv(T.now - 0.05, T.now + 0.2, t) * (1 - inv(T.eighteen - 0.05, T.eighteen + 0.05, t));
    if (hush > 0) alpha(hush * 0.5, () => { circ(W / 2, 970, 420 + Math.sin(t * 6) * 6); fillStroke(null, C.saf, 4); });

    // ---------- 138M dots + counter 9.2 → 14.6 ----------
    const dotsA = inv(T.chain - 0.1, T.chain + 0.3, t) * (1 - inv(T.under - 0.1, T.under + 0.35, t));
    if (dotsA > 0) { dotField(t, dotsA); counter(t, W / 2, 830, Math.min(1, inv(T.n138 - 0.4, T.n138 - 0.1, t)) * dotsA);
      sourceChip('Chainalysis · AI-agent payments on x402', W / 2, 1165, inv(T.chain + 0.2, T.chain + 0.6, t) * dotsA);
      // the 18-minute badge carried from the hero, parked top-right
      alpha(dotsA, () => pill('18 MIN', 900, 300, 30, C.saf, C.ink));
    }
    // ---------- under 10 cents 14.7 → 16.6 ----------
    const coinA = inv(T.under - 0.15, T.under + 0.2, t) * (1 - inv(T.data - 0.1, T.data + 0.1, t));
    if (coinA > 0) alpha(coinA, () => {
      const sp = spring(t - T.under + 0.1, 2.2, 0.45);
      at(W / 2, 840, 0.4 + 0.6 * sp, 0, () => ILL.coin({ r: 215, spin: (t - T.under) * 5 }));
      const ring = E.cubicO(inv(T.under + 0.4, T.under + 1.5, t)) * 0.87;
      save(() => { x.beginPath(); x.arc(W / 2, 840, 275, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); x.strokeStyle = C.ink; x.lineWidth = 22; x.lineCap = 'round'; x.stroke(); });
      txt(`${Math.round(ring * 100)}%`, W / 2, 1230, { size: 92, w: 900 });
      txt('UNDER 10¢', W / 2, 1282, { size: 34, w: 700, color: C.mute, ls: 5 });
    });
    // ---------- what it buys 16.6 → 19.3 (three snaps, coins fly) ----------
    const buyA = inv(T.data - 0.1, T.data + 0.05, t) * (1 - inv(T.human - 0.15, T.human + 0.1, t));
    if (buyA > 0) alpha(buyA, () => {
      const items = [[T.data, ILL.globe, 'DATA', 260], [T.comp, ILL.chip, 'COMPUTE', 540], [T.code, ILL.codecheck, 'CODE CHECK', 820]];
      items.forEach(([st, fn, lab, X], i) => {
        const sp = spring(t - st, 3.0, 0.42); if (t < st - 0.02) return;
        const Y = 830;
        at(X, Y - (1 - sp) * 60, sp, 0, () => { rr(-125, -150, 250, 300, 34); fillStroke(C.white, C.ink, 7); at(0, -30, 0.95, 0, fn); txt(lab, 0, 110, { size: 28, w: 800, ls: 2 }); });
        // coin arcs from bottom robot into the card
        const q = inv(st + 0.05, st + 0.45, t);
        if (q > 0 && q < 1) { const sx = 610, sy = 1190; const cx = lerp(sx, X, q), cy = lerp(sy, Y - 40, q) - Math.sin(q * Math.PI) * 220; at(cx, cy, 0.7, 0, () => ILL.coin({ r: 34, spin: q * 12 })); }
        if (q >= 1) at(X + 90, Y - 130, 0.6, 0, () => ILL.check({ p: E.cubicO(inv(st + 0.45, st + 0.7, t)) }));
      });
      at(540, 1190, 0.78, 0, () => ILL.robot({ arm: Math.abs(Math.sin((t - T.data) * 5)) * 0.8, look: 0, smile: true, blink: (t % 2.2) < 0.1 }));
    });
    // ---------- no human approving 19.37 → 21.4 ----------
    const appA = inv(T.human - 0.1, T.human + 0.15, t) * (1 - inv(T.two - 0.15, T.two + 0.1, t));
    if (appA > 0) alpha(appA, () => {
      at(W / 2, 760, 1.25, 0, () => ILL.approveBtn({ strike: E.expoO(inv(20.27, 20.75, t)) }));
      // the human hand drifts away, ignored
      const hx = track([[T.human, 0], [20.6, 0], [21.3, 340, 'cubicIO']], t);
      at(640 + hx, 860 + hx * 0.4, 1.3, -0.2, () => alpha(1 - inv(20.6, 21.3, t), () => ILL.hand()));
      // coins keep flowing right under the button
      for (let k = 0; k < 6; k++) { const q = ((t - T.human) * 1.4 + k / 6) % 1; at(lerp(120, 960, q), 1110 - Math.sin(q * Math.PI) * 90, 0.5, 0, () => ILL.coin({ r: 36, spin: q * 10 + k })); }
    });
    // ---------- two in three within an hour 21.47 → 24.9 ----------
    const twoA = inv(T.two - 0.1, T.two + 0.15, t) * (1 - inv(T.catchT - 0.15, T.catchT + 0.15, t));
    if (twoA > 0) alpha(twoA, () => {
      [270, 540, 810].forEach((X, i) => {
        const lit = i < 2 && t > 21.77 + i * 0.18; const sp = spring(t - (T.two + i * 0.12), 3, 0.5);
        at(X, 760 + (1 - sp) * 40, 0.72 * sp, 0, () => { if (lit) { circ(0, -20, 150); fillStroke('rgba(240,138,18,0.20)', null, 0); } ILL.robot({ arm: lit ? 0.7 : 0, smile: lit, blink: !lit }); });
      });
      const h = E.cubicIO(inv(23.3, 24.6, t));
      at(W / 2, 1110, 0.62, 0, () => ILL.stopwatch({ r: 120, sweep: h }));
      txt('within 1 hour', W / 2, 1265, { size: 46, w: 700, color: C.mute, a: inv(23.4, 23.8, t) });
    });
    // ---------- the catch 25.09 → 30.6 ----------
    const caA = inv(T.catchT - 0.1, T.catchT + 0.3, t) * (1 - inv(T.but - 0.2, T.but + 0.1, t));
    if (caA > 0) alpha(caA, () => {
      // a tiny coin on a big scale vs a weight marked "demand?"
      const tilt = track([[T.catchT, 0], [26.6, 0.0], [27.6, 0.16, 'backO']], t);
      at(W / 2, 930, 1, 0, () => {
        line([[0, 0], [0, 260]], C.ink, 12); rr(-90, 250, 180, 30, 10); fillStroke(C.ink, null, 0);
        save(() => { x.rotate(tilt); line([[-330, 0], [330, 0]], C.ink, 12);
          for (const s of [-1, 1]) { line([[s * 300, 0], [s * 300 - 70, 120]], C.ink, 4); line([[s * 300, 0], [s * 300 + 70, 120]], C.ink, 4);
            x.beginPath(); x.moveTo(s * 300 - 90, 120); x.lineTo(s * 300 + 90, 120); x.quadraticCurveTo(s * 300, 170, s * 300 - 90, 120); fillStroke('#E9D5B5', C.ink, 5); }
          at(-300, 98, 1, -tilt, () => ILL.coin({ r: 20 })); // the tiny payment
          at(300, 60, 1, -tilt, () => { rr(-80, -70, 160, 130, 20); fillStroke(C.ink, null, 0); txt('DEMAND?', 0, 8, { size: 30, w: 800, color: C.paper, ls: 2 }); });
        });
        circ(0, 0, 18); fillStroke(C.saf, C.ink, 5);
      });
      const nq = inv(27.4, 27.9, t);
      txt('count ≠ demand', W / 2, 700, { size: 76, w: 800, a: nq });
      if (t > T.notyet) pill('NOT YET', W / 2, 600, 40, C.ink, C.paper, inv(T.notyet, T.notyet + 0.2, t));
    });
    // ---------- machines have started shopping 30.83 → 32.9 ----------
    const shA = inv(T.but - 0.1, T.but + 0.2, t) * (1 - inv(T.remember - 0.1, T.remember + 0.3, t));
    if (shA > 0) alpha(shA, () => {
      const wx = lerp(-140, 1220, inv(T.but - 0.1, T.remember + 0.6, t));
      // shop fronts sliding by
      for (let i = 0; i < 4; i++) at(((i * 330 - (t - T.but) * 260) % 1320 + 1320) % 1320 - 100, 860, 0.85, 0, () => ILL.stall({ w: 280, h: 340, label: ['DATA', 'GPU', 'API', 'CODE'][i], color: i % 2 ? C.sage : C.saf }));
      rr(0, 1100, W, 18, 0); fillStroke(C.ink, null, 0);
      at(wx, 960 + Math.abs(Math.sin(t * 7)) * -12, 0.62, 0, () => ILL.robot({ arm: 0.5, smile: true, holdCoin: true, coinSpin: t * 6, look: 0.5 }));
    });
  }, 1);
  brand(t);
  captions(t);
  grainOver(t);
  vignette(0.12);
}
