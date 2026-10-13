"""Render YouTube thumbnails (1280x720 JPG) for the website films using render.html's drawing kit."""
import base64, os, subprocess
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "media", "website_films", "thumbs")
os.makedirs(OUT, exist_ok=True)

COMMON = r"""
function thumbBase(){x.setTransform(1,0,0,1,0,0);bg(0);
 const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(247,239,225,0.0)');g.addColorStop(1,'rgba(241,150,17,0.10)');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.save();x.globalAlpha=0.1;x.translate(1500,540);x.drawImage(IMG('star'),-700,-700,1400,1400);x.restore();
 x.drawImage(IMG('logo'),90,70,90,90);txt('OMNIX',200,116,'56px IXB',SAF,'left');
 x.fillStyle=SAF;x.fillRect(0,H-26,W,26)}
function headline(lines,y0,size){lines.forEach((l,i)=>{const hl=l.startsWith('*');const s=hl?l.slice(1):l;
 x.save();x.font=size+'px IXB';x.lineJoin='round';x.strokeStyle=PAPER;x.lineWidth=18;x.strokeText(s,90,y0+i*size*1.08);x.fillStyle=hl?SAF:INK;x.fillText(s,90,y0+i*size*1.08);x.restore()})}
function tag(s,y){x.save();x.font='44px IB';const w=x.measureText(s).width+60;rr(90,y-40,w,80,40);x.fillStyle=INK;x.fill();txt(s,90+w/2,y,'44px IB',PAPER);x.restore()}
"""

THUMBS = {
 "f1_omnichain": r"""thumbBase();x.textBaseline='alphabetic';
  headline(['A LEDGER','FOR WHAT\'S','*COMING'],400,150);tag('OmniChain & Nishq',840);
  const cx=1460,cy=540;glow(cx,cy,420,0.45);x.save();x.beginPath();x.arc(cx,cy,300,0,7);x.strokeStyle=SAF;x.lineWidth=18;x.stroke();x.restore();
  ic('coin',cx,cy,400,1);[[-1,-1],[1,-0.6],[-0.9,0.9],[1,1]].forEach(([a,b])=>arrow(cx+a*520,cy+b*400,cx+a*350,cy+b*270,RED,8));
  ic('atom',cx+330,cy-330,170,1,{t:0.4})""",
 "f2_alki": r"""thumbBase();x.textBaseline='alphabetic';
  headline(['THE MIND','*OF OMNIX'],420,170);tag('A.L.K.I. · वसुधैव कुटुम्बकम्',820);
  const cx=1450,cy=530;glow(cx,cy,460,0.5);for(let i=0;i<3;i++){x.save();x.globalAlpha=0.35;circle(cx,cy,260+i*70,SAF,4);x.restore()}
  ic('mind',cx,cy,460,1);img('lotus',cx,cy+330,300,162,0.9)""",
 "f3_omnibot": r"""thumbBase();x.textBaseline='alphabetic';
  headline(['INTELLIGENCE','*WITH HANDS'],430,150);tag('OmniBot · humanoid robots',820);
  const cx=1450,cy=560;glow(cx,cy,460,0.5);ic('robot',cx,cy+20,560,1,{walk:true,t:0.6});
  ic('house',cx-330,cy+260,150,1);ic('tree',cx+340,cy+250,170,1);ic('hospital',cx+330,cy-300,130,0.9)""",
 "f4_fullstack": r"""thumbBase();x.textBaseline='alphabetic';
  headline(['NETWORK.','MIND.','*MACHINE.'],360,150);tag('How the Omnix stack works',840);
  const cx=1440;[0,1,2].forEach(i=>{const Y=800-i*230;const hl=i==1;pline([[cx,Y-110],[cx+420,Y],[cx,Y+110],[cx-420,Y]],INK,5,true,hl?MAR:SOFT);
   x.beginPath();x.moveTo(cx-420,Y);x.lineTo(cx-420,Y+36);x.lineTo(cx,Y+146);x.lineTo(cx+420,Y+36);x.lineTo(cx+420,Y);x.lineTo(cx,Y+110);x.closePath();x.fillStyle=hl?SAF:'#DCCBAE';x.fill();x.strokeStyle=INK;x.lineWidth=5;x.stroke();
   ic(['block','mind','robot'][i],cx,Y-6,130,1)})""",
 "f5_beyond": r"""thumbBase();x.textBaseline='alphabetic';
  headline(['BEYOND','*IMAGINATION'],430,150);tag('Peace · Joy · Abundance',820);
  const sx=1500,sy=330;glow(sx,sy,520,0.6);circle(sx,sy,130,SAF,6,MAR);for(let i=0;i<16;i++){const g=i*Math.PI/8;line(sx+Math.cos(g)*170,sy+Math.sin(g)*170,sx+Math.cos(g)*225,sy+Math.sin(g)*225,SAF,8)}
  const x0=1040,y0=960;for(let i=0;i<7;i++)pline([[x0+i*70,y0-i*55],[x0+(i+1)*70,y0-i*55],[x0+(i+1)*70,y0-(i+1)*55]],INK,6);
  ic('person',x0+5*70+30,y0-6*55-60,120,1,{fill:MAR});img('lotus',1700,900,280,151,0.9)""",
}

with sync_playwright() as p:
    b = p.chromium.launch(args=["--allow-file-access-from-files", "--disable-web-security"])
    pg = b.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto("file://" + HERE + "/render.html")
    pg.wait_for_function("document.fonts.ready.then(()=>true)")
    pg.evaluate("Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>i.onload=r)))")
    for f in ["150px IXB", "44px IB", "44px FreeSerif"]:
        pg.evaluate(f"document.fonts.load('{f}')")
    pg.add_script_tag(content=COMMON)
    for name, code in THUMBS.items():
        d = pg.evaluate("()=>{" + code + ";grain();return cv.toDataURL('image/png')}")
        src = os.path.join(OUT, name + "_src.png"); open(src, "wb").write(base64.b64decode(d.split(",")[1]))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", "scale=1280:720:flags=lanczos", "-q:v", "2", os.path.join(OUT, name + ".jpg")], check=True)
        os.remove(src)
    b.close()
print("ok")
