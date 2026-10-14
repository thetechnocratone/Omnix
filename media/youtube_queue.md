# YouTube upload queue

Metricool's YouTube limit is used up, so YouTube Shorts are uploaded through YouTube Studio in the
owner's browser (custom covers work there). Scheduled tasks ADD entries here; Claude, in a chat
linked to the owner's Mac, uploads them with YouTube's own scheduler and marks them done.

Entry format (one block per Short, newest at the bottom):

### <YYYY-MM-DD HH:MM IST> · <series> · status: pending | scheduled <video id> | published <video id>
- video: <raw GitHub URL of the mp4>
- cover: <raw GitHub URL of the _thumb.jpg, or "none (card reel)">
- title: <≤ 70 characters, ends with " #Shorts">
- tags: <tag 1>, <tag 2>, ...
- related: <title of a full-length film on the channel to link, optional>
- description:
  <plain-text description, the real link, then hashtags>

## Done (14 Oct 2026, uploaded from the browser)
Tokenization, Korea humanoids, crypto bridges, A.L.K.I. alignment, OmniBot one mind, Bengaluru traffic,
Abundance, Full Stack, Beyond Imagination.
