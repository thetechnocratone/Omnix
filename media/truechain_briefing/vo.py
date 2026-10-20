"""Assemble the TrueChain briefing voiceover on the master timeline.

python3 vo.py  ->  vo.wav (48 kHz mono), comp/timeline.js (lines + estimated word times), captions.srt
Each clip is trimmed of edge silence and placed at its planned start (seconds).
Word times: internal pauses are detected and snapped to punctuation; words inside a phrase are
spread by character count. Accurate to ~0.1 s, enough for captions and on-screen cues.
"""
import wave, json, re, os
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
SR_IN, SR = 24000, 48000

LINES = [  # (id, start, scene, text)
    ("L01", 3.6, 1, "Every day, millions of parcels leave your warehouses. Most hold exactly what the customer ordered."),
    ("L02", 11.6, 1, "Some don't. And the customer only finds out after the parcel is opened."),
    ("L03", 21.0, 2, "Counterfeit and pirated goods worth 467 billion dollars crossed borders in 2021. That is 2.3 percent of world imports."),
    ("L04", 33.6, 2, "The figure has barely moved in five years. What has changed is how fakes travel."),
    ("L05", 41.2, 2, "Eight in ten customs seizures of fakes are now small parcels. That is what an online order looks like."),
    ("L06", 49.6, 2, "Fashion, footwear, watches and jewellery are hit hardest. These are your high-value categories."),
    ("L07", 61.0, 3, "Amazon alone spent more than a billion dollars in 2024 protecting its store. That is only the cost of defence."),
    ("L08", 71.2, 3, "Then come the returns, the refunds, the reverse pickups, and the support tickets where it's one person's word against another's."),
    ("L09", 80.8, 3, "The cost that matters most is harder to measure. About two in three shoppers say they would lose trust in a marketplace after buying a fake."),
    ("L10", 92.2, 3, "Run your own numbers. If just one percent of sales on ten billion dollars are fakes, that could cost about fifty million dollars a year, before you count reputation."),
    ("L11", 108.0, 4, "TrueChain gives every high-value item its own record, one you can check."),
    ("L12", 116.0, 4, "The record starts at the factory. The brand registers the item. Suppliers and assemblers add parts, inspections and certificates. Distributors and retailers log the sale."),
    ("L13", 130.2, 4, "Every entry is signed and dated. It is held on a shared ledger, and a summary is published each day where no one, including us, can quietly change it."),
    ("L14", 143.0, 4, "Anyone can scan a QR code and read that history, with no sign-in needed."),
    ("L15", 155.6, 5, "Your marketplace uses it at three moments."),
    ("L16", 159.6, 5, "Before listing: if the record isn't found, or can't be trusted, the listing stops. If the brand has flagged the item as stolen or recalled, it goes on hold."),
    ("L17", 172.6, 5, "At the seller: the record shows which retailer made the first sale, so you can review sellers who don't match it."),
    ("L18", 182.0, 5, "In a dispute: your support team has a record to look at, not two people arguing over photos."),
    ("L19", 190.6, 5, "The buyer gets a plain answer: record verified, attention needed, not found, or could not be trusted."),
    ("L20", 203.4, 6, "We'll be straight with you. TrueChain doesn't promise that an item is genuine. It proves that a record exists, and hasn't been altered. It's only as strong as the brands that join. And today, it covers the first retail sale, not resale."),
    ("L21", 221.0, 6, "That's why we suggest proving it together, not on our word."),
    ("L22", 228.0, 7, "The value appears in numbers you already track: fewer disputes over fakes, fewer returns and refunds, stolen goods held before they sell, higher conversion on high-value listings, and better terms with the brands you want to keep."),
    ("L23", 245.0, 7, "Today, TrueChain is in pilot with luxury watches. Nothing in the design is limited to watches."),
    ("L24", 255.8, 8, "Here's what we propose: two brands, one category, ninety days. We agree the targets before we start, then read the results together."),
    ("L25", 267.6, 8, "Every item, a record you can check. Let's build trust into every order."),
]
END_CARD_AT, TOTAL = 267.4, 280.0
SCENES = [0, 20, 60, 105, 155, 202, 227, 255, TOTAL]  # scene starts (s) + end


def read(path):
    w = wave.open(path); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    if w.getnchannels() == 2: a = a.reshape(-1, 2).mean(1)
    return a


def env(a, win=0.02):
    n = int(win * SR_IN); k = len(a) // n
    return np.sqrt((a[:k * n].reshape(k, n) ** 2).mean(1)), win


def trim(a, thr=0.012):
    e, win = env(a); on = np.where(e > thr)[0]
    s = max(0, on[0] - 2); t = min(len(e), on[-1] + 4)
    return a[int(s * win * SR_IN):int(t * win * SR_IN)]


def pauses(a, thr=0.010, min_len=0.12):
    e, win = env(a); quiet = e < thr; out = []; i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if (j - i) * win >= min_len and i > 0 and j < len(quiet): out.append(((i + j) / 2) * win)
            i = j
        else: i += 1
    return out


SPOKEN = {"467": "four hundred and sixty seven", "2021.": "twenty twenty one", "2.3": "two point three",
          "2024": "twenty twenty four", "QR": "queue are"}


def word_times(text, dur, ps):
    words = text.split()
    w8 = [len(re.sub(r"[^\w]", "", SPOKEN.get(w, w))) + 1.5 for w in words]
    brk = [i for i, w in enumerate(words[:-1]) if re.search(r"[,.:;?]$", w)]
    tot = sum(w8); cum = np.cumsum([0] + w8)
    # snap each punctuation break to the nearest unused detected pause
    snaps = {}; used = set()
    for b in brk:
        est = cum[b + 1] / tot * dur
        cand = [(abs(p - est), k) for k, p in enumerate(ps) if k not in used and abs(p - est) < 0.9]
        if cand: _, k = min(cand); used.add(k); snaps[b] = ps[k]
    anchors = [(0, 0.0)] + sorted((b + 1, t) for b, t in snaps.items()) + [(len(words), dur)]
    out = []
    for (i0, t0), (i1, t1) in zip(anchors, anchors[1:]):
        seg = w8[i0:i1]; st = sum(seg) or 1; t = t0 + (0.08 if i0 else 0)
        span = max(0.1, t1 - t - (0.08 if i1 < len(words) else 0))
        for k, w in enumerate(words[i0:i1]):
            d = seg[k] / st * span; out.append([w, round(t, 3), round(t + d, 3)]); t += d
    return out


def srt_time(s):
    ms = int(round(s * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); se, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{se:02d},{ms:03d}"


def cues(words, maxc=42):
    """Group words into caption cues: max 2 lines of 42 chars, break at sentence ends."""
    cs, cur = [], []
    def flush():
        if cur: cs.append(cur.copy()); cur.clear()
    for w in words:
        cur.append(w); text = " ".join(x[0] for x in cur)
        if len(text) > maxc * 2 - 6 or (re.search(r"[.?:]$", w[0]) and len(text) > 18): flush()
    flush(); out = []
    for c in cs:
        text = " ".join(x[0] for x in c)
        if len(text) > maxc:  # balance two lines
            best = min(range(1, len(c)), key=lambda k: abs(len(" ".join(x[0] for x in c[:k])) - len(text) / 2))
            text = " ".join(x[0] for x in c[:best]) + "\n" + " ".join(x[0] for x in c[best:])
        out.append([c[0][1], c[-1][2], text])
    return out


def main():
    track = np.zeros(int(TOTAL * SR) + SR); meta = []; allcues = []
    for lid, start, scene, text in LINES:
        a = trim(read(f"{HERE}/vo/{lid}.wav")); dur = len(a) / SR_IN
        ws = word_times(text, dur, pauses(a))
        up = np.interp(np.arange(int(dur * SR)) / SR, np.arange(len(a)) / SR_IN, a)
        fade = np.minimum(1, np.minimum(np.arange(len(up)), np.arange(len(up))[::-1]) / (0.01 * SR))
        i = int(start * SR); track[i:i + len(up)] += up * fade
        words = [[w, round(start + s, 3), round(start + e, 3)] for w, s, e in ws]
        meta.append({"id": lid, "scene": scene, "t0": start, "t1": round(start + dur, 3), "text": text, "words": words})
        allcues += cues(words)
        if start + dur > (SCENES[scene] if scene < len(SCENES) else TOTAL) + 0.01:
            print(f"WARN {lid} ends {start + dur:.2f} after scene {scene} end {SCENES[scene]}")
    for i in range(len(meta) - 1):
        if meta[i]["t1"] > meta[i + 1]["t0"] - 0.4: print("WARN overlap", meta[i]["id"], meta[i]["t1"], meta[i + 1]["t0"])
    pk = np.abs(track).max(); track = track / pk * 0.89
    with wave.open(f"{HERE}/vo.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((track * 32767).astype(np.int16).tobytes())
    os.makedirs(f"{HERE}/comp", exist_ok=True)
    tl = {"total": TOTAL, "endCard": END_CARD_AT, "scenes": SCENES, "lines": meta, "cues": allcues}
    open(f"{HERE}/comp/timeline.js", "w").write("window.TL=" + json.dumps(tl) + ";\n")
    with open(f"{HERE}/captions.srt", "w") as f:
        for k, (s, e, t) in enumerate(allcues, 1): f.write(f"{k}\n{srt_time(s)} --> {srt_time(e + 0.15)}\n{t}\n\n")
    for m in meta: print(f'{m["id"]} s{m["scene"]} {m["t0"]:7.2f} -> {m["t1"]:7.2f}')
    print("cues", len(allcues))


if __name__ == "__main__":
    main()
