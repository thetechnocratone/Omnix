"""Render an Omnix Brief reel.

Usage:
  python3 drive.py EPISODE_DIR stills 3 7.5 12      # preview frames -> EPISODE_DIR/still_*.jpg
  python3 drive.py EPISODE_DIR video out.mp4         # silent 1080x1920 30fps video

EPISODE_DIR must contain:
  episode.json  {"dateLabel","sourceShort","sourceFull","endStart",
                 "segs":[{"text","scene","keys":[...],"start","end","parts":[[text,start,end],...]}]}
  scenes.js     JS defining S.<scene>=(p,lt,d,t)=>{...} for every scene named in episode.json
The shared look (paper bg, header, word-by-word captions, end card) lives in render.html.
"""
import json, sys, base64, subprocess, os, shutil
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))

def run(ep, mode, arg):
    cfg = json.load(open(os.path.join(ep, "episode.json")))
    scenes = open(os.path.join(ep, "scenes.js")).read()
    lib = os.path.join(HERE, "lib.js")
    if os.path.exists(lib):
        scenes = open(lib).read() + "\n" + scenes
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--allow-file-access-from-files", "--disable-web-security"])
        pg = b.new_page(viewport={"width": 1080, "height": 1920})
        pg.goto("file://" + HERE + "/render.html")
        pg.wait_for_function("document.fonts.ready.then(()=>true)")
        pg.evaluate("Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>i.onload=r)))")
        for f in ["84px IB", "84px IXB", "40px IMI", "40px ISB", "40px IM"]:
            pg.evaluate(f"document.fonts.load('{f}')")
        pg.add_script_tag(content=scenes)
        pg.evaluate("c=>setCfg(c)", cfg)
        if mode == "stills":
            for t in arg:
                d = pg.evaluate(f"render({t})")
                open(os.path.join(ep, f"still_{t:05.1f}.jpg"), "wb").write(base64.b64decode(d.split(",")[1]))
        else:
            out, fps = arg, 30
            n = int((cfg["endStart"] + 3.5) * fps)
            ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
                                   "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "19", "-preset", "medium", out], stdin=subprocess.PIPE)
            for i in range(n):
                d = pg.evaluate(f"render({i/fps})")
                ff.stdin.write(base64.b64decode(d.split(",")[1]))
            ff.stdin.close(); ff.wait()
        b.close()

if __name__ == "__main__":
    ep, mode = sys.argv[1], sys.argv[2]
    run(ep, mode, [float(v) for v in sys.argv[3:]] if mode == "stills" else sys.argv[3])
