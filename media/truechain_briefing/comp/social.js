// TrueChain briefing: 1:1 social cut (1080 x 1080), Scenes 1-4 condensed, burned-in captions.
'use strict';
const SOC = (() => {
  const HW = 200, SX = 300, SY = 238;
  const tSome = () => wt('L02', 'some');
  const hx = t => 20 * cl(t, 0, 8.0);
  function cam(t) {
    const hF = hx(8.0);
    if (t < 8.0) return { s: lerp(0.5, 0.56, t / 8), c: [hx(t), 40] };
    const p = eio(t, 8.0, 2.2), s = Math.exp(lerp(Math.log(0.56), Math.log(1.25), p));
    return { s, c: [hF, lerp(40, 60, p)] };
  }
  function sceneA(t) {
    const cm = cam(t), grey = eio(t, tSome() - 0.05, 0.7), out = t > tSome() ? eio(t, tSome() + 0.1, 1.2) : 0;
    const mA = eio(t, 11.9, 0.6), mB = eio(t, 12.4, 1.2);
    save(() => {
      x.translate(W / 2, H / 2 - 120); x.scale(cm.s, cm.s); x.translate(-cm.c[0], -cm.c[1]);
      const vw = W / 2 / cm.s + SX, vh = H / cm.s;
      for (let r = -5; r <= 5; r++) {
        const off = (r % 2 === 0 ? 1 : -1) * hx(t), y = r * SY;
        if (Math.abs(y - cm.c[1]) > vh) continue;
        for (let c = Math.floor((cm.c[0] - vw - off) / SX); c <= Math.ceil((cm.c[0] + vw - off) / SX); c++) {
          const px = c * SX + off, isHero = r === 0 && c === 0, d = Math.hypot(c, r);
          if (isHero) continue;
          const a = 1 - E.io(cl(out * 2.2 - d * 0.12, 0, 1)); if (a <= 0.01) continue;
          alpha(a, () => parcel(px, y, HW, PAL.amber));
        }
      }
      if (mA < 1) alpha(1 - mA, () => parcel(hx(t), 0, HW, mixPal(PAL.amber, PAL.grey, grey), { open: eio(t, wt('L02', 'opened') - 0.25, 0.9) }));
    });
    if (mA > 0 && t < 13.7) {   // hero face → amber line (carries into the counter)
      const s = cm.s, fx = (hx(t) - cm.c[0]) * s + W / 2, fy = (0 - cm.c[1]) * s + H / 2 - 120, fw = HW * s, fh = HW * 0.7 * s;
      const r = [fx - fw / 2, fy - fh / 2, fw, fh].map((v, i) => lerp(v, [M, 556, W - 2 * M, 6][i], mB));
      rr(r[0], r[1], r[2], r[3], 3); x.fillStyle = mixc(PAL.grey.f, K.amber, mB); x.fill();
    }
    const v = win(t, -1, tSome() - 0.3);
    alpha(v.a, () => { card(M - 8, 96 + v.dy, W - 2 * M + 16, 176, { fill: K.bg, r: 20 }); T('millions of parcels leave', M + 28, 168 + v.dy, { size: 52, fam: 'H' }); T('every day.', M + 28, 230 + v.dy, { size: 52, fam: 'H' }); });
    headline("some don't.", W / 2, 700, t, tSome() + 0.9, { size: 130, align: 'center', t1: 11.7, lines: ["some don't."] });
    if (t < 0.25) { x.fillStyle = `rgba(251,249,244,${1 - t / 0.25})`; x.fillRect(0, 0, W, H); }
  }
  function sceneB(t) {
    if (t < 12.6 || t > 26) return;
    const t467 = wt('L03', '467', true), tEnd = 24.7;
    const lineA = t < 25.0 ? 1 : 0;
    if (t >= 13.6 && t < 25.2) { const p = eio(t, 24.6, 0.8); const r = [M, 556, W - 2 * M, 6].map((v, k) => lerp(v, [M, 330, W - 2 * M, 400][k], p)); rr(r[0], r[1], r[2], r[3], lerp(3, 18, p)); x.fillStyle = mixc(K.amber, K.sand, p); x.fill(); }
    headline('fakes are big business.', M, 250, t, 13.4, { size: 64, t1: tEnd });
    const rise = ein(t, t467 - 1.9, 0.8), val = lerp(100, 467, E.out(inv(t467 - 1.5, t467, t)));
    alpha(1 - eio(t, tEnd, 0.4), () => save(() => { x.beginPath(); x.rect(0, 0, W, 552); x.clip(); bigNum('US$', val, 3, ' bn', M, 512 + (1 - rise) * 180, 150); }));
    body('of counterfeit and pirated goods crossed borders in 2021.', M, 640, t, t467 - 1.2, { size: 40, maxW: W - 2 * M, t1: tEnd, color: K.ink });
    alpha(win(t, wt('L03', '2.3'), tEnd).a, () => tag('= 2.3% of world imports', M, 712 + win(t, wt('L03', '2.3'), tEnd).dy, 1, { size: 38, color: K.ink }));
    srcS('Source: OECD and EUIPO, Mapping Global Trade in Fakes, 2025', t, t467 - 1.6, tEnd);
  }
  function sceneC(t) {
    if (t < 24.6 || t > 35.6) return;
    const t64 = wt('L09', 'three', true) + 0.2, tEnd = 34.0, pL = eio(t, tEnd, 1.3);
    const P = [M, 330, W - 2 * M, 400], L = [W / 2 - 60, 300, 120, 120];
    if (t >= 25.2) { const r = P.map((v, k) => lerp(v, L[k], pL)); rr(r[0], r[1], r[2], r[3], lerp(18, 29, pL)); x.fillStyle = mixc(K.sand, K.amber, pL); x.fill(); }
    headline('the cost that matters most.', M, 250, t, 25.4, { size: 64, t1: tEnd - 0.2 });
    body('is harder to measure.', M + 50, 560, t, 26.4, { size: 56, w: 800, fam: 'H', color: K.ink, maxW: 900, t1: wt('L09', 'about') - 0.5 });
    alpha(win(t, wt('L09', 'about') - 0.3, tEnd - 0.3).a, () => bigNum('', countUp(t, t64, 64, 1.2), 2, '%', M + 50, 540, 190));
    body('of shoppers say they would lose trust in a marketplace after buying a fake.', M + 50, 620, t, wt('L09', 'shoppers'), { size: 38, maxW: 820, t1: tEnd - 0.3, color: K.ink });
    alpha(win(t, t64 + 0.4, tEnd - 0.3).a, () => tag('Stated intention, not measured churn.', M, 750, 1, { size: 36 }));
    srcS('Source: Incopro and Socure consumer surveys, via trade press', t, 26, tEnd - 0.3);
  }
  function entries() {
    return [
      { title: 'registered by the brand', meta: 'signed · 12 Mar 2026, 09:14', t: wt('L12', 'brand') },
      { title: 'parts and inspections added', meta: 'signed · 02 Apr 2026, 16:40', t: wt('L12', 'suppliers') + 0.6 },
      { title: 'shipped to the retailer', meta: 'signed · 18 Apr 2026, 11:02', t: wt('L12', 'distributors') },
      { title: 'sold · first retail sale', meta: 'signed · 03 May 2026, 18:27', t: wt('L12', 'sale') - 0.2 },
    ];
  }
  function sceneD(t) {
    if (t < 35.2 || t > TL.endCard + 1.4) return;
    const tJ = 40.6, tQ = wt('L14', 'anyone'), tE = TL.endCard, E4 = entries();
    const lock = 1 - eio(t, tJ - 0.5, 1.0);
    if (t < tJ + 0.6) {
      const s = 120, wd = tw('TrueChain', 110, 800, 'H'), tot = s + 30 + wd, sl = eio(t, 35.6, 0.9), Xs = lerp(W / 2 - s / 2, W / 2 - tot / 2, sl), Y = 300;
      alpha(lock, () => { rr(Xs, Y, s, s, 29); x.fillStyle = K.amber; x.fill(); alpha(ein(t, 35.4, 0.5), () => x.drawImage(IM.markC, Xs + s * 0.14, Y + s * 0.14, s * 0.72, s * 0.72));
        save(() => { x.beginPath(); x.rect(Xs + s + 14, Y - 30, W, s + 60); x.clip(); T('TrueChain', Xs + s + 30 - (1 - sl) * 60, Y + s / 2 + 40, { size: 110, fam: 'H' }); }); });
    }
    headline('every item, a record', W / 2, 560, t, wt('L11', 'its'), { size: 68, align: 'center', t1: tJ - 0.6, lines: ['every item, a record'] });
    headline('you can check.', W / 2, 636, t, wt('L11', 'its') + 0.15, { size: 68, align: 'center', t1: tJ - 0.6, lines: ['you can check.'] });
    // stations + record card
    const prog = track([[tJ, 0], [E4[0].t, 0.02], [E4[1].t, 1], [E4[2].t, 2], [E4[3].t, 3]], t), sx = i => M + 90 + i * 247, SYs = 190;
    alpha(win(t, tJ, tQ - 0.3).a, () => {
      lineP([[sx(0), SYs], [sx(3), SYs]], K.hair, 5); lineP([[sx(0), SYs], [sx(0) + prog * 247, SYs]], K.amber, 5);
      [['factory'], ['gear'], ['van'], ['store']].forEach(([ic], i) => { const lit = prog >= i - 0.02; x.beginPath(); x.arc(sx(i), SYs, 46, 0, 7); x.fillStyle = lit ? '#FFF4DD' : K.bg; x.fill(); x.strokeStyle = lit ? K.amber : K.hair; x.lineWidth = 3; x.stroke(); icon(ic, sx(i) - 27, SYs - 27, 54, K.ink, 4); });
    });
    headline('scan it. no sign-in needed.', M, 210, t, tQ + 0.1, { size: 60, t1: tE - 0.6 });
    const pm = eio(t, tE - 0.4, 1.1), ca = 1 - eio(t, tE - 0.7, 0.4);
    if (t > tJ - 0.5 && t < tE + 0.8) {
      const CR = [M, 270, W - 2 * M, 556], s = 100, wd = tw('TrueChain', 100, 800, 'H'), LX = W / 2 - (s + 28 + wd) / 2;
      if (pm > 0) { const r = CR.map((v, k) => lerp(v, [LX, 200, s, s][k], pm)); rr(r[0], r[1], r[2], r[3], lerp(20, 24, pm)); x.fillStyle = mixc(K.paper, K.amber, pm); x.fill(); }
      alpha(Math.min(ein(t, tJ - 0.5, 0.6), ca), () => {
        recordCard(CR[0], CR[1], CR[2], E4, t, { rowH: 112 });
        const vp = ein(t, wt('L14', 'history') - 0.1, 0.5); if (vp > 0) { save(() => { rr(CR[0] + CR[2] - 330, CR[1] + 14, 310, 58, 12); x.fillStyle = '#FFF4DD'; x.fill(); }); pill('ok', CR[0] + CR[2] - 330, CR[1] + 12, vp, 36, 'verified'); }
      });
    }
  }
  function endCard(t) {
    const tE = TL.endCard; if (t < tE + 0.5) return;
    const s = 100, wd = tw('TrueChain', 100, 800, 'H'), LX = W / 2 - (s + 28 + wd) / 2, LY = 200;
    logoSquare(LX, LY, s, 1, false); alpha(ein(t, tE + 0.6, 0.5), () => x.drawImage(IM.markC, LX + s * 0.14, LY + s * 0.14, s * 0.72, s * 0.72));
    save(() => { x.beginPath(); x.rect(LX + s + 10, LY - 30, W, s + 60); x.clip(); const sl = ein(t, tE + 0.7, 0.8); alpha(sl, () => T('TrueChain', LX + s + 28 - (1 - sl) * 60, LY + s / 2 + 36, { size: 100, fam: 'H' })); });
    headline('every item, a record', W / 2, 440, t, tE + 0.9, { size: 64, align: 'center', lines: ['every item, a record'] });
    headline('you can check.', W / 2, 512, t, tE + 1.0, { size: 64, align: 'center', lines: ['you can check.'] });
    body('A product of Omnix', W / 2, 596, t, tE + 1.3, { size: 36, align: 'center', color: K.ink2, maxW: 1000 });
    body('theomnix.org/truechain', W / 2, 650, t, tE + 1.4, { size: 38, align: 'center', color: K.ink, w: 600, maxW: 1000 });
    body('theomnichain@gmail.com', W / 2, 700, t, tE + 1.5, { size: 38, align: 'center', color: K.ink, w: 600, maxW: 1000 });
    const pa = ein(t, tE + 1.8, 0.6), pw = tw('Book a 90-day pilot', 36, 700, 'B') + 60;
    alpha(pa, () => { rr(W / 2 - pw / 2, 742 + (1 - pa) * 12, pw, 68, 34); x.fillStyle = K.amber; x.fill(); T('Book a 90-day pilot', W / 2, 789 + (1 - pa) * 12, { size: 36, w: 700, align: 'center' }); });
  }
  function srcS(s, t, t0, t1) { const v = win(t, t0 + 0.3, t1, 0.6, 0.35); alpha(v.a, () => T(s, M, 850, { size: 22, w: 500, color: K.ink2 })); }
  // burned-in captions: Manrope Medium 40px, ink on a 90% cream pill, bottom centre, max 2 lines
  function captions(t) {
    const c = TL.cues.find(q => t >= q[0] - 0.05 && t <= q[1] + 0.15); if (!c) return;
    const lines = c[2].split('\n'), lh = 52, ws = lines.map(l => tw(l, 40, 500, 'B')), w = Math.max(...ws) + 60, h = lines.length * lh + 30;
    const a = Math.min(cl((t - c[0] + 0.05) / 0.12), cl((c[1] + 0.15 - t) / 0.12));
    alpha(a, () => { rr(W / 2 - w / 2, 1012 - h, w, h, 22); x.fillStyle = 'rgba(251,249,244,0.9)'; x.fill(); x.strokeStyle = K.hair; x.lineWidth = 1.5; x.stroke();
      lines.forEach((l, i) => T(l, W / 2, 1012 - h + 15 + 38 + i * lh, { size: 40, w: 500, align: 'center', color: K.ink })); });
  }
  function chrome(t) {
    if (t < 13.0 || t >= TL.endCard) return;
    const a = Math.min(ein(t, 13.0, 0.6), 1 - eio(t, TL.endCard - 0.4, 0.4)); const s = 36, wd = tw('TrueChain', 36, 800, 'H');
    alpha(a, () => { logoSquare(W - M - wd - s - 12, 48, s); T('TrueChain', W - M - wd, 48 + s / 2 + 13, { size: 36, fam: 'H' }); });
  }
  return {
    get dur() { return TL.total; },
    draw(t) {
      x.fillStyle = K.bg; x.fillRect(0, 0, W, H);
      const cs = 1.004 + 0.006 * Math.sin(t * 2 * Math.PI / 31), dx = noise1(t * 0.07) * 4, dy = noise1(t * 0.05 + 9) * 3;
      save(() => { if (t >= 13) { x.translate(W / 2 + dx, H / 2 + dy); x.scale(cs, cs); x.translate(-W / 2, -H / 2); }
        if (t < 14) sceneA(t); sceneB(t); sceneC(t); sceneD(t); endCard(t); });
      chrome(t); captions(t); hud(t);
    },
  };
})();
window.COMP = SOC;
