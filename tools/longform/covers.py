"""Render 1080x1920 reel covers for the website-film reels."""
import base64, json, os
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(HERE, "..", "..", "media", "website_films")
C = {
 "f1_omnichain": {"lines": ["A LEDGER", "FOR WHAT'S", "*COMING"], "size": 128, "y": 380, "icon": "coin", "tag": "OmniChain & Nishq"},
 "f2_alki": {"lines": ["THE MIND", "*OF OMNIX"], "size": 140, "y": 420, "icon": "mind", "tag": "A.L.K.I. · Vasudhaiva Kutumbakam"},
 "f3_omnibot": {"lines": ["INTELLIGENCE", "*WITH HANDS"], "size": 116, "y": 420, "icon": "robot", "tag": "OmniBot", "iconSize": 560},
 "f4_fullstack": {"lines": ["NETWORK.", "MIND.", "*MACHINE."], "size": 132, "y": 360, "icon": "layers", "tag": "How the Omnix stack works"},
 "f5_beyond": {"lines": ["BEYOND", "*IMAGINATION"], "size": 120, "y": 420, "icon": "sun", "tag": "Peace · Joy · Abundance"},
}
os.makedirs(os.path.join(M, "reels"), exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(args=["--allow-file-access-from-files", "--disable-web-security"])
    pg = b.new_page(viewport={"width": 1920, "height": 1080}); pg.goto("file://" + HERE + "/render.html")
    pg.wait_for_function("document.fonts.ready.then(()=>true)")
    pg.evaluate("Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>i.onload=r)))")
    for f in ["120px IXB", "44px IB"]: pg.evaluate(f"document.fonts.load('{f}')")
    for k, c in C.items():
        cfg = json.load(open(os.path.join(M, k, "reel", "episode.json"))); cfg["cover"] = c
        pg.evaluate("c=>setCfg(c)", cfg); d = pg.evaluate("coverV()")
        open(os.path.join(M, "reels", k + "_cover.jpg"), "wb").write(base64.b64decode(d.split(",")[1]))
    b.close()
print("ok")
