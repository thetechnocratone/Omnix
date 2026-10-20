// YouTube (16:9) and Instagram (9:16) thumbnails: parcel-grid background + title copy.
window.TL = { total: 1, scenes: [0, 1], lines: [], cues: [], endCard: 99 };
function grid(HW, x0, y0, rows, cols, grey) {
  const SX = HW * 1.52, SY = HW * 1.21;
  for (let r = 0; r < rows; r++) for (let c = -1; c < cols; c++) {
    const px = x0 + c * SX + (r % 2 ? SX / 2 : 0), py = y0 + r * SY, g = grey && r === grey[0] && c === grey[1];
    save(() => { x.fillStyle = 'rgba(28,26,23,0.07)'; x.beginPath(); x.ellipse(px + HW * 0.06, py + HW * 0.38, HW * 0.55, HW * 0.06, 0, 0, 7); x.fill(); });
    parcel(px, py, HW, g ? PAL.grey : PAL.amber, { open: g ? 0.55 : 0 });
  }
}
// title: 'TrueChain' in brand orange, the rest in dark grey
function title(X, Y, size, lh) {
  const g = '#3D3A36', w = tw('TrueChain', size, 800, 'H');
  T('TrueChain', X, Y, { size, fam: 'H', color: K.amber }); T(' for', X + w, Y, { size, fam: 'H', color: g });
  T('E-commerce', X, Y + lh, { size, fam: 'H', color: g }); T('Marketplaces', X, Y + 2 * lh, { size, fam: 'H', color: g });
}
function lockup(X, Y, s, size) { logoSquare(X, Y, s); T('TrueChain', X + s + s * 0.28, Y + s / 2 + size * 0.36, { size, fam: 'H' }); }
window.COMP = { dur: 1, draw() {
  x.fillStyle = K.bg; x.fillRect(0, 0, W, H);
  if (W === H) {                     // Instagram / feed 1:1
    save(() => { x.beginPath(); x.rect(0, 0, W, 390); x.clip(); grid(132, 40, 72, 3, 7, [1, 3]); });
    x.fillStyle = K.hair; x.fillRect(0, 390, W, 2);
    logoSquare(W - M - 84, 432, 84);
    title(M - 4, 510, 94, 92);
    x.fillStyle = K.amber; x.fillRect(M, 738, 110, 9);
    ['A blockchain-based solution', 'to build trust into every order'].forEach((l, i) => T(l, M, 812 + i * 52, { size: 42, w: 600, color: K.ink2 }));
    T('A product of Omnix', M, 990, { size: 36, w: 600, color: K.ink });
  } else if (W > H) {                // YouTube 16:9
    save(() => { x.beginPath(); x.rect(980, 0, W - 980, H); x.clip(); grid(170, 900, 110, 5, 7, [2, 2]); });
    x.fillStyle = K.hair; x.fillRect(980, 0, 2, H);
    logoSquare(M, 110, 96);
    title(M - 6, 380, 124, 124);
    x.fillStyle = K.amber; x.fillRect(M, 665, 120, 10);
    ['A blockchain-based solution to', 'build trust into every order'].forEach((l, i) => T(l, M, 790 + i * 62, { size: 50, w: 600, color: K.ink2 }));
    T('A product of Omnix', M, 990, { size: 40, w: 600, color: K.ink });
  } else {                           // Instagram 9:16
    save(() => { x.beginPath(); x.rect(0, 0, W, 900); x.clip(); grid(185, 60, 120, 5, 6, [3, 2]); });
    x.fillStyle = K.hair; x.fillRect(0, 900, W, 2);
    logoSquare(M, 990, 96);
    title(M - 4, 1220, 120, 118);
    x.fillStyle = K.amber; x.fillRect(M, 1500, 120, 10);
    ['A blockchain-based solution', 'to build trust into every order'].forEach((l, i) => T(l, M, 1592 + i * 60, { size: 48, w: 600, color: K.ink2 }));
    T('A product of Omnix', M, 1790, { size: 40, w: 600, color: K.ink });
  }
  x.fillStyle = K.amber; x.fillRect(0, H - 10, W, 10);
} };
