'use strict';
function car(s) { at(W / 2, 1060, s, -0.06, () => {
  x.beginPath(); x.moveTo(-200, 30); x.lineTo(-190, -10); x.quadraticCurveTo(-120, -30, -70, -60); x.quadraticCurveTo(10, -95, 90, -55); x.quadraticCurveTo(170, -40, 205, -5); x.lineTo(210, 30); x.closePath(); fillStroke('#E9E2D6', C.ink, 7);
  x.beginPath(); x.moveTo(-60, -55); x.quadraticCurveTo(10, -85, 80, -52); x.lineTo(-60, -52); fillStroke('#2F3537', C.ink, 4);
  for (const s2 of [-1, 1]) { circ(s2 * 120, 34, 38); fillStroke('#2B2620', C.ink, 5); circ(s2 * 120, 34, 15); fillStroke('#C9C2B5', null, 0);
    line([[s2 * 150, -40], [s2 * 150, -110]], C.ink, 7); rr(s2 * 150 - 90, -122, 180, 16, 8); fillStroke(C.saf, C.ink, 4); }
  for (let i = 0; i < 3; i++) line([[-120 + i * 120, 90], [-120 + i * 120, 150 + i * 10]], 'rgba(240,138,18,0.8)', 12);
}); }
window.COMP = { dur: 1, draw(t) {
  paper(0, {});
  img('logo', 104, 330, 58); txt('OMNIX EXPLAINS', 146, 342, { size: 32, w: 800, align: 'left', ls: 5 });
  txt("Why don't we", W / 2, 560, { size: 112, w: 900 });
  txt('have flying', W / 2, 690, { size: 112, w: 900 });
  txt('cars yet?', W / 2, 820, { size: 130, w: 900, color: C.safDeep });
  car(1.35); shadow(W / 2, 1300, 380, 22, 0.14);
  const tags = [['HEAVY', -300], ['HUNGRY', 0], ['HARD', 300]];
  tags.forEach(([s, dx], i) => at(W / 2 + dx, 1440, 1, (i - 1) * 0.06, () => { const w = tw(s, 46, 900, 'sans', false, 3) + 60; rr(-w / 2, -44, w, 88, 14); fillStroke(C.white, C.ink, 5); txt(s, 0, 16, { size: 46, w: 900, ls: 3 }); }));
  vignette(0.12);
} };
