// Variant B · "The Story" — a robot with pocket money walks a Bengaluru street of tiny shops.
'use strict';
const KEYS = new Set(['robot', 'pocket', 'money.', '73', 'days', '18', 'minutes.', 'buy?', 'data,', 'computing', 'power,', 'code.', '10', 'cents,', 'approve.', 'toll', 'gate.', 'pay', 'first.', 'opens.', 'x402,', '138', 'million', 'catch:', 'tiny,', 'count', 'demand.', 'builders.', 'few', 'cents,', 'customer.', 'Pocket', 'money,']);
const B = { home: 0.0, late: 2.56, s73: 5.86, now: 9.06, s18: 9.69, buy: 11.09, data: 12.41, comp: 13.36, code: 14.52, most: 16.08, human: 19.87,
  toll: 21.84, shop: 23.27, pays: 25.07, opens: 26.57, std: 27.3, chain: 29.9, n138: 31.8, catchT: 34.86, but: 39.75, ifm: 41.51, pocket: 45.56, end: 49.4 };
let G;
window.COMP = { dur: B.end, init() { G = capGroups(WORDS, 4, [5, 21, 29, 33, 39, 50, 55, 61, 66, 73, 78, 88, 94, 102, 108, 117, 122]); }, draw(t) { drawB(t); } };

// world x positions of places along the street
const X = { home: 540, data: 2100, comp: 2700, code: 3300, desk: 4000, gate: 4900, build: 6900, end: 7700 };
// robot x through time (walks between places)
const RX = [[0, X.home], [B.s18 + 0.4, X.home], [B.data - 0.2, X.data - 160, 'cubicIO'], [B.comp - 0.35, X.data - 160], [B.comp - 0.05, X.comp - 160, 'cubicIO'], [B.code - 0.35, X.comp - 160], [B.code - 0.05, X.code - 160, 'cubicIO'],
  [B.most + 1.6, X.code - 160], [B.human - 0.5, X.desk - 320, 'cubicIO'], [B.toll + 0.2, X.gate - 420, 'cubicIO'], [B.pays + 0.6, X.gate - 420], [B.opens + 1.0, X.gate + 230, 'cubicIO'],
  [B.but, X.gate + 230], [B.ifm + 0.3, X.build - 260, 'cubicIO'], [B.end, X.build + 300]];
const walking = t => { const a = track(RX, t - 0.05), b = track(RX, t + 0.05); return Math.min(1, Math.abs(b - a) * 4 / 100); };

function sky(t, cx) {
  // days passing: sun and moon race across the sky during the 73-day wait
  const spin = t < B.late ? 0 : (t < B.s18 ? E.sineIO(inv(B.late, B.s73 + 1.6, t)) * 18 : 18);
  const ang = spin * Math.PI;
  for (const [k, col] of [[0, C.saf], [1, '#E7DCC6']]) {
    const a = ang + k * Math.PI, sx = W / 2 + Math.cos(a + Math.PI) * 360, sy = 600 - Math.sin(a) * 300;
    if (Math.sin(a) > -0.15) save(() => { circ(sx, sy, k ? 42 : 56); fillStroke(col, C.ink, 5); if (k) { circ(sx + 16, sy - 10, 34); x.fillStyle = '#F5ECDD'; x.fill(); } });
  }
  // birds (subtle nature)
  for (let i = 0; i < 3; i++) { const bx = ((t * 60 + i * 300 - cx * 0.1) % 1400) - 150, by = 420 + i * 40 + Math.sin(t * 2 + i) * 10; const f = Math.sin(t * 9 + i) * 10;
    line([[bx - 22, by - f], [bx, by], [bx + 22, by - f]], C.ink, 4); }
}
function skyline(cx) { // far layer, parallax 0.2
  save(() => { x.translate(-cx * 0.2, 0); x.fillStyle = '#E6D6BB';
    for (let i = -2; i < 30; i++) { const w = 120 + hash(i) * 120, h = 160 + hash(i + 9) * 260, X0 = i * 200; x.fillRect(X0, 1040 - h, w, h); if (hash(i + 3) > 0.7) { circ(X0 + w / 2, 1040 - h, w * 0.32); x.fill(); } } });
}
function tree(X0, Y0, s = 1) { at(X0, Y0, s, 0, () => { line([[0, 0], [0, -150]], '#6B5A45', 18); circ(-40, -170, 70); fillStroke('#9DB38E', C.ink, 5); circ(40, -190, 78); fillStroke('#AFC39F', C.ink, 5); circ(0, -240, 70); fillStroke('#9DB38E', C.ink, 5);
  for (let i = 0; i < 6; i++) { circ(-60 + i * 25, -200 + (i % 2) * 40, 8); x.fillStyle = C.saf; x.fill(); } }); } // gulmohar-ish blossoms

function priceTag(s, X0, Y0, a = 1, rot = -0.08) { alpha(a, () => at(X0, Y0, 1, rot, () => { rr(-70, -32, 140, 64, 14); fillStroke(C.saf2, C.ink, 5); circ(-50, 0, 7); fillStroke(C.paper, C.ink, 3); txt(s, 10, 13, { size: 36, w: 800 }); })); }

function capB(t) {
  const k = activeGroup(G, WORDS, t); if (k < 0) return;
  const [a, b] = G[k]; const size = 66, gap = 16;
  const ws = []; for (let i = a; i <= b; i++) ws.push({ i, s: WORDS[i][0], w: tw(WORDS[i][0], size, 800) });
  const tot = ws.reduce((s, w) => s + w.w, 0) + gap * (ws.length - 1);
  const twoLines = tot > 860; const lines = twoLines ? [ws.slice(0, Math.ceil(ws.length / 2)), ws.slice(Math.ceil(ws.length / 2))] : [ws];
  const st0 = WORDS[a][1]; const sp = spring(t - st0 + 0.05, 2.6, 0.55);
  const bw = Math.max(...lines.map(L => L.reduce((s, w) => s + w.w, 0) + gap * (L.length - 1))) + 70, bh = lines.length * 92 + 40;
  const Y = 1420;
  at(W / 2, Y, 0.9 + 0.1 * sp, (1 - sp) * 0.03, () => {
    save(() => { x.fillStyle = 'rgba(31,26,21,0.18)'; rr(-bw / 2 + 8, -bh / 2 + 10, bw, bh, 34); x.fill(); });
    rr(-bw / 2, -bh / 2, bw, bh, 34); fillStroke(C.white, C.ink, 6);
    lines.forEach((L, li) => {
      const lw = L.reduce((s, w) => s + w.w, 0) + gap * (L.length - 1); let cx = -lw / 2;
      L.forEach(w => { const on = t >= WORDS[w.i][1] - 0.05; const key = KEYS.has(w.s);
        txt(w.s, cx + w.w / 2, -bh / 2 + 20 + 70 + li * 92 - 6, { size, w: 800, color: on ? (key ? C.safDeep : C.ink) : 'rgba(31,26,21,0.22)' }); cx += w.w + gap; });
    });
  });
}

function drawB(t) {
  const rx = track(RX, t);
  // camera follows the robot with a little lag; pulls up to an aerial view for the 138M beat
  const camx = track(RX, t - 0.18) + track([[0, 0], [B.human - 0.9, 0], [B.human - 0.2, 170], [B.toll - 0.4, 170], [B.toll + 0.4, 250], [B.opens + 0.3, 250], [B.std + 0.4, 0]], t);
  const aerial = E.cubicIO(inv(B.chain - 0.2, B.chain + 1.2, t)) * (1 - E.cubicIO(inv(B.catchT - 0.4, B.catchT + 0.4, t)));
  const zoom = lerp(1.32, 0.34, aerial) * (1 + 0.06 * E.sineIO(inv(B.now - 0.1, B.now + 0.3, t)) * (1 - inv(B.s18, B.s18 + 0.3, t)));
  const kk = kick(t, B.s18, 16, 0.45), kg = kick(t, B.opens, 10, 0.4);
  paper(t, { gx: -camx * 0.5, grid: true });
  sky(t, camx);
  withCam({ x: camx + kk[0] + kg[0], y: 985 + kk[1] - aerial * 260, z: zoom }, t, () => {
    skyline(camx);
    // ground + road
    x.fillStyle = '#E3D2B4'; x.fillRect(-6000, 1200, 22000, 6000); line([[-2000, 1200], [12000, 1200]], C.ink, 7);
    for (let i = -10; i < 120; i++) { rr(i * 140, 1290, 70, 12, 6); x.fillStyle = 'rgba(31,26,21,0.25)'; x.fill(); }
    // trees between places
    [1300, 1750, 3650, 4450, 5600, 6300].forEach((tx, i) => tree(tx, 1200, 0.9 + hash(i) * 0.2));
    // home: bench + calendar
    at(X.home, 0, 1, 0, () => { x.translate(-X.home, 0);
      rr(X.home - 230, 1110, 460, 24, 12); fillStroke('#D9BE92', C.ink, 6); line([[X.home - 190, 1134], [X.home - 190, 1200]], C.ink, 10); line([[X.home + 190, 1134], [X.home + 190, 1200]], C.ink, 10);
      const days = Math.min(73, Math.max(1, Math.floor(lerp(1, 73, E.sineIO(inv(B.late + 0.4, B.s73 + 0.1, t))))));
      at(X.home + 330, 820, 0.8, 0.05, () => { ILL.calendar(); txt(t < B.late ? '—' : String(days), 0, 70, { size: 96, w: 900, color: days === 73 ? C.safDeep : C.ink }); });
    });
    // stalls
    const stalls = [[X.data, 'LIVE DATA', ILL.globe, C.saf, B.data], [X.comp, 'COMPUTE', ILL.chip, C.sage, B.comp], [X.code, 'CODE CHECK', ILL.codecheck, C.saf, B.code]];
    stalls.forEach(([sx, lab, ic, col, st]) => {
      at(sx, 980, 1, 0, () => ILL.stall({ w: 380, h: 440, label: lab, labelSize: 40, icon: ic, iconScale: 0.85, color: col }));
      priceTag('<10¢', sx + 150, 860, inv(B.most, B.most + 0.3, t) * 1, -0.1);
      // purchase: coin hops from robot into stall, a little parcel hops back
      const q = inv(st + 0.15, st + 0.6, t);
      if (q > 0 && q < 1) at(lerp(sx - 160, sx, q), 1010 - Math.sin(q * Math.PI) * 180, 0.8, 0, () => ILL.coin({ r: 34, spin: q * 12 }));
      if (t > st + 0.6) at(sx + 130, 760, 0.75, 0, () => ILL.check({ p: E.cubicO(inv(st + 0.6, st + 0.85, t)) }));
    });
    // the empty approver's desk
    at(X.desk, 1200, 1, 0, () => {
      rr(-170, -170, 340, 30, 10); fillStroke('#C9A878', C.ink, 6); line([[-140, -140], [-140, 0]], C.ink, 10); line([[140, -140], [140, 0]], C.ink, 10);
      rr(160, -260, 120, 150, 20); fillStroke('#E9D5B5', C.ink, 6); line([[180, -110], [180, 0]], C.ink, 8); line([[260, -110], [260, 0]], C.ink, 8); // empty chair
      at(-40, -230, 0.55, 0, () => ILL.approveBtn({ strike: E.expoO(inv(20.67, 21.1, t)) }));
      rr(-110, -420, 220, 90, 14); fillStroke(C.white, C.ink, 5); txt('BACK IN', 0, -380, { size: 30, w: 800 }); txt('73 DAYS', 0, -346, { size: 30, w: 800, color: C.safDeep });
    });
    // toll gate
    const lift = E.backO(inv(B.opens - 0.35, B.opens + 0.25, t)) * (1 - inv(B.std + 1.0, B.std + 1.6, t) * 0);
    at(X.gate, 1080, 1, 0, () => ILL.gate({ lift, sign: t > B.std + 0.2 ? 'x402' : '402 · PAY FIRST', signColor: t > B.std + 0.2 ? C.safDeep : C.ink }));
    const pq = inv(B.pays, B.pays + 0.5, t);
    if (pq > 0 && pq < 1) at(lerp(X.gate - 330, X.gate - 20, pq), 1000 - Math.sin(pq * Math.PI) * 160, 0.8, 0, () => ILL.coin({ r: 34, spin: pq * 12 }));
    // builder's shop at the end: "machine payments accepted" sticker
    at(X.build, 980, 1, 0, () => { ILL.stall({ w: 440, h: 460, label: 'YOUR SHOP', labelSize: 44, color: C.sage, icon: () => { rr(-90, -60, 180, 120, 18); fillStroke(C.white, C.ink, 5); txt('OPEN', 0, 16, { size: 44, w: 800 }); }, iconScale: 0.9 });
      const sq = spring(t - (B.ifm + 1.6), 3, 0.45); if (t > B.ifm + 1.6) at(150, -240, sq, -0.18, () => { circ(0, 0, 92); fillStroke(C.saf, C.ink, 6); txt('¢', 0, 6, { size: 70, w: 900 }); txt('MACHINES', 0, 46, { size: 18, w: 800, ls: 1 }); txt('WELCOME', 0, -38, { size: 18, w: 800, ls: 1 }); }); });
    // more robots queue at the builder's shop (customers that can pay)
    if (t > B.ifm + 2.0) for (let k = 0; k < 3; k++) { const qx = lerp(X.build + 1300 + k * 220, X.build + 360 + k * 210, E.cubicO(inv(B.ifm + 2.0 + k * 0.25, B.ifm + 3.6 + k * 0.25, t))); at(qx, 1030, 0.6, 0, () => ILL.robot({ smile: true, blink: (t + k) % 2 < 0.1, look: -0.6, bob: -Math.abs(Math.sin(t * 7 + k)) * 6 })); }
    // the robot itself
    const wk = walking(t); const hop = t > B.s18 && t < B.s18 + 0.5 ? -Math.sin(inv(B.s18, B.s18 + 0.5, t) * Math.PI) * 120 : 0;
    const sitting = t < B.s18 + 0.3;
    at(rx, (sitting ? 960 : 1010) + hop - Math.abs(Math.sin(t * 9)) * 10 * wk, 0.82, wk * 0.04 * Math.sin(t * 9), () => ILL.robot({
      blink: (t % 2.4) < 0.12, look: sitting ? 0.7 : 0.4, smile: t > B.s18, arm: t < B.late ? E.cubicO(inv(0.9, 1.7, t)) * 0.9 : (wk > 0.2 ? 0.25 + Math.sin(t * 9) * 0.25 : 0.1),
      holdCoin: t < B.late && t > 1.2, coinSpin: t * 4, bob: sitting ? Math.sin(t * 2) * 3 : 0 }));
    // the human hand giving pocket money (opening)
    const hq = 1 - inv(1.6, 2.3, t);
    if (hq > 0) { const hx = lerp(X.home + 330, X.home + 200, E.cubicO(inv(0, 0.9, t))); at(hx, 900, 1.4, -0.5 + 0.1 * Math.sin(t * 2), () => alpha(hq, () => ILL.hand())); }
    if (t < 1.25) { const q = inv(0.9, 1.25, t); at(lerp(X.home + 170, X.home + 70, q), lerp(880, 1010, q), 0.9, 0, () => ILL.coin({ r: 36, spin: t * 3 })); }
    // aerial: payments as dots streaming along the street grid
    if (aerial > 0) alpha(aerial, () => {
      for (let i = 0; i < 260; i++) { const lane = i % 8, sp = 600 + hash(i) * 900; const px = ((t * sp + hash(i + 7) * 9000) % 9000) - 600; const py = 700 + lane * 120 + Math.sin(i) * 20;
        circ(px, py, 14); x.fillStyle = hash(i) < 0.87 ? C.saf : C.ink; x.fill(); }
    });
  }, 1);
  // aerial counter (screen space)
  if (aerial > 0.02) alpha(aerial * inv(B.n138 - 0.5, B.n138 - 0.1, t), () => {
    const v = Math.floor(138000000 * E.expoO(inv(B.n138 - 0.3, B.n138 + 1.3, t)));
    rr(140, 360, 800, 230, 40); fillStroke('rgba(255,251,244,0.95)', C.ink, 6);
    txt(v.toLocaleString('en-US') + (v >= 138000000 ? '+' : ''), W / 2, 500, { size: 104, w: 900 }); txt('AGENT PAYMENTS · CHAINALYSIS', W / 2, 556, { size: 28, w: 700, color: C.mute, ls: 3 });
  });
  // the catch: overlay card
  const ca = inv(B.catchT - 0.2, B.catchT + 0.2, t) * (1 - inv(B.but - 0.2, B.but + 0.2, t));
  if (ca > 0) alpha(ca, () => {
    rr(110, 380, 860, 560, 44); fillStroke('rgba(255,251,244,0.97)', C.ink, 6);
    txt('THE CATCH', W / 2, 470, { size: 36, w: 800, color: C.red, ls: 6 });
    at(330, 680, 1, 0, () => { ILL.coin({ r: 26 }); txt('tiny', 0, 110, { size: 44, w: 800 }); });
    txt('count', 640, 640, { size: 76, w: 800, a: inv(37.6, 37.9, t) }); txt('≠ demand', 680, 740, { size: 76, w: 800, color: C.safDeep, a: inv(38.7, 39.1, t) });
    txt('Chainalysis did not publish the total dollar value', W / 2, 880, { size: 26, w: 600, color: C.mute, a: inv(37.6, 38.2, t) });
  });
  // callback end: stopwatch 18:00 + mark
  const en = inv(B.pocket - 0.2, B.pocket + 0.3, t);
  if (en > 0) alpha(en, () => { const sc = 0.85 + 0.15 * spring(t - B.pocket, 2.5, 0.5);
    at(W / 2, 470, sc, 0, () => { rr(-330, -150, 660, 300, 44); fillStroke('rgba(255,251,244,0.97)', C.ink, 6);
      at(-170, 0, 0.62, 0, () => ILL.stopwatch({ r: 150, sweep: 0.3 }));
      txt('73 days', 110, -24, { size: 56, w: 800, color: C.mute }); line([[0, -42], [220, -42]], C.red, 6);
      txt('18 min', 110, 70, { size: 92, w: 900, color: C.safDeep }); }); });
  // hook headline: the question the film answers
  const hh = 1 - inv(2.3, 2.7, t);
  if (hh > 0) alpha(hh, () => { const sp = spring(t + 0.4, 2.2, 0.55);
    at(W / 2, 400 - (1 - sp) * 40, 1, 0, () => { txt('What does a robot buy', 0, 0, { size: 74, w: 800 }); txt('with pocket money?', 0, 92, { size: 74, w: 800, color: C.safDeep }); }); });
  // brand
  img('logo', 104, 150, 58); txt('THE BRIEF', 146, 162, { size: 30, w: 800, align: 'left', ls: 5 });
  txt('BY OMNIX', 160 + tw('THE BRIEF', 30, 800, 'sans', false, 5), 162, { size: 30, w: 600, align: 'left', ls: 5, color: C.saf });
  capB(t);
  grainOver(t); vignette(0.12);
}
