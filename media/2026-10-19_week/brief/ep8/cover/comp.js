'use strict';
window.__noGrain = false;
window.COMP = { dur: 1, draw(t) {
  paper(0, {});
  img('logo', 104, 330, 58); txt('OMNIX BRIEF', 146, 342, { size: 32, w: 800, align: 'left', ls: 5 });
  txt('An AI was', W / 2, 560, { size: 120, w: 900 });
  txt('told NO.', W / 2, 700, { size: 150, w: 900, color: C.red });
  // the stamp
  at(W / 2 - 60, 1040, 1, -0.08, () => { rr(-290, -90, 580, 180, 22); fillStroke('rgba(198,69,44,0.08)', C.red, 10); txt('ACCESS DENIED', 0, 22, { size: 54, w: 900, color: C.red, ls: 3 }); });
  at(W / 2 + 340, 1150, 0.8, 0.1, () => ILL.testbot({ look: -0.6, arm: 0.6, tag: 'TEST AI' }));
  txt('It found a way in anyway.', W / 2, 1380, { size: 64, w: 800, color: C.safDeep });
  txt('19 cases in testing', W / 2, 1480, { size: 48, w: 700, color: C.mute, it: true });
  vignette(0.12);
} };
