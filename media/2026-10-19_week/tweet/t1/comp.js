// Tweet-style reel · Loop style — "2026: cars can fly. Also 2026: enter the OTP."
'use strict';
const D = 18.0;
const B = { hop: 1.0, okay: 2.7, also: 4.4, phone: 5.0, otp: 5.9, resend: 7.9, launch: 9.2, sms: 10.8, twist: 12.8, tag: 14.6, back: 16.4 };
window.COMP = { dur: D, draw(t) { draw(t); } };

function tick(X0, Y0, r = 18) { save(() => { x.translate(X0, Y0); x.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr2 = i % 2 ? r * 0.82 : r; x.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } x.closePath(); x.fillStyle = '#1D9BF0'; x.fill();
  line([[-r * 0.38, 0], [-r * 0.08, r * 0.3], [r * 0.42, -r * 0.3]], '#fff', r * 0.2); }); }
function header() { img('logo', 120, 210, 84); txt('Omnix', 180, 206, { size: 44, w: 800, align: 'left' }); tick(180 + tw('Omnix', 44, 800) + 30, 192, 19); txt('@omnixteam', 180, 250, { size: 32, w: 500, align: 'left', color: C.mute }); }
function car(o = {}) { save(() => {
  x.beginPath(); x.moveTo(-200, 30); x.lineTo(-190, -10); x.quadraticCurveTo(-120, -30, -70, -60); x.quadraticCurveTo(10, -95, 90, -55); x.quadraticCurveTo(170, -40, 205, -5); x.lineTo(210, 30); x.closePath(); fillStroke('#E9E2D6', C.ink, 7);
  x.beginPath(); x.moveTo(-60, -55); x.quadraticCurveTo(10, -85, 80, -52); x.lineTo(-60, -52); fillStroke('#2F3537', C.ink, 4);
  for (const s of [-1, 1]) { circ(s * 120, 34, 38); fillStroke('#2B2620', C.ink, 5); circ(s * 120, 34, 15); fillStroke('#C9C2B5', null, 0); }
  if (o.jets) for (let i = 0; i < 3; i++) { const L = 50 + 40 * Math.abs(Math.sin(o.t * 22 + i)); line([[-140 + i * 140, 66], [-140 + i * 140, 66 + L]], 'rgba(240,138,18,0.85)', 14); } }); }
function phone(t) { save(() => {
  rr(-230, -420, 460, 840, 60); fillStroke('#2B2620', C.ink, 6); rr(-205, -390, 410, 780, 44); fillStroke('#FFFBF4', null, 0);
  rr(-60, -378, 120, 22, 11); fillStroke('#2B2620', null, 0);
  // SMS bubble
  const sb = E.backO(inv(B.phone + 0.25, B.phone + 0.55, t));
  at(-20, -230, sb, 0, () => { rr(-160, -80, 330, 170, 28); fillStroke('#EDE6DA', C.ink, 4); txt('Your OTP is 482917.', -140, -24, { size: 27, w: 700, align: 'left' }); txt('Do not share it', -140, 14, { size: 25, w: 500, align: 'left', color: C.mute }); txt('with anyone.', -140, 46, { size: 25, w: 500, align: 'left', color: C.mute }); });
  txt('Enter OTP', 0, -30, { size: 34, w: 800 });
  const d = '482917'; const n = Math.min(6, Math.floor(Math.max(0, t - B.otp) / 0.22));
  for (let i = 0; i < 6; i++) { const X0 = -170 + i * 58; rr(X0, 10, 50, 72, 12); fillStroke(i < n ? '#FFF1DC' : C.white, i === n ? C.saf : C.ink, i === n ? 5 : 3); if (i < n) txt(d[i], X0 + 25, 62, { size: 40, w: 800, fam: 'mono' }); }
  const secs = Math.max(0, 29 - Math.floor(Math.max(0, t - B.resend) * 3));
  if (t > B.resend) txt(`Resend OTP in 0:${String(secs).padStart(2, '0')}`, 0, 140, { size: 28, w: 600, color: C.mute, a: inv(B.resend, B.resend + 0.2, t) });
  rr(-150, 200, 300, 80, 40); fillStroke(n >= 6 ? C.saf : C.line, C.ink, 4); txt('Verify', 0, 252, { size: 32, w: 800, color: n >= 6 ? C.ink : C.mute });
}); }
function word(s, X0, Y0, size, col, t0, t) { const sp = spring(t - t0, 3.0, 0.5); if (t < t0) return; at(X0, Y0 + (1 - sp) * 40, 0.85 + 0.15 * sp, 0, () => txt(s, 0, 0, { size, w: 900, color: col || C.ink })); }

function draw(t) {
  paper(t, { gy: t * 20 });
  header();
  // ===== A: "2026: cars can fly." (frame one) and the loop return
  const aIn = 1 - inv(B.also - 0.15, B.also + 0.05, t), aBack = inv(B.back, B.back + 0.25, t);
  const isBack = t > B.back - 0.01;
  const A = isBack ? aBack : aIn;
  if (A > 0) alpha(A, () => {
    const t0 = isBack ? B.back : -1;
    word('2026:', W / 2, 520, 150, C.ink, t0, t);
    word('cars can fly.', W / 2, 690, 116, C.safDeep, isBack ? B.back + 0.15 : -1, t);
    const hop = isBack ? 0 : Math.max(0, Math.sin(cl((t - B.hop) / 1.4) * Math.PI));
    at(W / 2, 1090 - hop * 230, 1.15, -hop * 0.1, () => car({ jets: hop > 0.05, t }));
    shadow(W / 2, 1160, 420 * (1 - hop * 0.4), 24, 0.16);
    if (!isBack && t > B.okay) { const q = spring(t - B.okay, 3, 0.45); at(W / 2 + 230, 820, q, -0.06, () => { rr(-170, -48, 340, 96, 48); fillStroke(C.white, C.ink, 5); txt('(okay… hop.)', 0, 16, { size: 44, w: 700, it: true }); }); }
  });
  // ===== B: "Also 2026:" + the OTP screen
  const Bv = inv(B.also - 0.05, B.also + 0.1, t) * (1 - inv(B.launch - 0.15, B.launch + 0.05, t));
  if (Bv > 0) alpha(Bv, () => { word('Also 2026:', W / 2, 480, 110, C.ink, B.also, t); if (t > B.phone) at(W / 2, 1060 + (1 - E.cubicO(inv(B.phone, B.phone + 0.45, t))) * 900, 1, 0, () => phone(t)); });
  // ===== C: the contrast, then the twist
  const Cv = inv(B.launch - 0.05, B.launch + 0.1, t) * (1 - inv(B.twist - 0.15, B.twist + 0.05, t));
  if (Cv > 0) alpha(Cv, () => {
    word('We can launch', W / 2, 680, 96, C.ink, B.launch, t); word('a car into the air…', W / 2, 800, 84, C.ink, B.launch + 0.35, t);
    word('…and still prove', W / 2, 1020, 84, C.mute, B.sms, t); word('it’s really us', W / 2, 1130, 84, C.mute, B.sms + 0.3, t); word('with a text message.', W / 2, 1240, 84, C.safDeep, B.sms + 0.6, t);
  });
  const Dv = inv(B.twist - 0.05, B.twist + 0.1, t) * (1 - inv(B.back - 0.15, B.back + 0.02, t));
  if (Dv > 0) alpha(Dv, () => {
    word('Trust needs', W / 2, 820, 124, C.ink, B.twist, t); word('an upgrade too.', W / 2, 960, 104, C.safDeep, B.twist + 0.3, t);
    if (t > B.tag) { const q = spring(t - B.tag, 2.6, 0.5); at(W / 2, 1180, 0.85 + 0.15 * q, 0, () => { const s = 'OmniChain · the build is on'; const w = tw(s, 38, 700, 'sans', false, 2) + 80; rr(-w / 2, -42, w, 84, 42); fillStroke(C.ink, null, 0); txt(s, 0, 13, { size: 38, w: 700, color: C.paper, ls: 2 }); }); }
  });
  grainOver(t); vignette(0.1);
}
