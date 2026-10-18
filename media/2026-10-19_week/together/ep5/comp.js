// Build Together ep 5 · POV style — "POV: you're the smoke in Delhi's air."
'use strict';
const D = 49.3;
const B = { d1: 3.7, d2: 7.3, d3: 14.2, size: 19.3, lungs: 24.8, scared: 29.1, list: 30.8, omnix: 40.4, alone: 42.8, many: 45.0, back: 47.3 };
window.COMP = { dur: D, draw(t) { draw(t); } };
const MONO = 'mono';
function typed(s, t0, t, cps = 34) { return s.slice(0, Math.max(0, Math.floor((t - t0) * cps))); }
function puff(o = {}) { // the narrator: a grey smoke puff
  save(() => { x.globalAlpha *= (o.a === undefined ? 1 : o.a); const w = Math.sin((o.t || 0) * 2) * 4;
    [[-50, 10, 56], [0, -24, 66], [52, 6, 54], [10, 30, 58]].forEach(([X0, Y0, r]) => { circ(X0 + w, Y0, r); fillStroke('#9C958C', C.ink, 6); });
    [[-50, 10, 56], [0, -24, 66], [52, 6, 54], [10, 30, 58]].forEach(([X0, Y0, r]) => { circ(X0 + w, Y0, r - 4); x.fillStyle = '#A8A198'; x.fill(); });
    const bl = o.blink ? 0.15 : 1; x.fillStyle = C.ink; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(s * 22 + w, 0, 8, 12 * bl, 0, 0, Math.PI * 2); x.fill(); }
    if (o.smirk) { x.beginPath(); x.arc(4 + w, 22, 14, 0.15 * Math.PI, 0.7 * Math.PI); x.strokeStyle = C.ink; x.lineWidth = 5; x.stroke(); } });
}
function diary(day, s, t0, t) { // a diary header + typed line
  const q = inv(t0, t0 + 0.2, t);
  alpha(q, () => { txt(day, 120, 470, { size: 38, w: 700, fam: MONO, align: 'left', color: C.safDeep });
    const lines = s.split('\n'); let off = 0;
    lines.forEach((L, i) => { const st = t0 + 0.2 + off / 34; txt(typed(L, st, t), 120, 560 + i * 78, { size: 58, w: 800, align: 'left' }); off += L.length; }); });
}
function field(t, fire) { save(() => { x.fillStyle = '#D9C08A'; x.fillRect(80, 1180, 920, 40); for (let i = 0; i < 40; i++) line([[100 + i * 23, 1180], [96 + i * 23 + (i % 3) * 4, 1140]], '#B89A5C', 5);
  if (fire > 0) for (let i = 0; i < 9; i++) { const X0 = 160 + i * 95, h = (50 + 30 * Math.sin(t * 9 + i)) * fire; x.beginPath(); x.moveTo(X0 - 26, 1180); x.quadraticCurveTo(X0, 1180 - h * 2, X0 + 26, 1180); fillStroke(i % 2 ? C.saf : C.red, null, 0); } }); }
function gauge(v, max, label, unit) { save(() => { x.beginPath(); x.arc(0, 0, 220, Math.PI, 0); x.lineWidth = 40; x.strokeStyle = C.line; x.stroke();
  const cols = ['#7E9C70', '#C9B24A', '#E0892E', '#C6452C']; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(0, 0, 220, Math.PI + i * Math.PI / 4, Math.PI + (i + 1) * Math.PI / 4); x.strokeStyle = cols[i]; x.lineWidth = 40; x.stroke(); }
  const a = Math.PI + Math.PI * cl(v / max); line([[0, 0], [Math.cos(a) * 190, Math.sin(a) * 190]], C.ink, 12); circ(0, 0, 20); fillStroke(C.ink, null, 0);
  txt(String(Math.round(v)), 0, 110, { size: 110, w: 900 }); txt(label, 0, 170, { size: 30, w: 700, color: C.mute, ls: 2 }); if (unit) txt(unit, 0, -250, { size: 28, w: 700, color: C.mute }); }); }
function hands(n, p) { const sk = ['#C68B59', '#8D5524', '#E0AC69', '#A8754C', '#F1C27D'];
  save(() => { x.beginPath(); x.rect(0, 0, W, 1200); x.clip();
  for (let i = 0; i < n; i++) { const q = E.backO(cl(p * 1.6 - i * 0.06)); const X0 = 140 + i * (800 / (n - 1)), lift = q * (170 + 40 * hash(i)), Y0 = 1260 - lift;
    save(() => { x.translate(X0, Y0); x.rotate((hash(i + 7) - 0.5) * 0.25); const c = sk[i % 5];
      rr(-24, 0, 48, 200, 18); fillStroke(c, C.ink, 5);            // forearm
      rr(-36, -70, 72, 84, 26); fillStroke(c, C.ink, 5);           // palm
      for (let f = 0; f < 4; f++) { rr(-34 + f * 18, -118, 14, 56, 7); fillStroke(c, C.ink, 4); }
      x.save(); x.translate(36, -30); x.rotate(-0.6); rr(-7, -36, 14, 44, 7); fillStroke(c, C.ink, 4); x.restore(); }); } }); }

function draw(t) {
  paper(t, { gy: t * 12 });
  // haze that thickens through the film, then clears at the end
  const haze = 0.18 * inv(B.d2, B.d3 + 1, t) * (1 - inv(B.alone, B.back, t));
  if (haze > 0) save(() => { x.fillStyle = `rgba(150,140,128,${haze})`; x.fillRect(0, 0, W, H); });
  // ===== title (frame one) and the loop return
  const TA = (1 - inv(B.d1 - 0.2, B.d1, t)) + inv(B.back, B.back + 0.3, t);
  if (TA > 0) alpha(cl(TA), () => { const back = t > B.back;
    txt('POV:', W / 2, 540, { size: 70, w: 700, fam: MONO, color: C.safDeep });
    txt("you're the smoke", W / 2, 680, { size: 104, w: 800 }); txt("in Delhi's air.", W / 2, 800, { size: 104, w: 800, color: C.safDeep });
    at(W / 2, 1110, 1.3, 0, () => puff({ t, blink: (t % 2.2) < 0.1, smirk: true }));
    if (back) txt('(not for long, hopefully)', W / 2, 1330, { size: 40, w: 600, it: true, color: C.mute, a: inv(B.back + 0.6, B.back + 1.0, t) }); });
  // ===== day 1: born in a crop fire
  const s1 = inv(B.d1 - 0.1, B.d1 + 0.1, t) * (1 - inv(B.d2 - 0.15, B.d2, t));
  if (s1 > 0) alpha(s1, () => { diary('DAY 1', 'Born in a\ncrop-stubble fire.', B.d1, t); field(t, 1);
    const rise = E.cubicO(inv(B.d1 + 0.6, B.d2, t)); at(W / 2, 1120 - rise * 200, 0.6 + rise * 0.4, 0, () => puff({ t, blink: false, a: rise })); });
  // ===== day 2: the monsoon left, wind below 10 km/h
  const s2 = inv(B.d2 - 0.1, B.d2 + 0.1, t) * (1 - inv(B.d3 - 0.15, B.d3, t));
  if (s2 > 0) alpha(s2, () => { diary('DAY 2', 'The monsoon left.\nThe wind dropped.', B.d2, t);
    const v = lerp(24, 7, E.cubicIO(inv(B.d2 + 0.8, B.d3 - 0.6, t)));
    at(W / 2 - 150, 1180, 0.85, 0, () => gauge(v, 30, 'WIND · km/h', ''));
    at(W / 2 + 300, 1000, 0.9, 0, () => puff({ t, smirk: v < 10, blink: (t % 2) < 0.1 }));
    if (v < 10) txt('below 10 km/h: I stay put', W / 2, 1440, { size: 36, w: 700, color: C.mute }); });
  // ===== day 3: Delhi, worst start to October in 3 years
  const s3 = inv(B.d3 - 0.1, B.d3 + 0.1, t) * (1 - inv(B.size - 0.15, B.size, t));
  if (s3 > 0) alpha(s3, () => { diary('DAY 3', 'Delhi. Worst start\nto October in 3 years.', B.d3, t);
    const v = lerp(0, 171, E.cubicO(inv(B.d3 + 1.2, B.d3 + 2.6, t)));
    at(W / 2, 1200, 0.95, 0, () => gauge(v, 300, 'AVG AQI · 1–7 OCT', ''));
    // a few puff friends
    for (let i = 0; i < 4; i++) at(180 + i * 240, 980 + Math.sin(t * 2 + i) * 10, 0.35, 0, () => puff({ t: t + i, blink: (t + i) % 2.4 < 0.1 })); });
  // ===== size: 2.5 microns, ~30x thinner than a hair
  const s4 = inv(B.size - 0.1, B.size + 0.1, t) * (1 - inv(B.lungs - 0.15, B.lungs, t));
  if (s4 > 0) alpha(s4, () => { diary('ABOUT ME', "I'm 2.5 microns.\n~30× thinner than a hair.", B.size, t);
    const z = E.cubicIO(inv(B.size + 1.0, B.size + 2.2, t));
    save(() => { rr(170, 900, 740, 46 + z * 0, 23); fillStroke('#6B5A45', null, 0); txt('a human hair', 540, 880, { size: 30, w: 700, color: C.mute }); });
    circ(540, 1080, lerp(40, 3.5, z)); fillStroke(C.ink, null, 0); txt('me (to scale)', 540, 1160, { size: 30, w: 700, color: C.mute, a: z }); });
  // ===== lungs: small enough to slip past your nose
  const s5 = inv(B.lungs - 0.1, B.lungs + 0.1, t) * (1 - inv(B.scared - 0.15, B.scared, t));
  if (s5 > 0) alpha(s5, () => { diary('MY JOB', 'Slip past your nose.\nGo deep into your lungs.', B.lungs, t);
    at(W / 2, 1120, 1, 0, () => { // simple lungs
      for (const s of [-1, 1]) { x.beginPath(); x.ellipse(s * 120, 40, 100, 170, s * 0.12, 0, Math.PI * 2); fillStroke('#F2C9B8', C.ink, 6); }
      line([[0, -200], [0, -60], [-60, -10]], C.ink, 10); line([[0, -60], [60, -10]], C.ink, 10);
      const p = inv(B.lungs + 1.2, B.scared - 0.4, t); for (let i = 0; i < 18; i++) { const q = cl(p * 2 - i / 18); if (q <= 0) continue; const s = i % 2 ? 1 : -1; circ(lerp(0, s * (60 + hash(i) * 110), q), lerp(-260, -40 + hash(i + 3) * 200, q), 7); fillStroke('#6E675F', null, 0); } }); });
  // ===== what I'm scared of
  const s6 = inv(B.scared - 0.1, B.scared + 0.1, t) * (1 - inv(B.alone - 0.15, B.alone, t));
  if (s6 > 0) alpha(s6, () => { txt("WHAT I'M SCARED OF", 120, 470, { size: 38, w: 700, fam: MONO, align: 'left', color: C.safDeep });
    [['Sensors on every street', 30.8], ['Forecasts that warn you days ahead', 33.0], ['Farmers paid for cleaner options', 35.5], ['One shared record of who cut what,', 38.0], ['that nobody can quietly edit', 40.3]].forEach(([s, st], i) => {
      if (t < st) return; const sp = spring(t - st, 3, 0.5); at(120, 570 + i * 96 + (i === 4 ? -14 : 0), 1, 0, () => alpha(sp, () => { if (i < 4) { rr(0, -40, 40, 40, 8); fillStroke(C.white, C.ink, 4); line([[8, -20], [18, -8], [34, -32]], '#3F6B32', 6); }
        txt(s, i < 4 ? 64 : 64, 0, { size: i === 4 ? 36 : 42, w: i === 4 ? 600 : 800, align: 'left', it: i === 4, color: i === 4 ? C.mute : C.ink }); })); });
    at(860, 1210, 0.85, Math.sin(t * 12) * 0.05, () => puff({ t, blink: false }));
    if (t > B.omnix) alpha(inv(B.omnix, B.omnix + 0.3, t), () => { rr(110, 1080, 600, 230, 24); fillStroke('rgba(255,251,244,0.95)', C.ink, 4);
      txt('A.L.K.I. is being built to forecast.', 140, 1140, { size: 30, w: 700, align: 'left' }); txt('OmniChain is designed to keep', 140, 1190, { size: 30, w: 700, align: 'left' }); txt('that record honest.', 140, 1236, { size: 30, w: 700, align: 'left' }); txt('OMNIX · IN THE MAKING', 140, 1284, { size: 22, w: 700, ls: 3, align: 'left', color: C.mute }); }); });
  // ===== nobody beats me alone → many hands, one sky
  const s7 = inv(B.alone - 0.1, B.alone + 0.1, t) * (1 - inv(B.back - 0.15, B.back, t));
  if (s7 > 0) alpha(s7, () => { const p = inv(B.alone + 0.8, B.back - 0.6, t);
    // sunrise behind
    save(() => { x.beginPath(); x.rect(0, 0, W, 1200); x.clip(); circ(W / 2, 1200 - p * 160, 260); fillStroke('rgba(240,138,18,0.32)', null, 0); });
    hands(10, p); line([[80, 1200], [1000, 1200]], C.ink, 4);
    txt('Nobody beats me alone.', W / 2, 560, { size: 74, w: 800, a: inv(B.alone, B.alone + 0.3, t) });
    txt('Many hands. One sky.', W / 2, 680, { size: 74, w: 800, color: C.safDeep, a: inv(B.many, B.many + 0.3, t) });
    at(W / 2 + E.cubicIO(p) * 700, 900 - p * 120, 0.6, 0, () => puff({ t, a: 1 - p })); });
  // header + source
  img('logo', 104, 150, 58); txt('BUILD TOGETHER', 146, 162, { size: 30, w: 800, align: 'left', ls: 5 });
  txt('Data: CREA analysis of CPCB data via PTI (7 Oct 2026); particle size: US EPA', 75, 214, { size: 21, w: 600, align: 'left', color: C.mute });
  grainOver(t); vignette(0.12);
}
