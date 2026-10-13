import json, sys, base64, subprocess, os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
SEGS = [
 ("This week, an Ethereum researcher asked the entire crypto industry to prepare for something called... bunker mode.", "vault", ["bunker", "mode."]),
 ("The threat? Not quantum computers. A.I.", "qa", ["Not", "A.I."]),
 ("Every crypto wallet is protected by a hard maths problem.", "lock", ["hard", "maths", "problem."]),
 ("Justin Drake warns that A.I. could find a shortcut through it. In the worst case, in months, not years.", "maze", ["shortcut", "months,", "years."]),
 ("Vitalik Buterin agrees the risk is real. Even some quantum-resistant designs could take a hit.", "lattice", ["real.", "quantum-resistant", "hit."]),
 ("To be clear: no such attack has been shown yet.", "zero", ["no", "such", "attack"]),
 ("The advice? Keep your public key off-chain where you can. And don't rush. Buterin says he's lost more money in botched migrations than in all hacks combined.", "advice", ["off-chain", "don't", "rush.", "botched", "migrations"]),
 ("The lesson for anyone building a blockchain: design for adversaries that don't exist yet.", "lesson", ["design", "adversaries", "exist", "yet."]),
]

PARTS = [
 [("This week, an Ethereum researcher asked the entire crypto industry to prepare for something called...",0.15,5.9),("bunker mode.",6.33,7.13)],
 [("The threat?",7.62,8.09),("Not quantum computers.",8.46,9.85),("A.I.",10.39,11.02)],
 [("Every crypto wallet is protected by a hard maths problem.",11.65,14.98)],
 [("Justin Drake warns that A.I. could find a shortcut through it.",15.56,18.89),("In the worst case, in months, not years.",19.26,22.09)],
 [("Vitalik Buterin agrees the risk is real.",22.59,25.53),("Even some quantum-resistant designs could take a hit.",25.98,28.79)],
 [("To be clear:",29.36,29.92),("no such attack has been shown yet.",30.29,32.32)],
 [("The advice?",32.82,33.41),("Keep your public key off-chain where you can.",33.91,36.42),("And don't rush.",36.76,37.65),("Buterin says he's lost more money in botched migrations than in all hacks combined.",37.96,43.27)],
 [("The lesson for anyone building a blockchain:",43.75,45.8),("design for adversaries that don't exist yet.",46.3,48.96)],
]
def config_real():
    segs=[{"text":t,"scene":sc,"keys":k,"start":P[0][1],"end":P[-1][2],"parts":[list(x) for x in P]} for (t,sc,k),P in zip(SEGS,PARTS)]
    return {"segs":segs,"endStart":49.6}

def config(times, total):
    segs = [{"text": t, "scene": sc, "keys": k, "start": a, "end": b} for (t, sc, k), (a, b) in zip(SEGS, times)]
    return {"segs": segs, "endStart": total + 0.6}

def estimate(total=48.8, gap=0.55):
    lens = [len(s[0]) for s in SEGS]
    speech = total - gap * (len(SEGS) - 1) - 0.3
    t = 0.3; out = []
    for L in lens:
        d = speech * L / sum(lens); out.append((t, t + d)); t += d + gap
    return out

def run(cfg, mode, arg):
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--allow-file-access-from-files","--disable-web-security"])
        pg = b.new_page(viewport={"width": 1080, "height": 1920})
        pg.goto("file://" + HERE + "/render.html")
        pg.wait_for_function("document.fonts.ready.then(()=>true)")
        pg.evaluate("Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>i.onload=r)))")
        pg.evaluate("document.fonts.load('84px IB')"); pg.evaluate("document.fonts.load('84px IXB')")
        pg.evaluate("document.fonts.load('40px IMI')"); pg.evaluate("document.fonts.load('40px ISB')"); pg.evaluate("document.fonts.load('40px IM')")
        pg.evaluate("c=>setCfg(c)", cfg)
        if mode == "stills":
            for t in arg:
                d = pg.evaluate(f"render({t})")
                open(f"{HERE}/still_{t:05.1f}.jpg", "wb").write(base64.b64decode(d.split(",")[1]))
        else:
            out, dur, fps = arg
            n = int(dur * fps)
            ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
                                   "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "19", "-preset", "medium", out], stdin=subprocess.PIPE)
            for i in range(n):
                d = pg.evaluate(f"render({i/fps})")
                ff.stdin.write(base64.b64decode(d.split(",")[1]))
            ff.stdin.close(); ff.wait()
        b.close()

if __name__ == "__main__":
    tfile = os.path.join(HERE, "times.json")
    if os.path.exists(tfile):
        j = json.load(open(tfile)); times, total = j["times"], j["total"]
    else:
        total = 48.8; times = estimate(total)
    cfg = config_real()
    if sys.argv[1] == "stills":
        run(cfg, "stills", [float(v) for v in sys.argv[2:]])
    else:
        run(cfg, "video", (sys.argv[2], cfg["endStart"] + 3.5, 30))
