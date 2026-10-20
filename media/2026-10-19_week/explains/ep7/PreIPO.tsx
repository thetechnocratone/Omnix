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
  hook: 'wallet.buy("OPENAI", $5)', listed: 'exchange.lookup("OPENAI")  // not listed', cascade: 'pumpfun.list(pre_ipo)', ticker: 'pre_ipo.count  // 8',
  inspect: 'asset.preview()', black: '> INSPECTING ASSET...', share: 'share.inspect()', rights: 'share.rights()',
  shadow: 'token.inspect()', follow: 'token.tracks(company.value)', stamp: 'token.issuer  // not the company', nos: 'token.rights()',
  redeem: 'token.redeem(USDC)', frozen: 'redeem.status  // not guaranteed', consent: 'cat openai_notice.txt', locked: 'share.transfer()  // needs consent',
  detach: 'compare(share, token)', bet: 'token = bet(shadow)', cta: 'share --to friend', loop: 'wallet.buy("OPENAI", $5)', end: '',
};
const Terminal: React.FC<{t: number; id: string; t0: number}> = ({t, id, t0}) => {
  const cmd = CMD[id] || '';
  const n = Math.floor(clamp((t - t0 - 0.08) / 0.5) * cmd.length);
  const blink = Math.floor(t * 3) % 2 === 0;
  return (
    <div style={{position: 'absolute', top: 335, left: 80, right: 150, fontFamily: M, fontSize: 26, color: C.ink, opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden'}}>
      <span style={{color: C.saf}}>omnix@explains</span><span style={{color: C.mute}}>:~$ </span>{cmd.slice(0, n)}<span style={{opacity: blink ? 1 : 0, color: C.saf}}>▌</span>
    </div>
  );
};

const Header: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', top: 262, left: 80, right: 150, display: 'flex', alignItems: 'center', gap: 18}}>
    <Img src={staticFile('logo.png')} style={{width: 58, height: 58}} />
    <div style={{fontFamily: F, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.ink}}>OMNIX EXPLAINS</div>
    <div style={{flex: 1}} />
    <div style={{fontFamily: M, fontSize: 24, color: C.mute}}>
      <span style={{color: C.red, opacity: Math.floor(t * 2) % 2 ? 1 : 0.25}}>●</span> {`00:${String(Math.floor(t)).padStart(2, '0')}`}
    </div>
  </div>
);

// ================================================================ captions
const KEY = new Set(['openai', 'dollars', 'before', 'listed', 'pre-ipo', 'five', 'amazing', 'really', 'share', 'ownership', 'votes', 'rights', 'legal', 'claim', 'different', 'follow', 'shadow', "doesn't", 'issue', 'approve', 'no', 'dividends', 'back', 'cash', 'not', 'guaranteed', 'warned', "can't", 'written', 'permission', 'bet', 'send', 'friend', 'bucks']);
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
// ================================================================ pre-IPO props (company names as type only, no logos)
const NAMES = ['OPENAI', 'ANTHROPIC', 'NEURALINK', 'ANDURIL', 'FIGURE AI', 'OURA', 'KALSHI', 'POLYMARKET'];
const hash = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

const NameCoinSVG: React.FC<{name: string; shade?: boolean}> = ({name, shade}) => {
  const fs = name.length > 8 ? 26 : name.length > 6 ? 31 : 36;
  return (
    <svg viewBox="0 0 240 240" width={240} height={240}>
      <circle cx={120} cy={120} r={112} fill={shade ? C.safDeep : C.saf} stroke={C.ink} strokeWidth={8} />
      {!shade && (<>
        <circle cx={120} cy={120} r={90} fill="none" stroke={C.saf2} strokeWidth={5} strokeDasharray="6 8" />
        <path d="M40 120 H200 M120 40 V200" stroke="rgba(255,251,244,0.35)" strokeWidth={2} />
        <text x={120} y={112} textAnchor="middle" fontFamily="JBMono" fontWeight={800} fontSize={18} fill={C.white} opacity={0.85}>PRE-IPO</text>
        <text x={120} y={146} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={fs} fill={C.white}>{name}</text>
      </>)}
    </svg>
  );
};
const NameCoin: React.FC<{name: string}> = ({name}) => (
  <div style={{position: 'absolute', transformStyle: 'preserve-3d'}}>
    <Extrude w={240} h={240} depth={26} render={(sh) => <NameCoinSVG name={name} shade={sh} />} />
    <div style={{position: 'absolute', left: -120, top: -120, width: 240, height: 240, transform: 'translateZ(-27px) rotateY(180deg)'}}><NameCoinSVG name={name} /></div>
  </div>
);

const Phone: React.FC<{press: number; t: number}> = ({press, t}) => (
  <svg viewBox="0 0 320 560" width={320} height={560} style={{overflow: 'visible'}}>
    <rect x={6} y={6} width={308} height={548} rx={42} fill="rgba(255,251,244,0.55)" stroke={C.ink} strokeWidth={8} />
    <rect x={120} y={22} width={80} height={14} rx={7} fill={C.ink} />
    <path d="M40 140 L90 110 L130 125 L180 70 L230 95 L280 60" fill="none" stroke={C.sage} strokeWidth={6} strokeLinejoin="round" />
    <text x={40} y={200} fontFamily="JBMono" fontSize={22} fill={C.mute}>"OPENAI" · pre-IPO</text>
    <text x={40} y={240} fontFamily="JBMono" fontWeight={800} fontSize={30} fill={C.ink}>amount: $5</text>
    <g transform={`translate(160 440) scale(${1 - 0.08 * press})`}>
      <rect x={-120} y={-46} width={240} height={92} rx={22} fill={press > 0.2 ? C.safDeep : C.saf} stroke={C.ink} strokeWidth={7} />
      <text x={0} y={16} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={46} fill={C.white}>BUY</text>
    </g>
    {press > 0 && <circle cx={175} cy={445} r={30 + 50 * press} fill="none" stroke={C.saf} strokeWidth={5} opacity={1 - press} />}
  </svg>
);

const Walker: React.FC<{walk: number; label?: string; flat?: boolean}> = ({walk, label, flat}) => {
  const sw = Math.sin(walk) * 24;
  return (
    <svg viewBox="0 0 200 400" width={200} height={400} style={{overflow: 'visible'}}>
      <g stroke={flat ? 'none' : C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill={flat ? 'rgba(31,26,21,0.85)' : 'none'}>
        <g transform={`rotate(${sw} 82 232)`}><path d="M82 232 L72 360 L56 362" stroke={flat ? 'rgba(31,26,21,0.85)' : C.ink} strokeWidth={flat ? 22 : 9} fill="none" /></g>
        <g transform={`rotate(${-sw} 118 232)`}><path d="M118 232 L128 360 L144 362" stroke={flat ? 'rgba(31,26,21,0.85)' : C.ink} strokeWidth={flat ? 22 : 9} fill="none" /></g>
        <g transform={`rotate(${-sw * 0.7} 62 128)`}><path d="M62 128 L36 214" stroke={flat ? 'rgba(31,26,21,0.85)' : C.ink} strokeWidth={flat ? 20 : 9} fill="none" /></g>
        <g transform={`rotate(${sw * 0.7} 138 128)`}><path d="M138 128 L164 214" stroke={flat ? 'rgba(31,26,21,0.85)' : C.ink} strokeWidth={flat ? 20 : 9} fill="none" /></g>
        <rect x={60} y={108} width={80} height={128} rx={22} fill={flat ? 'rgba(31,26,21,0.85)' : 'rgba(255,251,244,0.6)'} />
        <circle cx={100} cy={62} r={40} fill={flat ? 'rgba(31,26,21,0.85)' : 'rgba(255,251,244,0.6)'} />
      </g>
      {!flat && <path d="M70 140 H130 M70 170 H130 M70 200 H130" stroke={C.saf} strokeWidth={3} opacity={0.6} />}
      {label && !flat && <text x={100} y={-14} textAnchor="middle" fontFamily="JBMono" fontWeight={800} fontSize={28} fill={C.ink}>{label}</text>}
    </svg>
  );
};

// the key visual: COMPANY walks, its TOKEN shadow follows on the floor (flickering), optionally detaching
const ShadowScene: React.FC<{t: number; lt: number; x: number; detach?: number; stamp?: number; walking?: boolean}> = ({t, lt, x, detach = 0, stamp = 0, walking = true}) => {
  const walk = walking ? t * 8 : 0;
  const flick = 0.55 + 0.35 * hash(Math.floor(t * 30)) * (hash(Math.floor(t * 7)) > 0.6 ? 1 : 0.3);
  const glitchX = hash(Math.floor(t * 15)) > 0.85 ? (hash(Math.floor(t * 30) + 3) - 0.5) * 30 : 0;
  const feetY = 1090;
  const sx = x + 30 - detach * 420, sy = feetY + detach * 30;
  return (<>
    {/* shadow (TOKEN) */}
    <div style={{position: 'absolute', left: sx - 100 + glitchX, top: sy, width: 200, height: 400, transformOrigin: '50% 0%', transform: `scaleY(-0.42) skewX(${-48 - detach * 10}deg)`, opacity: flick * (1 - 0.5 * detach)}}>
      <Walker walk={walk - detach * 2} flat />
    </div>
    <div style={{position: 'absolute', left: sx - 250 + glitchX, top: sy + 70, fontFamily: M, fontWeight: 800, fontSize: 30, color: C.white, background: RED, padding: '3px 12px', borderRadius: 6, opacity: 0.6 + 0.4 * flick}}>TOKEN</div>
    {stamp > 0 && (
      <div style={{position: 'absolute', left: Math.min(sx - 360, 420), top: sy - 210, transform: `rotate(-8deg) scale(${1.8 - 0.8 * stamp})`, opacity: clamp(stamp * 2)}}>
        <span style={{fontFamily: M, fontWeight: 800, fontSize: 40, color: RED, border: `6px solid ${RED}`, borderRadius: 10, padding: '6px 16px', background: 'rgba(245,236,221,0.85)', whiteSpace: 'nowrap'}}>NOT ISSUED BY COMPANY</span>
      </div>
    )}
    {/* person (COMPANY) — calm, solid */}
    <div style={{position: 'absolute', left: x - 100, top: feetY - 365, transform: `translateY(${walking ? Math.abs(Math.sin(walk)) * -8 : 0}px)`}}>
      <Walker walk={walk} label="COMPANY" />
    </div>
  </>);
};

const Building: React.FC<{split: number}> = ({split}) => (
  <div style={{position: 'absolute', transformStyle: 'preserve-3d'}}>
    {[0, 1, 2, 3, 4].map((i) => {
      const moving = i === 2;
      const dx = moving ? split * 360 : 0, dy = moving ? split * 40 : 0;
      return (
        <div key={i} style={{position: 'absolute', transform: `translate3d(${dx}px, ${-200 + i * 90 + (i - 2) * 8 * Math.min(split * 3, 1) + dy}px, 0)`, transformStyle: 'preserve-3d'}}>
          <Box w={260} h={82} d={200} face={(f) => (moving ? {background: f === 'front' ? 'rgba(240,138,18,0.55)' : 'rgba(255,196,107,0.45)', border: `4px solid ${C.ink}`} : wire(C.ink, 4))}
            content={{front: <svg width={260} height={82}>{[0, 1, 2, 3].map((k) => <rect key={k} x={20 + k * 60} y={22} width={36} height={36} fill="none" stroke={C.ink} strokeWidth={3} />)}</svg>}} />
        </div>
      );
    })}
  </div>
);

const PersonIcon: React.FC<{size?: number}> = ({size = 160}) => (
  <svg viewBox="0 0 120 160" width={size} height={size * 1.33}>
    <circle cx={60} cy={40} r={28} fill={C.white} stroke={C.ink} strokeWidth={7} />
    <path d="M14 150 V120 a46 46 0 0 1 92 0 V150 Z" fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
  </svg>
);

const Bell: React.FC = () => (
  <svg viewBox="0 0 300 320" width={300} height={320}>
    <path d="M150 20 V48" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
    <path d="M60 230 C 70 120 90 60 150 50 C 210 60 230 120 240 230 Z" fill={C.saf2} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <rect x={40} y={228} width={220} height={26} rx={10} fill={C.saf} stroke={C.ink} strokeWidth={8} />
    <circle cx={150} cy={280} r={22} fill={C.saf} stroke={C.ink} strokeWidth={8} />
    <text x={150} y={170} textAnchor="middle" fontFamily="JBMono" fontWeight={800} fontSize={26} fill={C.ink}>IPO</text>
  </svg>
);

const Padlock: React.FC<{open?: number; size?: number}> = ({open = 0, size = 120}) => (
  <svg viewBox="0 0 120 150" width={size} height={size * 1.25}>
    <path d={`M30 ${70 - open * 25} V45 a30 30 0 0 1 60 0 V70`} fill="none" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
    <rect x={14} y={66} width={92} height={76} rx={14} fill={RED} stroke={C.ink} strokeWidth={7} />
    <circle cx={60} cy={100} r={10} fill={C.ink} /><rect x={55} y={102} width={10} height={22} rx={4} fill={C.ink} />
  </svg>
);

// ================================================================ scenes
type SP = {t: number; lt: number};

// hook — pure function of lt (also replayed backwards for the loop)
const SHook: React.FC<SP> = ({lt}) => {
  const press = clamp((lt + 0.25) / 0.5);
  const rise = eOut(clamp((lt + 0.15) / 1.1));
  const tC = W(1, 'dollars') + 0.08;
  const shake = lt > tC && lt < tC + 0.45 ? (hash(Math.floor(lt * 60)) - 0.5) * 40 * (1 - (lt - tC) / 0.45) : 0;
  const words: [string, string, boolean][] = [['YOU', 'you', false], ['CAN', 'can', false], ['‘BUY’', 'buy', true], ['OPENAI', 'openai', true], ['FOR $5', 'few', false]];
  const catchP = sp(lt, tC, 8, 0.5);
  const split = lt > tC && lt < tC + 0.4 ? 12 * (1 - (lt - tC) / 0.4) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
      <div style={{position: 'absolute', top: 410, left: 70, right: 150, display: 'flex', flexWrap: 'wrap', gap: '0 22px', fontFamily: F, fontWeight: 900, fontSize: 88, lineHeight: 1.05, letterSpacing: -2}}>
        {words.map(([txt, key, hi]) => {
          const ts = W(1, key) - 0.06, p = sp(lt, ts, 9, 0.45);
          return <span key={txt} style={{color: hi ? C.saf : C.ink, opacity: lt < ts ? 0 : 1, transform: `scale(${1.3 - 0.3 * p})`, transformOrigin: '0% 60%', display: 'inline-block'}}>{txt}</span>;
        })}
      </div>
      <div style={{position: 'absolute', top: 640, left: 70, opacity: lt < tC ? 0 : 1, transform: `scale(${1.5 - 0.5 * catchP})`, transformOrigin: '0% 50%'}}><RGBText size={82} split={split}>HERE’S THE CATCH</RGBText></div>
      <Stage cx={540} cy={1180} rx={8} ry={-12 + lt * 4} s={0.78} persp={1500}>
        <div style={{position: 'absolute', left: -160, top: -280}}><Phone press={press} t={lt} /></div>
      </Stage>
      <Stage cx={560} cy={1060 - 260 * rise} rx={-8} ry={lt * 160} s={0.3 + 0.45 * rise}><NameCoin name="OPENAI" /></Stage>
      <Cursor x={600} y={1250 + 10 * (1 - press)} press={press < 1 ? press : 0} />
    </div>
  );
};

const SListed: React.FC<SP> = ({t, lt}) => (<>
  <Big top={410} size={70}>Before it’s even <span style={{color: C.saf}}>listed</span></Big>
  <Stage cx={470} cy={900} rx={-6} ry={-20 + lt * 10} s={0.95 + 0.04 * lt} persp={1500}>
    <div style={{position: 'absolute', left: -150, top: -160, transform: 'translateZ(-120px)'}}><Bell /></div>
    <div style={{position: 'absolute', left: -230, top: -200, width: 460, height: 400, transform: 'translateZ(60px)', borderTop: `8px solid ${C.ink}`, borderBottom: `8px solid ${C.ink}`, display: 'flex', justifyContent: 'space-between', padding: '0 10px', boxSizing: 'border-box'}}>
      {Array.from({length: 8}).map((_, i) => <div key={i} style={{width: 10, height: '100%', background: C.ink}} />)}
    </div>
    <div style={{position: 'absolute', left: -60, top: -40, transform: 'translateZ(80px)'}}><Padlock size={120} /></div>
  </Stage>
  <div style={{position: 'absolute', top: 1170, left: 100}}><Status k="IPO_STATUS" v="NOT LISTED" bad p={sp(t, W(1, 'listed') - 0.1)} /></div>
</>);

const SCascade: React.FC<SP & {ticker?: boolean}> = ({t, lt, ticker}) => {
  const t0 = CUT('cascade');
  const orbit = (t - t0) * 18;
  const dropAt = (i: number) => (i === 0 ? W(2, 'openai') : i === 1 ? W(2, 'anthropic') : i === 2 ? W(2, 'neuralink') : W(2, 'five') + (i - 3) * 0.16) - 0.1;
  return (<>
    <Overlay t={t} t0={t0 + 0.1}>Pre-IPO tokens: <span style={{color: C.sage}}>LIVE</span></Overlay>
    {!ticker && <div style={{position: 'absolute', top: 640, left: 110, right: 180, opacity: 1 - ramp(t, W(2, 'openai') - 0.3, W(2, 'openai')), transform: `scale(${0.96 + 0.03 * lt})`}}>
      <Panel top={0} left={0} right={0} style={{fontSize: 34, lineHeight: 1.6}}>
        <div style={{fontFamily: F, fontWeight: 900, fontSize: 44}}>PUMP.FUN · <span style={{color: C.saf}}>NEW</span></div>
        <div>+ pre-IPO tokens</div><div style={{color: C.mute, fontSize: 28}}>private companies · not listed</div>
      </Panel></div>}
    {NAMES.map((n, i) => {
      const d = eOut(clamp((t - dropAt(i)) / 0.35));
      if (d <= 0) return null;
      const col = i % 3, row = Math.floor(i / 3);
      const cx = 220 + col * 250 + (row === 2 ? 125 : 0), cy = 640 + row * 230;
      const bounce = d >= 1 ? Math.exp(-(t - dropAt(i) - 0.35) * 8) * Math.sin((t - dropAt(i)) * 30) * 14 : 0;
      return <Stage key={n} cx={cx} cy={cy - 500 * (1 - d) - bounce} rx={-10} ry={Math.sin(orbit / 20 + i) * 35} s={0.78}><NameCoin name={n} /></Stage>;
    })}
    {ticker && (
      <div style={{position: 'absolute', top: 1190, left: 40, width: 900, height: 66, overflow: 'hidden', background: C.ink}}>
        <div style={{whiteSpace: 'nowrap', fontFamily: M, fontWeight: 800, fontSize: 34, lineHeight: '66px', color: C.saf2, transform: `translateX(${-((t - CUT('ticker')) * 260) % 900}px)`}}>
          {'  PRE-IPO TOKENS // LIVE  ·  ' + NAMES.join('  ·  ') + '  ·  PRE-IPO TOKENS // LIVE  ·  ' + NAMES.join('  ·  ')}
        </div>
      </div>
    )}
  </>);
};

const SInspect: React.FC<SP> = ({t, lt}) => (<>
  <Big top={520} size={110} color={C.saf} style={{transform: `scale(${1 + 0.06 * lt})`}}>Sounds amazing ✨</Big>
  <Stage cx={470} cy={950} rx={-10} ry={t * 90} s={1.1}><NameCoin name="OPENAI" /></Stage>
</>);

const SBlack: React.FC<SP> = ({t, lt}) => {
  const txt = '> INSPECTING ASSET...';
  const n = Math.floor(clamp((lt - 0.1) / 0.8) * txt.length);
  const scan = (lt * 0.9) % 1;
  return (
    <AbsoluteFill style={{background: '#14110E'}}>
      <div style={{position: 'absolute', top: 760, left: 90, fontFamily: M, fontWeight: 800, fontSize: 56, color: C.saf2}}>{txt.slice(0, n)}<span style={{opacity: Math.floor(t * 3) % 2 ? 1 : 0}}>▌</span></div>
      <div style={{position: 'absolute', top: 860, left: 90, fontFamily: M, fontSize: 32, color: '#8C8073'}}>{lt > 1.2 ? 'type: TOKEN · tracks: "OPENAI"' : ''}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330 + scan * 1150, height: 4, background: C.saf, opacity: 0.6}} />
    </AbsoluteFill>
  );
};

const SShare: React.FC<SP & {rights?: boolean}> = ({t, lt, rights}) => {
  const split = rights ? 1 : eOut(clamp((t - W(4, 'piece')) / 0.9));
  return (<>
    <Overlay t={t} t0={W(4, 'share') - 0.1}>SHARE = <span style={{color: C.sage}}>OWNERSHIP</span></Overlay>
    <Stage cx={330} cy={880} rx={-14} ry={-24 + lt * 6} s={0.95} persp={1500}><Building split={split} /></Stage>
    <div style={{position: 'absolute', left: 700, top: 700}}><PersonIcon size={150} /></div>
    {rights && (
      <div style={{position: 'absolute', top: 1010, left: 520, display: 'flex', flexDirection: 'column', gap: 16}}>
        <Status k="VOTES" v="✓" good p={sp(t, W(4, 'votes') - 0.08)} />
        <Status k="RIGHTS" v="✓" good p={sp(t, W(4, 'rights') - 0.08)} />
        <Status k="LEGAL CLAIM" v="✓" good p={sp(t, W(4, 'legal') - 0.08)} />
      </div>
    )}
  </>);
};

const SShadow: React.FC<SP & {phase: 'intro' | 'follow' | 'stamp'}> = ({t, lt, phase}) => {
  const t0 = CUT('shadow');
  const x = 380 + (t - t0) * 45;
  const stamp = phase === 'stamp' ? sp(t, W(5, 'issue') - 0.1, 8, 0.6) : 0;
  return (<>
    <Overlay t={t} t0={phase === 'intro' ? W(5, 'follow') - 0.1 : t0 - 1} bg={RED} fg={C.white}>TOKEN = SHADOW of the price</Overlay>
    <ShadowScene t={t} lt={lt} x={x} stamp={stamp} />
  </>);
};

const SNos: React.FC<SP> = ({t}) => {
  const items: [string, string][] = [['OWNERSHIP', 'ownership'], ['VOTES', 'votes'], ['DIVIDENDS', 'dividends'], ['LEGAL CLAIM', 'legal']];
  return (<>
    <Big top={410} size={66}>What token holders get:</Big>
    <div style={{position: 'absolute', top: 540, left: 120, display: 'flex', flexDirection: 'column', gap: 30}}>
      {items.map(([l, k]) => {
        const ts = W(6, k) - 0.06, p = sp(t, ts, 8, 0.5);
        return (
          <div key={l} style={{display: 'flex', alignItems: 'center', gap: 26, opacity: t < ts ? 0.25 : 1}}>
            <span style={{fontFamily: M, fontWeight: 800, fontSize: 58, color: C.ink, minWidth: 440}}>{l}</span>
            <span style={{fontFamily: F, fontWeight: 900, fontSize: 96, color: RED, opacity: clamp(p * 2), transform: `scale(${2 - p})`, display: 'inline-block', lineHeight: 0.8}}>✗</span>
          </div>
        );
      })}
    </div>
    <div style={{position: 'absolute', top: 1150, left: 120, fontFamily: M, fontSize: 28, color: C.mute, opacity: ramp(t, W(6, 'backs') - 0.3, W(6, 'backs'))}}>…not even on what backs the token</div>
  </>);
};

const SRedeem: React.FC<SP & {frozen?: boolean}> = ({t, lt, frozen}) => {
  const t0 = W(7, 'cash') - 0.05;
  const press = t >= t0 ? clamp((t - t0) / 0.4) : 0;
  const prog = frozen ? 0.6 : Math.min(0.6, Math.max(0, (t - t0 - 0.2) / 1.3) * 0.6);
  const pct = Math.round(prog * 100 / 10) * 10;
  const flicker = frozen && hash(Math.floor(t * 12)) > 0.7;
  return (<>
    {frozen && <Overlay t={t} t0={W(7, 'not') - 0.1} bg={RED} fg={C.white}>Cash-out? Not guaranteed</Overlay>}
    <div style={{position: 'absolute', top: 560, left: 0, right: 90, display: 'flex', justifyContent: 'center'}}>
      <span style={{fontFamily: F, fontWeight: 900, fontSize: 70, color: C.white, background: press > 0.2 ? C.safDeep : C.saf, border: `6px solid ${C.ink}`, borderRadius: 22, padding: '14px 60px', boxShadow: `${10 - 8 * press}px ${10 - 8 * press}px 0 ${C.ink}`, transform: `translate(${8 * press}px, ${8 * press}px)`, display: 'inline-block'}}>REDEEM</span>
    </div>
    <div style={{position: 'absolute', top: 780, left: 110, right: 180, height: 60, border: `6px solid ${C.ink}`, borderRadius: 30, background: C.white, overflow: 'hidden'}}>
      <div style={{width: `${prog * 100}%`, height: '100%', background: flicker ? RED : C.saf}} />
    </div>
    <div style={{position: 'absolute', top: 870, left: 110, fontFamily: M, fontWeight: 800, fontSize: 40, color: frozen ? RED : C.ink}}>{t >= t0 + 0.2 ? `${pct}%${frozen ? ' … stalled' : '…'}` : ''}</div>
    {frozen && <div style={{position: 'absolute', top: 960, left: 110}}><Status k="STATUS" v="NOT GUARANTEED" bad p={sp(t, W(7, 'guaranteed') - 0.15)} /></div>}
    {frozen && <div style={{position: 'absolute', top: 1060, left: 110, fontFamily: M, fontSize: 26, color: C.mute}}>per the provider’s own terms</div>}
  </>);
};

const SConsent: React.FC<SP & {locked?: boolean}> = ({t, lt, locked}) => {
  const line = '> OPENAI: TRANSFERS REQUIRE PRIOR WRITTEN CONSENT';
  const n = locked ? line.length : Math.floor(clamp((lt - 0.2) / 1.6) * line.length);
  const lk = locked ? sp(t, W(8, 'written') - 0.1, 9, 0.6) : 0;
  return (<>
    <div style={{position: 'absolute', top: 470, left: 100, right: 170, transform: `rotate(-1.5deg) scale(${0.97 + 0.02 * lt})`, background: C.white, border: `6px solid ${C.ink}`, borderRadius: 18, boxShadow: `14px 14px 0 ${C.ink}`, padding: '34px 34px 40px'}}>
      <div style={{fontFamily: M, fontSize: 26, color: C.mute, borderBottom: `3px dashed ${C.line}`, paddingBottom: 12, marginBottom: 20}}>NOTICE · past public statement (paraphrased)</div>
      <div style={{fontFamily: M, fontWeight: 800, fontSize: 42, lineHeight: 1.35, color: C.ink, minHeight: 230}}>{line.slice(0, n)}<span style={{opacity: Math.floor(t * 3) % 2 ? 1 : 0, color: C.saf}}>▌</span></div>
    </div>
    {locked && <div style={{position: 'absolute', top: 760, left: 680, transform: `scale(${1.8 - 0.8 * lk}) rotate(${(1 - lk) * 20}deg)`, opacity: clamp(lk * 2)}}><Padlock size={150} /></div>}
    {locked && <div style={{position: 'absolute', top: 1060, left: 100}}><Status k="SHARE TRANSFER" v="NEEDS CONSENT" bad p={sp(t, W(8, 'permission') - 0.1)} /></div>}
  </>);
};

const SDetach: React.FC<SP & {bet?: boolean}> = ({t, lt, bet}) => {
  const t0 = CUT('detach');
  const x = 420 + (t - t0) * 70;
  const det = eOut(clamp((t - t0 - 0.3) / 2.6));
  return (<>
    <div style={{position: 'absolute', inset: 0, background: `rgba(245,236,221,${0.55 * det})`}} />
    {!bet && <Big top={420} size={78}>Shares = <span style={{color: C.sage}}>ownership</span></Big>}
    <ShadowScene t={t} lt={lt} x={x} detach={det} />
    {bet && <div style={{position: 'absolute', top: 420, left: 60, right: 150, textAlign: 'center', ...pop(t, W(9, 'bet') - 0.1), display: 'block'}}>
      <span style={{fontFamily: F, fontWeight: 900, fontSize: 96, lineHeight: 1.0, color: C.ink}}>A BET ON<br /><span style={{color: RED}}>THE SHADOW</span></span></div>}
  </>);
};

const SCta: React.FC<SP> = ({t, lt}) => {
  const pulse = (Math.sin(t * 6) + 1) / 2;
  return (<>
    <Big top={420} size={70}>Send this to the friend about to <span style={{color: C.saf}}>“invest in OpenAI”</span></Big>
    <div style={{position: 'absolute', top: 780, left: 0, right: 90, textAlign: 'center', fontFamily: M, fontWeight: 800, fontSize: 40, color: C.mute}}>for five bucks 🪙</div>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <path d={`M380 1000 Q 700 ${1020 + 20 * pulse} ${860 + 20 * pulse} ${1300 + 30 * pulse}`} fill="none" stroke={C.saf} strokeWidth={12} strokeLinecap="round" strokeDasharray="26 18" strokeDashoffset={-t * 120} />
      <g transform={`translate(${880 + 20 * pulse} ${1330 + 30 * pulse}) rotate(60)`}><path d="M-34 -10 L0 40 L34 -10" fill="none" stroke={C.saf} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" /></g>
    </svg>
    <div style={{position: 'absolute', top: 960, left: 120, transform: `scale(${1 + 0.06 * pulse})`, transformOrigin: '0 50%'}}>
      <svg viewBox="0 0 120 120" width={150} height={150}><path d="M10 60 L110 14 L80 110 L58 72 Z" fill={C.white} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" /><path d="M58 72 L110 14" stroke={C.ink} strokeWidth={7} /></svg>
    </div>
  </>);
};

const SCENES: Record<string, React.FC<SP>> = {
  hook: SHook, listed: SListed, cascade: SCascade, ticker: (p) => <SCascade {...p} ticker />, inspect: SInspect, black: SBlack,
  share: SShare, rights: (p) => <SShare {...p} rights />, shadow: (p) => <SShadow {...p} phase="intro" />, follow: (p) => <SShadow {...p} phase="follow" />,
  stamp: (p) => <SShadow {...p} phase="stamp" />, nos: SNos, redeem: SRedeem, frozen: (p) => <SRedeem {...p} frozen />,
  consent: SConsent, locked: (p) => <SConsent {...p} locked />, detach: SDetach, bet: (p) => <SDetach {...p} bet />, cta: SCta,
};
const STATUS: Record<string, string> = {
  hook: 'ORDER: BUY · ASSET: TOKEN', listed: 'IPO: NOT LISTED', cascade: 'PRE-IPO TOKENS: 8', ticker: 'PRE-IPO TOKENS: 8', inspect: 'ASSET: UNVERIFIED',
  black: 'SCANNING…', share: 'ASSET: SHARE', rights: 'ASSET: SHARE · RIGHTS: YES', shadow: 'ASSET: TOKEN · TRACKS PRICE', follow: 'ASSET: TOKEN · TRACKS PRICE',
  stamp: 'ISSUER: NOT THE COMPANY', nos: 'RIGHTS: NONE', redeem: 'REDEEM: REQUESTED', frozen: 'REDEEM: NOT GUARANTEED', consent: 'TRANSFER: RESTRICTED',
  locked: 'TRANSFER: RESTRICTED', detach: 'SHARE ≠ TOKEN', bet: 'SHARE ≠ TOKEN', cta: 'SHARE: FRIEND',
};

// ================================================================ film
export const PreIPO: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let ci = 0;
  for (let i = 0; i < CUTS.length; i++) if (t >= CUTS[i].t) ci = i;
  const cut = CUTS[ci];
  const isLoop = cut.id === 'loop';
  const tLast = (Math.ceil(tl.total * FPS) - 1) / FPS;
  const hookLen = W(1, 'dollars') + 1.0;
  const lt = isLoop ? Math.max(0, (tLast - t) / (tLast - cut.t)) * hookLen : t - cut.t;
  const tb = isLoop ? lt : t;
  const sceneId = isLoop ? 'hook' : cut.id;
  const Scene = SCENES[sceneId];
  const ltCut = t - cut.t;
  const jolt = cut.id !== 'hook' && ltCut < 2 / FPS;
  const punch = sceneId === 'hook' ? 1 : 1 + 0.05 * Math.exp(-ltCut * 9);
  const dark = sceneId === 'black';
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <Backdrop t={tb} />
      <AbsoluteFill style={{transform: `translateX(${jolt ? (frame % 2 ? 22 : -16) : 0}px) scale(${punch})`}}>
        {Scene && <Scene t={sceneId === 'hook' ? lt : t} lt={lt} />}
      </AbsoluteFill>
      {!dark && <Brackets />}
      {!dark && <Header t={tb} />}
      {!dark && <Terminal t={sceneId === 'hook' ? lt : t} id={sceneId} t0={sceneId === 'hook' ? -0.35 : cut.t} />}
      {jolt && <div style={{position: 'absolute', left: 0, right: 0, top: 320 + ((frame * 397) % 1100), height: 26, background: C.saf, opacity: 0.85}} />}
      {jolt && <div style={{position: 'absolute', left: 0, right: 0, top: 320 + ((frame * 613) % 1100), height: 10, background: C.ink, opacity: 0.6}} />}
      {sceneId !== 'hook' && sceneId !== 'black' && <Captions t={t} />}
      <div style={{position: 'absolute', top: 1418, left: 84, right: 160, fontFamily: M, fontSize: 21, color: dark ? '#8C8073' : C.mute, textAlign: 'right'}}>{STATUS[sceneId]}</div>
      <div style={{position: 'absolute', top: 1455, left: 84, right: 160, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: 0.75}}>
          <Img src={staticFile('logo.png')} style={{width: 34, height: 34}} />
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: dark ? C.paper : C.ink}}>OMNIX</span>
        </div>
        <span style={{fontFamily: M, fontWeight: 800, fontSize: 21, color: dark ? C.paper : C.ink, border: `2px solid ${dark ? C.paper : C.ink}`, borderRadius: 4, padding: '2px 8px'}}>NOT FINANCIAL ADVICE</span>
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
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 36, letterSpacing: 8, color: C.ink}}>OMNIX EXPLAINS</div>
    </div>
    <div style={{position: 'absolute', top: 410, left: 50, right: 50, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 92, lineHeight: 1.0, color: C.ink, letterSpacing: -3, whiteSpace: 'nowrap'}}>“Buy” OpenAI for $5?</div>
    <div style={{position: 'absolute', top: 535, left: 0, right: 0, textAlign: 'center', whiteSpace: 'nowrap'}}><RGBText size={84} split={6}>HERE’S THE CATCH</RGBText></div>
    <ShadowScene t={0.6} lt={0} x={420} walking={false} />
    <Stage cx={800} cy={880} rx={-8} ry={-30} s={0.62}><NameCoin name="OPENAI" /></Stage>
    <div style={{position: 'absolute', top: 1440, left: 40, right: 40, display: 'flex', justifyContent: 'center', gap: 18}}>
      {['Pre-IPO tokens', 'Share ≠ token', 'No votes'].map((x, i) => (
        <span key={x} style={{fontFamily: F, fontWeight: 800, fontSize: 32, color: i === 0 ? C.white : C.ink, background: i === 0 ? RED : C.white, border: `4px solid ${C.ink}`, borderRadius: 40, padding: '10px 24px', whiteSpace: 'nowrap'}}>{x}</span>
      ))}
    </div>
  </AbsoluteFill>
);
