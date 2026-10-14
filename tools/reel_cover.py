"""Designed 9:16 reel covers / Shorts thumbnails (1080x1920 JPG) in the Omnix bright theme.

Usage:  python3 tools/reel_cover.py <spec.json> [<spec.json> ...]

Spec (JSON):
{
  "out": "media/.../name_thumb.jpg",          # output path (repo-relative)
  "series": "OMNIX EXPLAINS",                   # small label top-right (optional)
  "lines": ["OWN A SLICE", "OF A *BUILDING?"],  # headline; *word = saffron highlight
  "size": 118,                                  # headline font px (optional, auto-fits width)
  "art": "<svg ...>...</svg>",                  # centre illustration, viewBox 0 0 900 900
  "tag": "Tokenization, explained",             # dark pill near the bottom
  "foot": "Data: RWA.xyz"                       # tiny source line (optional)
}
Rules (see tools/brief_reel/PLAYBOOK.md, "Covers"): cream/saffron theme only, 3-7 word
headline that teases the hook (not the episode title verbatim), one clear illustration drawn
by us (no real logos, photos or people), readable at phone-grid size, nothing important in
the bottom 300 px (IG/YT overlay UI).
"""
import base64, html, json, os, re, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSETS = os.path.join(ROOT, "tools", "brief_reel", "assets")
INK, SAF, MAR, PAPER, SOFT, MUTE = "#2B2118", "#F19611", "#FCC25F", "#F7EFE1", "#EADCC4", "#B9A88E"


def b64(name):
    return "data:image/png;base64," + base64.b64encode(open(os.path.join(ASSETS, name), "rb").read()).decode()


def headline(lines):
    out = []
    for l in lines:
        words = []
        for w in l.split(" "):
            if w.startswith("*"):
                words.append(f'<span class="hl">{html.escape(w[1:])}</span>')
            else:
                words.append(html.escape(w))
        out.append('<div class="ln">' + " ".join(words) + "</div>")
    return "".join(out)


def page(s):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:IXB;src:url(file:///usr/share/fonts/opentype/inter/Inter-ExtraBold.otf)}}
@font-face{{font-family:IB;src:url(file:///usr/share/fonts/opentype/inter/Inter-Bold.otf)}}
@font-face{{font-family:ISB;src:url(file:///usr/share/fonts/opentype/inter/Inter-SemiBold.otf)}}
@font-face{{font-family:IM;src:url(file:///usr/share/fonts/opentype/inter/Inter-Medium.otf)}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1080px;height:1920px;overflow:hidden;font-family:IB;color:{INK};
 background:radial-gradient(ellipse at 50% 58%, #FBEAD0 0%, {PAPER} 45%, #EFE4D2 100%)}}
.grid{{position:absolute;inset:0;background-image:linear-gradient(rgba(43,33,24,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(43,33,24,.035) 1px,transparent 1px);background-size:60px 60px}}
.star{{position:absolute;width:1300px;left:240px;top:520px;opacity:.07}}
.lotus{{position:absolute;width:230px;left:30px;bottom:150px;opacity:.16}}
.conch{{position:absolute;width:190px;right:40px;top:230px;opacity:.13;transform:rotate(-18deg)}}
.top{{position:absolute;left:70px;right:70px;top:110px;display:flex;align-items:center;justify-content:space-between}}
.brand{{display:flex;align-items:center;gap:16px;font-family:IXB;font-size:40px;color:{SAF};letter-spacing:.5px}}
.brand img{{width:64px;height:64px}}
.series{{font-family:ISB;font-size:30px;letter-spacing:2px;color:#6B5A48}}
.head{{position:absolute;left:60px;right:60px;top:250px;text-align:center;font-family:IXB;line-height:1.04;letter-spacing:-1px}}
.ln{{white-space:nowrap}}
.hl{{color:{SAF}}}
.art{{position:absolute;left:90px;top:{s.get('artTop',600)}px;width:900px;height:900px}}
.glow{{position:absolute;left:40px;top:{s.get('artTop',600)-40}px;width:1000px;height:980px;background:radial-gradient(circle, rgba(241,150,17,.30) 0%, rgba(241,150,17,0) 62%)}}
.tag{{position:absolute;left:50%;transform:translateX(-50%);top:1612px;background:{INK};color:{PAPER};font-family:IB;font-size:42px;padding:20px 40px;border-radius:60px;white-space:nowrap}}
.foot{{position:absolute;left:0;right:0;top:1730px;text-align:center;font-family:IM;font-size:28px;color:#8C7A66}}
.bar{{position:absolute;left:0;right:0;bottom:0;height:24px;background:{SAF}}}
</style></head><body>
<div class="grid"></div><img class="star" src="{b64('star.png')}"><img class="lotus" src="{b64('lotus.png')}"><img class="conch" src="{b64('conch.png')}">
<div class="top"><div class="brand"><img src="{b64('logo.png')}">OMNIX</div><div class="series">{html.escape(s.get('series',''))}</div></div>
<div class="head" id="head" style="font-size:{s.get('size',120)}px">{headline(s['lines'])}</div>
<div class="glow"></div><div class="art">{s['art']}</div>
<div class="tag">{html.escape(s['tag'])}</div>
{f'<div class="foot">{html.escape(s["foot"])}</div>' if s.get('foot') else ''}
<div class="bar"></div></body></html>"""


def render(specs):
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--allow-file-access-from-files"])
        pg = b.new_page(viewport={"width": 1080, "height": 1920})
        for s in specs:
            tmp = os.path.join(ROOT, ".cover_tmp.html")
            open(tmp, "w").write(page(s))
            pg.goto("file://" + tmp)
            pg.evaluate("document.fonts.ready.then(()=>true)")
            os.remove(tmp)
            # shrink headline until every line fits the width
            pg.evaluate("""()=>{const h=document.getElementById('head');let f=parseFloat(h.style.fontSize);
              while([...h.children].some(l=>l.scrollWidth>h.clientWidth)&&f>60){f-=4;h.style.fontSize=f+'px'}}""")
            out = os.path.join(ROOT, s["out"])
            os.makedirs(os.path.dirname(out), exist_ok=True)
            pg.screenshot(path=out, type="jpeg", quality=92)
            print("wrote", s["out"])
        b.close()


if __name__ == "__main__":
    render([json.load(open(f)) for f in sys.argv[1:]])
