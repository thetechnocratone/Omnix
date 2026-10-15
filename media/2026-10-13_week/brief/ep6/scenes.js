// The Brief #6 — a humanoid learns cornhole from one video (Gemini 4 Argon)
// --- custom drawings (ours; generic shapes, no real robots or logos)
function board(X,Y,s,a){x.save();x.globalAlpha*=(a==null?1:a);x.translate(X,Y);x.scale(s,s);L(8,INK);
 // slanted board seen from the side-front: trapezoid + legs + hole
 x.beginPath();x.moveTo(-150,60);x.lineTo(150,60);x.lineTo(110,-70);x.lineTo(-110,-70);x.closePath();x.fillStyle='#E9C99A';x.fill();x.stroke();
 x.beginPath();x.ellipse(0,-25,34,14,0,0,7);x.fillStyle=INK;x.fill();
 line(-120,60,-120,95);line(120,60,120,95);
 x.lineWidth=4;x.globalAlpha*=0.35;line(-130,30,130,30);x.restore()}
function bag(X,Y,s,col,rot){x.save();x.translate(X,Y);x.rotate(rot||0);x.scale(s||1,s||1);L(6,INK);rr(-26,-20,52,40,10);x.fillStyle=col||SAF;x.fill();x.stroke();x.lineWidth=3;x.setLineDash([5,5]);rr(-18,-12,36,24,6);x.stroke();x.setLineDash([]);x.restore()}
function arcPt(u,x0,y0,x1,y1,h){return[x0+(x1-x0)*u,y0+(y1-y0)*u-h*4*u*(1-u)]}
function dashedArc(x0,y0,x1,y1,h,e,col){L(6,col||MUTE);x.setLineDash([14,14]);x.beginPath();for(let i=0;i<=40*e;i++){const [a,b]=arcPt(i/40,x0,y0,x1,y1,h);i?x.lineTo(a,b):x.moveTo(a,b)}x.stroke();x.setLineDash([])}
function frame(X,Y,w,h,k,o){o=o||{};if(k<=0)return;x.save();x.translate(X,Y);x.scale(k,k);shadow(1);rr(-w/2,-h/2,w,h,26);x.fillStyle='#FBF6EC';x.fill();shadow(0);L(6,INK);x.stroke();
 rr(-w/2+18,-h/2+18,w-36,h-80,14);x.fillStyle=o.fill||'#F3E4CC';x.fill();x.lineWidth=4;x.stroke();
 // progress bar
 x.fillStyle=MUTE;rr(-w/2+30,h/2-38,w-60,10,5);x.fill();x.fillStyle=SAF;rr(-w/2+30,h/2-38,(w-60)*(o.prog||0.35),10,5);x.fill();x.restore()}
function play(X,Y,s,a){x.save();x.globalAlpha*=a==null?1:a;x.translate(X,Y);x.scale(s,s);circle(0,0,46,null,0,'rgba(43,33,24,.75)');x.fillStyle='#fff';x.beginPath();x.moveTo(-14,-22);x.lineTo(24,0);x.lineTo(-14,22);x.closePath();x.fill();x.restore()}
function thrower(X,Y,s,arm){// a simple person figure (generic), arm angle 0..1 = wind-up..release
 x.save();x.translate(X,Y);x.scale(s,s);L(9,INK);circle(0,-120,30,INK,8,'#F0C9A0');
 x.beginPath();x.moveTo(-40,60);x.quadraticCurveTo(-45,-80,0,-80);x.quadraticCurveTo(45,-80,40,60);x.closePath();x.fillStyle=MAR;x.fill();x.stroke();
 line(-18,60,-30,150);line(18,60,34,150);const a=-2.3+arm*1.9;line(25,-60,25+Math.cos(a)*85,-60+Math.sin(a)*85);x.restore()}
function humanoid(X,Y,s,arm){// our own generic humanoid robot
 x.save();x.translate(X,Y);x.scale(s,s);L(9,INK);
 rr(-48,-210,96,78,26);x.fillStyle=LF;x.fill();x.stroke();rr(-30,-188,60,22,11);x.fillStyle=SAF;x.fill();
 line(0,-210,0,-236);circle(0,-244,10,INK,6,SAF);
 rr(-62,-118,124,160,30);x.fillStyle='#FBF6EC';x.fill();x.stroke();circle(0,-50,16,null,0,SAF);
 line(-36,42,-44,170);line(36,42,46,170);rr(-70,166,52,18,8);x.fillStyle=INK;x.fill();rr(20,166,52,18,8);x.fill();
 line(-62,-100,-96,-10);const a=-2.3+arm*1.9;line(62,-100,62+Math.cos(a)*100,-100+Math.sin(a)*100);circle(62+Math.cos(a)*100,-100+Math.sin(a)*100,12,INK,6,LF);x.restore()}

// 1. hook: seven bags drop into the hole; then the "teacher" video appears
S.hook=(p,lt,d,t)=>{const BX=W/2+250,BY=CY+260;board(BX,BY,1.5,fin(lt));
 const st=kw(t,'seven')-0.4;for(let i=0;i<7;i++){const s=st+i*0.32;const u=cl(s/0.7);if(u<=0)continue;const [a,b]=arcPt(eio(u),90,CY+40,BX,BY-40,360);
  if(u<1)bag(a,b,1.2,SAF,u*6);else{/* landed: show tally */}}
 for(let i=0;i<7;i++){const s=st+i*0.32-0.7;const k=pop(s);if(k>0)bag(W/2-330+i*110,CY-130,1.05*k,SAF,0)}
 const n=Math.max(0,Math.min(7,Math.floor((t-(curSeg(t).start)-0)/1)));// unused
 txt('in a row',W/2,CY-40,'italic 46px IMI',INK,'center',fin(st+2.2));
 const v=since(t,1);const k=pop(v);if(k>0){x.save();x.globalAlpha*=1;frame(W/2-250,CY+260,360,290,k,{prog:0.2+0.6*cl(v/3)});thrower(W/2-310,CY+262,0.6*k,0.5+0.5*Math.sin(v*3));play(W/2-180,CY+220,0.9*k,0.85);x.restore();
  txt('1 video',W/2-250,CY+460,'52px IXB',SAF,'center',fin(kw(t,'video')))}};

// 2. launch: a new AI model "switches on" (generic brain + sun rays, no logo)
S.launch=(p,lt,d,t)=>{const k=pop(lt);const g=fin(kw(t,'Argon,'));
 x.save();x.translate(W/2,CY-150);for(let i=0;i<12;i++){const a=i*Math.PI/6+lt*0.15;L(10,SAF);x.globalAlpha=0.8*g;line(Math.cos(a)*190,Math.sin(a)*190,Math.cos(a)*(190+70*g),Math.sin(a)*(190+70*g))}x.restore();
 circle(W/2,CY-150,165*k,INK,8,'#FFF3DC');ic('brain',W/2,CY-150,1.15*k);
 txt('Gemini 4 Argon',W/2,CY+130,'92px IXB',SAF,'center',fin(kw(t,'Gemini')));
 txt('Google’s newest frontier AI model',W/2,CY+225,'italic 44px IMI',INK,'center',fin(kw(t,'frontier')));
 const r=fin(kw(t,'model.')+0.2);if(r>0){x.save();x.translate(W/2,CY+370);x.globalAlpha*=r;rr(-260,-46,520,92,46);x.fillStyle=INK;x.fill();txt('public since 13 Oct',0,2,'36px IXB','#fff');x.restore()}};

// 3. watch: video -> mapped scene -> its own physics simulation
S.watch=(p,lt,d,t)=>{const k=pop(lt);frame(W/2,CY-280,640,400,k,{prog:cl(lt/8)});
 const v=lt;thrower(W/2-180,CY-275,0.8*k,0.5+0.5*Math.sin(v*2.5));
 const e=cl(kw(t,'watched')/1.2);if(e>0){dashedArc(W/2-120,CY-370,W/2+190,CY-250,170,e,SAF);ic('eye',W/2+210,CY-420,0.45*fin(kw(t,'watched')))}
 board(W/2+200,CY-230,0.55,k);
 // simulation grid below
 const m=fin(kw(t,'mapped'));if(m>0){x.save();x.globalAlpha*=m;const gx=W/2,gy=CY+300;L(3,'rgba(43,33,24,.35)');
  for(let i=-6;i<=6;i++){line(gx+i*60-i*25,gy-150,gx+i*80,gy+150)}for(let j=0;j<=6;j++){const yy=gy-150+j*50,w=(330+ j*25);line(gx-w,yy,gx+w,yy)}
  x.restore();label('mapped scene',W/2-300,CY+90,34,INK,m)}
 const s=kw(t,'simulation');const e2=cl(s/1);if(e2>0){dashedArc(W/2-260,CY+330,W/2+240,CY+260,240,e2,SAF);const [a,b]=arcPt(eio(cl((lt*0.6)%1)),W/2-260,CY+330,W/2+240,CY+260,240);bag(a,b,0.9);
  ic('chip',W/2+300,CY+90,0.4*pop(s));label('its own simulation',W/2+170,CY+480,36,SAF,fin(s))}};

// 4. transfer: our generic humanoid throws; misses (warm-up) then seven straight
S.transfer=(p,lt,d,t)=>{const HX=W/2-280,HY=CY+150,BX=W/2+260,BY=CY+320;const k=pop(lt);
 board(BX,BY,1.25,k);const arm=0.5+0.5*Math.sin(lt*4.2);humanoid(HX,HY,1.15*k,arm);
 txt('a real humanoid',W/2,CY-470,'52px IXB',INK,'center',fin(kw(t,'real')));
 const w=since(t,1);// warm-up misses
 for(let i=0;i<2;i++){const u=cl((w-i*0.45)/0.6);if(u<=0)continue;const [a,b]=arcPt(eio(u),HX+90,HY-130,BX-190+i*30,BY+70,240);bag(a,b,1,'#D8C7AC',u*5)}
 if(w>0)label('warm-up',BX-180,BY+140,30,MUTE,fin(w-0.5));
 const s=w-1.0;for(let i=0;i<7;i++){const u=cl((s-i*0.25)/0.5);if(u<=0)continue;if(u<1){const [a,b]=arcPt(eio(u),HX+90,HY-130,BX,BY-30,300);bag(a,b,1,SAF,u*6)}}
 for(let i=0;i<7;i++){const kk=pop(s-i*0.25-0.5);if(kk>0){circle(W/2-300+i*100,CY-350,34*kk,INK,6,SAF);txt(String(i+1),W/2-300+i*100,CY-348,'36px IXB',INK,'center',kk)}}
 txt('straight shots',W/2,CY-260,'italic 44px IMI',SAF,'center',fin(kw(t,'straight')+0.3))};

// 5. weeks -> hours (Google's claim)
S.hours=(p,lt,d,t)=>{const k=pop(lt);// stack of calendar pages = weeks
 for(let i=4;i>=0;i--){ic('calendar',W/2-260+i*14,CY-60-i*14,1.25*k)}
 label('weeks',W/2-240,CY+130,46,INK,k);
 const h=kw(t,'hours.');const e=eio(cl((kw(t,'into')+0.1)/0.6));if(e>0){L(10,SAF);line(W/2-90,CY-60,W/2-90+170*e,CY-60);if(e>0.95){x.fillStyle=SAF;x.beginPath();x.moveTo(W/2+95,CY-60);x.lineTo(W/2+60,CY-82);x.lineTo(W/2+60,CY-38);x.fill()}}
 const k2=pop(h);if(k2>0){ic('clock',W/2+270,CY-60,1.3*k2);label('hours',W/2+270,CY+130,46,SAF,k2)}
 txt('Google says',W/2,CY-320,'italic 46px IMI',INK,'center',fin(lt-0.1)*0.85);
 // a small mountain-and-sun line for the long road shrinking
};

// 6. caveat
S.caveat=(p,lt,d,t)=>T.list(p,lt,t,{gap:250,items:[{ic:'magnifier',l:"Google’s own demo",at:'own'},{ic:'box',l:'One simple game',at:'simple'},{ic:'warn',l:'Not an independent test',at:'independent'}]});

// 7. takeaway: video, not code
S.takeaway=(p,lt,d,t)=>{const kv=pop(lt-0.1),kt=fin(kw(t,'video,')+0.1);const kc=pop(kw(t,'not')+0.1);

 frame(W/2,CY-180,520,360,kv,{prog:0.7});if(kv>0){thrower(W/2-60,CY-185,0.62*kv,0.7);play(W/2+110,CY-220,1*kv,0.85)}
 txt('next skill =',W/2,CY-470,'48px ISB',INK,'center',fin(lt-0.2));
 txt('a video',W/2,CY+80,'84px IXB',SAF,'center',kt);
 if(kc>0){x.save();x.globalAlpha*=0.6*kc;txt('</>',W/2,CY+250,'110px IXB',MUTE,'center');x.restore();x.save();L(12,RED);x.globalAlpha*=kc;line(W/2-120,CY+300,W/2+120,CY+200);x.restore();txt('not code',W/2,CY+380,'italic 46px IMI',INK,'center',kc)}};

// 8. close: callback
S.close=(p,lt,d,t)=>{const a=fin(lt);txt('1',W/2,CY-230,'220px IXB',SAF,'center',a);txt('video',W/2,CY-90,'italic 56px IMI',INK,'center',a);
 const b=fin(kw(t,'Seven')+0.1);txt('7',W/2,CY+150,'220px IXB',INK,'center',b);txt('straight shots',W/2,CY+290,'italic 56px IMI',INK,'center',b);
 x.save();x.globalAlpha*=0.9*b;x.drawImage(IMG('lotus'),W/2-170,CY+360,340,183);x.restore()};
