"""Voice + caption timeline for the 1:1 social cut (Scenes 1-4 condensed, ~65 s).

python3 social_vo.py -> social_vo.wav, comp/social_tl.js, social_captions.srt
"""
import wave, json, os
import numpy as np
import vo as V
HERE = V.HERE
PLAN = [("L01", 0.6), ("L02", 7.6), ("L03", 13.6), ("L09", 25.4), ("L11", 35.6), ("L12", 41.2), ("L14", 53.6), ("L25", 59.2)]
TOTAL, END_CARD = 66.0, 58.7


def main():
    text = {l[0]: l[3] for l in V.LINES}
    track = np.zeros(int(TOTAL * V.SR) + V.SR); meta = []; cues = []
    for lid, start in PLAN:
        a = V.trim(V.read(f"{HERE}/vo/{lid}.wav")); dur = len(a) / V.SR_IN
        ws = V.word_times(text[lid], dur, V.pauses(a))
        up = np.interp(np.arange(int(dur * V.SR)) / V.SR, np.arange(len(a)) / V.SR_IN, a)
        fade = np.minimum(1, np.minimum(np.arange(len(up)), np.arange(len(up))[::-1]) / (0.01 * V.SR))
        i = int(start * V.SR); track[i:i + len(up)] += up * fade
        words = [[w, round(start + s, 3), round(start + e, 3)] for w, s, e in ws]
        meta.append({"id": lid, "t0": start, "t1": round(start + dur, 3), "text": text[lid], "words": words})
        cues += V.cues(words)
    for m, n in zip(meta, meta[1:]):
        if m["t1"] > n["t0"] - 0.35: print("WARN overlap", m["id"], m["t1"], n["t0"])
    track = track / np.abs(track).max() * 0.89
    with wave.open(f"{HERE}/social_vo.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(V.SR); w.writeframes((track * 32767).astype(np.int16).tobytes())
    tl = {"total": TOTAL, "endCard": END_CARD, "scenes": [0, 13.0, 25.0, 34.6, TOTAL], "lines": meta, "cues": cues}
    open(f"{HERE}/comp/social_tl.js", "w").write("window.TL=" + json.dumps(tl) + ";\n")
    with open(f"{HERE}/social_captions.srt", "w") as f:
        for k, (s, e, t) in enumerate(cues, 1): f.write(f"{k}\n{V.srt_time(s)} --> {V.srt_time(e + 0.15)}\n{t}\n\n")
    for m in meta: print(m["id"], m["t0"], "->", m["t1"])


if __name__ == "__main__":
    main()
