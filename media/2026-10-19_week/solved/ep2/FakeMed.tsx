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
      {corner(50, 320, 1, 1)}{corner(930, 320, -1, 1)}{corner(50, 1500, 1, -1)}{corner(930, 1500, -1, -1)}
    </svg>
  );
};

// terminal line per scene, typed out
const CMD: Record<string, string> = {
  hook: 'strip.inspect("BP-TAB 40")', morning: 'routine.dose(08:00)', whatif: 'strip.verify()  // no way to check', counter: 'cdsco.alert(AUG)', grid: 'samples.status("NSQ")',
  types: 'nsq.common()', fake1: 'samples.status("SPURIOUS")', delhi: 'alert.location()', same: 'compare(strip_a, strip_b)', cant: 'human.verify()  // fails',
  boot: '> INITIALIZING OMNIX STACK...', mint: 'omnichain.mint(strip_id)', stampid: 'factory.stamp(id)', journey: 'omnichain.trace(batch)', bot: 'omnibot.scan(strip)',
  alki: 'alki.verify(id, chain)', real: 'result = VERIFIED', fake2: 'result = NOT_FOUND', alert: 'alki.alert(family); chain.flag(batch)', proof1: 'proof.check()',
  proof2: 'proof.check()', proof3: 'proof.check()', cta: 'share --to family_group', loop: 'strip.inspect("BP-TAB 40")', end: '',
};
const Terminal: React.FC<{t: number; id: string; t0: number}> = ({t, id, t0}) => {
  const cmd = CMD[id] || '';
  const n = Math.floor(clamp((t - t0 - 0.08) / 0.5) * cmd.length);
  const blink = Math.floor(t * 3) % 2 === 0;
  return (
    <div style={{position: 'absolute', top: 335, left: 80, right: 150, fontFamily: M, fontSize: 26, color: C.ink, opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden'}}>
      <span style={{color: C.saf}}>omnix@solved</span><span style={{color: C.mute}}>:~$ </span>{cmd.slice(0, n)}<span style={{opacity: blink ? 1 : 0, color: C.saf}}>▌</span>
    </div>
  );
};

const Header: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', top: 262, left: 80, right: 150, display: 'flex', alignItems: 'center', gap: 18}}>
    <Img src={staticFile('logo.png')} style={{width: 58, height: 58}} />
    <div style={{fontFamily: F, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.ink}}>SOLVED BY OMNIX</div>
    <div style={{flex: 1}} />
    <div style={{fontFamily: M, fontSize: 24, color: C.mute}}>
      <span style={{color: C.red, opacity: Math.floor(t * 2) % 2 ? 1 : 0.25}}>●</span> {`00:${String(Math.floor(t)).padStart(2, '0')}`}
    </div>
  </div>
);

// ================================================================ captions
const KEY = new Set(['parents', 'bp', 'morning', 'fake', '220', 'substandard', 'paracetamol', 'diabetes', 'antibiotics', 'delhi', 'popular', 'scary', 'exactly', 'real', "can't", 'neither', 'omnix', 'digital', 'id', 'omnichain', 'factory', 'distributor', 'chemist', 'home', 'recorded', 'omnibot', 'scans', 'alki', 'second', 'verified', 'dose', 'holds', 'alerts', 'flagged', 'everyone', 'guessing', 'pills', 'proof', 'family', 'group']);
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
  if (idx < 0 || t > tl.voEnd + 0.1) return null;
  const ch = CHUNKS[idx];
  if (t > Math.min((CHUNKS[idx + 1]?.s ?? 999) - 0.05, ch.e + 0.6)) return null;
  return (
    <div style={{position: 'absolute', top: 1290, left: 80, right: 160, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 20px'}}>
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
  <div style={{position: 'absolute', top, left: 60, right: 150, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: size, lineHeight: 1.02, color, letterSpacing: -2, ...style}}>{children}</div>
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


const RED = '#E5532B';
const RGBText: React.FC<{children: React.ReactNode; size: number; color?: string; split?: number; style?: React.CSSProperties}> = ({children, size, color = RED, split = 0, style}) => (
  <div style={{position: 'relative', display: 'inline-block', fontFamily: F, fontWeight: 900, fontSize: size, lineHeight: 0.95, letterSpacing: -4, ...style}}>
    {split > 0 && <span style={{position: 'absolute', left: -split, top: 0, color: 'rgba(255,0,60,0.75)', mixBlendMode: 'multiply'}}>{children}</span>}
    {split > 0 && <span style={{position: 'absolute', left: split, top: split * 0.4, color: 'rgba(0,190,255,0.75)', mixBlendMode: 'multiply'}}>{children}</span>}
    <span style={{position: 'relative', color}}>{children}</span>
  </div>
);

const wire = (c = C.ink, w = 4): React.CSSProperties => ({background: 'rgba(255,251,244,0.18)', border: `${w}px solid ${c}`});
const Cursor: React.FC<{x: number; y: number; press?: number}> = ({x, y, press = 0}) => (
  <svg width={90} height={110} style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.15 * press})`, transformOrigin: '0 0', overflow: 'visible'}}>
    {press > 0 && <circle cx={6} cy={6} r={20 + 40 * press} fill="none" stroke={C.saf} strokeWidth={5} opacity={1 - press} />}
    <path d="M6 6 L6 84 L26 66 L40 98 L54 92 L40 60 L66 60 Z" fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

const Status: React.FC<{k: string; v: string; bad?: boolean; good?: boolean; p?: number; size?: number}> = ({k, v, bad, good, p = 1, size = 34}) => (
  <div style={{fontFamily: M, fontWeight: 800, fontSize: size, opacity: clamp(p * 2), transform: `translateX(${(1 - p) * -30}px)`, whiteSpace: 'nowrap'}}>
    <span style={{color: C.mute}}>{k}: </span><span style={{color: C.white, background: bad ? RED : good ? C.sage : C.ink, padding: '2px 12px', borderRadius: 6}}>{v}</span>
  </div>
);

const Overlay: React.FC<{t: number; t0: number; children: React.ReactNode; bg?: string; fg?: string; top?: number}> = ({t, t0, children, bg = C.white, fg = C.ink, top = 395}) => (
  <div style={{position: 'absolute', top, left: 0, right: 90, textAlign: 'center', ...pop(t, t0), display: 'block'}}>
    <span style={{fontFamily: F, fontWeight: 900, fontSize: 46, lineHeight: 1.15, color: fg, background: bg, border: `5px solid ${C.ink}`, borderRadius: 16, padding: '8px 24px', display: 'inline-block', maxWidth: 840}}>{children}</span>
  </div>
);

const Grain: React.FC<{seed: number}> = ({seed}) => (<>
  <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(31,26,21,0.035) 0px, rgba(31,26,21,0.035) 2px, transparent 2px, transparent 5px)'}} />
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 0.07, mixBlendMode: 'multiply'}}>
    <filter id={`gr${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width={1080} height={1920} filter={`url(#gr${seed})`} />
  </svg>
</>);
// ================================================================ props: generic strip only, no brands
const GREEN = '#3F8A4A';
const hash = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

const StripSVG: React.FC<{bad?: number; shade?: boolean; id?: number; t?: number; wob?: number}> = ({bad = -1, shade, id = 0, t = 0, wob = 0}) => (
  <svg viewBox="0 0 420 200" width={420} height={200} style={{overflow: 'visible'}}>
    <rect x={4} y={4} width={412} height={192} rx={18} fill={shade ? '#B9A27F' : 'rgba(236,232,224,0.95)'} stroke={shade ? '#6E5A44' : C.ink} strokeWidth={shade ? 4 : 6} />
    {!shade && (<>
      <path d="M4 60 H416 M4 140 H416" stroke="rgba(31,26,21,0.12)" strokeWidth={2} />
      <text x={20} y={34} fontFamily="JBMono" fontWeight={800} fontSize={20} fill={C.ink}>BP-TAB 40</text>
      <text x={400} y={34} textAnchor="end" fontFamily="JBMono" fontSize={14} fill={C.mute}>10 tablets</text>
      {Array.from({length: 10}).map((_, i) => {
        const cx = 50 + (i % 5) * 80, cy = 82 + Math.floor(i / 5) * 72;
        const isBad = i === bad;
        const fl = isBad ? (hash(Math.floor(t * 20)) > 0.45 ? 1 : 0.3) : 0;
        return (
          <g key={i}>
            {wob > 0 && <ellipse cx={cx - wob} cy={cy} rx={28} ry={22} fill="rgba(255,0,60,0.35)" />}
            {wob > 0 && <ellipse cx={cx + wob} cy={cy} rx={28} ry={22} fill="rgba(0,190,255,0.35)" />}
            <ellipse cx={cx} cy={cy} rx={28} ry={22} fill={isBad ? `rgba(229,83,43,${0.4 + 0.6 * fl})` : C.white} stroke={C.ink} strokeWidth={4} />
            <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} stroke={isBad ? C.white : C.line} strokeWidth={3} />
          </g>
        );
      })}
      {id > 0 && (
        <g transform="translate(330 150)" opacity={id}>
          <rect x={-2} y={-2} width={70} height={44} rx={6} fill={C.white} stroke={C.saf} strokeWidth={4} />
          {Array.from({length: 18}).map((_, k) => <rect key={k} x={6 + (k % 6) * 9} y={6 + Math.floor(k / 6) * 10} width={7} height={8} fill={hash(k * 3.1) > 0.45 ? C.ink : 'none'} />)}
        </g>
      )}
    </>)}
  </svg>
);
const Strip3D: React.FC<{bad?: number; id?: number; t?: number; wob?: number}> = ({bad, id, t, wob}) => <Extrude w={420} h={200} depth={18} render={(sh) => <StripSVG bad={bad} shade={sh} id={id} t={t} wob={wob} />} />;

const Mug: React.FC = () => (
  <svg viewBox="0 0 140 150" width={140} height={150}>
    <path d="M20 30 H100 V120 a20 20 0 0 1 -20 20 H40 a20 20 0 0 1 -20 -20 Z" fill="rgba(255,251,244,0.5)" stroke={C.ink} strokeWidth={6} />
    <path d="M100 55 a22 22 0 0 1 0 44" fill="none" stroke={C.ink} strokeWidth={6} />
    <path d="M45 18 q8 -10 0 -18 M65 18 q8 -10 0 -18" stroke={C.mute} strokeWidth={4} fill="none" />
  </svg>
);

const OldHand: React.FC = () => (
  <svg viewBox="0 0 300 260" width={300} height={260}>
    <g fill="rgba(255,251,244,0.55)" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
      <path d="M0 200 C 60 190 90 170 120 150 L 210 120 C 230 114 236 132 220 140 L 170 160 L 250 150 C 272 148 274 168 254 172 L 180 186 L 245 190 C 265 192 263 210 243 210 L 175 210 L 225 222 C 243 228 236 246 216 242 L 140 230 C 100 240 60 250 0 252 Z" />
    </g>
    <path d="M40 215 q20 -6 40 0 M60 232 q20 -6 40 0 M150 168 q8 6 0 12 M190 196 q8 6 0 12" stroke={C.mute} strokeWidth={3} fill="none" />
  </svg>
);

const Robot: React.FC<{arm?: number; glow?: number; walk?: number}> = ({arm = 0, glow = 0, walk = 0}) => {
  const sw = Math.sin(walk) * 16;
  return (
    <svg viewBox="0 0 220 420" width={220} height={420} style={{overflow: 'visible'}}>
      {glow > 0 && <circle cx={110} cy={62} r={80} fill={C.saf2} opacity={0.45 * glow} />}
      <g stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <g transform={`rotate(${sw} 92 236)`}><path d="M92 236 L82 364 L66 366" /></g>
        <g transform={`rotate(${-sw} 128 236)`}><path d="M128 236 L138 364 L154 366" /></g>
        <path d="M72 132 L46 218" />
        <path d={`M148 132 L${190 + 20 * arm} ${170 - 30 * arm}`} />
        <rect x={70} y={112} width={80} height={128} rx={22} fill="rgba(255,247,234,0.8)" />
        <circle cx={110} cy={62} r={40} fill="rgba(255,247,234,0.9)" />
        <path d="M80 150 H140 M80 180 H140" stroke={C.saf} strokeWidth={3} />
      </g>
      <rect x={84} y={50} width={52} height={20} rx={10} fill={C.saf} />
    </svg>
  );
};

const Brain: React.FC<{t: number; p: number}> = ({t, p}) => {
  const nodes = Array.from({length: 14}).map((_, i) => [120 + 90 * Math.cos(i * 2.4) * (0.4 + hash(i) * 0.6), 110 + 70 * Math.sin(i * 2.4) * (0.4 + hash(i + 7) * 0.6)]);
  return (
    <svg viewBox="0 0 240 220" width={300} height={275}>
      <path d="M120 20 C 60 15 20 50 25 100 C 15 150 60 200 120 195 C 180 200 225 150 215 100 C 220 50 180 15 120 20 Z" fill="rgba(255,196,107,0.18)" stroke={C.saf} strokeWidth={6} />
      <path d="M120 22 V195" stroke={C.saf} strokeWidth={3} strokeDasharray="6 8" />
      {nodes.map((a, i) => nodes.slice(i + 1).filter((_, j) => (i + j) % 4 === 0).map((b, j) => <line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.saf} strokeWidth={2} opacity={0.3 + 0.7 * p * Math.max(0, Math.sin(t * 8 + i))} />))}
      {nodes.map((a, i) => <circle key={i} cx={a[0]} cy={a[1]} r={7} fill={C.ink} stroke={C.saf2} strokeWidth={3} opacity={0.5 + 0.5 * Math.max(0, Math.sin(t * 6 + i * 1.3))} />)}
    </svg>
  );
};

const ChainBlock: React.FC<{label: string; state?: 'ok' | 'bad' | 'plain'; sub?: string}> = ({label, state = 'plain', sub}) => (
  <Box w={170} h={170} d={170} face={(f) => ({background: f === 'front' ? (state === 'bad' ? RED : state === 'ok' ? C.white : C.white) : f === 'top' ? '#F3E6CF' : C.tan, border: `4px solid ${state === 'bad' ? '#8E2A14' : C.ink}`, fontFamily: M, fontWeight: 800, fontSize: 21, color: state === 'bad' ? C.white : C.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: state === 'ok' ? `inset 0 0 0 4px ${C.saf}` : 'none'})}
    content={{front: <><span>{label}</span>{sub && <span style={{fontSize: 17, color: state === 'bad' ? C.white : C.mute, marginTop: 6}}>{sub}</span>}</>}} />
);

const Reticle: React.FC<{x: number; y: number; s: number; lock: number}> = ({x, y, s, lock}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <g transform={`translate(${x} ${y}) rotate(${(1 - lock) * 90}) scale(${s * (1.6 - 0.6 * lock)})`} stroke={lock >= 1 ? GREEN : C.saf} strokeWidth={5} fill="none">
      <path d="M-60 -30 V-60 H-30 M30 -60 H60 V-30 M60 30 V60 H30 M-30 60 H-60 V30" />
      <circle r={8} />
    </g>
  </svg>
);

// ================================================================ scenes
type SP = {t: number; lt: number};

// hook — pure function of lt (replayed backwards for the loop)
const SHook: React.FC<SP> = ({lt}) => {
  const tF = W(1, 'tablet') + 0.05;
  const shake = lt > tF && lt < tF + 0.45 ? (hash(Math.floor(lt * 60)) - 0.5) * 40 * (1 - (lt - tF) / 0.45) : 0;
  const words: [string, string][] = [['IS YOUR', 'your'], ['PARENTS’', 'parents'], ['BP', 'bp'], ['MEDICINE', 'tablet']];
  const fp = sp(lt, tF, 14, 0.35);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
      <div style={{position: 'absolute', left: 300, top: 640, width: 700, height: 700, borderRadius: 350, background: 'radial-gradient(circle, rgba(255,214,150,0.55) 0%, rgba(255,214,150,0) 65%)'}} />
      <div style={{position: 'absolute', top: 410, left: 70, right: 150, display: 'flex', flexWrap: 'wrap', gap: '0 20px', fontFamily: F, fontWeight: 900, fontSize: 80, lineHeight: 1.05, letterSpacing: -2}}>
        {words.map(([txt, key]) => {
          const ts = W(1, key) - 0.06, p = sp(lt, ts, 9, 0.45);
          return <span key={txt} style={{color: C.ink, opacity: lt < ts ? 0 : 1, transform: `scale(${1.3 - 0.3 * p})`, transformOrigin: '0% 60%', display: 'inline-block'}}>{txt}</span>;
        })}
      </div>
      <div style={{position: 'absolute', top: 610, left: 70, opacity: lt < tF ? 0 : 1, transform: `scale(${1.5 - 0.5 * fp}) rotate(${-4 * fp}deg)`, transformOrigin: '20% 50%'}}><RGBText size={190} split={lt > tF && lt < tF + 0.4 ? 14 * (1 - (lt - tF) / 0.4) : 0}>FAKE?</RGBText></div>
      <Stage cx={470} cy={1120} rx={48 - 4 * lt} rz={-8} s={1.45 + 0.05 * lt} persp={1300}><Strip3D bad={7} t={lt} wob={3 + 2 * Math.sin(lt * 9)} /></Stage>
      <div style={{position: 'absolute', left: 760, top: 900}}><Mug /></div>
    </div>
  );
};

const SMorning: React.FC<SP> = ({t, lt}) => {
  const reach = eOut(clamp(lt / 1.3));
  const day = Math.floor(lt * 6);
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  return (<>
    <div style={{position: 'absolute', top: 410, left: 90, display: 'flex', gap: 30, alignItems: 'center'}}>
      <span style={{fontFamily: M, fontWeight: 800, fontSize: 96, color: C.ink}}>08:00 AM</span>
      <div style={{width: 120, height: 130, border: `5px solid ${C.ink}`, borderRadius: 12, background: C.white, textAlign: 'center', fontFamily: M, fontWeight: 800}}>
        <div style={{background: RED, color: C.white, fontSize: 24, padding: 4}}>{days[day % 7]}</div>
        <div style={{fontSize: 58, color: C.ink, transform: `rotateX(${(lt * 6 % 1) * 90}deg)`}}>{12 + day}</div>
      </div>
    </div>
    <Stage cx={470} cy={1080} rx={50} rz={-8} s={0.95 + 0.04 * lt} persp={1300}><Strip3D bad={-1} t={t} wob={2} /></Stage>
    <div style={{position: 'absolute', left: -320 + 560 * reach, top: 900}}><OldHand /></div>
  </>);
};

const SWhatIf: React.FC<SP> = ({t, lt}) => (<>
  <Stage cx={470} cy={900} rx={30} rz={-6} s={1.35 + 0.2 * lt} persp={1100}><Strip3D bad={7} t={t} wob={6 + 4 * Math.sin(t * 13)} /></Stage>
  <div style={{position: 'absolute', top: 1140, left: 0, right: 90, textAlign: 'center', ...pop(t, W(1, 'fake') - 0.05), display: 'block'}}><RGBText size={130} split={6}>FAKE?</RGBText></div>
</>);

const SCounter: React.FC<SP & {grid?: boolean}> = ({t, lt, grid}) => {
  const t0 = CUT('counter') + 0.15;
  const n = grid ? 220 : Math.round(220 * eOut(clamp((t - t0) / (W(2, '220') + 0.25 - t0))));
  return (<>
    <Overlay t={t} t0={W(2, '220') + 0.4}>220 samples flagged in August</Overlay>
    <div style={{position: 'absolute', top: grid ? 470 : 560, left: 0, right: 90, textAlign: 'center', fontFamily: M, fontWeight: 800, fontSize: grid ? 150 : 260, color: RED, letterSpacing: -6, transition: 'none'}}>{n}</div>
    {!grid && <div style={{position: 'absolute', top: 900, left: 0, right: 90, textAlign: 'center', fontFamily: M, fontSize: 34, color: C.mute}}>samples · not of standard quality</div>}
    {grid && (
      <div style={{position: 'absolute', top: 700, left: 120, width: 760, display: 'flex', flexWrap: 'wrap', gap: 14}}>
        {Array.from({length: 40}).map((_, i) => {
          const d = eOut(clamp((lt - i * 0.04) / 0.35));
          const red = hash(i * 7.7) > 0.55 && lt > 0.8 + i * 0.03;
          return <div key={i} style={{width: 76, height: 44, borderRadius: 22, border: `4px solid ${C.ink}`, background: red ? RED : C.white, transform: `translateY(${(1 - d) * -500}px) rotate(${red ? 180 : 0}deg)`, opacity: d}} />;
        })}
      </div>
    )}
  </>);
};

const STypes: React.FC<SP> = ({t, lt}) => {
  const tags: [string, string][] = [['PARACETAMOL', 'paracetamol'], ['DIABETES', 'diabetes'], ['ANTIBIOTICS', 'antibiotics']];
  return (<>
    <Big top={410} size={66}>Common ones:</Big>
    <div style={{position: 'absolute', top: 560, left: 0, right: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
      {tags.map(([l, k], i) => (
        <span key={l} style={{...pop(t, W(2, k) - 0.06), transform: `${pop(t, W(2, k) - 0.06).transform} rotate(${(i - 1) * 3}deg)`}}>
          <span style={{fontFamily: M, fontWeight: 800, fontSize: 64, color: C.white, background: RED, border: `5px solid ${C.ink}`, borderRadius: 12, padding: '8px 30px'}}>{l}</span>
        </span>
      ))}
    </div>
    <div style={{position: 'absolute', top: 1060, left: 0, right: 90, textAlign: 'center', fontFamily: M, fontSize: 27, color: C.mute}}>a failed sample = that tested batch only</div>
  </>);
};

const SFake1: React.FC<SP> = ({t, lt}) => {
  const one = sp(t, W(3, 'one') - 0.06, 8, 0.6);
  return (<>
    <Big top={420} size={70}>And one sample:</Big>
    <div style={{position: 'absolute', top: 560, left: 0, right: 90, textAlign: 'center', transform: `scale(${2 - one})`, opacity: clamp(one * 2)}}>
      <span style={{fontFamily: M, fontWeight: 800, fontSize: 120, color: C.white, background: RED, padding: '6px 34px', borderRadius: 14}}>SPURIOUS</span>
    </div>
    <div style={{position: 'absolute', top: 780, left: 0, right: 90, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 90, color: C.ink, opacity: ramp(t, W(3, 'fake') - 0.1, W(3, 'fake') + 0.1)}}>= FAKE</div>
  </>);
};

const SDelhi: React.FC<SP> = ({t, lt}) => {
  const zoom = eOut(clamp(lt / 1.6));
  const pin = sp(t, W(3, 'delhi') - 0.1, 7, 0.5);
  return (<>
    <Overlay t={t} t0={W(3, 'popular') - 0.1} bg={RED} fg={C.white}>1 fake BP medicine, in Delhi</Overlay>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, perspective: 1100, perspectiveOrigin: '470px 860px', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 470 - 600, top: 860 - 450, width: 1200, height: 900, transform: `rotateX(52deg) scale(${0.7 + 1.3 * zoom})`, transformOrigin: '50% 50%',
        backgroundImage: 'linear-gradient(rgba(31,26,21,0.25) 2px, transparent 2px), linear-gradient(90deg, rgba(31,26,21,0.25) 2px, transparent 2px)', backgroundSize: '50px 50px', border: `4px solid ${C.ink}`}}>
        {Array.from({length: 18}).map((_, i) => <div key={i} style={{position: 'absolute', left: 100 + hash(i) * 1000, top: 80 + hash(i + 9) * 740, width: 14, height: 14, borderRadius: 7, background: C.mute}} />)}
        <div style={{position: 'absolute', left: 588, top: 438, width: 24, height: 24, borderRadius: 12, background: RED, boxShadow: `0 0 0 ${10 + 20 * zoom}px rgba(229,83,43,0.25)`}} />
      </div>
    </div>
    <div style={{position: 'absolute', left: 430, top: 860 - 200 - 200 * (1 - pin), opacity: clamp(pin * 2)}}>
      <svg viewBox="0 0 80 110" width={80} height={110}><path d="M40 106 C 30 86 6 64 6 40 a34 34 0 0 1 68 0 C 74 64 50 86 40 106 Z" fill={RED} stroke={C.ink} strokeWidth={5} /><circle cx={40} cy={40} r={13} fill={C.white} /></svg>
    </div>
    <div style={{position: 'absolute', top: 1100, left: 100, display: 'flex', flexDirection: 'column', gap: 14}}>
      <Status k="SPURIOUS" v="1" bad p={sp(t, W(3, 'popular'))} />
      <Status k="LOCATION" v="DELHI" bad p={sp(t, W(3, 'delhi'))} />
    </div>
  </>);
};

const SSame: React.FC<SP & {cant?: boolean}> = ({t, lt, cant}) => {
  const scan = (lt * 0.8) % 1;
  const t0 = CUT('same');
  return (<>
    {cant && <Big top={410} size={76}>Your mom can’t tell.</Big>}
    {!cant && <Big top={410} size={70}>Looks <span style={{color: RED}}>exactly</span> the same</Big>}
    {['REAL?', 'FAKE?'].map((l, i) => (
      <React.Fragment key={l}>
        <Stage cx={i === 0 ? 270 : 680} cy={800} rx={40} ry={Math.sin((t - t0) * 1.4 + i * 0.4) * 25} rz={90} s={0.62} persp={1300}><Strip3D bad={-1} t={t} wob={3} /></Stage>
        <div style={{position: 'absolute', left: i === 0 ? 190 : 600, top: 1040, fontFamily: M, fontWeight: 800, fontSize: 40, color: C.ink}}>{l}</div>
      </React.Fragment>
    ))}
    {!cant && <div style={{position: 'absolute', left: 90, right: 160, top: 560 + scan * 450, height: 6, background: C.saf, boxShadow: `0 0 24px ${C.saf}`}} />}
    <div style={{position: 'absolute', top: 1120, left: 100}}><Status k="MATCH" v={cant ? '99.8% · CANNOT TELL' : `${(lt * 70 > 99.8 ? 99.8 : lt * 70).toFixed(1)}%`} bad={cant} p={1} size={32} /></div>
  </>);
};

const SBoot: React.FC<SP> = ({t, lt}) => {
  const txt = '> INITIALIZING OMNIX STACK...';
  const n = Math.floor(clamp((lt - 0.05) / 0.7) * txt.length);
  const mods = ['OMNICHAIN', 'A.L.K.I.', 'OMNIBOT'];
  const flood = eOut(clamp((lt - 1.8) / 0.6));
  return (
    <AbsoluteFill style={{background: '#14110E'}}>
      <div style={{position: 'absolute', top: 640, left: 90, fontFamily: M, fontWeight: 800, fontSize: 46, color: C.saf2}}>{txt.slice(0, n)}</div>
      {mods.map((m, i) => (
        <div key={m} style={{position: 'absolute', top: 760 + i * 90, left: 90, fontFamily: M, fontWeight: 800, fontSize: 52, color: C.paper, opacity: lt > 0.8 + i * 0.3 ? 1 : 0}}>
          {m} <span style={{color: GREEN}}>✓</span>
        </div>
      ))}
      <div style={{position: 'absolute', top: 1060, left: 90, fontFamily: M, fontSize: 30, color: C.mute, opacity: lt > 1.8 ? 1 : 0}}>picture this · coming soon</div>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, rgba(245,236,221,${flood}) ${flood * 120}%, rgba(245,236,221,0) ${flood * 140 + 1}%)`}} />
    </AbsoluteFill>
  );
};

const SMint: React.FC<SP & {stamp?: boolean}> = ({t, lt, stamp}) => {
  const k = stamp ? lt * 2.6 : 0;
  const press = stamp ? Math.max(0, Math.sin(k * Math.PI)) : 0;
  return (<>
    <Overlay t={t} t0={W(6, 'omnichain') - 0.1}>⛓️ OmniChain: factory → home</Overlay>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <g transform="translate(130 520)" fill="rgba(255,251,244,0.5)" stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
        <path d="M0 300 V120 L120 60 V120 L240 60 V120 L360 60 V300 Z" />
        <rect x={290} y={-20} width={44} height={110} />
        <rect x={40} y={190} width={70} height={110} fill="rgba(240,138,18,0.35)" />
        {[0, 1, 2].map((i) => <rect key={i} x={150 + i * 60} y={170} width={40} height={40} />)}
      </g>
      {[0, 1].map((i) => <circle key={i} cx={312 + i * 18} cy={480 - ((t * 60 + i * 40) % 90)} r={14 + i * 4} fill="none" stroke={C.mute} strokeWidth={4} opacity={0.6} />)}
    </svg>
    <div style={{position: 'absolute', left: 560, top: 640 + 40 * press, width: 140, height: 120, border: `6px solid ${C.ink}`, borderRadius: 10, background: C.saf, boxShadow: `0 0 ${30 * press}px ${C.saf2}`}} />
    <div style={{position: 'absolute', left: 625, top: 560, width: 14, height: 90 + 40 * press, background: C.ink}} />
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}}>
      {[0, 1, 2].map((i) => {
        const x = 260 + ((lt * 140 + i * 175) % 525);
        return <Stage key={i} cx={x} cy={900} rx={60} s={0.5} persp={1300}><Strip3D id={stamp && x > 560 ? 1 : 0} /></Stage>;
      })}
    </div>
    <div style={{position: 'absolute', top: 1090, left: 100}}><Status k="BATCH #A7F3" v="MINTED ON OMNICHAIN" good p={sp(t, stamp ? CUT('stampid') + 0.3 : W(6, 'id') - 0.1)} size={30} /></div>
  </>);
};

const SJourney: React.FC<SP> = ({t, lt}) => {
  const stops: [string, string, string][] = [['FACTORY', '06:12', 'factory'], ['DISTRIBUTOR', '11:40', 'distributor'], ['CHEMIST', '17:05', 'chemist'], ['HOME', '19:30', 'home']];
  const fly = eOut(clamp(lt / 4.2));
  return (<>
    <Stage cx={470} cy={830} rx={-14} ry={-30} persp={1100} s={1}>
      {stops.map(([l, ts, k], i) => {
        const on = t >= W(6, k) - 0.1 || i === 0;
        return (
          <div key={l} style={{position: 'absolute', transform: `translate3d(${-120 + i * 260 - fly * 780}px, 0, ${-i * 40}px)`, transformStyle: 'preserve-3d'}}>
            <ChainBlock label={l} state={on ? 'ok' : 'plain'} sub={on ? `✓ ${ts}` : '…'} />
          </div>
        );
      })}
    </Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}><line x1={90} y1={1040} x2={930} y2={1040} stroke={C.saf} strokeWidth={6} strokeDasharray="24 14" strokeDashoffset={-t * 160} /></svg>
    <div style={{position: 'absolute', top: 1100, left: 100}}><Status k="TRACE" v="RECORDED AT EVERY STEP" good p={sp(t, W(6, 'recorded') - 0.1)} size={30} /></div>
  </>);
};

const SBot: React.FC<SP> = ({t, lt}) => {
  const scanT = W(7, 'scans');
  const beam = clamp((t - scanT) / 1.0);
  const lock = eOut(clamp((t - scanT - 0.6) / 0.5));
  return (<>
    <Overlay t={t} t0={W(7, 'omnibot') - 0.1}>🤖 OmniBot scans</Overlay>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <g stroke={C.ink} strokeWidth={5} fill="rgba(255,251,244,0.4)"><rect x={90} y={1060} width={840} height={30} /><rect x={640} y={560} width={260} height={180} /><path d="M640 650 H900 M770 560 V740" /></g>
    </svg>
    <div style={{position: 'absolute', left: 160, top: 640, transform: `translateY(${Math.sin(t * 2) * 4}px)`}}><Robot arm={1} glow={0.5} /></div>
    <Stage cx={520} cy={760} rx={10} ry={-20} rz={-10} s={0.62} persp={1300}><Strip3D id={1} /></Stage>
    {beam > 0 && beam < 1 && <div style={{position: 'absolute', left: 390 + beam * 270, top: 680, width: 6, height: 170, background: C.saf, boxShadow: `0 0 26px ${C.saf}`}} />}
    {t > scanT && <Reticle x={600} y={790} s={0.7} lock={lock} />}
    {lock >= 1 && <div style={{position: 'absolute', top: 920, left: 480, fontFamily: M, fontWeight: 800, fontSize: 30, color: GREEN}}>ID LOCKED · #A7F3</div>}
    <Chip top={1130}>picture this · OmniBot coming soon</Chip>
  </>);
};

const SAlki: React.FC<SP> = ({t, lt}) => {
  const tStop = W(7, 'second') + 0.2;
  const ms = t >= tStop ? 0.4 : Math.min(0.4, Math.max(0, lt) * 0.12);
  const p = clamp(lt / 1.2);
  return (<>
    <Overlay t={t} t0={W(7, 'alki') - 0.1}>🧠 A.L.K.I. verifies in &lt;1s</Overlay>
    <div style={{position: 'absolute', left: 320, top: 520, transform: `scale(${1 + 0.04 * Math.sin(t * 5)})`}}><Brain t={t} p={p} /></div>
    <Stage cx={210} cy={960} rx={50} s={0.42} persp={1300}><Strip3D id={1} /></Stage>
    <Stage cx={760} cy={960} rx={-14} ry={-28} s={0.5} persp={1300}><ChainBlock label="#A7F3" state="ok" sub="ON CHAIN" /></Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {[[300, 920], [700, 920]].map(([x, y], i) => <path key={i} d={`M${x} ${y} Q ${470} ${760} 470 700`} fill="none" stroke={C.saf} strokeWidth={6} strokeDasharray="14 12" strokeDashoffset={-t * 200} opacity={p} />)}
    </svg>
    <div style={{position: 'absolute', top: 1100, left: 0, right: 90, textAlign: 'center', fontFamily: M, fontWeight: 800, fontSize: 70, color: t >= tStop ? GREEN : C.ink}}>{ms.toFixed(1)}s</div>
  </>);
};

const SReal: React.FC<SP> = ({t, lt}) => {
  const v = sp(t, W(8, 'verified') - 0.08, 9, 0.6);
  const hand = eOut(clamp((t - W(8, 'dose')) / 1.0));
  return (<>
    <div style={{position: 'absolute', left: 300, top: 600, width: 800, height: 800, borderRadius: 400, background: 'radial-gradient(circle, rgba(255,214,150,0.6) 0%, rgba(255,214,150,0) 65%)'}} />
    <div style={{position: 'absolute', top: 410, left: 0, right: 90, textAlign: 'center', opacity: clamp(v * 2), transform: `scale(${1.5 - 0.5 * v})`}}>
      <span style={{fontFamily: M, fontWeight: 800, fontSize: 58, color: C.white, background: GREEN, border: `5px solid ${C.ink}`, borderRadius: 14, padding: '10px 26px'}}>VERIFIED ✓ // 8 AM DOSE</span>
    </div>
    <div style={{position: 'absolute', left: 120, top: 640}}><Robot arm={0.6 + 0.4 * hand} glow={0.4} /></div>
    <Stage cx={460 + 120 * hand} cy={810 + 30 * hand} rx={30} rz={-10} s={0.5} persp={1300}><Strip3D id={1} /></Stage>
    <div style={{position: 'absolute', left: 860 - 180 * hand, top: 800, transform: 'scaleX(-1)', opacity: hand}}><OldHand /></div>
    <Overlay t={t} t0={W(8, 'dose') + 0.2} top={1150} bg={GREEN} fg={C.white}>Real ✓</Overlay>
  </>);
};

const SFake2: React.FC<SP & {alert?: boolean}> = ({t, lt, alert}) => {
  const pull = eOut(clamp((t - W(8, 'holds')) / 0.6));
  const ring = alert ? clamp((t - W(8, 'flagged')) / 1.2) : 0;
  return (<>
    <div style={{position: 'absolute', inset: 0, background: 'rgba(229,83,43,0.08)'}} />
    <div style={{position: 'absolute', top: 410, left: 0, right: 90, textAlign: 'center', ...pop(t, W(8, 'fake') - 0.08), display: 'block'}}>
      <span style={{fontFamily: M, fontWeight: 800, fontSize: 52, color: C.white, background: RED, border: `5px solid ${C.ink}`, borderRadius: 14, padding: '10px 22px'}}>ID NOT FOUND ✗ // BLOCKED</span>
    </div>
    {!alert && (<>
      <div style={{position: 'absolute', left: 140, top: 620}}><Robot arm={1 - pull} glow={0} /></div>
      <Stage cx={520 - 140 * pull} cy={790} rx={30} rz={-10} s={0.5} persp={1300}><Strip3D bad={3} t={t} /></Stage>
      <Overlay t={t} t0={W(8, 'holds') - 0.1} top={1130} bg={RED} fg={C.white}>Fake ✗ blocked</Overlay>
    </>)}
    {alert && (<>
      <div style={{position: 'absolute', left: 120, top: 560, width: 380, background: C.white, border: `5px solid ${C.ink}`, borderRadius: 26, padding: '22px 24px', boxShadow: `10px 10px 0 ${C.ink}`, ...pop(t, W(8, 'alerts') - 0.1)}}>
        <div style={{fontFamily: M, fontSize: 22, color: C.mute}}>A.L.K.I. · now</div>
        <div style={{fontFamily: F, fontWeight: 900, fontSize: 34, color: RED, marginTop: 6}}>ALERT SENT TO FAMILY</div>
        <div style={{fontFamily: M, fontSize: 22, color: C.ink, marginTop: 6}}>BP-TAB 40 · not verified</div>
      </div>
      <Stage cx={700} cy={850} rx={-14} ry={-28} s={0.6} persp={1300}><ChainBlock label="#A7F9" state={t > W(8, 'flagged') ? 'bad' : 'plain'} sub="BATCH" /></Stage>
      {ring > 0 && [0, 1, 2].map((i) => {
        const r = clamp(ring * 1.4 - i * 0.2);
        return <div key={i} style={{position: 'absolute', left: 700 - 260 * r, top: 850 - 260 * r, width: 520 * r, height: 520 * r, borderRadius: '50%', border: `5px solid ${RED}`, opacity: 1 - r}} />;
      })}
      <div style={{position: 'absolute', top: 1130, left: 100}}><Status k="BATCH" v="FLAGGED FOR ALL USERS" bad p={sp(t, W(8, 'flagged'))} size={30} /></div>
    </>)}
  </>);
};

const SProof: React.FC<SP & {n: 1 | 2 | 3}> = ({t, lt, n}) => {
  const txt = n === 1 ? 'No guessing.' : n === 2 ? 'No fake pills.' : 'Just proof.';
  const p = sp(t, CUT(`proof${n}`) + 0.02, 9, 0.5);
  return <div style={{position: 'absolute', top: 680, left: 0, right: 90, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: n === 3 ? 150 : 120, lineHeight: 1, color: n === 3 ? C.saf : C.ink, transform: `scale(${1.4 - 0.4 * p + 0.03 * lt})`, opacity: clamp(p * 2)}}>{txt}</div>;
};

const SCta: React.FC<SP> = ({t, lt}) => {
  const pulse = (Math.sin(t * 6) + 1) / 2;
  return (<>
    <Big top={420} size={74}>Send this to your <span style={{color: C.saf}}>family group</span></Big>
    <div style={{position: 'absolute', top: 700, left: 140, width: 330, background: C.white, border: `5px solid ${C.ink}`, borderRadius: 26, padding: '20px 22px', boxShadow: `8px 8px 0 ${C.ink}`}}>
      <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
        <div style={{width: 64, height: 64, borderRadius: 32, background: C.saf2, border: `4px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34}}>👨‍👩‍👧</div>
        <div style={{fontFamily: F, fontWeight: 900, fontSize: 30, color: C.ink}}>Family ❤️</div>
      </div>
      <div style={{fontFamily: M, fontSize: 22, color: C.mute, marginTop: 10}}>Mom, Papa, +6</div>
    </div>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <path d={`M500 790 Q 760 ${820 + 20 * pulse} ${860 + 20 * pulse} ${1280 + 30 * pulse}`} fill="none" stroke={C.saf} strokeWidth={12} strokeLinecap="round" strokeDasharray="26 18" strokeDashoffset={-t * 120} />
      <g transform={`translate(${870 + 20 * pulse} ${1310 + 30 * pulse}) rotate(70)`}><path d="M-34 -10 L0 40 L34 -10" fill="none" stroke={C.saf} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" /></g>
    </svg>
    <div style={{position: 'absolute', top: 1080, left: 140}}><Status k="OMNIX" v="COMING SOON" p={sp(t, CUT('cta') + 0.6)} size={30} /></div>
  </>);
};

const SCENES: Record<string, React.FC<SP>> = {
  hook: SHook, morning: SMorning, whatif: SWhatIf, counter: SCounter, grid: (p) => <SCounter {...p} grid />, types: STypes, fake1: SFake1, delhi: SDelhi,
  same: SSame, cant: (p) => <SSame {...p} cant />, boot: SBoot, mint: SMint, stampid: (p) => <SMint {...p} stamp />, journey: SJourney, bot: SBot, alki: SAlki,
  real: SReal, fake2: SFake2, alert: (p) => <SFake2 {...p} alert />, proof1: (p) => <SProof {...p} n={1} />, proof2: (p) => <SProof {...p} n={2} />,
  proof3: (p) => <SProof {...p} n={3} />, cta: SCta,
};
const PROBLEM = new Set(['hook', 'morning', 'whatif', 'counter', 'grid', 'types', 'fake1', 'delhi', 'same', 'cant']);
const STATUS: Record<string, string> = {
  hook: 'STRIP: UNVERIFIED', morning: 'DOSE: DAILY · 08:00', whatif: 'STRIP: UNVERIFIED', counter: 'AUG ALERT · NSQ: 220', grid: 'AUG ALERT · NSQ: 220', types: 'AUG ALERT · NSQ: 220',
  fake1: 'SPURIOUS: 1', delhi: 'SPURIOUS: 1 · DELHI', same: 'VISUAL CHECK: FAILS', cant: 'VISUAL CHECK: FAILS', boot: 'BOOTING…', mint: 'ID: MINTED', stampid: 'ID: MINTED',
  journey: 'TRACE: FACTORY → HOME', bot: 'SCAN: ACTIVE', alki: 'VERIFY: 0.4s', real: 'RESULT: VERIFIED', fake2: 'RESULT: BLOCKED', alert: 'BATCH: FLAGGED',
  proof1: 'MODE: PROOF', proof2: 'MODE: PROOF', proof3: 'MODE: PROOF', cta: 'OMNIX · COMING SOON',
};

// ================================================================ film
export const FakeMed: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let ci = 0;
  for (let i = 0; i < CUTS.length; i++) if (t >= CUTS[i].t) ci = i;
  const cut = CUTS[ci];
  const isLoop = cut.id === 'loop';
  const tLast = (Math.ceil(tl.total * FPS) - 1) / FPS;
  const hookLen = CUT('morning') - 0.02;
  const lt = isLoop ? Math.max(0, (tLast - t) / (tLast - cut.t)) * hookLen : t - cut.t;
  const tb = isLoop ? lt : t;
  const sceneId = isLoop ? 'hook' : cut.id;
  const Scene = SCENES[sceneId];
  const ltCut = t - cut.t;
  const jolt = cut.id !== 'hook' && !isLoop && ltCut < 2 / FPS;
  const problem = PROBLEM.has(sceneId);
  const flick = problem ? 0.9 + 0.1 * hash(Math.floor(tb * 10)) : 1;
  const creep = problem && sceneId !== 'hook' ? 1 + 0.025 * ltCut : 1;
  const punch = sceneId === 'hook' ? 1 : problem ? creep : 1 + 0.05 * Math.exp(-ltCut * 9);
  const dark = sceneId === 'boot';
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <AbsoluteFill style={{filter: problem ? `saturate(0.55) brightness(${flick})` : 'none'}}>
        <Backdrop t={tb} />
        <AbsoluteFill style={{transform: `translateX(${jolt ? (frame % 2 ? 22 : -16) : 0}px) scale(${punch})`}}>
          {Scene && <Scene t={sceneId === 'hook' ? lt : t} lt={lt} />}
        </AbsoluteFill>
        {problem && <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(31,26,21,0.28) 100%)'}} />}
      </AbsoluteFill>
      {!dark && <Brackets />}
      {!dark && <Header t={tb} />}
      {!dark && <Terminal t={sceneId === 'hook' ? lt : t} id={sceneId} t0={sceneId === 'hook' ? -0.35 : cut.t} />}
      {jolt && <div style={{position: 'absolute', left: 0, right: 0, top: 320 + ((frame * 397) % 1100), height: 26, background: C.saf, opacity: 0.85}} />}
      {jolt && <div style={{position: 'absolute', left: 0, right: 0, top: 320 + ((frame * 613) % 1100), height: 10, background: C.ink, opacity: 0.6}} />}
      {sceneId !== 'hook' && sceneId !== 'boot' && !sceneId.startsWith('proof') && <Captions t={t} />}
      <div style={{position: 'absolute', top: 1418, left: 84, right: 160, fontFamily: M, fontSize: 21, color: dark ? '#8C8073' : C.mute, textAlign: 'right'}}>{STATUS[sceneId]}</div>
      <div style={{position: 'absolute', top: 1455, left: 84, display: 'flex', alignItems: 'center', gap: 10, opacity: 0.75}}>
        <Img src={staticFile('logo.png')} style={{width: 34, height: 34}} />
        <span style={{fontFamily: F, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: dark ? C.paper : C.ink}}>OMNIX</span>
      </div>
      <Grain seed={Math.floor(tb * 30) % 8} />
      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};

export const Cover: React.FC = () => (
  <AbsoluteFill style={{background: C.paper}}>
    <Backdrop t={1} />
    <div style={{position: 'absolute', top: 310, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16}}>
      <Img src={staticFile('logo.png')} style={{width: 66, height: 66}} />
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 36, letterSpacing: 8, color: C.ink}}>SOLVED BY OMNIX</div>
    </div>
    <div style={{position: 'absolute', top: 410, left: 50, right: 50, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 84, lineHeight: 1.0, color: C.ink, letterSpacing: -3}}>Is your parents’ BP medicine</div>
    <div style={{position: 'absolute', top: 580, left: 0, right: 0, textAlign: 'center'}}><RGBText size={180} split={8}>FAKE?</RGBText></div>
    <div style={{position: 'absolute', left: 280, top: 760, width: 700, height: 700, borderRadius: 350, background: 'radial-gradient(circle, rgba(255,214,150,0.55) 0%, rgba(255,214,150,0) 65%)'}} />
    <Stage cx={540} cy={1060} rx={46} rz={-8} s={1.1} persp={1300}><Strip3D bad={7} t={0.1} wob={4} /></Stage>
    <div style={{position: 'absolute', top: 1440, left: 40, right: 40, display: 'flex', justifyContent: 'center', gap: 18}}>
      {['220 flagged', '1 fake', 'Proof, not guesses'].map((x, i) => (
        <span key={x} style={{fontFamily: F, fontWeight: 800, fontSize: 32, color: i === 0 ? C.white : C.ink, background: i === 0 ? RED : C.white, border: `4px solid ${C.ink}`, borderRadius: 40, padding: '10px 24px', whiteSpace: 'nowrap'}}>{x}</span>
      ))}
    </div>
  </AbsoluteFill>
);
