"""Render an Omnix long-form 16:9 film.

Usage:
  python3 drive.py FILM_DIR stills 3 7.5 12        # preview frames -> FILM_DIR/stills/still_*.jpg
  python3 drive.py FILM_DIR sheet 4                  # contact sheet: one frame every 4 s -> FILM_DIR/sheet.jpg
  python3 drive.py FILM_DIR video out.mp4 [fps]      # silent 1920x1080 video
FILM_DIR needs episode.json (from assemble_long.py). Scenes live in render.html.
"""
import json, sys, base64, subprocess, os
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))

def page(p, cfg):
    b = p.chromium.launch(args=["--allow-file-access-from-files", "--disable-web-security"])
    pg = b.new_page(viewport={"width": 1920, "height": 1080})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("file://" + HERE + "/render.html")
    pg.wait_for_function("document.fonts.ready.then(()=>true)")
    pg.evaluate("Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>i.onload=r)))")
    for f in ["84px IB", "84px IXB", "40px IMI", "40px ISB", "40px IM", "40px IR", "40px IL", "40px FreeSerif", "italic 40px 'GFS Baskerville'"]:
        pg.evaluate(f"document.fonts.load(\"{f}\")")
    pg.evaluate("c=>setCfg(c)", cfg)
    return b, pg, errs

def run(ep, mode, args):
    cfg = json.load(open(os.path.join(ep, "episode.json")))
    total = cfg["endStart"] + cfg.get("outro", 8.0); R = "renderV" if cfg.get("vertical") else "render"
    with sync_playwright() as p:
        b, pg, errs = page(p, cfg)
        if mode in ("stills", "sheet"):
            ts = [float(v) for v in args] if mode == "stills" else [i * float(args[0]) for i in range(int(total / float(args[0])) + 1)]
            os.makedirs(os.path.join(ep, "stills"), exist_ok=True); files = []
            for t in ts:
                d = pg.evaluate(f"{R}({t})"); fn = os.path.join(ep, "stills", f"still_{t:06.1f}.jpg")
                open(fn, "wb").write(base64.b64decode(d.split(",")[1])); files.append(fn)
            if mode == "sheet":
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-pattern_type", "glob", "-i", os.path.join(ep, "stills", "still_*.jpg"),
                                "-vf", "scale=270:-1,tile=8x" + str((len(files) + 7) // 8), "-frames:v", "1", os.path.join(ep, "sheet.jpg")], check=True)
        else:
            out = args[0]; fps = int(args[1]) if len(args) > 1 else 30
            n = int(total * fps)
            ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
                                   "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "veryfast", out], stdin=subprocess.PIPE)
            for i in range(n):
                d = pg.evaluate(f"{R}({i/fps})")
                ff.stdin.write(base64.b64decode(d.split(",")[1]))
                if i % 900 == 0: print(f"{ep}: frame {i}/{n}", flush=True)
            ff.stdin.close(); ff.wait()
        if errs: print("PAGE ERRORS:", errs[:5])
        b.close()

if __name__ == "__main__":
    run(sys.argv[1], sys.argv[2], sys.argv[3:])
