# Reel Lab — Omnix reel engine (v2)

Built 18 Oct 2026 to re-cut The Brief ep 7 ("Agents pay in minutes") four ways and pick a house style.
Everything renders here: no npm/PyPI installs, no paid generators, no stock audio.

## Layout
- `engine/core.js` — the frame engine. Every frame is a pure function of time (`COMP.draw(t)`): paper ground,
  grain, vignette, keyed camera with a hand-held drift and impact shakes, springs and easings, and the Omnix
  illustration set (robot, coin, wallet, stopwatch, calendar, chip, globe, code-check, approve button, hand,
  toll gate, street stall, line-art lotus).
- `engine/comp.html` — loads fonts (Montserrat, Instrument Serif, JetBrains Mono, Fraunces; all OFL),
  `core.js`, then `<V>/comp.js` and `<V>/words.js`.
- `engine/render.py` — `stills` (contact sheet) and `video` (parallel headless Chromium, adaptive motion
  blur: up to `--blur N` shutter samples only where the picture actually moves).
- `engine/vo.py` — tightens voiceover pauses and remaps word timings.
- `engine/audio.py` — synthesised instruments (kick, clap, hats, shaker, tabla na/ge, sub, pluck, marimba,
  piano, pads, bell, tanpura drone), an SFX palette (whoosh, impact, tick, coin, pop, riser, thunk, paper,
  type, ding, scratch, glitch), a shared room reverb, and `mix()` (VO ducks the music, -14 LUFS / -1.5 dBTP).
- `A/ B/ C/ D/` — the four variants: `comp.js` (picture), `score.py` (music + SFX), `words.json` (timings).

## Making an episode
1. Script → Speko `audio_synthesize` (whole script in one call) → save `vo_raw.wav`.
2. Speko `audio_transcribe` on the returned URL with `word_timestamps: true` → `words_raw.json`
   (fix proper nouns: "Chain analysis" → "Chainalysis", "account" → "a count").
3. `python3 engine/vo.py <V> 0.28 [t=gap ...]` → `vo.wav` + `words.json`; then write `words.js`.
4. Write `<V>/comp.js`, check with `python3 engine/render.py <V> stills t1 t2 ...` and LOOK at the sheet.
5. `cd <V> && python3 score.py` → `music.wav` + `sfx.wav`.
6. `python3 engine/render.py <V> video <V>/silent.mp4 --blur 16 --workers 3`, then `audio.mix(...)`.
7. Delivery encode: `-c:v libx264 -crf 21 -preset slow` (~9 Mbps, Instagram-friendly).

## Rules learned on this cut
- Frame one must already show the hook (no fade-in, no logo).
- Keep captions and key text between y≈220 and y≈1450; Instagram's UI covers the bottom ~450 px.
- Hide captions when the picture already says the words in huge type.
- Change something every 1–3 s, but leave one or two rests; never cut on a metronome.
- Ends either loop into frame one (A, D) or call back to the hook (B, C). No long static end cards.
- `star.png` is a 7%-alpha watermark; use `logo.png` for the visible mark.

## Paths in this repo
`render.py` takes the episode folder relative to `tools/reel_lab/`, e.g.
`python3 tools/reel_lab/engine/render.py ../../media/2026-10-19_week/brief/ep8 stills 1 4 8`.
A `score.py` imports the kit with `sys.path.insert(0, '<repo>/tools/reel_lab/engine')`.
The four reference cuts (A Loop, B Story, C Documentary, D POV) are in `media/experiments/2026-10-18_ep7_variants/`.
