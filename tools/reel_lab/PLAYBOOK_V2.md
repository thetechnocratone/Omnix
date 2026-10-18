# Omnix reels — Playbook v2 (from 19 Oct 2026)

This replaces the "how it looks" parts of `tools/brief_reel/PLAYBOOK.md`. The hard rules, voice settings and
logs from that file still apply. The engine that makes these reels lives in `tools/reel_lab/` (see its README).
The four styles were chosen by the owner on 18 Oct 2026 after comparing four re-cuts of Brief ep 7
(`media/experiments/2026-10-18_ep7_variants/`).

## 0. What we make, every day

Four reels a day, one per series, each in its own house style:

| Series | Style | Reference cut | Length | Voice |
| --- | --- | --- | --- | --- |
| Tweet-style reel | **The Loop** — kinetic type, the hook is on screen at frame one, the last frame runs into the first | `A` | 15–35 s | none or a few words; type carries it |
| The Brief (news) | **The Story** — one character or object travels through a metaphor world; every beat is an action you can see | `B` | 40–55 s | Speko narration |
| Omnix Explains | **The Documentary** — editorial serif type, big serif numbers, pinned paper cards joined by thread, real charts, footnoted caveats | `C` | 45–60 s | Speko narration, unhurried |
| Build Together | **POV** — "POV: you're …", text-led, works fully on mute; ends on what many hands could change | `D` | 25–45 s | none (optional single closing line) |

Our domain: science, technology and engineering, with blockchain, crypto, AI and robotics at the centre.
Any of it is fair game when it gives viewers something real: an engineering marvel, a space launch, a
physics idea behind a viral moment, a chip breakthrough.

## 1. Picking the day's four topics (do this properly every day)

**Mass appeal first.** Our audience is everyday people curious about the future, not specialists. Every topic must pass: "Would a non-tech friend stop scrolling for this, and understand it by the end?"

Research the last 24–72 h before choosing. Sources: Techmeme, CoinDesk, The Block, Decrypt, Cointelegraph,
Reuters, Bloomberg, The Verge, TechCrunch, IEEE Spectrum, The Robot Report, aiweekly.co, Hacker News front
page, official company/lab posts, and what is being memed on X / Instagram / YouTube right now.

- **Tweet reel = the most viral moment in our wider space.** If the whole internet is joking about something
  (e.g. the flying-car demo of 15 Oct 2026), make our own witty, true abstraction of it, the way brands of every
  kind riff on a viral tech moment. Tie it back to what Omnix stands for (trust, intelligence, embodiment,
  Built in Bharat) in one clever turn, never a pitch.
- **Brief = the most important/trending news story** for people into crypto, AI agents and robotics. A story
  with a clear "why it matters" and a visual you can build a world around.
- **Explains = the concept people are suddenly asking about** because of the news (e.g. after rogue-agent
  disclosures, explain what "an AI agent going rogue" means). Check `media/explains_log.md`; never repeat.
- **Build Together = the problem people are feeling right now** (seasonal AQI, monsoon flooding, a water
  shortage, a viral civic complaint). Prefer the next item in the owner's backlog (brief_reel/PLAYBOOK.md) when
  it is also current; otherwise pick what is trending and log it.
- Spread the four across different subjects: never two reels on the same story on one day (a viral moment may
  appear in the tweet reel and inform an Explains topic only if the angles are clearly different).

### Trend-jacking rules
- Riff on the moment, not the person or company: no names of public figures, no logos, no product names in the
  visuals, nothing that implies an endorsement or partnership. "Cars can fly now" works because everyone knows.
- The joke must be true and kind. No punching down, no mocking real people, no tragedies, elections,
  religion, or communal topics, nothing that could read as a dig at a government body.
- Speed matters more than polish for the tweet reel: a trend is worth most within 24–72 h.

## 2. Writing

- **Open on the most specific, surprising thing**, already on screen in frame one (no logo, no fade-in, no
  "hey guys"). The on-screen hook must work silently and be readable in under 2 s.
- **One idea per beat; change something every 1–3 s, with one or two deliberate rests.** Vary beat lengths.
- **Translate every term the moment it appears** ("x402: a 'pay first' sign for machines").
- **Close the loop**: Loop/POV reels run back into frame one; Story/Documentary reels call back to the hook.
  No static end card longer than ~1.5 s.
- **Give people a reason to send it**: one line someone would DM a friend ("Your next customer might not be
  human."). Ask: who sends this to whom, and why?
- Balanced tone, the caveat stated plainly, no hype, no financial advice. Verify every number against its
  original source on the day; name the source on screen.
- Omnix's own products appear only where they fit naturally, always in future/design tense. OmniChain is not
  live. No "still in development" wording (use the four status lines in the old playbook only when needed).
  Any mention of Nishq ends with "Nishq is a utility asset. Nothing here is financial advice."

## 3. Production (the engine in `tools/reel_lab/`)

1. Voice (Brief, Explains): Speko `audio_synthesize`, whole script in one call, voice `w4dqs2hV4dpYqFQCkK2G`,
   `en-IN`, ElevenLabs; speed 1.05 for the Brief, ~0.98 for Explains. Then `audio_transcribe` with
   `word_timestamps: true` on the returned URL, fix names, `engine/vo.py` to trim pauses.
2. Picture: one `comp.js` per reel, everything a function of time, drawn with the shared illustration set in
   cream/ink/saffron. Check contact sheets (`render.py <dir> stills …`) and fix overlaps before rendering.
3. Keep captions and key text between y≈220 and y≈1450 (Instagram covers the bottom ~450 px and the right edge).
4. Render with adaptive motion blur (`--blur 16`), score with `engine/audio.py` (original synthesised music and
   foley in one room; voice ducks the music), master to −14 LUFS.
5. Deliver at `-crf 21 -preset slow` (~9 Mbps). Look at a contact sheet of the final file before posting.

Style notes per series:
- **Loop**: Montserrat 800, huge numbers/words, saffron highlight on key words, impact hits on beats,
  rhythmic music with a section that matches the opening so the loop is seamless in sound too.
- **Story**: a recurring character (the little Omnix robot) and a place (a Bengaluru street, a lab, a map);
  speech-bubble captions; marimba/tabla-led warm music; foley for every action.
- **Documentary**: Instrument Serif captions with a soft glow, italic serif numbers, paper cards with pins and
  red thread, footnotes for caveats; piano + strings + drone; slow camera drift.
- **POV**: first line "POV: you're …"; a monospace log, chat or diary device; text-only, so it must read on mute;
  lo-fi beat with key clicks and dings; ends on one shareable line, then loops to the POV title.

## 4. Covers / thumbnails
- Loop and POV reels: the frame-one hook is the cover (it is designed to be one).
- Brief and Explains: a designed 9:16 cover (`tools/reel_cover.py`, or a still from the engine with a headline
  card), 3–7 word headline with one saffron word, series label, readable at phone-grid size. Keep text in the
  centre 1080×1350 so the 4:5 grid crop still works.

## 5. Captions and hashtags (write natively for each platform)
- **Instagram**: first line is the hook (keyword-rich, it's searchable), 2–4 short lines of value, a soft
  prompt ("Send this to the friend who…"), source line, 3–5 topic hashtags (#AI #Crypto #Blockchain #Robotics
  #Omnix + one series tag). No link (link in bio).
- **Facebook**: same as Instagram but plain and slightly longer, real link allowed, 2–3 hashtags.
- **X**: one sharp line + optional second line, under 280 characters, 0–2 hashtags, native video.
- **LinkedIn**: professional framing, 3–6 short paragraphs, what it means for builders, one genuine question,
  source, 3–5 hashtags.
- **YouTube Shorts**: title ≤ 70 characters, curiosity-led, ending "#Shorts"; description 2–4 sentences + source
  + 3 hashtags; 6–10 tags.
- Always: source named, "Not financial advice." where crypto prices/assets are near, blue-tick on any tweet-style
  design, no invented facts.

## 6. Posting
- X, LinkedIn and YouTube: Buffer (organisation 6accbde23d8de51d258c917a; X 6accbfa9778b240e2fe57d2d,
  LinkedIn 6acd076d778b240e2fe8d53e; YouTube: look it up with `list_channels`).
- Instagram and Facebook: Meta Business Suite in Claude's built-in browser (Planner → create reel → schedule),
  uploading the mp4 and cover; set the cover frame explicitly.
- Suggested slots (IST): Build Together 11:00, Omnix Explains 13:00, The Brief 16:00, Tweet reel 19:00.
- Until the owner says otherwise, show the four finished reels and captions and get a yes before scheduling.
- Log every reel in its series log (`media/brief_log.md`, `explains_log.md`, `together_log.md`,
  `tweetreel_log.md`) with date, topic, source, file and post times.

## 7. Quality bar (check every reel before it goes out)
- Frame one stops the scroll on mute? A non-expert could explain the story afterwards?
- Something changes every 1–3 s, with rests? Nothing overlaps, clips or sits under the Instagram UI?
- Numbers verified and sourced? Caveat stated? Omnix wording rules followed?
- Music and SFX in one room, voice clear above them, −14 LUFS? Ending loops or calls back?
- Would someone send it to a friend? If not, rewrite the closing line.

## Learnings log (newest first; add to this every day)

- **18 Oct 2026 · Write for everyday people, not insiders.** The owner rejected a slate built for crypto insiders
  (a cryptography-standards mystery). Optimise for understanding, engagement, reach and followers:
  - Pick topics a 14-year-old or your parents would find interesting. The test: can you say why it matters in
    one sentence with no technical words? If not, pick another story or find the human angle.
  - Prefer stories with a human-scale hook: something you can picture (a car that jumps, an AI that picks a lock,
    smoke you breathe, an SMS code), money in your pocket, your safety, your city.
  - Explain with everyday objects and Indian life (a toll gate, pocket money, a darshini, an OTP, auto fares).
    No acronyms or jargon on screen unless translated in the same breath; never more than one new term per reel.
  - Niche depth goes in the caption and LinkedIn copy, not the reel.
- **18 Oct 2026 · Formats chosen.** Loop → tweet reels, Story → Brief, Documentary → Explains, POV → Build Together.
- **19 Oct 2026 · First full day in the new formats (learnings from production).**
  - POV works best with a *character* narrator (a smoke puff, a coin, a parcel) and a diary device ("DAY 1 / DAY 2 / ABOUT ME / MY JOB / WHAT I'M SCARED OF"). Each card = one sentence a 12-year-old gets.
  - Show scale with a side-by-side (a hair vs a dot "to scale"), not a number alone.
  - Endings with people: a row of raised hands in mixed skin tones reads instantly as "together"; a single clump of shapes does not.
  - Covers: big two-line question/claim in the top third, one illustration, three-word summary chips at the bottom; keep everything inside y≈300–1550 so the 4:5 grid crop and IG UI never cut it.
  - Trend-jacking without names: "2026: cars can fly / Also 2026: enter the OTP" rides the flying-car moment with zero brand or person named, and lands on our real point (trust/identity).
  - Pipeline: chain renders with until-loops on a "DONE" line in the previous task's output; the final `-preset slow` encode takes ~5 min on 2 CPUs, so don't render stills at the same time if timing matters.
- **18 Oct 2026 · Posting constraints.** Buffer's plan holds 10 scheduled posts at a time, so 4 reels × 3 channels (12) don't fit in one go: schedule in time order and add the last ones once the morning posts have gone out. Metricool is off-limits (owner's call). Meta Business Suite in the built-in browser can't receive a file from Claude (no file attach, page blocks outside downloads), so IG/FB uploads need another route. The account is verified on X and IG: keep the blue check on tweet-style cards.
- **18 Oct 2026 · Build Together gets a voice.** Owner asked for voiceover on the POV reel: the narrator (the smoke) reads the diary in first person, same voice as the Brief, speed 1.0. Retime every beat to the word timings; on-screen text stays as the muted version, so no extra captions needed. Default from now: POV reels have voiceover too.
- Buffer's 10-post cap was not enforced on 18 Oct (14 scheduled at once). Try first; only stagger if Buffer refuses.
- **18 Oct 2026 · Tweet-style reel look, locked by the owner (reference: media/2026-10-19_week/tweet/t2).** This replaces the illustrated Loop look for tweet reels.
  - Off-white #FBFAF3 page, nothing else on it. The post card is centred in the upper half: round avatar with the logo (r≈72), "omnix" in Inter Bold 46 + blue check (account is verified), "@omnixteam" in Inter 38 grey #73706A. Text starts at x≈111.
  - Two short blocks: a statement in Inter Regular 72, ink #151515, then the turn in Inter SemiBold 72, orange #E8920E. Max ~24 characters a line, 2 lines each.
  - Words fade in one at a time (~0.27 s apart), light grey/light orange → full colour with a 10 px rise. The orange block starts ~1.2 s after the black one finishes.
  - Hold the full post ~4 s, then crossfade to an end card: glowing logo, "theomnix.org", product line in orange ("<Product> · coming soon").
  - ~12–13 s total. Music only, no voice, no SFX: warm, slow, low-passed felt piano + pad + sub (spectral centroid ~400 Hz), mixed to -14 LUFS.
  - Writing: one plain-English truth everyone gets + one useful turn (an action or a reframe). Tie to a trending story without naming people or brands.
- **18 Oct 2026 · Custom thumbnails through Buffer.** Buffer only picks a frame from the video on X/LinkedIn. To use a designed cover: prepend it for 0.1 s (3 frames, audio delayed to match), upload that copy, and set thumbnailOffset 0. Name the copy `<reel>_cover.mp4`.
