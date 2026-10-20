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
  hook: '> AGENT.SEND("123 MAIN ST...")', lied: 'agent.reply("Yep, I\'m here!")  // false', keyboard: 'agent.attach(marketplace)', listing: 'listing.create(item=keyboard)',
  offer: 'offer.accept(CA$10)  // asked CA$15', address: 'chat.send(buyer, address)', pickup: 'pickup.schedule(tonight)', secret: 'owner.notify()  // skipped',
  arrive: 'buyer.status = ARRIVED', reply: 'agent.reply_as(owner)', nothome: 'owner.location()', unaware: 'owner.aware  // false',
  button: 'audit.permissions()', dialog: 'permission.grant(ALWAYS)', notevil: 'agent.intent  // helpful', keys: 'scope.list()',
  ask: 'agent.request(SHARE_ADDRESS)', log: 'log.commit(omnichain)  // read-only', cta: 'poll.open()', loop: '> AGENT.SEND("123 MAIN ST...")', end: '',
};
const Terminal: React.FC<{t: number; id: string; t0: number}> = ({t, id, t0}) => {
  const cmd = CMD[id] || '';
  const n = Math.floor(clamp((t - t0 - 0.08) / 0.5) * cmd.length);
  const blink = Math.floor(t * 3) % 2 === 0;
  return (
    <div style={{position: 'absolute', top: 335, left: 80, right: 150, fontFamily: M, fontSize: 26, color: C.ink, opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden'}}>
      <span style={{color: C.saf}}>omnix@brief</span><span style={{color: C.mute}}>:~$ </span>{cmd.slice(0, n)}<span style={{opacity: blink ? 1 : 0, color: C.saf}}>▌</span>
    </div>
  );
};

const Header: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', top: 262, left: 80, right: 150, display: 'flex', alignItems: 'center', gap: 18}}>
    <Img src={staticFile('logo.png')} style={{width: 58, height: 58}} />
    <div style={{fontFamily: F, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.ink}}>THE BRIEF</div>
    <div style={{flex: 1}} />
    <div style={{fontFamily: M, fontSize: 24, color: C.mute}}>
      <span style={{color: C.red, opacity: Math.floor(t * 2) % 2 ? 1 : 0.25}}>●</span> {`00:${String(Math.floor(t)).padStart(2, '0')}`}
    </div>
  </div>
);

// ================================================================ captions
const KEY = new Set(['home', 'address', 'lied', 'muse', 'keyboard', 'lower', 'offer', 'pickup', 'night', 'without', 'buyer', 'photo', 'door', 'yep', "i'm", 'here', "wasn't", 'idea', 'one', 'button', 'allow', 'always', 'time', "aren't", 'evil', 'click', 'keys', 'whole', 'life', 'ask', 'acts', 'record', 'nobody', 'edit', 'yes', 'no', 'stranger']);
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

// ================================================================ Muse-reel props (generic UI only, no brand marks, no likeness)
const RED = '#E5532B';
const RGBText: React.FC<{children: React.ReactNode; size: number; color?: string; split?: number; style?: React.CSSProperties}> = ({children, size, color = RED, split = 0, style}) => (
  <div style={{position: 'relative', display: 'inline-block', fontFamily: F, fontWeight: 900, fontSize: size, lineHeight: 0.95, letterSpacing: -4, ...style}}>
    {split > 0 && <span style={{position: 'absolute', left: -split, top: 0, color: 'rgba(255,0,60,0.75)', mixBlendMode: 'multiply'}}>{children}</span>}
    {split > 0 && <span style={{position: 'absolute', left: split, top: split * 0.4, color: 'rgba(0,190,255,0.75)', mixBlendMode: 'multiply'}}>{children}</span>}
    <span style={{position: 'relative', color}}>{children}</span>
  </div>
);

const wire = (c = C.ink, w = 4): React.CSSProperties => ({background: 'rgba(255,251,244,0.18)', border: `${w}px solid ${c}`});

const House3D: React.FC<{glow?: number}> = ({glow = 0}) => {
  const W0 = 300, H0 = 210, D0 = 260, R0 = 120;
  const L = Math.hypot(D0 / 2, R0), ang = (Math.atan2(R0, D0 / 2) * 180) / Math.PI;
  return (
    <div style={{position: 'absolute', transformStyle: 'preserve-3d'}}>
      <Box w={W0} h={H0} d={D0} face={(f) => (f === 'top' ? {display: 'none'} : wire(C.ink, 4))}
        content={{front: (<svg width={W0} height={H0}><rect x={115} y={95} width={70} height={115} fill={glow ? `rgba(255,196,107,${0.6 * glow})` : 'none'} stroke={C.ink} strokeWidth={4} /><rect x={30} y={45} width={60} height={50} fill="none" stroke={C.ink} strokeWidth={4} /><rect x={210} y={45} width={60} height={50} fill="none" stroke={C.ink} strokeWidth={4} /></svg>)}} />
      {[1, -1].map((s) => (
        <div key={s} style={{position: 'absolute', left: -W0 / 2, top: -L / 2, width: W0, height: L, boxSizing: 'border-box', transform: `translate3d(0, ${-H0 / 2 - R0 / 2}px, ${(s * D0) / 4}px) rotateX(${s * (90 - ang)}deg)`,
          backgroundImage: `linear-gradient(90deg, rgba(240,138,18,0.6) 2px, transparent 2px)`, backgroundSize: '30px 100%', border: `4px solid ${C.saf}`}} />
      ))}
      {[1, -1].map((s) => (
        <svg key={'g' + s} width={W0} height={R0} style={{position: 'absolute', left: -W0 / 2, top: -H0 / 2 - R0, transform: `translateZ(${(s * D0) / 2}px)`, overflow: 'visible'}}>
          <polygon points={`0,${R0} ${W0 / 2},0 ${W0},${R0}`} fill="none" stroke={C.saf} strokeWidth={4} />
        </svg>
      ))}
    </div>
  );
};

const PinSVG: React.FC<{shade?: boolean}> = ({shade}) => (
  <svg viewBox="0 0 160 220" width={160} height={220} style={{overflow: 'visible'}}>
    <path d="M80 214 C 60 170 14 128 14 80 a66 66 0 0 1 132 0 C 146 128 100 170 80 214 Z" fill={shade ? 'rgba(229,83,43,0.15)' : 'rgba(229,83,43,0.12)'} stroke={shade ? 'rgba(160,50,25,0.55)' : RED} strokeWidth={shade ? 4 : 8} />
    {!shade && (<>
      <path d="M30 80 H130 M80 16 V180 M40 50 H120 M40 112 H120" stroke={RED} strokeWidth={2.5} opacity={0.55} />
      <circle cx={80} cy={80} r={26} fill={C.white} stroke={RED} strokeWidth={8} />
    </>)}
  </svg>
);
const Pin3D: React.FC = () => <Extrude w={160} h={220} depth={34} render={(sh) => <PinSVG shade={sh} />} />;

const AgentIcon: React.FC<{size?: number; label?: string; mood?: 'ok' | 'bad' | 'calm'; t?: number}> = ({size = 150, label = 'AGENT: ACTIVE', mood = 'ok', t = 0}) => {
  const blink = Math.floor(t * 2.2) % 7 === 0;
  const col = mood === 'bad' ? RED : mood === 'calm' ? C.sage : C.saf;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <line x1={60} y1={8} x2={60} y2={24} stroke={C.ink} strokeWidth={6} /><circle cx={60} cy={8} r={7} fill={col} />
        <rect x={12} y={24} width={96} height={80} rx={22} fill={C.white} stroke={C.ink} strokeWidth={7} />
        <rect x={26} y={44} width={68} height={34} rx={14} fill={C.ink} />
        {blink ? <><rect x={36} y={59} width={16} height={4} fill={col} /><rect x={68} y={59} width={16} height={4} fill={col} /></> : <><circle cx={44} cy={61} r={8} fill={col} /><circle cx={76} cy={61} r={8} fill={col} /></>}
      </svg>
      {label && <span style={{fontFamily: M, fontWeight: 800, fontSize: 26, color: C.white, background: C.ink, padding: '4px 12px', borderRadius: 6}}>{label}</span>}
    </div>
  );
};

const Buyer: React.FC<{size?: number}> = ({size = 1}) => (
  <svg viewBox="0 0 200 420" width={200 * size} height={420 * size}>
    <defs><pattern id="wg" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0 L0 0 0 16" fill="none" stroke="rgba(31,26,21,0.35)" strokeWidth={2} /></pattern></defs>
    <g stroke={C.ink} strokeWidth={6} strokeDasharray="14 6" fill="url(#wg)" strokeLinejoin="round">
      <circle cx={100} cy={70} r={46} />
      <path d="M40 410 V210 a60 60 0 0 1 60 -60 a60 60 0 0 1 60 60 V410 Z" />
    </g>
  </svg>
);

const Bubble: React.FC<{side: 'l' | 'r'; children: React.ReactNode; p: number; accent?: boolean; style?: React.CSSProperties; size?: number}> = ({side, children, p, accent, style, size = 44}) => (
  <div style={{opacity: clamp(p * 2), transform: `scale(${0.5 + 0.5 * p})`, transformOrigin: side === 'l' ? '0% 100%' : '100% 100%', display: 'inline-block', ...style}}>
    <div style={{fontFamily: F, fontWeight: 800, fontSize: size, lineHeight: 1.15, whiteSpace: 'nowrap', padding: '16px 26px', borderRadius: 30, border: `5px solid ${C.ink}`,
      background: accent ? C.saf : C.white, color: accent ? C.white : C.ink, [side === 'l' ? 'borderBottomLeftRadius' : 'borderBottomRightRadius']: 6}}>{children}</div>
  </div>
);
const typed = (s: string, t: number, t0: number, cps = 18) => s.slice(0, Math.max(0, Math.floor((t - t0) * cps)));

const KeyboardTop: React.FC = () => (
  <svg width={520} height={200}>
    {Array.from({length: 4}).map((_, r) => Array.from({length: 12}).map((_, c) => (
      <rect key={`${r}-${c}`} x={14 + c * 41.5} y={14 + r * 44} width={34} height={36} rx={6} fill={r === 3 && c > 2 && c < 9 ? 'none' : 'rgba(255,251,244,0.5)'} stroke={C.ink} strokeWidth={3} />
    )))}
    <rect x={14 + 3 * 41.5} y={14 + 3 * 44} width={6 * 41.5 - 7} height={36} rx={6} fill="rgba(240,138,18,0.35)" stroke={C.ink} strokeWidth={3} />
  </svg>
);
const Keyboard3D: React.FC = () => (
  <div style={{position: 'absolute', transformStyle: 'preserve-3d'}}>
    <Box w={520} h={36} d={200} face={(f) => (f === 'top' ? {background: 'rgba(255,251,244,0.6)', border: `4px solid ${C.ink}`} : wire(C.ink, 4))} content={{top: <KeyboardTop />}} />
    <div style={{position: 'absolute', transform: 'translateY(110px)', transformStyle: 'preserve-3d'}}>
      <Box w={620} h={150} d={300} face={(f) => ({background: f === 'top' ? 'rgba(233,213,181,0.7)' : 'rgba(233,213,181,0.35)', border: `4px solid ${C.ink}`})} />
    </div>
  </div>
);

const Cursor: React.FC<{x: number; y: number; press?: number}> = ({x, y, press = 0}) => (
  <svg width={90} height={110} style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.15 * press})`, transformOrigin: '0 0', overflow: 'visible'}}>
    {press > 0 && <circle cx={6} cy={6} r={20 + 40 * press} fill="none" stroke={C.saf} strokeWidth={5} opacity={1 - press} />}
    <path d="M6 6 L6 84 L26 66 L40 98 L54 92 L40 60 L66 60 Z" fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

const Dialog: React.FC<{title: React.ReactNode; a: string; b: string; hi?: 'a' | 'b' | null; hiColor?: string; w?: number}> = ({title, a, b, hi, hiColor = RED, w = 760}) => (
  <div style={{width: w, background: C.white, border: `6px solid ${C.ink}`, borderRadius: 26, boxShadow: `16px 16px 0 ${C.ink}`, padding: '30px 34px', fontFamily: M}}>
    <div style={{fontSize: 30, fontWeight: 800, color: C.ink, marginBottom: 26, lineHeight: 1.3}}>{title}</div>
    <div style={{display: 'flex', gap: 22}}>
      {[[a, 'a'], [b, 'b']].map(([txt, k]) => (
        <div key={k} style={{flex: 1, textAlign: 'center', fontSize: 26, fontWeight: 800, whiteSpace: 'nowrap', padding: '20px 6px', borderRadius: 14, border: `5px solid ${C.ink}`,
          background: hi === k ? hiColor : C.paper, color: hi === k ? C.white : C.ink}}>[ {txt} ]</div>
      ))}
    </div>
  </div>
);

const ClockFace: React.FC<{h: number; m: number; size?: number}> = ({h, m, size = 220}) => (
  <svg viewBox="-110 -110 220 220" width={size} height={size}>
    <circle r={100} fill={C.white} stroke={C.ink} strokeWidth={9} />
    {Array.from({length: 12}).map((_, i) => <line key={i} x1={0} y1={-84} x2={0} y2={i % 3 ? -76 : -68} stroke={C.ink} strokeWidth={i % 3 ? 4 : 7} transform={`rotate(${i * 30})`} strokeLinecap="round" />)}
    <line x1={0} y1={0} x2={0} y2={-50} stroke={C.ink} strokeWidth={10} strokeLinecap="round" transform={`rotate(${(h % 12) * 30 + m * 0.5})`} />
    <line x1={0} y1={0} x2={0} y2={-78} stroke={C.saf} strokeWidth={7} strokeLinecap="round" transform={`rotate(${m * 6})`} />
    <circle r={9} fill={C.ink} />
  </svg>
);

const Building: React.FC<{lit?: number}> = ({lit = 0}) => (
  <svg viewBox="0 0 360 520" width={360} height={520}>
    <rect x={20} y={20} width={320} height={480} fill="rgba(255,251,244,0.25)" stroke={C.ink} strokeWidth={6} />
    {Array.from({length: 4}).map((_, r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={50 + c * 95} y={50 + r * 80} width={60} height={50} fill={(r + c) % 3 === 0 ? `rgba(255,196,107,${0.5 * lit})` : 'none'} stroke={C.ink} strokeWidth={4} />))}
    <rect x={130} y={380} width={100} height={120} fill={C.tan} stroke={C.ink} strokeWidth={6} /><circle cx={212} cy={445} r={6} fill={C.saf} />
    <path d="M110 380 H250" stroke={C.ink} strokeWidth={8} />
  </svg>
);

const Status: React.FC<{k: string; v: string; bad?: boolean; good?: boolean; p?: number; size?: number}> = ({k, v, bad, good, p = 1, size = 34}) => (
  <div style={{fontFamily: M, fontWeight: 800, fontSize: size, opacity: clamp(p * 2), transform: `translateX(${(1 - p) * -30}px)`, whiteSpace: 'nowrap'}}>
    <span style={{color: C.mute}}>{k}: </span><span style={{color: C.white, background: bad ? RED : good ? C.sage : C.ink, padding: '2px 12px', borderRadius: 6}}>{v}</span>
  </div>
);

// ================================================================ scenes
type SP = {t: number; lt: number};

// hook — also used reversed for the loop, so it must be a pure function of lt
const HOOK_WORDS: [string, string, number][] = [['AN', 'an', 0], ['AI', 'ai', 0], ['GAVE', 'gave', 0], ['A', 'a', 0], ['STRANGER', 'stranger', 1], ['HIS', "man's", 1]];
const SHook: React.FC<SP> = ({lt}) => {
  const tHome = W(1, 'home') - 0.05, tAddr = W(1, 'address') - 0.05;
  const land = W(1, 'address') + 0.35;
  const drop = lt < land - 0.9 ? 0 : eOut(ramp(lt, land - 0.9, land));
  const bounce = lt > land ? Math.exp(-(lt - land) * 7) * Math.sin((lt - land) * 26) * 26 : 0;
  const pinY = -330 + 300 * drop - bounce;
  const split = (tt: number) => (lt >= tt && lt < tt + 0.35 ? 12 * (1 - (lt - tt) / 0.35) : 0);
  const push = 1 + 0.04 * lt;
  return (<>
    <div style={{position: 'absolute', top: 410, left: 70, right: 150, transform: `scale(${push})`, transformOrigin: '50% 0%'}}>
      {[0, 1].map((line) => (
        <div key={line} style={{display: 'flex', gap: 20, fontFamily: F, fontWeight: 900, fontSize: 76, color: C.ink, lineHeight: 1.05, letterSpacing: -2}}>
          {HOOK_WORDS.filter((w) => w[2] === line).map(([txt, key]) => {
            const ts = W(1, key) - 0.06;
            const p = sp(lt, ts, 9, 0.45);
            return <span key={txt + key} style={{opacity: lt < ts ? 0 : 1, transform: `scale(${1.3 - 0.3 * p})`, transformOrigin: '0% 60%', display: 'inline-block'}}>{txt}</span>;
          })}
        </div>
      ))}
      <div style={{marginTop: 10, opacity: lt < tHome ? 0 : 1, transform: `scale(${2.2 - 1.2 * sp(lt, tHome, 8, 0.5)})`, transformOrigin: '0% 50%'}}><RGBText size={176} split={split(tHome)}>HOME</RGBText></div>
      <div style={{opacity: lt < tAddr ? 0 : 1, transform: `scale(${2.2 - 1.2 * sp(lt, tAddr, 8, 0.5)})`, transformOrigin: '0% 50%'}}><RGBText size={150} split={split(tAddr)}>ADDRESS</RGBText></div>
    </div>
    <Stage cx={540} cy={1260} rx={-14} ry={-28 + lt * 6} s={0.78} persp={1500}>
      <House3D glow={drop >= 1 ? 1 : 0} />
      <div style={{position: 'absolute', transform: `translate3d(0px, ${pinY}px, 0px) rotateY(${lt * 90}deg)`, transformStyle: 'preserve-3d'}}><div style={{position: 'absolute', left: 0, top: -110, transformStyle: 'preserve-3d'}}><Pin3D /></div></div>
    </Stage>
  </>);
};

const SLied: React.FC<SP> = ({t, lt}) => {
  const stut = lt < 0.5 ? ((Math.floor(lt * 30) % 3) - 1) * 18 : 0;
  const flash = Math.floor(lt * 6) % 2 === 0;
  const tl0 = W(1, 'lied') - 0.06;
  return (<>
    <div style={{position: 'absolute', inset: 0, transform: `translateX(${stut}px)`}}><SHook t={t} lt={W(1, 'address') + 0.9} /></div>
    <div style={{position: 'absolute', inset: 0, background: 'rgba(229,83,43,0.12)'}} />
    <div style={{position: 'absolute', top: 1300, left: 0, right: 90, textAlign: 'center'}}>
      <span style={{fontFamily: M, fontWeight: 800, fontSize: 40, color: C.white, background: flash ? RED : C.ink, padding: '8px 22px', borderRadius: 8}}>AGENT_STATUS: DECEPTIVE</span>
    </div>
    {lt > 0 && t >= tl0 && <div style={{position: 'absolute', top: 470, left: 0, right: 90, textAlign: 'center', background: 'rgba(245,236,221,0.92)', padding: '20px 0'}}>
      <RGBText size={200} split={6 + 10 * Math.max(0, 1 - (t - tl0) / 0.5)}>LIED.</RGBText></div>}
  </>);
};

const SKeyboard: React.FC<SP & {listing?: boolean}> = ({t, lt, listing}) => {
  const slide = eOut(ramp(t, W(2, 'muse') - 0.1, W(2, 'muse') + 0.4));
  const push = listing ? 0.72 + 0.04 * lt : 0.9 + 0.05 * lt;
  return (<>
    {listing && <Overlay t={t} t0={CUT('listing') + 0.05}>Muse sold his keyboard</Overlay>}
    <Stage cx={listing ? 500 : 470} cy={listing ? 1080 : 900} rx={-22} ry={-30 + t * 32} s={push} persp={1600}><Keyboard3D /></Stage>
    {!listing && <div style={{position: 'absolute', top: 420, left: 80, fontFamily: M, fontSize: 30, color: C.mute}}>owner: matt robb · marketplace</div>}
    {!listing && <div style={{position: 'absolute', top: 470, right: 160 - 400 * (1 - slide), opacity: slide}}><AgentIcon t={t} size={140} label="AGENT: ACTIVE" /></div>}
    {listing && (
      <Panel top={500} left={120} right={180} style={{fontSize: 32, lineHeight: 1.6}}>
        <div>ITEM: <b>KEYBOARD</b></div>
        <div>PRICE: <b style={{color: C.saf}}>CA$15</b></div>
        <div style={{color: C.mute, fontSize: 26}}>handled by: <span style={{color: C.ink, fontWeight: 800}}>AI AGENT</span></div>
      </Panel>
    )}
  </>);
};

const SOffer: React.FC<SP> = ({t, lt}) => {
  const tick = clamp((t - W(3, 'offer') + 0.1) / 0.7);
  const price = Math.round(15 - 5 * eOut(tick));
  return (<>
    <Big top={400} size={70}>A <span style={{color: RED}}>lower</span> offer</Big>
    <div style={{position: 'absolute', top: 540, left: 0, right: 90, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 40, fontFamily: M, fontWeight: 800}}>
      <span style={{fontSize: 84, color: C.mute, textDecoration: tick > 0.3 ? `line-through ${RED} 10px` : 'none'}}>CA$15</span>
      <span style={{fontSize: 70, color: C.ink}}>→</span>
      <span style={{fontSize: 120, color: RED, transform: `scale(${1 + 0.15 * Math.sin(tick * Math.PI)})`, display: 'inline-block'}}>CA${price}</span>
    </div>
    <div style={{position: 'absolute', top: 820, left: 100, display: 'flex', flexDirection: 'column', gap: 18}}>
      <Status k="OFFER" v="ACCEPTED" bad p={sp(t, W(3, 'offer') + 0.5)} />
      <Status k="OWNER" v="NOT NOTIFIED" bad p={sp(t, W(3, 'asked') - 0.1)} />
    </div>
  </>);
};

const SAddress: React.FC<SP> = ({t, lt}) => {
  const fly = eOut(clamp((lt - 0.15) / 1.0));
  const x = 170 + 520 * fly, y = 860 - 220 * Math.sin(fly * Math.PI);
  return (<>
    <Overlay t={t} t0={CUT('address') + 0.1} bg={RED} fg={C.white}>Shared his address 📍</Overlay>
    <div style={{position: 'absolute', left: 70, top: 780}}><AgentIcon t={t} size={130} label="AGENT" mood="bad" /></div>
    <div style={{position: 'absolute', left: 720, top: 640}}><Buyer size={0.9} /></div>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <path d={`M210 860 Q ${190 + 260} ${860 - 300} ${x} ${y}`} fill="none" stroke={RED} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" opacity={0.85} />
    </svg>
    <div style={{position: 'absolute', left: x - 140, top: y - 70, transform: `rotate(${-8 + 16 * fly}deg)`}}>
      <Bubble side="l" p={1} accent>📍 123 MAIN ST…</Bubble>
    </div>
    <Chip top={1180}>illustration · address not real</Chip>
  </>);
};

const NightTint: React.FC<{o: number}> = ({o}) => (
  <div style={{position: 'absolute', inset: 0, background: `rgba(52,66,120,${0.2 * o})`, mixBlendMode: 'multiply'}} />
);

const SPickup: React.FC<SP> = ({t, lt}) => {
  const spin = eOut(clamp(lt / 1.4));
  const mins = 17 * 60 + 27 + (21 * 60 + 15 - (17 * 60 + 27)) * spin;
  const hh = Math.floor(mins / 60), mm = Math.floor(mins % 60);
  const label = `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh >= 12 ? 'PM' : 'AM'}`;
  return (<>
    <Big top={400} size={74}>Pickup: <span style={{color: C.saf}}>tonight</span></Big>
    <div style={{position: 'absolute', top: 560, left: 0, right: 90, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40}}>
      <ClockFace h={hh} m={mm} size={260} />
      <div style={{fontFamily: M, fontWeight: 800, fontSize: 84, color: C.ink}}>{label}</div>
    </div>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: spin}}>
      <circle cx={820} cy={930} r={48} fill={C.white} stroke={C.ink} strokeWidth={5} /><circle cx={845} cy={915} r={44} fill="rgba(38,52,96,0.85)" />
    </svg>
    <div style={{position: 'absolute', top: 900, left: 100}}><Status k="WINDOW" v="8–10 PM" p={sp(t, CUT('pickup') + 0.6)} /></div>
  </>);
};

const SSecret: React.FC<SP> = ({t, lt}) => {
  const lines: [string, boolean][] = [['offer.accept(CA$10)', true], ['chat.send(address)', true], ['pickup.set(tonight)', true], ['owner.notify()', false]];
  return (<>
    <Big top={400} size={74}>…without telling <span style={{color: RED}}>Matt</span></Big>
    <Panel top={540} left={110} right={180} style={{fontSize: 32, lineHeight: 1.7}}>
      {lines.map(([l, ok], i) => (
        <div key={l} style={{opacity: clamp((lt - 0.15 - i * 0.3) * 4), display: 'flex', justifyContent: 'space-between'}}>
          <span>&gt; {l}</span><span style={{color: ok ? C.sage : RED, fontWeight: 800}}>{ok ? 'DONE' : 'SKIPPED'}</span>
        </div>
      ))}
    </Panel>
  </>);
};

const Split: React.FC<SP & {stage: 'arrive' | 'reply' | 'nothome' | 'unaware'}> = ({t, lt, stage}) => {
  const ring = stage === 'arrive' && t > W(4, 'building') ? Math.max(0, 1 - (t - W(4, 'building')) / 1.2) : 0;
  const leftW = 500;
  return (<>
    {(stage === 'reply' || stage === 'nothome' || stage === 'unaware') && t > W(4, 'yep') + 0.5 && stage !== 'unaware' &&
      <Overlay t={t} t0={W(4, 'yep') + 0.5} top={395}>“Yep, I’m here!” <span style={{color: RED}}>(he wasn’t)</span></Overlay>}
    {/* left: buyer at the door */}
    <div style={{position: 'absolute', left: 40, top: 470, width: leftW, height: 760, overflow: 'hidden', borderRight: `5px dashed ${C.ink}`}}>
      <div style={{position: 'absolute', left: 40, top: 150, transform: `scale(${0.82 + 0.03 * lt})`, transformOrigin: '50% 100%'}}><Building lit={1} /></div>
      <div style={{position: 'absolute', left: 300, top: 330}}><Buyer size={0.95} /></div>
      {ring > 0 && <div style={{position: 'absolute', left: 190, top: 560, width: 100, height: 100, borderRadius: 50, border: `6px solid ${C.saf}`, transform: `scale(${1 + 2 * (1 - ring)})`, opacity: ring}} />}
      <div style={{position: 'absolute', left: 30, top: 20}}><Bubble side="l" p={sp(t, W(4, 'photo') - 0.1)} size={32}>📷 photo of the door</Bubble></div>
      <div style={{position: 'absolute', left: 30, bottom: 20, fontFamily: M, fontWeight: 800, fontSize: 26, color: C.mute}}>BUYER · 9:15 PM</div>
    </div>
    {/* right: what the agent says, or the empty home */}
    <div style={{position: 'absolute', left: 560, top: 470, width: 380, height: 760, overflow: 'hidden'}}>
      {(stage === 'arrive' || stage === 'reply') && (<>
        <div style={{position: 'absolute', right: 20, top: 300}}><AgentIcon t={t} size={110} label="AGENT" mood={stage === 'reply' ? 'bad' : 'ok'} /></div>
        {stage === 'reply' && <div style={{position: 'absolute', right: 10, top: 110}}><Bubble side="r" p={sp(t, W(4, 'yep') - 0.1)} accent size={36}>{typed('Yep, I’m here!', t, W(4, 'yep') - 0.05, 16) || '…'}</Bubble></div>}
        {stage === 'reply' && <div style={{position: 'absolute', right: 20, top: 250, fontFamily: M, fontSize: 24, color: C.mute}}>sent as: owner</div>}
      </>)}
      {(stage === 'nothome' || stage === 'unaware') && (<>
        <div style={{position: 'absolute', left: 0, top: 0, width: 380, height: 760, perspective: 900}}>
          <div style={{position: 'absolute', left: 40, top: 180, width: 300, height: 300, border: `5px solid ${C.ink}`, backgroundImage: 'linear-gradient(rgba(31,26,21,0.12) 2px, transparent 2px), linear-gradient(90deg, rgba(31,26,21,0.12) 2px, transparent 2px)', backgroundSize: '40px 40px', transform: `rotateY(${-18 + lt * 6}deg)`}}>
            <div style={{position: 'absolute', left: 110, top: 120, width: 80, height: 180, border: `4px solid ${C.ink}`}} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 10, top: 520, display: 'flex', flexDirection: 'column', gap: 14}}>
          <Status k="OWNER_LOCATION" v="NOT HOME" bad size={24} p={sp(t, CUT('nothome') + 0.1)} />
          {stage === 'unaware' && <Status k="OWNER_AWARE" v="FALSE" bad size={24} p={sp(t, CUT('unaware') + 0.05)} />}
        </div>
      </>)}
    </div>
  </>);
};

const SButton: React.FC<SP> = ({t, lt}) => {
  const p = sp(t, W(6, 'one') - 0.08, 9, 0.6);
  return (<>
    <Big top={420} size={74}>What went wrong?</Big>
    <Stage cx={500} cy={860} rx={22 - 6 * lt} ry={-18 + 10 * lt} s={0.6 + 0.4 * p} persp={1400}>
      <Box w={420} h={150} d={60} face={(f) => ({background: f === 'front' ? RED : '#B8401F', border: `6px solid ${C.ink}`, borderRadius: f === 'front' ? 18 : 0, fontFamily: F, fontWeight: 900, fontSize: 60, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center'})}
        content={{front: '1 BUTTON'}} />
    </Stage>
  </>);
};

const SDialog: React.FC<SP> = ({t, lt}) => {
  const tc = W(6, 'always') - 0.05;
  const sx = 230, sy = 1150, ex = 640, ey = 905;
  const k = clamp((t - (tc - 1.6)) / 1.6), ease2 = 1 - Math.pow(1 - k, 4);
  const cx = sx + (ex - sx) * ease2, cy = sy + (ey - sy) * ease2;
  const clicked = t >= tc;
  const press = clicked ? clamp((t - tc) / 0.5) : 0;
  const flash = clicked ? Math.max(0, 1 - (t - tc) / 0.9) : 0;
  return (<>
    {clicked && <Overlay t={t} t0={tc + 0.3} bg={RED} fg={C.white} top={395}>1 click: ALLOW ALWAYS</Overlay>}
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, perspective: 1600, perspectiveOrigin: '470px 900px'}}>
      <div style={{position: 'absolute', left: 90, top: 640, transform: `rotateX(${14 - 4 * lt}deg) rotateY(${-10 + 3 * lt}deg) scale(${0.96 + 0.02 * lt})`}}>
        <Dialog w={760} title={<>AGENT WANTS ACCESS TO<br /><span style={{color: C.saf}}>CHATS · LISTINGS · PICKUP INFO</span></>} a="ALLOW ONE TIME" b="ALLOW ALWAYS" hi={clicked ? 'b' : null} />
      </div>
    </div>
    <Cursor x={cx} y={cy} press={press} />
    <div style={{position: 'absolute', inset: 0, background: `rgba(229,83,43,${0.35 * flash})`}} />
    {clicked && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}><rect x={30} y={300} width={910} height={1220} fill="none" stroke={RED} strokeWidth={8} opacity={0.4 + 0.6 * flash} /></svg>}
  </>);
};

const SNotEvil: React.FC<SP> = ({t, lt}) => (<>
  <div style={{position: 'absolute', top: 430, left: 0, right: 90, display: 'flex', justifyContent: 'center', transform: `scale(${0.95 + 0.05 * lt})`}}><AgentIcon t={t} size={220} label="NOT EVIL" mood="ok" /></div>
  <div style={{position: 'absolute', top: 820, left: 100, display: 'flex', flexDirection: 'column', gap: 18}}>
    <Status k="INTENT" v="HELPFUL" good p={sp(t, W(7, 'evil') - 0.1)} />
    <Status k="LIMITS" v="NONE SET" bad p={sp(t, W(7, 'right') - 0.1)} />
  </div>
</>);

const SKeys: React.FC<SP> = ({t, lt}) => {
  const tk = W(7, 'keys') - 0.05;
  const burst = eOut(clamp((t - tk) / 1.1));
  const labels = ['MESSAGES', 'ADDRESS', 'PAYMENTS', 'CONTACTS'];
  const dirs = [[-300, -260], [270, -230], [-280, 230], [280, 250]];
  return (<>
    <Big top={400} size={70}>1 click = <span style={{color: RED}}>every key</span></Big>
    <Stage cx={470} cy={880} ry={t * 60} rz={-20} s={0.9 * (1 - 0.4 * burst)}><Key3D /></Stage>
    {labels.map((l, i) => {
      const z = burst * 500;
      return (
        <div key={l} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, perspective: 900, perspectiveOrigin: '470px 880px', opacity: burst > 0 ? 1 : 0}}>
          <div style={{position: 'absolute', left: 470 + dirs[i][0] * burst - 130, top: 880 + dirs[i][1] * burst - 60, transform: `translateZ(${z * (0.4 + i * 0.12)}px) rotate(${(i - 1.5) * 12}deg)`}}>
            <div style={{transform: 'scale(0.55)', transformOrigin: '0 0'}}><KeySVG /></div>
            <div style={{fontFamily: M, fontWeight: 800, fontSize: 28, color: C.white, background: RED, padding: '3px 10px', borderRadius: 6, display: 'inline-block'}}>{l}</div>
          </div>
        </div>
      );
    })}
  </>);
};

const SAsk: React.FC<SP> = ({t, lt}) => {
  const tc = W(8, 'acts') + 0.05;
  const k = clamp((t - (tc - 1.1)) / 1.1), e = 1 - Math.pow(1 - k, 3);
  const cx = 250 + (680 - 250) * e, cy = 1160 + (965 - 1160) * e;
  const clicked = t >= tc;
  return (<>
    <Overlay t={t} t0={W(8, 'ask') - 0.1} bg={C.sage} fg={C.white} top={395}>AI should ASK before it ACTS</Overlay>
    <div style={{position: 'absolute', left: 90, top: 640, transform: `scale(${0.98 + 0.02 * lt})`}}>
      <Dialog w={760} title={<>AGENT REQUESTS PERMISSION:<br /><span style={{color: C.saf}}>SHARE ADDRESS?</span></>} a="APPROVE" b="DENY" hi={clicked ? 'b' : null} hiColor={C.sage} />
    </div>
    <Cursor x={cx} y={cy} press={clicked ? clamp((t - tc) / 0.4) : 0} />
    {clicked && <div style={{position: 'absolute', top: 1060, left: 0, right: 90, textAlign: 'center', ...pop(t, tc + 0.05), display: 'block'}}><span style={{fontFamily: M, fontWeight: 800, fontSize: 44, color: C.sage}}>✓ ADDRESS STAYS PRIVATE</span></div>}
  </>);
};

const SLog: React.FC<SP> = ({t, lt}) => {
  const acts = ['asked: share address', 'owner: DENY', 'offer: CA$15 kept', 'reply: by owner'];
  return (<>
    <div style={{position: 'absolute', top: 400, left: 0, right: 90, textAlign: 'center'}}><span style={{fontFamily: M, fontWeight: 800, fontSize: 34, color: C.white, background: C.ink, padding: '8px 18px', borderRadius: 8}}>ACTION LOG // IMMUTABLE // OMNICHAIN</span></div>
    <Stage cx={470} cy={830} rx={-16} ry={-28 + lt * 5} persp={1400} s={0.95}>
      {acts.map((a, i) => {
        const d = eOut(clamp((lt - 0.3 - i * 0.45) / 0.35));
        return (
          <div key={a} style={{position: 'absolute', transform: `translate3d(${-330 + i * 220}px, ${-500 * (1 - d)}px, 0)`, transformStyle: 'preserve-3d', opacity: d > 0 ? 1 : 0}}>
            <Box w={160} h={160} d={160} face={(f) => ({background: f === 'front' ? (i === 1 ? C.sage : C.white) : f === 'top' ? '#F3E6CF' : C.tan, border: `4px solid ${C.ink}`, fontFamily: M, fontWeight: 700, fontSize: 21, color: i === 1 ? C.white : C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 8, boxSizing: 'border-box'})}
              content={{front: <span>{a}<br />🔒</span>}} />
          </div>
        );
      })}
    </Stage>
    <Panel top={1040} left={110} right={180} style={{fontSize: 28}}>
      <div>&gt; log.edit(block #2)</div>
      <div style={{color: t > W(8, 'edit') - 0.1 ? RED : C.mute, fontWeight: 800}}>{t > W(8, 'edit') - 0.1 ? '✗ DENIED · read-only' : '…'}</div>
    </Panel>
    <Chip top={1200} o={ramp(lt, 1.6, 2.0)}>OmniChain · in the making</Chip>
  </>);
};

const SCta: React.FC<SP> = ({t, lt}) => {
  const y = sp(t, W(9, 'yes') - 0.08, 8, 0.5), n = sp(t, W(9, 'no') - 0.08, 8, 0.5);
  return (<>
    <Big top={420} size={74}>Would you let an AI <span style={{color: C.saf}}>reply to your messages?</span></Big>
    <div style={{position: 'absolute', top: 760, left: 0, right: 90, display: 'flex', justifyContent: 'center', gap: 50}}>
      {[['YES', y, C.saf, C.white], ['NO', n, C.white, C.ink]].map(([l, p, bg, fg]) => (
        <span key={l as string} style={{fontFamily: M, fontWeight: 800, fontSize: 70, background: bg as string, color: fg as string, border: `6px solid ${C.ink}`, borderRadius: 18, padding: '10px 44px', boxShadow: `8px 8px 0 ${C.ink}`, opacity: clamp((p as number) * 2), transform: `scale(${0.5 + 0.5 * (p as number)}) translateY(${Math.sin(t * 5) * 4}px)`, display: 'inline-block'}}>[ {l as string} ]</span>
      ))}
    </div>
    <div style={{position: 'absolute', top: 940, left: 0, right: 90, textAlign: 'center', fontFamily: M, fontWeight: 800, fontSize: 48, color: C.ink, opacity: ramp(lt, 1.2, 1.5), transform: `translateY(${Math.abs(Math.sin(t * 4)) * 10}px)`}}>COMMENT ↓</div>
  </>);
};

const SCENES: Record<string, React.FC<SP>> = {
  hook: SHook, lied: SLied, keyboard: SKeyboard, listing: (p) => <SKeyboard {...p} listing />, offer: SOffer, address: SAddress,
  pickup: SPickup, secret: SSecret, arrive: (p) => <Split {...p} stage="arrive" />, reply: (p) => <Split {...p} stage="reply" />,
  nothome: (p) => <Split {...p} stage="nothome" />, unaware: (p) => <Split {...p} stage="unaware" />,
  button: SButton, dialog: SDialog, notevil: SNotEvil, keys: SKeys, ask: SAsk, log: SLog, cta: SCta,
};
const NIGHT = new Set(['pickup', 'secret', 'arrive', 'reply', 'nothome', 'unaware']);

const Overlay: React.FC<{t: number; t0: number; children: React.ReactNode; bg?: string; fg?: string; top?: number}> = ({t, t0, children, bg = C.white, fg = C.ink, top = 395}) => (
  <div style={{position: 'absolute', top, left: 0, right: 90, textAlign: 'center', ...pop(t, t0), display: 'block'}}>
    <span style={{fontFamily: F, fontWeight: 900, fontSize: 52, lineHeight: 1.15, color: fg, background: bg, border: `5px solid ${C.ink}`, borderRadius: 16, padding: '8px 24px', display: 'inline-block', maxWidth: 840}}>{children}</span>
  </div>
);

const Grain: React.FC<{seed: number}> = ({seed}) => (<>
  <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(31,26,21,0.035) 0px, rgba(31,26,21,0.035) 2px, transparent 2px, transparent 5px)'}} />
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 0.07, mixBlendMode: 'multiply'}}>
    <filter id={`gr${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width={1080} height={1920} filter={`url(#gr${seed})`} />
  </svg>
</>);

const STATUS: Record<string, string> = {
  hook: 'AGENT: ACTIVE · SCOPE: ALWAYS', lied: 'AGENT: ACTIVE · TRUTH: FALSE', keyboard: 'AGENT: ACTIVE · TASK: SELL', listing: 'AGENT: ACTIVE · TASK: SELL',
  offer: 'AGENT: ACTIVE · ASKED OWNER: NO', address: 'AGENT: ACTIVE · ASKED OWNER: NO', pickup: 'AGENT: ACTIVE · ASKED OWNER: NO', secret: 'AGENT: ACTIVE · ASKED OWNER: NO',
  arrive: 'BUYER: AT DOOR', reply: 'AGENT: SPEAKING AS OWNER', nothome: 'OWNER: AWAY', unaware: 'OWNER: UNAWARE', button: 'AUDIT: PERMISSIONS',
  dialog: 'SCOPE: ALWAYS', notevil: 'LIMITS: NONE', keys: 'SCOPE: EVERYTHING', ask: 'MODE: ASK FIRST', log: 'LOG: TAMPER-PROOF', cta: 'POLL: OPEN',
};

// ================================================================ film
export const Muse: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let ci = 0;
  for (let i = 0; i < CUTS.length; i++) if (t >= CUTS[i].t) ci = i;
  const cut = CUTS[ci];
  const isLoop = cut.id === 'loop';
  const tLast = (Math.ceil(tl.total * FPS) - 1) / FPS;
  // loop: replay the hook backwards so the very last frame equals frame one
  const lt = isLoop ? Math.max(0, (tLast - t) / (tLast - cut.t)) * (W(1, 'address') + 0.9) : t - cut.t;
  const tb = isLoop || cut.id === 'hook' ? (isLoop ? lt : t) : t;          // time for backdrop/HUD
  const sceneId = isLoop ? 'hook' : cut.id;
  const Scene = SCENES[sceneId];
  const ltCut = t - cut.t;
  const jolt = cut.id !== 'hook' && ltCut < 2 / FPS;
  const punch = cut.id === 'hook' || isLoop ? 1 : 1 + 0.05 * Math.exp(-ltCut * 9);
  const nightO = NIGHT.has(sceneId) ? (cut.id === 'pickup' ? eOut(clamp(ltCut / 1.2)) : 1) : 0;
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <Backdrop t={tb} />
      <Brackets />
      <Header t={tb} />
      <Terminal t={sceneId === 'hook' ? lt : t} id={sceneId} t0={sceneId === 'hook' ? -0.35 : cut.t} />
      <AbsoluteFill style={{transform: `translateX(${jolt ? (frame % 2 ? 22 : -16) : 0}px) scale(${punch})`}}>
        {Scene && <Scene t={sceneId === 'hook' ? lt : t} lt={lt} />}
      </AbsoluteFill>
      {nightO > 0 && <NightTint o={nightO} />}
      {jolt && <div style={{position: 'absolute', left: 0, right: 0, top: 320 + ((frame * 397) % 1100), height: 26, background: C.saf, opacity: 0.85}} />}
      {jolt && <div style={{position: 'absolute', left: 0, right: 0, top: 320 + ((frame * 613) % 1100), height: 10, background: C.ink, opacity: 0.6}} />}
      {sceneId !== 'hook' && sceneId !== 'lied' && <Captions t={t} />}
      <div style={{position: 'absolute', top: 1455, left: 84, right: 160, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: 0.75}}>
          <Img src={staticFile('logo.png')} style={{width: 34, height: 34}} />
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: C.ink}}>OMNIX</span>
        </div>
        <span style={{fontFamily: M, fontSize: 21, color: C.mute}}>{STATUS[sceneId]}</span>
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
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 36, letterSpacing: 8, color: C.ink}}>THE BRIEF</div>
    </div>
    <div style={{position: 'absolute', top: 410, left: 50, right: 50, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 92, lineHeight: 1.0, color: C.ink, letterSpacing: -3}}>An AI gave a stranger his</div>
    <div style={{position: 'absolute', top: 610, left: 0, right: 0, textAlign: 'center'}}><RGBText size={150} split={7}>HOME ADDRESS</RGBText></div>
    <Stage cx={540} cy={1170} rx={-14} ry={-28} s={0.85} persp={1500}>
      <House3D glow={1} />
      <div style={{position: 'absolute', transform: 'translate3d(0px, -30px, 0px) rotateY(20deg)', transformStyle: 'preserve-3d'}}><div style={{position: 'absolute', left: 0, top: -110, transformStyle: 'preserve-3d'}}><Pin3D /></div></div>
    </Stage>
    <div style={{position: 'absolute', left: 80, top: 1010}}><Bubble side="l" p={1} accent size={34}>📍 123 MAIN ST…</Bubble></div>
    <div style={{position: 'absolute', top: 1440, left: 40, right: 40, display: 'flex', justifyContent: 'center', gap: 18}}>
      {['AI agent', 'Allow Always', 'Ask first'].map((x, i) => (
        <span key={x} style={{fontFamily: F, fontWeight: 800, fontSize: 34, color: i === 0 ? C.white : C.ink, background: i === 0 ? RED : C.white, border: `4px solid ${C.ink}`, borderRadius: 40, padding: '10px 26px', whiteSpace: 'nowrap'}}>{x}</span>
      ))}
    </div>
  </AbsoluteFill>
);
