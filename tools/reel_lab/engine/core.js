// Omnix reel engine: every frame is a pure function of time t (seconds).
// A variant's comp.js defines window.COMP = {dur, draw(t), events?}.
'use strict';
const W = 1080, H = 1920;
const C = {
  paper: '#F5ECDD', paper2: '#EEE2CC', ink: '#1F1A15', saf: '#F08A12', saf2: '#FFC46B', safDeep: '#C9650A',
  mute: '#8C8073', line: '#DCCDB5', red: '#C6452C', sage: '#7E9C70', white: '#FFFBF4', shade: 'rgba(31,26,21,0.10)'
};
let cv, x;               // main canvas + context
const IMGS = {};
const FONT = {
  sans: 'Mont', serif: 'ISerif', mono: 'JBMono', frau: 'Fraunces'
};

// ---------- maths ----------
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const inv = (a, b, v) => cl((v - a) / (b - a));
const E = {
  lin: p => p,
  sineIO: p => 0.5 - 0.5 * Math.cos(Math.PI * cl(p)),
  cubicO: p => 1 - Math.pow(1 - cl(p), 3),
  cubicIO: p => { p = cl(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
  quartO: p => 1 - Math.pow(1 - cl(p), 4),
  expoO: p => { p = cl(p); return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); },
  expoIO: p => { p = cl(p); if (p <= 0) return 0; if (p >= 1) return 1; return p < .5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2; },
  backO: (p, s = 1.70158) => { p = cl(p) - 1; return p * p * ((s + 1) * p + s) + 1; },
};
// damped spring 0->1 (stiffness k, damping z), time in s
function spring(tt, freq = 2.2, damp = 0.45) {
  if (tt <= 0) return 0;
  const w = 2 * Math.PI * freq, z = damp;
  if (z >= 1) return 1 - Math.exp(-w * tt) * (1 + w * tt);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tt) * (Math.cos(wd * tt) + (z * w / wd) * Math.sin(wd * tt));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 1 | s) + 0x6D2B79F5 | 0, ((s ^ (s >>> 7)) >>> 0) / 4294967296)); }
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise1(t) { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }

// keyed track: keys [[t, value], ...] with per-key easing name in [t, v, ease]
function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1, e] = keys[i + 1];
    if (t <= t1) {
      const p = (E[e || 'cubicIO'])((t - t0) / (t1 - t0));
      if (Array.isArray(v0)) return v0.map((a, j) => lerp(a, v1[j], p));
      return lerp(v0, v1, p);
    }
  }
  return keys[keys.length - 1][1];
}

// ---------- drawing primitives ----------
function font(px, w = 700, fam = 'sans', it = false) { x.font = `${it ? 'italic ' : ''}${w} ${px}px ${FONT[fam] || fam}`; }
function txt(s, X, Y, o = {}) {
  font(o.size || 60, o.w || 700, o.fam || 'sans', o.it);
  x.textAlign = o.align || 'center'; x.textBaseline = o.base || 'alphabetic';
  if (o.ls !== undefined) x.letterSpacing = o.ls + 'px'; else x.letterSpacing = '0px';
  x.fillStyle = o.color || C.ink; x.globalAlpha *= (o.a === undefined ? 1 : o.a);
  x.fillText(s, X, Y); x.letterSpacing = '0px';
  x.globalAlpha = 1;
}
function tw(s, size, w = 700, fam = 'sans', it = false, ls = 0) { font(size, w, fam, it); x.letterSpacing = ls + 'px'; const m = x.measureText(s).width; x.letterSpacing = '0px'; return m; }
function rr(X, Y, w, h, r) { x.beginPath(); x.roundRect(X, Y, w, h, r); }
function circ(X, Y, r) { x.beginPath(); x.arc(X, Y, Math.max(0, r), 0, Math.PI * 2); }
function fillStroke(fill, stroke = C.ink, lw = 6) { if (fill) { x.fillStyle = fill; x.fill(); } if (stroke && lw) { x.strokeStyle = stroke; x.lineWidth = lw; x.lineJoin = 'round'; x.lineCap = 'round'; x.stroke(); } }
function save(fn) { x.save(); try { fn(); } finally { x.restore(); } }
function at(X, Y, s, rot, fn) { save(() => { x.translate(X, Y); if (rot) x.rotate(rot); if (s !== 1) x.scale(s, s); fn(); }); }
function alpha(a, fn) { if (a <= 0.001) return; save(() => { x.globalAlpha *= cl(a); fn(); }); }
function line(pts, color = C.ink, lw = 6, dash) { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.strokeStyle = color; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round'; if (dash) x.setLineDash(dash); x.stroke(); x.setLineDash([]); }
function img(name, X, Y, w, a = 1) { const im = IMGS[name]; if (!im || !im.complete) return; const h = w * im.height / im.width; alpha(a, () => x.drawImage(im, X - w / 2, Y - h / 2, w, h)); }
function shadow(X, Y, w, h = 18, a = 0.12) { save(() => { x.fillStyle = `rgba(31,26,21,${a})`; x.beginPath(); x.ellipse(X, Y, w / 2, h / 2, 0, 0, Math.PI * 2); x.fill(); }); }

// ---------- paper ground ----------
let GRAIN = [];
function makeGrain() {
  const r = rng(7);
  for (let k = 0; k < 4; k++) {
    const g = document.createElement('canvas'); g.width = 540; g.height = 960;
    const gx = g.getContext('2d'); const id = gx.createImageData(540, 960);
    for (let i = 0; i < id.data.length; i += 4) { const v = r() < 0.5 ? 0 : 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = r() * 16; }
    gx.putImageData(id, 0, 0); GRAIN.push(g);
  }
}
function paper(t, o = {}) {
  const g = x.createRadialGradient(W / 2, H * 0.42, 100, W / 2, H / 2, H * 0.75);
  g.addColorStop(0, o.c0 || '#FAF3E7'); g.addColorStop(0.7, o.c1 || C.paper); g.addColorStop(1, o.c2 || '#E9DBC3');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  if (o.grid !== false) save(() => {
    x.strokeStyle = 'rgba(140,120,95,0.07)'; x.lineWidth = 2;
    const s = o.gridSize || 72, ox = (o.gx || 0) % s, oy = (o.gy || 0) % s;
    x.beginPath();
    for (let X = -s + ox; X < W + s; X += s) { x.moveTo(X, 0); x.lineTo(X, H); }
    for (let Y = -s + oy; Y < H + s; Y += s) { x.moveTo(0, Y); x.lineTo(W, Y); }
    x.stroke();
  });
}
function grainOver(t) { if (window.__noGrain) return; const g = GRAIN[Math.floor(t * 12) % 4]; if (g) save(() => { x.globalCompositeOperation = 'multiply'; x.drawImage(g, 0, 0, W, H); }); }
function vignette(a = 0.16) { const g = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.8); g.addColorStop(0, 'rgba(60,40,20,0)'); g.addColorStop(1, `rgba(60,40,20,${a})`); x.fillStyle = g; x.fillRect(0, 0, W, H); }

// ---------- camera ----------
// cam = {x, y, z, r}: the world point at screen centre, zoom, roll. shake adds operator feel.
function withCam(cam, t, fn, hand = 1) {
  save(() => {
    const hx = noise1(t * 0.35 + 3) * 6 * hand, hy = noise1(t * 0.3 + 9) * 8 * hand, hr = noise1(t * 0.25 + 1) * 0.004 * hand;
    x.translate(W / 2 + hx, H / 2 + hy); x.rotate((cam.r || 0) + hr); x.scale(cam.z, cam.z); x.translate(-cam.x, -cam.y);
    fn();
  });
}
// shake impulse after time t0
function kick(t, t0, amp = 14, dur = 0.35) { const p = (t - t0) / dur; if (p < 0 || p > 1) return [0, 0]; const d = Math.exp(-p * 5) * amp; return [Math.sin(p * 40) * d, Math.cos(p * 33) * d * 0.6]; }

// ---------- illustrations (centred at 0,0, ~unit 100px) ----------
const ILL = {};
ILL.robot = (o = {}) => { // o: blink, look, arm (0..1 raise right arm), bob, holdCoin, mood
  const look = o.look || 0, arm = o.arm || 0, armL = o.armL || 0;
  save(() => {
    x.translate(0, o.bob || 0);
    // legs
    line([[-26, 120], [-30, 168]], C.ink, 12); line([[26, 120], [30, 168]], C.ink, 12);
    rr(-48, 160, 40, 18, 9); fillStroke(C.ink, null, 0); rr(10, 160, 40, 18, 9); fillStroke(C.ink, null, 0);
    // arms
    const ax = 70, ay = 50;
    save(() => { x.translate(-ax, ay); x.rotate(0.35 - armL * 2.2); line([[0, 0], [0, 62]], C.ink, 12); circ(0, 70, 12); fillStroke(C.saf2, C.ink, 5); });
    save(() => { x.translate(ax, ay); x.rotate(-0.35 + arm * 2.4); line([[0, 0], [0, 62]], C.ink, 12); circ(0, 70, 12); fillStroke(C.saf2, C.ink, 5);
      if (o.holdCoin) { at(0, 100, 1, -(-0.35 + arm * 2.4), () => ILL.coin({ r: 30, spin: o.coinSpin || 0 })); } });
    // body
    rr(-66, 20, 132, 110, 30); fillStroke('#FFF7EA', C.ink, 7);
    circ(0, 76, 16); fillStroke(C.saf, C.ink, 5);
    // neck + head
    rr(-14, 2, 28, 22, 6); fillStroke(C.ink, null, 0);
    rr(-82, -112, 164, 120, 40); fillStroke('#FFF7EA', C.ink, 7);
    rr(-60, -92, 120, 78, 24); fillStroke(C.ink, null, 0);
    const bl = o.blink ? 0.15 : 1;
    save(() => { x.fillStyle = C.saf2; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(s * 26 + look * 10, -54, 11, 15 * bl, 0, 0, Math.PI * 2); x.fill(); } });
    if (o.smile) { x.beginPath(); x.arc(look * 8, -42, 14, 0.25 * Math.PI, 0.75 * Math.PI); x.strokeStyle = C.saf2; x.lineWidth = 5; x.stroke(); }
    // antenna
    line([[0, -112], [0, -146]], C.ink, 7); circ(0, -154, 13); fillStroke(C.saf, C.ink, 5);
  });
};
ILL.coin = (o = {}) => { // o: r, spin (radians), label
  const r = o.r || 40, sx = Math.abs(Math.cos(o.spin || 0)) * 0.85 + 0.15;
  save(() => {
    x.scale(sx, 1);
    circ(0, 0, r); fillStroke(C.saf, C.ink, Math.max(3, r * 0.12));
    circ(0, 0, r * 0.68); fillStroke(null, C.safDeep, Math.max(2, r * 0.07));
    if (sx > 0.45) txt(o.label || '¢', 0, r * 0.32, { size: r * 0.95, w: 800, color: C.ink });
  });
};
ILL.wallet = (o = {}) => {
  const open = o.open || 0;
  save(() => {
    rr(-90, -60, 180, 124, 22); fillStroke('#E9D5B5', C.ink, 7);
    save(() => { x.translate(0, -60); x.rotate(-open * 0.5); rr(-90, -8, 180, 40, 16); fillStroke('#DCC29A', C.ink, 7); });
    rr(30, -14, 76, 46, 14); fillStroke(C.saf, C.ink, 7); circ(58, 9, 9); fillStroke(C.white, C.ink, 4);
  });
};
ILL.stopwatch = (o = {}) => { // o: r, sweep (0..1 of a lap), a (hand angle override)
  const r = o.r || 120;
  save(() => {
    rr(-r * 0.16, -r * 1.28, r * 0.32, r * 0.2, 6); fillStroke(C.ink, null, 0);
    circ(0, 0, r); fillStroke('#FFF8EC', C.ink, r * 0.07);
    if (o.sweep) { x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, r * 0.86, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * o.sweep); x.closePath(); x.fillStyle = C.saf2; x.fill(); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line([[Math.sin(a) * r * 0.78, -Math.cos(a) * r * 0.78], [Math.sin(a) * r * 0.88, -Math.cos(a) * r * 0.88]], C.ink, r * 0.04); }
    const a = o.a !== undefined ? o.a : (o.sweep || 0) * Math.PI * 2;
    line([[0, 0], [Math.sin(a) * r * 0.72, -Math.cos(a) * r * 0.72]], C.ink, r * 0.06);
    circ(0, 0, r * 0.07); fillStroke(C.saf, C.ink, 3);
  });
};
ILL.calendar = (o = {}) => { // o: flip 0..1 top page curl, label
  save(() => {
    rr(-110, -100, 220, 210, 24); fillStroke(C.white, C.ink, 7);
    rr(-110, -100, 220, 56, { upperLeft: 24, upperRight: 24, lowerLeft: 0, lowerRight: 0 }); fillStroke(C.saf, C.ink, 7);
    for (const s of [-1, 1]) { rr(s * 50 - 7, -122, 14, 40, 7); fillStroke(C.ink, null, 0); }
    x.fillStyle = 'rgba(31,26,21,0.18)';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { rr(-88 + c * 37, -26 + r * 32, 26, 20, 5); x.fill(); }
  });
};
ILL.chip = (o = {}) => { save(() => { for (let i = -2; i <= 2; i++) for (const s of [-1, 1]) { line([[i * 22, s * 62], [i * 22, s * 82]], C.ink, 8); line([[s * 62, i * 22], [s * 82, i * 22]], C.ink, 8); } rr(-62, -62, 124, 124, 18); fillStroke('#2A2420', C.ink, 7); rr(-30, -30, 60, 60, 10); fillStroke(C.saf, null, 0); }); };
ILL.globe = (o = {}) => { save(() => { circ(0, 0, 70); fillStroke('#DCEBE6', C.ink, 7); x.beginPath(); x.ellipse(0, 0, 30, 70, 0, 0, Math.PI * 2); x.strokeStyle = C.ink; x.lineWidth = 5; x.stroke(); line([[-70, 0], [70, 0]], C.ink, 5); line([[-60, -36], [60, -36]], C.ink, 4); line([[-60, 36], [60, 36]], C.ink, 4); }); };
ILL.codecheck = (o = {}) => { save(() => { rr(-80, -70, 160, 140, 18); fillStroke('#2A2420', C.ink, 7); txt('</>', -8, 22, { size: 62, w: 800, color: C.saf2, fam: 'mono' }); circ(56, 50, 34); fillStroke(C.sage, C.ink, 6); line([[40, 50], [52, 62], [72, 38]], C.white, 8); }); };
ILL.check = (o = {}) => { const s = o.p === undefined ? 1 : o.p; save(() => { circ(0, 0, 40); fillStroke(C.sage, C.ink, 5); const pts = [[-18, 2], [-5, 16], [20, -14]]; const L1 = Math.hypot(13, 14), L2 = Math.hypot(25, 30); const d = s * (L1 + L2); if (d > 0) { const q = d <= L1 ? [lerp(-18, -5, d / L1), lerp(2, 16, d / L1)] : [lerp(-5, 20, (d - L1) / L2), lerp(16, -14, (d - L1) / L2)]; line(d <= L1 ? [pts[0], q] : [pts[0], pts[1], q], C.white, 8); } }); };
ILL.approveBtn = (o = {}) => { // a big "Approve" button with optional strike
  save(() => { rr(-170, -58, 340, 116, 58); fillStroke(C.white, C.ink, 7); txt('Approve', 0, 20, { size: 54, w: 800 });
    if (o.strike) { const p = o.strike; line([[-190, 70], [lerp(-190, 190, p), lerp(70, -70, p)]], C.red, 14); } });
};
ILL.hand = (o = {}) => { // pointing hand cursor
  save(() => { x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 64); x.quadraticCurveTo(0, 96, 30, 100); x.lineTo(64, 100); x.quadraticCurveTo(92, 98, 92, 66); x.lineTo(92, 44); x.quadraticCurveTo(92, 30, 78, 30); x.lineTo(30, 30); x.lineTo(30, 0); x.quadraticCurveTo(15, -14, 0, 0); fillStroke(C.white, C.ink, 6); });
};
ILL.gate = (o = {}) => { // toll gate: post + boom arm lifting by o.lift (0..1), sign text
  const lift = o.lift || 0;
  save(() => {
    rr(-40, -120, 80, 240, 14); fillStroke('#E9D5B5', C.ink, 7);
    rr(-60, 110, 120, 30, 8); fillStroke(C.ink, null, 0);
    save(() => { x.translate(20, -60); x.rotate(-lift * 1.35);
      rr(0, -16, 420, 32, 16); fillStroke(C.white, C.ink, 6);
      x.fillStyle = C.red; for (let i = 0; i < 5; i++) { rr(30 + i * 80, -12, 40, 24, 4); x.fill(); } });
    circ(20, -60, 16); fillStroke(C.saf, C.ink, 5);
    if (o.sign) { const sw = tw(o.sign, 44, 800, 'mono') + 60; rr(-sw / 2, -250, sw, 100, 16); fillStroke(o.signColor || C.ink, C.ink, 6); txt(o.sign, 0, -188, { size: 44, w: 800, color: C.white, fam: 'mono' }); }
  });
};
ILL.stall = (o = {}) => { // Bengaluru street stall (darshini-style): awning stripes, counter, label, icon fn
  const w = o.w || 300, h = o.h || 300;
  save(() => {
    rr(-w / 2, -h / 2 + 50, w, h - 50, 10); fillStroke('#FFF6E6', C.ink, 7);
    // awning
    const n = 6, sw = w / n;
    for (let i = 0; i < n; i++) { x.beginPath(); x.moveTo(-w / 2 + i * sw, -h / 2); x.lineTo(-w / 2 + (i + 1) * sw, -h / 2); x.lineTo(-w / 2 + (i + 1) * sw, -h / 2 + 50); x.arc(-w / 2 + (i + .5) * sw, -h / 2 + 50, sw / 2, 0, Math.PI); x.closePath(); fillStroke(i % 2 ? C.white : (o.color || C.saf), C.ink, 5); }
    rr(-w / 2 - 14, -h / 2 - 22, w + 28, 26, 10); fillStroke(C.ink, null, 0);
    // counter
    rr(-w / 2 + 16, h / 2 - 70, w - 32, 24, 8); fillStroke('#DCC29A', C.ink, 5);
    if (o.label) { txt(o.label, 0, -h / 2 + 140, { size: o.labelSize || 34, w: 800 }); }
    if (o.icon) at(0, h / 2 - 140, o.iconScale || 0.6, 0, o.icon);
  });
};
ILL.lotusLine = (o = {}) => { // line-art lotus drawn progressively, p 0..1
  const p = o.p === undefined ? 1 : o.p, col = o.color || C.saf, lw = o.lw || 5;
  save(() => {
    x.strokeStyle = col; x.lineWidth = lw; x.lineCap = 'round';
    const petals = [[0, -1.0, 0.36], [-0.55, -0.72, 0.3], [0.55, -0.72, 0.3], [-0.95, -0.3, 0.26], [0.95, -0.3, 0.26]];
    petals.forEach(([px, py, wd], i) => {
      const q = cl(p * 6 - i * 0.8); if (q <= 0) return;
      x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(px * 100 - wd * 120, py * 100 * 0.6, px * 100, py * 100);
      x.quadraticCurveTo(px * 100 + wd * 120, py * 100 * 0.6, 0, 0); x.setLineDash([1000 * q, 1000]); x.stroke(); x.setLineDash([]);
    });
    const q = cl(p * 6 - 4.5); if (q > 0) { x.beginPath(); x.moveTo(-120 * q, 18); x.quadraticCurveTo(0, 46, 120 * q, 18); x.stroke(); }
  });
};

// ---------- captions ----------
// words: [[text, s, e], ...]; groups: [[i0, i1], ...] (inclusive) — one group on screen at a time
function capGroups(words, maxw = 3, breaks = []) {
  const g = []; let s = 0;
  for (let i = 0; i < words.length; i++) {
    const end = /[.?!:,]$/.test(words[i][0]) || breaks.includes(i) || (i - s + 1) >= maxw || (i + 1 < words.length && words[i + 1][1] - words[i][2] > 0.35);
    if (end || i === words.length - 1) { g.push([s, i]); s = i + 1; }
  }
  return g;
}
function activeGroup(groups, words, t, hold = 0.25) {
  for (let k = 0; k < groups.length; k++) {
    const [a, b] = groups[k]; const s = words[a][1] - 0.06, nx = k + 1 < groups.length ? words[groups[k + 1][0]][1] - 0.06 : words[b][2] + hold;
    if (t >= s && t < Math.min(nx, words[b][2] + 1.2)) return k;
  }
  return -1;
}

// ---------- boot ----------
function loadImg(n, src) { return new Promise(r => { const i = new Image(); i.onload = () => r(); i.onerror = () => r(); i.src = src; IMGS[n] = i; }); }
window.__boot = async function (assets) {
  cv = document.getElementById('c'); x = cv.getContext('2d');
  makeGrain();
  await Promise.all(Object.entries(assets || {}).map(([k, v]) => loadImg(k, v)));
  for (const f of ['800 80px Mont', '700 80px Mont', '600 80px Mont', '500 80px Mont', 'italic 700 80px Mont', '400 80px ISerif', 'italic 400 80px ISerif', '500 40px JBMono', '700 40px JBMono', '600 80px Fraunces'])
    await document.fonts.load(f);
  if (window.COMP && COMP.init) await COMP.init();
  window.__ready = true;
};
// draw at time t, averaging `n` shutter samples across `shutter` seconds (motion blur)
const ACC = document.createElement('canvas'); ACC.width = W; ACC.height = H; const ax = ACC.getContext('2d');
const SM = document.createElement('canvas'); SM.width = 135; SM.height = 240; const smx = SM.getContext('2d', { willReadFrequently: true });
function thumb(t) { x.setTransform(1, 0, 0, 1, 0, 0); window.__noGrain = true; COMP.draw(t); window.__noGrain = false; smx.drawImage(cv, 0, 0, 135, 240); return smx.getImageData(0, 0, 135, 240).data; }
// adaptive shutter: sample count follows how much the picture changes across the shutter interval
window.__frame = function (t, nmax = 1, shutter = 1 / 60) {
  let n = 1;
  if (nmax > 1) { const a = thumb(t - shutter / 2), b = thumb(t + shutter / 2); let d = 0; for (let i = 0; i < a.length; i += 4) d += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]);
    d /= (a.length / 4); n = d < 0.6 ? 1 : Math.min(nmax, Math.ceil(2 + d * 1.6)); }
  window.__lastN = n; return __frameN(t, n, shutter);
};
window.__frameN = function (t, n = 1, shutter = 1 / 60) {
  if (n <= 1) { x.setTransform(1, 0, 0, 1, 0, 0); COMP.draw(t); return cv.toDataURL('image/jpeg', 0.93); }
  for (let i = 0; i < n; i++) {
    x.setTransform(1, 0, 0, 1, 0, 0); COMP.draw(t + (i / (n - 1) - 0.5) * shutter);
    ax.globalAlpha = 1 / (i + 1); ax.drawImage(cv, 0, 0);
  }
  ax.globalAlpha = 1; return ACC.toDataURL('image/jpeg', 0.93);
};
window.__events = () => (COMP.events || []);
