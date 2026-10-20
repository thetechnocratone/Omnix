// TrueChain briefing: frame engine. Every frame is a pure function of time t (seconds).
'use strict';
let W = 1920, H = 1080, M = 120;          // canvas + outer margin (1:1 social sets W=H=1080, M=80)
const K = {
  bg: '#FBF9F4', sand: '#F8EDDC', mute: '#F3EEE7', ink: '#1C1A17', ink2: '#5C5650', amber: '#F5A10C',
  hair: '#E6DFD3', paper: '#FFFDF9', amberDeep: '#C77F00',
  okF: '#2E6B4F', okB: '#E5F0EA', atF: '#8A5A00', atB: '#FFF6E0', nfF: '#3D3A36', nfB: '#F3EEE7', bdF: '#9B1C1C', bdB: '#FFF1F0',
  grey: '#C9C2B8', greyTop: '#DAD4CB', greySide: '#B4ADA3',
};
let cv, x; const IM = {};

// ---------- maths ----------
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const inv = (a, b, v) => cl((v - a) / (b - a));
function bez(x1, y1, x2, y2) {           // CSS cubic-bezier
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = u => ((ax * u + bx) * u + cx) * u, sy = u => ((ay * u + by) * u + cy) * u, dx = u => (3 * ax * u + 2 * bx) * u + cx;
  return p => { p = cl(p); if (p === 0 || p === 1) return p; let u = p; for (let i = 0; i < 8; i++) { const e = sx(u) - p; if (Math.abs(e) < 1e-5) break; u -= e / (dx(u) || 1e-6); } return sy(cl(u)); };
}
const E = {
  out: bez(0.22, 1, 0.36, 1),             // house entrance ease
  io: bez(0.65, 0, 0.35, 1),              // camera / carries
  inq: p => cl(p) * cl(p),
  lin: p => cl(p),
};
const ein = (t, t0, d = 0.6) => E.out(inv(t0, t0 + d, t));
const eio = (t, t0, d = 1) => E.io(inv(t0, t0 + d, t));
function track(keys, t) {                 // [[t, v, ease?], ...]
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1, e] = keys[i + 1];
    if (t <= t1) { const p = (E[e || 'io'])((t - t0) / (t1 - t0)); return Array.isArray(v0) ? v0.map((a, j) => lerp(a, v1[j], p)) : lerp(v0, v1, p); }
  }
  return keys[keys.length - 1][1];
}
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise1(t) { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function mixc(a, b, p) {                  // hex colour mix
  const h = s => [1, 3, 5].map(i => parseInt(s.substr(i, 2), 16)); const A = h(a), B = h(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], cl(p))).toString(16).padStart(2, '0')).join('');
}
// visibility window: fade/rise in at t0, out at t1
function win(t, t0, t1 = 1e9, din = 0.6, dout = 0.45) { const pi = ein(t, t0, din), po = 1 - E.io(inv(t1, t1 + dout, t)); return { a: Math.min(pi, po), pi, po, dy: (1 - pi) * 12 - (1 - po) * 8 }; }

// ---------- timeline lookups ----------
function L(id) { return TL.lines.find(l => l.id === id); }
function wt(id, word, end = false, nth = 0) {   // time a word (prefix match, case-insensitive) is spoken
  const ws = L(id).words.filter(w => w[0].toLowerCase().replace(/[^\w%$.]/g, '').startsWith(word.toLowerCase())); const w = ws[nth] || ws[0];
  return w ? w[end ? 2 : 1] : L(id).t0;
}

// ---------- drawing ----------
const FAM = { H: 'PJS', B: 'Manrope' };
function font(size, w, fam) { x.font = `${w} ${size}px ${FAM[fam] || fam}`; }
function T(s, X, Y, o = {}) {
  const size = o.size || 44, fam = o.fam || 'B', w = o.w || (fam === 'H' ? 800 : 500);
  font(size, w, fam); x.textAlign = o.align || 'left'; x.textBaseline = o.base || 'alphabetic';
  x.letterSpacing = (o.ls !== undefined ? o.ls : (fam === 'H' ? -0.02 * size : 0)) + 'px';
  x.fillStyle = o.color || K.ink; x.fillText(s, X, Y); x.letterSpacing = '0px';
}
function tw(s, size, w = 800, fam = 'H', ls) { font(size, w, fam); x.letterSpacing = (ls !== undefined ? ls : (fam === 'H' ? -0.02 * size : 0)) + 'px'; const m = x.measureText(s).width; x.letterSpacing = '0px'; return m; }
function wrap(s, maxW, size, w = 500, fam = 'B') {
  const out = []; let cur = '';
  for (const word of s.split(' ')) { const tryS = cur ? cur + ' ' + word : word; if (tw(tryS, size, w, fam) > maxW && cur) { out.push(cur); cur = word; } else cur = tryS; }
  if (cur) out.push(cur); return out;
}
function save(fn) { x.save(); try { fn(); } finally { x.restore(); } }
function alpha(a, fn) { if (a <= 0.002) return; save(() => { x.globalAlpha *= cl(a); fn(); }); }
function rr(X, Y, w, h, r) { x.beginPath(); x.roundRect(X, Y, Math.max(0, w), Math.max(0, h), Math.min(r, Math.abs(h) / 2, Math.abs(w) / 2)); }
function card(X, Y, w, h, o = {}) { rr(X, Y, w, h, o.r || 18); x.fillStyle = o.fill || K.sand; x.fill(); if (o.stroke !== false) { x.strokeStyle = o.stroke || K.hair; x.lineWidth = o.lw || 1.5; x.stroke(); } }
function lineP(pts, color = K.ink, lw = 5, dash) { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.strokeStyle = color; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round'; if (dash) x.setLineDash(dash); x.stroke(); x.setLineDash([]); }

// headline: lowercase with full stop, mask-up per line; returns height used
function headline(s, X, Y, t, t0, o = {}) {
  const size = o.size || 84, lh = size * 1.06, lines = o.lines || wrap(s, o.maxW || (W - 2 * M), size, 800, 'H');
  const t1 = o.t1 !== undefined ? o.t1 : 1e9, po = 1 - E.io(inv(t1, t1 + 0.45, t));
  lines.forEach((ln, i) => {
    const p = ein(t, t0 + i * 0.09, 0.7); if (p <= 0 || po <= 0) return;
    save(() => {
      x.beginPath(); x.rect(0, Y + i * lh - size * 1.0, W, size * 1.32); x.clip();
      x.globalAlpha *= po * cl(p * 1.6);
      T(ln, X, Y + i * lh + (1 - p) * size * 0.9 - (1 - po) * 10, { size, fam: 'H', color: o.color || K.ink, align: o.align });
    });
  });
  return lines.length * lh;
}
// body text with fade + 12px rise
function body(s, X, Y, t, t0, o = {}) {
  const size = o.size || 44, lh = size * (o.lh || 1.32), lines = o.lines || wrap(s, o.maxW || 900, size, o.w || 500, o.fam || 'B');
  const v = win(t, t0, o.t1, 0.6, 0.45);
  alpha(v.a, () => lines.forEach((ln, i) => T(ln, X, Y + i * lh + v.dy, { size, w: o.w || 500, fam: o.fam || 'B', color: o.color || K.ink2, align: o.align })));
  return lines.length * lh;
}
function eyebrowText(s, X, Y, a = 1) { alpha(a, () => T(s.toUpperCase(), X, Y, { size: 36, w: 500, fam: 'B', color: K.ink2, ls: 36 * 0.12 })); }
function source(s, t, t0, t1) { const v = win(t, t0 + 0.3, t1, 0.6, 0.35); alpha(v.a, () => T(s, M, H - 52, { size: 24, w: 500, color: K.ink2 })); }
// tag chip (e.g. "Illustration, not a finding.")
function tag(s, X, Y, a = 1, o = {}) {
  const size = o.size || 36, w = tw(s, size, 600, 'B') + 44, h = size + 26;
  alpha(a, () => { card(X - (o.right ? w : 0), Y, w, h, { r: h / 2, fill: o.fill || K.paper, stroke: o.stroke || K.hair, lw: 1.5 }); T(s, X - (o.right ? w : 0) + 22, Y + h / 2 + size * 0.36, { size, w: 600, color: o.color || K.ink2 }); });
  return w;
}
// verdict pill: always carries its text label
const VERDICT = {
  ok: ['record verified', K.okF, K.okB, null], at: ['attention needed', K.atF, K.atB, K.amber],
  nf: ['not found', K.nfF, K.nfB, null], bad: ['could not be trusted', K.bdF, K.bdB, K.bdF], held: ['listing held', K.bdF, K.bdB, K.bdF],
};
function pill(kind, X, Y, a = 1, size = 38, label) {
  const [txt, f, b, br] = VERDICT[kind]; const s = label || txt; const w = tw(s, size, 700, 'B') + 40 + size * 0.9, h = size + 30;
  alpha(a, () => {
    rr(X, Y, w, h, h / 2); x.fillStyle = b; x.fill(); if (br) { x.strokeStyle = br; x.lineWidth = 2; x.stroke(); }
    const cx = X + 20 + size * 0.36, cy = Y + h / 2; x.beginPath(); x.arc(cx, cy, size * 0.3, 0, 7); x.fillStyle = f; x.fill();
    save(() => { x.strokeStyle = b; x.lineWidth = 3.2; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); const r = size * 0.14;
      if (kind === 'ok') { x.moveTo(cx - r, cy); x.lineTo(cx - r * 0.2, cy + r * 0.8); x.lineTo(cx + r * 1.1, cy - r * 0.7); }
      else if (kind === 'at') { x.moveTo(cx, cy - r * 1.1); x.lineTo(cx, cy + r * 0.2); x.moveTo(cx, cy + r * 0.95); x.lineTo(cx, cy + r * 1.0); }
      else if (kind === 'nf') { x.moveTo(cx - r, cy); x.lineTo(cx + r, cy); }
      else { x.moveTo(cx - r, cy - r); x.lineTo(cx + r, cy + r); x.moveTo(cx + r, cy - r); x.lineTo(cx - r, cy + r); }
      x.stroke(); });
    T(s, X + 20 + size * 0.9, Y + h / 2 + size * 0.36, { size, w: 700, color: f });
  });
  return w;
}
// big number with tabular digits (constant width while counting)
function bigNum(prefix, value, digits, suffix, X, Y, size, o = {}) {
  font(size, 800, 'H'); x.letterSpacing = (-0.02 * size) + 'px';
  let dw = 0; for (let d = 0; d < 10; d++) dw = Math.max(dw, x.measureText(String(d)).width);
  const ds = String(Math.round(value)).padStart(digits, ' ');
  const pw = x.measureText(prefix).width, sw = x.measureText(suffix).width, total = pw + dw * digits + sw;
  let cx = X - (o.align === 'right' ? total : o.align === 'center' ? total / 2 : 0);
  x.fillStyle = o.color || K.ink; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
  x.fillText(prefix, cx, Y); cx += pw;
  for (const ch of ds) { if (ch !== ' ') { const cw = x.measureText(ch).width; x.fillText(ch, cx + (dw - cw) / 2, Y); } cx += dw; }
  x.fillText(suffix, cx, Y); x.letterSpacing = '0px';
  return total;
}
function countUp(t, tEnd, target, dur = 1.2) { const p = inv(tEnd - dur, tEnd, t); return target * E.out(p); }

// ---------- logo ----------
function logoSquare(X, Y, s, a = 1, mark = true) {   // amber rounded square, cream chain-check mark inside
  alpha(a, () => { rr(X, Y, s, s, s * 0.24); x.fillStyle = K.amber; x.fill();
    if (mark && IM.markC && s > 22) x.drawImage(IM.markC, X + s * 0.14, Y + s * 0.14, s * 0.72, s * 0.72); });
}
function brandMark(t, a) {   // top-right on every scene except the cold open
  const s = 40, wd = tw('TrueChain', 36, 800, 'H'), X = W - M - wd - s - 14, Y = M - 72 + 6;
  alpha(a, () => { logoSquare(X, Y, s); T('TrueChain', X + s + 14, Y + s * 0.5 + 13, { size: 36, fam: 'H' }); });
}

// ---------- illustrations (100-unit boxes, line icons) ----------
function icon(name, X, Y, s, color = K.ink, lw = 4.5) {
  save(() => {
    x.translate(X, Y); x.scale(s / 100, s / 100); x.strokeStyle = color; x.lineWidth = lw * 100 / s; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); const P = ICON[name]; if (P) P(); x.stroke();
  });
}
const ICON = {
  shirt() { x.moveTo(35, 14); x.lineTo(18, 22); x.lineTo(6, 42); x.lineTo(20, 50); x.lineTo(26, 40); x.lineTo(26, 88); x.lineTo(74, 88); x.lineTo(74, 40); x.lineTo(80, 50); x.lineTo(94, 42); x.lineTo(82, 22); x.lineTo(65, 14); x.bezierCurveTo(62, 24, 38, 24, 35, 14); },
  shoe() { x.moveTo(8, 72); x.lineTo(8, 40); x.bezierCurveTo(16, 42, 26, 42, 34, 34); x.lineTo(46, 46); x.bezierCurveTo(56, 56, 74, 58, 86, 62); x.bezierCurveTo(94, 64, 94, 72, 92, 76); x.lineTo(8, 76); x.closePath(); x.moveTo(8, 64); x.lineTo(92, 66); x.moveTo(40, 40); x.lineTo(34, 48); x.moveTo(48, 48); x.lineTo(42, 54); },
  watch() { x.moveTo(36, 26); x.lineTo(40, 6); x.lineTo(60, 6); x.lineTo(64, 26); x.moveTo(36, 74); x.lineTo(40, 94); x.lineTo(60, 94); x.lineTo(64, 74); x.moveTo(80, 50); x.arc(50, 50, 30, 0, 7); x.moveTo(50, 32); x.lineTo(50, 50); x.lineTo(62, 58); x.moveTo(82, 46); x.lineTo(86, 46); x.lineTo(86, 54); x.lineTo(82, 54); },
  box() { x.moveTo(12, 34); x.lineTo(50, 18); x.lineTo(88, 34); x.lineTo(88, 74); x.lineTo(50, 90); x.lineTo(12, 74); x.closePath(); x.moveTo(12, 34); x.lineTo(50, 50); x.lineTo(88, 34); x.moveTo(50, 50); x.lineTo(50, 90); x.moveTo(30, 26); x.lineTo(68, 42); },
  returnBox() { ICON.box(); x.moveTo(70, 8); x.arc(62, 14, 8, -0.6, Math.PI * 0.9, true); },
  refund() { x.moveTo(78, 50); x.arc(50, 50, 28, 0, 7); x.moveTo(58, 38); x.bezierCurveTo(54, 33, 40, 33, 40, 42); x.bezierCurveTo(40, 52, 60, 48, 60, 58); x.bezierCurveTo(60, 67, 46, 67, 42, 62); x.moveTo(50, 30); x.lineTo(50, 70); x.moveTo(14, 30); x.lineTo(10, 46); x.lineTo(24, 42); },
  van() { x.moveTo(6, 28); x.lineTo(60, 28); x.lineTo(60, 72); x.lineTo(6, 72); x.closePath(); x.moveTo(60, 42); x.lineTo(80, 42); x.lineTo(94, 58); x.lineTo(94, 72); x.lineTo(60, 72); x.moveTo(34, 78); x.arc(26, 78, 8, 0, 7); x.moveTo(84, 78); x.arc(76, 78, 8, 0, 7); },
  chat() { x.moveTo(10, 20); x.lineTo(66, 20); x.lineTo(66, 56); x.lineTo(34, 56); x.lineTo(22, 68); x.lineTo(22, 56); x.lineTo(10, 56); x.closePath(); x.moveTo(74, 38); x.lineTo(90, 38); x.lineTo(90, 72); x.lineTo(82, 72); x.lineTo(82, 84); x.lineTo(70, 72); x.lineTo(44, 72); x.lineTo(44, 64); },
  factory() { x.moveTo(6, 90); x.lineTo(6, 46); x.lineTo(30, 60); x.lineTo(30, 46); x.lineTo(54, 60); x.lineTo(54, 46); x.lineTo(78, 60); x.lineTo(78, 14); x.lineTo(92, 14); x.lineTo(92, 90); x.closePath(); x.moveTo(18, 76); x.lineTo(28, 76); x.moveTo(42, 76); x.lineTo(52, 76); x.moveTo(66, 76); x.lineTo(76, 76); },
  gear() { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.moveTo(50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30); x.lineTo(50 + Math.cos(a) * 42, 50 + Math.sin(a) * 42); } x.moveTo(80, 50); x.arc(50, 50, 30, 0, 7); x.moveTo(62, 50); x.arc(50, 50, 12, 0, 7); },
  ship() { ICON.van(); },
  store() { x.moveTo(10, 40); x.lineTo(16, 14); x.lineTo(84, 14); x.lineTo(90, 40); x.closePath(); x.moveTo(16, 40); x.lineTo(16, 88); x.lineTo(84, 88); x.lineTo(84, 40); x.moveTo(40, 88); x.lineTo(40, 62); x.lineTo(60, 62); x.lineTo(60, 88); },
  bag() { x.moveTo(16, 38); x.lineTo(84, 38); x.lineTo(90, 90); x.lineTo(10, 90); x.closePath(); x.moveTo(34, 38); x.bezierCurveTo(34, 10, 66, 10, 66, 38); },
  laptop() { x.moveTo(18, 22); x.lineTo(82, 22); x.lineTo(82, 66); x.lineTo(18, 66); x.closePath(); x.moveTo(6, 78); x.lineTo(94, 78); x.lineTo(88, 66); x.lineTo(12, 66); x.closePath(); },
  user() { x.moveTo(66, 34); x.arc(50, 34, 16, 0, 7); x.moveTo(18, 88); x.bezierCurveTo(18, 62, 82, 62, 82, 88); },
};

// ---------- parcels ----------
const PAL = {
  amber: { f: '#F5A10C', t: '#F9BC4A', s: '#D88C06', tape: '#FCD27F', ln: '#9A6200' },
  grey: { f: '#C9C2B8', t: '#DAD4CB', s: '#B1AAA0', tape: '#E3DED6', ln: '#7D766D' },
  sand: { f: '#EFDDBF', t: '#F6E8D0', s: '#E0CAA6', tape: '#F9EFDF', ln: '#A08A66' },
};
function mixPal(a, b, p) { const o = {}; for (const k in a) o[k] = mixc(a[k], b[k], p); return o; }
// 3/4 parcel centred on its front face; w = front width; o.open 0..1 lifts the lid flaps; o.label draws the shipping label
function parcel(cx, cy, w, pal, o = {}) {
  const h = w * 0.7, d = w * 0.26, X = cx - w / 2, Y = cy - h / 2, lw = Math.max(1, w * 0.012);
  x.lineJoin = 'round'; x.lineWidth = lw; x.strokeStyle = pal.ln;
  // side
  x.beginPath(); x.moveTo(X + w, Y); x.lineTo(X + w + d * 0.8, Y - d * 0.6); x.lineTo(X + w + d * 0.8, Y + h - d * 0.6); x.lineTo(X + w, Y + h); x.closePath(); x.fillStyle = pal.s; x.fill(); x.stroke();
  // top (or open flaps)
  const op = o.open || 0;
  x.beginPath(); x.moveTo(X, Y); x.lineTo(X + d * 0.8, Y - d * 0.6); x.lineTo(X + w + d * 0.8, Y - d * 0.6); x.lineTo(X + w, Y); x.closePath(); x.fillStyle = op > 0 ? mixc(pal.s, '#5c5145', 0.35) : pal.t; x.fill(); x.stroke();
  if (op > 0) {   // two flaps hinged on front and back edges
    const fl = (y0, x0, sgn) => { const ang = op * 1.9; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0 + w, y0); x.lineTo(x0 + w + d * 0.4 * Math.cos(ang) * sgn * 0 + 0, y0 - d * 0.55 * Math.sin(ang) - d * 0.3 * Math.cos(ang) * sgn); x.lineTo(x0, y0 - d * 0.55 * Math.sin(ang) - d * 0.3 * Math.cos(ang) * sgn); x.closePath(); x.fillStyle = pal.t; x.fill(); x.stroke(); };
    fl(Y - d * 0.6, X + d * 0.8, -1); fl(Y, X, 1);
  } else { x.fillStyle = pal.tape; x.fillRect(X + w * 0.45 + d * 0.4 * 0, Y - d * 0.6, 0, 0); x.beginPath(); x.moveTo(X + w * 0.44, Y); x.lineTo(X + w * 0.44 + d * 0.8, Y - d * 0.6); x.lineTo(X + w * 0.56 + d * 0.8, Y - d * 0.6); x.lineTo(X + w * 0.56, Y); x.closePath(); x.fill(); }
  // front
  x.beginPath(); x.rect(X, Y, w, h); x.fillStyle = pal.f; x.fill(); x.stroke();
  x.fillStyle = pal.tape; x.fillRect(X + w * 0.44, Y, w * 0.12, h * 0.36);
  if (o.label !== false) parcelLabel(X + w * 0.08, Y + h * 0.44, w * 0.42, w * 0.27, pal, o.labelDetail);
}
function labelRect(cx, cy, w) { const h = w * 0.7; return [cx - w / 2 + w * 0.08, cy - h / 2 + h * 0.44, w * 0.42, w * 0.27]; }
function parcelLabel(X, Y, w, h, pal, detail) {
  x.fillStyle = '#FFFDF8'; x.beginPath(); x.rect(X, Y, w, h); x.fill(); x.lineWidth = Math.max(0.4, w * 0.012); x.strokeStyle = pal.ln; x.stroke();
  const u = w / 100;
  if (detail) {      // full label, legible when the camera fills the frame with it
    save(() => {
      const t = (s, px, py, sz, wt, c) => { x.font = `${wt} ${sz * u}px ${FAM.B}`; x.fillStyle = c || K.ink; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.letterSpacing = (sz * u * 0.08) + 'px'; x.fillText(s, X + px * u, Y + py * u); x.letterSpacing = '0px'; };
      t('SHIP TO', 6, 11, 4.4, 600, K.ink2);
      x.font = `800 ${9 * u}px ${FAM.H}`; x.fillStyle = K.ink; x.textAlign = 'left'; x.letterSpacing = (-0.18 * u) + 'px'; x.fillText('your customer', X + 6 * u, Y + 22 * u); x.letterSpacing = '0px';
      t('ORDER  408-1182-77', 6, 32, 4.2, 600); t('1 ITEM  ·  HIGH VALUE', 6, 39, 4.2, 600, K.ink2);
      x.fillStyle = K.amber; x.fillRect(X + 6 * u, Y + 43 * u, 26 * u, 1.2 * u);
    });
    for (let i = 0; i < 34; i++) { const bw = (hash(i * 3.1) > 0.6 ? 1.6 : 0.8) * u; x.fillStyle = K.ink; x.fillRect(X + (6 + i * 2.6) * u, Y + 47 * u, bw, 12 * u); }
  } else {
    x.fillStyle = pal.ln; for (let i = 0; i < 3; i++) x.fillRect(X + w * 0.1, Y + h * (0.18 + i * 0.16), w * (i ? 0.5 : 0.7), h * 0.06);
    for (let i = 0; i < 12; i++) x.fillRect(X + w * (0.1 + i * 0.065), Y + h * 0.68, w * (hash(i) > 0.5 ? 0.03 : 0.015), h * 0.2);
  }
}
function miniParcel(cx, cy, s, pal, a = 1) {   // tiny parcel for crowds
  alpha(a, () => { rr(cx - s / 2, cy - s * 0.38, s, s * 0.76, s * 0.12); x.fillStyle = pal.f; x.fill(); x.fillStyle = pal.tape; x.fillRect(cx - s * 0.06, cy - s * 0.38, s * 0.12, s * 0.76); });
}

// ---------- the record card (recurring motif) ----------
// entries: [{title, meta, t}] — each entry lands at its own time with a tick
function recordCard(X, Y, w, entries, t, o = {}) {
  const head = 84, rowH = o.rowH || 104, shown = entries.filter(e => t >= e.t - 0.05);
  const grow = entries.reduce((acc, e) => acc + ein(t, e.t, 0.6) * rowH, 0);
  const h = head + grow + 18;
  save(() => {
    card(X, Y, w, h, { fill: K.paper, stroke: K.amber, lw: 3, r: 20 });
    x.beginPath(); x.roundRect(X, Y, w, head, [20, 20, 0, 0]); x.fillStyle = '#FFF4DD'; x.fill();
    logoSquare(X + 26, Y + 22, 40);
    T('record', X + 82, Y + 56, { size: 38, fam: 'H' });
    T(o.id || 'TC-7Q4F-92KD', X + w - 26, Y + 55, { size: 36, w: 600, color: K.ink2, align: 'right', ls: 1 });
    x.fillStyle = K.hair; x.fillRect(X, Y + head, w, 1.5);
    let yy = Y + head;
    entries.forEach((e, i) => {
      const p = ein(t, e.t, 0.6); if (p <= 0) return;
      const ry = yy + 18;
      save(() => { x.beginPath(); x.rect(X, yy, w, rowH * p + 18); x.clip(); x.globalAlpha *= cl(p * 1.4);
        const cy = ry + 34 + (1 - p) * 14;
        x.beginPath(); x.arc(X + 50, cy, 17, 0, 7); x.fillStyle = K.amber; x.fill();
        x.strokeStyle = '#fff'; x.lineWidth = 4; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(X + 42, cy); x.lineTo(X + 48, cy + 7); x.lineTo(X + 59, cy - 6); x.stroke();
        T(e.title, X + 86, cy + 4, { size: 38, w: 700 });
        T(e.meta, X + 86, cy + 50, { size: 36, w: 500, color: K.ink2 });
        if (i < entries.length - 1 && t > (entries[i + 1].t || 1e9)) { x.fillStyle = K.amber; x.fillRect(X + 48.5, cy + 19, 3, rowH - 38); }
      });
      yy += rowH * p;
    });
  });
  return h;
}

// ---------- frame + boot ----------
function hud(t) {
  const prog = cl(t / TL.total);   // amber progress bar tracks the whole video
  x.fillStyle = K.hair; x.fillRect(0, H - 6, W, 6); x.fillStyle = K.amber; x.fillRect(0, H - 6, W * prog, 6);
}
function loadImg(n, src) { return new Promise(r => { const i = new Image(); i.onload = () => r(); i.onerror = () => r(); i.src = src; IM[n] = i; }); }
function tint(img, color) { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, c.width, c.height); return c; }
window.__boot = async function () {
  const q = new URLSearchParams(location.search); if (q.get('fmt') === 'square') { W = 1080; H = 1080; M = 80; } else if (q.get('fmt') === 'tall') { W = 1080; H = 1920; M = 80; }
  cv = document.getElementById('c'); cv.width = W; cv.height = H; x = cv.getContext('2d');
  await loadImg('mark', 'assets/mark.png'); IM.markC = tint(IM.mark, K.bg); IM.markA = tint(IM.mark, K.amber);
  for (const f of ['800 80px PJS', '700 80px PJS', '400 40px Manrope', '500 40px Manrope', '600 40px Manrope', '700 40px Manrope']) await document.fonts.load(f);
  ACC.width = W; ACC.height = H; window.__ready = true;
};
const ACC = document.createElement('canvas'); const ax = ACC.getContext('2d');
const SM = document.createElement('canvas'); SM.width = 160; SM.height = 90; const smx = SM.getContext('2d', { willReadFrequently: true });
function thumb(t) { x.setTransform(1, 0, 0, 1, 0, 0); COMP.draw(t); smx.drawImage(cv, 0, 0, 160, 90); return smx.getImageData(0, 0, 160, 90).data; }
window.__frame = function (t, nmax = 1, shutter = 1 / 60) {    // adaptive 180° shutter motion blur
  let n = 1;
  if (nmax > 1) { const a = thumb(t - shutter / 2), b = thumb(t + shutter / 2); let d = 0; for (let i = 0; i < a.length; i += 4) d += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]); d /= (a.length / 4); n = d < 0.5 ? 1 : Math.min(nmax, Math.ceil(2 + d * 1.6)); }
  if (n <= 1) { x.setTransform(1, 0, 0, 1, 0, 0); COMP.draw(t); return cv.toDataURL('image/jpeg', 0.94); }
  for (let i = 0; i < n; i++) { x.setTransform(1, 0, 0, 1, 0, 0); COMP.draw(t + (i / (n - 1) - 0.5) * shutter); ax.globalAlpha = 1 / (i + 1); ax.drawImage(cv, 0, 0); }
  ax.globalAlpha = 1; return ACC.toDataURL('image/jpeg', 0.94);
};
