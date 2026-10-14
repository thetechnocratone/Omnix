// Shared scene library for Omnix narrated reels (bright cream/saffron theme).
// Loaded by drive.py before each episode's scenes.js. Episodes can mix these
// templates (T.*) with fully custom S.<scene> functions.
const LF='#EADCC4',GREEN='#5E8C4E';
// --- timing helpers: seconds since part i of the CURRENT segment started (negative = not yet)
function curSeg(t){const s=CFG.segs;for(let i=s.length-1;i>=0;i--)if(t>=s[i].start-0.2)return s[i];return s[0]}
function since(t,i){const s=curSeg(t);const P=s.parts[Math.min(i,s.parts.length-1)];return t-P[1]}
function kw(t,word){word=word.replace(/[^\w'-]/g,'');// seconds since a word in the current segment is spoken (approx, same maths as captions)
 const s=curSeg(t);for(const [tx,a,b] of s.parts){const ws=tx.split(/\s+/);const tot=ws.reduce((q,w)=>q+w.length+3,0);let acc=0;for(const w of ws){if(w.replace(/[^\w'-]/g,'').toLowerCase()===word.toLowerCase())return t-(a+(b-a)*acc/tot);acc+=w.length+3}}return 99}
const pop=v=>back(cl(v/0.35)), fin=v=>eo(cl(v/0.4));
function L(w,c){x.lineWidth=w;x.strokeStyle=c||INK;x.lineCap='round';x.lineJoin='round'}
function line(a,b,c,d){x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()}
function shadow(on){if(on){x.shadowColor='rgba(60,40,20,0.22)';x.shadowBlur=30;x.shadowOffsetY=12}else{x.shadowColor='transparent';x.shadowBlur=0;x.shadowOffsetY=0}}
function label(s,X,Y,size,col,a){txt(s,X,Y,(size||36)+'px ISB',col||INK,'center',a==null?0.85:a)}
// ---------------- icons (drawn in a ~200x200 box centred on 0,0) ----------------
function ic(k,X,Y,s,o){o=o||{};const C=o.col||INK,F=o.fill||LF,A=o.acc||SAF;x.save();x.translate(X,Y);x.scale(s||1,s||1);if(o.rot)x.rotate(o.rot);L(8,C);x.fillStyle=F;
 const R=(a,b,w,h,r,f)=>{rr(a,b,w,h,r);if(f!==0){x.fillStyle=f||F;x.fill()}x.stroke()};
 const Cc=(a,b,r,f)=>{x.beginPath();x.arc(a,b,r,0,7);if(f!==0){x.fillStyle=f||F;x.fill()}x.stroke()};
 switch(k){
 case'wallet':R(-90,-55,180,120,18);R(30,-20,70,50,12,A);Cc(55,5,9,'#fff');line(-70,-55,40,-85);line(40,-85,60,-55);break;
 case'key':Cc(-50,0,42);Cc(-50,0,14,'#fff');x.lineWidth=16;line(-8,0,90,0);line(60,0,60,30);line(85,0,85,24);break;
 case'lock':x.lineWidth=18;x.beginPath();x.arc(0,-30,48,Math.PI,0);x.stroke();L(8,C);R(-75,-30,150,115,18,A);Cc(0,20,12,'#fff');x.fillStyle='#fff';x.fillRect(-5,25,10,30);break;
 case'unlock':x.lineWidth=18;x.beginPath();x.arc(0,-50,48,Math.PI,-0.2);x.stroke();L(8,C);R(-75,-30,150,115,18);Cc(0,20,12,INK);break;
 case'chip':R(-60,-60,120,120,14,C);R(-32,-32,64,64,8,A);for(let i=-2;i<=2;i++){line(i*24,-60,i*24,-85);line(i*24,60,i*24,85);line(-60,i*24,-85,i*24);line(60,i*24,85,i*24)}break;
 case'box':x.beginPath();x.moveTo(-90,-30);x.lineTo(0,-75);x.lineTo(90,-30);x.lineTo(0,15);x.closePath();x.fillStyle=MAR;x.fill();x.stroke();x.beginPath();x.moveTo(-90,-30);x.lineTo(-90,60);x.lineTo(0,105);x.lineTo(90,60);x.lineTo(90,-30);x.moveTo(0,15);x.lineTo(0,105);x.fillStyle=F;x.fill();x.stroke();break;
 case'phone':R(-55,-100,110,200,22);R(-40,-75,80,135,8,'#fff');Cc(0,82,7,C);break;
 case'coin':Cc(0,0,72,A);Cc(0,0,52,0);txt(o.sym||'$',0,4,'bold 64px IXB',C);break;
 case'globe':Cc(0,0,85,o.fill||'#fff');x.beginPath();x.ellipse(0,0,38,85,0,0,7);x.stroke();line(-85,0,85,0);x.beginPath();x.moveTo(-74,-40);x.quadraticCurveTo(0,-30,74,-40);x.moveTo(-74,40);x.quadraticCurveTo(0,50,74,40);x.stroke();break;
 case'brain':{const lobe=(sx)=>{x.beginPath();x.moveTo(0,-78);x.bezierCurveTo(sx*40,-100,sx*95,-80,sx*92,-35);x.bezierCurveTo(sx*118,-10,sx*110,45,sx*80,60);x.bezierCurveTo(sx*70,90,sx*25,95,0,78);x.closePath();x.fillStyle=F;x.fill();x.stroke()};lobe(-1);lobe(1);x.lineWidth=6;x.beginPath();x.moveTo(-60,-40);x.quadraticCurveTo(-30,-30,-40,0);x.moveTo(-75,25);x.quadraticCurveTo(-45,20,-35,45);x.moveTo(60,-45);x.quadraticCurveTo(30,-30,45,0);x.moveTo(78,25);x.quadraticCurveTo(45,25,35,50);x.moveTo(-20,-60);x.quadraticCurveTo(-35,-45,-20,-25);x.moveTo(22,-62);x.quadraticCurveTo(35,-45,20,-28);x.stroke();Cc(0,0,10,A);}break;
 case'robot':R(-55,-95,110,85,24);Cc(-22,-55,11,A);Cc(22,-55,11,A);line(0,-95,0,-115);Cc(0,-122,8,A);R(-70,0,140,105,22);R(-28,25,56,40,8,MAR);line(-70,20,-100,70);line(70,20,100,70);break;
 case'truck':R(-100,-45,120,85,10);R(20,-15,75,55,10,A);Cc(-60,52,20,'#fff');Cc(55,52,20,'#fff');break;
 case'bin':R(-60,-50,120,140,14);R(-75,-75,150,28,8,A);line(-20,-25,-20,65);line(20,-25,20,65);line(-20,-75,-10,-95);line(-10,-95,10,-95);line(10,-95,20,-75);break;
 case'cone':x.beginPath();x.moveTo(-15,-80);x.lineTo(15,-80);x.lineTo(45,60);x.lineTo(-45,60);x.closePath();x.fillStyle=A;x.fill();x.stroke();x.fillStyle='#fff';x.fillRect(-28,-20,56,16);R(-70,60,140,18,4,C);break;
 case'crane':line(-40,95,-40,-90);line(-40,-90,90,-90);line(-80,-90,-40,-90);line(-40,-60,-10,-90);line(70,-90,70,-20);R(55,-20,30,26,4,A);R(-70,85,60,15,3,C);break;
 case'train':R(-80,-80,160,150,34);R(-58,-55,116,55,10,'#fff');Cc(-40,35,12,A);Cc(40,35,12,A);line(-55,75,-80,105);line(55,75,80,105);line(-95,105,95,105);break;
 case'building':R(-60,-100,120,200,6);for(let j=0;j<4;j++)for(let i=0;i<2;i++)R(-38+i*44,-80+j*42,32,26,4,j%2?'#fff':MAR);break;
 case'person':Cc(0,-55,32,o.fill||F);x.beginPath();x.moveTo(-60,90);x.quadraticCurveTo(-60,-5,0,-5);x.quadraticCurveTo(60,-5,60,90);x.closePath();x.fillStyle=o.fill||F;x.fill();x.stroke();break;
 case'leaf':x.beginPath();x.moveTo(-70,70);x.quadraticCurveTo(-80,-70,70,-70);x.quadraticCurveTo(80,70,-70,70);x.fillStyle=GREEN;x.fill();x.stroke();line(-70,70,30,-30);break;
 case'sun':Cc(0,0,48,A);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(Math.cos(a)*68,Math.sin(a)*68,Math.cos(a)*92,Math.sin(a)*92)}break;
 case'shield':x.beginPath();x.moveTo(0,-95);x.lineTo(80,-60);x.quadraticCurveTo(80,50,0,100);x.quadraticCurveTo(-80,50,-80,-60);x.closePath();x.fillStyle=F;x.fill();x.stroke();x.lineWidth=14;x.strokeStyle=A;x.beginPath();x.moveTo(-32,0);x.lineTo(-6,26);x.lineTo(38,-24);x.stroke();break;
 case'warn':x.beginPath();x.moveTo(0,-90);x.lineTo(95,75);x.lineTo(-95,75);x.closePath();x.fillStyle=A;x.fill();x.stroke();x.lineWidth=14;line(0,-30,0,20);Cc(0,48,8,C);break;
 case'block':R(-75,-75,150,150,16);x.fillStyle=MAR;x.fillRect(-55,-55,110,22);for(let i=0;i<3;i++){x.fillStyle=C;x.globalAlpha*=0.5;x.fillRect(-55,-15+i*24,110-i*25,10);x.globalAlpha/=0.5}break;
 case'book':x.beginPath();x.moveTo(0,-60);x.quadraticCurveTo(-50,-85,-100,-70);x.lineTo(-100,70);x.quadraticCurveTo(-50,55,0,80);x.quadraticCurveTo(50,55,100,70);x.lineTo(100,-70);x.quadraticCurveTo(50,-85,0,-60);x.closePath();x.fillStyle='#fff';x.fill();x.stroke();line(0,-60,0,80);for(let i=0;i<4;i++){x.lineWidth=5;line(-80,-35+i*25,-20,-30+i*25);line(20,-30+i*25,80,-35+i*25)}break;
 case'eye':x.beginPath();x.moveTo(-95,0);x.quadraticCurveTo(0,-80,95,0);x.quadraticCurveTo(0,80,-95,0);x.closePath();x.fillStyle='#fff';x.fill();x.stroke();Cc(0,0,30,A);Cc(0,0,12,C);break;
 case'bank':x.beginPath();x.moveTo(-100,-40);x.lineTo(0,-95);x.lineTo(100,-40);x.closePath();x.fillStyle=A;x.fill();x.stroke();for(let i=-2;i<=2;i++)R(i*38-10,-30,20,95,4);R(-105,70,210,20,4,C);break;
 case'doc':R(-70,-95,140,190,12,'#fff');for(let i=0;i<5;i++){x.lineWidth=7;line(-45,-60+i*30,i==4?10:45,-60+i*30)}break;
 case'check':Cc(0,0,80,GREEN);L(18,'#fff');x.beginPath();x.moveTo(-35,0);x.lineTo(-8,28);x.lineTo(38,-26);x.stroke();break;
 case'cross':Cc(0,0,80,RED);L(18,'#fff');line(-30,-30,30,30);line(30,-30,-30,30);break;
 case'clock':Cc(0,0,80,'#fff');L(10,C);line(0,0,0,-50);line(0,0,38,18);Cc(0,0,8,A);break;
 case'camera':R(-90,-50,180,110,16);Cc(0,5,35,'#fff');Cc(0,5,15,A);R(-40,-70,50,22,6,C);break;
 case'tree':x.fillStyle=C;x.fillRect(-10,20,20,80);Cc(0,-20,70,GREEN);break;
 case'mountain':x.beginPath();x.moveTo(-110,80);x.lineTo(-30,-60);x.lineTo(10,0);x.lineTo(50,-80);x.lineTo(120,80);x.closePath();x.fillStyle=F;x.fill();x.stroke();break;
 case'elephant':x.beginPath();x.ellipse(0,0,85,60,0,0,7);x.fillStyle=F;x.fill();x.stroke();Cc(78,-20,40);x.beginPath();x.moveTo(110,-10);x.quadraticCurveTo(125,50,108,85);x.stroke();for(const lx of[-55,-20,25,55]){R(lx-12,40,24,50,6)}x.beginPath();x.ellipse(55,-20,26,34,0,0,7);x.fillStyle=MAR;x.fill();x.stroke();Cc(90,-30,5,C);break;
 case'note':R(-100,-55,200,110,12,'#E9F0DC');Cc(0,0,30,'#fff');txt('$',0,3,'bold 40px IXB',C);break;
 case'chain':x.lineWidth=16;for(let i=0;i<3;i++){x.save();x.translate(-70+i*70,0);x.rotate(i%2?0:0);rr(-45,-26,90,52,26);x.strokeStyle=i==1?A:C;x.stroke();x.restore()}break;
 case'pothole':x.fillStyle='#8E8070';x.fillRect(-110,-40,220,90);x.beginPath();x.ellipse(0,5,62,26,0,0,7);x.fillStyle=C;x.fill();break;
 case'magnifier':Cc(-15,-15,55,'#fff');x.lineWidth=20;line(25,25,80,80);break;
 case'hand':x.beginPath();x.moveTo(-40,90);x.lineTo(-40,-10);x.lineTo(-62,-50);x.quadraticCurveTo(-55,-68,-40,-55);x.lineTo(-25,-30);x.lineTo(-25,-90);x.quadraticCurveTo(-12,-104,0,-90);x.lineTo(0,-40);x.lineTo(0,-100);x.quadraticCurveTo(14,-112,26,-100);x.lineTo(26,-40);x.lineTo(26,-88);x.quadraticCurveTo(40,-100,52,-88);x.lineTo(52,20);x.quadraticCurveTo(52,90,20,90);x.closePath();x.fillStyle=F;x.fill();x.stroke();break;
 case'calendar':R(-85,-75,170,160,14,'#fff');x.fillStyle=A;rr(-85,-75,170,40,14);x.fill();x.stroke();for(let j=0;j<3;j++)for(let i=0;i<4;i++){x.fillStyle=C;x.globalAlpha*=.5;x.fillRect(-62+i*34,-20+j*30,20,16);x.globalAlpha/=.5}break;
 case'map':x.beginPath();x.moveTo(-100,-70);x.lineTo(-35,-90);x.lineTo(35,-70);x.lineTo(100,-90);x.lineTo(100,70);x.lineTo(35,90);x.lineTo(-35,70);x.lineTo(-100,90);x.closePath();x.fillStyle='#fff';x.fill();x.stroke();line(-35,-90,-35,70);line(35,-70,35,90);Cc(10,-10,16,A);break;
 }x.restore()}
// --------------- templates ---------------
const T={};
// hero number. o={num,unit,sub,icon,iconWord}
T.big=(p,lt,t,o)=>{if(o.icon){const k=pop(lt-0.05);if(k>0)ic(o.icon,W/2,CY-230,1.5*k,o.ico)}
 const k2=fin(o.at!=null?kw(t,o.at):lt-0.35);txt(o.num,W/2-(o.unit?0:0),CY+20,(o.size||190)+'px IXB',SAF,'center',k2);
 if(o.unit)txt(o.unit,W/2,CY+150,'italic 58px IMI',INK,'center',k2);
 if(o.sub)txt(o.sub,W/2,CY+240,'40px ISB',INK,'center',0.8*fin(lt-0.9))};
// row/grid of icons appearing in sequence; o={items:[{ic,l,at?}], cols, gap, y, s}
T.grid=(p,lt,t,o)=>{const n=o.items.length,cols=o.cols||Math.min(n,3),gx=o.gx||300,gy=o.gy||330,rows=Math.ceil(n/cols);
 o.items.forEach((it,i)=>{const r=(i/cols)|0,c=i%cols,inRow=Math.min(cols,n-r*cols);const X=W/2+(c-(inRow-1)/2)*gx,Y=(o.y||CY)+(r-(rows-1)/2)*gy;
  const st=it.at!=null?kw(t,it.at):(it.part!=null?since(t,it.part):lt-0.15-i*(o.step||0.35));const k=pop(st);if(k<=0)return;
  if(o.tile){x.save();x.translate(X,Y);x.scale(k,k);shadow(1);rr(-125,-125,250,250,28);x.fillStyle=it.dim?'#F1E7D6':'#FBF6EC';x.fill();shadow(0);L(4,INK);x.stroke();x.restore()}
  ic(it.ic,X,Y-(it.l?22:0),(o.s||0.95)*k,it.o);if(it.l)label(it.l,X,Y+(o.tile?92:120),o.ls||32,INK,k)})};
// flow A -> B -> C. o={nodes:[{ic,l,at}],y, cut:index (draw cross over that arrow)}
T.flow=(p,lt,t,o)=>{const n=o.nodes.length,sp=o.sp||300,y=o.y||CY;const X0=W/2-(n-1)*sp/2;
 o.nodes.forEach((nd,i)=>{const st=nd.at!=null?kw(t,nd.at):(nd.part!=null?since(t,nd.part):lt-0.1-i*(o.step||0.6));const k=pop(st);const X=X0+i*sp;
  if(i>0){const a=eio(cl(st/0.4));if(a>0){L(8,MUTE);x.setLineDash([16,14]);line(X-sp+95,y,X-sp+95+(sp-190)*a,y);x.setLineDash([]);if(a>0.95){x.fillStyle=MUTE;x.beginPath();x.moveTo(X-95,y);x.lineTo(X-118,y-14);x.lineTo(X-118,y+14);x.fill()}}}
  if(k>0){ic(nd.ic,X,y,(o.s||1.15)*k,nd.o);if(nd.l)label(nd.l,X,y+160,38,INK,k)}})};
// silos -> network. o={icons:[..], labels:[..], center:'brain'|'chain'|..., connectAt:p}
T.net=(p,lt,t,o)=>{const n=o.icons.length,R=330,cx=W/2,cy=CY+20;const c=o.connectAt!=null?eio((p-o.connectAt)/0.25):0;
 const pts=o.icons.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*R,cy+Math.sin(a)*R*0.95]});
 if(c>0){L(6,SAF);x.globalAlpha*=0.9;pts.forEach((a,i)=>pts.forEach((b,j)=>{if(j>i){const e=cl(c*1.4-(i+j)*0.04);if(e>0)line(a[0],a[1],a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e)}}));x.globalAlpha/=0.9;
  if(o.center){const k=pop((p-o.connectAt-0.12)*d0(o));if(k>0){x.save();x.translate(cx,cy);x.scale(k,k);circle(0,0,105,INK,6,'#FFF8EC');x.restore();ic(o.center,cx,cy,0.75*k)}}}
 pts.forEach(([X,Y],i)=>{const k=pop(lt-0.1-i*0.22);if(k<=0)return;x.save();x.translate(X,Y);x.scale(k,k);shadow(1);rr(-95,-95,190,190,24);x.fillStyle='#FBF6EC';x.fill();shadow(0);L(4,c>0.5?SAF:INK);if(c<0.5){x.setLineDash([10,10])}x.stroke();x.setLineDash([]);x.restore();ic(o.icons[i],X,Y-10,0.62*k);if(o.labels)label(o.labels[i],X,Y+128,30,INK,k)})};
function d0(o){return 3}
// checklist / vision lines; o={items:[{ic,l,part}]}
T.list=(p,lt,t,o)=>{const n=o.items.length,gap=o.gap||250,y0=CY-(n-1)*gap/2+(o.dy||0);
 o.items.forEach((it,i)=>{const st=it.part!=null?since(t,it.part):(it.at!=null?kw(t,it.at):lt-0.2-i*0.8);const k=pop(st);if(k<=0)return;const Y=y0+i*gap;
  x.save();x.translate(W/2,Y);x.scale(1,k);shadow(1);rr(-460,-110,920,220,30);x.fillStyle='#FBF6EC';x.fill();shadow(0);L(4,INK);x.stroke();x.restore();
  circle(W/2-340,Y,72*k,null,0,i%2?MAR:LIGHT);ic(it.ic,W/2-340,Y,0.55*k);
  const ws=wrap(it.l,'44px ISB',580);ws.forEach((w,j)=>txt(w,W/2-240,Y+(j-(ws.length-1)/2)*54,'44px ISB',INK,'left',fin(st-0.1)))})};
function wrap(s,f,mw){x.save();x.font=f;const out=[];let cur='';s.split(' ').forEach(w=>{const tt=cur?cur+' '+w:w;if(x.measureText(tt).width>mw&&cur){out.push(cur);cur=w}else cur=tt});out.push(cur);x.restore();return out}
// two-sided comparison: o={l:{ic,t},r:{ic,t},bad:'l'|'r', at}
T.vs=(p,lt,t,o)=>{const k1=pop(lt-0.1),k2=pop(o.at!=null?kw(t,o.at):lt-1.2);
 if(k1>0){ic(o.l.ic,W/2-240,CY-40,1.2*k1,o.l.o);label(o.l.t,W/2-240,CY+130,38,INK,k1)}
 if(k2>0){ic(o.r.ic,W/2+240,CY-40,1.2*k2,o.r.o);label(o.r.t,W/2+240,CY+130,38,INK,k2)}
 txt('vs',W/2,CY-40,'italic 54px IMI',MUTE,'center',k2);
 if(o.bad){const k=pop((o.badAt!=null?kw(t,o.badAt):lt-2)) ;if(k>0)ic('cross',W/2+(o.bad=='l'?-240:240)+90,CY-140,0.5*k)}
 if(o.good){const k=pop((o.goodAt!=null?kw(t,o.goodAt):lt-2.4));if(k>0)ic('check',W/2+(o.good=='l'?-240:240)+90,CY-140,0.5*k)}};
// statement: big text lines centred, each revealed by word. o={lines:[[text,col,size,at]]}
T.say=(p,lt,t,o)=>{(o.lines).forEach((ln,i)=>{const [s,col,size,at]=ln;const k=fin(at?kw(t,at):lt-0.2-i*0.5);txt(s,W/2,CY+(o.dy||0)+(i-(o.lines.length-1)/2)*((size||80)*1.35),(size||80)+'px IXB',col||INK,'center',k)});if(o.icon){const k=pop(lt);ic(o.icon,W/2,CY-330,1.2*k,o.ico)}};
// the Omnix stack: o={parts:[0,1,2] mapping each pillar to a narration part}, which:[alki,chain,bot]
T.stack=(p,lt,t,o)=>{const P=[['brain','A.L.K.I.','plans'],['chain','OmniChain','records'],['robot','OmniBot','does the work']];const use=o.which||[0,1,2];const n=use.length,sp=310;
 use.forEach((w,i)=>{const st=o.parts?since(t,o.parts[i]):lt-0.2-i*1.5;const k=pop(st);const X=W/2+(i-(n-1)/2)*sp,Y=CY;if(k<=0)return;
  x.save();x.translate(X,Y);x.scale(k,k);shadow(1);rr(-140,-190,280,380,34);x.fillStyle=(st>0&&(i==n-1||(o.parts?since(t,o.parts[i+1])<0:st<1.5)))?'#FFF3DC':'#FBF6EC';x.fill();shadow(0);L(5,SAF);x.stroke();x.restore();
  ic(P[w][0],X,Y-55,0.85*k);txt(P[w][1],X,Y+95,'40px IXB',SAF,'center',k);txt((o.verbs||[])[i]||P[w][2],X,Y+145,'italic 30px IMI',INK,'center',0.8*k)});
 txt('in the making · design intent',W/2,CY+300,'26px IM',INK,'center',0.45*fin(lt-1))};
// many hands meeting in a circle around a glowing centre
T.hands=(p,lt,t,o)=>{o=o||{};const n=o.n||8,R=300;const g=eo(lt/1.2);
 x.save();x.translate(W/2,CY);const pulse=0.5+0.5*Math.sin(lt*3);x.shadowColor='rgba(241,150,17,'+(0.4+0.3*pulse)+')';x.shadowBlur=70;circle(0,0,85*g,null,0,SAF);x.restore();
 if(o.center)ic(o.center,W/2,CY,0.55*g,{col:'#fff',fill:SAF});
 const tones=['#F3D2A8','#C99B6E','#8D5A3B','#E7B98F','#6B4128','#D8A97F','#A87150','#F0C9A0'];
 for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;const k=eo(cl((lt-0.2-i*0.12)/0.7));const r=R+260*(1-k);x.save();x.translate(W/2+Math.cos(a)*r,CY+Math.sin(a)*r);x.rotate(a-Math.PI/2+Math.PI);x.globalAlpha*=k;ic('hand',0,0,0.9,{fill:tones[i%tones.length]});x.restore()}
 if(o.words)o.words.forEach((w,i)=>txt(w,W/2,CY+520+i*60,'italic 40px IMI',INK,'center',0.8*fin(lt-1.5-i*0.4)))};
// streams merging into one river toward the sea / sunrise
T.rivers=(p,lt,t,o)=>{const k=eio(cl(lt/2.4));const sx=[140,340,540,740,940];
 x.save();x.globalAlpha*=0.9;circle(W/2,CY+380,170*eo(lt/1.5),null,0,MAR);x.restore();
 sx.forEach((X,i)=>{L(18-Math.abs(i-2)*3,i==2?SAF:'#6FA3B8');x.beginPath();x.moveTo(X,CY-420);for(let s=0;s<=40*k;s++){const u=s/40;const xx=X+(W/2-X)*eio(u)+Math.sin(u*8+i)*30*(1-u);x.lineTo(xx,CY-420+u*700)}x.stroke()});
 if(k>0.95){L(60,'#6FA3B8');x.globalAlpha*=fin(lt-2.4);line(W/2,CY+280,W/2,CY+340)}
 ic('mountain',W/2,CY+470,1.6,{fill:'#F1E3C8'})};
// orbits coming into alignment
T.orbits=(p,lt,t,o)=>{const al=eio(cl((p-0.35)/0.4));circle(W/2,CY,70,null,0,SAF);[160,250,340,430].forEach((r,i)=>{circle(W/2,CY,r,'rgba(43,33,24,.25)',3);const base=i*1.7+lt*(0.9-i*0.18);const tgt=-Math.PI/2;const a=base*(1-al)+tgt*al+(al>0.99?Math.sin(lt*2)*0.0:0);circle(W/2+Math.cos(a)*r,CY+Math.sin(a)*r,22+i*4,INK,4,i%2?MAR:'#FBF6EC')});
 if(al>0.6){L(4,SAF);x.globalAlpha*=fin((p-0.7)*4);line(W/2,CY-70,W/2,CY-460)}};
// lotus + sunrise
T.sunrise=(p,lt,t,o)=>{const k=eo(lt/2);x.save();x.beginPath();x.rect(0,0,W,CY+160);x.clip();circle(W/2,CY+160-260*k,190,null,0,MAR);circle(W/2,CY+160-260*k,140,null,0,SAF);x.restore();
 L(4,'rgba(43,33,24,.3)');line(60,CY+160,W-60,CY+160);x.drawImage(IMG('lotus'),W/2-230,CY+190,460,247)};
// world: globe with spreading dots + number
T.world=(p,lt,t,o)=>{const k=pop(lt);ic('globe',W/2,CY-170,2.2*k,{fill:'#FFF8EC'});const r=rng(5);for(let i=0;i<26;i++){const a=r()*6.28,rad=Math.sqrt(r())*170;const e=pop(lt-0.5-i*0.06);if(e>0)circle(W/2+Math.cos(a)*rad,CY-170+Math.sin(a)*rad,10*e,null,0,i%3?SAF:RED)}
 if(o.lines)o.lines.forEach((ln,i)=>{const [s,col,size,at]=ln;txt(s,W/2,CY+200+i*((size||70)*1.25),(size||70)+'px IXB',col||INK,'center',fin(at?kw(t,at):lt-0.4-i*0.6))})};
// a mini bar comparing two values
T.bars=(p,lt,t,o)=>{const mx=Math.max(...o.bars.map(b=>b.v));o.bars.forEach((b,i)=>{const st=b.at?kw(t,b.at):lt-0.3-i*0.9;const e=eio(cl(st/0.8));const X=W/2+(i-(o.bars.length-1)/2)*300,base=CY+260,h=520*b.v/mx*e;rr(X-90,base-h,180,h,16);x.fillStyle=b.col||SAF;x.fill();L(5,INK);x.stroke();txt(b.top,X,base-h-50,'56px IXB',INK,'center',fin(st-0.5));label(b.l,X,base+50,32,INK,fin(st))})};
