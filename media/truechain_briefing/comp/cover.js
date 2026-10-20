// 1:1 reel cover: a tidy amber parcel grid with one grey parcel, the hook, and the TrueChain lockup.
window.TL = { total: 1, scenes: [0, 1], lines: [], cues: [], endCard: 99 };
window.COMP = { dur: 1, draw() {
  x.fillStyle = K.bg; x.fillRect(0, 0, W, H);
  const HW = 150, SX = 228, SY = 182, ox = 30, oy = 0;
  save(() => { x.beginPath(); x.rect(0, 0, W, 610); x.clip();
    for (let r = 0; r < 4; r++) for (let c = -1; c < 6; c++) {
      const px = 90 + c * SX + (r % 2 ? SX / 2 : 0) + ox, py = 70 + r * SY + oy, hero = r === 2 && c === 2;
      save(() => { x.fillStyle = 'rgba(28,26,23,0.07)'; x.beginPath(); x.ellipse(px + 9, py + HW * 0.38, HW * 0.55, HW * 0.06, 0, 0, 7); x.fill(); });
      parcel(px, py, HW, hero ? PAL.grey : PAL.amber, { open: hero ? 0.55 : 0 });
    } });
  x.fillStyle = K.bg; x.fillRect(0, 610, W, H - 610); x.fillStyle = K.hair; x.fillRect(0, 610, W, 2);
  T("some don't.", M, 790, { size: 150, fam: 'H' });
  T('every item, a record you can check.', M, 868, { size: 46, w: 600, color: K.ink2 });
  const s = 64; logoSquare(M, 940, s); T('TrueChain', M + s + 18, 940 + s / 2 + 18, { size: 50, fam: 'H' });
  const w = tw('a product of Omnix', 36, 500, 'B'); T('a product of Omnix', W - M, 940 + s / 2 + 13, { size: 36, w: 500, color: K.ink2, align: 'right' });
  x.fillStyle = K.amber; x.fillRect(0, H - 10, W, 10);
} };
