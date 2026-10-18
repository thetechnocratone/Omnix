// Variant D · "POV" — no voiceover; an AI agent's live log, built to work on mute and to be sent.
'use strict';
const DUR = 25.0;
// log lines: [time shown, text, accent?]
const LOG = [
  [6.6, '+00:00', 'wallet funded', 'ok'],
  [8.6, '+18:02', 'GET /live-data', ''],
  [9.1, '', '← 402 Payment Required', 'warn'],
  [9.6, '', 'pay <10¢ → access ✓', 'ok'],
  [10.6, '+18:09', 'GET /compute', ''],
  [11.0, '', '← 402 · pay <10¢ → ✓', 'ok'],
  [11.9, '+18:15', 'GET /code-review', ''],
  [12.3, '', '← 402 · pay <10¢ → ✓', 'ok'],
  [13.5, '+18:15', 'ask a human to approve?', ''],
  [14.3, '', 'not needed', 'warn'],
];
window.COMP = { dur: DUR, draw(t) { drawD(t); } };
const MONO = 'mono';
function typed(s, t0, cps = 38, t) { const n = Math.max(0, Math.floor((t - t0) * cps)); return s.slice(0, n); }
function caret(X0, Y0, t, h = 44) { if (Math.floor(t * 2.4) % 2 === 0) { x.fillStyle = C.saf; x.fillRect(X0 + 4, Y0 - h * 0.8, 18, h); } }

function windowFrame(X0, Y0, w, h, title) {
  save(() => { x.fillStyle = 'rgba(60,40,20,0.16)'; x.filter = 'blur(14px)'; rr(X0 + 10, Y0 + 24, w, h, 30); x.fill(); });
  rr(X0, Y0, w, h, 30); fillStroke('#FFFBF4', C.ink, 6);
  rr(X0, Y0, w, 84, { upperLeft: 30, upperRight: 30, lowerLeft: 0, lowerRight: 0 }); fillStroke('#EFE2CB', C.ink, 6);
  [C.red, C.saf2, C.sage].forEach((c, i) => { circ(X0 + 50 + i * 40, Y0 + 42, 12); fillStroke(c, C.ink, 3); });
  txt(title, X0 + w / 2, Y0 + 54, { size: 28, w: 700, fam: MONO, color: C.ink });
}

function drawD(t) {
  paper(t, { gy: t * 20, gridSize: 60 });
  // ---------- 0 → 6.4 : POV title, then the old wait vs the new wait ----------
  const titleA = 1 - inv(2.4, 2.8, t) + inv(DUR - 1.0, DUR - 0.5, t);
  if (titleA > 0) alpha(cl(titleA), () => {
    const back = t > DUR - 1.2;
    const sp = back ? spring(t - (DUR - 1.0), 2.4, 0.6) : 1;
    at(W / 2, 760, 0.9 + 0.1 * sp, 0, () => {
      txt('POV:', 0, -150, { size: 64, w: 700, fam: MONO, color: C.safDeep });
      txt("you're an", 0, -20, { size: 118, w: 800 }); txt('AI agent.', 0, 110, { size: 118, w: 800 });
      const q = back ? 0 : inv(1.0, 1.4, t);
      txt('Someone just funded your wallet.', 0, 250, { size: 44, w: 600, color: C.mute, a: back ? 0 : q });
    });
    at(W / 2, 1230, 0.9, 0, () => ILL.robot({ blink: (t % 2.3) < 0.1, look: Math.sin(t * 1.4) * 0.5, smile: t > 1.4 && !back }));
  });
  // 2.8 → 6.2 : "late 2025: you'd wait 73 days" → "now: 18 minutes"
  const waitA = inv(2.7, 3.0, t) * (1 - inv(6.0, 6.4, t));
  if (waitA > 0) alpha(waitA, () => {
    const flip = inv(4.6, 4.78, t), fade = 1 - inv(4.42, 4.56, t);
    txt('LATE 2025', W / 2, 520, { size: 34, w: 700, ls: 6, color: C.mute, a: fade });
    txt('2026', W / 2, 520, { size: 34, w: 700, ls: 6, color: C.safDeep, a: flip });
    txt("you'd sit idle for", W / 2, 640, { size: 58, w: 700, a: fade });
    txt('you start spending in', W / 2, 640, { size: 58, w: 700, a: flip });
    const d = Math.min(73, Math.floor(lerp(1, 73, E.cubicO(inv(2.9, 4.2, t)))));
    if (fade > 0) at(W / 2, 950, 1, 0, () => alpha(fade, () => { ILL.calendar(); txt(String(d), 0, 70, { size: 96, w: 900 }); }));
    txt(String(d) + ' days', W / 2, 1260, { size: 120, w: 900, a: fade });
    if (flip > 0) { const sp = spring(t - 4.6, 3, 0.45); at(W / 2, 950, 0.6 + 0.4 * sp, 0, () => ILL.stopwatch({ r: 140, sweep: 0.3 * E.expoO(inv(4.6, 5.4, t)) }));
      txt('18 minutes', W / 2, 1260, { size: 120, w: 900, color: C.safDeep, a: flip }); }
  });
  // ---------- 6.4 → 15.4 : the agent log ----------
  const logA = inv(6.2, 6.6, t) * (1 - inv(15.2, 15.6, t));
  if (logA > 0) alpha(logA, () => {
    const wy = lerp(380, 300, E.cubicO(inv(6.2, 7.2, t)));
    windowFrame(70, wy, 940, 1060, 'agent.log');
    // scroll as lines accumulate
    const lineH = 100; let row = 0;
    const visible = LOG.filter(l => t >= l[0] - 0.02);
    const scroll = Math.max(0, visible.length - 10) * lineH;
    save(() => { x.beginPath(); x.rect(80, wy + 90, 920, 960); x.clip();
      visible.forEach((l, i) => {
        const Y = wy + 180 + i * lineH - scroll;
        const sp = E.cubicO(inv(l[0] - 0.02, l[0] + 0.15, t));
        alpha(sp, () => {
          if (l[1]) txt(l[1], 110, Y, { size: 40, w: 700, fam: MONO, align: 'left', color: C.mute });
          const s = typed(l[2], l[0], 40, t);
          const col = l[3] === 'ok' ? '#3F6B32' : l[3] === 'warn' ? C.safDeep : C.ink;
          txt(s, l[1] ? 310 : 350, Y, { size: 45, w: 700, fam: MONO, align: 'left', color: col });
          if (i === visible.length - 1 && s.length === l[2].length && t < 15.0) caret((l[1] ? 310 : 350) + tw(s, 45, 700, MONO), Y, t, 46);
        });
        row++;
      });
    });
    // coin hops out of the wallet chip at each payment
    [9.6, 11.0, 12.3].forEach(pt => { const q = inv(pt, pt + 0.6, t); if (q > 0 && q < 1) at(lerp(760, 940, q), wy + 300 - Math.sin(q * Math.PI) * 160, 0.7, 0, () => ILL.coin({ r: 40, spin: q * 14 })); });
    // the empty approval prompt
    if (t > 13.5) at(W / 2, wy + 1190, 0.9, 0, () => alpha(inv(13.5, 13.8, t), () => ILL.approveBtn({ strike: E.expoO(inv(14.3, 14.7, t)) })));
  });
  // ---------- 15.6 → 20.4 : the receipts (real numbers) ----------
  const stA = inv(15.4, 15.8, t) * (1 - inv(20.2, 20.6, t));
  if (stA > 0) alpha(stA, () => {
    txt('meanwhile, in the real data', W / 2, 430, { size: 44, w: 600, fam: MONO, color: C.mute });
    [['138M+', 'agent payments counted', 15.8], ['87%', 'were under 10¢', 16.9], ['67%', 'spend within an hour', 18.0]].forEach(([n, s, st], i) => {
      const sp = spring(t - st, 2.8, 0.5); if (t < st) return;
      at(W / 2, 640 + i * 250, 0.85 + 0.15 * sp, 0, () => { rr(-470, -100, 940, 200, 30); fillStroke(i === 1 ? '#FFF1DC' : C.white, C.ink, 6);
        txt(n, -110, 36, { size: 104, w: 900, align: 'right', color: i === 0 ? C.ink : C.safDeep }); txt(s, -70, 22, { size: 36, w: 700, align: 'left', color: C.ink }); });
    });
    txt('Source: Chainalysis, x402 payments on Base · Oct 2026', W / 2, 1420, { size: 26, w: 600, color: C.mute, a: inv(18.5, 19, t) });
  });
  // ---------- 20.6 → 24.0 : the line people send ----------
  const pA = inv(20.4, 20.8, t) * (1 - inv(23.8, 24.1, t));
  if (pA > 0) alpha(pA, () => {
    const sp = spring(t - 20.5, 2.2, 0.55);
    at(W / 2, 760, 0.94 + 0.06 * sp, 0, () => {
      txt('Your next customer', 0, 0, { size: 86, w: 800 });
      txt('might not be human.', 0, 110, { size: 86, w: 800, color: C.safDeep });
      const q = inv(21.9, 22.3, t);
      txt('Can it pay you?', 0, 300, { size: 54, w: 600, fam: MONO, color: C.mute, a: q });
    });
    at(W / 2, 1250, 0.7, 0, () => ILL.robot({ smile: true, arm: Math.abs(Math.sin(t * 3)) * 0.8, holdCoin: true, coinSpin: t * 4 }));
  });
  // brand + illustration disclaimer
  img('logo', 104, 150, 58); txt('OMNIX', 146, 162, { size: 30, w: 800, align: 'left', ls: 5 });
  txt('illustration · data: Chainalysis', W - 70, 162, { size: 24, w: 600, align: 'right', color: C.mute });
  grainOver(t); vignette(0.1);
}
