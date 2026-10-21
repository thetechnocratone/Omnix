# Omnix Brand & Production Bible

The single source of truth for every Omnix reel, card and caption. Read this first, then follow
`tools/reel_lab/PLAYBOOK_V2.md` for the daily workflow (topics, scripts, rendering, posting).
If a playbook and this file disagree on a brand rule, this file wins.

The fonts and colours below are the ones already in use. The sound logo (section 8) is still a proposal.

## 1. Who we are

- **Omnix: "Beyond Imagination."** Intelligence · Infrastructure · Embodiment. One ecosystem, built as one.
  Built in Bengaluru, Built in Bharat.
- **Products:**
  - **A.L.K.I.**: intelligence. Coming soon.
  - **OmniChain**: infrastructure. In the making. The whitepaper is out and the build is on, but it is **not
    live**. Never describe or imply that it is running.
  - **OmniBot**: humanoid robots for embodiment. Coming soon.
  - **Nishq**: the network's utility asset, natively protected by A.L.K.I. It is never presented as an
    investment. Any caption that names it ends with "Nishq is a utility asset. Nothing here is financial advice."
- **Status wording:**
  - Every Omnix product is shown as **"picture this"**, in future or design tense ("designed to", "being built
    to", "could"). Never "solves" or "already".
  - Never write "still in development". When a status line is needed, rotate "The whitepaper's out. The build
    is on." / "Being built right now in Bengaluru." / "In the making." / "The build is on."
  - Use a status line only when it's needed, not in every post.
- **Handles:** theomnix.org · Instagram, X and Threads @omnixteam · the Omnix LinkedIn page · YouTube ·
  Facebook. Contact: connect@theomnix.org.
- **Voice:**
  - Curious, clear, calm and confident.
  - Inclusive ("we", "together").
  - Never fear-mongering, never hype, never preachy.
  - Professional on X and LinkedIn, playful and technical on Instagram.
- **Core belief:** almost every big problem can be solved by the right kind of collaboration.

## 2. Look and colour (bright theme only)

Every reel, card and cover uses the **bright cream/saffron theme**. No dark canvases, no night theme. The owner
reviewed the dark look and rejected it.

**Narrated reels (Brief, Explains, Solved, Build Together):**

| Token | Hex | Use |
|---|---|---|
| Paper | `#F5ECDD` | Canvas (with a soft radial glow `#FBF5EA` → `#E9DBC3`) |
| Fill | `#FFF7EA` / White `#FFFBF4` | Cards, panels, objects |
| Ink | `#1F1A15` | Outlines, all body text |
| Saffron | `#F08A12` | Key words, counters, the Omnix colour |
| Saffron light | `#FFC46B` | Highlights, glows |
| Saffron deep | `#C9650A` | Shadows, pressed states |
| Mute | `#8C8073` | Secondary text, labels |
| Line | `#DCCDB5` | Grids, wireframe floor, dividers |
| Tan | `#E9D5B5` | Object side faces |
| Red | `#C6452C` (`#E5532B` for stamps) | **Problem and danger only.** Never used in a solution beat |
| Sage | `#5E8A55` | Functional exception, only for ✓ / verified states |

**Tweet-style reels and cards (locked look):** page `#FBFAF3`, ink `#151515`, orange `#E8920E`, grey `#73706A`,
blue verified tick `#1D9BF0`.

**Mood shift, inside the bright theme:**
- Problem beats: muted paper, ink and red accents.
- Solution beats: warm saffron glow, highlights and the product motifs.
- Every narrated reel makes this shift once.

**Brand texture:**
- Omnix draws on Vedic teachings. Use faint line-art conch (shankha), lotus and the eight-pointed star-sun
  where they fit.
- Add subtle hints of nature and cosmos (sun, moon, mountains, ocean, birds, orbits), blended with the modern
  stack.

## 3. Typography

| Role | Font |
|---|---|
| Hooks, headlines, big numbers, Loop reels, covers | **Montserrat** 800–900 (the letterhead font), caps for hooks |
| Tweet-style reels and cards | **Inter** (Regular for the statement, SemiBold for the orange turn, Bold for the name) |
| Omnix Explains (Documentary style) | **Instrument Serif** captions and italic serif numbers |
| HUD, terminal, data, POV logs | **JetBrains Mono**, only where the style calls for it |

- All fonts are OFL and loaded from local files with `@remotion/fonts`, so renders match every time.
- Make sure a font has finished loading before any frame renders (see section 5).

## 4. Marks and motifs (fixed across every style)

- **Logo:** the eight-pointed saffron star-sun plus the OMNIX wordmark.
  - Small watermark in the bottom-left safe area at about 70% opacity.
  - Never logo-first.
  - In the last second, the star-sun and @omnixteam appear small while the picture runs back to frame 0.
  - No separate end card.
- **Product motifs.** Each is redrawn in the reel's style (cut paper, wireframe, flat vector) but keeps its shape.
  All three use ink and saffron; there are no per-product colours.
  - OmniChain: a row of linked blocks.
  - A.L.K.I.: a neural-node constellation.
  - OmniBot: a humanoid silhouette (in Story reels, the little Omnix robot).
- **Community ("together") moments:**
  - Show people and institution icons together.
  - A row of raised hands in mixed skin tones.
  - Many nodes joining into one network, rivers meeting the ocean, a lotus opening, sunrise.
- **Verified tick:** every tweet-style design, and any design that shows the account header or handle, shows
  the blue tick next to "omnix". Use `tools/omnix_header.py` for card renders.

## 5. The frame 0 rule: scroll-stopper and thumbnail

Many platforms take no separate thumbnail, so frame 0 is the advert for the reel. It must never be blank, black
or half-built, and it has to make a scroller stop.

**Build it like a poster:**
- **Focal point:** one hero object or a giant number, filling about 40% of the frame.
- **Contrast:** ink on saffron, or saffron and ink on paper.
- **Hook:**
  - 7 words or fewer, on at most 2 lines, in huge caps (cap height 120 px or more).
  - It opens a curiosity gap the viewer wants closed.
  - It must be true to the reel. No bait.
- **Tension cue:** a surprising number, a "?", a "vs", or something visibly wrong (a crossed-out item, a stamp,
  a glitch).
- **Omnix mark:** small, bottom-left.
- **Hook zone:**
  - Keep the hook between y = 250 and y = 1520, and left of x = 940.
  - Keep all key text out of the top 250 px, bottom 400 px and right 140 px.
  - For designed covers, keep text inside the centre 1080×1350 area so the 4:5 and 3:4 grid crops work.

**Make sure it is really there:**
- **The 8-frame hold:**
  - Hold the finished poster completely still for the first 8 frames (about 0.27 s), then start motion.
    Some platforms grab a frame a few milliseconds in, and the hold makes every grab identical.
  - Because reels loop (section 9), the last 8 frames match the first 8.
- **No animation from zero on frame 0:**
  - Never fade in, scale up from zero, or animate opacity from 0 on frame 0.
  - Blank first frames usually come from springs or interpolations that start at 0, or from fonts and images
    that haven't loaded yet.
  - Wait for fonts, and wrap image loading in `delayRender`/`continueRender`.
- **No lead-in:** the video starts at frame 0 with no black lead-in, even if the audio starts a few frames later.
- **Buffer covers:** when a designed cover goes through Buffer, use the `<reel>_cover.mp4` copy (cover prepended
  for 0.1 s, `thumbnailOffset` 0). The reel itself still obeys this rule from its own frame 0.

**Automatic blank-frame guard.** After every render, run these two commands. If the second prints BLANK, fix the
reel before posting.

```
ffmpeg -y -i reel.mp4 -frames:v 1 frame0.png
python3 -c "from PIL import Image, ImageStat; s=ImageStat.Stat(Image.open('frame0.png').convert('L')); print('BLANK' if s.stddev[0]<20 or s.mean[0]<8 or s.mean[0]>247 else 'OK')"
```

**Scroll-stop scorecard.** All five must be yes:
1. Is the hook readable when the frame is shrunk to 150 px wide?
2. Is there one clear focal point?
3. Is there curiosity or tension a viewer can feel within 3 seconds?
4. Is the frame fully built, with nothing blank, black or mid-animation?
5. Is it true to what the reel actually says?

## 6. Pacing

- Fast burst in the first 3 seconds.
- Then alternate fast beats (1 to 1.5 s) with short holds (2 to 3 s), with one breathing hold roughly every
  10 seconds.
- Change something every 1 to 3 s, and never go longer than 2.5 s without new visual information.
- Never leave a dead static frame. Never cut on a metronome.
- Each style sets its own cut rhythm (see the style library).

## 7. Text and language

- **One idea per beat**, and every on-screen hook readable in under 2 seconds on mute.
  - Key words appear at the moment they're spoken.
  - Hide captions when the picture already says the words in huge type.
- **Tweet-style reels** follow their locked look:
  - two short blocks, at most about 24 characters per line and 2 lines each;
  - words revealed one at a time;
  - the turn in orange.
- **Plain English** for everyday people, not insiders: "would a non-tech friend stop scrolling for this, and
  understand it by the end?"
  - Sentences of 14 words or fewer.
  - Translate every term the moment it appears.
  - At most one new term per reel.
  - Everyday Indian examples (an OTP, a toll gate, auto fares, filter kaapi, not chai).
- **Numbers** appear as animated counters. Show scale with side-by-sides, not a number alone.
- **Captions** are burned in. Most viewers watch muted.
- **Names and logos:** no name-dropping of public figures, and no addressing "leaders" or "policymakers". The
  invitation to collaborate is implied by the story.

## 8. Voice, music and sound

- **Voice:** the fixed Omnix voice, Speko (ElevenLabs) voice `w4dqs2hV4dpYqFQCkK2G`, en-IN.
  - Never change it.
  - Only if Speko truly cannot be used, fall back to Kokoro preset B, and say so.
  - The voice says "Alki"; the screen shows A.L.K.I.
  - Target 150 to 165 words per minute.
- **Music:** original, synthesised by Claude in the genre set for the reel. No copyrighted melodies, no stock
  audio.
  - Duck it about 14 dB under the voice.
  - Music and SFX share one room.
  - Master to −14 LUFS.
- **Sound logo (proposal):** a 0.6 s rising three-note chime at frame 0 on every reel, so viewers learn the sound.
  Not yet adopted.

## 9. Endings, engagement and rewatch

**Every reel loops seamlessly.** A reel that runs back into its own first frame gets replayed, and replays are
what the algorithms reward.
- **Picture:** the last beat runs back into the frame 0 poster. The reverse-replay of the hook scene works well:
  the last frame is pixel-identical to frame 0.
- **Sound:** the music's closing section matches its opening, so the loop is seamless in sound too.
- **Narrated reels** (Brief, Explains, Solved, Build Together): the closing line calls back to the opening hook
  and lands on the frame 0 poster. The ending resolves the story and starts it again at the same moment.
- **Tweet reels and POV reels:** they simply run back to the start.
- **Endings:** no static end cards and no Omnix sign-off cards. The small star-sun and @omnixteam in the last
  second are the only sign-off.

**Engagement:**
- **Calls to action** stay subtle hints. The Omnix handle never pushes, begs for likes or hard-sells.
- **Question:** one genuine question in the caption. A simple A-or-B or yes-or-no choice is good, because
  choices drive comments.
- **Share line:** give people a reason to send it, with one line someone would DM a friend ("Your next customer
  might not be human."). A soft prompt such as "Send this to the friend who…" is fine on Instagram.
- **Pinned comment:** carries the fine print, the key source and the deeper detail.
- **Meet the builders:** an occasional, quiet line ("Built in Bengaluru · Open to collaboration", "Our DMs are
  open.") on roughly every other Build Together or Solved reel, never as a pitch. Contact route: Instagram DM
  first, email second.

## 10. "Solved together" rules (problem reels: Solved by Omnix, Build Together)

- Omnix is one seat at the table, never the hero. Collaboration is the hero.
  - Show at least three other actors: citizens, governments, builders, students, businesses.
  - Use the words "we", "together" and "your part". Never "Omnix will fix it".
- Never blame a party, leader, department, company or country.
  - Never show violence.
  - Stay neutral on politics, religion and communal topics.
- Omnix products are shown as "picture this", and coming-soon products are labelled as such on screen.
- Tell the story at scale: start with a vivid, specific Bengaluru problem, widen to India and the world, then
  come home with the callback.

## 11. Accuracy and legal

- **No real people or brands:**
  - No real company logos, packaging or brand names in the visuals.
  - No likeness of real people.
  - Use generic UI and labelled shapes. Real names appear only as text, and only when the story needs them.
- **Verify before posting:**
  - Check every number against its original source on the day.
  - Name the source on screen, and in every caption.
  - Separate "reported" from "confirmed".
  - Date-check claims ("on 19 Oct…", never "yesterday" unless it was).
  - Quote people only with words they actually said.
- **Money:** "Not financial advice." on any money, crypto or asset content. No price predictions.
- **Where details go:** sources in the YouTube description and the LinkedIn post; fine print in the pinned comment.

## 12. Style library

Our four house styles come first:

| Series | Style | Notes |
|---|---|---|
| Tweet-style reel | **The Loop** | The locked tweet-card look. Inter, word-by-word reveal, warm felt-piano bed, loops to start |
| The Brief | **The Story** | A recurring character (the little Omnix robot) moves through a metaphor world. Every beat is a visible action. Wireframe grids, 3D objects, terminal HUD |
| Omnix Explains | **The Documentary** | Instrument Serif, big italic numbers, pinned paper cards joined by red thread, footnoted caveats |
| Build Together / Solved | **POV** / "picture this" story | "POV: you're…", a character narrator with a diary or log device, works fully on mute |

Extra styles to pick from when a story suits them. All are built in the bright theme:

| Style | Camera and layout | Texture | Best for | Remotion build note |
|---|---|---|---|---|
| One-take | One continuous camera move, zero cuts; passes through objects for transitions | Warm paper macro, soft saffron rim light | Journeys, investigations, supply chains | `@remotion/three`, or layered 2.5D parallax on a camera spline |
| Vox-style explainer | Flat map or board, highlighter marks, arrows, date stamps, zooms | Paper, ink, marker | Data, geography, "how does X work" | `d3-geo` + `world-atlas` from npm for maps (stylised; avoid political borders); SVG strokes for marker |
| Cut-paper collage | Layered cutouts, tape, stickers, jittery stop-motion | Torn paper, halftone | Culture, irony, viral moments | SVG `feTurbulence`, clip-path edges, stepped 10 fps jitter |
| Case file | Pinboard, red string, stamped dates, polaroid-style cards | Cork, paper | "What went wrong" news | Absolute-positioned cards, SVG string with draw-on animation |
| Phone-native post | A post card builds line by line, then scroll, reactions, a vote | Flat UI | Reactions to a viral post | Generic UI components, no real platform logos |
| Documentary (slow) | Slow push-ins, lower thirds, parallax stills | Soft grain | Serious, slower topics | Layered vector scenes with slow dolly keyframes |

- Everything is built from code, typography and vector or 3D shapes. Never stock footage or real photos.
- "Documentary" and "Vox" mean the look and the editing grammar, not the content.

## 13. Kickoff line for Claude

> Read BRAND.md first, then tools/reel_lab/PLAYBOOK_V2.md. Build the reel I paste below in the style named,
> obeying the frame 0 rule (including the 8-frame hold and the blank-frame guard), the safe zones, the
> seamless-loop ending, the engagement rules and the "solved together" rules. Bright theme only; OmniChain is
> in the making, never live. Export a frame 0 still and a final MP4.
