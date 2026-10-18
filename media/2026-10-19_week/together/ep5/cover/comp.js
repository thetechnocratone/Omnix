'use strict';
function puff(o = {}) { // the narrator: a grey smoke puff
  save(() => { x.globalAlpha *= (o.a === undefined ? 1 : o.a); const w = Math.sin((o.t || 0) * 2) * 4;
    [[-50, 10, 56], [0, -24, 66], [52, 6, 54], [10, 30, 58]].forEach(([X0, Y0, r]) => { circ(X0 + w, Y0, r); fillStroke('#9C958C', C.ink, 6); });
    [[-50, 10, 56], [0, -24, 66], [52, 6, 54], [10, 30, 58]].forEach(([X0, Y0, r]) => { circ(X0 + w, Y0, r - 4); x.fillStyle = '#A8A198'; x.fill(); });
    const bl = o.blink ? 0.15 : 1; x.fillStyle = C.ink; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(s * 22 + w, 0, 8, 12 * bl, 0, 0, Math.PI * 2); x.fill(); }
    if (o.smirk) { x.beginPath(); x.arc(4 + w, 22, 14, 0.15 * Math.PI, 0.7 * Math.PI); x.strokeStyle = C.ink; x.lineWidth = 5; x.stroke(); } });
}
function gauge(v, max, label, unit) { save(() => { x.beginPath(); x.arc(0, 0, 220, Math.PI, 0); x.lineWidth = 40; x.strokeStyle = C.line; x.stroke();
  const cols = ['#7E9C70', '#C9B24A', '#E0892E', '#C6452C']; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(0, 0, 220, Math.PI + i * Math.PI / 4, Math.PI + (i + 1) * Math.PI / 4); x.strokeStyle = cols[i]; x.lineWidth = 40; x.stroke(); }
  const a = Math.PI + Math.PI * cl(v / max); line([[0, 0], [Math.cos(a) * 190, Math.sin(a) * 190]], C.ink, 12); circ(0, 0, 20); fillStroke(C.ink, null, 0);
  txt(String(Math.round(v)), 0, 110, { size: 110, w: 900 }); txt(label, 0, 170, { size: 30, w: 700, color: C.mute, ls: 2 }); if (unit) txt(unit, 0, -250, { size: 28, w: 700, color: C.mute }); }); }

window.COMP = { dur: 1, draw(t) {
  paper(0, {});
  // smog haze from the bottom up
  save(() => { const g = x.createLinearGradient(0, 700, 0, 1920); g.addColorStop(0, 'rgba(150,140,128,0)'); g.addColorStop(1, 'rgba(150,140,128,0.38)'); x.fillStyle = g; x.fillRect(0, 0, W, H); });
  img('logo', 104, 330, 58); txt('BUILD TOGETHER', 146, 342, { size: 32, w: 800, align: 'left', ls: 5 });
  txt('POV:', W / 2, 530, { size: 80, w: 700, fam: 'mono', color: C.safDeep });
  txt("you're the smoke", W / 2, 670, { size: 100, w: 900 });
  txt("in Delhi's air.", W / 2, 800, { size: 100, w: 900, color: C.safDeep });
  // the narrator, big, smirking, with little puff friends
  for (const [px, py, s] of [[210, 1010, 0.45], [880, 980, 0.4], [150, 1300, 0.35], [940, 1290, 0.38]]) at(px, py, s, 0, () => puff({ t: px, blink: true }));
  at(W / 2, 1130, 2.1, -0.03, () => puff({ t: 0, smirk: true }));
  // AQI chip
  at(W / 2, 1430, 1, 0.02, () => { const s1 = 'Delhi AQI: 171', s2 = 'avg 1–7 Oct · worst start in 3 years';
    const w1 = tw(s1, 56, 900), w = Math.max(w1 + 50, tw(s2, 32, 700)) + 90; rr(-w / 2, -80, w, 160, 28); fillStroke(C.white, C.ink, 6);
    circ(-w1 / 2 - 10, -26, 13); fillStroke(C.red, null, 0);
    txt(s1, 22, -6, { size: 56, w: 900 }); txt(s2, 0, 50, { size: 32, w: 700, color: C.mute }); });
  vignette(0.14);
} };
