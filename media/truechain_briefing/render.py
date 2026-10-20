"""Render the TrueChain briefing.

python3 render.py stills t1 t2 ...  [--fmt square]           -> stills/<t>.jpg + sheet.jpg
python3 render.py video out.mp4 [--from 0 --to 60 --blur 12 --workers 4 --fps 30 --fmt square]
"""
import sys, os, base64, subprocess, math, glob, shutil
from multiprocessing import Process
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))

def page(p, fmt):
    w, h = (1080, 1080) if fmt == "square" else (1920, 1080)
    b = p.chromium.launch(args=["--allow-file-access-from-files", "--disable-web-security"])
    pg = b.new_page(viewport={"width": w, "height": h})
    pg.on("pageerror", lambda e: print("PAGEERROR", e, flush=True))
    pg.on("console", lambda m: print("console:", m.text) if m.type in ("error", "warning") else None)
    pg.goto(f"file://{HERE}/comp/" + ("social.html" if fmt == "square" else "index.html") + f"?fmt={fmt}")
    pg.wait_for_function("window.__ready===true", timeout=60000)
    return b, pg

def shot(pg, t, n, sh):
    return base64.b64decode(pg.evaluate(f"__frame({t},{n},{sh})").split(",")[1])

def worker(frames, fps, blur, outdir, t0, fmt):
    with sync_playwright() as p:
        b, pg = page(p, fmt)
        for i in frames: open(f"{outdir}/{i:05d}.jpg", "wb").write(shot(pg, t0 + i / fps, blur, 0.5 / fps))
        b.close()

def main():
    mode = sys.argv[1]; args = sys.argv[2:]
    opts = {}; pos = []
    i = 0
    while i < len(args):
        if args[i].startswith("--"): opts[args[i]] = args[i + 1]; i += 2
        else: pos.append(args[i]); i += 1
    fmt = opts.get("--fmt", "wide")
    if mode == "stills":
        ts = [float(a) for a in pos]; od = f"{HERE}/stills"; os.makedirs(od, exist_ok=True)
        with sync_playwright() as p:
            b, pg = page(p, fmt)
            for t in ts: open(f"{od}/{fmt}_{t:07.2f}.jpg", "wb").write(shot(pg, t, 1, 0))
            b.close()
        from PIL import Image, ImageDraw
        fs = [f"{od}/{fmt}_{t:07.2f}.jpg" for t in ts]; cols = min(4, len(fs)); rows = math.ceil(len(fs) / cols)
        tw_, th_ = (480, 270) if fmt != "square" else (360, 360)
        sh = Image.new("RGB", (cols * tw_, rows * th_), "black")
        for k, f in enumerate(fs):
            im = Image.open(f).resize((tw_, th_)); ImageDraw.Draw(im).text((6, 4), f"{ts[k]:.2f}", fill="red"); sh.paste(im, ((k % cols) * tw_, (k // cols) * th_))
        sh.save(f"{HERE}/sheet.jpg", quality=88); print(f"{HERE}/sheet.jpg"); return
    out = pos[0]
    t0, t1 = float(opts.get("--from", 0)), opts.get("--to")
    blur, workers, fps = int(opts.get("--blur", 12)), int(opts.get("--workers", 4)), int(opts.get("--fps", 30))
    if t1 is None:
        with sync_playwright() as p: b, pg = page(p, fmt); t1 = pg.evaluate("COMP.dur"); b.close()
    n = int(round((float(t1) - t0) * fps)); fd = f"{HERE}/frames_{fmt}"; shutil.rmtree(fd, ignore_errors=True); os.makedirs(fd)
    ps = [Process(target=worker, args=(list(range(k, n, workers)), fps, blur, fd, t0, fmt)) for k in range(workers)]
    [q.start() for q in ps]; [q.join() for q in ps]
    got = len(glob.glob(f"{fd}/*.jpg"))
    if got != n: raise SystemExit(f"only {got}/{n} frames rendered")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-i", f"{fd}/%05d.jpg", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    "-crf", "14", "-preset", "medium", out], check=True)
    print(out, n, "frames")

if __name__ == "__main__":
    main()
