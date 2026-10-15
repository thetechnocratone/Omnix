# The Brief by Omnix — daily episode playbook

One narrated 35–55s news-explainer reel per weekday on the most important story in
blockchain, crypto, AI or robotics. Episode 1 (`media/2026-10-13_week/brief/ep1/`,
`ep1_bunker_mode.mp4`) is the reference for look, pacing and tone.

## 0. When something breaks (all series)
The owner wants problems fixed, not just reported. If a step fails (render error, Speko/Metricool/GitHub
error, a broken script after an edit), diagnose it and fix it yourself (repair the script, retry once,
use the next free slot, pick another verified story) and commit the fix with a clear message. Only if
you truly cannot fix it: don't publish a lower-quality or unverified episode; tell the owner exactly
what broke, what you tried, and the one thing they need to do (e.g. top up Speko credit, reconnect an
account). Always mention any fix you made in the final message.

## Verified tick (all series, from 15 Oct 2026)
Omnix (@omnixteam) has the blue verified tick on both X and Instagram. Every tweet-style card or reel,
and any design that shows the account header or handle, must show the blue tick next to "Omnix".
Use `tools/omnix_header.py` (`header()`), which `statement_card.py` and `card_reel.py` already use.
Never make a tweet-style design without the tick.

## Visual devices worth reusing (from the owner's reference posts)
- Everyday-scene metaphor for a system: e.g. a top-down city block where four shops with different signs all
  pay one landlord (= market structure), drawn as an illustrated map with paper cards pinned on it and thin
  connecting lines appearing as the narration names each player.
- Big numbers as hero type: huge figure, unit in smaller italic beside it ("$2.4 billion", "200 people").
- A grid of many small tiles/portraits to make a count feel human ("200 people").
Draw these ourselves in the bright theme; never use film clips, real logos or real people's photos.

## Covers / thumbnails (all reels on YouTube, Instagram and Facebook)
Every reel gets a designed 9:16 cover, EXCEPT tweet-format/statement-card reels (they are their own cover).
- Make it with `tools/reel_cover.py <spec.json>` (spec format in the script header; examples in
  `media/covers_src/`). Save next to the video as `<name>_thumb.jpg` (1080x1920).
- Bright cream/saffron theme only. Top row: Omnix logo + series label (THE BRIEF / OMNIX EXPLAINS /
  BUILD TOGETHER / ...). A 3-7 word headline that teases the hook with one saffron-highlighted word;
  one clear illustration we draw ourselves in SVG (thick ink outlines, saffron accents, no real logos,
  photos or people); a dark pill tag; a tiny source/disclaimer line when the reel has one.
- Look at the render before using it (text fits, nothing overlaps, readable at phone-grid size).
- Metricool: pass the raw GitHub URL as `videoThumbnailUrl` for Instagram + Facebook reels (not
  `videoCoverMilliseconds`). Metricool must NOT carry YouTube (its free plan's YouTube limit is used up).
- YouTube: upload through YouTube Studio in the browser (custom thumbnails work there), using the same cover.

## 1. Pick the story
- Search the last 24–48 h of news (CoinDesk, The Block, Decrypt, Reuters, Bloomberg, The Verge,
  TechCrunch, IEEE Spectrum, The Robot Report, official company/foundation posts).
- Choose ONE story that matters to people into crypto, AI agents and robotics. Rotate topics across
  the week (don't do crypto five days running). Prefer stories with a clear "why it matters".
- Check `media/brief_log.md` and never repeat a story already covered.
- Verify every fact and number against at least one primary or reputable source. Quote people only with
  words they actually said/wrote. If facts conflict or can't be verified, pick another story.

## 2. Script (≈90–130 words, 6–9 beats)
- Hook first line. Plain English. Balanced: include the caveat/counterpoint.
- Never give financial advice or price predictions. No hype, no FUD.
- Open on the most specific, surprising detail of the story (a number, an object, a moment), and where it fits
  naturally, end with a callback to that opening hook (see reference: founder-story reels).
- Close with a one-line takeaway for builders. Omnix is NOT mentioned in the narration except, at most,
  a subtle tie-in. OmniChain is not live — never imply it is. No "still in development" wording.
- No name-dropping/tagging people to get attention; naming a source of a quote is fine.
- Write `draft.json` in `media/<week>/brief/epN/`: dateLabel ("14 OCT 2026"), sourceShort
  ("Source: Reuters"), sourceFull ("Source: Reuters, 13 Oct 2026"), and segs (one per beat) each with
  scene name, keys (exact words to highlight in saffron, including punctuation), parts (sentences/phrases).

## 3. Voice (Speko MCP `audio_synthesize`)
- One call per part, in order, so clips stay small enough to come back as base64:
  `{"text": part, "intent": {"language": "en-IN"}, "voice": "w4dqs2hV4dpYqFQCkK2G",
    "constraints": {"allowedProviders": {"tts": ["elevenlabs"]}}}`
  (voice = "Alok Paul – calm & friendly", same as Ep 1). Decode `audio_base64` to
  `vo_parts/001.wav`, `002.wav`, … (large tool results are saved to a file — use jq to extract).
- Then `python3 tools/brief_reel/assemble_voice.py <epdir>` → `vo.wav` + `episode.json` with timings.

### 3b. Voice fallback — ONLY when Speko absolutely cannot be used (owner's rule, 14 Oct 2026)
Speko is always the voice. Switch only if Speko cannot produce the audio after one retry: out of credit
(check `credits_balance_get`), auth/account error, or repeated provider failure. Never switch for convenience.
Fallback = local Kokoro on the owner's Mac, preset **Kokoro B** (see `tools/voice_fallback/presets.json`):
- Needs the owner's Mac linked (`mcp__remote-devices__device_*` tools present and folder `~/OmnixVoice` granted).
  Write `~/OmnixVoice/jobs/<epname>.json` = `{"items":[{"name":"001","text":part,"voice":"am_fenrir:0.45,am_michael:0.35,am_puck:0.2","speed":0.92,"lang":"a"}, ...]}`
  (one item per part, names 001, 002 … in reading order). A background service on the Mac picks it up within
  ~20 s; wait until `jobs/<epname>.json` has moved to `jobs/done/` (check `engine/log.txt` for FAILED).
- Stage `~/OmnixVoice/out/001.wav …` with `device_stage_files`, master each with the ffmpeg `-af` chain in
  `presets.json` (`master_ffmpeg_af`), save as `vo_parts/NNN.wav`, then run assemble_voice.py as usual.
- Say in the owner message that this episode used the Kokoro fallback voice and why (e.g. Speko credit out).
- If the Mac is not reachable either: follow section 0 — don't publish; tell the owner to top up Speko.

## 4. Visuals
- Write `<epdir>/scenes.js`: one `S.<scene>=(p,lt,d,t)=>{...}` per beat, drawn on the 1080×1920
  canvas `x` (p = 0..1 progress through the beat, lt = seconds into the beat). Reuse helpers from
  render.html: `txt, circle, rr, eo, eio, back, cl, rng, IMG('star'|'logo'|'lotus'|'conch')`,
  colours `INK SAF MAR LIGHT PAPER MUTE RED`, centre line `CY` (=1130). See ep1/scenes.js.
- Style: flat illustrated metaphors (vault, lock, maze, shield, hourglass…), ink + saffron on cream
  paper, one idea per beat, animate in sync with the words (time reveals by p). Subtle Vedic/nature
  hints (lotus, sun, mountains, conch) where they fit. Never draw real logos, real people, brand
  characters or copyrighted artwork.
- Preview: `python3 tools/brief_reel/drive.py <epdir> stills <t1> <t2> ...` and LOOK at the frames
  (captions present, nothing overlapping or cut off, text legible, animation timed to the words).
  Fix and re-check before rendering.
- Render: `drive.py <epdir> video <epdir>/silent.mp4`; music:
  `music.py <epdir>/music.wav <endStart+4> <episode number>`; mix:
  `mix.sh <epdir>/silent.mp4 <epdir>/vo.wav <epdir>/music.wav media/<week>/brief/epN_<slug>.mp4`.
- Watch a contact sheet of the final file before publishing.

## 5. Publish
- `git pull --rebase` first (another scheduled run may have pushed). Commit + push the mp4 (and a cover jpg) to this repo; public URL is
  `https://raw.githubusercontent.com/thetechnocratone/Omnix/main/<path>`.
- Metricool (blogId 7386926, timezone Asia/Calcutta): one post, providers instagram + facebook + youtube,
  scheduled 4:00 PM IST the same day (later if that slot is taken); instagramData type REEL,
  showReelOnFeed true, isAiGenerated true; facebookData type REEL with a title; youtubeData type short,
  public, category SCIENCE_TECHNOLOGY, madeForKids false, title ≤ 100 chars ending "#Shorts".
- Caption: hook line + 2–3 short paragraphs + takeaway + "Source: X, date. Not financial advice." +
  "The Brief by Omnix · Built in Bengaluru 🇮🇳" + 6–8 hashtags incl. #TheBrief #Omnix.
- Append the episode to `media/brief_log.md` (date, story, source URL, file, Metricool post time).

---

# Omnix Explains — twice-weekly explainer (Wed + Sat)

Plain-English explainers of ONE concept from blockchain, crypto, AI or robotics, made so a complete
beginner understands it. Reference: `media/2026-10-13_week/explains/ep1/` (tokenization, 80 s).
Same pipeline as The Brief (draft.json → Speko clips → assemble_voice.py → scenes.js → drive.py →
music.py → mix.sh) with these differences:

- THEME: always the bright default theme (cream paper, ink, saffron), same as The Brief. Do NOT use
  `"theme": "night"`: the owner reviewed the dark look on Ep 1 and does not want it.
- `draft.json`: `"series": "EXPLAINS"`, `"dateLabel": "OMNIX EXPLAINS #N"`,
  `sourceShort`/`sourceFull` name the data source (or "Not financial advice" if no figures are used).
- Ep 1 (tokenization) was made in the old dark theme; reuse its teaching structure and helper ideas
  (`coin`, `person`, `tower`) but redraw for the bright theme: light fills (#EADCC4 / PAPER), INK
  outlines, saffron highlights (see The Brief ep1/scenes.js for the bright look).
- Length 55–85 s, 8–10 beats, ~150–190 words. Teaching method:
  1. Everyday hook in India ("Imagine owning a tiny slice of a building in Bengaluru").
  2. How it works today (the problem), shown as a simple flow.
  3. The concept in one sentence, then one visual metaphor.
  4. 2–3 concrete examples or benefits, one per visual.
  5. One verified real-world number (check it against the original data source on the day).
  6. The honest catch / limitation.
  7. One-line takeaway, then a callback to the opening hook.
- No jargon without an instant plain-English translation. One idea per beat. No financial advice,
  no price talk, no promises; OmniChain/A.L.K.I./OmniBot are not mentioned except at most a subtle
  tie-in, and OmniChain is never described as live.
- Topic backlog (pick the next unused one, or a better one if the week's news makes another concept
  timely; log it in `media/explains_log.md`): blockchain itself · wallets & private keys · stablecoins ·
  smart contracts · AI agents · how large language models work · humanoid robots · zero-knowledge proofs ·
  staking & proof of stake · DAOs · crypto bridges · quantum computers vs crypto · gas fees ·
  oracles · self-custody vs exchanges · robot learning from demonstration · AI alignment.
- If `media/explains_log.md` or Metricool already shows an Explains episode scheduled for today,
  do not make another one: stop and report.
- Publish via Metricool (blogId 7386926) at 1:00 PM IST on the run day (next free half-hour if taken):
  Instagram REEL (showReelOnFeed true, isAiGenerated true), Facebook REEL with title, YouTube short
  (category EDUCATION, title "<Concept> explained in 60 seconds #Shorts" style). Caption: hook line,
  3 short plain-English paragraphs, takeaway, data source + "Not financial advice", "Omnix Explains ·
  Built in Bengaluru 🇮🇳", 6–8 hashtags incl. #OmnixExplains #Omnix.
- Before every push: `git pull --rebase` (The Brief task may have pushed the same morning).

---

# Build Together — weekly vision reel (Sundays)

One narrated 50–70 s reel a week about a real problem Omnix wants to help solve, at city, country or world
scale, told so that anyone who shapes that system (officials, planners, company heads, engineers, citizens)
recognises themselves WITHOUT being named or addressed. Reference: `media/2026-10-13_week/together/ep1/`
(Bengaluru traffic, 66 s). Same pipeline and bright theme as The Brief; `draft.json` uses
`"series": "BUILD TOGETHER"`, `"dateLabel": "#N · TOPIC"`, and an optional `"signoff"` for the end card.

- Structure: one verified, human-scale number as the hook (e.g. "168 hours a year = one full week") →
  why the problem is really many disconnected systems → "What if they talked to each other?" →
  2–3 concrete things that become possible (plain words, no product claims) → intelligence to plan it +
  a shared trusted record so everyone can believe the data (the Omnix ecosystem, see
  "Omnix's role" below) → nobody builds this alone → many people working from the same truth →
  a nature/Vedic image of coming together → callback to the hook.
- Collaboration visuals every time: a single node becoming a network, many hands, rivers meeting the
  ocean, orbits lining up, lotus, sunrise.
- Never name or tag people, departments or officials; never say "policymakers" or "leaders, contact us".
  The invitation is implied by the story.
- Quiet sign-off, NOT on every episode (roughly every other one): end card signoff
  "Built in Bengaluru · Open to collaboration" or a final caption line "Our DMs are open." Otherwise
  use the default end card. Never a pitch.
- Narrative scale (owner's direction): start from a vivid, specific Bengaluru problem, then widen masterfully
  to India and to the world ("This isn't just Bengaluru…"), then bring it home with the callback.
- Topic backlog, IN THIS ORDER (owner's list; log in `media/together_log.md`, never repeat):
  1. Garbage on footpaths (Bengaluru → India's cities → the world's waste)
  2. Potholes and bad roads
  3. Metro construction that seems to take forever (infrastructure delays)
  4. Bad air quality (AQI)
  5. The smell from wet-waste processing plants in south Bengaluru (describe generally; never name or
     blame a specific plant, company or official)
  then global problems: hunger · lack of clean drinking water · corruption that stalls development
  (frame as transparency and accountability; never name or accuse any person, party or department) ·
  then the remaining ideas: Bengaluru's water and lakes · financial inclusion · trust in public records ·
  healthcare access · farmers and supply chains · dignity of dangerous manual work · education · climate.
- Omnix's role (owner's direction): the episode may NAME OmniChain, Nishq, A.L.K.I. and OmniBot as the
  ecosystem Omnix is building to help with problems like this, e.g. "OmniChain is designed to keep a
  record no one can quietly edit", "OmniBot is being built for the dangerous work no one should have to
  do". Always future/design tense ("designed to", "being built to", "could"), never "solves" or "already",
  never imply OmniChain is live, never present Nishq as an investment (it is the network's utility
  asset). Products support the story; collaboration stays the hero.
- Any caption that names Nishq must end with: "Nishq is a utility asset. Nothing here is financial advice."
  Spell it "Nishq" (not "Nishk").
- Verify every number against its original source on the day; name the source on the end card.
- Publish via Metricool (blogId 7386926) Sunday 11:00 AM IST (next free half-hour if taken): IG REEL
  (showReelOnFeed true, isAiGenerated true), FB REEL with title, YouTube short (category
  SCIENCE_TECHNOLOGY). Caption: the hook, 2–3 short paragraphs on the problem and what could be built
  together, source line, optional quiet sign-off, 6–8 hashtags incl. #BuildTogether #Omnix #BuiltInBharat.
