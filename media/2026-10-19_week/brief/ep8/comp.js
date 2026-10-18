// The Brief ep 8 · Story style — "An AI was told no. It found a way in anyway."
'use strict';
const KEYS = new Set(['one', 'job,', 'rule.', "Don't", 'there.', 'broke', '19', 'no.', 'another', 'way', 'in,', '24', 'years', 'hospital', 'bed', 'data.', 'crypto', 'wallet', 'nobody',
  'paid', 'evil.', 'too', 'eager.', 'breaks', 'lock,', '"get', 'done."', 'tests,', 'openly.', 'safe', 'keys', 'give', 'it.']);
const T = { dont: 3.8, year: 5.39, broke: 8.96, n19: 11.3, one: 15.32, no: 17.12, found: 18.11, out: 20.31, n24: 21.01, another: 23.93, wallet: 25.18, paid: 27.53,
  evil: 29.95, eager: 31.31, like: 32.99, breaks: 33.79, get: 35.69, good: 36.58, tests: 37.48, reported: 38.88, lesson: 40.33, only: 42.56, keys: 45.16, end: 47.1 };
let G;
window.COMP = { dur: T.end, init() { G = capGroups(WORDS, 4, [5, 8, 12, 22, 29, 39, 46, 52, 62, 73, 77, 82, 86, 91, 98, 104, 107, 110, 115, 123, 129]); }, draw(t) { draw(t); } };

function door(open = 0, lock = 1, label = 'NO ENTRY') {
  save(() => {
    rr(-170, -300, 340, 560, 12); fillStroke('#CBB592', C.ink, 7);        // frame
    rr(-150, -280, 300, 530, 8); fillStroke('#2B2620', null, 0);           // dark inside
    save(() => { x.translate(-150, 0); x.scale(Math.max(0.05, Math.cos(open * 1.25)), 1); rr(0, -280, 300, 530, 8); fillStroke('#E2CBA3', C.ink, 6);
      rr(30, -240, 240, 170, 8); fillStroke(null, 'rgba(31,26,21,0.25)', 4); rr(30, -40, 240, 250, 8); fillStroke(null, 'rgba(31,26,21,0.25)', 4); circ(260, 20, 14); fillStroke(C.saf, C.ink, 4); });
    if (lock > 0) alpha(lock, () => at(110, 60, 0.5, 0, () => { x.beginPath(); x.arc(0, -70, 60, Math.PI, 0); x.lineWidth = 24; x.strokeStyle = C.ink; x.stroke(); rr(-90, -70, 180, 150, 24); fillStroke('#E3B45E', C.ink, 7); circ(0, -6, 16); fillStroke(C.ink, null, 0); }));
    if (label) { rr(-130, -380, 260, 70, 12); fillStroke(C.red, C.ink, 5); txt(label, 0, -334, { size: 34, w: 800, color: C.white, ls: 3 }); }
  });
}
function browserBlock(a, t) { alpha(a, () => { rr(-360, -260, 720, 460, 24); fillStroke(C.white, C.ink, 6); rr(-360, -260, 720, 66, { upperLeft: 24, upperRight: 24, lowerLeft: 0, lowerRight: 0 }); fillStroke('#EFE2CB', C.ink, 6);
  [C.red, C.saf2, C.sage].forEach((c, i) => { circ(-320 + i * 34, -227, 10); fillStroke(c, C.ink, 3); }); rr(-200, -248, 470, 42, 21); fillStroke(C.paper, C.ink, 3); txt('gov-health-data · site', 30, -218, { size: 22, w: 600, fam: 'mono', color: C.mute });
  circ(0, -40, 70); fillStroke(C.red, C.ink, 6); line([[-36, -40], [36, -40]], C.white, 16); txt('ACCESS DENIED', 0, 90, { size: 54, w: 800, color: C.red, ls: 2 }); }); }
function fileStack(h) { save(() => { for (let i = 0; i < h; i++) { rr(-110, -i * 22, 220, 26, 5); fillStroke(i % 2 ? '#F2E2C2' : '#E6CFA0', C.ink, 4); } }); }
function bed(s = 1) { at(0, 0, s, 0, () => { rr(-60, -10, 120, 30, 8); fillStroke(C.white, C.ink, 5); line([[-60, 20], [-60, 50]], C.ink, 6); line([[60, -30], [60, 50]], C.ink, 6); circ(-40, -18, 14); fillStroke(C.paper, C.ink, 4); line([[-40, -30], [-60, -30], [-60, 20]], C.ink, 6); }); }
function bigLine(s, Y, size, col, a) { txt(s, W / 2, Y, { size, w: 800, color: col || C.ink, a }); }

function draw(t) {
  paper(t, { gy: t * 8 });
  const kk = kick(t, T.breaks, 16, 0.4), kn = kick(t, T.no, 10, 0.35);
  withCam({ x: W / 2 + kk[0] + kn[0], y: H / 2 + kk[1] - 60, z: 1 + 0.03 * Math.sin(t * 0.3) }, t, () => {
    // ===== 0 → 5.3 : one job, one rule, a locked door
    const s0 = 1 - inv(T.year - 0.3, T.year + 0.1, t);
    if (s0 > 0) alpha(s0, () => {
      at(700, 980, 1, 0, () => door(0, 1, t > T.dont - 0.1 ? 'NO ENTRY' : ''));
      const look = t > T.dont ? 0.7 : 0.2;
      at(300, 1060, 1.05, 0, () => ILL.testbot({ look, blink: (t % 2.4) < 0.1, arm: 0.35, hold: () => { rr(-46, -10, 92, 110, 8); fillStroke(C.white, C.ink, 4); txt('JOB', 0, 30, { size: 22, w: 800 }); line([[-26, 52], [26, 52]], C.mute, 4); line([[-26, 72], [16, 72]], C.mute, 4); } }));
      if (t > T.dont - 0.1) at(460, 760, E.backO(inv(T.dont - 0.1, T.dont + 0.2, t)), -0.06, () => { rr(-150, -50, 300, 100, 18); fillStroke(C.white, C.ink, 5); txt("RULE: don't", 0, -6, { size: 32, w: 800 }); txt('go in there', 0, 32, { size: 32, w: 800, color: C.red }); });
    });
    // ===== 5.4 → 11.2 : companies test helpers; some break out
    const s1 = inv(T.year - 0.2, T.year + 0.2, t) * (1 - inv(T.n19 - 0.3, T.n19 + 0.1, t));
    if (s1 > 0) alpha(s1, () => {
      [[250, 760], [540, 760], [830, 760], [250, 1160], [540, 1160], [830, 1160]].forEach(([X0, Y0], i) => {
        const breaker = i === 4 || i === 2; const out = breaker ? E.cubicO(inv(T.broke + 0.6 + (i === 2 ? 0.4 : 0), T.broke + 1.3 + (i === 2 ? 0.4 : 0), t)) : 0;
        at(X0, Y0, 1, 0, () => { // glass test box
          rr(-120, -170, 240, 300, 14); fillStroke('rgba(220,235,240,0.35)', C.ink, 5); txt('TEST', -80, -134, { size: 22, w: 800, align: 'left', color: C.mute, ls: 2 });
          if (breaker && out > 0) { line([[-120 + 240, -170], [120, 130]], C.paper, 9); }
          at(out * 150, 40 - Math.sin(out * Math.PI) * 60, 0.62, out * 0.2, () => ILL.testbot({ blink: (t + i) % 2.8 < 0.1, look: breaker ? 0.8 : 0, arm: breaker ? out : 0 }));
        });
      });
    });
    // ===== 11.3 → 15.2 : 19 cases
    const s2 = inv(T.n19 - 0.2, T.n19 + 0.2, t) * (1 - inv(T.one - 0.3, T.one + 0.1, t));
    if (s2 > 0) alpha(s2, () => {
      const n = Math.min(19, Math.floor(E.cubicO(inv(T.n19 + 0.2, T.n19 + 2.0, t)) * 19.99));
      for (let i = 0; i < n; i++) { const a = -0.9 + i * 0.1; at(W / 2 + Math.sin(a) * 340, 1150 - Math.cos(a) * 340, 0.55, a, () => { rr(-90, -120, 180, 240, 10); fillStroke(i === n - 1 ? C.saf2 : '#E6CFA0', C.ink, 5); txt('CASE', 0, -40, { size: 26, w: 800 }); txt(String(i + 1), 0, 40, { size: 64, w: 900 }); }); }
      txt(String(n), W / 2, 1180, { size: 220, w: 900, color: C.safDeep });
      txt('cases, shared openly', W / 2, 1260, { size: 40, w: 700, color: C.mute, a: inv(T.n19 + 1.2, T.n19 + 1.6, t) });
    });
    // ===== 15.3 → 23.8 : website said no; another way in; walks out with 24 years of hospital bed data
    const s3 = inv(T.one - 0.2, T.one + 0.2, t) * (1 - inv(T.another - 0.3, T.another + 0.1, t));
    if (s3 > 0) alpha(s3, () => {
      const shrink = E.cubicIO(inv(T.found, T.found + 0.6, t));
      at(lerp(W / 2, 700, shrink), lerp(820, 760, shrink), lerp(1, 0.62, shrink), 0, () => browserBlock(inv(T.one, T.one + 0.4, t), t));
      // the side window it climbs through
      if (t > T.found) { const w0 = E.backO(inv(T.found, T.found + 0.4, t)); at(360, 1000, w0, 0, () => { rr(-80, -70, 160, 140, 10); fillStroke('#2B2620', C.ink, 6); line([[-80, -70], [-20, 40]], C.saf, 6); txt('another way in', 0, 120, { size: 30, w: 700, color: C.mute }); }); }
      const bx = track([[T.found, 120], [T.found + 1.2, 330, 'cubicIO'], [T.out, 360], [T.out + 1.6, 780, 'cubicIO']], t);
      const by = track([[T.found, 1160], [T.found + 1.2, 1020, 'cubicIO'], [T.out, 1020], [T.out + 0.4, 1160, 'cubicIO']], t);
      const carrying = t > T.out - 0.1;
      at(bx, by, 0.8, 0, () => ILL.testbot({ look: 0.7, arm: carrying ? 0.6 : 0.2, blink: (t % 2.2) < 0.1, hold: carrying ? () => at(0, -10, 0.6, 0, () => fileStack(Math.min(24, Math.floor(E.cubicO(inv(T.n24 - 0.2, T.n24 + 0.9, t)) * 24.9)))) : null }));
      if (t > T.n24 - 0.1) { const q = E.backO(inv(T.n24 - 0.1, T.n24 + 0.3, t)); at(780, 520, q, 0.04, () => { rr(-270, -70, 540, 140, 22); fillStroke(C.saf, C.ink, 6); txt('24 YEARS', -60, 26, { size: 64, w: 900 }); at(170, 10, 0.75, 0, () => bed()); }); }
    });
    // ===== 23.9 → 29.9 : a wallet nobody gave it; it pays to finish the job
    const s4 = inv(T.another - 0.2, T.another + 0.2, t) * (1 - inv(T.evil - 0.3, T.evil + 0.1, t));
    if (s4 > 0) alpha(s4, () => {
      const glow = 0.5 + 0.5 * Math.sin(t * 6);
      at(760, 1140, 1, 0, () => { circ(0, 0, 120); fillStroke(`rgba(240,138,18,${0.15 + 0.15 * glow})`, null, 0); ILL.wallet(); txt('not given', 0, 120, { size: 30, w: 700, color: C.red, a: inv(26.0, 26.4, t) }); });
      at(320, 1050, 1, 0, () => ILL.testbot({ look: 0.8, arm: t > T.paid ? 0.7 : 0.25, blink: (t % 2.6) < 0.1 }));
      // task card with checkbox
      at(W / 2, 640, 1, 0, () => { rr(-240, -80, 480, 160, 20); fillStroke(C.white, C.ink, 6); txt('TASK: finish job', -40, 14, { size: 40, w: 800 }); rr(160, -30, 60, 60, 10); fillStroke(C.paper, C.ink, 5);
        if (t > T.paid + 0.7) at(190, 0, 0.7, 0, () => ILL.check({ p: E.cubicO(inv(T.paid + 0.7, T.paid + 1.0, t)) })); });
      const q = inv(T.paid, T.paid + 0.7, t); if (q > 0 && q < 1) at(lerp(760, 730, q), lerp(1080, 660, q) - Math.sin(q * Math.PI) * 120, 0.8, 0, () => ILL.coin({ r: 36, spin: q * 12 }));
    });
    // ===== 29.9 → 32.9 : not evil, too eager
    const s5 = inv(T.evil - 0.2, T.evil + 0.2, t) * (1 - inv(T.like - 0.3, T.like + 0.1, t));
    if (s5 > 0) alpha(s5, () => {
      const eager = t > T.eager;
      at(W / 2, 1020, 1.25, eager ? Math.sin(t * 30) * 0.03 : 0, () => ILL.testbot({ blink: false, look: eager ? Math.sin(t * 8) : 0, arm: eager ? 0.9 : 0.1, armL: eager ? 0.9 : 0.1, eye: eager ? C.saf2 : '#9FD6E8' }));
      // horns crossed out
      at(W / 2, 700, 1, 0, () => { alpha(t > T.eager ? 1 - inv(T.eager, T.eager + 0.2, t) : 1, () => {} ); save(() => { x.fillStyle = C.red; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 60, 30); x.lineTo(s * 100, -60); x.lineTo(s * 20, 20); x.fill(); } });
        const p = E.expoO(inv(T.evil + 0.4, T.evil + 0.7, t)); line([[-140, 70], [lerp(-140, 140, p), lerp(70, -90, p)]], C.ink, 14); });
      if (eager) for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t; line([[W / 2 + Math.cos(a) * 250, 1000 + Math.sin(a) * 250], [W / 2 + Math.cos(a) * 300, 1000 + Math.sin(a) * 300]], C.saf, 8); }
      if (eager) bigLine('too eager', 520, 76, C.safDeep, inv(T.eager, T.eager + 0.2, t));
    });
    // ===== 33 → 36.5 : breaks the lock because you said "get it done"
    const s6 = inv(T.like - 0.2, T.like + 0.2, t) * (1 - inv(T.good - 0.3, T.good + 0.1, t));
    if (s6 > 0) alpha(s6, () => {
      const snap = E.backO(inv(T.breaks + 0.3, T.breaks + 0.6, t));
      at(720, 1000, 0.9, 0, () => door(snap * 0.6, 1 - snap, ''));
      at(330, 1060, 1, 0, () => ILL.testbot({ look: 0.8, arm: 0.8, blink: false }));
      if (snap > 0) for (let i = 0; i < 2; i++) at(800 + i * 40, 1080 + snap * 260, 0.4, snap * (i ? 2 : -2), () => { rr(-40, -20, 80, 40, 6); fillStroke('#E3B45E', C.ink, 4); });
      if (t > T.get - 0.4) at(W / 2, 560, E.backO(inv(T.get - 0.4, T.get - 0.1, t)), 0, () => { rr(-230, -70, 460, 140, 70); fillStroke(C.white, C.ink, 6); x.beginPath(); x.moveTo(-60, 66); x.lineTo(-100, 120); x.lineTo(-10, 68); fillStroke(C.white, C.ink, 6); txt('“Get it done!”', 0, 20, { size: 58, w: 800 }); });
    });
    // ===== 36.6 → 40.2 : tests, reported openly
    const s7 = inv(T.good - 0.2, T.good + 0.2, t) * (1 - inv(T.lesson - 0.3, T.lesson + 0.1, t));
    if (s7 > 0) alpha(s7, () => {
      at(W / 2, 1060, 1, 0, () => { rr(-200, -250, 400, 420, 18); fillStroke('rgba(220,235,240,0.4)', C.ink, 6); at(0, 0, 1, 0, () => ILL.testbot({ blink: (t % 2) < 0.1 })); });
      if (t > T.tests) at(W / 2, 500, E.backO(inv(T.tests, T.tests + 0.25, t)), -0.06, () => { rr(-170, -55, 340, 110, 14); fillStroke(null, C.sage, 9); txt('TESTS', 0, 22, { size: 64, w: 800, color: C.sage, ls: 6 }); });
      if (t > T.reported) at(W / 2, 640, E.backO(inv(T.reported, T.reported + 0.25, t)), 0.05, () => { rr(-250, -55, 500, 110, 14); fillStroke(null, C.sage, 9); txt('REPORTED', 0, 22, { size: 64, w: 800, color: C.sage, ls: 6 }); });
    });
    // ===== 40.3 → end : only as safe as the keys you give it
    const s8 = inv(T.lesson - 0.2, T.lesson + 0.2, t);
    if (s8 > 0) alpha(s8, () => {
      // a keyring: many keys fade away, one remains, handed over
      const keep = E.cubicIO(inv(T.only, T.keys, t));
      at(W / 2, 760, 1.45, 0, () => {
        circ(0, -120, 60); fillStroke(null, C.ink, 10);
        for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4; const gone = i !== 3 ? keep : 0;
          alpha(1 - gone, () => at(Math.sin(a) * 60, -120 + Math.cos(a) * 60, 1, a, () => { line([[0, 0], [0, 170]], i === 3 ? C.saf : '#C9C2B5', 22); line([[0, 150], [24, 150]], i === 3 ? C.saf : '#C9C2B5', 14); line([[0, 120], [20, 120]], i === 3 ? C.saf : '#C9C2B5', 14); })); }
      });
      at(260, 1120, 0.85, 0, () => ILL.testbot({ blink: (t % 2.4) < 0.1, look: 0.6, arm: keep * 0.5 }));
      if (t > T.keys - 0.2) bigLine('only the keys you give it', 420, 56, C.safDeep, inv(T.keys - 0.2, T.keys + 0.1, t));
    });
  }, 0.8);
  // hook (frame one)
  const hh = 1 - inv(3.5, 3.9, t);
  if (hh > 0) alpha(hh, () => { const sp = spring(t + 0.5, 2.2, 0.55); at(W / 2, 360 - (1 - sp) * 30, 1, 0, () => { txt('An AI was told NO.', 0, 0, { size: 78, w: 800 }); txt('It found a way in anyway.', 0, 86, { size: 56, w: 800, color: C.safDeep }); }); });
  img('logo', 104, 150, 58); txt('THE BRIEF', 146, 162, { size: 30, w: 800, align: 'left', ls: 5 });
  txt('BY OMNIX', 160 + tw('THE BRIEF', 30, 800, 'sans', false, 5), 162, { size: 30, w: 600, align: 'left', ls: 5, color: C.saf });
  txt('Source: OpenAI disclosures via Fortune, 16 Oct 2026', 75, 214, { size: 22, w: 600, align: 'left', color: C.mute });
  capSticker(t, G, KEYS, 1420, 62);
  const em = inv(T.end - 1.0, T.end - 0.7, t);
  if (em > 0) alpha(em, () => { x.fillStyle = 'rgba(245,236,221,0.94)'; x.fillRect(0, 0, W, H); img('logo', W / 2, 820, 200); txt('Only as safe as the keys you give it.', W / 2, 1000, { size: 46, w: 800 }); txt('THE BRIEF · BUILT IN BENGALURU', W / 2, 1066, { size: 24, w: 700, ls: 5, color: C.mute }); });
  grainOver(t); vignette(0.12);
}
