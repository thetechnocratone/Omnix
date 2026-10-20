// TrueChain briefing: the eight scenes on one continuous camera.
'use strict';
const SC = () => TL.scenes;   // [0,20,60,105,155,202,227,255,280]
const EYEBROW = [null, '01 · The problem', '02 · The cost', '03 · The product', '04 · The fit', '05 · Limits', '06 · The value', '07 · The ask'];

// ======================================================================= S1 cold open (0–20)
const S1 = (() => {
  const HW = 220;                                    // hero parcel width (world)
  const LR = labelRect(0, 0, HW), LC = [LR[0] + LR[2] / 2, LR[1] + LR[3] / 2];
  const hx = t => 22 * cl(t - 4.4, 0, 7.6);          // hero row drift on the conveyor (stops at 12.4)
  const SX = 330, SY = 262;
  function zoomSeg(t, t0, t1, s0, s1, F, c0, c1) {   // zoom keeping focus point F on a straight screen path
    const p = eio(t, t0, t1 - t0), s = Math.exp(lerp(Math.log(s0), Math.log(s1), p));
    const o0 = [(F[0] - c0[0]) * s0, (F[1] - c0[1]) * s0], o1 = [(F[0] - c1[0]) * s1, (F[1] - c1[1]) * s1];
    const o = [lerp(o0[0], o1[0], p), lerp(o0[1], o1[1], p)]; return { s, c: [F[0] - o[0] / s, F[1] - o[1] / s] };
  }
  function cam(t) {
    const h = hx(t), F = [LC[0] + h, LC[1]], hF = hx(12.0);
    if (t < 2.3) return { s: 1, c: [0, 0] };
    if (t < 3.5) return zoomSeg(t, 2.3, 3.5, 1, 16.5, LC, [0, 0], LC);
    if (t < 4.5) return { s: lerp(16.5, 17.2, inv(3.5, 4.5, t)), c: LC };
    if (t < 7.9) return zoomSeg(t, 4.5, 7.9, 17.2, 0.55, F, [LC[0], LC[1]], [h, 20]);
    if (t < 12.0) return { s: lerp(0.55, 0.58, inv(7.9, 12.0, t)), c: [h, 20] };
    if (t < 15.6) return zoomSeg(t, 12.0, 14.2, 0.58, 1.5, [hF, 0], [hF, 20], [hF + 240, 10]);
    return { s: lerp(1.5, 1.53, inv(15.6, 20, t)), c: [hF + 240, 10] };
  }
  const tSome = () => wt('L02', 'some'), tOpen = () => wt('L02', 'opened');
  function draw(t) {
    const cm = cam(t), heroGrey = eio(t, tSome() - 0.05, 0.7), othersOut = t > tSome() ? eio(t, tSome() + 0.15, 1.3) : 0;
    const morphA = eio(t, 17.4, 0.7), morphB = eio(t, 18.1, 1.4);
    save(() => {
      x.translate(W / 2, H / 2); x.scale(cm.s, cm.s); x.translate(-cm.c[0], -cm.c[1]);
      // the crowd: revealed as the camera pulls back; alternate rows run opposite ways
      if (t > 4.4) {
        const vw = W / 2 / cm.s + SX, vh = H / 2 / cm.s + SY;
        for (let r = -4; r <= 4; r++) {
          const off = (r % 2 === 0 ? 1 : -1) * hx(t), y = r * SY + 20 * 0;
          if (Math.abs(y - cm.c[1]) > vh) continue;
          const c0 = Math.floor((cm.c[0] - vw - off) / SX), c1 = Math.ceil((cm.c[0] + vw - off) / SX);
          for (let c = c0; c <= c1; c++) {
            if (r === 0 && c === 0) continue;
            const px = c * SX + off, d = Math.hypot(c, r);
            const aIn = ein(t, 4.9 + d * 0.16, 0.9), aOut = 1 - E.io(cl((othersOut * 2.2 - (d * 0.12)) , 0, 1));
            const a = aIn * aOut; if (a <= 0.01) continue;
            alpha(a, () => { shadowAt(px, y + HW * 0.38, HW * 1.1); parcel(px, y, HW, PAL.amber); });
          }
        }
      }
      // hero parcel: drops, lands, carries the shipping label
      const dropY = t < 2.0 ? lerp(-900, 0, E.inq(inv(1.0, 2.0, t))) : 0;
      const squash = t > 2.0 && t < 2.3 ? 1 - 0.035 * Math.sin(Math.PI * inv(2.0, 2.3, t)) : 1;
      const hX = hx(t), pal = mixPal(PAL.amber, PAL.grey, heroGrey);
      if (t > 0.9 && morphA < 1) alpha(1 - morphA, () => {
        shadowAt(hX, HW * 0.38, HW * 1.1 * (t < 2 ? lerp(0.4, 1, inv(1, 2, t)) : 1), t < 2 ? lerp(0.2, 1, inv(1, 2, t)) : 1);
        save(() => { x.translate(hX, dropY + HW * 0.35); x.scale(1 / squash * 0 + (2 - squash), squash); x.translate(0, -HW * 0.35);
          parcel(0, 0, HW, pal, { labelDetail: true, open: eio(t, tOpen() - 0.25, 0.9) }); });
      });
    });
    // hero front face → amber line (carried into scene 2)
    if (morphA > 0 && t < 19.5) {
      const s = cm.s, fx = (hx(t) - cm.c[0]) * s + W / 2, fy = (0 - cm.c[1]) * s + H / 2, fw = HW * s, fh = HW * 0.7 * s;
      const L0 = [fx - fw / 2, fy - fh / 2, fw, fh], L1 = [M, 619, W - 2 * M, 6];
      const r = L0.map((v, i) => lerp(v, L1[i], morphB));
      rr(r[0], r[1], r[2], r[3], lerp(2, 3, morphB)); x.fillStyle = mixc(PAL.grey.f, K.amber, morphB); x.fill();
    }
    // words on screen (sound-off safe)
    const tMost = wt('L01', 'most');
    alpha(win(t, 5.6, 11.2).a, () => {
      const v = win(t, 5.6, 11.2); const cy = H - 290 + v.dy;
      card(M - 8, cy, 1040, 196, { fill: K.bg, stroke: K.hair, r: 20 });
      T('millions of parcels leave every day.', M + 32, cy + 82, { size: 54, fam: 'H' });
      alpha(ein(t, tMost, 0.6), () => T('most hold exactly what was ordered.', M + 32, cy + 150 + (1 - ein(t, tMost, 0.6)) * 12, { size: 44, w: 500, color: K.ink2 }));
    });
    headline("some don't.", 1010, 560, t, 13.1, { size: 150, t1: 17.2 });
    body('the customer finds out only after the parcel is opened.', 1016, 660, t, wt('L02', 'customer'), { size: 44, maxW: 760, t1: 17.2 });
    // fade up from black with a single soft tone
    if (t < 1.3) { x.fillStyle = `rgba(0,0,0,${1 - E.io(inv(0.1, 1.3, t))})`; x.fillRect(0, 0, W, H); }
  }
  function shadowAt(X, Y, w, a = 1) { save(() => { x.fillStyle = `rgba(28,26,23,${0.07 * a})`; x.beginPath(); x.ellipse(X + w * 0.06, Y, w / 2, w * 0.06, 0, 0, 7); x.fill(); }); }
  return { draw };
})();

// ======================================================================= S2 the scale (20–60)
const S2 = (() => {
  const X0 = 600, KB = 1050 / 509, ROWS = [[2016, 509, '3.3% of trade', 520], [2019, 464, '2.5% of trade', 640], [2021, 467, '2.3% of imports', 760]];
  const CON = [M, 440, 860, 264];
  function draw(t) {
    const t467 = wt('L03', '467', true), tChart = 33.6, tCon = 41.2, tBreak = 43.3, tCat = 49.6, tEnd = 59.4;
    const pCarry = eio(t, tChart + 0.25, 1.0);
    // --- amber line → 2021 bar → container strip
    const barRect = (i, t) => {
      const [, v, , cy] = ROWS[i]; let len = v * KB;
      if (i < 2) len *= E.out(inv(tChart + 0.9 + i * 0.3, tChart + 1.9 + i * 0.3, t));
      return [X0, cy - 35, len, 70];
    };
    const pCon = eio(t, tCon, 1.0), conA = 1 - eio(t, tBreak, 0.5);
    if (t < tBreak + 0.6 && t >= 19.5) {
      for (let i = 0; i < 3; i++) {
        let r;
        if (i === 2) { const lineR = [M, 619, W - 2 * M, 6]; r = lineR.map((v, k) => lerp(v, barRect(2, t)[k], eio(t, tChart, 0.8))); }
        else { if (t < tChart + 0.9) continue; r = barRect(i, t); }
        const tgt = [CON[0], CON[1] + i * CON[3] / 3, CON[2], CON[3] / 3];
        r = r.map((v, k) => lerp(v, tgt[k], pCon));
        alpha(conA, () => { rr(r[0], r[1], r[2], r[3] + (pCon > 0 ? 0.5 : 0), lerp(i === 2 ? lerp(3, 12, eio(t, tChart + 0.2, 1)) : 12, 0, pCon)); x.fillStyle = mixc(K.amber, '#E8960A', pCon); x.fill(); });
      }
      // container details: ribs, frame, doors
      const det = ein(t, tCon + 0.8, 0.6) * conA;
      alpha(det, () => {
        const [cx, cy, cw, ch] = CON; x.strokeStyle = 'rgba(120,70,0,0.35)'; x.lineWidth = 3;
        for (let k = 1; k < 26; k++) { const xx = cx + k * cw / 26; x.beginPath(); x.moveTo(xx, cy + 14); x.lineTo(xx, cy + ch - 14); x.stroke(); }
        rr(cx, cy, cw, ch, 6); x.strokeStyle = K.amberDeep; x.lineWidth = 6; x.stroke();
        x.fillStyle = K.amberDeep; x.fillRect(cx + cw - 70, cy + 40, 6, ch - 80); x.fillRect(cx + cw - 40, cy + 40, 6, ch - 80);
      });
    }
    // --- counter US$467 bn (rises from behind the line, then carries into the 2021 bar label)
    if (t < tCon + 0.5) {
      const rise = ein(t, t467 - 1.9, 0.8), val = lerp(100, 467, E.out(inv(t467 - 1.5, t467, t)));
      const pre = 'US$', size = lerp(220, 56, pCarry);
      font(220, 800, 'H'); x.letterSpacing = (-4.4) + 'px'; const pw = x.measureText(pre).width; x.letterSpacing = '0px';
      const nx = lerp(M + pw, X0 + 467 * KB + 26, pCarry), ny = lerp(575, 780, pCarry);
      save(() => {
        if (pCarry < 0.01) { x.beginPath(); x.rect(0, 0, W, 616); x.clip(); }
        const dy = (1 - rise) * 240;
        alpha(1 - cl(pCarry * 2.5), () => { T(pre, M, 575 + dy, { size: 220, fam: 'H' }); });
        alpha(1 - win(t, 0, tCon - 0.2).po * 0 - (t > tCon - 0.2 ? eio(t, tCon - 0.2, 0.4) : 0), () => {
          const w = bigNum('', pCarry > 0 ? 467 : val, 3, '', nx, ny + dy * (1 - pCarry), size);
          alpha(1 - cl(pCarry * 2.5), () => T('bn', nx + w + 40, 575 + dy, { size: 220, fam: 'H' }));
        });
      });
    }
    headline('fakes are big business.', M, 300, t, 20.7, { size: 80, t1: tChart - 0.2 });
    body('of counterfeit and pirated goods crossed borders in 2021.', M, 700, t, t467 - 1.2, { size: 46, maxW: 1600, t1: tChart - 0.1, color: K.ink });
    alpha(win(t, wt('L03', '2.3'), tChart - 0.1).a, () => tag('= 2.3% of world imports', M, 752 + win(t, wt('L03', '2.3'), tChart).dy, 1, { size: 40, color: K.ink }));
    source('Source: OECD and EUIPO, Mapping Global Trade in Fakes, 2025', t, t467 - 1.6, tChart - 0.2);
    // --- chart
    const tWhat = wt('L04', 'what');
    headline('the figure has barely moved.', M, 300, t, tChart + 0.3, { size: 80, t1: tWhat - 0.45 });
    headline('what has changed is how fakes travel.', M, 300, t, tWhat, { size: 80, t1: tCon - 0.3 });
    const chA = win(t, tChart + 0.5, tCon - 0.2).a;
    alpha(chA, () => T('counterfeit and pirated goods in world trade, US$ bn', M, 420, { size: 36, w: 500, color: K.ink2 }));
    ROWS.forEach(([yr, v, sub, cy], i) => {
      const a = Math.min(win(t, tChart + 0.6 + i * 0.2, tCon - 0.2).a, 1);
      alpha(a, () => { T(String(yr), M, cy + 2, { size: 46, fam: 'H' }); T(sub, M, cy + 44, { size: 36, w: 500, color: K.ink2 }); });
      if (i < 2) { const pa = win(t, tChart + 1.6 + i * 0.3, tCon - 0.2).a; alpha(pa, () => bigNum('', v, 3, '', X0 + v * KB + 26, cy + 20, 56)); }
    });
    if (t > tCon - 0.2 && t < tCon + 0.5) alpha(1 - eio(t, tCon - 0.2, 0.4), () => bigNum('', 467, 3, '', X0 + 467 * KB + 26, 780, 56));
    source('Source: OECD and EUIPO, 2025; OECD and EUIPO, Global Trade in Fakes, 2021; OECD, 2019', t, tChart + 0.3, tCon - 0.3);
    // --- 80%: container breaks into hundreds of parcels
    const t80 = wt('L05', 'ten', true) + 0.3;
    alpha(win(t, tCon + 0.8, tCat - 0.3).a, () => bigNum('', countUp(t, Math.max(t80, tCon + 2.0), 80, 1.2), 2, '%', 1100, 610, 240));
    body('of customs seizures of fakes were small parcels (2020–21).', 1106, 690, t, tCon + 1.0, { size: 44, maxW: 690, t1: tCat - 0.3, color: K.ink });
    body('that is the shape of an online order.', 1106, 830, t, wt('L05', 'that'), { size: 44, w: 700, maxW: 690, t1: tCat - 0.3, color: K.ink, fam: 'B' });
    source('Source: OECD, Misuse of E-commerce for Trade in Counterfeits, 2021', t, tCon + 0.2, tCat - 0.4);
    const N = 200, cols = 25, rows = 8, cards = [M + 260, M + 560 + 260, M + 1120 + 260];
    if (t > tBreak - 0.05 && t < tCat + 2.4) for (let i = 0; i < N; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const sx = CON[0] + (c + 0.5) * CON[2] / cols, sy = CON[1] + (r + 0.5) * CON[3] / rows;
      const gc = i % 20, gr = Math.floor(i / 20);
      const tx = M + 22 + gc * 43 + (hash(i * 1.7) - 0.5) * 6, ty = 330 + gr * 54 + (hash(i * 2.3) - 0.5) * 6;
      const p = eio(t, tBreak + hash(i * 5.1) * 0.9, 1.1);
      let px = lerp(sx, tx, p), py = lerp(sy, ty, p), s = lerp(30, 26, p), a = cl((t - tBreak) * 6);
      const k = i % 3, q = eio(t, tCat + hash(i * 3.3) * 0.6, 0.9);       // gather into the three categories
      if (q > 0) { px = lerp(px, cards[k], q); py = lerp(py, 505, q); s *= 1 - q * 0.7; a *= 1 - eio(t, tCat + 0.5 + hash(i * 3.3) * 0.6, 0.6); }
      miniParcel(px, py, s, PAL.amber, a);
    }
    // --- categories
    const tThese = wt('L06', 'these');
    headline('your high-value categories.', M, 290, t, tThese, { size: 84, t1: tEnd });
    [['shirt', 'apparel'], ['shoe', 'footwear'], ['watch', 'watches and jewellery']].forEach(([ic, lab], i) => {
      const v = win(t, tCat + 0.5 + i * 0.12, 1e9); const X = M + i * 560;
      const pe = eio(t, 59.2 + i * 0.06, 1.0);            // exit: cards flatten into the amber rule of scene 3
      if (t > 60.3) return;
      const r = [X, 380 + v.dy, 520, 300].map((q, k) => lerp(q, [M + i * 560, 616, i < 2 ? 560 : 520, 6][k], pe));
      alpha(v.a, () => { rr(r[0], r[1], r[2], r[3], lerp(18, 3, pe)); x.fillStyle = mixc(K.sand, K.amber, pe); x.fill(); if (pe < 0.3) { x.strokeStyle = K.hair; x.lineWidth = 1.5; x.stroke(); }
        alpha(1 - ein(t, 59.0, 0.4), () => { icon(ic, X + 260 - 75, 412 + v.dy, 150, K.ink, 5); T(lab, X + 260, 640 + v.dy, { size: 40, w: 600, align: 'center' }); }); });
    });
    alpha(win(t, tCat + 1.4, tEnd).a, () => { const dy = win(t, tCat + 1.4, tEnd).dy; const w = bigNum('', 62, 2, '%', M, 790 + dy, 56); T('of seized fakes in 2021 were clothing, footwear or leather goods.', M + w + 18, 788 + dy, { size: 40, w: 500, color: K.ink }); });
    source('Source: OECD and EUIPO, 2025, as summarised in trade press', t, tCat + 0.6, tEnd);
  }
  return { draw };
})();

// ======================================================================= S3 the cost (60–105)
const S3 = (() => {
  const CX = i => M + i * 428, CW = 396, CY = 400, CH = 340;
  const PANEL = [M, 380, W - 2 * M, 390], TABLE = [M, 360, W - 2 * M, 420];
  const HL = [M + 12, 576, W - 2 * M - 24, 88];                 // highlighted 1% row
  function draw(t) {
    const tB = wt('L07', 'billion'), tC = 71.2, tT = 80.8, tN = 92.2, tEnd = 103.8;
    // amber rule (carried from scene 2) → splits into the top edges of four cost cards
    const pSplit = eio(t, tC - 0.2, 0.9);
    if (t >= 60.25 && t < tC + 1.2) for (let i = 0; i < 4; i++) {
      const r = [M + i * 420, 616, 420, 6].map((v, k) => lerp(v, [CX(i), CY, CW, 6][k], pSplit));
      alpha(1 - ein(t, tC + 0.5, 0.5), () => { rr(r[0], r[1], r[2], r[3], 3); x.fillStyle = K.amber; x.fill(); });
    }
    // US$1 bn+ rises from behind the rule
    const nA = 1 - eio(t, tC - 0.5, 0.4);
    alpha(nA, () => save(() => { x.beginPath(); x.rect(0, 0, W, 616); x.clip(); T('US$1 bn+', M, 575 + (1 - ein(t, tB - 0.9, 0.9)) * 240, { size: 220, fam: 'H' }); }));
    body('spent by one marketplace in 2024 protecting its store.', M, 700, t, tB, { size: 46, maxW: 1500, t1: tC - 0.5, color: K.ink });
    body('that is only the cost of defence.', M, 770, t, wt('L07', 'that'), { size: 46, w: 700, maxW: 1500, t1: tC - 0.5, color: K.ink });
    source('Source: Amazon Brand Protection Report 2024', t, tB - 0.6, tC - 0.4);
    // four cost cards grow down from their amber edges
    headline('then come the costs that follow.', M, 300, t, tC + 0.1, { size: 80, t1: tT - 0.5 });
    const pP = eio(t, tT - 0.4, 1.0), pT = eio(t, tN - 0.2, 0.9);
    [['returnBox', 'returns', 'returns'], ['refund', 'refunds', 'refunds'], ['van', 'reverse pickups', 'reverse'], ['chat', 'word against word', 'support']].forEach(([ic, lab, w], i) => {
      if (t < tC - 0.1) return;
      const g = eio(t, tC + 0.3 + i * 0.1, 0.8), fall = i < 3 ? eio(t, tT - 0.5 + i * 0.06, 0.6) : 0;
      if (i < 3 && fall >= 1) return;
      let r = [CX(i), CY + fall * 40, CW, Math.max(6, CH * g)];
      if (i === 3) { r = r.map((v, k) => lerp(v, PANEL[k], pP)); r = r.map((v, k) => lerp(v, TABLE[k], pT)); }
      if (i === 3 && t > tEnd + 0.6) return;
      alpha((1 - fall) * (i === 3 ? 1 - eio(t, tEnd - 0.2, 0.4) : 1), () => {
        rr(r[0], r[1], r[2], r[3], 18); x.fillStyle = mixc(K.sand, K.paper, pT); x.fill(); x.strokeStyle = K.hair; x.lineWidth = 1.5; x.stroke();
        x.fillStyle = K.amber; alpha(1 - g * 0 - pP, () => x.fillRect(r[0] + 18, r[1], r[2] - 36, 6));
        const ca = ein(t, wt('L08', w) - 0.15, 0.6) * (1 - ein(t, tT - 0.6, 0.35));
        alpha(ca, () => { icon(ic, CX(i) + CW / 2 - 70, CY + 50 + (1 - ca) * 10, 140, K.ink, 5); T(lab, CX(i) + CW / 2, CY + 280 + (1 - ca) * 10, { size: 40, w: 600, align: 'center' }); });
      });
    });
    // 64% inside the panel the last card became
    const t64 = wt('L09', 'three', true) + 0.2;
    headline('the cost that matters most.', M, 300, t, tT + 0.2, { size: 80, t1: tN - 0.5 });
    body('is harder to measure.', M + 60, 600, t, tT + 1.3, { size: 60, w: 700, fam: 'H', color: K.ink, maxW: 1400, t1: wt('L09', 'about') - 0.6 });
    alpha(win(t, wt('L09', 'about') - 0.3, tN - 0.5).a, () => bigNum('', countUp(t, t64, 64, 1.2), 2, '%', M + 60, 650, 230));
    body('of shoppers say they would lose trust in a marketplace after buying a fake.', M + 720, 520, t, wt('L09', 'shoppers'), { size: 46, maxW: 880, t1: tN - 0.5, color: K.ink });
    alpha(win(t, t64 + 0.5, tN - 0.5).a, () => tag('Stated intention in vendor surveys, not measured churn.', M + 720, 650, 1, { size: 36, fill: K.bg }));
    source('Source: Incopro and Socure consumer surveys, as reported in trade press', t, tT + 1, tN - 0.4);
    // sizing table inside the same card
    headline('run your own numbers.', M, 290, t, tN + 0.1, { size: 80, t1: tEnd - 0.2 });
    alpha(win(t, tN + 0.6, tEnd - 0.2).a, () => tag('Illustration, not a finding.', W - M, 222, 1, { right: true, size: 36, stroke: K.amber, color: K.atF, fill: K.atB }));
    const X = TABLE[0], Y = TABLE[1], Wd = TABLE[2], cols = [X + 40, X + 640, X + 1150];
    const tA = Math.min(ein(t, tN + 0.5, 0.6), 1 - eio(t, tEnd - 0.3, 0.4));
    alpha(tA, () => { ['share of sales that are fakes', 'affected sales', 'total cost a year'].forEach((s, i) => T(s, cols[i], Y + 66, { size: 36, w: 600, color: K.ink2 })); x.fillStyle = K.hair; x.fillRect(X, Y + 100, Wd, 1.5); });
    const tHL = wt('L10', 'fifty') - 0.2, pLogo = eio(t, tEnd + 0.2, 1.4);
    [['0.5%', 'US$50 m', 'US$25 m'], ['1%', 'US$100 m', '≈ US$50 m / year'], ['2%', 'US$200 m', 'US$100 m']].forEach((row, r) => {
      const ra = ein(t, tN + 1.0 + r * 0.35, 0.6), ry = Y + 100 + r * 106, hl = r === 1 ? ein(t, tHL, 0.6) : 0;
      if (hl > 0 && t < 105.7) {     // the highlighted row carries into the TrueChain logo square
        const L = [W / 2 - 75, 300, 150, 150], q = HL.map((v, k) => lerp(v, L[k], pLogo));
        alpha(hl, () => { rr(q[0], q[1], q[2], q[3], lerp(14, 36, pLogo)); x.fillStyle = mixc(K.atB, K.amber, pLogo); x.fill(); x.strokeStyle = K.amber; x.lineWidth = 2.5; x.stroke(); });
      }
      alpha(ra * tA, () => row.forEach((s, i) => T(s, cols[i], ry + 70, { size: 48, fam: i === 2 && r === 1 ? 'H' : 'B', w: i === 2 && r === 1 ? 800 : 600, color: K.ink })));
    });
    body('per US$10 bn of marketplace sales. change any assumption.', M, 840, t, tN + 1.8, { size: 40, maxW: 1400, t1: tEnd - 0.3 });
    source('Source: Omnix illustration; assumptions set out in the TrueChain briefing, page 3', t, tN + 0.5, tEnd - 0.3);
  }
  return { draw };
})();

// ======================================================================= S4 TrueChain (105–155)
const S4 = (() => {
  const ST = [['factory', 'factory'], ['gear', 'assembly'], ['van', 'shipping'], ['store', 'retail']];
  const SY = 262;
  function entries() {
    return [
      { title: 'registered by the brand', meta: 'signed · 12 Mar 2026, 09:14', t: wt('L12', 'brand') },
      { title: 'parts and inspections added', meta: 'signed · 02 Apr 2026, 16:40', t: wt('L12', 'suppliers') + 0.6 },
      { title: 'shipped to the retailer', meta: 'signed · 18 Apr 2026, 11:02', t: wt('L12', 'distributors') },
      { title: 'sold · first retail sale', meta: 'signed · 03 May 2026, 18:27', t: wt('L12', 'sale') - 0.2 },
    ];
  }
  function draw(t) {
    const tHead = wt('L11', 'its'), tJ = 115.2, tLed = 130.2, tQR = 143.0, tPush = 153.3;
    // logo lockup (square carried from the sizing table) → flies into the record card header
    const lock = 1 - eio(t, tJ - 0.6, 1.0);
    if (t >= 105.6 && t < tJ + 0.6) {
      const s = 150, wd = tw('TrueChain', 150, 800, 'H'), tot = s + 40 + wd, slide = eio(t, 106.0, 0.9), mk = ein(t, 105.6, 0.5);
      const Xs = lerp(W / 2 - s / 2, W / 2 - tot / 2, slide), Y = 300;
      alpha(lock, () => {
        rr(Xs, Y, s, s, 36); x.fillStyle = K.amber; x.fill();
        alpha(mk, () => x.drawImage(IM.markC, Xs + s * 0.14, Y + s * 0.14, s * 0.72, s * 0.72));
        save(() => { x.beginPath(); x.rect(Xs + s + 20, Y - 40, W, s + 80); x.clip(); T('TrueChain', Xs + s + 40 - (1 - slide) * 80, Y + s / 2 + 54, { size: 150, fam: 'H' }); });
      });
    }
    headline('every item, a record you can check.', W / 2, 660, t, tHead, { size: 84, align: 'center', t1: tJ - 0.6, lines: ['every item, a record you can check.'] });
    // journey: stations light as the item moves; each move writes a signed entry
    const jA = win(t, tJ, tLed - 0.3), sx = i => M + 150 + i * 460, E4 = entries();
    alpha(jA.a, () => {
      const prog = track([[tJ, 0], [E4[0].t, 0.02], [E4[1].t, 1, 'io'], [E4[2].t, 2, 'io'], [E4[3].t, 3, 'io']], t);
      lineP([[sx(0), SY], [sx(3), SY]], K.hair, 6); lineP([[sx(0), SY], [sx(0) + prog * 460, SY]], K.amber, 6);
      ST.forEach(([ic, lab], i) => {
        const lit = cl(prog - i + 1); save(() => { x.beginPath(); x.arc(sx(i), SY, 62, 0, 7); x.fillStyle = lit >= 0.98 ? '#FFF4DD' : K.bg; x.fill(); x.strokeStyle = lit >= 0.98 ? K.amber : K.hair; x.lineWidth = 3; x.stroke(); });
        icon(ic, sx(i) - 36, SY - 36, 72, K.ink, 4.5); T(lab, sx(i), SY + 112, { size: 38, w: 600, align: 'center' });
      });
      x.beginPath(); x.arc(sx(0) + prog * 460, SY, 12, 0, 7); x.fillStyle = K.amber; x.fill();
    });
    // four ledger nodes in a ring around the record
    alpha(win(t, tLed + 0.4, tQR - 0.4).a, () => {
      const cxR = W / 2, cyR = 380 + 290, rx = 770, ry = 300, rot = (t - tLed) * 0.08;
      x.beginPath(); x.ellipse(cxR, cyR, rx, ry, 0, 0, 7); x.strokeStyle = K.ink2; x.globalAlpha *= 0.35; x.lineWidth = 3; x.setLineDash([2, 14]); x.stroke(); x.setLineDash([]); x.globalAlpha /= 0.35;
      for (let k = 0; k < 4; k++) { const a = rot + k * Math.PI / 2 + Math.PI / 4, px = cxR + Math.cos(a) * rx, py = cyR + Math.sin(a) * ry; const pk = ein(t, tLed + 0.6 + k * 0.25, 0.6);
        alpha(pk, () => { x.beginPath(); x.arc(px, py, 34, 0, 7); x.fillStyle = K.paper; x.fill(); x.strokeStyle = K.amber; x.lineWidth = 3; x.stroke(); x.beginPath(); x.arc(px, py, 10, 0, 7); x.fillStyle = K.amber; x.fill(); }); }
    });
    // the record card (motif)
    const ledgerP = eio(t, tLed - 0.2, 1.0), qrP = eio(t, tQR - 0.2, 1.1);
    const cw = 860, cx = lerp(W / 2 - cw / 2, M + 20, qrP), cy = lerp(lerp(420, 380, ledgerP), 330, qrP);
    if (t > tJ - 0.6 && t < tPush + 0.6) alpha(Math.min(ein(t, tJ - 0.6, 0.6), 1 - eio(t, tPush - 0.2, 0.4)), () => {
      save(() => { x.translate(cx, cy);
        const h = recordCard(0, 0, cw, E4, t, { rowH: 112 });
        const st = ein(t, wt('L13', 'summary') - 0.1, 0.5);
        if (st > 0) alpha(st * (1 - qrP), () => save(() => { x.translate(cw - 160, h - 34 - (1 - st) * 40); x.rotate(-0.1); rr(-160, -42, 320, 84, 14); x.fillStyle = K.bg; x.fill(); x.strokeStyle = K.amber; x.lineWidth = 4; x.stroke(); T('daily summary', 0, 13, { size: 38, fam: 'H', color: K.amberDeep, align: 'center' }); }));
      });
    });
    headline('every entry, signed and dated.', M, 250, t, tLed + 0.3, { size: 72, t1: wt('L13', 'summary') - 0.4 });
    headline('no one can quietly change it.', M, 250, t, wt('L13', 'summary'), { size: 72, t1: tQR - 0.4 });
    // phone scan → push through the phone screen into scene 5
    const pv = win(t, tQR, 1e9), push = E.io(inv(tPush, tPush + 1.7, t));
    if (t > tQR - 0.1 && t < tPush + 1.8) {
      const PX = 1300, PY = 250 + pv.dy, PW = 400, PH = 740, scx = PX + PW / 2, scy = PY + PH / 2, z = Math.exp(push * Math.log(7));
      alpha(pv.a * (1 - eio(t, tPush - 0.3, 0.4)), () => {
        icon('watch', 1030, 440 + pv.dy, 230, K.ink, 5);
        const qx = 1030 + 115 - 36, qy = 440 + 115 - 36 + pv.dy; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if (hash(i * 7 + j * 13) > 0.45 || (i < 2 && j < 2)) { x.fillStyle = K.ink; x.fillRect(qx + i * 12, qy + j * 12, 11, 11); }
      });
      alpha(pv.a, () => save(() => {
        x.translate(lerp(scx, W / 2, push), lerp(scy, H / 2, push)); x.scale(z, z); x.translate(-scx, -scy);
        card(PX, PY, PW, PH, { fill: mixc(K.ink, K.bg, eio(t, tPush + 0.4, 1.0)), stroke: false, r: 54 }); card(PX + 16, PY + 16, PW - 32, PH - 32, { fill: K.bg, stroke: false, r: 42 });
        const scan = eio(t, tQR + 0.6, 1.2), open = ein(t, wt('L14', 'history'), 0.7), fade = 1 - eio(t, tPush - 0.3, 0.4);
        if (open < 1) alpha((1 - open) * fade, () => { const sy = PY + 200 + scan * 260; rr(PX + 70, PY + 180, PW - 140, 300, 16); x.strokeStyle = K.amber; x.lineWidth = 5; x.setLineDash([30, 18]); x.stroke(); x.setLineDash([]); x.fillStyle = K.amber; x.fillRect(PX + 80, sy, PW - 160, 4); });
        alpha(open * fade, () => { T('record', PX + 48, PY + 108, { size: 40, fam: 'H' }); pill('ok', PX + 44, PY + 136, 1, 36, 'verified');
          ['registered', 'parts added', 'shipped', 'sold'].forEach((s, i) => { const yy = PY + 290 + i * 96; x.beginPath(); x.arc(PX + 62, yy - 12, 13, 0, 7); x.fillStyle = K.amber; x.fill(); T(s, PX + 92, yy, { size: 38, w: 600 }); }); });
      }));
    }
    headline('scan the code. no sign-in needed.', M, 250, t, tQR + 0.2, { size: 72, t1: tPush - 0.4 });
    source('Source: TrueChain product brief 1.2, October 2026', t, tJ, tPush - 0.4);
  }
  return { draw };
})();

// ======================================================================= S5 the fit (155–202)
const S5 = (() => {
  const CARD6 = [W / 2 - 700, 250, 1400, 560];
  function draw(t) {
    const t3 = 155.4, tA = 159.6, tB = 172.6, tC = 182.0, tV = 190.6, tEnd = 200.9, tMorph = 200.9;
    const colX = i => M + i * 573, cw = 534;
    const focus = i => t < tA - 0.3 || t >= tV - 0.3 ? 1 : lerp(0.32, 1, eio(t, [tA, tB, tC][i] - 0.4, 0.5) * (i < 2 ? 1 - eio(t, [tB, tC][i] - 0.4, 0.5) : 1));
    ['before listing.', 'at the seller.', 'in a dispute.'].forEach((s, i) => alpha(focus(i), () => headline(s, colX(i), 290, t, t3 + 0.2 + i * 0.15, { size: 60, t1: tEnd, lines: [s] })));
    // 1 listing card → stops / held
    alpha(Math.min(win(t, tA, tEnd).a, focus(0)), () => {
      const X = colX(0), Y = 340 + win(t, tA, tEnd).dy; card(X, Y, cw, 430, { fill: K.paper });
      card(X + 24, Y + 24, cw - 48, 180, { fill: K.sand, stroke: false, r: 12 }); icon('watch', X + cw / 2 - 66, Y + 46, 132, K.ink2, 4);
      T('Automatic watch, 40 mm', X + 28, Y + 258, { size: 38, w: 700 }); T('Item ID TC-7Q4F-92KD', X + 28, Y + 306, { size: 36, w: 500, color: K.ink2 });
      const hp = ein(t, wt('L16', 'hold') - 0.3, 0.5);
      if (hp > 0) { alpha(hp, () => { rr(X, Y, cw, 430, 18); x.strokeStyle = K.bdF; x.lineWidth = 3; x.stroke(); }); pill('held', X + 28, Y + 336, hp, 36); }
      else pill('nf', X + 28, Y + 336, ein(t, wt('L16', 'stops') - 0.2, 0.5), 36, 'not found: stopped');
    });
    // 2 seller ↔ first-sale entry
    alpha(Math.min(win(t, tB, tEnd).a, focus(1)), () => {
      const X = colX(1), Y = 340 + win(t, tB, tEnd).dy;
      card(X, Y, cw, 180, { fill: K.paper }); icon('user', X + 24, Y + 40, 96, K.ink, 5); T('seller account', X + 146, Y + 80, { size: 38, w: 700 }); T('lists TC-7Q4F-92KD', X + 146, Y + 128, { size: 36, color: K.ink2 });
      const lk = eio(t, wt('L17', 'retailer'), 0.8); lineP([[X + cw / 2, Y + 180], [X + cw / 2, Y + 180 + 60 * lk]], K.amber, 5);
      alpha(ein(t, wt('L17', 'retailer') + 0.4, 0.6), () => { card(X, Y + 240, cw, 190, { fill: K.paper, stroke: K.amber, lw: 3 }); T('sold · first retail sale', X + 28, Y + 312, { size: 38, w: 700 }); T('retailer, date, country', X + 28, Y + 362, { size: 36, color: K.ink2 }); });
      alpha(ein(t, wt('L17', 'review') - 0.1, 0.5) * (1 - eio(t, tV - 0.6, 0.4)), () => tag('no match? review it', X, Y + 452, 1, { size: 36 }));
    });
    // 3 chat thread → one record panel
    alpha(Math.min(win(t, tC, tEnd).a, focus(2)), () => {
      const X = colX(2), Y = 340 + win(t, tC, tEnd).dy, sw = eio(t, wt('L18', 'record') - 0.2, 0.8);
      alpha(1 - sw, () => { [[0, 'it was fake!', 300], [1, 'it was not.', 270], [0, 'see this photo…', 330], [1, 'and this one.', 300]].forEach(([r, s, w], i) => { const bx = r ? X + cw - w : X; card(bx, Y + i * 106, w, 86, { fill: r ? K.sand : K.mute, r: 28 }); T(s, bx + 26, Y + i * 106 + 56, { size: 36, w: 600, color: K.ink2 }); }); });
      alpha(sw, () => { card(X, Y + (1 - sw) * 30, cw, 430, { fill: K.paper, stroke: K.amber, lw: 3 }); logoSquare(X + 26, Y + 26, 40); T('record', X + 82, Y + 60, { size: 38, fam: 'H' });
        ['registered', 'shipped', 'sold · first sale', 'buyer lookup · 1'].forEach((s, i) => { const yy = Y + 140 + i * 74; x.beginPath(); x.arc(X + 46, yy - 12, 12, 0, 7); x.fillStyle = K.amber; x.fill(); T(s, X + 74, yy, { size: 36, w: 600 }); }); });
    });
    // the buyer's four answers; "not found" (muted) grows into the limits card of scene 6
    const ks = ['ok', 'at', 'nf', 'bad'], ws = ['verified', 'attention', 'found', 'trusted']; let px = M; const pm = eio(t, tMorph, 1.3);
    ks.forEach((k, i) => {
      const a = ein(t, wt('L19', ws[i]) - 0.2, 0.5), w = tw(VERDICT[k][0], 36, 700, 'B') + 40 + 36 * 0.9;
      if (k === 'nf' && pm > 0) {
        if (t < 202.3) { const r = [px, 800, w, 66].map((v, j) => lerp(v, CARD6[j], pm)); rr(r[0], r[1], r[2], r[3], lerp(33, 18, pm)); x.fillStyle = K.nfB; x.fill(); x.strokeStyle = K.hair; x.lineWidth = 1.5; alpha(pm, () => x.stroke()); pill(k, px, 800, 1 - eio(t, tMorph, 0.3), 36); }
      } else if (t < tMorph + 0.6) pill(k, px, 800 + (1 - a) * 12, a * (1 - eio(t, tMorph - 0.1, 0.4)), 36);
      px += w + 24;
    });
    alpha(win(t, tA + 2, tEnd - 0.2).a, () => tag('Partner interface and listing badge: to agree in a pilot.', M, 905, 1, { size: 36 }));
    source('Source: TrueChain product brief 1.2 and specs 001 to 005, October 2026', t, t3, tEnd - 0.2);
  }
  return { draw };
})();

// ======================================================================= S6 limits (202–227)
const S6 = (() => {
  function draw(t) {
    const tOut = 220.6, tEnd = 226.3, slide = eio(t, tOut, 1.0);
    if (t < 202.2) return;
    const X = W / 2 - 700 - slide * 1750, Y = 250;
    card(X, Y, 1400, 560, { fill: K.mute });
    headline('limits, said plainly.', X + 70, Y + 130, t, 202.5, { size: 76, lines: ['limits, said plainly.'] });
    alpha(ein(t, 203.4, 0.6), () => T("we'll be straight with you.", X + 72, Y + 200 + (1 - ein(t, 203.4, 0.6)) * 12, { size: 40, w: 500, color: K.ink2 }));
    [['it proves a record exists, unaltered. not the item itself.', 'promise'], ['it is only as strong as the brands that join.', 'strong'], ['it covers the first retail sale, not resale.', 'covers']].forEach(([s, w], i) => {
      const v = win(t, wt('L20', w) - 0.2, 1e9), yy = Y + 300 + i * 92;
      alpha(v.a, () => { x.beginPath(); x.arc(X + 96, yy + v.dy - 15, 28, 0, 7); x.strokeStyle = K.ink2; x.lineWidth = 2.5; x.stroke(); T(String(i + 1), X + 96, yy + v.dy - 2, { size: 36, w: 700, align: 'center', color: K.ink2 });
        T(s, X + 150, yy + v.dy, { size: 44, w: 500 }); });
    });
    headline("let's prove it together,", W / 2, 520, t, tOut + 0.5, { size: 84, align: 'center', t1: tEnd, lines: ["let's prove it together,"] });
    headline('not on our word.', W / 2, 620, t, tOut + 0.7, { size: 84, align: 'center', t1: tEnd, lines: ['not on our word.'] });
  }
  return { draw };
})();

// ======================================================================= S7 value (227–255)
const S7 = (() => {
  const ROWS = [['fewer disputes over fakes', 'complaints per 10,000 orders', 'disputes'], ['fewer returns and refunds', 'return rate · refund cost', 'returns'], ['stolen goods held before they sell', 'listings held · time to hold', 'stolen'], ['higher conversion on high-value listings', 'conversion · repeat purchase', 'conversion'], ['better terms with brands', 'brands onboarded', 'terms']];
  function draw(t) {
    const tIn = 227.4, tW = 244.6, tEnd = 254.4;
    headline('where the value shows up.', M, 270, t, tIn + 0.2, { size: 80, t1: tW - 0.4 });
    ROWS.forEach(([g, m, w], i) => {
      const v = win(t, wt('L22', w) - 0.2, tW - 0.5 + i * 0.05), Y = 330 + i * 104 + v.dy;
      alpha(v.a, () => { card(M, Y, W - 2 * M, 90, { fill: K.paper }); x.fillStyle = K.amber; rr(M + 26, Y + 31, 28, 28, 7); x.fill(); T(g, M + 80, Y + 59, { size: 42, w: 700 });
        const mw = tw(m, 36, 600, 'B') + 44; card(W - M - mw - 18, Y + 14, mw, 62, { fill: K.sand, r: 31 }); T(m, W - M - mw + 4, Y + 57, { size: 36, w: 600, color: K.ink2 }); });
    });
    alpha(win(t, tIn + 3, tW - 0.4).a, () => tag('None of these gains has been measured with a marketplace yet.', M, 870, 1, { size: 36 }));
    // pilot category → any category; the record card rides alongside
    const wv = win(t, tW, tEnd), tNo = wt('L23', 'nothing'), morph = eio(t, tNo - 0.1, 1.0);
    alpha(wv.a, () => {
      icon('watch', lerp(W / 2 - 340, M + 20, morph), lerp(300, 340, morph) + wv.dy, lerp(320, 200, morph), K.ink, 5);
      ['bag', 'shoe', 'laptop'].forEach((ic, i) => alpha(ein(t, tNo + 0.3 + i * 0.15, 0.6), () => icon(ic, M + 270 + i * 240, 350 + wv.dy, 180, K.ink2, 5)));
      recordCard(W - M - 640, 300 + wv.dy, 640, [{ title: 'registered by the brand', meta: 'signed · 12 Mar 2026', t: tW + 0.6 }, { title: 'sold · first retail sale', meta: 'signed · 03 May 2026', t: tW + 1.3 }], t, { rowH: 112 });
    });
    headline('in pilot with luxury watches.', M, 720, t, tW + 0.3, { size: 76, t1: tEnd });
    body('nothing in the design is limited to watches.', M, 805, t, tNo, { size: 46, maxW: 1400, t1: tEnd, color: K.ink });
    source('Source: TrueChain briefing, pages 5 and 6, October 2026', t, tIn, tEnd);
  }
  return { draw };
})();

// ======================================================================= S8 the ask + end card (255–280)
const S8 = (() => {
  const PC = [W / 2 - 600, 250, 1200, 560];
  function draw(t) {
    const tIn = 255.4, tEC = TL.endCard, tM = tEC - 0.6, pm = eio(t, tM, 1.1);
    const s = 120, wd = tw('TrueChain', 120, 800, 'H'), tot = s + 34 + wd, LX = W / 2 - tot / 2, LY = 230;
    const v = win(t, tIn, 1e9), ca = 1 - eio(t, tM - 0.5, 0.4);
    // pilot card → becomes the logo square of the end card
    if (t < tEC + 0.6) {
      const r = PC.map((q, k) => lerp(q, [LX, LY, s, s][k], pm));
      alpha(v.a, () => { rr(r[0], r[1] + v.dy * (1 - pm), r[2], r[3], lerp(18, 29, pm)); x.fillStyle = mixc(K.sand, K.amber, pm); x.fill(); if (pm < 0.5) { x.strokeStyle = K.hair; x.lineWidth = 1.5; x.stroke(); } });
      alpha(ca, () => {
        const X = PC[0], Y = PC[1] + v.dy;
        headline('a 90-day pilot.', X + 70, Y + 130, t, tIn + 0.2, { size: 80, lines: ['a 90-day pilot.'] });
        [['scope', '2 brands · 1 category · 90 days', 'two'], ['targets', 'fixed together, before we start', 'agree'], ['results', 'read together', 'read']].forEach(([k, s2, w], i) => {
          const a = ein(t, wt('L24', w) - 0.2, 0.6), yy = Y + 250 + i * 100; alpha(a, () => { x.fillStyle = K.hair; x.fillRect(X + 70, yy - 64, 1060, 1.5); T(k, X + 70, yy + (1 - a) * 12, { size: 40, w: 500, color: K.ink2 }); T(s2, X + 330, yy + (1 - a) * 12, { size: 46, w: 700 }); });
        });
      });
    }
    // end card
    if (t >= tEC + 0.5) logoSquare(LX, LY, s, 1, false);
    if (t >= tEC) {
      alpha(ein(t, tEC + 0.2, 0.6), () => x.drawImage(IM.markC, LX + s * 0.14, LY + s * 0.14, s * 0.72, s * 0.72));
      save(() => { x.beginPath(); x.rect(LX + s + 14, LY - 30, W, s + 60); x.clip(); const sl = ein(t, tEC + 0.3, 0.9); alpha(sl, () => T('TrueChain', LX + s + 34 - (1 - sl) * 70, LY + s / 2 + 44, { size: 120, fam: 'H' })); });
      headline('every item, a record you can check.', W / 2, 520, t, tEC + 0.5, { size: 80, align: 'center', lines: ['every item, a record you can check.'] });
      body('A product of Omnix', W / 2, 620, t, tEC + 1.0, { size: 40, align: 'center', color: K.ink2, maxW: 1600 });
      body('theomnix.org/truechain   ·   connect@theomnix.org', W / 2, 690, t, tEC + 1.2, { size: 40, align: 'center', color: K.ink, w: 600, maxW: 1600 });
      body('+91 95906 08091', W / 2, 746, t, tEC + 1.35, { size: 40, align: 'center', color: K.ink, w: 600, maxW: 1600 });
      const pa = ein(t, tEC + 1.6, 0.6); const pw = tw('Book a 90-day pilot', 38, 700, 'B') + 64;
      alpha(pa, () => { rr(W / 2 - pw / 2, 800 + (1 - pa) * 12, pw, 74, 37); x.fillStyle = K.amber; x.fill(); T('Book a 90-day pilot', W / 2, 850 + (1 - pa) * 12, { size: 38, w: 700, align: 'center' }); });
    }
  }
  return { draw };
})();

// ======================================================================= compositor
const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8];
window.COMP = {
  get dur() { return TL.total; },
  draw(t) {
    const sc = SC();
    x.fillStyle = K.bg; x.fillRect(0, 0, W, H);
    // one continuous camera: a slow breathing push that never resets between scenes
    const cs = 1 + 0.006 * Math.sin(t * 2 * Math.PI / 37) + 0.004, dx = noise1(t * 0.07) * 5, dy = noise1(t * 0.05 + 9) * 4;
    save(() => {
      if (t >= 20) { x.translate(W / 2 + dx, H / 2 + dy); x.scale(cs, cs); x.translate(-W / 2, -H / 2); }
      SCENES.forEach((S, i) => { if (t >= sc[i] - 1.0 && t < sc[i + 1] + 1.2) S.draw(t); });
    });
    // fixed chrome: eyebrow, brand mark, progress
    const si = sc.findIndex((s, i) => t >= s && t < sc[i + 1]);
    if (t >= 20 && t < TL.endCard) {
      const eA = Math.min(ein(t, sc[si] + 0.1, 0.6), 1 - eio(t, sc[si + 1] - 0.5, 0.4));
      if (EYEBROW[si]) eyebrowText(EYEBROW[si], M, M - 20, eA);
      brandMark(t, Math.min(ein(t, 20.2, 0.8), 1 - eio(t, TL.endCard - 0.4, 0.4)));
    }
    hud(t);
  },
};
