import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, delayRender, continueRender} from 'remotion';
import {loadFont} from '@remotion/fonts';
import tl from './timeline.json';

const fontHandle = delayRender('fonts');
Promise.all([
  loadFont({family: 'Montserrat', url: staticFile('Montserrat.ttf'), weight: '100 900'}),
  loadFont({family: 'JBMono', url: staticFile('JetBrainsMono.ttf'), weight: '100 800'}),
]).then(() => continueRender(fontHandle));

const F = 'Montserrat', M = 'JBMono';
export const TOTAL = tl.total;
const FPS = 30, N = Math.round(TOTAL * FPS), HOLD = 8;

const C = {paper: '#F5ECDD', page: '#FFFBF4', ink: '#1F1A15', saf: '#F08A12', saf2: '#FFC46B', safDeep: '#C9650A', mute: '#8C8073',
  line: '#DCCDB5', tan: '#E9D5B5', news: '#EDE6D8', red: '#E5532B', sage: '#5E8A55', white: '#FFFFFF'};

// ---------------------------------------------------------------- helpers
const cl = (x: number) => Math.min(1, Math.max(0, x));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const back = (x: number) => {const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);};
const E = (t: number, a: number, b: number) => eio(seg(t, a, b));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const hash = (n: number) => {const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x);};
const norm = (w: string) => w.toLowerCase().replace(/[“”".,:?!]/g, '');
const W = (b: number, word: string, n = 1) => {
  let c = 0;
  for (const w of tl.beats[b - 1].words) if (norm(w.w) === word && ++c === n) return w.s;
  throw new Error('word ' + word);
};

// stop-motion boil: a new pose ten times a second
const boil = (t: number, seed: number, amp = 1) => {
  const k = Math.floor(t * 10);
  return `translate(${(hash(k * 3.1 + seed) - 0.5) * 4 * amp}px, ${(hash(k * 5.7 + seed * 2.3) - 0.5) * 4 * amp}px) rotate(${(hash(k * 7.3 + seed * 1.7) - 0.5) * 1.2 * amp}deg)`;
};
// slap-in: lands from slightly bigger with a tiny overshoot
const slap = (t: number, at: number) => {
  const p = seg(t, at - 0.02, at + 0.22);
  return {o: cl(p * 4), s: p <= 0 ? 1.35 : lerp(1.35, 1, back(p))};
};
// torn edge polygon for clip-path (in px)
const torn = (w: number, h: number, seed: number, amp = 9, step = 22) => {
  const pts: string[] = [];
  const j = (i: number) => (hash(seed * 13.7 + i) - 0.5) * 2 * amp;
  let i = 0;
  for (let x = 0; x <= w; x += step) pts.push(`${x}px ${Math.max(0, amp + j(i++))}px`);
  for (let y = step; y <= h; y += step) pts.push(`${w - Math.max(0, amp + j(i++))}px ${y}px`);
  for (let x = w; x >= 0; x -= step) pts.push(`${x}px ${h - Math.max(0, amp + j(i++))}px`);
  for (let y = h; y >= step; y -= step) pts.push(`${Math.max(0, amp + j(i++))}px ${y}px`);
  return `polygon(${pts.join(',')})`;
};
const halftone = (dot: string, base: string, size = 14, r = 32) => `radial-gradient(circle, ${dot} ${r}%, transparent ${r + 2}%) 0 0 / ${size}px ${size}px, ${base}`;

// ---------------------------------------------------------------- paper parts
const Paper: React.FC<{x: number; y: number; w: number; h: number; seed: number; bg?: string; rot?: number; t?: number; shadow?: boolean; children?: React.ReactNode; style?: React.CSSProperties}> =
  ({x, y, w, h, seed, bg = C.page, rot = 0, t = 0, shadow = true, children, style}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) ${boil(t, seed, 0.6)}`, filter: shadow ? 'drop-shadow(6px 8px 0 rgba(31,26,21,0.22))' : undefined, ...style}}>
      <div style={{position: 'absolute', inset: 0, background: bg, clipPath: torn(w, h, seed)}}>{children}</div>
    </div>
  );

const Tape: React.FC<{x: number; y: number; w?: number; rot?: number; seed?: number; o?: number}> = ({x, y, w = 170, rot = 0, seed = 1, o = 1}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - 24, width: w, height: 48, transform: `rotate(${rot}deg)`, opacity: o}}>
    <div style={{position: 'absolute', inset: 0, background: 'rgba(255,196,107,0.78)', clipPath: torn(w, 48, seed, 5, 8)}} />
  </div>
);

const Sticker: React.FC<{x: number; y: number; rot?: number; bg?: string; color?: string; size?: number; children: React.ReactNode; s?: number; o?: number; round?: boolean; t?: number; seed?: number}> =
  ({x, y, rot = 0, bg = C.saf, color = C.ink, size = 44, children, s = 1, o = 1, round = false, t = 0, seed = 3}) => (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s}) ${boil(t, seed, 0.5)}`, opacity: o,
      background: bg, color, fontFamily: F, fontWeight: 900, fontSize: size, lineHeight: 1.05, padding: round ? 0 : '12px 24px', borderRadius: round ? '50%' : 18,
      border: `8px solid ${C.white}`, boxShadow: `0 0 0 4px ${C.ink}, 6px 8px 0 4px rgba(31,26,21,0.25)`, whiteSpace: 'nowrap', textAlign: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center', ...(round ? {width: size * 4.2, height: size * 4.2, flexDirection: 'column' as const} : {})}}>{children}</div>
  );

// faceless, generic pop-star silhouette (no likeness): pose 0 mic up, 1 standing, 2 phone, 3 hand on hip
const Figure: React.FC<{x: number; y: number; h: number; pose?: number; tone?: string; dot?: string; t?: number; seed?: number; o?: number; s?: number; rot?: number}> =
  ({x, y, h, pose = 1, tone = C.saf2, dot = C.saf, t = 0, seed = 5, o = 1, s = 1, rot = 0}) => {
    const id = `ht${seed}`;
    const w = h * 0.55;
    return (
      <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, height: h, opacity: o, transform: `scale(${s}) rotate(${rot}deg) ${boil(t, seed)}`, transformOrigin: '50% 100%',
        filter: 'drop-shadow(5px 7px 0 rgba(31,26,21,0.22))'}}>
        <svg viewBox="0 0 220 400" width={w} height={h} style={{overflow: 'visible'}}>
          <defs>
            <pattern id={id} width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill={tone} /><circle cx="4.5" cy="4.5" r="2.3" fill={dot} /></pattern>
          </defs>
          <g fill={`url(#${id})`} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
            {/* hair */}
            <path d="M58 74 Q56 14 110 10 Q164 14 162 74 L176 170 Q158 186 144 150 L76 150 Q62 186 44 170 Z" />
            {/* arms */}
            {pose === 0 && <path d="M150 150 Q190 120 186 64 L172 60 Q168 108 138 132 Z" />}
            {pose === 0 && <path d="M178 46 l16 -6 l4 18 l-16 6 z" fill={C.ink} />}
            {pose === 2 && <path d="M148 150 Q178 182 150 214 L138 206 Q156 182 136 162 Z" />}
            {pose === 2 && <rect x="132" y="186" width="30" height="48" rx="6" fill={C.ink} />}
            {pose === 3 && <path d="M150 150 Q190 190 160 230 L148 222 Q168 196 140 168 Z" />}
            {pose !== 0 && pose !== 2 && pose !== 3 && <path d="M150 150 Q168 210 160 262 L146 260 Q150 214 138 172 Z" />}
            <path d="M70 150 Q52 210 60 262 L74 260 Q70 214 82 172 Z" />
            {/* body: top + skirt */}
            <path d="M74 134 Q110 120 146 134 L152 236 Q110 248 68 236 Z" />
            <path d="M68 232 Q110 248 152 232 L186 330 Q110 352 34 330 Z" />
            {/* legs */}
            <path d="M84 334 L86 396 L102 396 L104 338 Z" fill={C.ink} />
            <path d="M118 338 L120 396 L136 396 L136 334 Z" fill={C.ink} />
            {/* faceless head */}
            <ellipse cx="110" cy="80" rx="33" ry="41" fill={C.page} />
          </g>
        </svg>
      </div>
    );
  };

const Plain: React.FC<{x: number; y: number; h: number; fill: string; t: number; seed: number; o?: number; robot?: boolean}> = ({x, y, h, fill, t, seed, o = 1, robot}) => {
  const w = h * 0.5;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, height: h, opacity: o, transform: boil(t, seed), filter: 'drop-shadow(5px 7px 0 rgba(31,26,21,0.22))'}}>
      <svg viewBox="0 0 200 400" width={w} height={h}>
        <g fill={fill} stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
          {robot ? <rect x="58" y="22" width="84" height="92" rx="20" /> : <circle cx="100" cy="68" r="46" />}
          {robot && <line x1="100" y1="22" x2="100" y2="2" />}
          {robot && <circle cx="100" cy="0" r="7" fill={C.ink} />}
          <path d="M44 130 Q100 112 156 130 L166 300 Q100 316 34 300 Z" />
          <path d="M64 300 L70 396 L96 396 L98 304 Z M104 304 L106 396 L132 396 L136 300 Z" fill={C.ink} />
        </g>
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------- the cover (frame 0 = last frame)
const Cover: React.FC<{t: number; curl: number}> = ({t, curl}) => (
  <AbsoluteFill>
    <Paper x={46} y={220} w={988} h={1500} seed={11} rot={-1.2} t={t} bg={C.page}>
      <div style={{position: 'absolute', inset: 0, background: halftone('rgba(240,138,18,0.10)', 'transparent', 22, 26)}} />
      <div style={{position: 'absolute', left: 290, top: 470, width: 560, height: 560, borderRadius: '50%', background: halftone(C.saf2, C.page, 18, 30), opacity: 0.9}} />
      <div style={{position: 'absolute', right: 60, top: 1400, fontFamily: M, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: C.mute}}>POP ZINE · ISSUE 01</div>
      {/* page curl on the bottom-right corner */}
      {curl > 0 && <div style={{position: 'absolute', right: 0, bottom: 0, width: 260 * curl, height: 260 * curl, background: `linear-gradient(135deg, ${C.paper} 49%, #E6D9C3 50%, #FFFFFF 100%)`, boxShadow: '-10px -10px 24px rgba(31,26,21,0.18)'}} />}
    </Paper>
    <Figure x={500} y={660} h={940} pose={0} t={t} seed={21} />
    <Tape x={110} y={250} rot={-38} seed={2} />
    <Tape x={975} y={250} rot={38} seed={3} />
    <Tape x={120} y={1690} rot={36} seed={4} />
    <Tape x={960} y={1690} rot={-36} seed={5} />
    <div style={{position: 'absolute', left: 64, top: 296, width: 900}}>
      <div style={{fontFamily: F, fontWeight: 900, fontSize: 106, lineHeight: 1, letterSpacing: -3, color: C.ink, whiteSpace: 'nowrap'}}>THIS POP STAR</div>
      <div style={{position: 'relative', display: 'inline-block', marginTop: 14}}>
        <div style={{position: 'absolute', left: -14, top: 12, width: 900, height: 150, background: C.saf2, clipPath: torn(900, 150, 7, 6, 14), transform: 'rotate(-1deg)'}} />
        <div style={{position: 'relative', fontFamily: F, fontWeight: 900, fontSize: 150, lineHeight: 1.02, letterSpacing: -5, color: C.ink, whiteSpace: 'nowrap'}}>ISN’T REAL</div>
      </div>
    </div>
    <Sticker x={800} y={930} rot={12} round size={64} t={t} seed={8}><div style={{fontSize: 86, letterSpacing: -3}}>75M+</div><div style={{fontSize: 38}}>VIEWS</div></Sticker>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- scenes
type SceneFn = React.FC<{t: number; lt: number}>;
const Cap: React.FC<{t: number; items: {w: string; at: number; hi?: boolean}[]; y?: number; size?: number; until?: number}> = ({t, items, y = 300, size = 74, until = 1e9}) => (
  <div style={{position: 'absolute', left: 60, top: y, width: 880, display: 'flex', flexWrap: 'wrap', gap: '10px 16px', opacity: 1 - seg(t, until, until + 0.2)}}>
    {items.map((it, i) => {
      const s = slap(t, it.at);
      return (
        <span key={i} style={{display: 'inline-block', opacity: s.o, transform: `scale(${s.s}) rotate(${(hash(i * 3 + it.at) - 0.5) * 4}deg) ${boil(t, i + it.at * 10, 0.5)}`, background: it.hi ? C.saf2 : C.page,
          fontFamily: F, fontWeight: 900, fontSize: size, lineHeight: 1.08, letterSpacing: -2, color: C.ink, padding: '4px 16px', boxShadow: `3px 4px 0 ${C.ink}`, border: `3px solid ${C.ink}`, whiteSpace: 'nowrap'}}>{it.w}</span>
      );
    })}
  </div>
);

const Phone: SceneFn = ({t}) => {
  const typing = t > W(1, 'told') && t < W(1, 'pregnant');
  const b = slap(t, W(1, 'pregnant'));
  return (
    <AbsoluteFill>
      <Paper x={40} y={560} w={1000} h={190} seed={31} rot={2} t={t} bg={halftone('rgba(31,26,21,0.08)', C.news, 10, 26)}>
        <div style={{position: 'absolute', left: 40, top: 30, right: 40, fontFamily: M, fontSize: 30, lineHeight: 1.5, color: '#8b8172'}}>
          {['— — —— — ——— — — ———— —', '——— — —— ——— — —— — ——'].map((x, i) => <div key={i}>{x}</div>)}
        </div>
      </Paper>
      <Figure x={330} y={760} h={760} pose={2} t={t} seed={33} />
      <Paper x={520} y={800} w={420} h={230} seed={35} rot={-4} t={t} bg={C.page}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontWeight: 900, fontSize: 50, color: C.ink, letterSpacing: -1, whiteSpace: 'nowrap'}}>
          {typing ? <span style={{letterSpacing: 10}}>{'•'.repeat(1 + (Math.floor(t * 4) % 3))}</span> : <span style={{opacity: b.o, transform: `scale(${b.s})`, display: 'inline-block'}}>“I’M PREGNANT”</span>}
        </div>
      </Paper>
      <svg style={{position: 'absolute', left: 500, top: 990}} width={80} height={80}><path d="M40 0 L10 70 L70 20 Z" fill={C.page} stroke={C.ink} strokeWidth={4} /></svg>
      <Tape x={730} y={800} rot={-8} seed={37} />
      <Cap t={t} items={[{w: 'LAST WEEK,', at: W(1, 'last')}, {w: 'SHE TOLD', at: W(1, 'told')}, {w: 'THE INTERNET', at: W(1, 'internet'), hi: true}]} />
    </AbsoluteFill>
  );
};

const Name: SceneFn = ({t}) => {
  const L = 'BABYQUEEN'.split('');
  const t0 = W(2, 'babyqueen');
  return (
    <AbsoluteFill>
      <Cap t={t} items={[{w: 'HER GROUP:', at: W(2, 'group')}]} />
      {L.map((ch, i) => {
        const s = slap(t, t0 - 0.12 + i * 0.07);
        const bg = [C.page, C.saf2, C.news, C.ink, C.saf][i % 5];
        return (
          <div key={i} style={{position: 'absolute', left: 74 + i * 98, top: 820 + (hash(i) - 0.5) * 60, width: 92, height: 140, opacity: s.o, transform: `scale(${s.s}) rotate(${(hash(i + 9) - 0.5) * 16}deg) ${boil(t, i + 40)}`}}>
            <div style={{position: 'absolute', inset: 0, background: bg, clipPath: torn(92, 140, i + 50, 5, 10), display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: i % 2 ? M : F, fontWeight: 900, fontSize: i % 2 ? 92 : 104, color: bg === C.ink ? C.page : C.ink}}>{ch}</div>
          </div>
        );
      })}
      <Sticker x={540} y={1120} rot={-3} bg={C.page} size={40} t={t} seed={44} o={E(t, t0 + 0.6, t0 + 0.8)}>AN AI GIRL GROUP</Sticker>
    </AbsoluteFill>
  );
};

const Members: SceneFn = ({t}) => {
  const xs = [150, 320, 490, 660, 830];
  const at = [W(2, 'five'), W(2, 'five') + 0.3, W(2, 'members'), W(2, 'members') + 0.3, W(2, 'all')];
  return (
    <AbsoluteFill>
      <Paper x={30} y={600} w={1020} h={900} seed={61} rot={-1} t={t} bg={halftone('rgba(240,138,18,0.12)', C.page, 20, 28)} />
      {xs.map((x, i) => {
        const s = slap(t, at[i]);
        const st = slap(t, W(2, 'made') + i * 0.08);
        return (
          <React.Fragment key={i}>
            <Figure x={x} y={760 + (i % 2) * 70} h={600} pose={[0, 3, 1, 2, 3][i]} t={t} seed={70 + i} o={s.o} s={s.s} tone={i === 4 ? C.saf2 : [C.saf2, '#F6D9A8', C.tan, '#F3C98B', C.saf2][i]} />
            <Sticker x={x} y={740 + (i % 2) * 70} rot={(hash(i) - 0.5) * 20} bg={C.ink} color={C.page} size={28} s={st.s} o={st.o} t={t} seed={80 + i}>AI-MADE</Sticker>
          </React.Fragment>
        );
      })}
      <Cap t={t} items={[{w: 'FIVE MEMBERS,', at: W(2, 'five')}, {w: 'ALL', at: W(2, 'all')}, {w: 'AI', at: W(2, 'ai'), hi: true}]} />
    </AbsoluteFill>
  );
};

const MapScene: SceneFn = ({t}) => {
  const pin = seg(t, W(2, 'from') - 0.1, W(2, 'from') + 0.25);
  const lab = slap(t, W(2, 'northeast'));
  return (
    <AbsoluteFill>
      <Paper x={110} y={560} w={860} h={760} seed={91} rot={2.5} t={t} bg={C.news}>
        <svg width={860} height={760} style={{position: 'absolute'}}>
          {Array.from({length: 9}).map((_, i) => <line key={i} x1={0} y1={i * 90} x2={860} y2={i * 90} stroke={C.line} strokeWidth={3} />)}
          {Array.from({length: 10}).map((_, i) => <line key={'v' + i} x1={i * 90} y1={0} x2={i * 90} y2={760} stroke={C.line} strokeWidth={3} />)}
          <path d="M60 620 C 220 520, 260 640, 420 560 S 680 420, 820 470" stroke="#B9C9C2" strokeWidth={16} fill="none" strokeLinecap="round" />
          <path d="M120 300 C 260 260, 380 340, 520 260 S 700 160, 800 200" stroke="#B9C9C2" strokeWidth={10} fill="none" strokeLinecap="round" />
          <g transform="translate(150 150)" stroke={C.ink} strokeWidth={4}>
            <circle r={62} fill={C.page} />
            <path d="M0 -54 L12 0 L0 54 L-12 0 Z" fill={C.saf} />
            <text y={-70} textAnchor="middle" fontFamily={M} fontWeight={800} fontSize={30} fill={C.ink} stroke="none">N</text>
          </g>
        </svg>
      </Paper>
      <svg style={{position: 'absolute', left: 690, top: 640 - (1 - eo(pin)) * 300, opacity: cl(pin * 3), overflow: 'visible'}} width={10} height={10}>
        <ellipse cx={0} cy={98} rx={26 * pin} ry={9 * pin} fill="rgba(31,26,21,0.25)" />
        <path d="M0 96 L-34 30 A40 40 0 1 1 34 30 Z" fill={C.saf} stroke={C.ink} strokeWidth={6} />
        <circle cx={0} cy={-2} r={14} fill={C.page} stroke={C.ink} strokeWidth={5} />
      </svg>
      <Sticker x={600} y={860} rot={-4} bg={C.page} size={46} s={lab.s} o={lab.o} t={t} seed={95}>NORTHEAST CHINA</Sticker>
      <Cap t={t} items={[{w: 'RUN FROM', at: W(2, 'run')}, {w: 'CHINA', at: W(2, 'china'), hi: true}]} />
    </AbsoluteFill>
  );
};

const DotGrid: React.FC<{x: number; y: number; fill: number; scatter?: number; t: number}> = ({x, y, fill, scatter = 0, t}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 480, height: 300}}>
    {Array.from({length: 1000}).map((_, i) => {
      if (i / 1000 > fill) return null;
      const cx = (i % 40) * 12, cy = Math.floor(i / 40) * 12;
      const a = hash(i) * Math.PI * 2, d = scatter * (300 + hash(i + 7) * 900);
      return <div key={i} style={{position: 'absolute', left: cx + Math.cos(a) * d, top: cy + Math.sin(a) * d - scatter * 200, width: 8, height: 8, borderRadius: 4, background: i % 9 === 0 ? C.saf : C.ink, opacity: 1 - scatter * 0.6}} />;
    })}
  </div>
);

const Followers: SceneFn = ({t}) => {
  const p = E(t, W(2, 'about') - 0.2, W(2, 'thousand') + 0.3);
  const v = Math.round(1000 * p);
  return (
    <AbsoluteFill>
      <Paper x={250} y={620} w={580} h={400} seed={101} rot={-2} t={t} bg={C.page}>
        <DotGrid x={50} y={50} fill={p} t={t} />
      </Paper>
      <Tape x={540} y={625} rot={3} seed={103} />
      <div style={{position: 'absolute', left: 60, width: 880, top: 1080, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 170, letterSpacing: -6, color: C.ink, transform: boil(t, 105)}}>
        ~{v.toLocaleString('en-US')}
      </div>
      <Cap t={t} items={[{w: 'ABOUT', at: W(2, 'about')}, {w: '1,000', at: W(2, 'thousand'), hi: true}, {w: 'FOLLOWERS', at: W(2, 'followers')}]} />
    </AbsoluteFill>
  );
};

const PostCard: React.FC<{t: number; hi: number; hi2: number}> = ({t, hi, hi2}) => (
  <Paper x={90} y={600} w={900} h={560} seed={121} rot={-1.5} t={t} bg={C.page}>
    <div style={{position: 'absolute', left: 50, top: 50, display: 'flex', alignItems: 'center', gap: 24}}>
      <div style={{width: 110, height: 110, borderRadius: '50%', background: halftone(C.saf, C.saf2, 9, 30), border: `5px solid ${C.ink}`, position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 30, top: 18, width: 50, height: 60, borderRadius: '50%', background: C.page, border: `4px solid ${C.ink}`}} />
      </div>
      <div>
        <div style={{fontFamily: F, fontWeight: 900, fontSize: 52, color: C.ink}}>Mity</div>
        <div style={{fontFamily: M, fontWeight: 700, fontSize: 28, color: C.mute}}>AI member · BABYQUEEN</div>
      </div>
    </div>
    <div style={{position: 'absolute', left: 50, top: 210, right: 50, fontFamily: F, fontWeight: 800, fontSize: 64, lineHeight: 1.2, color: C.ink}}>
      <span style={{position: 'relative'}}>“I’m pregnant.”
        <span style={{position: 'absolute', left: 0, bottom: -4, height: 14, width: `${hi * 100}%`, background: C.saf, borderRadius: 7}} /></span><br />
      <span style={{position: 'relative'}}>Stepping away.
        <span style={{position: 'absolute', left: 0, bottom: -4, height: 14, width: `${hi2 * 100}%`, background: C.saf, borderRadius: 7}} /></span>
    </div>
    <div style={{position: 'absolute', left: 50, bottom: 40, display: 'flex', gap: 40, fontFamily: M, fontWeight: 700, fontSize: 30, color: C.mute}}><span>♡ ···</span><span>↻ ···</span><span>✎ ···</span></div>
  </Paper>
);

const Post: SceneFn = ({t}) => {
  const s = slap(t, W(3, 'post') + 0.1);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: s.o, transform: `scale(${s.s})`}}><PostCard t={t} hi={0} hi2={0} /></div>
      <Sticker x={820} y={600} rot={10} bg={C.saf} size={42} t={t} seed={125} o={E(t, W(3, 'said'), W(3, 'said') + 0.15)}>NEW POST</Sticker>
      <Cap t={t} items={[{w: 'A POST SAID', at: W(3, 'post')}, {w: 'ONE MEMBER…', at: W(3, 'one'), hi: true}]} />
    </AbsoluteFill>
  );
};

const Away: SceneFn = ({t}) => {
  const leave = E(t, W(3, 'stepping'), W(3, 'away') + 0.4);
  const xs = [190, 340, 490, 640, 790];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: 'translateY(-120px) scale(0.92)', transformOrigin: '50% 30%'}}>
        <PostCard t={t} hi={E(t, W(3, 'pregnant'), W(3, 'pregnant') + 0.35)} hi2={E(t, W(3, 'stepping'), W(3, 'away') + 0.2)} />
      </div>
      {xs.map((x, i) => <Figure key={i} x={x + (i === 4 ? leave * 420 : 0)} y={1110} h={330} pose={[0, 3, 1, 2, 1][i]} t={t} seed={130 + i} rot={i === 4 ? leave * 14 : 0} o={i === 4 ? 1 - seg(leave, 0.7, 1) : 1} />)}
      <Cap t={t} items={[{w: 'PREGNANT,', at: W(3, 'pregnant')}, {w: 'STEPPING AWAY', at: W(3, 'stepping'), hi: true}]} />
    </AbsoluteFill>
  );
};

const Wave: SceneFn = ({t, lt}) => {
  const burst = E(t, 17.5, 18.3);
  const rise = E(t, 17.9, 19.4);
  const v = 75e6 * eo(seg(t, W(3, '75') - 0.05, W(3, 'views')));
  return (
    <AbsoluteFill>
      {burst < 1 && <div style={{position: 'absolute', left: 300, top: 670, transform: `scale(${1 + burst * 0.4})`}}><DotGrid x={0} y={0} fill={1} scatter={burst} t={t} /></div>}
      {[0, 1, 2].map((k) => {
        const amp = 60 - k * 12;
        const top = lerp(1950, 900 + k * 170, rise);
        const pts = Array.from({length: 13}).map((_, i) => {
          const x = i * 100 - 60;
          const y = Math.sin(i * 0.8 + Math.floor(t * 10) / 10 * 3 + k) * amp;
          return `${x}px ${y + 80}px`;
        });
        return (
          <div key={k} style={{position: 'absolute', left: 0, top, width: 1080, height: 1300, filter: 'drop-shadow(0 -6px 0 rgba(31,26,21,0.25))'}}>
            <div style={{position: 'absolute', inset: 0, background: halftone([C.safDeep, C.saf, C.saf2][k], [C.saf, C.saf2, C.page][k], 16, 28),
              clipPath: `polygon(${pts.join(',')}, 1140px 1300px, -60px 1300px)`}} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 40, width: 1000, top: 560, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 128, letterSpacing: -5, color: C.saf,
        WebkitTextStroke: `4px ${C.ink}`, paintOrder: 'stroke', transform: `${boil(t, 141)} scale(${1 + 0.05 * Math.sin(lt * 3)})`, opacity: E(t, 18.2, 18.45)}}>
        {Math.round(v).toLocaleString('en-US')}+
      </div>
      <Cap t={t} items={[{w: '75M+', at: W(3, '75'), hi: true}, {w: 'VIEWS', at: W(3, 'views')}, {w: 'ON WEIBO', at: W(3, 'weibo')}]} />
    </AbsoluteFill>
  );
};

const Anger: React.FC<{x: number; y: number; s: number; o: number; t: number; seed: number; kind: number}> = ({x, y, s, o, t, seed, kind}) => (
  <div style={{position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, opacity: o, transform: `scale(${s}) ${boil(t, seed)}`, filter: 'drop-shadow(4px 6px 0 rgba(31,26,21,0.25))'}}>
    <svg viewBox="0 0 140 140" width={140} height={140}>
      <circle cx={70} cy={70} r={62} fill={C.white} stroke={C.ink} strokeWidth={5} />
      {kind === 0 ? <g stroke={C.red} strokeWidth={16} strokeLinecap="round"><path d="M40 40 L100 100 M100 40 L40 100" /></g>
        : <g fill="none" stroke={C.red} strokeWidth={13} strokeLinecap="round"><path d="M38 58 Q58 58 58 38 M102 58 Q82 58 82 38 M38 82 Q58 82 58 102 M102 82 Q82 82 82 102" /></g>}
    </svg>
  </div>
);
const ANG = [[200, 760], [520, 640], [820, 800], [330, 1050], [700, 1100], [160, 1320], [520, 1360], [860, 1300]];
const Furious: SceneFn = ({t}) => (
  <AbsoluteFill>
    <Paper x={60} y={540} w={960} h={980} seed={151} rot={1} t={t} bg={C.page} />
    <Figure x={540} y={700} h={720} pose={1} t={t} seed={153} tone={C.tan} dot={C.mute} />
    {ANG.map(([x, y], i) => {const s = slap(t, W(4, 'furious') + i * 0.09); return <Anger key={i} x={x} y={y} s={s.s} o={s.o} t={t} seed={160 + i} kind={i % 2} />;})}
    <Cap t={t} items={[{w: 'MANY PEOPLE:', at: W(4, 'many')}, {w: 'FURIOUS', at: W(4, 'furious'), hi: true}]} />
  </AbsoluteFill>
);

const Split: SceneFn = ({t}) => {
  const tear = E(t, 23.0, 23.45);
  const st = seg(t, W(4, 'stunt') - 0.05, W(4, 'stunt') + 0.18);
  const edge = Array.from({length: 40}).map((_, i) => `${520 + (hash(i * 3.3) - 0.5) * 40}px ${i * 50}px`).join(',');
  return (
    <AbsoluteFill>
      {/* left half: the anger, shrunk */}
      <div style={{position: 'absolute', inset: 0, clipPath: `polygon(0 0, ${edge}, 0 1920px)`, transform: `translateX(${-tear * 40}px) rotate(${-tear * 1.5}deg)`}}>
        <div style={{position: 'absolute', inset: 0, background: C.page}} />
        <div style={{position: 'absolute', inset: 0, transform: 'scale(0.62) translate(-180px, 120px)', transformOrigin: '0 50%'}}>
          {ANG.map(([x, y], i) => <Anger key={i} x={x} y={y} s={1.2} o={1} t={t} seed={160 + i} kind={i % 2} />)}
        </div>
        <div style={{position: 'absolute', left: 60, top: 1180, fontFamily: F, fontWeight: 900, fontSize: 64, color: C.red, transform: `rotate(-6deg) ${boil(t, 171)}`}}>FURIOUS</div>
      </div>
      {/* right half: stunt? */}
      <div style={{position: 'absolute', inset: 0, clipPath: `polygon(${edge.replace(/(\d+(?:\.\d+)?)px (\d+)px/g, (_m, a, b) => `${a}px ${b}px`)}, 1080px 1920px, 1080px 0)`, transform: `translateX(${tear * 40}px) rotate(${tear * 1.5}deg)`}}>
        <div style={{position: 'absolute', inset: 0, background: halftone('rgba(240,138,18,0.14)', C.news, 18, 28)}} />
        <div style={{position: 'absolute', left: 560, top: 820, width: 460, height: 230, transform: `rotate(-12deg) scale(${st > 0 ? lerp(2.2, 1, eo(st)) : 2.2})`, opacity: cl(st * 3),
          border: `14px solid ${C.saf}`, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontWeight: 900, fontSize: 104, color: C.saf, letterSpacing: -2}}>STUNT?</div>
      </div>
      <Cap t={t} items={[{w: 'OTHERS:', at: W(4, 'others')}, {w: 'JUST A STUNT?', at: W(4, 'publicity'), hi: true}]} />
    </AbsoluteFill>
  );
};

const Admit: SceneFn = ({t}) => {
  const s = slap(t, W(4, 'admitted'));
  return (
    <AbsoluteFill>
      <Paper x={70} y={720} w={940} h={420} seed={181} rot={-2.5} t={t} bg={halftone('rgba(31,26,21,0.07)', C.news, 10, 26)} style={{opacity: s.o, transform: `rotate(-2.5deg) scale(${s.s})`}}>
        <div style={{position: 'absolute', left: 44, top: 34, fontFamily: M, fontWeight: 800, fontSize: 30, color: C.mute, letterSpacing: 4}}>THE CREATOR, LATER:</div>
        <div style={{position: 'absolute', left: 44, top: 96, right: 44, fontFamily: F, fontWeight: 900, fontSize: 80, lineHeight: 1.05, letterSpacing: -2, color: C.ink}}>“THE WHOLE STORY WAS FICTIONAL”</div>
      </Paper>
      <Tape x={180} y={730} rot={-20} seed={183} />
      <Tape x={900} y={1130} rot={-20} seed={184} />
      <Cap t={t} items={[{w: 'THE CREATOR', at: W(4, 'creator')}, {w: 'ADMITTED IT', at: W(4, 'admitted'), hi: true}]} />
    </AbsoluteFill>
  );
};

const Matters: SceneFn = ({t}) => {
  const a = slap(t, W(5, "here's")), b = slap(t, W(5, 'matters'));
  return (
    <AbsoluteFill>
      <Paper x={70} y={720} w={940} h={220} seed={191} rot={-3} t={t} bg={C.ink} style={{opacity: a.o, transform: `rotate(-3deg) scale(${a.s})`}}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontWeight: 900, fontSize: 120, color: C.page, letterSpacing: -4}}>HERE’S WHY</div>
      </Paper>
      <Paper x={110} y={960} w={860} h={220} seed={193} rot={2} t={t} bg={C.saf2} style={{opacity: b.o, transform: `rotate(2deg) scale(${b.s})`}}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontWeight: 900, fontSize: 120, color: C.ink, letterSpacing: -4}}>IT MATTERS</div>
      </Paper>
    </AbsoluteFill>
  );
};

const Copy: SceneFn = ({t}) => {
  const cut = E(t, W(5, 'copy') - 0.1, W(5, 'moments'));
  return (
    <AbsoluteFill>
      <Paper x={60} y={620} w={960} h={900} seed={201} rot={0.8} t={t} bg={C.page} />
      <Plain x={320} y={760} h={640} fill={C.tan} t={t} seed={203} />
      <Plain x={760} y={760} h={640} fill={C.saf2} t={t} seed={205} robot />
      <svg style={{position: 'absolute', left: 540, top: 640, overflow: 'visible'}} width={10} height={10}>
        <line x1={0} y1={0} x2={0} y2={860 * cut} stroke={C.ink} strokeWidth={6} strokeDasharray="22 16" />
        <g transform={`translate(0 ${860 * cut}) rotate(90)`}>
          <circle cx={-26} cy={-16} r={16} fill="none" stroke={C.ink} strokeWidth={6} /><circle cx={-26} cy={16} r={16} fill="none" stroke={C.ink} strokeWidth={6} />
          <path d="M-12 -8 L40 14 M-12 8 L40 -14" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        </g>
      </svg>
      <Sticker x={320} y={700} bg={C.page} size={38} t={t} seed={207} rot={-4}>HUMAN</Sticker>
      <Sticker x={760} y={700} bg={C.saf} size={38} t={t} seed={208} rot={4}>AI</Sticker>
      <Cap t={t} items={[{w: 'AI', at: W(5, 'ai')}, {w: 'CAN COPY', at: W(5, 'copy'), hi: true}, {w: 'HUMAN MOMENTS', at: W(5, 'human')}]} />
    </AbsoluteFill>
  );
};

const Tell: SceneFn = ({t}) => {
  const sw = E(t, 32.3, 33.0);
  return (
    <AbsoluteFill>
      <Paper x={60} y={620} w={960} h={900} seed={211} rot={-0.8} t={t} bg={C.page} />
      <Figure x={lerp(330, 750, sw)} y={760} h={660} pose={3} t={t} seed={213} />
      <Figure x={lerp(750, 330, sw)} y={760} h={660} pose={3} t={t} seed={214} />
      {[[330, 700], [750, 700], [540, 640]].map(([x, y], i) => {
        const s = slap(t, W(5, 'most') + i * 0.15);
        return <div key={i} style={{position: 'absolute', left: x - 60, top: y - 70 + Math.sin(t * 4 + i) * 12, width: 120, height: 140, opacity: s.o, transform: `scale(${s.s}) ${boil(t, 215 + i)}`,
          fontFamily: F, fontWeight: 900, fontSize: 140, lineHeight: 1, color: C.saf, WebkitTextStroke: `5px ${C.ink}`, paintOrder: 'stroke', textAlign: 'center'}}>?</div>;
      })}
      <Cap t={t} items={[{w: 'WHICH ONE', at: W(5, 'and')}, {w: 'IS REAL?', at: W(5, "can't"), hi: true}]} />
    </AbsoluteFill>
  );
};

const Rule: SceneFn = ({t}) => {
  const w = E(t, W(6, 'simple') - 0.1, W(6, 'rule') + 0.25);
  return (
    <AbsoluteFill>
      <Paper x={110} y={700} w={860} h={520} seed={221} rot={-2} t={t} bg={`repeating-linear-gradient(${C.white} 0 58px, #BFD3DF 58px 61px)`}>
        <div style={{position: 'absolute', left: 90, top: 0, width: 4, height: 520, background: '#E7A4A0'}} />
        <div style={{position: 'absolute', left: 130, top: 170, fontFamily: F, fontWeight: 900, fontSize: 104, letterSpacing: -3, color: C.ink, clipPath: `inset(0 ${100 - w * 100}% 0 0)`, whiteSpace: 'nowrap'}}>A SIMPLE</div>
        <div style={{position: 'absolute', left: 130, top: 300, fontFamily: F, fontWeight: 900, fontSize: 104, letterSpacing: -3, color: C.saf, clipPath: `inset(0 ${100 - seg(w, 0.5, 1) * 100}% 0 0)`}}>RULE:</div>
      </Paper>
      <Tape x={540} y={705} rot={-2} seed={223} />
    </AbsoluteFill>
  );
};

const Label: React.FC<{t: number; at: number; x: number; y: number}> = ({t, at, x, y}) => {
  const st = seg(t, at - 0.05, at + 0.16);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(-5deg) scale(${st > 0 ? lerp(1.8, 1, eo(st)) : 1.8})`, opacity: cl(st * 3), display: 'flex', alignItems: 'center', gap: 14,
      background: C.white, border: `6px solid ${C.ink}`, borderRadius: 16, padding: '12px 22px', boxShadow: `6px 8px 0 rgba(31,26,21,0.25)`, whiteSpace: 'nowrap'}}>
      <span style={{fontFamily: M, fontWeight: 800, fontSize: 40, color: C.ink}}>LABEL: AI-MADE</span>
      <span style={{width: 58, height: 58, borderRadius: '50%', background: C.sage, border: `5px solid ${C.ink}`, color: C.white, fontSize: 34, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</span>
    </div>
  );
};

const SaysSo: SceneFn = ({t}) => (
  <AbsoluteFill>
    <Plain x={540} y={720} h={760} fill={C.saf2} t={t} seed={231} robot />
    <Label t={t} at={W(6, 'says')} x={540} y={1060} />
    <Cap t={t} items={[{w: 'IF IT’S AI,', at: W(6, 'if')}, {w: 'IT SAYS SO', at: W(6, 'says'), hi: true}]} />
  </AbsoluteFill>
);

const Proof: SceneFn = ({t}) => {
  const rub = seg(t, W(6, 'can\'t') - 0.2, W(6, 'erased') + 0.4);
  return (
    <AbsoluteFill>
      <Plain x={540} y={640} h={620} fill={C.saf2} t={t} seed={241} robot />
      <Label t={t} at={-1} x={540} y={920} />
      {/* chain strip */}
      {[0, 1, 2, 3].map((i) => {
        const s = slap(t, W(6, 'proof') + i * 0.1);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: 120 + i * 220, top: 1290, width: 170, height: 110, borderRadius: 18, background: C.saf, border: `6px solid ${C.ink}`, opacity: s.o, transform: `scale(${s.s}) ${boil(t, 250 + i)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 48, fontWeight: 900}}>✓</div>
            {i < 3 && <div style={{position: 'absolute', left: 278 + i * 220, top: 1330, width: 70, height: 30, borderRadius: 15, border: `7px solid ${C.ink}`, opacity: s.o}} />}
          </React.Fragment>
        );
      })}
      {/* eraser tries, label stays */}
      {rub > 0 && rub < 1 && (
        <div style={{position: 'absolute', left: 560 + Math.sin(rub * Math.PI * 8) * 140, top: 840, width: 190, height: 96, transform: `rotate(-14deg)`, borderRadius: 14, overflow: 'hidden', border: `6px solid ${C.ink}`, boxShadow: '6px 8px 0 rgba(31,26,21,0.25)'}}>
          <div style={{height: '55%', background: '#E79A9A'}} /><div style={{height: '45%', background: '#9CB6D3'}} />
        </div>
      )}
      <Cap t={t} items={[{w: 'PROOF', at: W(6, 'proof'), hi: true}, {w: 'THAT CAN’T', at: W(6, 'that')}, {w: 'BE ERASED', at: W(6, 'erased')}]} />
    </AbsoluteFill>
  );
};

const ROLES = [{l: 'PLATFORMS', w: 'platforms', fill: C.tan, x: 230}, {l: 'CREATORS', w: 'creators', fill: C.saf2, x: 540}, {l: 'VIEWERS', w: 'viewers', fill: '#F6D9A8', x: 850}];
const Roles: SceneFn = ({t}) => {
  const join = E(t, W(6, 'together') - 0.1, W(6, 'together') + 0.3);
  return (
    <AbsoluteFill>
      {ROLES.map((r, i) => {
        const s = slap(t, W(6, r.w));
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', inset: 0, opacity: s.o, transform: `scale(${lerp(1.15, 1, cl((1.35 - s.s) / 0.35))})`, transformOrigin: `${r.x}px 1200px`}}>
              <Plain x={r.x} y={800} h={560} fill={r.fill} t={t} seed={260 + i} />
            </div>
            <Sticker x={r.x} y={1395} bg={C.white} size={34} s={s.s} o={s.o} t={t} seed={265 + i} rot={(i - 1) * 4}>{r.l}</Sticker>
          </React.Fragment>
        );
      })}
      {[0, 1].map((i) => <div key={i} style={{position: 'absolute', left: ROLES[i].x + 100, top: 1040, width: 110 * join, height: 34, borderRadius: 17, background: '#C68A5E', border: `5px solid ${C.ink}`}} />)}
      <Cap t={t} items={[{w: 'A JOB FOR', at: W(6, 'job')}, {w: 'ALL OF US', at: W(6, 'together'), hi: true}]} />
    </AbsoluteFill>
  );
};

const Together: SceneFn = ({t}) => (
  <AbsoluteFill>
    <Img src={staticFile('star.png')} style={{position: 'absolute', left: 90, top: 560, width: 900, opacity: 0.12, transform: `rotate(${t * 6}deg)`}} />
    {ROLES.map((r, i) => <Plain key={i} x={r.x} y={660} h={560} fill={r.fill} t={t} seed={260 + i} />)}
    {[0, 1].map((i) => <div key={i} style={{position: 'absolute', left: ROLES[i].x + 100, top: 900, width: 110, height: 34, borderRadius: 17, background: '#C68A5E', border: `5px solid ${C.ink}`}} />)}
    {[
      {x: 230, l: 'OMNICHAIN', s: 'IN THE MAKING', icon: 'chain'},
      {x: 540, l: 'A.L.K.I.', s: 'COMING SOON', icon: 'nodes'},
      {x: 850, l: 'OMNIBOT', s: 'COMING SOON', icon: 'bot'},
    ].map((p, i) => {
      const s = slap(t, 42.75 + i * 0.12);
      return (
        <div key={i} style={{position: 'absolute', left: p.x - 135, top: 1250, width: 270, opacity: s.o, transform: `scale(${s.s}) rotate(${(i - 1) * 5}deg) ${boil(t, 280 + i)}`, background: C.white, border: `5px solid ${C.ink}`, borderRadius: 18,
          padding: '12px 10px', textAlign: 'center', boxShadow: '5px 7px 0 rgba(31,26,21,0.25)'}}>
          <svg width={120} height={56} viewBox="0 0 120 56">
            {p.icon === 'chain' && [0, 1, 2].map((k) => <rect key={k} x={4 + k * 40} y={14} width={32} height={28} rx={7} fill={C.saf} stroke={C.ink} strokeWidth={4} />)}
            {p.icon === 'nodes' && <g stroke={C.ink} strokeWidth={4}><path d="M20 40 L60 12 L100 40 L60 46 Z M60 12 L60 46" fill="none" />{[[20, 40], [60, 12], [100, 40], [60, 46]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={8} fill={C.saf} />)}</g>}
            {p.icon === 'bot' && <g stroke={C.ink} strokeWidth={4} fill={C.saf2}><rect x={44} y={4} width={32} height={26} rx={7} /><rect x={38} y={32} width={44} height={22} rx={6} /></g>}
          </svg>
          <div style={{fontFamily: F, fontWeight: 900, fontSize: 30, color: C.ink}}>{p.l}</div>
          <div style={{fontFamily: M, fontWeight: 700, fontSize: 20, color: C.mute}}>{p.s}</div>
        </div>
      );
    })}
    <Cap t={t} items={[{w: 'TOGETHER', at: 42.55, hi: true}]} />
  </AbsoluteFill>
);

const Question: SceneFn = ({t}) => (
  <AbsoluteFill>
    <Paper x={70} y={620} w={940} h={760} seed={291} rot={1.5} t={t} bg={halftone('rgba(240,138,18,0.12)', C.page, 20, 28)}>
      <div style={{position: 'absolute', left: 60, top: 70, right: 60, display: 'flex', flexWrap: 'wrap', gap: '6px 24px'}}>
        {[['SHOULD', W(7, 'should')], ['AI', W(7, 'ai')], ['FAKE', W(7, 'fake')], ['LIFE', W(7, 'life')], ['EVENTS?', W(7, 'events')]].map(([w, at], i) => {
          const s = slap(t, at as number);
          return <span key={i} style={{fontFamily: F, fontWeight: 900, fontSize: 132, lineHeight: 1.05, letterSpacing: -4, color: w === 'FAKE' ? C.saf : C.ink, opacity: s.o, transform: `scale(${s.s})`, display: 'inline-block'}}>{w as string}</span>;
        })}
      </div>
    </Paper>
    <Tape x={150} y={640} rot={-24} seed={293} />
    <Tape x={930} y={1360} rot={-24} seed={294} />
  </AbsoluteFill>
);

const Vote: SceneFn = ({t}) => {
  const a = E(t, W(7, 'a'), W(7, 'a') + 0.18) * (1 - E(t, W(7, 'a') + 0.25, W(7, 'a') + 0.45));
  const b = E(t, W(7, 'b'), W(7, 'b') + 0.18) * (1 - E(t, W(7, 'b') + 0.25, W(7, 'b') + 0.45));
  const btn = (x: number, label: string, p: number, bg: string, seed: number) => (
    <div style={{position: 'absolute', left: x, top: 820, width: 400, height: 400, transform: `${boil(t, seed)} translateY(${p * 14}px)`}}>
      <div style={{position: 'absolute', left: 0, top: 24, width: 400, height: 380, borderRadius: 60, background: C.ink, clipPath: torn(400, 380, seed, 6, 16)}} />
      <div style={{position: 'absolute', left: 0, top: p * 18, width: 400, height: 376, borderRadius: 60, background: bg, clipPath: torn(400, 376, seed + 1, 6, 16), display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', fontFamily: F, fontWeight: 900, color: C.ink}}>
        <div style={{fontSize: 200, lineHeight: 0.9, letterSpacing: -6}}>{label[0]}</div>
        <div style={{fontSize: 64, letterSpacing: -1}}>{label.slice(3)}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      {btn(70, 'A: FINE', a, C.saf2, 301)}
      {btn(560, 'B: NO', b, C.page, 303)}
      <Cap t={t} items={[{w: 'COMMENT', at: W(7, 'comment')}, {w: 'A', at: W(7, 'a'), hi: true}, {w: 'OR', at: W(7, 'b') - 0.15}, {w: 'B', at: W(7, 'b'), hi: true}]} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- timeline of sheets (a cut every ~1.5–2.5 s)
type Sc = {fn: SceneFn | 'cover'; t0: number; tr: 'slide' | 'tear' | 'flip'};
const S: Sc[] = [
  {fn: 'cover', t0: 0, tr: 'slide'},
  {fn: Phone, t0: 2.35, tr: 'flip'},
  {fn: Name, t0: 5.2, tr: 'tear'},
  {fn: Members, t0: 6.75, tr: 'slide'},
  {fn: MapScene, t0: 9.3, tr: 'tear'},
  {fn: Followers, t0: 11.25, tr: 'slide'},
  {fn: Post, t0: 13.25, tr: 'tear'},
  {fn: Away, t0: 15.35, tr: 'slide'},
  {fn: Wave, t0: 17.45, tr: 'tear'},
  {fn: Furious, t0: 21.05, tr: 'slide'},
  {fn: Split, t0: 22.95, tr: 'slide'},
  {fn: Admit, t0: 25.05, tr: 'tear'},
  {fn: Matters, t0: 27.95, tr: 'slide'},
  {fn: Copy, t0: 29.5, tr: 'tear'},
  {fn: Tell, t0: 31.85, tr: 'slide'},
  {fn: Rule, t0: 34.25, tr: 'tear'},
  {fn: SaysSo, t0: 35.95, tr: 'slide'},
  {fn: Proof, t0: 37.85, tr: 'slide'},
  {fn: Roles, t0: 39.9, tr: 'tear'},
  {fn: Together, t0: 42.45, tr: 'slide'},
  {fn: Question, t0: 43.65, tr: 'tear'},
  {fn: Vote, t0: 46.45, tr: 'slide'},
  {fn: 'cover', t0: 49.75, tr: 'slide'},
];
const TR = 0.42;

const Sheet: React.FC<{i: number; t: number; t0: number}> = ({i, t}) => {
  const sc = S[i];
  if (sc.fn === 'cover') {
    const curl = i === 0 ? E(t, HOLD / FPS, 1.8) * 0.8 : 0;
    return <Cover t={i === 0 && t < HOLD / FPS ? 0 : t} curl={curl} />;
  }
  const Fn = sc.fn;
  return <Fn t={t} lt={t - sc.t0} />;
};

const Grain: React.FC = () => (
  <svg style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.35, pointerEvents: 'none'}} width={1080} height={1920}>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} /><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.3  0 0 0 0.35 0" /></filter>
    <rect width="1080" height="1920" filter="url(#grain)" />
  </svg>
);

export const Zine: React.FC = () => {
  const raw = useCurrentFrame();
  const frame = raw >= N - HOLD ? 0 : raw;
  const t = frame / FPS;
  let i = 0;
  while (i < S.length - 1 && t >= S[i + 1].t0) i++;
  const sc = S[i];
  const lt = t - sc.t0;
  const next = i < S.length - 1 ? S[i + 1].t0 : TOTAL;
  // smooth camera on top of the stepped boil: a slow push through each sheet
  const dur = next - sc.t0;
  const push = i === 0 ? E(t, HOLD / FPS, 2.35) * 0.06 : (i === S.length - 1 ? 0 : seg(lt, 0, dur) * 0.05);
  const panX = i === 0 || i === S.length - 1 ? 0 : Math.sin(sc.t0 * 1.7) * 18 * seg(lt, 0, dur);
  const cam = `translateX(${panX}px) scale(${1 + push})`;
  const shift = E(t, 35.6, 36.3) * (1 - E(t, 49.7, 50.3));
  // transition: previous sheet on top (tear/flip away) or new sheet slides in over it
  const final0 = i === S.length - 1;
  const p = seg(lt, 0, TR);
  const inTr = i > 0 && lt < (final0 ? 0.6 : TR);
  const prevT = sc.t0 - 0.001;
  const prev = inTr ? <Sheet i={i - 1} t={prevT} t0={S[i - 1].t0} /> : null;
  const final = i === S.length - 1;
  const endHold = final ? 1 : 0;
  const slideP = eo(seg(lt, 0, final ? 0.6 : TR));
  const curT = final ? 0 : t;   // the closing cover is frame 0's cover, held still
  void endHold;

  const bg = shift > 0 ? `rgb(${[245, 236, 221].map((v, k) => Math.round(v + ([255, 249, 238][k] - v) * shift)).join(',')})` : C.paper;
  const current = (
    <AbsoluteFill style={{transform: cam}}>
      <Sheet i={i} t={final ? curT : t} t0={sc.t0} />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: halftone('rgba(31,26,21,0.05)', 'transparent', 26, 20), opacity: 1 - shift}} />
      {inTr && sc.tr !== 'slide' && <AbsoluteFill>{current}</AbsoluteFill>}
      {inTr && sc.tr === 'slide' && <AbsoluteFill>{prev}</AbsoluteFill>}
      {!inTr && current}
      {/* tear: the previous sheet rips in two and flies apart */}
      {inTr && sc.tr === 'tear' && (
        <>
          <AbsoluteFill style={{clipPath: `polygon(0 0, 1080px 0, ${Array.from({length: 23}).map((_, k) => `${1080 - k * 49}px ${900 + (hash(k + i) - 0.5) * 70 + k * 6}px`).join(',')})`,
            transform: `translate(${-eio(p) * 160}px, ${-eio(p) * 1300}px) rotate(${-eio(p) * 9}deg)`}}>{prev}</AbsoluteFill>
          <AbsoluteFill style={{clipPath: `polygon(${Array.from({length: 23}).map((_, k) => `${1080 - k * 49}px ${900 + (hash(k + i) - 0.5) * 70 + k * 6}px`).join(',')}, 0 1920px, 1080px 1920px)`,
            transform: `translate(${eio(p) * 160}px, ${eio(p) * 1300}px) rotate(${eio(p) * 7}deg)`}}>{prev}</AbsoluteFill>
        </>
      )}
      {/* flip: the previous sheet turns away like a page */}
      {inTr && sc.tr === 'flip' && (
        <AbsoluteFill style={{transform: `perspective(2400px) rotateY(${-eio(p) * 100}deg)`, transformOrigin: '0% 50%', opacity: 1 - seg(p, 0.85, 1)}}>
          <AbsoluteFill style={{background: C.paper}} />{prev}
        </AbsoluteFill>
      )}
      {/* slide: the new sheet slides over the old one */}
      {inTr && sc.tr === 'slide' && (
        <AbsoluteFill style={{transform: `translate(${(1 - slideP) * 1150}px, ${(1 - slideP) * 90}px) rotate(${(1 - slideP) * 8}deg)`, filter: 'drop-shadow(-12px 0 0 rgba(31,26,21,0.18))'}}>
          <AbsoluteFill style={{background: bg}} />
          {final && <AbsoluteFill style={{background: halftone('rgba(31,26,21,0.05)', 'transparent', 26, 20)}} />}
          {current}
        </AbsoluteFill>
      )}
      <Grain />
      {/* watermark */}
      <div style={{position: 'absolute', top: 1462, left: 60, display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7}}>
          <Img src={staticFile('logo.png')} style={{width: 40, height: 40}} />
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: C.ink}}>OMNIX</span>
        </div>
        <span style={{fontFamily: M, fontWeight: 700, fontSize: 26, color: C.ink, opacity: 0.7 * E(t, 49.0, 49.3) * (1 - E(t, 49.9, 50.3))}}>@omnixteam</span>
      </div>
    </AbsoluteFill>
  );
};
