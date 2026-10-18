"""Render a variant to video or stills.

python3 render.py V stills t1 t2 ...        -> V/stills/<t>.jpg + V/sheet.jpg
python3 render.py V video out.mp4 [--blur N] [--workers K] [--fps 30]
"""
import sys, os, json, base64, subprocess, math, glob, shutil
from multiprocessing import Process
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def page(p, v):
    b = p.chromium.launch(args=["--allow-file-access-from-files", "--disable-web-security"])
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    pg.on("console", lambda m: print("console:", m.text) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: print("PAGEERROR", e))
    pg.goto(f"file://{ROOT}/engine/comp.html?v={v}")
    pg.wait_for_function("window.__ready===true", timeout=60000)
    return b, pg

def shot(pg, t, n, sh):
    d = pg.evaluate(f"__frame({t},{n},{sh})")
    return base64.b64decode(d.split(",")[1])

def worker(v, frames, fps, blur, outdir):
    with sync_playwright() as p:
        b, pg = page(p, v)
        for i in frames:
            open(f"{outdir}/{i:05d}.jpg", "wb").write(shot(pg, i / fps, blur, 0.5 / fps))
        b.close()

def main():
    v, mode = sys.argv[1], sys.argv[2]
    vd = f"{ROOT}/{v}"
    if mode == "stills":
        ts = [float(a) for a in sys.argv[3:]]
        os.makedirs(f"{vd}/stills", exist_ok=True)
        with sync_playwright() as p:
            b, pg = page(p, v)
            for t in ts:
                open(f"{vd}/stills/{t:06.2f}.jpg", "wb").write(shot(pg, t, 1, 0))
            b.close()
        from PIL import Image, ImageDraw
        fs = [f"{vd}/stills/{t:06.2f}.jpg" for t in ts]
        cols = min(6, len(fs)); rows = math.ceil(len(fs) / cols)
        sh = Image.new("RGB", (cols * 300, rows * 533), "black")
        for i, f in enumerate(fs):
            im = Image.open(f).resize((300, 533)); ImageDraw.Draw(im).text((8, 6), f"{ts[i]:.2f}", fill="red")
            sh.paste(im, ((i % cols) * 300, (i // cols) * 533))
        sh.save(f"{vd}/sheet.jpg", quality=88)
        print(f"{vd}/sheet.jpg")
        return
    out = sys.argv[3]
    opts = dict(zip(sys.argv[4::2], sys.argv[5::2]))
    blur, workers, fps = int(opts.get("--blur", 3)), int(opts.get("--workers", 6)), int(opts.get("--fps", 30))
    with sync_playwright() as p:
        b, pg = page(p, v); dur = pg.evaluate("COMP.dur"); b.close()
    n = int(round(dur * fps))
    fd = f"{vd}/frames"; shutil.rmtree(fd, ignore_errors=True); os.makedirs(fd)
    chunks = [list(range(k, n, workers)) for k in range(workers)]
    ps = [Process(target=worker, args=(v, c, fps, blur, fd)) for c in chunks]
    [q.start() for q in ps]; [q.join() for q in ps]
    got = len(glob.glob(f'{fd}/*.jpg'))
    if got != n: raise SystemExit(f'only {got}/{n} frames rendered')
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-i", f"{fd}/%05d.jpg", "-c:v", "libx264",
                    "-pix_fmt", "yuv420p", "-crf", "17", "-preset", "medium", "-movflags", "+faststart", out], check=True)
    print(out, n, "frames")

if __name__ == "__main__":
    main()
