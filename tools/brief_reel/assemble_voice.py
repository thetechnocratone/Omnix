"""Stitch per-part voice clips into one track and write exact timings.

Usage: python3 assemble_voice.py EPISODE_DIR
Needs EPISODE_DIR/draft.json:
  {"dateLabel","sourceShort","sourceFull",
   "segs":[{"scene","keys":[...],"parts":["sentence or phrase", ...]}]}
and EPISODE_DIR/vo_parts/001.wav, 002.wav, ... one clip per part, in reading order.
Writes EPISODE_DIR/vo.wav and EPISODE_DIR/episode.json (with start/end times).
"""
import json, sys, os, subprocess, wave
import numpy as np
ep = sys.argv[1]; SR = 24000
d = json.load(open(os.path.join(ep, "draft.json")))
def load(fn):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", fn, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    m = np.where(np.abs(a) > 0.01)[0]
    return a[max(0, m[0] - int(0.03 * SR)): m[-1] + int(0.06 * SR)] if len(m) else a
t = 0.25; buf = [np.zeros(int(t * SR))]; k = 0; segs = []
for si, s in enumerate(d["segs"]):
    parts = []
    for pi, txt in enumerate(s["parts"]):
        k += 1; a = load(os.path.join(ep, "vo_parts", f"{k:03d}.wav"))
        parts.append([txt, round(t, 3), round(t + len(a) / SR, 3)])
        buf.append(a); t += len(a) / SR
        gap = 0.32 if pi < len(s["parts"]) - 1 else 0.5
        buf.append(np.zeros(int(gap * SR))); t += gap
    segs.append({"text": " ".join(s["parts"]), "scene": s["scene"], "keys": s.get("keys", []),
                 "start": parts[0][1], "end": parts[-1][2], "parts": parts})
y = np.concatenate(buf)
with wave.open(os.path.join(ep, "vo.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
out = {k2: d[k2] for k2 in ("dateLabel", "sourceShort", "sourceFull")}
out.update(segs=segs, endStart=round(t + 0.1, 2))
json.dump(out, open(os.path.join(ep, "episode.json"), "w"), indent=1)
print(f"voice {t:.1f}s, {k} parts, endStart {out['endStart']}")
