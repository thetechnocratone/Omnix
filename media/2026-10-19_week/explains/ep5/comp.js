// Omnix Explains ep 5 · Documentary style — "Why don't we have flying cars yet?"
'use strict';
const T = { why: 5.54, three: 8.07, one: 9.22, hover: 10.66, every: 15.67, stop: 17.54, drop: 18.84, two: 19.52, jet: 20.97, n50: 22.27, hungry: 25.92, runs: 28.22,
  three3: 29.54, car: 32.97, plane: 35.86, mix: 38.65, bad: 41.25, hop: 43.35, small: 46.49, hard: 49.77, so: 53.46, heavy: 56.03, hungry2: 56.73, hard2: 57.53, which: 58.26, end: 62.4 };
const BRK = [14, 22, 24, 26, 37, 43, 46, 51, 53, 61, 68, 71, 77, 86, 94, 103, 110, 118, 126, 129, 137, 147, 152, 158];
let G;
window.COMP = { dur: T.end, init() { G = []; let s0 = 0; WORDS.forEach((w, i) => { if (BRK.includes(i) || i === WORDS.length - 1 || (i - s0) >= 6) { G.push([s0, i]); s0 = i + 1; } }); }, draw(t) { draw(t); } };
const INKC = '#2A211A';

function capSerif(t) {
  const k = activeGroup(G, WORDS, t, 0.5); if (k < 0) return;
  const [a, b] = G[k]; const size = 70, gap = 18, maxw = 900;
  const ws = []; for (let i = a; i <= b; i++) ws.push({ i, s: WORDS[i][0], w: tw(WORDS[i][0], size, 400, 'serif') });
  const lines = [[]]; let lw = 0;
  for (const w of ws) { if (lw + w.w > maxw && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.w + gap; }
  const baseY = 1405 - (lines.length - 1) * 40;
  lines.forEach((L, li) => { const tot = L.reduce((s, w) => s + w.w, 0) + gap * (L.length - 1); let cx = W / 2 - tot / 2;
    L.forEach(w => { const st = WORDS[w.i][1]; const q = E.cubicO(inv(st - 0.08, st + 0.3, t)); const num = /^\d/.test(w.s);
      alpha(q, () => save(() => { x.shadowColor = 'rgba(240,138,18,0.35)'; x.shadowBlur = 18; txt(w.s, cx + w.w / 2, baseY + li * 82 + (1 - q) * 14, { size, w: 400, fam: 'serif', it: num, color: num ? C.safDeep : INKC }); }));
      cx += w.w + gap; }); });
}
function card(X0, Y0, w, h, rot, fn, o = {}) {
  at(X0, Y0, o.s === undefined ? 1 : Math.max(0.0001, o.s), rot, () => {
    save(() => { x.fillStyle = 'rgba(60,40,20,0.18)'; x.filter = 'blur(10px)'; rr(-w / 2 + 10, -h / 2 + 18, w, h, 6); x.fill(); });
    rr(-w / 2, -h / 2, w, h, 6); fillStroke(o.fill || '#FFFBF3', 'rgba(42,33,26,0.25)', 2); fn();
    if (o.pin !== false) { circ(0, -h / 2 + 18, 11); fillStroke(C.red, 'rgba(0,0,0,0.3)', 2); }
  });
}
function thread(pts, p, col = C.red, lw = 3) { let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  let rem = L * cl(p); const out = [pts[0]]; for (let i = 1; i < pts.length && rem > 0; i++) { const q = Math.min(1, rem / seg[i - 1]); out.push([lerp(pts[i - 1][0], pts[i][0], q), lerp(pts[i - 1][1], pts[i][1], q)]); rem -= seg[i - 1]; }
  if (out.length > 1) line(out, col, lw); }
function sTxt(s, X0, Y0, size, o = {}) { txt(s, X0, Y0, { size, w: 400, fam: 'serif', it: o.it, color: o.color || INKC, a: o.a, align: o.align }); }
// a generic sports car (no brand), side view
function car(o = {}) { save(() => {
  x.beginPath(); x.moveTo(-200, 30); x.lineTo(-190, -10); x.quadraticCurveTo(-120, -30, -70, -60); x.quadraticCurveTo(10, -95, 90, -55); x.quadraticCurveTo(170, -40, 205, -5); x.lineTo(210, 30); x.closePath(); fillStroke(o.col || '#E9E2D6', C.ink, 7);
  x.beginPath(); x.moveTo(-60, -55); x.quadraticCurveTo(10, -85, 80, -52); x.lineTo(-60, -52); fillStroke('#2F3537', C.ink, 4);
  for (const s of [-1, 1]) { circ(s * 120, 34, 38); fillStroke('#2B2620', C.ink, 5); circ(s * 120, 34, 15); fillStroke('#C9C2B5', null, 0); }
  if (o.jets) for (let i = 0; i < 3; i++) { const L = 60 + 40 * Math.abs(Math.sin(o.t * 20 + i)); line([[-150 + i * 150, 60], [-150 + i * 150, 60 + L]], 'rgba(240,138,18,0.8)', 14); }
}); }
function rotorCar(t, push = 1) { save(() => { car({}); for (const s of [-1, 1]) { line([[s * 150, -40], [s * 150, -110]], C.ink, 8); save(() => { x.translate(s * 150, -115); x.scale(Math.cos(t * 40 + s), 0.25); line([[-110, 0], [110, 0]], C.ink, 10); }); }
  if (push > 0) alpha(push, () => { for (let i = 0; i < 5; i++) { const ph = (t * 1.6 + i / 5) % 1; for (const s of [-1, 1]) { const y0 = -60 + ph * 300; line([[s * 150 - 40, y0], [s * 150 - 40, y0 + 50]], 'rgba(90,140,170,0.6)', 6); line([[s * 150 + 40, y0 + 20], [s * 150 + 40, y0 + 70]], 'rgba(90,140,170,0.6)', 6); } } }); }); }
function arrow(x0, y0, x1, y1, col, lw = 10) { line([[x0, y0], [x1, y1]], col, lw); const a = Math.atan2(y1 - y0, x1 - x0); line([[x1 - Math.cos(a - 0.5) * 34, y1 - Math.sin(a - 0.5) * 34], [x1, y1], [x1 - Math.cos(a + 0.5) * 34, y1 - Math.sin(a + 0.5) * 34]], col, lw); }
function fuelCan(s = 1) { at(0, 0, s, 0, () => { rr(-60, -80, 120, 160, 14); fillStroke('#D46A3C', C.ink, 6); rr(-20, -105, 40, 30, 6); fillStroke('#B8572E', C.ink, 5); txt('FUEL', 0, 14, { size: 30, w: 800, color: C.white }); }); }
function battery(s = 1, lvl = 1) { at(0, 0, s, 0, () => { rr(-70, -46, 140, 92, 12); fillStroke(C.white, C.ink, 6); rr(70, -16, 14, 32, 4); fillStroke(C.ink, null, 0); rr(-60, -36, 120 * cl(lvl), 72, 6); fillStroke(lvl < 0.25 ? C.red : C.sage, null, 0); }); }
function plane(s = 1) { at(0, 0, s, 0, () => { x.beginPath(); x.ellipse(0, 0, 190, 34, 0, 0, Math.PI * 2); fillStroke(C.white, C.ink, 6); x.beginPath(); x.moveTo(-30, 0); x.lineTo(40, -140); x.lineTo(80, -140); x.lineTo(50, 0); fillStroke('#E9E2D6', C.ink, 5);
  x.beginPath(); x.moveTo(-150, -10); x.lineTo(-190, -90); x.lineTo(-160, -90); x.lineTo(-110, -14); fillStroke('#E9E2D6', C.ink, 5); for (let i = 0; i < 6; i++) { circ(90 - i * 34, -6, 8); fillStroke('#9FD6E8', null, 0); } }); }

function draw(t) {
  paper(t, { c0: '#FBF4E8', c1: '#F3E8D6', c2: '#E2CFB0', gridSize: 90, gy: t * 4 });
  const z = 1 + 0.03 * Math.sin(t * 0.2);
  const kh = kick(t, T.drop - 0.2, 14, 0.5);
  withCam({ x: W / 2 + Math.sin(t * 0.13) * 14 + kh[0], y: H / 2 + Math.cos(t * 0.11) * 12 + kh[1], z }, t, () => {
    // ===== 0 → 5.4: the viral hop
    const s0 = 1 - inv(T.why - 0.2, T.why + 0.3, t);
    if (s0 > 0) alpha(s0, () => {
      card(W / 2, 880, 760, 560, -0.02, () => {
        line([[-330, 170], [330, 170]], C.line, 4);
        const hop = Math.max(0, Math.sin(((t * 0.55) % 1) * Math.PI));
        at(0, 120 - hop * 200, 0.95, -hop * 0.12, () => car({ jets: hop > 0.05, t }));
        shadow(0, 196, 380 * (1 - hop * 0.4), 22, 0.15);
        txt('ON STAGE · 15 OCT', -330, -220, { size: 24, w: 700, ls: 4, color: C.mute, align: 'left' });
      });
      // reaction cards (the internet "lost it")
      [['!!!', 210, 1250, -0.1, 2.9], ['lol', 520, 1290, 0.05, 3.4], ['wait, what', 840, 1245, 0.08, 3.9]].forEach(([s, X0, Y0, r, st]) => {
        if (t > st) card(X0, Y0, 250, 110, r, () => sTxt(s, 0, 16, 46, { it: true }), { s: E.backO(inv(st, st + 0.25, t)), pin: false }); });
    });
    // ===== 5.5 → 9.2: three reasons (three pinned cards, they stay as the spine)
    const cards3 = inv(T.why - 0.2, T.why + 0.3, t) * (1 - inv(T.one - 0.3, T.one + 0.2, t)) + inv(T.so - 0.3, T.so + 0.2, t) * (1 - inv(T.which - 0.3, T.which + 0.1, t));
    if (cards3 > 0) alpha(cl(cards3), () => {
      const late = t > T.so - 0.4;
      [['1', 'Weight', 'heavy', T.heavy], ['2', 'Energy', 'hungry', T.hungry2], ['3', 'Opposites', 'hard', T.hard2]].forEach(([n, lab, word, ts], i) => {
        const st = T.why + 0.4 + i * 0.25;
        card(220 + i * 320, 880 + (i % 2) * 40, 280, 360, (i - 1) * 0.05, () => {
          sTxt(n, 0, -40, 150, { it: true, color: C.safDeep }); sTxt(lab, 0, 90, 50);
          if (late && t > ts) alpha(inv(ts, ts + 0.2, t), () => at(0, 10, 1, -0.12, () => { rr(-120, -46, 240, 92, 10); fillStroke('rgba(255,251,243,0.9)', C.red, 6); txt(word.toUpperCase(), 0, 20, { size: 46, w: 800, color: C.red, ls: 3 }); }));
        }, { s: late ? 1 : E.backO(inv(st, st + 0.3, t)) });
      });
      if (!late) sTxt('Why don’t we have', W / 2, 520, 76, { a: inv(T.why, T.why + 0.4, t) });
      if (!late) sTxt('flying cars yet?', W / 2, 610, 76, { it: true, color: C.safDeep, a: inv(T.why + 0.6, T.why + 1.0, t) });
    });
    // ===== 9.2 → 19.4: one — weight (push air down to hold your weight, every second)
    const s1 = inv(T.one - 0.2, T.one + 0.3, t) * (1 - inv(T.two - 0.3, T.two + 0.1, t));
    if (s1 > 0) alpha(s1, () => {
      sTxt('1', 160, 470, 120, { it: true, color: C.safDeep }); sTxt('Weight', 230, 455, 64, { align: 'left' });
      const fall = E.cubicIO(inv(T.stop + 0.4, T.drop + 0.3, t)) ;
      const push = t < T.hover ? 0 : 1 - inv(T.stop + 0.2, T.stop + 0.5, t);
      at(W / 2, 820 + fall * 420, 0.95, fall * 0.25, () => rotorCar(t, push));
      if (t > T.hover + 1.0 && t < T.stop + 0.3) { const q = inv(T.hover + 1.0, T.hover + 1.6, t);
        alpha(q, () => { arrow(880, 760, 880, 1000, C.red, 10); sTxt('its weight', 900, 1060, 40, { it: true, color: C.red, align: 'center' });
          arrow(200, 1000, 200, 760, '#5A8CAA', 10); sTxt('air pushed down', 200, 1060, 40, { it: true, color: '#5A8CAA' }); }); }
      if (t > T.every - 0.1 && t < T.stop + 0.2) { const sec = Math.floor((t - T.every) * 3) % 10; sTxt('every second', W / 2, 600, 56, { it: true, a: inv(T.every, T.every + 0.3, t) }); for (let i = 0; i < 10; i++) { circ(W / 2 - 180 + i * 40, 650, 8); x.fillStyle = i <= sec ? C.saf : C.line; x.fill(); } }
      line([[160, 1270], [920, 1270]], C.line, 4);
    });
    // ===== 19.5 → 29.4: two — energy (fuel ≈ 50× battery by weight)
    const s2 = inv(T.two - 0.2, T.two + 0.3, t) * (1 - inv(T.three3 - 0.3, T.three3 + 0.1, t));
    if (s2 > 0) alpha(s2, () => {
      sTxt('2', 160, 470, 120, { it: true, color: C.safDeep }); sTxt('Energy', 230, 455, 64, { align: 'left' });
      card(310, 820, 400, 480, -0.03, () => { at(0, -90, 1, 0, () => fuelCan(1)); const n = Math.floor(50 * E.cubicO(inv(T.n50 - 0.3, T.n50 + 1.2, t)));
        for (let i = 0; i < 50; i++) { const c = i % 10, r = Math.floor(i / 10); rr(-150 + c * 31, 40 + r * 31, 24, 24, 4); x.fillStyle = i < n ? '#D46A3C' : 'rgba(42,33,26,0.08)'; x.fill(); } sTxt('1 kg of jet fuel', 0, 215, 34, { it: true }); });
      card(780, 820, 400, 480, 0.03, () => { const lvl = t > T.hungry ? 1 - inv(T.hungry + 0.5, T.runs + 0.6, t) : 1; at(0, -90, 1, 0, () => battery(1, lvl));
        rr(-150, 40, 24, 24, 4); x.fillStyle = C.sage; x.fill(); sTxt('1 kg of battery', 0, 215, 34, { it: true }); if (t > T.runs) txt('EMPTY', 0, -170, { size: 34, w: 800, color: C.red, ls: 4, a: inv(T.runs, T.runs + 0.3, t) }); });
      if (t > T.n50 - 0.2) at(W / 2, 1180, E.backO(inv(T.n50 - 0.2, T.n50 + 0.2, t)), 0, () => { sTxt('≈ 50×', 0, 30, 130, { it: true, color: C.safDeep }); });
      sTxt('the energy, same weight', W / 2, 1255, 36, { it: true, color: C.mute, a: inv(T.n50 + 0.5, T.n50 + 0.9, t) });
    });
    // ===== 29.5 → 43.2: three — a car and a plane want opposite things
    const s3 = inv(T.three3 - 0.2, T.three3 + 0.3, t) * (1 - inv(T.hop - 0.3, T.hop + 0.1, t));
    if (s3 > 0) alpha(s3, () => {
      sTxt('3', 160, 470, 120, { it: true, color: C.safDeep }); sTxt('Opposites', 230, 455, 64, { align: 'left' });
      const merge = E.cubicIO(inv(T.mix, T.mix + 1.0, t));
      // seesaw: heavy car down-left, light plane up-right
      const tilt = 0.18 * E.backO(inv(T.plane, T.plane + 0.6, t)) * (1 - merge);
      at(W / 2, 1080, 1, 0, () => { alpha(1 - merge, () => { x.beginPath(); x.moveTo(-40, 60); x.lineTo(0, 0); x.lineTo(40, 60); fillStroke('#C9A878', C.ink, 5);
        save(() => { x.rotate(-tilt); line([[-380, 0], [380, 0]], C.ink, 12);
          if (t > 30.3) at(-240, -70, 0.7 * E.backO(inv(30.3, 30.7, t)), tilt, () => { car({ col: '#B9B2A6' }); txt('HEAVY STEEL', 0, -110, { size: 30, w: 800, ls: 3 }); });
          if (t > 30.9) at(240, -70, 0.6 * E.backO(inv(30.9, 31.3, t)), tilt, () => { plane(); txt('AS LIGHT AS POSSIBLE', 0, -170, { size: 34, w: 800, ls: 2 }); });
        }); }); });
      if (merge > 0) alpha(merge, () => {
        at(W / 2, 860, 1, 0, () => { at(0, 0, 0.9, 0, () => { plane(1.5); car({ col: '#B9B2A6' }); }); });
        if (t > T.bad - 0.2) { card(300, 1180, 380, 130, -0.05, () => sTxt('a bad car', 0, 18, 50, { it: true }), { s: E.backO(inv(T.bad - 0.2, T.bad + 0.1, t)) });
          card(780, 1180, 380, 130, 0.05, () => sTxt('a bad plane', 0, 18, 50, { it: true }), { s: E.backO(inv(42.2, 42.5, t)) });
          sTxt('— an aviation museum curator, via AP', W / 2, 1300, 30, { it: true, color: C.mute, a: inv(42.3, 42.7, t) }); }
      });
    });
    // ===== 43.3 → 53.3: a hop, not a flight; one-seat prototypes; the hard part is the switch
    const s4 = inv(T.hop - 0.2, T.hop + 0.3, t) * (1 - inv(T.so - 0.3, T.so + 0.1, t));
    if (s4 > 0) alpha(s4, () => {
      const ph2 = t > T.small - 0.2;
      if (!ph2) { line([[150, 1100], [930, 1100]], C.line, 4);
        // hop arc (drawn) vs flight path (dashed)
        save(() => { const p = inv(T.hop, T.hop + 0.9, t); const pts = []; for (let i = 0; i <= 40 * p; i++) { const u = i / 40; pts.push([200 + u * 300, 1100 - Math.sin(u * Math.PI) * 220]); } if (pts.length > 1) line(pts, C.safDeep, 10); });
        sTxt('hop', 350, 820, 70, { it: true, color: C.safDeep, a: inv(T.hop + 0.4, T.hop + 0.8, t) });
        alpha(inv(45.4, 45.8, t), () => { line([[560, 1100], [640, 760], [930, 720]], C.mute, 6, [18, 14]); sTxt('flight', 820, 680, 70, { it: true, color: C.mute }); });
      } else {
        // the one-seat multirotor prototype
        card(W / 2, 760, 640, 420, -0.02, () => { at(0, 40, 0.8, 0, () => { rr(-90, -40, 180, 110, 40); fillStroke(C.white, C.ink, 6); circ(0, -10, 34); fillStroke('#9FD6E8', C.ink, 4);
          for (const s of [-1, 1]) for (const r of [-1, 1]) { line([[s * 80, 0], [s * 200, r * 60 - 40]], C.ink, 8); save(() => { x.translate(s * 200, r * 60 - 40); x.scale(Math.cos(t * 30 + s + r), 0.25); line([[-70, 0], [70, 0]], C.ink, 8); }); } });
          txt('ONE-SEAT PROTOTYPES HAVE FLOWN', 0, -170, { size: 26, w: 800, ls: 2, color: C.mute }); });
        if (t > T.hard - 0.2) { const p = inv(T.hard + 0.6, T.hard + 2.4, t);
          const pts = []; for (let i = 0; i <= 50 * p; i++) { const u = i / 50; pts.push(u < 0.4 ? [300, 1270 - u / 0.4 * 200] : [300 + (u - 0.4) / 0.6 * 520 * 1, 1070 - Math.sin((u - 0.4) / 0.6 * Math.PI / 2) * 40]); }
          if (pts.length > 1) line(pts, C.safDeep, 10);
          if (p > 0.38) alpha(inv(T.hard + 1.3, T.hard + 1.7, t), () => { circ(300, 1070, 46); fillStroke(null, C.red, 6); sTxt('the hard part', 460, 1220, 46, { it: true, color: C.red, align: 'left' }); });
          sTxt('hover', 250, 1300, 34, { it: true, color: C.mute }); sTxt('fly forward', 830, 1030, 34, { it: true, color: C.mute, a: inv(T.hard + 2.0, T.hard + 2.4, t) }); }
      }
    });
    // ===== 58.3 → end: engineers can't stop trying (a blueprint sketching itself)
    const s5 = inv(T.which - 0.2, T.which + 0.3, t);
    if (s5 > 0) alpha(s5, () => {
      card(W / 2, 840, 820, 600, -0.015, () => { x.fillStyle = 'rgba(90,140,170,0.08)'; x.fillRect(-400, -290, 800, 580);
        save(() => { x.setLineDash([2000 * inv(T.which, T.end - 0.8, t), 2000]); at(0, 40, 0.9, 0, () => { save(() => { x.strokeStyle = '#3E6E8E'; x.lineWidth = 4; x.beginPath(); x.moveTo(-200, 30); x.lineTo(-190, -10); x.quadraticCurveTo(-120, -30, -70, -60); x.quadraticCurveTo(10, -95, 90, -55); x.quadraticCurveTo(170, -40, 205, -5); x.lineTo(210, 30); x.closePath(); x.stroke();
          for (const s of [-1, 1]) { x.beginPath(); x.arc(s * 120, 34, 38, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.moveTo(s * 150, -40); x.lineTo(s * 150, -110); x.moveTo(s * 150 - 110, -115); x.lineTo(s * 150 + 110, -115); x.stroke(); } }); }); });
        txt('PROTOTYPE · REV 47', -370, -250, { size: 22, w: 700, fam: 'mono', align: 'left', color: '#3E6E8E' }); });
    });
  }, 0.7);
  // hook headline + series mark
  const hh = 1 - inv(T.why - 0.4, T.why, t);
  if (hh > 0) alpha(hh, () => { sTxt('Why don’t we have', W / 2, 330, 78); sTxt('flying cars yet?', W / 2, 420, 78, { it: true, color: C.safDeep }); });
  txt('OMNIX EXPLAINS', W / 2, 165, { size: 26, w: 700, ls: 10, color: C.mute }); line([[W / 2 - 40, 190], [W / 2 + 40, 190]], C.saf, 3);
  const ec = inv(T.end - 1.1, T.end - 0.8, t);
  if (ec < 0.6) capSerif(t);
  if (ec > 0) alpha(ec, () => { x.fillStyle = 'rgba(251,244,232,0.95)'; x.fillRect(0, 0, W, H); img('logo', W / 2, 760, 240); sTxt('Heavy, hungry, and hard.', W / 2, 980, 60, { it: true });
    txt('Sources: AP (15–16 Oct 2026), Aviation Week', W / 2, 1060, { size: 24, w: 500, color: C.mute }); });
  grainOver(t); grainOver(t + 0.5); vignette(0.24);
}
