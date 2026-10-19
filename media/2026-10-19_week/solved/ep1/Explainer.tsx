import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, spring} from 'remotion';
import {loadFont} from '@remotion/fonts';
import tl from './timeline.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat.ttf'), weight: '100 900'});
loadFont({family: 'JBMono', url: staticFile('JetBrainsMono.ttf'), weight: '100 800'});

const FPS = 30;
const C = {paper: '#F5ECDD', ink: '#1F1A15', saf: '#F08A12', saf2: '#FFC46B', safDeep: '#C9650A', mute: '#8C8073', line: '#DCCDB5', fill: '#FFF7EA', white: '#FFFBF4', tan: '#E9D5B5', red: '#C6452C', sage: '#5E8A55'};
const F = 'Montserrat, sans-serif';
const M = 'JBMono, monospace';

type Word = {w: string; s: number; e: number};
type Beat = {id: number; start: number; end: number; words: Word[]};
const BEATS = tl.beats as Beat[];
const B = (i: number) => BEATS[i - 1];
const clean = (w: string) => w.toLowerCase().replace(/[“”".,:?!]/g, '');
const W = (b: number, word: string, n = 1) => {
  let k = 0;
  for (const x of B(b).words) if (clean(x.w) === word && ++k === n) return x.s;
  throw new Error('missing ' + word);
};
const CUTS = tl.cuts as {id: string; t: number}[];
const CUT = (id: string) => CUTS.find((c) => c.id === id)!.t;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const sp = (t: number, t0: number, damping = 13, mass = 0.6) =>
  t < t0 ? 0 : spring({frame: (t - t0) * FPS, fps: FPS, config: {damping, mass, stiffness: 160}});
const pop = (t: number, t0: number): React.CSSProperties => {
  const p = sp(t, t0, 10, 0.5);
  return {opacity: clamp(p * 2), transform: `scale(${0.4 + 0.6 * p})`, display: 'inline-block'};
};

// ================================================================ 3D primitives (CSS)
type Face = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
const Box: React.FC<{w: number; h: number; d: number; face: (f: Face) => React.CSSProperties; content?: Partial<Record<Face, React.ReactNode>>}> = ({w, h, d, face, content = {}}) => {
  const faces: [Face, number, number, string][] = [
    ['front', w, h, `translateZ(${d / 2}px)`], ['back', w, h, `rotateY(180deg) translateZ(${d / 2}px)`],
    ['right', d, h, `rotateY(90deg) translateZ(${w / 2}px)`], ['left', d, h, `rotateY(-90deg) translateZ(${w / 2}px)`],
    ['top', w, d, `rotateX(90deg) translateZ(${h / 2}px)`], ['bottom', w, d, `rotateX(-90deg) translateZ(${h / 2}px)`],
  ];
  return (
    <div style={{position: 'absolute', transformStyle: 'preserve-3d'}}>
      {faces.map(([f, fw, fh, tr]) => (
        <div key={f} style={{position: 'absolute', width: fw, height: fh, left: -fw / 2, top: -fh / 2, transform: tr, boxSizing: 'border-box', backfaceVisibility: 'visible', ...face(f)}}>{content[f]}</div>
      ))}
    </div>
  );
};

// a 3D stage: perspective camera centred on (cx, cy), object rotated by rx/ry
const Stage: React.FC<{cx: number; cy: number; rx?: number; ry?: number; rz?: number; s?: number; persp?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({cx, cy, rx = 0, ry = 0, rz = 0, s = 1, persp = 1800, children, style}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, perspective: persp, perspectiveOrigin: `${cx}px ${cy}px`, pointerEvents: 'none', ...style}}>
    <div style={{position: 'absolute', left: cx, top: cy, transformStyle: 'preserve-3d', transform: `scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`}}>{children}</div>
  </div>
);

// extrude a flat SVG into depth by stacking darker copies
const Extrude: React.FC<{depth?: number; w: number; h: number; render: (shade: boolean) => React.ReactNode}> = ({depth = 26, w, h, render}) => (
  <div style={{position: 'absolute', transformStyle: 'preserve-3d'}}>
    {Array.from({length: 9}).map((_, i) => (
      <div key={i} style={{position: 'absolute', left: -w / 2, top: -h / 2, width: w, height: h, transform: `translateZ(${-depth + (depth * i) / 8}px)`}}>{render(i < 8)}</div>
    ))}
  </div>
);

const LockSVG: React.FC<{open?: number; shade?: boolean; glow?: number; tone?: string}> = ({open = 0, shade, glow = 0, tone = C.saf}) => (
  <svg viewBox="0 0 200 240" width={200} height={240} style={{overflow: 'visible'}}>
    {glow > 0 && !shade && <circle cx={100} cy={160} r={130} fill={C.saf2} opacity={0.35 * glow} />}
    <path d={`M55 ${110 - open * 46} V${70 - open * 46} a45 45 0 0 1 90 0 V${110 - (open > 0.5 ? 0 : open * 46)}`} fill="none" stroke={shade ? '#6E5A44' : C.ink} strokeWidth={20} strokeLinecap="round" transform={open > 0 ? `rotate(${-open * 18} 55 110)` : undefined} />
    <rect x={25} y={100} width={150} height={125} rx={22} fill={shade ? C.safDeep : tone} stroke={shade ? '#6E5A44' : C.ink} strokeWidth={8} />
    {!shade && <><circle cx={100} cy={152} r={15} fill={C.ink} /><rect x={93} y={156} width={14} height={36} rx={6} fill={C.ink} /></>}
  </svg>
);
const Lock3D: React.FC<{open?: number; glow?: number; tone?: string}> = ({open, glow, tone}) => (
  <Extrude w={200} h={240} depth={30} render={(sh) => <LockSVG open={open} shade={sh} glow={sh ? 0 : glow} tone={tone} />} />
);
const KeySVG: React.FC<{shade?: boolean}> = ({shade}) => (
  <svg viewBox="0 0 260 120" width={260} height={120}>
    <g fill={shade ? '#B9A27F' : C.white} stroke={shade ? '#6E5A44' : C.ink} strokeWidth={8} strokeLinejoin="round">
      <circle cx={55} cy={60} r={42} />
      <path d="M95 48 H240 V72 H222 V94 H200 V72 H182 V88 H162 V72 H95 Z" />
    </g>
    {!shade && <circle cx={55} cy={60} r={14} fill={C.saf} stroke={C.ink} strokeWidth={6} />}
  </svg>
);
const Key3D: React.FC = () => <Extrude w={260} h={120} depth={18} render={(sh) => <KeySVG shade={sh} />} />;

const CoinSVG: React.FC<{shade?: boolean}> = ({shade}) => (
  <svg viewBox="0 0 240 240" width={240} height={240}>
    <circle cx={120} cy={120} r={112} fill={shade ? C.safDeep : C.saf} stroke={C.ink} strokeWidth={8} />
    {!shade && (<>
      <circle cx={120} cy={120} r={88} fill="none" stroke={C.saf2} strokeWidth={6} />
      <path d="M96 66 V174 M110 56 V70 M110 170 V184 M96 66 H132 a24 24 0 0 1 0 48 H96 M96 114 H138 a30 30 0 0 1 0 60 H96" fill="none" stroke={C.white} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
    </>)}
  </svg>
);
const Coin3D: React.FC = () => <Extrude w={240} h={240} depth={28} render={(sh) => <CoinSVG shade={sh} />} />;

const Chip3D: React.FC<{t: number; glow?: number}> = ({t, glow = 1}) => {
  const pins = Array.from({length: 6});
  return (
    <div style={{position: 'absolute', transformStyle: 'preserve-3d'}}>
      <Box w={240} h={240} d={36} face={(f) => ({background: f === 'front' ? C.ink : '#3A3129', border: `3px solid ${C.ink}`})}
        content={{front: (
          <svg viewBox="0 0 240 240" width={240} height={240}>
            {[0, 1, 2, 3, 4].map((i) => <line key={'h' + i} x1={40} x2={200} y1={48 + i * 36} y2={48 + i * 36} stroke="#5A4C3E" strokeWidth={2} />)}
            {[0, 1, 2, 3, 4].map((i) => <line key={'v' + i} y1={40} y2={200} x1={48 + i * 36} x2={48 + i * 36} stroke="#5A4C3E" strokeWidth={2} />)}
            <rect x={78} y={78} width={84} height={84} rx={10} fill={C.saf} opacity={0.7 + 0.3 * Math.sin(t * 6) * glow} />
            {[0, 1, 2].map((i) => [0, 1, 2].map((j) => <circle key={`${i}${j}`} cx={92 + i * 28} cy={92 + j * 28} r={7} fill={C.white} opacity={0.5 + 0.5 * Math.sin(t * 9 + i * 2 + j * 3)} />))}
            <text x={120} y={226} textAnchor="middle" fontFamily={M} fontSize={16} fill={C.saf2}>QPU</text>
          </svg>)}} />
      {pins.map((_, i) => ['L', 'R', 'T', 'Bt'].map((side) => {
        const o = -100 + i * 40;
        const pos = side === 'L' ? `translate3d(-132px, ${o}px, 0)` : side === 'R' ? `translate3d(132px, ${o}px, 0)` : side === 'T' ? `translate3d(${o}px, -132px, 0)` : `translate3d(${o}px, 132px, 0)`;
        const horiz = side === 'L' || side === 'R';
        return <div key={side + i} style={{position: 'absolute', transform: pos, transformStyle: 'preserve-3d'}}>
          <Box w={horiz ? 24 : 12} h={horiz ? 12 : 24} d={10} face={() => ({background: C.saf2, border: `2px solid ${C.ink}`})} />
        </div>;
      }))}
    </div>
  );
};

const GlassCase: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', transformStyle: 'preserve-3d'}}>
    <div style={{position: 'absolute', transform: 'translateY(250px)', transformStyle: 'preserve-3d'}}>
      <Box w={420} h={60} d={420} face={(f) => ({background: f === 'top' ? C.tan : '#D9C19A', border: `4px solid ${C.ink}`})} />
    </div>
    {children}
    <Box w={400} h={440} d={400} face={(f) => ({background: f === 'bottom' ? 'transparent' : 'rgba(255,251,244,0.16)', border: '4px solid rgba(31,26,21,0.75)', boxShadow: 'inset 0 0 40px rgba(255,255,255,0.35)'})}
      content={{front: <div style={{position: 'absolute', left: 30, top: 20, width: 60, height: 300, background: 'linear-gradient(90deg, rgba(255,255,255,0.0), rgba(255,255,255,0.55), rgba(255,255,255,0))', transform: 'skewX(-12deg)'}} />}} />
  </div>
);

const Safe3D: React.FC<{door: number}> = ({door}) => (
  <div style={{position: 'absolute', transformStyle: 'preserve-3d'}}>
    <Box w={420} h={440} d={420} face={(f) => ({background: f === 'front' ? 'transparent' : f === 'top' ? '#E2CCA8' : C.tan, border: `5px solid ${C.ink}`})}
      content={{back: <div style={{width: '100%', height: '100%', background: '#CDB28A'}} />}} />
    {/* hinged door on the left edge of the front face */}
    <div style={{position: 'absolute', transformStyle: 'preserve-3d', transform: `translate3d(-210px, 0, 210px) rotateY(${-(1 - door) * 105}deg)`}}>
      <div style={{position: 'absolute', left: 0, top: -220, width: 420, height: 440, background: '#E9D5B5', border: `5px solid ${C.ink}`, boxSizing: 'border-box'}}>
        <svg viewBox="0 0 420 440" width={410} height={430}>
          <rect x={30} y={30} width={350} height={370} rx={20} fill="none" stroke={C.ink} strokeWidth={5} opacity={0.5} />
          <circle cx={210} cy={210} r={70} fill={C.white} stroke={C.ink} strokeWidth={8} />
          <g transform={`rotate(${door * 220} 210 210)`}>{[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1={210} y1={210} x2={210} y2={150} stroke={C.ink} strokeWidth={8} transform={`rotate(${a} 210 210)`} strokeLinecap="round" />)}</g>
          <circle cx={210} cy={210} r={16} fill={C.saf} stroke={C.ink} strokeWidth={6} />
        </svg>
      </div>
    </div>
  </div>
);

// ================================================================ backdrop: grid paper + wireframe floor + HUD
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 40%, #FBF5EA 0%, ${C.paper} 60%, #E9DBC3 100%)`}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(31,26,21,0.045) 2px, transparent 2px), linear-gradient(90deg, rgba(31,26,21,0.045) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
    <Img src={staticFile('star.png')} style={{position: 'absolute', width: 1400, left: -160, top: 300, opacity: 0.04, transform: `rotate(${t * 2}deg)`}} />
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, perspective: 900, perspectiveOrigin: '540px 760px', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -1460, top: 760, width: 4000, height: 2600, transformOrigin: '50% 0%', transform: 'rotateX(78deg)',
        backgroundImage: `linear-gradient(rgba(240,138,18,0.55) 3px, transparent 3px), linear-gradient(90deg, rgba(31,26,21,0.28) 3px, transparent 3px)`,
        backgroundSize: '120px 120px', backgroundPosition: `0px ${(t * 140) % 120}px`,
        maskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 70%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 70%, rgba(0,0,0,0) 100%)'}} />
    </div>
  </AbsoluteFill>
);

const Brackets: React.FC = () => {
  const L = 46, S = 5, col = C.ink;
  const corner = (x: number, y: number, sx: number, sy: number) => (
    <path d={`M${x} ${y + sy * L} V${y} H${x + sx * L}`} fill="none" stroke={col} strokeWidth={S} />
  );
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 0.55}}>
      {corner(50, 290, 1, 1)}{corner(1030, 290, -1, 1)}{corner(50, 1170, 1, -1)}{corner(1030, 1170, -1, -1)}
    </svg>
  );
};

// terminal line per scene, typed out
const CMD: Record<string, string> = {
  hook: 'deposit.status --refund', spotless: 'flat.inspect --condition', damage: 'landlord.claim("damage")', noproof: 'evidence.find()  // 0 results',
  word: 'dispute.resolve()  // your word vs theirs', picture: 'simulate --future omnix', scan: 'omnibot.walk(flat)  // coming soon',
  items: 'omnibot.scan([wall, tap, tile])', report: 'alki.write(condition_report)', locked: 'omnichain.commit(report)  // read-only',
  escrow: 'contract.hold(deposit)', code: 'cat deposit_contract', moveout: 'omnibot.scan(flat)  // move-out',
  compare: 'alki.diff(before, after)', found: 'alki.diff  // 1 change found', payout: 'contract.settle()', proof: 'dispute.count  // 0',
  tag: 'share --tag flatmate', end: '',
};
const Terminal: React.FC<{t: number; id: string; t0: number}> = ({t, id, t0}) => {
  const cmd = CMD[id] || '';
  const n = Math.floor(clamp((t - t0 - 0.08) / 0.5) * cmd.length);
  const blink = Math.floor(t * 3) % 2 === 0;
  return (
    <div style={{position: 'absolute', top: 300, left: 80, right: 80, fontFamily: M, fontSize: 27, color: C.ink, opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden'}}>
      <span style={{color: C.saf}}>omnix@explains</span><span style={{color: C.mute}}>:~$ </span>{cmd.slice(0, n)}<span style={{opacity: blink ? 1 : 0, color: C.saf}}>▌</span>
    </div>
  );
};

const Header: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', top: 205, left: 80, right: 80, display: 'flex', alignItems: 'center', gap: 18, opacity: 1 - ramp(t, tl.endCard - 0.1, tl.endCard + 0.1)}}>
    <Img src={staticFile('logo.png')} style={{width: 58, height: 58}} />
    <div style={{fontFamily: F, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.ink}}>SOLVED BY OMNIX</div>
    <div style={{flex: 1}} />
    <div style={{fontFamily: M, fontSize: 24, color: C.mute}}>
      <span style={{color: C.red, opacity: Math.floor(t * 2) % 2 ? 1 : 0.25}}>●</span> {`00:${String(Math.floor(t)).padStart(2, '0')}`}
    </div>
  </div>
);

// ================================================================ captions
const KEY = new Set(['spotless', 'damage', '₹20000', 'proof', 'receipt', 'omnix', 'omnibot', 'alki', 'report', 'locked', 'omnichain', 'contract', 'code', '₹1200', '₹48800', 'seconds', 'scratch', 'flatmate', 'deposit', 'wall', 'tap', 'tile', 'move-in', 'nobody']);
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const b of BEATS) {
    let cur: Word[] = [];
    const flush = () => { if (cur.length) out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e}); cur = []; };
    b.words.forEach((w, i) => {
      cur.push(w);
      const chars = cur.map((x) => x.w).join(' ').length;
      const next = b.words[i + 1];
      const gap = next ? next.s - w.e : 9;
      if (/[.,:?!]$/.test(w.w) && cur.length >= 2) flush();
      else if (cur.length >= 4 || chars > 17 || gap > 0.25) flush();
    });
    flush();
  }
  return out;
})();
const Captions: React.FC<{t: number}> = ({t}) => {
  let idx = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (t >= CHUNKS[i].s - 0.05) idx = i;
  if (idx < 0 || t > tl.endCard) return null;
  const ch = CHUNKS[idx];
  if (t > Math.min((CHUNKS[idx + 1]?.s ?? 999) - 0.05, ch.e + 0.6)) return null;
  return (
    <div style={{position: 'absolute', top: 1225, left: 90, right: 150, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 20px'}}>
      {ch.words.map((w, i) => {
        const p = sp(t, w.s - 0.04, 12, 0.45);
        const key = KEY.has(clean(w.w));
        return <span key={i} style={{fontFamily: F, fontWeight: 800, fontSize: 68, lineHeight: 1.12, color: key ? C.saf : C.ink, opacity: clamp(p * 1.6),
          transform: `translateY(${(1 - p) * 24}px) scale(${0.75 + 0.25 * p})`, display: 'inline-block', textShadow: '0 2px 0 rgba(255,251,244,0.9)'}}>{w.w}</span>;
      })}
    </div>
  );
};

// ================================================================ shared bits
const Big: React.FC<{top: number; size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({top, size = 100, color = C.ink, children, style}) => (
  <div style={{position: 'absolute', top, left: 60, right: 60, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: size, lineHeight: 1.02, color, letterSpacing: -2, ...style}}>{children}</div>
);
const Chip: React.FC<{top: number; children: React.ReactNode; o?: number}> = ({top, children, o = 1}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o}}>
    <div style={{fontFamily: M, fontSize: 23, color: C.mute, border: `2px solid ${C.line}`, borderRadius: 8, padding: '7px 18px', background: 'rgba(255,251,244,0.8)'}}>{children}</div>
  </div>
);
const Tag: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = C.saf, style}) => (
  <span style={{fontFamily: M, fontWeight: 700, fontSize: 30, color: C.white, background: color, padding: '6px 14px', borderRadius: 6, ...style}}>{children}</span>
);
const Panel: React.FC<{top: number; left?: number; right?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({top, left = 90, right = 90, children, style}) => (
  <div style={{position: 'absolute', top, left, right, background: 'rgba(255,251,244,0.92)', border: `4px solid ${C.ink}`, borderRadius: 14, padding: '18px 26px', fontFamily: M, fontSize: 31, lineHeight: 1.5, color: C.ink, boxShadow: `10px 10px 0 ${C.ink}`, ...style}}>{children}</div>
);
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// ================================================================ people & props
const Person: React.FC<{kind: 'tenant' | 'landlord'; t: number}> = ({kind, t}) => {
  const bob = Math.sin(t * 3) * 3;
  return (
    <svg viewBox="0 0 220 420" width={220} height={420} style={{overflow: 'visible'}}>
      <g stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M95 300 L80 405 M125 300 L140 405" />
        <rect x={72} y={150} width={76} height={150} rx={28} fill={kind === 'tenant' ? '#CFE0D4' : '#E8C9A8'} />
        <circle cx={110} cy={105} r={38} fill={C.fill} />
        {kind === 'tenant' ? (<>
          <path d="M78 185 L48 230 L92 250 M142 185 L172 230 L128 250" />
          <g transform={`translate(0 ${bob})`}>
            <rect x={36} y={196} width={148} height={88} rx={6} fill={C.tan} />
            <rect x={56} y={120} width={108} height={78} rx={6} fill="#E2CCA8" />
            <path d="M36 228 H184 M110 120 V198" strokeWidth={5} />
          </g>
          <path d="M97 100 l6 4 M118 100 l6 4" strokeWidth={6} />
          <path d="M98 126 q12 -8 24 0" strokeWidth={6} />
        </>) : (<>
          <path d="M146 182 L210 150" />
          <path d="M210 150 l26 -8" strokeWidth={7} />
          <path d="M76 182 L60 260" />
          <path d="M94 96 l10 6 M126 96 l-10 6" strokeWidth={6} />
          <path d="M98 128 h24" strokeWidth={6} />
          <circle cx={248} cy={140} r={20} fill="rgba(255,255,255,0.5)" strokeWidth={6} />
        </>)}
      </g>
    </svg>
  );
};

const Humanoid: React.FC<{walk?: number; glow?: number}> = ({walk = 0, glow = 0}) => {
  const sw = Math.sin(walk) * 20;
  return (
    <svg viewBox="0 0 200 400" width={200} height={400} style={{overflow: 'visible'}}>
      {glow > 0 && <circle cx={100} cy={58} r={80} fill={C.saf2} opacity={0.45 * glow} />}
      <g stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <g transform={`rotate(${sw} 82 232)`}><path d="M82 232 L72 360 L56 362" /></g>
        <g transform={`rotate(${-sw} 118 232)`}><path d="M118 232 L128 360 L144 362" /></g>
        <g transform={`rotate(${-sw * 0.7} 62 128)`}><path d="M62 128 L36 214" /></g>
        <path d="M138 128 L172 160" />
        <rect x={60} y={108} width={80} height={128} rx={22} fill={C.fill} />
        <circle cx={100} cy={58} r={40} fill={C.fill} />
      </g>
      <rect x={74} y={46} width={52} height={20} rx={10} fill={C.saf} />
    </svg>
  );
};

// a wireframe flat: back + side walls + floor drawn as grid paper, viewed in 3D
const Room: React.FC<{scratch?: boolean; scanX?: number; children?: React.ReactNode}> = ({scratch, scanX, children}) => {
  const grid = (c: string): React.CSSProperties => ({backgroundColor: 'rgba(255,251,244,0.75)', backgroundImage: `linear-gradient(${c} 2px, transparent 2px), linear-gradient(90deg, ${c} 2px, transparent 2px)`, backgroundSize: '50px 50px', border: `5px solid ${C.ink}`});
  return (
    <div style={{position: 'absolute', transformStyle: 'preserve-3d'}}>
      <Box w={700} h={460} d={600} face={(f) => (f === 'front' || f === 'top' ? {display: 'none'} : f === 'bottom' ? grid('rgba(240,138,18,0.35)') : grid('rgba(31,26,21,0.12)'))}
        content={{
          back: (<>
            <div style={{position: 'absolute', left: 260, top: 120, width: 120, height: 150, border: `5px solid ${C.ink}`, background: '#DCEBE6'}} />
            {scratch && <svg width={700} height={460} style={{position: 'absolute', left: 0, top: 0}}><path d="M520 300 l26 -10 l-6 6 l18 -4" stroke={C.red} strokeWidth={5} fill="none" strokeLinecap="round" /></svg>}
            {scanX !== undefined && <div style={{position: 'absolute', left: scanX * 690, top: 0, width: 8, height: '100%', background: C.saf, boxShadow: `0 0 30px ${C.saf}`}} />}
          </>),
          left: <div style={{position: 'absolute', left: 220, top: 150, width: 110, height: 300, border: `5px solid ${C.ink}`, background: C.tan}} />,
          right: (<svg width={600} height={460}><rect x={230} y={150} width={140} height={60} rx={8} fill={C.white} stroke={C.ink} strokeWidth={5} /><path d="M300 150 V110 H340" stroke={C.ink} strokeWidth={8} fill="none" /></svg>),
        }} />
      {children}
    </div>
  );
};

const Bubble: React.FC<{children: React.ReactNode; left: number; top: number; w: number; tail?: 'left' | 'right'; p: number; dark?: boolean}> = ({children, left, top, w, tail = 'left', p, dark}) => (
  <div style={{position: 'absolute', left, top, width: w, opacity: clamp(p * 2), transform: `scale(${0.5 + 0.5 * p})`, transformOrigin: tail === 'left' ? '10% 100%' : '90% 100%'}}>
    <div style={{background: dark ? C.ink : C.white, color: dark ? C.white : C.ink, border: `5px solid ${C.ink}`, borderRadius: 26, padding: '18px 26px', fontFamily: F, fontWeight: 800, fontSize: 46, lineHeight: 1.15}}>{children}</div>
    <svg width={60} height={40} style={{position: 'absolute', bottom: -34, [tail === 'left' ? 'left' : 'right']: 50}}><path d={tail === 'left' ? 'M5 0 L10 36 L40 0' : 'M55 0 L50 36 L20 0'} fill={dark ? C.ink : C.white} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" /></svg>
  </div>
);

const Overlay: React.FC<{t: number; t0: number; children: React.ReactNode; bg?: string; fg?: string; top?: number}> = ({t, t0, children, bg = C.white, fg = C.ink, top = 360}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', ...pop(t, t0), display: 'block'}}>
    <span style={{fontFamily: F, fontWeight: 900, fontSize: 54, lineHeight: 1.15, color: fg, background: bg, border: `5px solid ${C.ink}`, borderRadius: 16, padding: '8px 26px', display: 'inline-block', maxWidth: 900}}>{children}</span>
  </div>
);
const rupee = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// ================================================================ scenes
type SP = {t: number; lt: number};

const SHook: React.FC<SP> = ({t, lt}) => {
  const ring = 1 + 0.15 * Math.sin(t * 8);
  return (<>
    <Big top={370} size={74}>Landlord kept your</Big>
    <Big top={445} size={170} color={C.saf} style={{whiteSpace: 'nowrap', left: 0, right: 0, letterSpacing: -5}}>₹50,000</Big>
    <Big top={620} size={86} style={{whiteSpace: 'nowrap', left: 0, right: 0}}>deposit? 😤</Big>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <rect x={90} y={740} width={900} height={380} fill="rgba(255,251,244,0.55)" stroke={C.ink} strokeWidth={5} />
      <path d="M560 830 l14 -6 l-3 4 l10 -3" stroke={C.red} strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={572} cy={827} r={34 * ring} fill="none" stroke={C.red} strokeWidth={5} strokeDasharray="10 8" />
      <text x={620} y={790} fontFamily="JBMono" fontSize={26} fill={C.red}>“damage”</text>
    </svg>
    <div style={{position: 'absolute', left: 250, top: 740, transform: 'scale(0.8)', transformOrigin: 'top center'}}><Person kind="landlord" t={t} /></div>
    <div style={{position: 'absolute', left: 680, top: 740, transform: 'scale(0.8)', transformOrigin: 'top center'}}><Person kind="tenant" t={t} /></div>
  </>);
};

const SSpotless: React.FC<SP> = ({t, lt}) => (<>
  <Big top={370} size={92}>Spotless. <span style={{fontSize: 80}}>✨</span></Big>
  <Stage cx={540} cy={830} rx={-14} ry={-24 + lt * 6} s={0.8} persp={1600}><Room /></Stage>
  {[0, 1, 2, 3, 4].map((i) => {
    const ph = (t * 1.6 + i * 0.37) % 1;
    return <div key={i} style={{position: 'absolute', left: 250 + ((i * 173) % 560), top: 640 + ((i * 97) % 320), fontSize: 44, opacity: Math.sin(ph * Math.PI), transform: `scale(${0.6 + ph * 0.6})`}}>✦</div>;
  })}
  <Chip top={1110}>walls ✓  floor ✓  taps ✓  tiles ✓</Chip>
</>);

const SDamage: React.FC<SP> = ({t, lt}) => {
  const drop = eOut(ramp(t, W(1, '₹20000'), W(1, '₹20000') + 0.9));
  return (<>
    <Bubble left={90} top={360} w={620} p={sp(t, CUT('damage') + 0.05)} dark>“There’s damage. I’m keeping <span style={{color: C.saf2}}>₹20,000.</span>”</Bubble>
    <div style={{position: 'absolute', left: 120, top: 680, transform: 'scale(0.85)'}}><Person kind="landlord" t={t} /></div>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <rect x={520} y={640} width={460} height={340} fill="rgba(255,251,244,0.7)" stroke={C.ink} strokeWidth={5} />
      <path d="M730 800 l14 -6 l-3 4 l10 -3" stroke={C.red} strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={742} cy={797} r={70} fill="rgba(255,255,255,0.35)" stroke={C.ink} strokeWidth={8} />
      <line x1={792} y1={847} x2={860} y2={915} stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
      <text x={750} y={700} textAnchor="middle" fontFamily="JBMono" fontSize={24} fill={C.mute}>actual size: 4 mm</text>
    </svg>
    <div style={{position: 'absolute', top: 1065, left: 260, right: 0, textAlign: 'center', fontFamily: M, fontWeight: 800, fontSize: 52, color: drop > 0 ? C.red : C.ink}}>
      deposit: {rupee(50000 - 20000 * drop)}
    </div>
  </>);
};

const SNoProof: React.FC<SP> = ({t}) => (<>
  <div style={{position: 'absolute', top: 470, left: 140, fontFamily: F, fontWeight: 900, fontSize: 110, color: C.ink, lineHeight: 1.25}}>
    <div style={pop(t, W(2, 'proof') - 0.1)}>No proof <span style={{color: C.red}}>✗</span></div><br />
    <div style={pop(t, W(2, 'receipt') - 0.1)}>No receipt <span style={{color: C.red}}>✗</span></div>
  </div>
</>);

const SWord: React.FC<SP> = ({t, lt}) => {
  const tug = Math.sin(t * 5) * 30;
  return (<>
    <Bubble left={80} top={420} w={420} p={sp(t, CUT('word') + 0.05)}>Your word</Bubble>
    <Bubble left={580} top={420} w={420} p={sp(t, W(2, 'against') - 0.05)} tail="right" dark>Their word</Bubble>
    <Big top={640} size={130} color={C.saf} style={pop(t, W(2, 'against') - 0.05)}>VS</Big>
    <div style={{position: 'absolute', top: 870, left: 160, right: 160, height: 26, border: `5px solid ${C.ink}`, borderRadius: 13, background: C.white}}>
      <div style={{position: 'absolute', left: `calc(50% + ${tug}px - 18px)`, top: -16, width: 36, height: 48, borderRadius: 8, background: C.ink}} />
    </div>
    <Chip top={960}>winner: whoever holds the money</Chip>
  </>);
};

const SPicture: React.FC<SP> = ({t, lt}) => {
  const iris = eOut(ramp(lt, 0, 0.7));
  return (<>
    <div style={{position: 'absolute', left: 540 - 1100 * iris, top: 820 - 1100 * iris, width: 2200 * iris, height: 2200 * iris, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,196,107,0.45) 0%, rgba(255,196,107,0.12) 55%, rgba(255,196,107,0) 70%)'}} />
    <Big top={420} size={96}>Now picture this…</Big>
    <div style={{position: 'absolute', top: 600, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, ...pop(t, W(3, 'omnix') - 0.1)}}>
      <span style={{fontFamily: F, fontWeight: 900, fontSize: 70, color: C.ink}}>with</span>
      <Img src={staticFile('logo.png')} style={{width: 110, height: 110}} />
      <span style={{fontFamily: F, fontWeight: 900, fontSize: 96, color: C.saf, letterSpacing: 8}}>OMNIX</span>
    </div>
    <Chip top={800} o={ramp(lt, 0.8, 1.1)}>the future · OmniBot & A.L.K.I. coming soon</Chip>
  </>);
};

const SScan: React.FC<SP & {items?: boolean; moveout?: boolean}> = ({t, lt, items, moveout}) => {
  const walkIn = moveout ? 1 : eOut(ramp(lt, 0, 2.6));
  const scanX = items || moveout ? (Math.sin(t * 1.8) + 1) / 2 : undefined;
  const label = moveout ? 'Move-out: OmniBot scans again' : 'Day 1: 🤖 OmniBot scans';
  return (<>
    <Overlay t={t} t0={moveout ? CUT('moveout') + 0.05 : CUT('scan') + 0.05} bg={moveout ? C.ink : C.white} fg={moveout ? C.white : C.ink}>{label}</Overlay>
    <Stage cx={540} cy={820} rx={-14} ry={-22 + Math.sin(t * 0.6) * 6} s={0.8} persp={1600}>
      <Room scratch={moveout} scanX={scanX}>
        <div style={{position: 'absolute', transform: `translate3d(${-420 + 380 * walkIn}px, 40px, 80px) scale(0.85)`}}>
          <div style={{position: 'absolute', left: -100, top: -200}}><Humanoid walk={walkIn < 1 ? t * 9 : 0} glow={items || moveout ? 0.6 : 0} /></div>
        </div>
      </Room>
    </Stage>
    {items && (
      <div style={{position: 'absolute', top: 1080, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22}}>
        {['wall', 'tap', 'tile'].map((w) => <span key={w} style={pop(t, W(4, w) - 0.05)}><Tag color={C.sage}>{w.toUpperCase()} ✓</Tag></span>)}
      </div>
    )}
    {!items && !moveout && <Chip top={1100} o={ramp(lt, 1.2, 1.5)}>coming soon · design intent</Chip>}
  </>);
};

const SReport: React.FC<SP> = ({t, lt}) => {
  const lines: [string, string][] = [['walls', 'no marks ✓'], ['taps', 'working ✓'], ['tiles', '0 cracks ✓'], ['paint', 'fresh ✓'], ['fittings', '12/12 ✓']];
  const n = clamp((lt - 0.9) / 3) * lines.length;
  return (<>
    <Overlay t={t} t0={CUT('report') + 0.05}>🧠 A.L.K.I. writes the report</Overlay>
    <Panel top={500} left={140} right={140} style={{fontSize: 30, lineHeight: 1.65}}>
      <div style={{fontFamily: F, fontWeight: 900, fontSize: 34, borderBottom: `3px solid ${C.ink}`, paddingBottom: 6, marginBottom: 8}}>CONDITION REPORT · DAY 1</div>
      {lines.map(([k, v], i) => (
        <div key={k} style={{opacity: clamp(n - i), display: 'flex', justifyContent: 'space-between'}}><span>{k}</span><span style={{color: C.sage, fontWeight: 800}}>{v}</span></div>
      ))}
      <div style={{color: C.mute, fontSize: 24, marginTop: 6, opacity: clamp(n - lines.length + 0.5)}}>signed: A.L.K.I. · hash 0x7f3a…c21</div>
    </Panel>
  </>);
};

const SLocked: React.FC<SP> = ({t, lt}) => {
  const deny = t >= W(5, 'edit') - 0.05;
  return (<>
    <Overlay t={t} t0={CUT('locked') + 0.05} bg={C.saf} fg={C.white}>⛓️ Locked on OmniChain</Overlay>
    <Stage cx={540} cy={760} rx={-14} ry={-26} persp={1400}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', transform: `translate3d(${-330 + i * 220 - eOut(clamp(lt / 0.6)) * 110}px, 0, 0)`, transformStyle: 'preserve-3d'}}>
          <Box w={150} h={150} d={150} face={(f) => ({background: f === 'front' ? (i === 2 ? C.saf : C.white) : f === 'top' ? '#F3E6CF' : C.tan, border: `4px solid ${C.ink}`, fontFamily: M, fontSize: 22, color: i === 2 ? C.white : C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'})}
            content={{front: i === 2 ? 'REPORT\n🔒' : `#${20871 + i}`}} />
        </div>
      ))}
    </Stage>
    <Panel top={960} style={{fontSize: 28}}>
      <div>&gt; edit report --day1</div>
      <div style={{color: deny ? C.red : C.mute, fontWeight: 800}}>{deny ? '✗ DENIED · read-only forever' : '…'}</div>
    </Panel>
  </>);
};

const SEscrow: React.FC<SP> = ({t, lt}) => {
  const fill = eOut(ramp(t, W(6, 'deposit'), W(6, 'deposit') + 1.2));
  return (<>
    <Overlay t={t} t0={CUT('escrow') + 0.05}>💰 Deposit held by code</Overlay>
    <Stage cx={540} cy={780} rx={-16} ry={-30 + lt * 8} s={0.75} persp={1500}>
      <Box w={360} h={300} d={300} face={(f) => ({background: f === 'front' ? 'rgba(255,251,244,0.35)' : f === 'top' ? 'rgba(243,230,207,0.6)' : 'rgba(233,213,181,0.85)', border: `5px solid ${C.ink}`})}
        content={{front: <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: `${fill * 100}%`, background: 'linear-gradient(180deg, #FFC46B, #F08A12)', opacity: 0.85}} />}} />
    </Stage>
    <div style={{position: 'absolute', top: 690, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontWeight: 800, fontSize: 52, color: C.ink}}>{rupee(50000 * fill)}</div>
    <div style={{position: 'absolute', top: 1010, left: 80, right: 80, display: 'flex', justifyContent: 'space-between'}}>
      <span style={pop(t, W(6, "landlord's") - 0.05)}><Tag color={C.red}>landlord’s a/c ✗</Tag></span>
      <span style={pop(t, W(6, 'yours') - 0.05)}><Tag color={C.red}>your a/c ✗</Tag></span>
    </div>
  </>);
};

const SCode: React.FC<SP> = ({t, lt}) => {
  const code = ['contract Deposit {', '  hold(₹50,000);', '  onMoveOut(report) {', '    pay(landlord, damage);', '    pay(tenant, rest);', '  }', '}'];
  const n = Math.floor(clamp(lt / 1.4) * code.length);
  return (<>
    <Big top={380} size={84}>It’s held by <span style={{color: C.saf}}>code</span></Big>
    <Panel top={540} left={110} right={110} style={{fontSize: 34, lineHeight: 1.55, background: C.ink, color: C.saf2, boxShadow: `10px 10px 0 ${C.saf}`}}>
      {code.map((l, i) => <div key={i} style={{whiteSpace: 'pre', opacity: i <= n ? 1 : 0}}>{l}</div>)}
    </Panel>
  </>);
};

const MiniRoom: React.FC<{scratch?: boolean; label: string; x: number}> = ({scratch, label, x}) => (
  <div style={{position: 'absolute', left: x, top: 520, width: 400}}>
    <div style={{fontFamily: M, fontWeight: 800, fontSize: 32, color: C.ink, marginBottom: 10}}>{label}</div>
    <svg viewBox="0 0 400 320" width={400} height={320}>
      <rect x={4} y={4} width={392} height={312} fill={C.white} stroke={C.ink} strokeWidth={6} />
      <path d="M4 230 L120 180 H280 L396 230" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.4} />
      <rect x={150} y={60} width={100} height={90} fill="#DCEBE6" stroke={C.ink} strokeWidth={5} />
      {scratch && <path d="M300 120 l18 -7 l-4 5 l13 -3" stroke={C.red} strokeWidth={5} fill="none" strokeLinecap="round" />}
    </svg>
  </div>
);
const SCompare: React.FC<SP & {found?: boolean}> = ({t, lt, found}) => {
  const scan = (lt * 0.7) % 1;
  return (<>
    <Big top={370} size={72}>A.L.K.I.: before vs after</Big>
    <MiniRoom label="BEFORE" x={90} />
    <MiniRoom label="AFTER" x={590} scratch />
    {!found && <div style={{position: 'absolute', left: 90 + scan * 900, top: 580, width: 8, height: 320, background: C.saf, boxShadow: `0 0 24px ${C.saf}`}} />}
    {found && (<>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <circle cx={909} cy={694} r={44 * (1 + 0.1 * Math.sin(t * 8))} fill="none" stroke={C.red} strokeWidth={6} />
      </svg>
      <div style={{position: 'absolute', top: 940, left: 0, right: 0, textAlign: 'center', ...pop(t, W(7, '₹1200') - 0.05), display: 'block'}}>
        <span style={{fontFamily: F, fontWeight: 900, fontSize: 64, color: C.white, background: C.red, borderRadius: 14, padding: '6px 26px'}}>1 scratch = ₹1,200</span>
      </div>
      <div style={{position: 'absolute', top: 1060, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontWeight: 800, fontSize: 34, color: C.sage, opacity: ramp(t, W(7, 'all') - 0.3, W(7, 'all'))}}>everything else: same as day 1 ✓</div>
    </>)}
  </>);
};

const SPayout: React.FC<SP> = ({t, lt}) => {
  const ll = eOut(ramp(t, W(8, '₹1200') - 0.1, W(8, '₹1200') + 0.6));
  const you = eOut(ramp(t, W(8, '₹48800') - 0.1, W(8, '₹48800') + 1.6));
  const flow = (t * 500) % 60;
  return (<>
    <Overlay t={t} t0={W(8, '₹48800') - 0.1} bg={C.sage} fg={C.white} top={350}>Move-out: ₹48,800 back in seconds</Overlay>
    <Stage cx={540} cy={640} rx={-16} ry={t * 40} s={0.42} persp={1500}>
      <Box w={300} h={300} d={300} face={(f) => ({background: f === 'front' || f === 'back' ? C.saf : '#F7B65A', border: `6px solid ${C.ink}`, fontFamily: M, fontWeight: 800, fontSize: 40, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center'})}
        content={{front: 'CONTRACT', back: 'CONTRACT'}} />
    </Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <path d="M470 740 Q 320 800 260 880" fill="none" stroke={C.ink} strokeWidth={6} strokeDasharray="22 16" strokeDashoffset={-flow} opacity={ll > 0 ? 1 : 0.2} />
      <path d="M610 740 Q 760 800 820 880" fill="none" stroke={C.sage} strokeWidth={9} strokeDasharray="22 16" strokeDashoffset={-flow} opacity={you > 0 ? 1 : 0.2} />
    </svg>
    <div style={{position: 'absolute', left: 70, top: 900, width: 400, textAlign: 'center'}}>
      <div style={{fontFamily: M, fontSize: 30, color: C.mute}}>landlord</div>
      <div style={{fontFamily: M, fontWeight: 800, fontSize: 64, color: C.ink}}>{rupee(1200 * ll)}</div>
    </div>
    <div style={{position: 'absolute', right: 70, top: 900, width: 400, textAlign: 'center'}}>
      <div style={{fontFamily: M, fontSize: 30, color: C.mute}}>you</div>
      <div style={{fontFamily: M, fontWeight: 800, fontSize: 72, color: C.sage}}>{rupee(48800 * you)}</div>
    </div>
    <Chip top={1060} o={ramp(t, W(8, 'seconds') - 0.2, W(8, 'seconds'))}>settled in 00:03 · no follow-up calls</Chip>
  </>);
};

const SProof: React.FC<SP> = ({t}) => (<>
  <div style={{position: 'absolute', top: 430, left: 120, right: 80, fontFamily: F, fontWeight: 900, fontSize: 96, lineHeight: 1.3, color: C.ink}}>
    <div style={{...pop(t, W(9, 'arguments') - 0.15), color: C.mute, textDecoration: `line-through ${C.red} 8px`}}>No arguments.</div><br />
    <div style={{...pop(t, W(9, 'waiting') - 0.15), color: C.mute, textDecoration: `line-through ${C.red} 8px`}}>No waiting.</div><br />
    <div style={{...pop(t, W(9, 'proof') - 0.1), color: C.saf, fontSize: 130}}>Just proof. ✓</div>
  </div>
</>);

const STag: React.FC<SP> = ({t, lt}) => {
  const tags = ['@flatmate', '@roomie', '@that_one_friend'];
  return (<>
    <Big top={400} size={96} style={{whiteSpace: 'nowrap', left: 0, right: 0}}>Tag the flatmate</Big>
    <div style={{position: 'absolute', top: 560, left: 0, right: 0, textAlign: 'center', fontFamily: F, fontWeight: 700, fontSize: 48, color: C.mute}}>still waiting on their deposit 👇</div>
    <div style={{position: 'absolute', top: 700, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
      {tags.map((g, i) => (
        <span key={g} style={{...pop(t, CUT('tag') + 0.5 + i * 0.35), transform: `${(pop(t, CUT('tag') + 0.5 + i * 0.35).transform)} translateY(${Math.sin(t * 4 + i) * 6}px)`}}>
          <span style={{fontFamily: M, fontWeight: 800, fontSize: 52, color: C.white, background: i === 0 ? C.saf : C.ink, borderRadius: 40, padding: '10px 34px'}}>{g}</span>
        </span>
      ))}
    </div>
  </>);
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const s = tl.endCard;
  const p = sp(t, s, 12, 0.8);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: `radial-gradient(60% 40% at 50% 42%, rgba(255,196,107,${0.35 * p}) 0%, rgba(245,236,221,0) 70%)`}}>
      <Img src={staticFile('logo.png')} style={{width: 220, height: 220, transform: `scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -40}deg)`, marginTop: -160}} />
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 100, letterSpacing: 18, color: C.ink, marginTop: 24, opacity: clamp(p * 1.5)}}>OMNIX</div>
      <div style={{fontFamily: F, fontWeight: 500, fontSize: 34, letterSpacing: 6, color: C.mute, opacity: ramp(t, s + 0.25, s + 0.5)}}>BEYOND IMAGINATION</div>
      <div style={{fontFamily: M, fontSize: 30, color: C.saf, marginTop: 50, opacity: ramp(t, s + 0.45, s + 0.75)}}>blockchain + AI + humanoid · the build is on</div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<SP>> = {
  hook: SHook, spotless: SSpotless, damage: SDamage, noproof: SNoProof, word: SWord, picture: SPicture,
  scan: SScan, items: (p) => <SScan {...p} items />, report: SReport, locked: SLocked, escrow: SEscrow, code: SCode,
  moveout: (p) => <SScan {...p} moveout />, compare: SCompare, found: (p) => <SCompare {...p} found />,
  payout: SPayout, proof: SProof, tag: STag,
};

// ================================================================ film
export const Explainer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let ci = 0;
  for (let i = 0; i < CUTS.length; i++) if (t >= CUTS[i].t) ci = i;
  const cut = CUTS[ci];
  const lt = t - cut.t;
  const Scene = SCENES[cut.id];
  const jolt = cut.id !== 'hook' && lt < 2 / FPS;
  const punch = cut.id === 'hook' ? 1 : 1 + 0.05 * Math.exp(-lt * 9);
  const isEnd = cut.id === 'end';
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <Backdrop t={t} />
      {!isEnd && <Brackets />}
      <Header t={t} />
      {!isEnd && <Terminal t={t} id={cut.id} t0={cut.t} />}
      <AbsoluteFill style={{transform: `translateX(${jolt ? (frame % 2 ? 22 : -16) : 0}px) scale(${punch})`}}>
        {Scene && <Scene t={t} lt={lt} />}
      </AbsoluteFill>
      {jolt && <div style={{position: 'absolute', left: 0, right: 0, top: 300 + ((frame * 397) % 900), height: 26, background: C.saf, opacity: 0.85}} />}
      {jolt && <div style={{position: 'absolute', left: 0, right: 0, top: 300 + ((frame * 613) % 900), height: 10, background: C.ink, opacity: 0.6}} />}
      <Captions t={t} />
      {isEnd && <EndCard t={t} />}
      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};

const CoverChips: React.FC<{items: string[]; top: number}> = ({items, top}) => (
  <div style={{position: 'absolute', top, left: 40, right: 40, display: 'flex', justifyContent: 'center', gap: 18}}>
    {items.map((x, i) => (
      <span key={i} style={{fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 34, color: i === 0 ? '#FFFBF4' : '#1F1A15', background: i === 0 ? '#F08A12' : '#FFFBF4', border: '4px solid #1F1A15', borderRadius: 40, padding: '10px 26px', whiteSpace: 'nowrap'}}>{x}</span>
    ))}
  </div>
);
const CoverLabel: React.FC<{label: string}> = ({label}) => (
  <div style={{position: 'absolute', top: 310, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16}}>
    <Img src={staticFile('logo.png')} style={{width: 66, height: 66}} />
    <div style={{fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 36, letterSpacing: 8, color: '#1F1A15'}}>{label}</div>
  </div>
);

export const Cover: React.FC = () => (
  <AbsoluteFill style={{background: C.paper}}>
    <Backdrop t={1} />
    <CoverLabel label="SOLVED BY OMNIX" />
    <div style={{position: 'absolute', top: 410, left: 50, right: 50, textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 118, lineHeight: 1.0, color: '#1F1A15', letterSpacing: -3}}>Landlord kept your <span style={{color: C.saf}}>deposit?</span></div>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <rect x={80} y={700} width={920} height={560} fill="rgba(255,251,244,0.6)" stroke={C.ink} strokeWidth={6} />
      <path d="M560 800 l18 -8 l-4 5 l13 -4" stroke={C.red} strokeWidth={5} fill="none" strokeLinecap="round" />
      <circle cx={575} cy={796} r={44} fill="none" stroke={C.red} strokeWidth={6} strokeDasharray="12 9" />
      <text x={640} y={760} fontFamily="JBMono" fontSize={34} fill={C.red}>“damage”</text>
    </svg>
    <div style={{position: 'absolute', left: 170, top: 790, transform: 'scale(1.05)', transformOrigin: 'top left'}}><Person kind="landlord" t={0.5} /></div>
    <div style={{position: 'absolute', left: 690, top: 790, transform: 'scale(1.05)', transformOrigin: 'top left'}}><Person kind="tenant" t={0.5} /></div>
    <div style={{position: 'absolute', top: 1200, left: 0, right: 0, textAlign: 'center'}}>
      <span style={{fontFamily: 'JBMono, monospace', fontWeight: 800, fontSize: 50, color: C.white, background: C.sage, border: `5px solid ${C.ink}`, borderRadius: 14, padding: '8px 26px', display: 'inline-block', transform: 'rotate(-3deg)'}}>₹48,800 back ✓</span>
    </div>
    <CoverChips top={1420} items={['OmniBot', 'A.L.K.I.', 'OmniChain']} />
  </AbsoluteFill>
);
