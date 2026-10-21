import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, delayRender, continueRender} from 'remotion';
import {loadFont} from '@remotion/fonts';
import tl from './timeline.json';

// ---------------------------------------------------------------- fonts (wait before any frame renders)
const fontHandle = delayRender('fonts');
Promise.all([
  loadFont({family: 'Montserrat', url: staticFile('Montserrat.ttf'), weight: '100 900'}),
  loadFont({family: 'JBMono', url: staticFile('JetBrainsMono.ttf'), weight: '100 800'}),
]).then(() => continueRender(fontHandle));

const F = 'Montserrat', M = 'JBMono';
export const TOTAL = tl.total;
const FPS = 30, N = Math.round(TOTAL * FPS), HOLD = 8;

// ---------------------------------------------------------------- palette (BRAND.md, bright theme)
const C = {paper: '#F5ECDD', muted: '#E6DCCB', ink: '#1F1A15', saf: '#F08A12', saf2: '#FFC46B', safDeep: '#C9650A', mute: '#8C8073',
  line: '#DCCDB5', fill: '#FFF7EA', white: '#FFFBF4', tan: '#E9D5B5', kraft: '#DCC9A8', kraftTop: '#E8D9BD', kraftSide: '#C9B390',
  red: '#E5532B', redDeep: '#B8401F', sage: '#5E8A55'};

// ---------------------------------------------------------------- time helpers
const cl = (x: number) => Math.min(1, Math.max(0, x));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const E = (t: number, a: number, b: number) => eio(seg(t, a, b));
const bell = (t: number, a: number, b: number) => Math.sin(Math.PI * seg(t, a, b));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, p: number) => `rgb(${hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * p)).join(',')})`;

const norm = (w: string) => w.toLowerCase().replace(/[“”".,:?!]/g, '');
const W = (b: number, word: string, n = 1) => {
  let c = 0;
  for (const w of tl.beats[b - 1].words) if (norm(w.w) === word && ++c === n) return w.s;
  throw new Error('word ' + word);
};

// ---------------------------------------------------------------- world geometry (level 0 = shelf world, px)
const FX0 = 190, FX1 = 870, FY0 = 820, FY1 = 1340, DX = 80, DY = -150;      // hero box front face + depth offset
const P = {x: 570, y: 745};                                                   // lid seam centre: the dive point
const K1 = 0.5;
const DV = {x: 570, y: 850};                                                  // device centre inside the box                                                               // device scene scale in the world
const CHIP_DEV = {x: 640, y: 990};                                            // implant, device-local
const CHIP_W = {x: DV.x + (CHIP_DEV.x - 540) * K1, y: DV.y + (CHIP_DEV.y - 960) * K1};
const K2 = K1 / 6;                                                              // macro scene scale in the world
const CHIP_MAC = {x: 640, y: 960};
const MAC0 = {x: CHIP_W.x - CHIP_MAC.x * K2, y: CHIP_W.y - CHIP_MAC.y * K2};  // macro origin in world
const macW = (x: number, y: number) => ({x: MAC0.x + x * K2, y: MAC0.y + y * K2});
const DEV0 = {x: DV.x - 540 * K1, y: DV.y - 960 * K1};
const CHAIN_Y = -2860;                                                        // chain scene local (0,0) in world
const ROWS = [-3, -2, -1, 0, 1, 2, 3];
const REGIONS = ['MALAYSIA', 'SINGAPORE', 'THAILAND', 'INDONESIA', 'PHILIPPINES', 'VIETNAM', 'HONG KONG'];
const plankY = (r: number) => FY1 + 820 * r;
const COLS = [-3, -2, -1, 0, 1, 2, 3];
const colX = (j: number) => 530 + 900 * j;

// ---------------------------------------------------------------- the one camera move
type Key = {t: number; x: number; y: number; s: number; b?: number};
const MAC_C = macW(540, 960), COIN_C = macW(1940, 960);
const K: Key[] = [
  {t: 0, x: 540, y: 960, s: 1},
  {t: HOLD / FPS, x: 540, y: 960, s: 1},
  {t: 5.35, x: 560, y: 905, s: 1.25},                         // push toward the glowing seam
  {t: 6.95, x: -1100, y: 1000, s: 0.62},                     // swing back along the shelf
  {t: 8.9, x: 540, y: 990, s: 0.8},                          // ...and back to the tagged box
  {t: 9.75, x: 562, y: 870, s: 1.2},
  {t: 10.95, x: DV.x, y: DV.y, s: 1 / K1},                     // through the lid seam: the device
  {t: 11.85, x: MAC_C.x, y: MAC_C.y, s: 1 / K2},             // through the case: the circuit board
  {t: 15.25, x: MAC_C.x, y: MAC_C.y, s: 1.15 / K2},
  {t: 16.45, x: COIN_C.x, y: COIN_C.y, s: 1 / K2},               // follow the trace out to the coins
  {t: 23.55, x: COIN_C.x, y: COIN_C.y, s: 1.07 / K2},
  {t: 24.6, x: DV.x, y: DV.y, s: 1 / K1},                      // pull back to the whole device
  {t: 30.05, x: DV.x, y: DV.y + 4, s: 1.08 / K1},
  {t: 31.25, x: 540, y: 1300, s: 0.36},                      // back out through the box to the shelves
  {t: 34.95, x: 565, y: 1290, s: 0.38},
  {t: 36.65, x: 540, y: -1900, s: 1.0},                      // rise into the light
  {t: 43.45, x: 545, y: -1905, s: 1.05},
  {t: 44.85, x: 1620, y: -1900, s: 1.0},                     // along the chain to YOU
  {t: 46.05, x: 540, y: 1010, s: 1.1, b: 0.5},               // swoop down to the box in your hands
  {t: 49.1, x: 546, y: 1000, s: 1.13},
  {t: 50.3, x: 540, y: 960, s: 1},                           // settle on frame 0
];
const camAt = (t: number) => {
  let i = 0;
  while (i < K.length - 2 && t >= K[i + 1].t) i++;
  const a = K[i], b = K[i + 1];
  const e = eio(seg(t, a.t, b.t));
  let s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), e));
  // keep the dive point steady while zooming (zoom-pan: position follows 1/s)
  const u = Math.abs(a.s - b.s) > 1e-6 ? (1 / a.s - 1 / s) / (1 / a.s - 1 / b.s) : e;
  const x = lerp(a.x, b.x, u), y = lerp(a.y, b.y, u);
  if (b.b) s *= 1 - b.b * Math.sin(Math.PI * e);
  return {x, y, s};
};

// ---------------------------------------------------------------- small drawing parts
const Glow: React.FC<{x: number; y: number; r: number; color: string; o: number}> = ({x, y, r, color, o}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', opacity: o,
    background: `radial-gradient(circle, ${color} 0%, ${color}88 28%, ${color}00 70%)`}} />
);

const Box: React.FC<{x: number; y: number; w?: number; h?: number; o?: number; front?: string}> = ({x, y, w = FX1 - FX0, h = FY1 - FY0, o = 1, front = C.kraft}) => (
  <svg style={{position: 'absolute', left: x - 10, top: y + DY - 10, overflow: 'visible', opacity: o}} width={w + DX + 20} height={h - DY + 20}>
    <g transform={`translate(10 ${10 - DY})`} stroke={C.ink} strokeWidth={5} strokeLinejoin="round">
      <polygon points={`0,0 ${w},0 ${w + DX},${DY} ${DX},${DY}`} fill={C.kraftTop} />
      <polygon points={`${w},0 ${w + DX},${DY} ${w + DX},${h + DY} ${w},${h}`} fill={C.kraftSide} />
      <rect x={0} y={0} width={w} height={h} fill={front} />
      <polygon points={`${w * 0.42},0 ${w * 0.58},0 ${w * 0.58 + DX},${DY} ${w * 0.42 + DX},${DY}`} fill="#CDB892" strokeWidth={3} />
    </g>
  </svg>
);

const Key: React.FC<{x: number; y: number; s?: number; o?: number; rot?: number}> = ({x, y, s = 1, o = 1, rot = 0}) => (
  <svg style={{position: 'absolute', left: x - 60 * s, top: y - 30 * s, opacity: o, transform: `rotate(${rot}deg)`}} width={120 * s} height={60 * s} viewBox="0 0 120 60">
    <circle cx={22} cy={30} r={17} fill={C.saf2} stroke={C.ink} strokeWidth={6} />
    <circle cx={22} cy={30} r={6} fill={C.ink} />
    <path d="M39 30 H110 M90 30 V46 M104 30 V42" stroke={C.ink} strokeWidth={8} strokeLinecap="round" fill="none" />
  </svg>
);

const Coin: React.FC<{x: number; y: number; r: number; o: number; spin: number}> = ({x, y, r, o, spin}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, opacity: o, transform: `scaleX(${Math.max(0.15, Math.abs(Math.cos(spin)))})`}}>
    <svg width={r * 2} height={r * 2} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={44} fill={C.saf} stroke={C.ink} strokeWidth={8} />
      <circle cx={50} cy={50} r={28} fill="none" stroke={C.safDeep} strokeWidth={6} />
    </svg>
  </div>
);

const Person: React.FC<{x: number; y: number; skin: string; cloth: string; p: number; arms: number; label: string; lo: number}> = ({x, y, skin, cloth, p, arms, label, lo}) => (
  <div style={{position: 'absolute', left: x - 100, top: y, width: 200, height: 420, opacity: cl(p * 2), transform: `translateY(${(1 - eo(p)) * 60}px) scale(${0.6 + 0.4 * eo(p)})`, transformOrigin: '50% 100%'}}>
    <svg width={200} height={330} viewBox="0 0 200 330" style={{overflow: 'visible'}}>
      {/* arms reach sideways to the neighbours */}
      <path d={`M60 150 Q${30 - 40 * arms} ${170 - 10 * arms} ${10 - 100 * arms} ${185 - 15 * arms}`} stroke={skin} strokeWidth={22} strokeLinecap="round" fill="none" />
      <path d={`M140 150 Q${170 + 40 * arms} ${170 - 10 * arms} ${190 + 100 * arms} ${185 - 15 * arms}`} stroke={skin} strokeWidth={22} strokeLinecap="round" fill="none" />
      <path d="M60 150 Q30 170 10 185 M140 150 Q170 170 190 185" stroke={C.ink} strokeWidth={0} fill="none" />
      <path d="M52 132 Q100 108 148 132 L160 310 Q100 326 40 310 Z" fill={cloth} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={100} cy={72} r={46} fill={skin} stroke={C.ink} strokeWidth={6} />
    </svg>
    <div style={{position: 'absolute', top: 350, left: -40, right: -40, textAlign: 'center', fontFamily: M, fontWeight: 700, fontSize: 30, color: C.ink, opacity: lo, letterSpacing: 1}}>{label}</div>
  </div>
);

// ---------------------------------------------------------------- level 0: shelves and the hero box
const Shelves: React.FC<{t: number; o: number}> = ({t, o}) => {
  const reset = 1 - E(t, 44.0, 44.8);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      {ROWS.map((r, i) => {
        const py = plankY(r);
        const dim = E(t, 31.2 + i * 0.42, 31.65 + i * 0.42) * reset;
        return (
          <React.Fragment key={r}>
            {COLS.map((j) => {
              if (r === 0 && j === 0) return null;
              const trim = j === 1 ? E(t, 33.1 + i * 0.1, 33.75 + i * 0.1) * reset : 0;
              const tagT = 30.85 + i * 0.2 + (j + 3) * 0.03;
              const drop = seg(t, tagT, tagT + 0.35);
              return (
                <React.Fragment key={j}>
                  <div style={{position: 'absolute', left: 0, top: 0, transform: `translateX(${trim * 700}px)`, opacity: 1 - trim}}>
                    <Box x={colX(j) - (FX1 - FX0) / 2} y={py - (FY1 - FY0)} />
                  </div>
                  {drop > 0 && reset > 0 && (
                    <div style={{position: 'absolute', left: colX(j) - 230, top: py - 330 - (1 - eo(drop)) * 260, width: 400, transform: 'rotate(-7deg)', opacity: cl(drop * 3) * reset * (1 - trim),
                      border: `12px solid ${C.ink}`, borderRadius: 16, background: C.white, fontFamily: F, fontWeight: 900, fontSize: 96, color: C.ink, textAlign: 'center', lineHeight: 1.3}}>PAUSED</div>
                  )}
                </React.Fragment>
              );
            })}
            <div style={{position: 'absolute', left: -2600, top: py, width: 6400, height: 40, background: '#D3BC94', borderTop: `6px solid ${C.ink}`, borderBottom: `6px solid ${C.ink}`}} />
            <div style={{position: 'absolute', left: -760, top: py + 60, background: C.white, border: `6px solid ${C.ink}`, borderRadius: 12, padding: '6px 24px', fontFamily: M, fontWeight: 800, fontSize: 84, color: C.ink, whiteSpace: 'nowrap'}}>{REGIONS[i]}</div>
            <div style={{position: 'absolute', left: -2600, top: py - 760, width: 6400, height: 860, background: C.ink, opacity: 0.32 * dim}} />
          </React.Fragment>
        );
      })}
      {[-2620, 3760].map((x) => <div key={x} style={{position: 'absolute', left: x, top: plankY(-3) - 900, width: 60, height: 820 * 6 + 1000, background: '#C9B08A', border: `6px solid ${C.ink}`}} />)}
    </div>
  );
};

const HeroBox: React.FC<{t: number; shellO: number; xray: number; seam: number}> = ({t, shellO, xray, seam}) => {
  const w = FX1 - FX0, h = FY1 - FY0;
  const reset = 1 - E(t, 44.0, 44.8);
  const tagIn = E(t, W(2, 'reseller'), W(2, 'reseller') + 0.45) * (1 - E(t, 9.4, 9.9));
  const pausedDrop = seg(t, 31.45, 31.8);
  const seal = E(t, 45.5, 45.95) * (1 - E(t, 49.2, 49.9));
  const yes = E(t, 46.5, 47.0) * (1 - E(t, 49.0, 49.5));
  const yesOn = E(t, W(8, 'yes'), W(8, 'yes') + 0.2), noOn = E(t, W(8, 'no'), W(8, 'no') + 0.2);
  const rgba = (a: string, b: string, p: number, al: number) => `rgba(${hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * p)).join(',')},${al})`;
  const frontFill = rgba(C.kraft, C.white, xray, lerp(1, 0.42, xray));
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: shellO}}>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={10} height={10}>
        <g stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
          {/* top face, translucent in x-ray so the device inside shows */}
          <polygon points={`${FX0},${FY0} ${FX1},${FY0} ${FX1 + DX},${FY0 + DY} ${FX0 + DX},${FY0 + DY}`} fill={rgba(C.kraftTop, '#F4EAD6', xray, lerp(1, 0.25, xray))} />
          <polygon points={`${FX1},${FY0} ${FX1 + DX},${FY0 + DY} ${FX1 + DX},${FY1 + DY} ${FX1},${FY1}`} fill={rgba(C.kraftSide, '#D6C3A0', xray, lerp(1, 0.55, xray))} />
        </g>
      </svg>
      {/* lid seam (glows before the dive) */}
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={10} height={10}>
        <line x1={FX0 + DX / 2} y1={FY0 + DY / 2} x2={FX1 + DX / 2} y2={FY0 + DY / 2} stroke={mix(C.ink, C.saf2, seam)} strokeWidth={6 + 10 * seam} strokeLinecap="round" />
        {seam > 0 && <line x1={FX0 + DX / 2} y1={FY0 + DY / 2} x2={FX1 + DX / 2} y2={FY0 + DY / 2} stroke="#FFF3D6" strokeWidth={30 * seam} strokeLinecap="round" opacity={0.7 * seam} />}
      </svg>
      <div style={{position: 'absolute', left: FX0, top: FY0, width: w, height: h, background: frontFill, border: `6px solid ${C.ink}`, boxSizing: 'border-box', overflow: 'hidden'}}>
        {/* x-ray scan lines */}
        <div style={{position: 'absolute', inset: 0, opacity: 0.5 * xray, background: `repeating-linear-gradient(0deg, ${C.line} 0px, ${C.line} 3px, transparent 3px, transparent 26px)`}} />
        {/* packing foam outline seen through the front */}
        {/* YES / NO choice */}
        <div style={{position: 'absolute', inset: 0, display: 'flex', opacity: yes}}>
          {[['YES', yesOn], ['NO', noOn]].map(([s, on], i) => (
            <div key={i} style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontWeight: 900, fontSize: 150, letterSpacing: -4,
              color: C.ink, background: mix(C.kraft, C.saf, (on as number) * 0.85), borderLeft: i ? `6px solid ${C.ink}` : 'none'}}>{s as string}</div>
          ))}
        </div>
      </div>
      <Glow x={CHIP_W.x} y={CHIP_W.y} r={300} color={C.red} o={0.6 * xray} />
      <div style={{position: 'absolute', left: CHIP_W.x - 36, top: CHIP_W.y - 24, width: 72, height: 48, borderRadius: 8, background: C.red, border: `4px solid ${C.ink}`, opacity: xray, boxShadow: `0 0 40px ${C.red}`}} />
      {/* intact seal over the lid seam */}
      {seal > 0 && (
        <svg style={{position: 'absolute', left: P.x - 90, top: P.y - 90, overflow: 'visible', opacity: seal, transform: `scale(${0.6 + 0.4 * eo(seal)})`}} width={180} height={180}>
          <polygon points="-250,96 430,96 430,84 -250,84" fill={C.saf} opacity={0} />
          <circle cx={90} cy={90} r={78} fill={C.saf} stroke={C.ink} strokeWidth={8} />
          <circle cx={90} cy={90} r={58} fill="none" stroke={C.white} strokeWidth={5} strokeDasharray="10 8" />
          <path d="M58 92 L82 116 L124 68" fill="none" stroke={C.white} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {/* RESELLER tag */}
      {tagIn > 0 && (
        <div style={{position: 'absolute', left: FX0 - 90, top: FY0 + 60, transformOrigin: '50% -40px', transform: `rotate(${(1 - eo(tagIn)) * -30 + Math.sin(t * 3) * 2}deg)`, opacity: tagIn}}>
          <div style={{position: 'absolute', left: 150, top: -60, width: 6, height: 64, background: C.ink}} />
          <div style={{background: C.white, border: `6px solid ${C.ink}`, borderRadius: 14, padding: '14px 22px', fontFamily: M, fontWeight: 800, fontSize: 38, color: C.ink, lineHeight: 1.35, whiteSpace: 'nowrap', boxShadow: `8px 8px 0 ${C.ink}`}}>
            RESELLER: 1<br />REGION: SE ASIA
          </div>
        </div>
      )}
      {pausedDrop > 0 && reset > 0 && (
        <div style={{position: 'absolute', left: 300, top: 1010 - (1 - eo(pausedDrop)) * 260, width: 400, transform: 'rotate(-7deg)', opacity: cl(pausedDrop * 3) * reset,
          border: `12px solid ${C.ink}`, borderRadius: 16, background: C.white, fontFamily: F, fontWeight: 900, fontSize: 96, color: C.ink, textAlign: 'center', lineHeight: 1.3}}>PAUSED</div>
      )}
    </div>
  );
};

const Hands: React.FC<{p: number}> = ({p}) => {
  if (p <= 0) return null;
  const skin = '#A8704A';
  const y = (1 - eo(p)) * 700;
  const hand = (x: number, flip: number) => (
    <g transform={`translate(${x} ${FY1 + y}) scale(${flip} 1)`} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round">
      <path d="M-60 520 L-40 40 Q-30 -20 40 -10 L120 0 Q150 10 140 40 L100 120 Q80 180 40 200 L20 520 Z" fill={skin} />
      <path d="M40 -10 Q60 -90 40 -150 Q30 -185 60 -190 Q90 -190 92 -150 L100 -20" fill={skin} />
      <path d="M-4 40 L84 40" stroke="#8C5A3A" strokeWidth={5} fill="none" />
    </g>
  );
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: cl(p * 3)}} width={10} height={10}>
      {hand(FX0 + 60, 1)}
      {hand(FX1 - 20, -1)}
    </svg>
  );
};

// ---------------------------------------------------------------- level 1: the device (WALLET-X), local 1080x1920
const Device: React.FC<{t: number; xray: number}> = ({t, xray}) => {
  const scan = seg(t, 26.0, 27.35);
  const scanOn = t > 25.9 && t < 27.55;
  const gO = E(t, W(5, 'authenticity'), W(5, 'authenticity') + 0.3) * (1 - E(t, 29.9, 30.6));
  const ring = E(t, W(5, 'separate'), W(5, 'separate') + 0.3) * (1 - E(t, 30.2, 30.8));
  const caseSeam = bell(t, 10.25, 11.3);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}}>
      {/* board, visible through the case */}
      <div style={{position: 'absolute', left: 150, top: 790, width: 780, height: 340, borderRadius: 30, background: C.tan, border: `5px solid ${C.ink}`, opacity: 0.35 + 0.65 * xray}}>
        <svg width={780} height={340} style={{position: 'absolute'}}>
          {[60, 120, 180, 240, 300].map((y) => <path key={y} d={`M380 ${y} H${520 + (y % 120)} V${y + 20} H760`} stroke={C.safDeep} strokeWidth={5} fill="none" opacity={0.7} />)}
          <rect x={560} y={70} width={120} height={120} rx={10} fill={C.ink} />
          <text x={620} y={140} textAnchor="middle" fontFamily={M} fontWeight={800} fontSize={34} fill={C.white}>SE</text>
          <path d="M490 200 q 30 -40 60 0 t 60 0 t 60 0" stroke={C.ink} strokeWidth={4} fill="none" />
        </svg>
      </div>
      {/* the implant: the only red-orange object */}
      <Glow x={CHIP_DEV.x} y={CHIP_DEV.y} r={430} color={C.red} o={0.6 * xray} />
      <div style={{position: 'absolute', left: CHIP_DEV.x - 70, top: CHIP_DEV.y - 46, width: 140, height: 92, borderRadius: 10, background: C.red, border: `5px solid ${C.ink}`, boxShadow: `0 0 30px ${C.red}`}}>
        <div style={{position: 'absolute', left: -20, top: 26, width: 34, height: 34, borderRadius: '50%', background: C.ink, border: `4px solid ${C.white}`}} />
      </div>
      {/* case */}
      <div style={{position: 'absolute', left: 110, top: 740, width: 860, height: 440, borderRadius: 70, border: `8px solid ${C.ink}`, boxSizing: 'border-box',
        background: `rgba(255,251,244,${lerp(0.96, 0.28, xray)})`}}>
        <div style={{position: 'absolute', left: 52, top: 72, width: 360, height: 190, borderRadius: 18, background: C.ink, opacity: 0.92}}>
          <div style={{position: 'absolute', inset: 22, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14}}>
            {Array.from({length: 8}).map((_, i) => <div key={i} style={{height: 22, borderRadius: 6, background: '#5E5348'}} />)}
          </div>
        </div>
        <div style={{position: 'absolute', right: 70, top: 40, fontFamily: M, fontWeight: 800, fontSize: 40, color: C.ink, letterSpacing: 4}}>WALLET-X</div>
        {[0, 1].map((i) => <div key={i} style={{position: 'absolute', left: 110 + i * 170, bottom: 50, width: 70, height: 70, borderRadius: '50%', border: `6px solid ${C.ink}`, background: C.white}} />)}
        {/* case seam the camera passes through */}
        <div style={{position: 'absolute', left: 30, right: 30, top: 214, height: 6 + 14 * caseSeam, background: mix(C.ink, C.saf2, caseSeam), borderRadius: 8, boxShadow: caseSeam > 0 ? `0 0 ${60 * caseSeam}px ${C.saf2}` : 'none', opacity: 0.4 + 0.6 * caseSeam}} />
      </div>
      {/* authenticity scan */}
      {scanOn && <div style={{position: 'absolute', left: 90 + scan * 880, top: 700, width: 26, height: 520, background: C.saf2, boxShadow: `0 0 50px ${C.saf2}`, borderRadius: 13, opacity: 0.9}} />}
      {gO > 0 && (
        <div style={{position: 'absolute', left: 240, top: 590, opacity: gO, transform: `translateY(${(1 - eo(gO)) * 30}px)`, display: 'flex', alignItems: 'center', gap: 16, background: C.white,
          border: `6px solid ${C.ink}`, borderRadius: 60, padding: '14px 34px', fontFamily: M, fontWeight: 800, fontSize: 46, color: C.ink, whiteSpace: 'nowrap'}}>
          GENUINE CHECK <span style={{color: C.white, background: C.sage, borderRadius: 30, padding: '0 16px'}}>✓</span>
        </div>
      )}
      {ring > 0 && <div style={{position: 'absolute', left: CHIP_DEV.x - 110, top: CHIP_DEV.y - 100, width: 220, height: 200, borderRadius: '50%', border: `7px dashed ${C.ink}`, opacity: ring, transform: `rotate(${t * 40}deg) scale(${0.7 + 0.3 * eo(ring)})`}} />}
    </div>
  );
};

// ---------------------------------------------------------------- level 2: circuit macro + coin stream, local px
const Macro: React.FC<{t: number}> = ({t}) => {
  const watch = E(t, W(3, 'watched') - 0.2, W(3, 'watched') + 0.3);
  const keysT = W(3, 'grab');
  const pulse = 1 + 0.08 * Math.sin(t * 9) * watch + 0.25 * bell(t, keysT + 0.4, keysT + 1.1);
  const lit = Math.floor(seg(t, 12.0, 14.0) * 24);
  const v = 93e6 * eo(seg(t, W(4, '93') - 0.05, W(4, 'dollars') + 0.1));
  const tagO = E(t, 17.1, 17.5);
  const dotX = lerp(820, 1880, E(t, 15.2, 16.4));
  return (
    <div style={{position: 'absolute', left: 0, top: 0}}>
      {/* board */}
      <div style={{position: 'absolute', left: -400, top: 420, width: 3200, height: 1100, background: C.tan, borderTop: `8px solid ${C.ink}`, borderBottom: `8px solid ${C.ink}`}}>
        <svg width={3200} height={1100} style={{position: 'absolute'}}>
          {Array.from({length: 22}).map((_, i) => <path key={i} d={`M${i * 150} ${120 + (i * 97) % 860} h ${60 + (i * 37) % 120} v ${40 + (i * 53) % 90} h 140`} stroke={C.line} strokeWidth={10} fill="none" />)}
          {Array.from({length: 30}).map((_, i) => <circle key={'c' + i} cx={(i * 211) % 3200} cy={80 + (i * 131) % 940} r={12} fill="none" stroke="#CDB28A" strokeWidth={6} />)}
        </svg>
      </div>
      {/* back of the screen + what it is showing */}
      <div style={{position: 'absolute', left: -40, top: 560, width: 330, height: 800, background: C.ink, borderRadius: 24, border: `6px solid ${C.ink}`}}>
        <div style={{position: 'absolute', left: 30, top: 40, right: 30, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14}}>
          {Array.from({length: 24}).map((_, i) => <div key={i} style={{height: 30, borderRadius: 6, background: i < lit ? C.saf2 : '#4A4037'}} />)}
        </div>
        <div style={{position: 'absolute', left: 30, bottom: 34, fontFamily: M, fontWeight: 800, fontSize: 30, color: C.saf2, opacity: watch}}>24 WORDS</div>
      </div>
      {/* lens beam */}
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: watch}} width={10} height={10}>
        <polygon points={`505,945 290,640 290,1280`} fill={C.red} opacity={0.16 + 0.06 * Math.sin(t * 7)} />
        <line x1={505} y1={945} x2={290} y2={700 + ((t * 300) % 520)} stroke={C.red} strokeWidth={4} opacity={0.5} />
      </svg>
      {/* keys leaving the screen into the chip */}
      {[0, 1, 2, 3].map((i) => {
        const p = seg(t, keysT + i * 0.13, keysT + i * 0.13 + 0.65);
        if (p <= 0 || p >= 1) return null;
        const e = eio(p);
        return <Key key={i} x={lerp(230, 600, e)} y={lerp(760 + i * 140, 960, e)} s={lerp(1.1, 0.4, e)} o={1 - seg(p, 0.8, 1)} rot={lerp(-20, 0, e)} />;
      })}
      {/* trace from the chip out of the board */}
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={10} height={10}>
        <path d="M800 960 H1300 Q1360 960 1360 1020 V1100 Q1360 1160 1420 1160 H1800" stroke={C.safDeep} strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d="M800 960 H1300 Q1360 960 1360 1020 V1100 Q1360 1160 1420 1160 H1800" stroke={C.saf2} strokeWidth={6} fill="none" strokeDasharray="30 50" strokeDashoffset={-t * 220} />
      </svg>
      {t > 15.1 && t < 16.6 && <Glow x={dotX} y={dotX < 1360 ? 960 : 1160} r={70} color={C.saf2} o={1} />}
      {/* the implant, macro */}
      <Glow x={CHIP_MAC.x} y={CHIP_MAC.y} r={430 * pulse} color={C.red} o={0.45} />
      <div style={{position: 'absolute', left: CHIP_MAC.x - 160, top: CHIP_MAC.y - 120, width: 320, height: 240, transform: `scale(${pulse})`}}>
        {Array.from({length: 7}).map((_, i) => (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: 30 + i * 40, top: -30, width: 18, height: 34, background: '#9E8B6E', border: `4px solid ${C.ink}`}} />
            <div style={{position: 'absolute', left: 30 + i * 40, bottom: -30, width: 18, height: 34, background: '#9E8B6E', border: `4px solid ${C.ink}`}} />
          </React.Fragment>
        ))}
        <div style={{position: 'absolute', inset: 0, borderRadius: 26, background: `linear-gradient(160deg, ${C.red}, ${C.redDeep})`, border: `8px solid ${C.ink}`}} />
        <div style={{position: 'absolute', left: -62, top: 70, width: 100, height: 100, borderRadius: '50%', background: C.ink, border: `8px solid ${C.ink}`}}>
          <div style={{position: 'absolute', inset: 10, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #fff 0%, #8fa 0%, #3a2f27 30%, #120e0b 70%)'}} />
        </div>
        <svg style={{position: 'absolute', left: 250, top: -150, overflow: 'visible'}} width={10} height={10}>
          <path d="M20 150 q 30 -50 0 -100 q -30 -50 10 -100" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
        </svg>
      </div>
      {/* the drain: wallet outline + coins + estimate counter */}
      <div style={{position: 'absolute', left: 1730, top: 1060, width: 420, height: 290, border: `8px dashed ${C.ink}`, borderRadius: 40}}>
        <div style={{position: 'absolute', right: -8, top: 90, width: 120, height: 100, border: `8px dashed ${C.ink}`, borderRadius: 24, background: 'transparent'}} />
      </div>
      {Array.from({length: 110}).map((_, i) => {
        const t0 = 16.2 + i * 0.065;
        const p = seg(t, t0, t0 + 1.7);
        if (p <= 0 || p >= 1 || t > 23.7) return null;
        const a = ((i * 73) % 100) / 100;
        const x = 1940 + (a - 0.5) * 200 + p * (420 + a * 260);
        const y = 1160 - p * 560 + p * p * (180 - a * 300);
        return <Coin key={i} x={x} y={y} r={34 + a * 18} o={1 - seg(p, 0.75, 1)} spin={t * 6 + i} />;
      })}
      <div style={{position: 'absolute', left: 1940 - 440, top: 600, width: 880, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 122, letterSpacing: -3, color: C.ink, opacity: E(t, 16.3, 16.6)}}>
        ${Math.round(v).toLocaleString('en-US')}
      </div>
      <div style={{position: 'absolute', left: 1940 - 440, top: 770, width: 880, display: 'flex', justifyContent: 'center', opacity: tagO}}>
        <div style={{background: C.white, border: `6px solid ${C.ink}`, borderRadius: 50, padding: '10px 30px', fontFamily: M, fontWeight: 800, fontSize: 40, color: C.ink}}>EST. // UNCONFIRMED</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- level 0 (above the shelves): working together
const BLOCKS = [{x: 220, l: 'FACTORY', t: 43.73}, {x: 780, l: 'DISTRIBUTOR', t: 44.0}, {x: 1340, l: 'SELLER', t: 44.3}, {x: 1860, l: 'YOU', t: 44.67}];
const PEOPLE = [{x: 240, l: 'MAKER', w: 'makers', skin: '#8D5A3B', cloth: C.saf}, {x: 440, l: 'SELLER', w: 'sellers', skin: '#E0AC7E', cloth: C.white},
  {x: 640, l: 'BUYER', w: 'buyers', skin: '#5E3B28', cloth: C.tan}, {x: 840, l: 'REGULATOR', w: 'regulators', skin: '#C68A5E', cloth: C.saf2}];
const Together: React.FC<{t: number; o: number}> = ({t, o}) => {
  const arms = E(t, 40.95, 41.4);
  return (
    <div style={{position: 'absolute', left: 0, top: CHAIN_Y, opacity: o}}>
      <Img src={staticFile('star.png')} style={{position: 'absolute', left: -100, top: 200, width: 1300, opacity: 0.1, transform: `rotate(${t * 3}deg)`}} />
      <Glow x={560} y={1150} r={900} color={C.saf2} o={0.5} />
      {BLOCKS.map((b, i) => {
        const p = E(t, 41.45 + i * 0.12, 41.85 + i * 0.12);
        const on = E(t, b.t - 0.1, b.t + 0.2);
        return (
          <div key={i} style={{position: 'absolute', left: b.x - 150, top: 600, width: 300, height: 140, opacity: p, transform: `translateY(${(1 - p) * -120}px)`, borderRadius: 24,
            border: `7px solid ${C.ink}`, background: mix(C.white, C.saf, 0.25 + 0.75 * on), boxShadow: `${on * 14}px ${on * 14}px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: M, fontWeight: 800, fontSize: 32, color: C.ink}}>{b.l}</div>
        );
      })}
      {[0, 1, 2].map((i) => {
        const x = (BLOCKS[i].x + BLOCKS[i + 1].x) / 2;
        const p = E(t, 41.7 + i * 0.12, 42.0 + i * 0.12);
        const tick = E(t, [W(7, 'of'), W(7, 'every'), W(7, 'handoff')][i], [W(7, 'of'), W(7, 'every'), W(7, 'handoff')][i] + 0.2);
        return (
          <React.Fragment key={i}>
            <svg style={{position: 'absolute', left: x - 130, top: 630, opacity: p}} width={260} height={80}>
              <rect x={10} y={14} width={140} height={52} rx={26} fill="none" stroke={C.ink} strokeWidth={10} />
              <rect x={110} y={14} width={140} height={52} rx={26} fill="none" stroke={C.ink} strokeWidth={10} />
            </svg>
            <div style={{position: 'absolute', left: x - 34, top: 530, width: 68, height: 68, borderRadius: '50%', background: C.sage, border: `6px solid ${C.ink}`, color: C.white,
              fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: tick, transform: `scale(${0.5 + 0.5 * eo(tick)})`}}>✓</div>
          </React.Fragment>
        );
      })}
      {PEOPLE.map((p, i) => {
        const t0 = W(7, p.w);
        return <Person key={i} x={p.x} y={980} skin={p.skin} cloth={p.cloth} p={seg(t, t0 - 0.05, t0 + 0.4)} arms={arms * (i === 0 || i === 3 ? 0.4 : 0)} label={p.l} lo={E(t, t0, t0 + 0.3)} />;
      })}
      {/* joined hands between neighbours */}
      {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: PEOPLE[i].x + 70, top: 1150, width: 60, height: 28, borderRadius: 14, background: PEOPLE[i].skin, border: `5px solid ${C.ink}`, opacity: seg(t, W(7, PEOPLE[i + 1].w), W(7, PEOPLE[i + 1].w) + 0.3)}} />)}
    </div>
  );
};

// ---------------------------------------------------------------- fixed text layer (hook zone)
type Cap = {words: string[]; at: number[]; until: number; hi?: number};
const caps: Cap[] = [
  {words: ['ONE', 'RESELLER'], at: [W(2, 'one'), W(2, 'reseller')], until: 9.7, hi: 1},
  {words: ['INSIDE', 'THE', 'CASE'], at: [W(3, 'inside'), W(3, 'the', 2), W(3, 'case')], until: 11.7, hi: 2},
  {words: ['WATCHING', 'THE', 'SCREEN'], at: [W(3, 'watched'), W(3, 'the', 3), W(3, 'screen')], until: 14.0, hi: 2},
  {words: ['GRABBING', 'THE', 'KEYS'], at: [W(3, 'grab'), W(3, 'the', 4), W(3, 'keys')], until: 15.3, hi: 2},
  {words: ['NOT', 'CONFIRMED'], at: [W(4, "isn't"), W(4, 'confirmed')], until: 21.8, hi: 1},
  {words: ['AFFECTED', 'DEVICES:', 'LIMITED'], at: [W(4, 'affected'), W(4, 'devices'), W(4, 'limited')], until: 23.6, hi: 2},
  {words: ['THE', 'SCARY', 'PART?'], at: [W(5, 'the'), W(5, 'scary'), W(5, 'part')], until: 25.4, hi: 1},
  {words: ['A', 'SEPARATE', 'PART'], at: [W(5, 'a'), W(5, 'separate'), W(5, 'part', 2)], until: 30.1, hi: 1},
  {words: ['SALES', 'PAUSED'], at: [W(6, 'sales'), W(6, 'paused')], until: 32.95, hi: 1},
  {words: ['TREZOR', 'TRIMS', 'RESELLERS'], at: [W(6, 'trezor'), W(6, 'trimming'), W(6, 'resellers')], until: 35.2, hi: 1},
  {words: ['NOBODY', 'FIXES', 'THIS', 'ALONE'], at: [W(7, 'nobody'), W(7, 'fixes'), W(7, 'this'), W(7, 'alone')], until: 38.6, hi: 3},
  {words: ['PROOF', 'OF', 'EVERY', 'HANDOFF'], at: [W(7, 'proof'), W(7, 'of'), W(7, 'every'), W(7, 'handoff')], until: 43.45, hi: 3},
  {words: ['BUY', 'THIRD-PARTY?'], at: [W(8, 'buy'), W(8, 'third-party')], until: 49.25, hi: 1},
];
const Captions: React.FC<{t: number}> = ({t}) => {
  const c = caps.find((c) => t >= c.at[0] - 0.05 && t < c.until + 0.25);
  if (!c) return null;
  const out = 1 - seg(t, c.until, c.until + 0.25);
  return (
    <div style={{position: 'absolute', top: 290, left: 60, width: 880, display: 'flex', flexWrap: 'wrap', columnGap: 22, rowGap: 0, opacity: out}}>
      {c.words.map((w, i) => {
        const p = seg(t, c.at[i] - 0.04, c.at[i] + 0.16);
        return (
          <span key={i} style={{fontFamily: F, fontWeight: 900, fontSize: 76, lineHeight: 1.12, letterSpacing: -2, color: C.ink, opacity: p, display: 'inline-block',
            transform: `translateY(${(1 - eo(p)) * 22}px)`, background: i === c.hi ? C.saf2 : 'transparent', padding: i === c.hi ? '0 12px' : 0, borderRadius: 10, whiteSpace: 'nowrap'}}>{w}</span>
        );
      })}
    </div>
  );
};

const Hook: React.FC<{o: number}> = ({o}) => (
  <div style={{position: 'absolute', top: 280, left: 60, width: 880, opacity: o}}>
    <div style={{fontFamily: F, fontWeight: 900, fontSize: 172, lineHeight: 1, letterSpacing: -5, color: C.ink, whiteSpace: 'nowrap'}}>SPY CHIP</div>
    <div style={{display: 'inline-block', marginTop: 22, background: C.ink, color: C.white, fontFamily: F, fontWeight: 900, fontSize: 58, letterSpacing: -1, padding: '10px 24px', borderRadius: 14, whiteSpace: 'nowrap'}}>
      INSIDE A <span style={{color: C.saf2}}>CRYPTO WALLET</span>
    </div>
  </div>
);

// ---------------------------------------------------------------- composition
export const OneTake: React.FC = () => {
  const raw = useCurrentFrame();
  // seamless loop: the last 8 frames are frame 0 exactly; the first 8 frames hold still
  const frame = raw >= N - HOLD ? 0 : raw;
  const t = frame / FPS;
  const cam = camAt(t);
  const live = E(t, HOLD / FPS, 1.4) * (1 - E(t, 49.4, 50.3));
  const cx = cam.x + Math.sin(t * 0.83) * 6 / cam.s * live, cy = cam.y + Math.cos(t * 0.61) * 5 / cam.s * live;
  const s = cam.s;
  const lnS = Math.log(s);
  const fb = (a: number, b: number) => cl((lnS - Math.log(a)) / (Math.log(b) - Math.log(a)));
  const shellO = 1 - fb(1.36, 1.78);
  const deviceO = 1 - fb(5.2, 8);
  const macroO = fb(5.2, 8);
  const shift = E(t, 35.0, 37.0) * (1 - E(t, 49.1, 50.3));
  const xray = 1 - shift;
  const seam = Math.max(E(t, 2.6, 4.8) * 0.55 * (1 - E(t, 5.6, 6.6)), Math.max(0, 1 - Math.abs(Math.log(s / 1.55)) / 0.3) * (t > 9 && t < 12 ? 1 : 0));
  const hookO = 1 - E(t, 4.95, 5.5) + E(t, 49.55, 50.25);
  const swing = -15 * bell(t, 5.6, 8.95);
  const tilt = 7 * bell(t, 35.0, 36.7) - 4 * bell(t, 44.85, 46.05);
  const roll = 2.5 * bell(t, 9.75, 11.85) - 2 * bell(t, 30.05, 31.25) + 1.5 * bell(t, 23.55, 24.6);
  const signO = E(t, 48.9, 49.3) * (1 - E(t, 49.8, 50.2));

  const T = (ox: number, oy: number, k: number) => `translate(${(ox - cx) * s + 540}px, ${(oy - cy) * s + 960}px) scale(${k * s})`;
  const bg = mix(C.muted, C.paper, shift);
  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 45%, rgba(255,214,150,${0.55 * shift}) 0%, rgba(255,214,150,0) 70%)`}} />
      <AbsoluteFill style={{transform: `perspective(2200px) rotateY(${swing}deg) rotateX(${tilt}deg) rotateZ(${roll}deg)`, transformOrigin: '50% 50%'}}>
        {/* level 0: one world for shelves, box and the chain above */}
        {shellO > 0.001 && (
          <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: T(0, 0, 1)}}>
            <div style={{position: 'absolute', left: -3000, top: -3600, width: 7600, height: 8000, opacity: 0.55,
              backgroundImage: `linear-gradient(${C.line} 3px, transparent 3px), linear-gradient(90deg, ${C.line} 3px, transparent 3px)`, backgroundSize: '200px 200px'}} />
            <Together t={t} o={E(t, 34.6, 36.2) * (1 - E(t, 45.6, 46.4))} />
            <Shelves t={t} o={1 - shift} />
          </div>
        )}
        {/* level 1: the device, sits inside the box under the lid */}
        {deviceO > 0.001 && (
          <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: T(DEV0.x, DEV0.y, K1), opacity: deviceO * (shellO > 0.999 ? xray : 1)}}>
            <Device t={t} xray={1} />
          </div>
        )}
        {/* box shell over the device */}
        {shellO > 0.001 && (
          <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: T(0, 0, 1)}}>
            <HeroBox t={t} shellO={shellO} xray={xray} seam={seam} />
            <Hands p={E(t, 45.2, 45.95) * (1 - E(t, 49.1, 49.8))} />
          </div>
        )}
        {/* level 2: board macro + coins */}
        {macroO > 0.001 && (
          <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: T(MAC0.x, MAC0.y, K2), opacity: macroO}}>
            <Macro t={t} />
          </div>
        )}
        {/* light flash as the camera passes through a seam */}
        <AbsoluteFill style={{background: '#FFF6E2', opacity: 0.55 * Math.max(0, 1 - Math.abs(Math.log(s / 1.6)) / 0.2) * (t > 9 && t < 12 ? 1 : 0)}} />
      </AbsoluteFill>
      {/* paper grain + vignette (static, so the loop is exact) */}
      <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(60,40,20,0.16) 100%)'}} />
      <Hook o={cl(hookO)} />
      <Captions t={t} />
      {/* watermark */}
      <div style={{position: 'absolute', top: 1462, left: 60, display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7}}>
          <Img src={staticFile('logo.png')} style={{width: 40, height: 40}} />
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: C.ink}}>OMNIX</span>
        </div>
        <span style={{fontFamily: M, fontWeight: 700, fontSize: 26, color: C.ink, opacity: 0.7 * signO}}>@omnixteam</span>
      </div>
    </AbsoluteFill>
  );
};
