import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, spring, interpolate} from 'remotion';
import {loadFont} from '@remotion/fonts';
import tl from './timeline.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat.ttf'), weight: '100 900'});

const FPS = 30;
const C = {
  paper: '#F5ECDD', ink: '#1F1A15', saf: '#F08A12', saf2: '#FFC46B', safDeep: '#C9650A',
  mute: '#8C8073', line: '#DCCDB5', fill: '#FFF7EA', white: '#FFFBF4',
};
const F = 'Montserrat, sans-serif';

type Word = {w: string; s: number; e: number};
type Beat = {id: number; start: number; end: number; words: Word[]};
const BEATS = tl.beats as Beat[];
const B = (i: number) => BEATS[i - 1];
const NEXT = (i: number) => (i < 8 ? B(i + 1).start - 0.3 : tl.endCard);
const clean = (w: string) => w.toLowerCase().replace(/[“”".,:?!]/g, '');
const W = (i: number, word: string) => {
  const f = B(i).words.find((x) => clean(x.w) === word);
  if (!f) throw new Error('missing word ' + word);
  return f.s;
};

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const sp = (t: number, t0: number, damping = 13, mass = 0.7) =>
  t < t0 ? 0 : spring({frame: (t - t0) * FPS, fps: FPS, config: {damping, mass, stiffness: 140}});

// ---------------------------------------------------------------- background
const Background: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 38%, #FBF5EA 0%, ${C.paper} 62%, #E9DBC3 100%)`}}>
    <Img src={staticFile('star.png')} style={{position: 'absolute', width: 1500, left: -210, top: 260, opacity: 0.055, transform: `rotate(${t * 2.2}deg)`}} />
    <Img src={staticFile('lotus.png')} style={{position: 'absolute', width: 300, right: -40, top: 300, opacity: 0.09}} />
    <Img src={staticFile('conch.png')} style={{position: 'absolute', width: 300, left: -50, bottom: 340, opacity: 0.08}} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- header
const Header: React.FC<{t: number}> = ({t}) => {
  const o = 1 - ramp(t, tl.endCard - 0.2, tl.endCard + 0.1);
  return (
    <div style={{position: 'absolute', top: 205, left: 80, right: 80, display: 'flex', alignItems: 'center', gap: 18, opacity: o}}>
      <Img src={staticFile('logo.png')} style={{width: 62, height: 62}} />
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.ink}}>THE BRIEF</div>
      <div style={{width: 8, height: 8, borderRadius: 4, background: C.saf}} />
      <div style={{fontFamily: F, fontWeight: 600, fontSize: 26, letterSpacing: 4, color: C.mute}}>ROBOTICS</div>
    </div>
  );
};

// ---------------------------------------------------------------- captions (word-timed kinetic)
const KEY = new Set(['chatgpt', 'humanoid', 'definitely', '2027', 'cool', 'humans', 'doors', 'stairs', 'keyboards', 'human', 'shape',
  'body', 'brain', 'china', '10', 'minutes', 'best', 'first', 'yes', 'no', 'home']);
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
      if (/[.,:?!”]$/.test(w.w) && cur.length >= 2) flush();
      else if (cur.length >= 4 || chars > 18 || gap > 0.25) flush();
    });
    flush();
  }
  return out;
})();

const Captions: React.FC<{t: number}> = ({t}) => {
  let idx = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (t >= CHUNKS[i].s - 0.05) idx = i;
  if (idx < 0) return null;
  const ch = CHUNKS[idx];
  const nextS = CHUNKS[idx + 1]?.s ?? 999;
  const hold = Math.min(nextS - 0.05, ch.e + 0.6);
  if (t > hold) return null;
  return (
    <div style={{position: 'absolute', top: 1215, left: 90, right: 150, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 20px'}}>
      {ch.words.map((w, i) => {
        const p = sp(t, w.s - 0.04, 12, 0.5);
        const key = KEY.has(clean(w.w));
        return (
          <span key={i} style={{
            fontFamily: F, fontWeight: 800, fontSize: 70, lineHeight: 1.12, color: key ? C.saf : C.ink,
            opacity: clamp(p * 1.6), transform: `translateY(${(1 - p) * 26}px) scale(${0.75 + 0.25 * p})`, display: 'inline-block',
            textShadow: '0 2px 0 rgba(255,251,244,0.9)',
          }}>{w.w}</span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- the recurring humanoid
const Figure: React.FC<{draw?: number; glow?: number; walk?: number; outline?: string; headOnly?: number}> = ({draw = 1, glow = 0, walk = 0, outline = C.ink, headOnly = 0}) => {
  const L = 420;
  const dash = (d: number) => ({strokeDasharray: L, strokeDashoffset: L * (1 - clamp(d))});
  const sw = Math.sin(walk) * 22;
  const body = clamp(draw);
  return (
    <svg viewBox="0 0 200 400" width={200} height={400} style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.saf2} stopOpacity={0.95} />
          <stop offset="100%" stopColor={C.saf} stopOpacity={0} />
        </radialGradient>
      </defs>
      {glow > 0 && <circle cx={100} cy={58} r={70 + 25 * glow} fill="url(#bg)" opacity={glow} />}
      <g stroke={outline} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={1 - headOnly}>
        <g transform={`rotate(${sw} 72 230)`}><path d="M82 232 L72 360 L56 362" style={dash(body * 1.2 - 0.2)} /></g>
        <g transform={`rotate(${-sw} 118 230)`}><path d="M118 232 L128 360 L144 362" style={dash(body * 1.2 - 0.2)} /></g>
        <g transform={`rotate(${-sw * 0.8} 62 128)`}><path d="M62 128 L36 214" style={dash(body * 1.3 - 0.3)} /></g>
        <g transform={`rotate(${sw * 0.8} 138 128)`}><path d="M138 128 L164 214" style={dash(body * 1.3 - 0.3)} /></g>
        <rect x={60} y={108} width={80} height={128} rx={22} fill={C.fill} fillOpacity={clamp(body * 2 - 1)} style={dash(body * 1.1)} />
        <path d="M100 96 L100 108" />
      </g>
      <g>
        <circle cx={100} cy={58} r={40} fill={C.fill} stroke={outline} strokeWidth={9} />
        <rect x={74} y={46} width={52} height={20} rx={10} fill={glow > 0.05 ? C.saf : C.ink} />
        <path d="M84 30 q8 -8 16 0 q8 -8 16 0" stroke={C.saf} strokeWidth={5} fill="none" strokeLinecap="round" opacity={glow} />
      </g>
    </svg>
  );
};

// keyframed path of the figure across the whole film (the thing that carries every beat)
type K = {t: number; x: number; y: number; s: number; o: number};
const FIG: K[] = [
  {t: 0, x: 540, y: 880, s: 1.1, o: 1},
  {t: B(2).start - 0.4, x: 540, y: 880, s: 1.1, o: 1},
  {t: B(2).start + 0.2, x: 870, y: 1010, s: 0.5, o: 1},
  {t: B(3).start - 0.35, x: 870, y: 1010, s: 0.5, o: 1},
  {t: B(3).start, x: 870, y: 1080, s: 0.5, o: 0},
  {t: B(4).start - 0.2, x: -120, y: 905, s: 0.8, o: 0},
  {t: B(4).start, x: -120, y: 905, s: 0.8, o: 1},
  {t: W(4, 'humans') + 0.3, x: 540, y: 905, s: 0.8, o: 1},
  {t: W(4, 'so'), x: 540, y: 905, s: 0.8, o: 1},
  {t: W(4, 'shape') + 0.3, x: 540, y: 905, s: 0.85, o: 1},
  {t: B(5).start, x: 540, y: 800, s: 1.1, o: 1},
  {t: B(5).start + 0.5, x: 540, y: 790, s: 1.25, o: 1},
  {t: B(6).start - 0.3, x: 540, y: 790, s: 1.25, o: 1},
  {t: B(6).start + 0.2, x: 540, y: 980, s: 0.32, o: 1},
  {t: W(6, 'one'), x: 540, y: 980, s: 0.32, o: 1},
  {t: W(6, 'one') + 0.2, x: 540, y: 980, s: 0.32, o: 0},
  {t: B(7).start - 0.3, x: 170, y: 900, s: 0.7, o: 0},
  {t: B(7).start, x: 170, y: 900, s: 0.7, o: 1},
  {t: W(7, 'best'), x: 230, y: 900, s: 0.7, o: 1},
  {t: W(7, 'first') + 0.3, x: 840, y: 900, s: 0.7, o: 1},
  {t: B(8).start - 0.3, x: 840, y: 900, s: 0.7, o: 1},
  {t: B(8).start + 0.3, x: 540, y: 860, s: 0.62, o: 1},
  {t: tl.endCard - 0.1, x: 540, y: 860, s: 0.62, o: 1},
  {t: tl.endCard + 0.3, x: 540, y: 760, s: 0.4, o: 0},
];
const figAt = (t: number) => {
  let i = 0;
  while (i < FIG.length - 2 && t > FIG[i + 1].t) i++;
  const a = FIG[i], b = FIG[i + 1];
  const u = eInOut(ramp(t, a.t, b.t));
  const m = (p: keyof K) => a[p] + (b[p] - a[p]) * u;
  const moving = Math.abs(b.x - a.x) > 30 && t > a.t && t < b.t;
  return {x: m('x'), y: m('y'), s: m('s'), o: m('o'), moving};
};

const FigureLayer: React.FC<{t: number}> = ({t}) => {
  const f = figAt(t);
  if (f.o <= 0.001) return null;
  // hook: chat bubble shrinks into the head, then the body draws itself
  const morph = ramp(t, 0.35, 1.0);
  const draw = t < 1.0 ? 0 : eOut(ramp(t, 0.85, 1.9));
  const glowBrain = t >= W(5, 'brain') - 0.1 && t < B(6).start ? eOut(ramp(t, W(5, 'brain') - 0.1, W(5, 'brain') + 0.35)) : 0;
  const glowRace = t >= W(7, 'brain') && t < tl.endCard ? 0.55 : 0;
  const shapeOutline = t > W(4, 'human') && t < B(5).start ? C.saf : C.ink;
  const walk = f.moving ? t * 9 : 0;
  const bob = f.moving ? Math.abs(Math.sin(t * 9)) * -10 : Math.sin(t * 2) * 4;
  return (
    <div style={{position: 'absolute', left: f.x - 100, top: f.y - 200 + bob, width: 200, height: 400, opacity: f.o, transform: `scale(${f.s})`}}>
      <div style={{opacity: t < 1.05 ? ramp(t, 0.75, 0.95) : 1}}><Figure draw={t < 2 ? draw : 1} glow={Math.max(glowBrain, glowRace)} walk={walk} outline={shapeOutline} headOnly={t < 1.0 ? 1 : 0} /></div>
      {t < 1.05 && (
        <svg viewBox="0 0 200 400" width={200} height={400} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <g transform={`translate(${100} ${58 + 60 * (1 - morph)}) scale(${1.9 - 1.3 * eInOut(morph)})`} opacity={1 - ramp(t, 0.85, 1.05)}>
            <rect x={-56} y={-40} width={112} height={80} rx={30} fill={C.white} stroke={C.ink} strokeWidth={7} />
            <path d="M-24 38 L-36 62 L-2 40" fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
            {[-26, 0, 26].map((x, i) => (
              <circle key={i} cx={x} cy={0} r={9} fill={i === 1 ? C.saf : C.ink} opacity={0.6 + 0.4 * Math.sin(t * 10 - i)} />
            ))}
          </g>
        </svg>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- hero wrapper
const Hero: React.FC<{t: number; from: number; to: number; first?: boolean; children: (lt: number) => React.ReactNode}> = ({t, from, to, first, children}) => {
  if (t < from || t > to + 0.05) return null;
  const enter = first ? 1 : sp(t, from, 15, 0.6);
  const exit = eInOut(ramp(t, to - 0.3, to));
  return (
    <AbsoluteFill style={{opacity: Math.min(clamp(enter * 1.4), 1 - exit), transform: `translateY(${(1 - enter) * 90 - exit * 80}px)`}}>
      {children(t - from)}
    </AbsoluteFill>
  );
};

const Chip: React.FC<{children: React.ReactNode; top: number; o?: number}> = ({children, top, o = 1}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o}}>
    <div style={{fontFamily: F, fontWeight: 600, fontSize: 25, letterSpacing: 1.5, color: C.mute, border: `2px solid ${C.line}`, borderRadius: 40, padding: '8px 22px', background: 'rgba(255,251,244,0.7)'}}>{children}</div>
  </div>
);

const Big: React.FC<{children: React.ReactNode; size?: number; top: number; color?: string; style?: React.CSSProperties}> = ({children, size = 110, top, color = C.ink, style}) => (
  <div style={{position: 'absolute', top, left: 70, right: 70, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: size, lineHeight: 1.0, color, letterSpacing: -2, ...style}}>{children}</div>
);

const pop = (t: number, t0: number) => {
  const p = sp(t, t0, 10, 0.5);
  return {opacity: clamp(p * 2), transform: `scale(${0.4 + 0.6 * p}) rotate(${(1 - p) * -8}deg)`, display: 'inline-block'} as React.CSSProperties;
};

// ---------------------------------------------------------------- beats
const Beat1: React.FC<{t: number}> = ({t}) => {
  const stamp = sp(t, 1.0, 9, 0.6);
  return (
    <>
      <Big top={360} size={84} style={{whiteSpace: 'nowrap', left: 20, right: 20}}>ChatGPT is getting a</Big>
      <Big top={460} size={176} color={C.saf} style={{transform: `scale(${t < 1.0 ? 1 : 1 + 0.18 * Math.sin(stamp * Math.PI)})`}}>
        BODY <span style={{fontSize: 130}}>🤖</span>
      </Big>
      <Chip top={1100} o={ramp(t, 1.6, 2.0)}>OpenAI confirms · humanoid robot in the works</Chip>
    </>
  );
};

const Beat2: React.FC<{t: number}> = ({t}) => {
  const ws: [string, string, boolean][] = [['We', 'we', false], ['will', 'will', false], ['definitely', 'definitely', true], ['do a', 'do', false], ['humanoid', 'humanoid', true]];
  return (
    <>
      <div style={{position: 'absolute', top: 330, left: 90, fontFamily: F, fontWeight: 900, fontSize: 260, color: C.saf, lineHeight: 1, opacity: ramp(t, B(2).start, B(2).start + 0.3)}}>“</div>
      <div style={{position: 'absolute', top: 540, left: 100, right: 100, fontFamily: F, fontWeight: 900, fontSize: 104, lineHeight: 1.05, color: C.ink, letterSpacing: -2}}>
        {ws.map(([txt, key, hi], i) => (
          <span key={i} style={{...pop(t, W(2, key) - 0.05), color: hi ? C.saf : C.ink, marginRight: 26}}>{txt}</span>
        ))}
      </div>
      <div style={{position: 'absolute', top: 960, left: 100, fontFamily: F, fontWeight: 700, fontSize: 36, color: C.ink, opacity: ramp(t, W(2, 'humanoid') + 0.2, W(2, 'humanoid') + 0.5)}}>— Sam Altman, OpenAI CEO</div>
      <Chip top={1100} o={ramp(t, W(2, 'humanoid') + 0.3, W(2, 'humanoid') + 0.6)}>Sources podcast · Sept 2026</Chip>
    </>
  );
};

const Digit: React.FC<{d: number; t: number; t0: number; size: number}> = ({d, t, t0, size}) => {
  const p = sp(t, t0, 18, 1.2);
  const pos = 20 + d; // roll through two full turns
  const y = -size * 1.1 * pos * p;
  return (
    <div style={{height: size * 1.1, overflow: 'hidden', display: 'inline-block', width: size * 0.66}}>
      <div style={{transform: `translateY(${y}px)`}}>
        {Array.from({length: 31}).map((_, i) => (
          <div key={i} style={{height: size * 1.1, lineHeight: `${size * 1.1}px`, textAlign: 'center'}}>{i % 10}</div>
        ))}
      </div>
    </div>
  );
};

const Beat3: React.FC<{t: number}> = ({t}) => {
  const t0 = W(3, '2027') - 0.05;
  const cool = sp(t, W(3, 'really') - 0.05, 10, 0.6);
  return (
    <>
      <Big top={370} size={88} style={{letterSpacing: 10, opacity: ramp(t, B(3).start, B(3).start + 0.3)}}>DEMO:</Big>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', fontFamily: F, fontWeight: 900, fontSize: 290, color: C.ink, letterSpacing: -6, opacity: ramp(t, t0 - 0.1, t0 + 0.1)}}>
        {[2, 0, 2, 7].map((d, i) => (
          <span key={i} style={{color: i === 3 ? C.saf : C.ink}}><Digit d={d} t={t} t0={t0 + i * 0.12} size={290} /></span>
        ))}
      </div>
      <div style={{position: 'absolute', top: 830, left: 0, right: 0, textAlign: 'center', opacity: clamp(cool * 2), transform: `rotate(-4deg) scale(${0.5 + 0.5 * cool})`}}>
        <span style={{fontFamily: F, fontWeight: 800, fontStyle: 'italic', fontSize: 84, color: C.white, background: C.saf, padding: '6px 34px', borderRadius: 18}}>“really cool”</span>
      </div>
      <Chip top={1100} o={ramp(t, W(3, '2027') + 0.8, W(3, '2027') + 1.1)}>Altman to Fortune · Sept 2026</Chip>
    </>
  );
};

const Icon: React.FC<{kind: 'door' | 'stairs' | 'keys'}> = ({kind}) => (
  <svg viewBox="0 0 160 160" width={190} height={190}>
    <g stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill={C.fill}>
      {kind === 'door' && (<><rect x={42} y={18} width={76} height={128} rx={6} /><circle cx={100} cy={86} r={6} fill={C.saf} stroke="none" /><path d="M24 146 L136 146" /></>)}
      {kind === 'stairs' && (<path d="M18 142 L18 112 L56 112 L56 82 L94 82 L94 52 L132 52 L132 22 M18 142 L142 142 L142 22 L132 22" />)}
      {kind === 'keys' && (<><rect x={14} y={48} width={132} height={70} rx={12} />{[0, 1, 2, 3].map((c) => [0, 1].map((r) => <rect key={`${c}${r}`} x={28 + c * 28} y={60 + r * 22} width={20} height={14} rx={3} fill={r === 1 && c === 1 ? C.saf : C.white} strokeWidth={4} />))}<rect x={44} y={104} width={72} height={8} rx={3} fill={C.ink} stroke="none" /></>)}
    </g>
  </svg>
);

const Beat4: React.FC<{t: number}> = ({t}) => {
  const items: [string, 'door' | 'stairs' | 'keys', string][] = [['DOORS', 'door', 'doors'], ['STAIRS', 'stairs', 'stairs'], ['KEYBOARDS', 'keys', 'keyboards']];
  const shape = sp(t, W(4, 'human') - 0.05, 12, 0.6);
  return (
    <>
      <Big top={340} size={78} style={{opacity: ramp(t, B(4).start, B(4).start + 0.3)}}>
        The world is built for <span style={{color: C.saf}}>humans</span>
      </Big>
      <div style={{position: 'absolute', top: 465, left: 60, right: 60, display: 'flex', justifyContent: 'space-around'}}>
        {items.map(([label, kind, key]) => (
          <div key={key} style={{...pop(t, W(4, key) - 0.05), textAlign: 'center', opacity: clamp(sp(t, W(4, key) - 0.05) * 2) * (1 - 0.55 * ramp(t, W(4, 'so'), W(4, 'so') + 0.4))}}>
            <Icon kind={kind} />
            <div style={{fontFamily: F, fontWeight: 800, fontSize: 32, letterSpacing: 3, color: C.ink}}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 1085, left: 0, right: 0, textAlign: 'center', opacity: clamp(shape * 2), transform: `scale(${0.6 + 0.4 * shape})`}}>
        <span style={{fontFamily: F, fontWeight: 900, fontSize: 64, color: C.saf}}>→ human shape</span>
      </div>
    </>
  );
};

const Beat5: React.FC<{t: number}> = ({t}) => {
  const body = sp(t, W(5, 'body') - 0.05, 12, 0.6);
  const brain = sp(t, W(5, 'brain') - 0.08, 8, 0.7);
  const missed = ramp(t, B(5).start, B(5).start + 0.25) * (1 - ramp(t, W(5, 'altman') - 0.2, W(5, 'altman')));
  return (
    <>
      <Big top={380} size={70} style={{opacity: missed}}>The part most people <span style={{color: C.saf}}>missed</span></Big>
      <div style={{position: 'absolute', top: 360, left: 70, opacity: clamp(body * 2), transform: `translateX(${(1 - body) * -60}px)`}}>
        <div style={{fontFamily: F, fontWeight: 900, fontSize: 84, color: C.ink, lineHeight: 1}}>Body</div>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 64, color: C.mute}}>= easy</div>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: clamp(body * 2)}}>
        <path d="M270 520 Q 380 560 440 660" stroke={C.mute} strokeWidth={5} fill="none" strokeDasharray="10 12" />
      </svg>
      <div style={{position: 'absolute', top: 360, right: 70, textAlign: 'right', opacity: clamp(brain * 2), transform: `scale(${0.5 + 0.5 * brain})`, transformOrigin: 'right top'}}>
        <div style={{fontFamily: F, fontWeight: 900, fontSize: 110, color: C.saf, lineHeight: 1}}>Brain</div>
        <div style={{fontFamily: F, fontWeight: 900, fontSize: 84, color: C.ink}}>= HARD</div>
      </div>
    </>
  );
};

const Clock: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const a = Math.max(0, t - t0) * 300;
  return (
    <svg viewBox="-110 -110 220 220" width={250} height={250}>
      <circle r={96} fill={C.white} stroke={C.ink} strokeWidth={9} />
      {Array.from({length: 12}).map((_, i) => (
        <line key={i} x1={0} y1={-80} x2={0} y2={i % 3 === 0 ? -64 : -72} stroke={C.ink} strokeWidth={i % 3 === 0 ? 7 : 4} transform={`rotate(${i * 30})`} strokeLinecap="round" />
      ))}
      <path d={`M0 0 L0 -80 A80 80 0 ${(a % 360) > 180 ? 1 : 0} 1 ${80 * Math.sin((a % 360) * Math.PI / 180)} ${-80 * Math.cos((a % 360) * Math.PI / 180)} Z`} fill={C.saf} opacity={0.25} />
      <line x1={0} y1={0} x2={0} y2={-74} stroke={C.saf} strokeWidth={8} strokeLinecap="round" transform={`rotate(${a})`} />
      <circle r={9} fill={C.ink} />
    </svg>
  );
};

const MiniBot: React.FC<{p: number}> = ({p}) => (
  <div style={{width: 64, height: 128, opacity: clamp(p * 2), transform: `translateY(${(1 - p) * 40}px) scale(${0.6 + 0.4 * p})`}}>
    <svg viewBox="0 0 200 400" width={64} height={128}>
      <g stroke={C.ink} strokeWidth={14} strokeLinecap="round" fill={C.fill}>
        <path d="M82 232 L72 360 M118 232 L128 360 M62 128 L36 214 M138 128 L164 214" fill="none" />
        <rect x={60} y={108} width={80} height={128} rx={22} />
        <circle cx={100} cy={58} r={40} />
      </g>
      <rect x={74} y={46} width={52} height={20} rx={10} fill={C.saf} />
    </svg>
  </div>
);

const Beat6: React.FC<{t: number}> = ({t}) => {
  const t0 = W(6, 'one');
  const n = 21;
  const step = (B(6).end - t0) / n;
  const plan = ramp(t, B(6).start, B(6).start + 0.3) * (1 - ramp(t, W(6, 'china') - 0.25, W(6, 'china')));
  return (
    <>
      <Big top={420} size={84} style={{opacity: plan}}>OpenAI: <span style={{color: C.mute}}>still planning…</span></Big>
      <div style={{position: 'absolute', top: 350, left: 80, right: 80, display: 'flex', alignItems: 'center', gap: 30, opacity: ramp(t, W(6, 'china') - 0.15, W(6, 'china') + 0.15)}}>
        <Clock t={t} t0={t0} />
        <div style={{fontFamily: F, fontWeight: 900, color: C.ink, lineHeight: 1}}>
          <div style={{fontSize: 74, color: C.saf}}>China:</div>
          <div style={{fontSize: 66}}>1 robot</div>
          <div style={{fontSize: 66}}>every <span style={{color: C.saf}}>~10 min</span></div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 690, left: 120, right: 120, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 18px'}}>
        {Array.from({length: n}).map((_, i) => <MiniBot key={i} p={sp(t, t0 + i * step, 12, 0.5)} />)}
      </div>
      <Chip top={1100} o={ramp(t, t0, t0 + 0.4)}>UBTECH, Liuzhou · stated pace at full capacity</Chip>
    </>
  );
};

const Beat7: React.FC<{t: number}> = ({t}) => {
  const eq = (k: string) => pop(t, W(7, k) - 0.05);
  const race = sp(t, W(7, 'first') - 0.05, 9, 0.7);
  const vsOut = ramp(t, W(7, 'it\'s') - 0.3, W(7, 'it\'s'));
  return (
    <>
      <Big top={380} size={76} style={{opacity: ramp(t, B(7).start, B(7).start + 0.3) * (1 - vsOut), textDecoration: t > W(7, 'anymore') ? `line-through ${C.saf} 8px` : 'none'}}>AI vs robots</Big>
      <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 100, color: C.ink, lineHeight: 1.05}}>
        <span style={{...eq('brain'), color: C.saf}}>Brain</span>{' '}
        <span style={eq('body')}>+ Body</span>
        <div style={{opacity: clamp(race * 2), transform: `scale(${0.6 + 0.4 * race})`, fontSize: 72, marginTop: 14}}>= the <span style={{color: C.saf}}>real race</span></div>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={80} y1={1112} x2={1000} y2={1112} stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={ramp(t, B(7).start, B(7).start + 0.4)} />
        <g opacity={ramp(t, W(7, 'puts'), W(7, 'puts') + 0.3)}>
          <line x1={930} y1={1112} x2={930} y2={890} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <path d={`M930 890 L1010 ${905 + 6 * Math.sin(t * 8)} L930 940 Z`} fill={C.saf} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        </g>
      </svg>
    </>
  );
};

const Beat8: React.FC<{t: number}> = ({t}) => {
  const house = eOut(ramp(t, B(8).start, B(8).start + 0.9));
  const yes = sp(t, W(8, 'yes') - 0.05, 8, 0.6);
  const no = sp(t, W(8, 'no') - 0.05, 8, 0.6);
  const btn = (txt: string, p: number, bg: string, fg: string): React.ReactNode => (
    <div style={{opacity: clamp(p * 2), transform: `scale(${0.4 + 0.6 * p}) translateY(${Math.sin(t * 5) * 4 * p}px)`, fontFamily: F, fontWeight: 900, fontSize: 70, color: fg, background: bg, border: `6px solid ${C.ink}`, borderRadius: 26, padding: '10px 54px'}}>{txt}</div>
  );
  return (
    <>
      <Big top={340} size={82} style={{opacity: ramp(t, B(8).start, B(8).start + 0.25)}}>A robot in your <span style={{color: C.saf}}>home?</span></Big>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M330 1000 L330 720 L540 560 L750 720 L750 1000 Z" fill="none" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={1500} strokeDashoffset={1500 * (1 - house)} />
      </svg>
      <div style={{position: 'absolute', top: 1035, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60}}>
        {btn('YES', yes, C.saf, C.white)}
        {btn('NO', no, C.white, C.ink)}
      </div>
    </>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const s = tl.endCard;
  if (t < s - 0.15) return null;
  const p = sp(t, s, 12, 0.8);
  const o = ramp(t, s - 0.15, s + 0.2);
  return (
    <AbsoluteFill style={{opacity: o, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: `radial-gradient(60% 40% at 50% 42%, rgba(255,196,107,${0.35 * p}) 0%, rgba(245,236,221,0) 70%)`}}>
      <Img src={staticFile('logo.png')} style={{width: 230, height: 230, transform: `scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -40}deg)`, marginTop: -160}} />
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 104, letterSpacing: 18, color: C.ink, marginTop: 26, opacity: clamp(p * 1.5)}}>OMNIX</div>
      <div style={{fontFamily: F, fontWeight: 500, fontSize: 36, letterSpacing: 6, color: C.mute, marginTop: 4, opacity: ramp(t, s + 0.3, s + 0.6)}}>BEYOND IMAGINATION</div>
      <div style={{fontFamily: F, fontWeight: 700, fontSize: 42, color: C.saf, marginTop: 60, opacity: ramp(t, s + 0.6, s + 0.9)}}>The brain is the race. The build is on.</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film
export const Brief: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Background t={t} />
      <Header t={t} />
      <Hero t={t} from={0} to={NEXT(1)} first>{() => <Beat1 t={t} />}</Hero>
      <Hero t={t} from={B(2).start - 0.15} to={NEXT(2)}>{() => <Beat2 t={t} />}</Hero>
      <Hero t={t} from={B(3).start - 0.15} to={NEXT(3)}>{() => <Beat3 t={t} />}</Hero>
      <Hero t={t} from={B(4).start - 0.15} to={NEXT(4)}>{() => <Beat4 t={t} />}</Hero>
      <Hero t={t} from={B(5).start - 0.15} to={NEXT(5)}>{() => <Beat5 t={t} />}</Hero>
      <Hero t={t} from={B(6).start - 0.15} to={NEXT(6)}>{() => <Beat6 t={t} />}</Hero>
      <Hero t={t} from={B(7).start - 0.15} to={NEXT(7)}>{() => <Beat7 t={t} />}</Hero>
      <Hero t={t} from={B(8).start - 0.15} to={NEXT(8)}>{() => <Beat8 t={t} />}</Hero>
      <FigureLayer t={t} />
      {t < tl.endCard && <Captions t={t} />}
      <EndCard t={t} />
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
    <Background t={4} />
    <CoverLabel label="THE BRIEF" />
    <div style={{position: 'absolute', top: 410, left: 50, right: 50, textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 118, lineHeight: 1.0, color: '#1F1A15', letterSpacing: -3}}>ChatGPT is getting a <span style={{color: C.saf}}>BODY</span></div>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <g transform="translate(250 900)">
        <rect x={-120} y={-80} width={240} height={160} rx={56} fill={C.white} stroke={C.ink} strokeWidth={12} />
        <path d="M-50 76 L-74 124 L-6 80" fill={C.white} stroke={C.ink} strokeWidth={12} strokeLinejoin="round" />
        {[-56, 0, 56].map((x, i) => <circle key={i} cx={x} cy={0} r={18} fill={i === 1 ? C.saf : C.ink} />)}
      </g>
      <path d="M420 900 H520" stroke={C.saf} strokeWidth={14} strokeLinecap="round" />
      <path d="M500 870 L540 900 L500 930" fill="none" stroke={C.saf} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{position: 'absolute', left: 620, top: 700, width: 200, height: 400, transform: 'scale(1.45)', transformOrigin: 'top left'}}><Figure glow={1} /></div>
    <CoverChips top={1420} items={['OpenAI', 'Demo: 2027', 'Brain > body']} />
  </AbsoluteFill>
);
