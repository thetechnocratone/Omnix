# The Brief by Omnix — daily episode playbook

One narrated 35–55s news-explainer reel per weekday on the most important story in
blockchain, crypto, AI or robotics. Episode 1 (`media/2026-10-13_week/brief/ep1/`,
`ep1_bunker_mode.mp4`) is the reference for look, pacing and tone.

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
- Commit + push the mp4 (and a cover jpg) to this repo; public URL is
  `https://raw.githubusercontent.com/thetechnocratone/Omnix/main/<path>`.
- Metricool (blogId 7386926, timezone Asia/Calcutta): one post, providers instagram + facebook + youtube,
  scheduled 4:00 PM IST the same day (later if that slot is taken); instagramData type REEL,
  showReelOnFeed true, isAiGenerated true; facebookData type REEL with a title; youtubeData type short,
  public, category SCIENCE_TECHNOLOGY, madeForKids false, title ≤ 100 chars ending "#Shorts".
- Caption: hook line + 2–3 short paragraphs + takeaway + "Source: X, date. Not financial advice." +
  "The Brief by Omnix · Built in Bengaluru 🇮🇳" + 6–8 hashtags incl. #TheBrief #Omnix.
- Append the episode to `media/brief_log.md` (date, story, source URL, file, Metricool post time).
