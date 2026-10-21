import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, delayRender, continueRender} from 'remotion';
import {loadFont} from '@remotion/fonts';
import tl from './timeline.json';
import geo from './geo.json';

const fontHandle = delayRender('fonts');
Promise.all([
  loadFont({family: 'Montserrat', url: staticFile('Montserrat.ttf'), weight: '100 900'}),
  loadFont({family: 'JBMono', url: staticFile('JetBrainsMono.ttf'), weight: '100 800'}),
]).then(() => continueRender(fontHandle));

const F = 'Montserrat', M = 'JBMono';
export const TOTAL = tl.total;
const FPS = 30, N = Math.round(TOTAL * FPS), HOLD = 8, H0 = HOLD / FPS;

const C = {paper: '#F5ECDD', warm: '#FBF1E1', page: '#FFFBF4', ink: '#1F1A15', saf: '#F08A12', saf2: '#FFC46B', safDeep: '#C9650A', mute: '#8C8073',
  line: '#DCCDB5', land: '#EADFCB', tan: '#E9D5B5', red: '#E5532B', redTint: '#F7D3C5', sage: '#5E8A55', white: '#FFFFFF', wood: '#D9BE93'};

const cl = (x: number) => Math.min(1, Math.max(0, x));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const back = (x: number) => {const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);};
const E = (t: number, a: number, b: number) => eio(seg(t, a, b));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const norm = (w: string) => w.toLowerCase().replace(/[“”".,:?!]/g, '');
const W = (b: number, word: string, n = 1) => {
  let c = 0;
  for (const w of tl.beats[b - 1].words) if (norm(w.w) === word && ++c === n) return w.s;
  throw new Error('word ' + word);
};
const pop = (t: number, at: number, d = 0.3) => {const p = seg(t, at - 0.03, at + d); return {o: cl(p * 3), s: p <= 0 ? 0.6 : back(p) * 0.4 + 0.6 * (p > 0 ? 1 : 0) + 0 * p};};

type Cn = keyof typeof geo.countries;
const SIX: Cn[] = ['France', 'Spain', 'Belgium', 'Italy', 'Portugal', 'Albania'];
const CITY: Record<Cn, string> = {France: 'PARIS', Spain: 'MADRID', Belgium: 'BRUSSELS', Italy: 'MILAN', Portugal: 'LISBON', Albania: 'TIRANA'};
const TRIG: Record<Cn, string> = {France: 'SCHOOLS', Spain: 'RENT', Belgium: 'COSTS', Italy: 'PRICES', Portugal: 'HOUSING', Albania: 'CORRUPTION'};

// ---------------------------------------------------------------- camera over the board
type K = {t: number; s: number; x: number; y: number};
const CK: K[] = [
  {t: 0, s: 1, x: 540, y: 1010}, {t: H0, s: 1, x: 540, y: 1010},
  {t: 8.4, s: 1.06, x: 520, y: 1040},
  {t: 10.6, s: 1.75, x: 430, y: 1040},
  {t: 11.35, s: 1.75, x: 430, y: 1040},
  {t: 12.4, s: 1.05, x: 520, y: 1070},
  {t: 16.3, s: 1.1, x: 545, y: 1080},
  {t: 17.5, s: 1.6, x: 430, y: 1040},
  {t: 21.7, s: 1.68, x: 430, y: 1040},
  {t: 22.7, s: 1.0, x: 540, y: 1010},
  {t: 29.2, s: 1.05, x: 540, y: 1010},
  {t: 33.2, s: 1.0, x: 540, y: 1010},
];
const camAt = (t: number) => {
  let i = 0;
  while (i < CK.length - 2 && t >= CK[i + 1].t) i++;
  const a = CK[i], b = CK[i + 1];
  const e = t >= b.t ? 1 : eio(seg(t, a.t, b.t));
  return {s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), e)), x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e)};
};

// ---------------------------------------------------------------- marker stroke (draw-on)
const Marker: React.FC<{d: string; p: number; color?: string; w?: number; len?: number}> = ({d, p, color = C.saf, w = 12, len = 3000}) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} opacity={p > 0 ? 0.9 : 0} />
);

// ---------------------------------------------------------------- the Europe board
const Board: React.FC<{t: number; lit: Record<string, number>; pulse: number}> = ({t, lit, pulse}) => {
  const tags = SIX.map((c, i) => seg(t, W(1, 'cities') - 0.1 + i * 0.1, W(1, 'cities') + 0.25 + i * 0.1) * (1 - E(t, 8.2, 8.6)));
  const trig = SIX.map((c, i) => seg(t, W(1, 'triggers') - 0.15 + i * 0.12, W(1, 'triggers') + 0.2 + i * 0.12) * (1 - E(t, 7.2, 7.6)));
  const stamp = seg(t, W(2, 'september') - 0.05, W(2, 'september') + 0.2) * (1 - E(t, 15.9, 16.4));
  const arrows: [Cn, number][] = [['Spain', W(2, 'spain')], ['Belgium', W(2, 'belgium')], ['Italy', W(2, 'italy')], ['Portugal', W(2, 'portugal')], ['Albania', W(2, 'albania')]];
  const fr = geo.countries.France.c;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={geo.grat} fill="none" stroke={C.line} strokeWidth={2} />
      <path d={geo.land} fill={C.land} stroke={C.ink} strokeWidth={2.4} strokeLinejoin="round" />
      {SIX.map((c) => {
        const L = lit[c];
        return <path key={c} d={geo.countries[c].d} fill={`rgba(240,138,18,${0.15 + 0.75 * L})`} stroke={C.ink} strokeWidth={2.4 + 1.2 * L} strokeLinejoin="round" />;
      })}
      {/* pulses */}
      {SIX.map((c, i) => {
        const [x, y] = geo.countries[c].c;
        const L = lit[c];
        return (
          <g key={c} opacity={L}>
            {[0, 1].map((k) => {
              const ph = ((pulse + k * 0.5 + i * 0.13) % 1 + 1) % 1;
              return <circle key={k} cx={x} cy={y} r={14 + ph * 70} fill="none" stroke={C.saf} strokeWidth={6 * (1 - ph)} opacity={(1 - ph) * 0.85} />;
            })}
            <circle cx={x} cy={y} r={13} fill={C.saf} stroke={C.ink} strokeWidth={4} />
          </g>
        );
      })}
      {/* arrows drawn on as each country is named */}
      {arrows.map(([c, at], i) => {
        const [x, y] = geo.countries[c].c;
        const p = E(t, at - 0.15, at + 0.35) * (1 - E(t, 15.9, 16.4));
        const mx = (fr[0] + x) / 2 + (y - fr[1]) * 0.25, my = (fr[1] + y) / 2 - (x - fr[0]) * 0.25;
        const d = `M${fr[0]} ${fr[1]} Q${mx} ${my} ${x} ${y}`;
        return <path key={i} d={d} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeDasharray="1400" strokeDashoffset={1400 * (1 - p)} opacity={p > 0 ? 0.85 : 0} />;
      })}
      {/* city tags */}
      {SIX.map((c, i) => {
        const [x, y] = geo.countries[c].c;
        const o = tags[i];
        if (o <= 0) return null;
        const dy = c === 'Belgium' ? -48 : c === 'Portugal' ? 46 : c === 'Albania' ? -46 : 40;
        const dx = c === 'Portugal' ? -10 : c === 'Albania' ? -40 : 0;
        return (
          <g key={c} opacity={o} transform={`translate(${x + dx} ${y + dy}) scale(${0.7 + 0.3 * eo(o)})`}>
            <rect x={-CITY[c].length * 10.5 - 10} y={-20} width={CITY[c].length * 21 + 20} height={38} rx={8} fill={C.page} stroke={C.ink} strokeWidth={3} />
            <text textAnchor="middle" y={9} fontFamily={M} fontWeight={800} fontSize={26} fill={C.ink}>{CITY[c]}</text>
          </g>
        );
      })}
      {/* different triggers */}
      {SIX.map((c, i) => {
        const [x, y] = geo.countries[c].c;
        const o = trig[i];
        if (o <= 0) return null;
        const dy = c === 'Belgium' ? -52 : c === 'Albania' ? 56 : c === 'Portugal' ? -52 : 46;
        const dx = c === 'Albania' ? -60 : c === 'Portugal' ? 10 : 0;
        const w = TRIG[c].length * 19 + 24;
        return (
          <g key={c} opacity={o} transform={`translate(${x + dx} ${y + dy}) rotate(${(i % 2 ? 4 : -4)}) scale(${0.7 + 0.3 * eo(o)})`}>
            <rect x={-w / 2} y={-22} width={w} height={42} rx={8} fill={C.saf2} stroke={C.ink} strokeWidth={3} />
            <text textAnchor="middle" y={9} fontFamily={F} fontWeight={900} fontSize={27} fill={C.ink}>{TRIG[c]}</text>
          </g>
        );
      })}
      {/* date stamp */}
      {stamp > 0 && (
        <g transform={`translate(${fr[0] - 10} ${fr[1] - 120}) rotate(-8) scale(${lerp(1.8, 1, eo(stamp))})`} opacity={cl(stamp * 3)}>
          <rect x={-110} y={-40} width={220} height={80} rx={10} fill="none" stroke={C.saf} strokeWidth={8} />
          <text textAnchor="middle" y={18} fontFamily={F} fontWeight={900} fontSize={50} fill={C.saf}>17 SEP</text>
        </g>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- street grid + crowd (France, 17 Oct)
const Street: React.FC<{t: number}> = ({t}) => {
  const inn = E(t, 16.55, 17.1) * (1 - E(t, 21.6, 22.1));
  const fill = E(t, W(3, 'over') - 0.3, W(3, 'marched') + 0.4);
  const v = 550000 * eo(seg(t, W(3, 'over'), W(3, 'people') + 0.3));
  if (inn <= 0) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: inn}}>
      <div style={{position: 'absolute', left: 110, top: 600, width: 860, height: 640, transform: `translateY(${(1 - inn) * 60}px) rotate(-1.5deg)`, background: C.page, border: `5px solid ${C.ink}`, borderRadius: 18, boxShadow: '8px 10px 0 rgba(31,26,21,0.18)', overflow: 'hidden'}}>
        <svg width={860} height={640} style={{position: 'absolute'}}>
          {[110, 270, 430, 590].map((y) => <rect key={y} x={0} y={y - 22} width={860} height={44} fill={C.line} />)}
          {[120, 330, 540, 750].map((x) => <rect key={x} x={x - 22} y={0} width={44} height={640} fill={C.line} />)}
          {Array.from({length: 1400}).map((_, i) => {
            if (i / 1400 > fill) return null;
            const onH = i % 2 === 0;
            const a = Math.sin(i * 12.9898) * 43758.5453, r = a - Math.floor(a);
            const b = Math.sin(i * 78.233) * 12543.31, q = b - Math.floor(b);
            const lane = Math.floor(q * 4);
            const x = onH ? r * 860 : [120, 330, 540, 750][lane] + (q * 1000 % 1 - 0.5) * 38;
            const y = onH ? [110, 270, 430, 590][lane] + (r * 1000 % 1 - 0.5) * 38 : r * 640;
            return <circle key={i} cx={x} cy={y} r={4.5} fill={i % 11 === 0 ? C.saf : C.ink} opacity={0.85} />;
          })}
        </svg>
      </div>
      <div style={{position: 'absolute', left: 130, width: 820, top: 1265, height: 250, background: C.page, border: `5px solid ${C.ink}`, borderRadius: 22, boxShadow: '8px 10px 0 rgba(31,26,21,0.18)'}} />
      <div style={{position: 'absolute', left: 130, width: 820, top: 1272, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 140, letterSpacing: -5, color: C.saf, WebkitTextStroke: `4px ${C.ink}`, paintOrder: 'stroke'}}>
        {Math.round(v).toLocaleString('en-US')}{v > 549000 ? '+' : ''}
      </div>
      <div style={{position: 'absolute', left: 130, width: 820, top: 1435, display: 'flex', justifyContent: 'center', opacity: E(t, W(3, 'says'), W(3, 'says') + 0.3)}}>
        <div style={{background: C.page, border: `4px solid ${C.ink}`, borderRadius: 40, padding: '8px 26px', fontFamily: M, fontWeight: 800, fontSize: 30, color: C.ink}}>INTERIOR MINISTRY COUNT</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- cost cards (the only red-orange)
const Icon: React.FC<{k: string}> = ({k}) => (
  <svg width={130} height={110} viewBox="0 0 130 110" style={{overflow: 'visible'}}>
    <g fill={C.page} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
      {k === 'rent' && <><path d="M15 55 L65 12 L115 55" fill="none" /><rect x={28} y={52} width={74} height={50} /><rect x={56} y={70} width={20} height={32} fill={C.red} /></>}
      {k === 'food' && <><path d="M12 48 H118 L104 100 H26 Z" /><circle cx={44} cy={36} r={14} fill={C.red} /><circle cx={72} cy={30} r={16} fill={C.saf2} /><path d="M92 40 l14 -22" /></>}
      {k === 'school' && <><rect x={20} y={46} width={90} height={56} /><path d="M10 50 L65 14 L120 50" fill="none" /><rect x={56} y={70} width={18} height={32} fill={C.red} /><path d="M65 14 V2 h18" /></>}
      {k === 'public' && <><rect x={14} y={30} width={102} height={56} rx={12} /><rect x={26} y={42} width={30} height={20} /><rect x={74} y={42} width={30} height={20} /><circle cx={36} cy={92} r={10} fill={C.ink} /><circle cx={94} cy={92} r={10} fill={C.ink} /></>}
    </g>
  </svg>
);
const COSTS = [{k: 'rent', l: 'RENT', w: 'rent'}, {k: 'food', l: 'FOOD', w: 'food'}, {k: 'school', l: 'SCHOOLS', w: 'schools'}, {k: 'public', l: 'PUBLIC SERVICES', w: 'public'}];
const Costs: React.FC<{t: number}> = ({t}) => {
  const out = E(t, 25.1, 25.6);
  return (
    <>
      {COSTS.map((c, i) => {
        const at = W(4, c.w);
        const p = seg(t, at - 0.1, at + 0.35);
        if (p <= 0) return null;
        const x = 110 + (i % 2) * 440, y = 640 + Math.floor(i / 2) * 380;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: 400, height: 340, opacity: cl(p * 3) * (1 - out), transform: `translate(${(1 - eo(p)) * (i % 2 ? 300 : -300) + out * (i % 2 ? 500 : -500)}px, 0) rotate(${(i % 2 ? 2 : -2)}deg)`,
            background: C.redTint, border: `6px solid ${C.ink}`, borderRadius: 26, boxShadow: '8px 10px 0 rgba(31,26,21,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
            <Icon k={c.k} />
            <div style={{fontFamily: F, fontWeight: 900, fontSize: c.l.length > 8 ? 40 : 54, color: C.ink, letterSpacing: -1, textAlign: 'center'}}>{c.l}</div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the round table (top-down)
const TC = {x: 510, y: 1030}, TR = 270, SR = 395;
const SEATS = [
  {l: 'CITIZENS', ic: 'person', at: () => W(6, 'citizens'), item: 'note'},
  {l: 'STUDENTS', ic: 'student', at: () => W(6, 'broken') + 0.1, item: 'book'},
  {l: 'GOVERNMENTS', ic: 'gov', at: () => W(6, 'governments'), item: 'rules'},
  {l: 'BUILDERS', ic: 'tools', at: () => W(6, 'builders'), item: 'plan'},
  {l: 'BUSINESSES', ic: 'shop', at: () => W(6, 'businesses'), item: 'crate'},
  {l: 'TECH', ic: 'chip', at: () => W(7, 'tech'), item: 'omnix'},
];
const seatAng = (i: number) => -Math.PI / 2 + (i / SEATS.length) * Math.PI * 2;
const SeatIcon: React.FC<{k: string; on: number}> = ({k, on}) => (
  <svg width={110} height={110} viewBox="0 0 110 110">
    <circle cx={55} cy={55} r={50} fill={on > 0.5 ? C.saf2 : C.page} stroke={C.ink} strokeWidth={6} />
    <g fill={C.page} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
      {(k === 'person' || k === 'student') && <><circle cx={55} cy={40} r={13} /><path d="M30 84 Q55 54 80 84 Z" /></>}
      {k === 'student' && <path d="M34 28 L55 18 L76 28 L55 38 Z" fill={C.ink} />}
      {k === 'gov' && <><path d="M26 42 L55 24 L84 42 Z" /><path d="M34 46 V78 M48 46 V78 M62 46 V78 M76 46 V78" /><path d="M26 82 H84" /></>}
      {k === 'tools' && <><path d="M32 78 L66 44" strokeWidth={8} /><path d="M60 30 a14 14 0 1 0 20 20 l-10 -4 l-6 -6 z" /><path d="M70 78 L40 48 M36 36 l10 10" strokeWidth={7} /></>}
      {k === 'shop' && <><path d="M26 46 H84 L80 32 H30 Z" /><rect x={30} y={46} width={50} height={34} /><rect x={48} y={58} width={14} height={22} fill={C.ink} /></>}
      {k === 'chip' && <><rect x={34} y={34} width={42} height={42} rx={6} /><path d="M44 34 V24 M55 34 V24 M66 34 V24 M44 76 V86 M55 76 V86 M66 76 V86 M34 44 H24 M34 55 H24 M34 66 H24 M76 44 H86 M76 55 H86 M76 66 H86" /></>}
    </g>
  </svg>
);
const Item: React.FC<{k: string; x: number; y: number; o: number; s: number}> = ({k, x, y, o, s}) => (
  <svg style={{position: 'absolute', left: x - 50, top: y - 50, opacity: o, transform: `scale(${s})`, overflow: 'visible'}} width={100} height={100} viewBox="0 0 100 100">
    <g fill={C.page} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
      {k === 'note' && <><rect x={18} y={14} width={64} height={72} rx={4} fill={C.saf2} /><path d="M30 36 H70 M30 50 H70 M30 64 H58" /></>}
      {k === 'book' && <><path d="M12 24 Q50 14 50 30 Q50 14 88 24 V80 Q50 70 50 86 Q50 70 12 80 Z" /><path d="M50 30 V86" /></>}
      {k === 'rules' && <><rect x={20} y={10} width={60} height={80} rx={4} /><path d="M32 30 H68 M32 44 H68 M32 58 H68" /><circle cx={62} cy={74} r={10} fill={C.saf} /></>}
      {k === 'plan' && <><rect x={10} y={20} width={80} height={60} rx={4} fill="#DCE6EA" /><path d="M22 66 V34 H50 V52 H78" /></>}
      {k === 'crate' && <><rect x={16} y={26} width={68} height={56} rx={4} fill={C.tan} /><path d="M16 46 H84 M50 26 V82" /></>}
    </g>
  </svg>
);
const OmnixItem: React.FC<{k: string; x: number; y: number; o: number; s: number}> = ({k, x, y, o, s}) => (
  <svg style={{position: 'absolute', left: x - 50, top: y - 50, opacity: o, transform: `scale(${s})`, overflow: 'visible'}} width={100} height={100} viewBox="0 0 100 100">
    <g stroke={C.ink} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
      {k === 'chain' && [0, 1, 2].map((i) => <rect key={i} x={6 + i * 31} y={34} width={26} height={32} rx={6} fill={C.saf} />)}
      {k === 'chain' && <path d="M32 50 H37 M63 50 H68" />}
      {k === 'alki' && <><path d="M20 70 L50 22 L80 70 Z M50 22 L50 56 L20 70 M50 56 L80 70" fill="none" />{[[20, 70], [50, 22], [80, 70], [50, 56]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={9} fill={C.saf} />)}</>}
      {k === 'bot' && <><rect x={30} y={12} width={40} height={32} rx={9} fill={C.saf2} /><rect x={24} y={48} width={52} height={40} rx={8} fill={C.saf2} /><circle cx={42} cy={28} r={4} fill={C.ink} /><circle cx={58} cy={28} r={4} fill={C.ink} /></>}
    </g>
  </svg>
);

const Table: React.FC<{t: number; up: number}> = ({t, up}) => {
  const allOn = E(t, W(7, 'picture') - 0.1, W(7, 'picture') + 0.6);
  const cta = E(t, W(8, 'what') - 0.1, W(8, 'what') + 0.45);
  const omx = [
    {k: 'chain', at: W(7, 'open'), l: 'OMNICHAIN'},
    {k: 'alki', at: W(7, 'ai'), l: 'A.L.K.I.'},
    {k: 'bot', at: W(7, 'robots'), l: 'OMNIBOT'},
  ];
  return (
    <div style={{position: 'absolute', inset: 0, transform: `perspective(1800px) rotateX(${(1 - up) * 70}deg) scale(${lerp(0.7, 1, up)})`, transformOrigin: `${TC.x}px ${TC.y + 300}px`, opacity: cl(up * 2)}}>
      <div style={{position: 'absolute', left: TC.x - 520, top: TC.y - 520, width: 1040, height: 1040, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,196,107,${0.25 + 0.35 * allOn}) 0%, rgba(255,196,107,0) 70%)`}} />
      <div style={{position: 'absolute', left: TC.x - TR, top: TC.y - TR, width: TR * 2, height: TR * 2, borderRadius: '50%', background: `radial-gradient(circle at 40% 35%, #E6CFA6, ${C.wood})`, border: `8px solid ${C.ink}`, boxShadow: '10px 14px 0 rgba(31,26,21,0.18)'}}>
        <div style={{position: 'absolute', inset: 30, borderRadius: '50%', border: `3px dashed rgba(31,26,21,0.25)`}} />
      </div>
      {SEATS.map((s, i) => {
        const a = seatAng(i);
        const x = TC.x + Math.cos(a) * SR, y = TC.y + Math.sin(a) * SR;
        const at = s.at();
        const on = Math.max(E(t, at - 0.05, at + 0.3), allOn);
        const ip = seg(t, at + 0.1, at + 0.45);
        const ix = TC.x + Math.cos(a) * (TR - 85), iy = TC.y + Math.sin(a) * (TR - 85);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x - 55, top: y - 55, transform: `scale(${0.85 + 0.15 * on})`, opacity: 0.45 + 0.55 * on, filter: on > 0.5 ? `drop-shadow(0 0 ${18 * on}px rgba(240,138,18,0.6))` : undefined}}>
              <SeatIcon k={s.ic} on={on} />
            </div>
            <div style={{position: 'absolute', left: x - 120, width: 240, top: y + (Math.sin(a) > 0.3 ? 62 : -100), textAlign: 'center', opacity: 0.4 + 0.6 * on}}>
              <span style={{background: on > 0.5 ? C.page : 'transparent', border: `3px solid ${on > 0.5 ? C.ink : 'transparent'}`, borderRadius: 10, padding: '4px 12px', fontFamily: M, fontWeight: 800, fontSize: 28, color: C.ink}}>{s.l}</span>
            </div>
            {s.item !== 'omnix' && ip > 0 && <Item k={s.item} x={ix} y={iy} o={cl(ip * 3) * (1 - cta * 0.6)} s={0.6 + 0.4 * back(ip) * 0 + 0.4 * eo(ip)} />}
          </React.Fragment>
        );
      })}
      {/* Omnix items: same size as everyone else's, at the TECH seat, never the centre */}
      {omx.map((o, i) => {
        const a = seatAng(5) + (i - 1) * 0.36;
        const x = TC.x + Math.cos(a) * (TR - 85), y = TC.y + Math.sin(a) * (TR - 85);
        const p = seg(t, o.at - 0.05, o.at + 0.35);
        return p > 0 ? <OmnixItem key={i} k={o.k} x={x} y={y} o={cl(p * 3) * (1 - cta * 0.6)} s={0.6 + 0.4 * eo(p)} /> : null;
      })}
      {(() => {
        const o = E(t, W(7, 'open'), W(7, 'open') + 0.3) * (1 - cta);
        const a = seatAng(5);
        return <div style={{position: 'absolute', left: TC.x + Math.cos(a) * (TR - 85) - 40, top: TC.y + Math.sin(a) * (TR - 85) + 52, opacity: o, fontFamily: M, fontWeight: 800, fontSize: 18, color: C.ink, background: C.page, border: `3px solid ${C.ink}`, borderRadius: 8, padding: '2px 8px', whiteSpace: 'nowrap'}}>OMNIX // COMING SOON</div>;
      })()}
      {/* CTA cards on the table */}
      {[['HOUSING', W(8, 'housing')], ['FOOD', W(8, 'food')], ['SCHOOL', W(8, 'school')]].map(([l, at], i) => {
        const p = seg(t, W(8, 'what') + i * 0.15, W(8, 'what') + 0.4 + i * 0.15);
        const on = E(t, (at as number) - 0.05, (at as number) + 0.25);
        if (p <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: TC.x - 105, top: TC.y - 160 + i * 112, width: 210, height: 92, opacity: cl(p * 3), transform: `translateY(${(1 - eo(p)) * 80}px) rotate(${(i - 1) * 3}deg) scale(${1 + 0.08 * on})`,
            background: mix(C.page, C.saf2, on), border: `5px solid ${C.ink}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontWeight: 900, fontSize: 38, color: C.ink, boxShadow: '5px 7px 0 rgba(31,26,21,0.2)'}}>{l as string}</div>
        );
      })}
    </div>
  );
};
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, p: number) => `rgb(${hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * p)).join(',')})`;

// ---------------------------------------------------------------- captions (hook zone)
type Cap = {w: string[]; at: number[]; until: number; hi?: number; size?: number; circle?: number};
const CAPS: Cap[] = [
  {w: ['ONE', 'SHARED', 'WORRY:'], at: [W(1, 'one'), W(1, 'shared'), W(1, 'worry')], until: 7.2},
  {w: ['COST', 'OF', 'LIVING'], at: [W(1, 'cost'), W(1, 'cost'), W(1, 'living')], until: 8.5, hi: -1, size: 96, circle: W(1, 'living')},
  {w: ['17', 'SEP:', 'FRANCE'], at: [W(2, 'september'), W(2, 'september'), W(2, 'france')], until: 11.2, hi: 2},
  {w: ['NOW', '5', 'MORE', 'COUNTRIES'], at: [W(2, 'now'), W(2, 'spain'), W(2, 'spain'), W(2, 'spain')], until: 16.2, hi: 1},
  {w: ['17', 'OCT:', 'FRANCE'], at: [W(3, 'october'), W(3, 'october'), W(3, 'france')], until: 18.0, hi: 2},
  {w: ['550,000+', 'IN', 'ONE', 'DAY'], at: [W(3, 'over'), W(3, 'marched'), W(3, 'marched'), W(3, 'marched')], until: 21.7, hi: 0},
  {w: ['THE', 'COST', 'OF', 'EVERYDAY', 'LIFE'], at: [22.0, 22.0, 22.0, 22.0, 22.0], until: 25.2, hi: 3},
  {w: ['SOME', 'TURNED', 'VIOLENT.'], at: [W(4, 'some'), W(4, 'turned'), W(4, 'violent')], until: 26.75},
  {w: ['THAT', 'HELPS', 'NO', 'ONE.'], at: [W(4, 'that'), W(4, 'helps'), W(4, 'no'), W(4, 'one')], until: 29.1, hi: 1},
  {w: ['WHO', 'FIXES', 'THIS?'], at: [W(5, 'who'), W(5, 'fixes'), W(5, 'this')], until: 31.0, hi: 1},
  {w: ['CITIZENS:', 'WHAT’S', 'BROKEN'], at: [W(6, 'citizens'), W(6, "what's"), W(6, 'broken')], until: 36.0, hi: 2},
  {w: ['GOVERNMENTS:', 'THE', 'RULES'], at: [W(6, 'governments'), W(6, 'the'), W(6, 'rules')], until: 37.45, hi: 2},
  {w: ['BUILDERS', 'DELIVER'], at: [W(6, 'builders'), W(6, 'deliver')], until: 39.6, hi: 1},
  {w: ['TECH', 'LENDS', 'A', 'HAND'], at: [W(7, 'tech'), W(7, 'lend'), W(7, 'a'), W(7, 'hand')], until: 41.7, hi: 0},
  {w: ['SPENDING', 'ANYONE', 'CAN', 'CHECK'], at: [W(7, 'spending'), W(7, 'anyone'), W(7, 'can', 2), W(7, 'check')], until: 44.1, hi: 3},
  {w: ['AI', 'SPOTS', 'WASTE'], at: [W(7, 'ai'), W(7, 'spots'), W(7, 'waste')], until: 45.8, hi: 2},
  {w: ['MATCHES', 'HOMES', 'AND', 'JOBS'], at: [W(7, 'matches'), W(7, 'homes'), W(7, 'and', 3), W(7, 'jobs')], until: 48.3, hi: 1},
  {w: ['ROBOTS', 'HELP', 'BUILD', 'AND', 'CARE'], at: [W(7, 'robots'), W(7, 'help'), W(7, 'build'), W(7, 'and', 4), W(7, 'care')], until: 50.3, hi: 4},
  {w: ['NOT', 'ONE', 'FIX.', 'ALL', 'OF', 'US.'], at: [W(7, 'picture'), W(7, 'picture'), W(7, 'picture'), W(7, 'all'), W(7, 'of'), W(7, 'us')], until: 53.1, hi: 4},
  {w: ['WHAT', 'WOULD', 'YOU', 'FIX', 'FIRST?'], at: [W(8, 'what'), W(8, 'would'), W(8, 'you'), W(8, 'fix'), W(8, 'first')], until: 55.2, hi: 3},
  {w: ['COMMENT', 'ONE'], at: [W(8, 'comment'), W(8, 'comment')], until: 57.6, hi: 1},
];
const Captions: React.FC<{t: number}> = ({t}) => {
  const c = CAPS.find((c) => t >= c.at[0] - 0.05 && t < c.until + 0.25);
  if (!c) return null;
  const out = 1 - seg(t, c.until, c.until + 0.25);
  const size = c.size ?? 74;
  return (
    <div style={{position: 'absolute', top: 290, left: 60, width: 880, opacity: out}}>
      <div style={{display: 'flex', flexWrap: 'wrap', columnGap: 20, rowGap: 4, position: 'relative'}}>
        {c.w.map((w, i) => {
          const p = seg(t, c.at[i] - 0.04, c.at[i] + 0.2);
          return (
            <span key={i} style={{fontFamily: F, fontWeight: 900, fontSize: size, lineHeight: 1.12, letterSpacing: -2, color: C.ink, opacity: p, transform: `translateY(${(1 - eo(p)) * 20}px)`, display: 'inline-block',
              background: i === c.hi ? `linear-gradient(transparent 55%, rgba(255,196,107,0.95) 55%)` : 'transparent', padding: '0 6px', whiteSpace: 'nowrap'}}>{w}</span>
          );
        })}
        {c.circle !== undefined && (
          <svg style={{position: 'absolute', left: -30, top: -26, overflow: 'visible'}} width={10} height={10}>
            <Marker d="M20 70 C 40 -10, 820 -20, 870 60 C 900 140, 120 170, 30 110 C -10 80, 40 30, 120 20" p={E(t, c.circle - 0.1, c.circle + 0.6)} w={10} len={2600} />
          </svg>
        )}
      </div>
    </div>
  );
};

const Hook: React.FC<{o: number}> = ({o}) => (
  <div style={{position: 'absolute', top: 280, left: 60, width: 900, opacity: o}}>
    <div style={{fontFamily: F, fontWeight: 900, fontSize: 102, lineHeight: 1.04, letterSpacing: -3, color: C.ink, whiteSpace: 'nowrap'}}>SIX COUNTRIES.</div>
    <div style={{fontFamily: F, fontWeight: 900, fontSize: 76, lineHeight: 1.2, letterSpacing: -2, color: C.ink, whiteSpace: 'nowrap', marginTop: 6}}>
      PROTESTING{' '}
      <span style={{position: 'relative', display: 'inline-block'}}>
        <span style={{position: 'absolute', left: -10, right: -12, top: '48%', height: '44%', background: 'rgba(255,196,107,0.95)', transform: 'rotate(-1.5deg)', borderRadius: 6}} />
        <span style={{position: 'relative'}}>PRICES.</span>
      </span>
    </div>
  </div>
);

const NotOne: React.FC<{t: number}> = ({t}) => {
  const items = [{l: 'ONE COMPANY', at: W(5, 'company'), x: 110, y: 700, w: 560}, {l: 'ONE GOVERNMENT', at: W(5, 'government'), x: 170, y: 960, w: 680}];
  const out = E(t, 33.0, 33.5);
  return (
    <>
      {items.map((it, i) => {
        const p = seg(t, it.at - 0.6, it.at - 0.25);
        const x = E(t, it.at, it.at + 0.4);
        if (p <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: it.x, top: it.y, opacity: cl(p * 3) * (1 - out), transform: `rotate(${i ? 3 : -3}deg) scale(${0.8 + 0.2 * eo(p)})`}}>
            <div style={{background: C.page, border: `6px solid ${C.ink}`, borderRadius: 20, padding: '26px 30px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '8px 10px 0 rgba(31,26,21,0.2)'}}>
              <div style={{width: 80, height: 80, borderRadius: '50%', border: `6px solid ${C.ink}`, background: C.saf2, position: 'relative'}}><div style={{position: 'absolute', left: 20, top: 8, width: 28, height: 28, borderRadius: '50%', background: C.page, border: `5px solid ${C.ink}`}} /></div>
              <div style={{fontFamily: F, fontWeight: 900, fontSize: 50, color: C.ink, whiteSpace: 'nowrap'}}>{it.l}</div>
            </div>
            <svg style={{position: 'absolute', left: -20, top: -20, overflow: 'visible'}} width={10} height={10}>
              <Marker d={`M0 20 L${it.w} 150`} p={x} w={16} len={900} />
              <Marker d={`M${it.w} 20 L0 150`} p={E(t, it.at + 0.2, it.at + 0.55)} w={16} len={900} />
            </svg>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- composition
export const Europe: React.FC = () => {
  const raw = useCurrentFrame();
  const frame = raw >= N - HOLD ? 0 : raw;
  const t = frame / FPS;
  const cam = camAt(t);
  // fold the map down into the table, and back up at the end
  const fold = E(t, 33.0, 34.1) * (1 - E(t, 57.75, 58.95));
  const tableUp = E(t, 33.3, 34.3) * (1 - E(t, 57.6, 58.7));
  const warm = E(t, 32.8, 34.5) * (1 - E(t, 57.8, 58.9));
  const pulse = t < H0 ? 0 : (t - H0) / 1.6;
  const lit: Record<string, number> = {};
  const reLight: Record<Cn, number> = {France: W(2, 'france'), Spain: W(2, 'spain'), Belgium: W(2, 'belgium'), Italy: W(2, 'italy'), Portugal: W(2, 'portugal'), Albania: W(2, 'albania')};
  for (const c of SIX) {
    const dim = E(t, 8.45, 8.75) * (1 - E(t, reLight[c] - 0.05, reLight[c] + 0.3));
    lit[c] = (1 - dim) * (1 - 0.6 * E(t, 22.0, 22.6) * (1 - E(t, 25.4, 26.2)));
  }
  const hookO = 1 - E(t, 3.5, 3.95) + E(t, 58.2, 58.9);
  const costs = t > 21.9 && t < 26;
  const bg = mix(C.paper, C.warm, warm);
  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(70% 50% at 50% 55%, rgba(255,214,150,${0.45 * warm}) 0%, rgba(255,214,150,0) 70%)`}} />
      {/* the board: map + overlays, folds away for the table */}
      {fold < 0.999 && (
        <AbsoluteFill style={{transform: `perspective(1800px) rotateX(${fold * 80}deg) translateY(${fold * 260}px)`, transformOrigin: '50% 1500px', opacity: 1 - seg(fold, 0.7, 1)}}>
          <AbsoluteFill style={{transform: `translate(540px, 1010px) scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)`, transformOrigin: '0 0'}}>
            <Board t={t} lit={lit} pulse={pulse} />
          </AbsoluteFill>
          <AbsoluteFill style={{background: `linear-gradient(${C.paper} 0px, ${C.paper} 250px, rgba(245,236,221,0.88) 420px, rgba(245,236,221,0) 640px)`}} />
          <AbsoluteFill style={{background: C.paper, opacity: 0.55 * E(t, 22.0, 22.4) * (1 - E(t, 25.2, 25.8))}} />
          <Street t={t} />
          {costs && <Costs t={t} />}
          <NotOne t={t} />
        </AbsoluteFill>
      )}
      {tableUp > 0.001 && <Table t={t} up={tableUp} />}
      <Hook o={cl(hookO)} />
      <Captions t={t} />
      <div style={{position: 'absolute', top: 1462, left: 60, display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7}}>
          <Img src={staticFile('logo.png')} style={{width: 40, height: 40}} />
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: C.ink}}>OMNIX</span>
        </div>
        <span style={{fontFamily: M, fontWeight: 700, fontSize: 26, color: C.ink, opacity: 0.7 * E(t, 57.9, 58.2) * (1 - E(t, 58.6, 58.9))}}>@omnixteam</span>
      </div>
    </AbsoluteFill>
  );
};
