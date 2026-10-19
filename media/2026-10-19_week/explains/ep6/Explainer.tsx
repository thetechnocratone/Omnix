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
  hook: 'scan --chain btc --exposed-keys', wallets: 'list wallets --pubkey visible', qchip: 'qpu.status  // future hardware',
  howto: 'explain --simple --time 30s', twokeys: 'wallet.keys()', public: 'public_key  -> the LOCK', private: 'private_key -> the KEY',
  today: 'classic_pc.derive(private_key, lock)', qpick: 'qpu.derive(private_key, lock)', chain: 'chain.lookup(address)', send: 'tx.send(from=address)',
  reuse: 'address.reuse_count++', display: 'pubkey.visible_since(2017)', someone: 'attacker.wait()  // no rush',
  hayes: 'news --source "24/7 Wall St"', habit: 'risk.top()', fix: 'wallet.new_address()', newaddr: 'wallet.new_address()  // again',
  auto: 'wallet.settings.auto_new_address', share: 'share --to friend --since 2017', end: '',
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
    <div style={{fontFamily: F, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.ink}}>OMNIX EXPLAINS</div>
    <div style={{flex: 1}} />
    <div style={{fontFamily: M, fontSize: 24, color: C.mute}}>
      <span style={{color: C.red, opacity: Math.floor(t * 2) % 2 ? 1 : 0.25}}>●</span> {`00:${String(Math.floor(t)).padStart(2, '0')}`}
    </div>
  </div>
);

// ================================================================ captions
const KEY = new Set(['69', '6.9', 'million', 'quantum', 'two', 'public', 'lock', 'private', 'key', "can't", 'might', 'send', 'same', 'years',
  'display', 'habit', 'free', 'new', 'every', '2017', 'risk', 'sell', 'blockchain', 'again']);
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

// ================================================================ scenes  (lt = time since cut, t = film time)
type SP = {t: number; lt: number};

const SHook: React.FC<SP> = ({t, lt}) => {
  const n = 6900000 * eOut(ramp(lt, 0.2, 2.6));
  return (<>
    <Stage cx={540} cy={880} rx={-8} ry={t * 70} s={0.8}><Coin3D /></Stage>
    <Big top={375} size={150} color={C.saf} style={{letterSpacing: -5, whiteSpace: 'nowrap', left: 0, right: 0}}>6.9 MILLION</Big>
    <Big top={545} size={76}>Bitcoin could be stolen.</Big>
    <Big top={1060} size={68} style={{opacity: 1}}>Is yours one of them?</Big>
    <div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 30, color: C.mute}}>
      exposed_keys: <span style={{color: C.ink, fontWeight: 700}}>{fmt(lt < 0.2 ? 6900000 : n)} BTC</span>
    </div>
  </>);
};

const SWallets: React.FC<SP> = ({t, lt}) => {
  const rows = 6, cols = 3;
  return (<>
    <Stage cx={540} cy={760} rx={18} ry={-14 + lt * 8} persp={1600}>
      {Array.from({length: rows * cols}).map((_, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const bad = [1, 3, 4, 8, 10, 13, 14, 16].includes(i);
        const p = sp(t, CUT('wallets') + i * 0.025, 14, 0.4);
        return <div key={i} style={{position: 'absolute', left: -480 + c * 330, top: -330 + r * 112, width: 300, height: 92, transform: `translateZ(${(1 - p) * -400}px)`, opacity: p,
          background: bad ? C.saf : C.white, border: `4px solid ${C.ink}`, borderRadius: 10, fontFamily: M, fontSize: 24, color: bad ? C.white : C.ink, padding: '8px 14px', boxSizing: 'border-box'}}>
          {`bc1q…${(i * 7919 % 4096).toString(16).padStart(3, '0')}`}<div style={{fontSize: 20, fontWeight: 700}}>{bad ? '⚠ KEY VISIBLE' : 'hidden ✓'}</div>
        </div>;
      })}
    </Stage>
    <Chip top={1120}>Google Quantum AI research · Mar 2026</Chip>
  </>);
};

const SQChip: React.FC<SP> = ({t, lt}) => {
  const rise = eOut(ramp(lt, 0, 0.9));
  return (<>
    <Big top={390} size={74}>a <span style={{color: C.saf}}>future</span> quantum computer</Big>
    <div style={{position: 'absolute', left: 340, top: 760, width: 400, height: 400, borderRadius: 200, background: `radial-gradient(circle, rgba(255,196,107,${0.7 * rise}) 0%, rgba(255,196,107,0) 65%)`}} />
    <Stage cx={540} cy={900 - rise * 60} rx={58} rz={t * 25} s={0.6 + 0.5 * rise}><Chip3D t={t} /></Stage>
    <Chip top={1120} o={ramp(lt, 0.8, 1.1)}>status: not built yet</Chip>
  </>);
};

const SHowTo: React.FC<SP> = ({lt}) => {
  const left = Math.max(0, 30 - Math.floor(lt * 4));
  return (<>
    <Big top={430} size={96}>HOW IT WORKS</Big>
    <div style={{position: 'absolute', top: 600, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontWeight: 800, fontSize: 250, color: C.saf, letterSpacing: -4}}>00:{String(left).padStart(2, '0')}</div>
    <div style={{position: 'absolute', top: 930, left: 200, right: 200, height: 18, border: `4px solid ${C.ink}`, borderRadius: 9}}>
      <div style={{width: `${clamp(lt / 2.8) * 100}%`, height: '100%', background: C.ink}} />
    </div>
  </>);
};

const STwoKeys: React.FC<SP> = ({t, lt}) => (<>
  <Big top={380} size={78}>Every wallet has</Big>
  <Big top={470} size={210} color={C.saf} style={{...pop(t, W(3, 'two') - 0.05), left: 0, right: 0, display: 'block'}}>2 KEYS</Big>
  <Stage cx={330} cy={930} ry={-25 + lt * 20} rx={8} s={0.85}><Lock3D /></Stage>
  <Stage cx={760} cy={930} ry={25 - lt * 20} rz={-20} s={0.85}><Key3D /></Stage>
</>);

const SPublic: React.FC<SP> = ({t, lt}) => (<>
  <Stage cx={540} cy={800} ry={-30 + lt * 28} rx={6} s={1.35}><Lock3D glow={0.6} /></Stage>
  <div style={{position: 'absolute', top: 1060, left: 0, right: 0, textAlign: 'center', ...pop(t, CUT('public') + 0.1), display: 'block'}}>
    <span style={{fontFamily: F, fontWeight: 900, fontSize: 70, color: C.ink, background: C.white, border: `5px solid ${C.ink}`, borderRadius: 16, padding: '8px 30px'}}>Public key = 🔒 Lock</span>
  </div>
</>);

const SPrivate: React.FC<SP> = ({t, lt}) => {
  const ins = eOut(ramp(t, W(3, 'opens') - 0.45, W(3, 'opens') + 0.05));
  const open = eOut(ramp(t, W(3, 'opens') + 0.05, W(3, 'opens') + 0.4));
  return (<>
    <Stage cx={540} cy={760} ry={-12} rx={6} s={1.1}><Lock3D open={open} glow={open} /></Stage>
    <Stage cx={540 + 330 * (1 - ins)} cy={800 + 50} rz={-90 * ins} ry={20 * (1 - ins)} s={0.9}><Key3D /></Stage>
    <div style={{position: 'absolute', top: 1060, left: 0, right: 0, textAlign: 'center', ...pop(t, CUT('private') + 0.1), display: 'block'}}>
      <span style={{fontFamily: F, fontWeight: 900, fontSize: 70, color: C.white, background: C.ink, borderRadius: 16, padding: '8px 30px'}}>Private key = 🔑 Key</span>
    </div>
    <div style={{position: 'absolute', top: 400, left: 0, right: 0, textAlign: 'center', opacity: ramp(t, W(3, 'only') - 0.1, W(3, 'only') + 0.1)}}><Tag>ONLY 1 KEY OPENS IT</Tag></div>
  </>);
};

const SToday: React.FC<SP> = ({t, lt}) => {
  const fail = t >= W(4, "can't") - 0.05;
  const pct = Math.min(0.0000001, lt * 1e-8);
  return (<>
    <Big top={380} size={76}>Today’s computers</Big>
    <Panel top={520}>
      <div>&gt; derive key from lock…</div>
      <div style={{color: C.mute}}>attempts: {fmt(lt * 913000000)}</div>
      <div style={{color: C.mute}}>progress: {(pct * 100).toFixed(7)}%</div>
      <div style={{color: fail ? C.red : C.mute, fontWeight: 800, opacity: fail ? 1 : 0.4}}>{fail ? '✗ NOT FEASIBLE' : '…'}</div>
    </Panel>
    <Stage cx={540} cy={1000} ry={Math.sin(t * 2) * 15} s={0.55}><Lock3D /></Stage>
  </>);
};

const SQPick: React.FC<SP> = ({t, lt}) => {
  const prog = clamp(lt / 2.6);
  return (<>
    <Big top={380} size={76}>A powerful <span style={{color: C.saf}}>quantum</span> computer…</Big>
    <Stage cx={300} cy={830} rx={55} rz={t * 30} s={0.62}><Chip3D t={t} /></Stage>
    <Stage cx={790} cy={800} ry={-20 + Math.sin(t * 7) * 6} s={0.8}><Lock3D glow={prog} open={t > W(4, 'might') + 0.2 ? eOut(ramp(t, W(4, 'might') + 0.2, W(4, 'might') + 0.5)) * 0.6 : 0} /></Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {[0, 1, 2].map((i) => {
        const dash = (t * 400 + i * 60) % 120;
        return <path key={i} d={`M360 ${790 + i * 30} C 520 ${700 + i * 50}, 620 ${740 + i * 40}, 740 ${790 + i * 20}`} fill="none" stroke={C.saf} strokeWidth={6} strokeDasharray="20 18" strokeDashoffset={-dash} opacity={0.8} />;
      })}
    </svg>
    <div style={{position: 'absolute', top: 1040, left: 220, right: 220, height: 22, border: `4px solid ${C.ink}`, borderRadius: 11}}><div style={{width: `${prog * 100}%`, height: '100%', background: C.saf}} /></div>
    <Chip top={1100}>hypothetical · this machine doesn’t exist yet</Chip>
  </>);
};

const Block: React.FC<{label: string; hi?: boolean}> = ({label, hi}) => (
  <Box w={150} h={150} d={150} face={(f) => ({background: f === 'front' ? (hi ? C.saf : C.white) : f === 'top' ? '#F3E6CF' : C.tan, border: `4px solid ${C.ink}`, fontFamily: M, fontSize: 24, color: hi ? C.white : C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'})}
    content={{front: label}} />
);
const SChain: React.FC<SP & {sent: boolean}> = ({t, lt, sent}) => {
  const st = sent ? t - CUT('send') : 0;
  const slide = sent ? eOut(clamp(st / 0.5)) : 0;
  const shown = sent ? eOut(ramp(st, 0.35, 0.8)) : 0;
  return (<>
    <Big top={380} size={70}>Your lock is <span style={{color: sent ? C.saf : C.mute}}>{sent ? 'now public' : 'hidden'}</span></Big>
    <Stage cx={540} cy={820} rx={-14} ry={-28} persp={1400}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', transform: `translate3d(${-330 + i * 220 - slide * 220 - lt * 20}px, 0, 0)`, transformStyle: 'preserve-3d'}}>
          <Block label={`#${874120 + i}`} hi={sent && i === 3} />
        </div>
      ))}
      {sent && <div style={{position: 'absolute', transform: `translate3d(${330 - slide * 220 - lt * 20}px, ${-170 - 60 * shown}px, 0) scale(${0.45 * shown})`, transformStyle: 'preserve-3d'}}><Lock3D glow={1} /></div>}
    </Stage>
    <Panel top={990} style={{fontSize: 27}}>
      <div>address: bc1q…7f2a</div>
      <div>pubkey: {sent ? <span style={{color: C.saf, fontWeight: 800}}>02a7…f3c1 ⚠ VISIBLE</span> : <span style={{color: C.mute}}>[hidden until you spend]</span>}</div>
    </Panel>
  </>);
};

const SReuse: React.FC<SP> = ({t, lt}) => {
  const k = Math.min(9, Math.floor(lt * 3.2));
  return (<>
    <Big top={380} size={76}>Same address. <span style={{color: C.saf}}>Again.</span></Big>
    <Panel top={520} style={{fontSize: 28}}>
      {Array.from({length: Math.max(1, k)}).slice(-6).map((_, i, arr) => (
        <div key={i}>&gt; receive → bc1q…7f2a <span style={{color: C.saf}}>(×{k - arr.length + i + 1})</span></div>
      ))}
    </Panel>
  </>);
};

const SDisplay: React.FC<SP & {attack: boolean}> = ({t, lt, attack}) => {
  const year = Math.min(2026, 2017 + Math.floor((t - CUT('display')) * 3.2));
  const at = attack ? t - CUT('someone') : 0;
  return (<>
    <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center'}}>
      <span style={{fontFamily: F, fontWeight: 900, fontSize: 58, color: C.white, background: C.saf, border: `5px solid ${C.ink}`, borderRadius: 16, padding: '8px 26px'}}>Reuse address = lock on display</span>
    </div>
    <Stage cx={attack ? 640 : 540} cy={820} rx={-10} ry={-30 + lt * 9} s={0.78} persp={1500}>
      <GlassCase><div style={{position: 'absolute', transform: 'scale(0.9)', transformStyle: 'preserve-3d'}}><Lock3D glow={0.8} /></div></GlassCase>
    </Stage>
    <div style={{position: 'absolute', top: 470, right: 90, fontFamily: M, fontWeight: 800, fontSize: 44, color: C.ink}}>{attack ? '' : `${year}`}</div>
    {attack && (<>
      <Stage cx={200} cy={1010} rx={58} rz={t * 40} s={0.4}><Chip3D t={t} /></Stage>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M230 960 Q 420 760 600 800" fill="none" stroke={C.saf} strokeWidth={6} strokeDasharray="18 14" strokeDashoffset={-t * 300} />
      </svg>
      <div style={{position: 'absolute', top: 470, right: 90, fontFamily: M, fontWeight: 800, fontSize: 34, color: C.saf, textAlign: 'right'}}>
        time spent: {Math.floor(at * 160)}d<br /><span style={{color: C.mute, fontSize: 26}}>no rush…</span>
      </div>
    </>)}
  </>);
};

const SHayes: React.FC<SP> = ({t}) => (<>
  <Big top={390} size={70} style={{textAlign: 'left', left: 100}}>Arthur Hayes:</Big>
  <div style={{position: 'absolute', top: 480, left: 100, right: 100, fontFamily: F, fontWeight: 900, fontSize: 96, lineHeight: 1.04, color: C.ink, letterSpacing: -2}}>
    quantum <span style={{color: C.saf}}>isn’t</span> a reason to <span style={{...pop(t, W(7, 'sell') - 0.05), color: C.white, background: C.red, padding: '0 18px', borderRadius: 12, textDecoration: 'line-through'}}>sell</span>
  </div>
  <div style={{position: 'absolute', top: 820, left: 100, fontFamily: M, fontSize: 28, color: C.mute}}>BitMEX co-founder · as reported by 24/7 Wall St, Oct 2026</div>
</>);

const SHabit: React.FC<SP> = ({t, lt}) => {
  const s = sp(t, W(7, 'habit') - 0.05, 8, 0.7);
  return (<>
    <Big top={400} size={80}>The real risk:</Big>
    <Big top={520} size={240} color={C.saf} style={pop(t, W(7, 'one') - 0.05)}>1 HABIT</Big>
    <div style={{position: 'absolute', top: 840, left: 0, right: 0, textAlign: 'center', opacity: clamp(s * 2), transform: `rotate(-6deg) scale(${1.6 - 0.6 * s})`}}>
      <span style={{fontFamily: M, fontWeight: 800, fontSize: 64, color: C.red, border: `7px solid ${C.red}`, borderRadius: 12, padding: '6px 26px'}}>ADDRESS REUSE</span>
    </div>
  </>);
};

const SFix: React.FC<SP> = ({t, lt}) => {
  const into = eOut(ramp(lt, 0.15, 0.9));
  const door = eOut(ramp(lt, 0.8, 1.35));
  return (<>
    <Big top={380} size={92}>The fix is <span style={{color: C.sage}}>free</span></Big>
    <Stage cx={610} cy={840} rx={-12} ry={-34 + lt * 6} s={0.62} persp={1500}>
      <div style={{position: 'absolute', transform: `translate3d(${(1 - into) * 520}px, ${-(1 - into) * 120}px, 0) scale(0.8)`, transformStyle: 'preserve-3d'}}><Lock3D /></div>
      <Safe3D door={door} />
    </Stage>
  </>);
};

const SNewAddr: React.FC<SP> = ({t, lt}) => {
  const n = Math.min(6, 1 + Math.floor(lt * 3.3));
  const hex = ['a91c', '4e07', 'c3d2', '7b18', 'f05e', '2d9a'];
  return (<>
    <div style={{position: 'absolute', top: 370, left: 0, right: 0, textAlign: 'center', ...pop(t, CUT('newaddr') + 0.05), display: 'block'}}>
      <span style={{fontFamily: F, fontWeight: 900, fontSize: 60, color: C.white, background: C.sage, border: `5px solid ${C.ink}`, borderRadius: 16, padding: '8px 26px'}}>Fix: new address every time ✅</span>
    </div>
    <Panel top={520} style={{fontSize: 29}}>
      {hex.slice(0, n).map((h, i) => (
        <div key={i} style={{opacity: i === n - 1 ? clamp((lt * 3.3) % 1 * 3) : 1}}>&gt; receive → bc1q…{h} <span style={{color: C.sage, fontWeight: 800}}>NEW ✓</span></div>
      ))}
      <div style={{color: C.mute, marginTop: 6}}>pubkey: [hidden]</div>
    </Panel>
  </>);
};

const SAuto: React.FC<SP> = ({t, lt}) => {
  const on = eOut(ramp(t, W(8, 'you', 2) - 0.2, W(8, 'you', 2) + 0.1));
  return (<>
    <Big top={420} size={84}>Most wallets do this <span style={{color: C.sage}}>for you</span></Big>
    <Panel top={660} left={170} right={170} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 32}}>
      <span>new address<br />each time</span>
      <div style={{width: 160, height: 84, borderRadius: 42, background: on > 0.5 ? C.sage : C.line, border: `5px solid ${C.ink}`, position: 'relative'}}>
        <div style={{position: 'absolute', top: 6, left: 8 + on * 72, width: 62, height: 62, borderRadius: 31, background: C.white, border: `4px solid ${C.ink}`}} />
      </div>
    </Panel>
    <div style={{position: 'absolute', top: 900, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 32, color: C.sage, fontWeight: 800, opacity: on}}>AUTO: ON ✓</div>
  </>);
};

const SShare: React.FC<SP> = ({t, lt}) => {
  const st = sp(t, W(9, '2017') - 0.05, 8, 0.7);
  const fly = eOut(ramp(lt, 0.2, 1.4));
  return (<>
    <Big top={390} size={84}>Send this to <span style={{color: C.saf}}>that</span> friend</Big>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <path d={`M180 900 Q 540 ${760 - 80 * fly} ${180 + 720 * fly} ${880 - 260 * fly}`} fill="none" stroke={C.mute} strokeWidth={5} strokeDasharray="14 14" opacity={0.8} />
      <g transform={`translate(${180 + 720 * fly} ${880 - 260 * fly}) rotate(-25) scale(1.4)`}>
        <path d="M-60 -10 L60 -50 L20 50 L0 10 Z" fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M0 10 L60 -50" stroke={C.ink} strokeWidth={5} />
      </g>
    </svg>
    <div style={{position: 'absolute', top: 960, left: 0, right: 0, textAlign: 'center', opacity: clamp(st * 2), transform: `rotate(-5deg) scale(${1.7 - 0.7 * st})`}}>
      <span style={{fontFamily: M, fontWeight: 800, fontSize: 58, color: C.saf, border: `7px solid ${C.saf}`, borderRadius: 12, padding: '4px 22px'}}>SAME ADDRESS SINCE 2017</span>
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
      <div style={{fontFamily: M, fontSize: 32, color: C.saf, marginTop: 50, opacity: ramp(t, s + 0.45, s + 0.75)}}>trust, built in. the build is on.</div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<SP>> = {
  hook: SHook, wallets: SWallets, qchip: SQChip, howto: SHowTo, twokeys: STwoKeys, public: SPublic, private: SPrivate,
  today: SToday, qpick: SQPick, chain: (p) => <SChain {...p} sent={false} />, send: (p) => <SChain {...p} sent />,
  reuse: SReuse, display: (p) => <SDisplay {...p} attack={false} />, someone: (p) => <SDisplay {...p} attack />,
  hayes: SHayes, habit: SHabit, fix: SFix, newaddr: SNewAddr, auto: SAuto, share: SShare,
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
  // hard cut: 2-frame jolt + saffron scan bar, then a short punch-in settle
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
    <CoverLabel label="OMNIX EXPLAINS" />
    <div style={{position: 'absolute', top: 410, left: 50, right: 50, textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 118, lineHeight: 1.0, color: '#1F1A15', letterSpacing: -3}}>Can quantum steal your <span style={{color: C.saf}}>Bitcoin?</span></div>
    <Stage cx={600} cy={1060} rx={-10} ry={-28} s={0.72} persp={1500}>
      <GlassCase><div style={{position: 'absolute', transform: 'scale(0.9)', transformStyle: 'preserve-3d'}}><Lock3D glow={0.9} /></div></GlassCase>
    </Stage>
    <Stage cx={230} cy={1200} rx={58} rz={20} s={0.5}><Chip3D t={0.3} /></Stage>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <path d="M270 1150 Q 420 930 560 990" fill="none" stroke={C.saf} strokeWidth={8} strokeDasharray="22 16" />
    </svg>
    <Stage cx={880} cy={780} rx={-6} ry={-35} s={0.55}><Coin3D /></Stage>
    <CoverChips top={1420} items={['6.9M BTC exposed', '1 habit', 'Free fix']} />
  </AbsoluteFill>
);
