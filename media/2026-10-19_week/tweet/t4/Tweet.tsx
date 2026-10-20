import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';

loadFont({family: 'InterR', url: staticFile('Inter-Regular.otf')});
loadFont({family: 'InterSB', url: staticFile('Inter-SemiBold.otf')});
loadFont({family: 'InterB', url: staticFile('Inter-Bold.otf')});

export const FPS = 30;
export const LOOP = 20.0;                     // 6 bars at 72 bpm, same as the music loop
export const FRAMES = Math.round(LOOP * FPS); // 500

const PAGE = '#FBFAF3', INK = '#151515', ORANGE = '#E8920E', GREY = '#73706A';
// ghost tones: the whole post is faintly on screen at frame one and again at the last frame, so the loop is seamless
const GHOST_INK = [190, 185, 176], GHOST_OR = [242, 207, 150];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixc = (a: number[], b: number[], p: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * p)).join(',')})`;

const BLOCKS: {text: string; orange?: boolean}[] = [
  {text: '2017: JPMorgan’s CEO calls Bitcoin a “fraud.”'},
  {text: '2026: JPMorgan says Bitcoin will beat US stocks AND gold for the next 10 years.'},
  {text: '10% a year vs 7.5% for stocks and 5.5% for gold.'},
  {text: 'The banks didn’t change Bitcoin. Bitcoin changed the banks.', orange: true},
];
// reveal schedule
type W = {w: string; s: number; b: number};
const WORDS: W[] = (() => {
  const out: W[] = [];
  let t = 0.35;
  BLOCKS.forEach((blk, b) => {
    if (b > 0) t += blk.orange ? 0.9 : 0.4;
    for (const w of blk.text.split(' ')) { out.push({w, s: t, b}); t += blk.orange ? 0.25 : 0.17; }
  });
  return out;
})();
const FADE_OUT_START = LOOP - 0.6, FADE_OUT_END = LOOP - 0.08;

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

const Badge: React.FC<{size: number}> = ({size}) => {
  const pts = Array.from({length: 96}).map((_, i) => {
    const a = (i / 96) * Math.PI * 2;
    const r = 50 * (0.9 + 0.1 * Math.cos(a * 8));
    return `${60 + r * Math.cos(a)},${60 + r * Math.sin(a)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 120 120" width={size} height={size}>
      <polygon points={pts} fill="#1D9BF0" />
      <path d="M38 61 L53 76 L83 45" fill="none" stroke="#fff" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const Tweet: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const back = ease((t - FADE_OUT_START) / (FADE_OUT_END - FADE_OUT_START)); // 0 → 1 as the post returns to its ghost state
  let wi = 0;
  return (
    <AbsoluteFill style={{background: PAGE}}>
      {/* header, centred card like the reference */}
      <div style={{position: 'absolute', top: 300, left: 111, display: 'flex', alignItems: 'center', gap: 30}}>
        <div style={{width: 144, height: 144, borderRadius: 72, background: '#FFF', border: '4px solid #E9E2D6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
          <Img src={staticFile('logo.png')} style={{width: 132, height: 132}} />
        </div>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{fontFamily: 'InterB', fontSize: 46, color: INK}}>omnix</span>
            <Badge size={46} />
          </div>
          <div style={{fontFamily: 'InterR', fontSize: 38, color: GREY, marginTop: 2}}>@omnixteam</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 500, left: 111, right: 150}}>
        {BLOCKS.map((blk, b) => (
          <div key={b} style={{fontFamily: blk.orange ? 'InterSB' : 'InterR', fontSize: blk.orange ? 60 : 52, lineHeight: 1.26, marginBottom: blk.orange ? 0 : 30, display: 'flex', flexWrap: 'wrap', columnGap: '0.27em'}}>
            {blk.text.split(' ').map((w) => {
              const W0 = WORDS[wi++];
              const p = ease((t - W0.s) / 0.35) * (1 - back);
              const full = hex(blk.orange ? ORANGE : INK);
              return <span key={wi} style={{color: mixc(blk.orange ? GHOST_OR : GHOST_INK, full, p), transform: `translateY(${(1 - p) * 10}px)`, display: 'inline-block'}}>{w}</span>;
            })}
          </div>
        ))}
      </div>
      <Audio src={staticFile('music.wav')} />
    </AbsoluteFill>
  );
};
