"""Render reels from a JSON spec list.

Usage:
    python3 tools/make_reel.py reels.json OUT_DIR

Each entry needs "name" and "format", plus that format's fields:
  card      {l1:[...], l2:[...], tag}                          rising words (tools/card_reel.py)
  terminal  {goal, steps:[...], l1:[...], l2:[...], tag}        A.L.K.I. agent session
  chain     {blocks:[word/phrase...], l2:[...], tag}            blocks spell the sentence (max 6 blocks)
  chat      {left, right, title?, messages:[["L"|"R", text]...], tag}
  lineart   {l1:[...], l2:[...], tag}                          lotus pattern draws itself
  splitflap {l1:[...], l2:[...], label?, tag}                   departures board, words ≤ 15 chars
Output: OUT_DIR/<name>_reel.mp4 (1080x1920, original music).
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import card_reel  # noqa: E402
from reel_formats import FORMATS  # noqa: E402

if __name__ == "__main__":
    spec_path, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    for s in json.load(open(spec_path)):
        out = os.path.join(out_dir, s["name"] + "_reel.mp4")
        fmt = s.get("format", "card")
        if fmt == "card":
            print(card_reel.render(s, out_dir))
        else:
            print(FORMATS[fmt](s, out))
