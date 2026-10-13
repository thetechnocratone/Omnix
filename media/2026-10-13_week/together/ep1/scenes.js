// Build Together #1 — Bengaluru traffic (bright theme)
const FILL='#EADCC4';
function car(X,Y,c){rr(X-34,Y-18,68,36,10);x.fillStyle=c;x.fill();x.fillStyle='rgba(255,255,255,.5)';x.fillRect(X-12,Y-13,20,10)}
function icon(k,X,Y,s,col){x.save();x.translate(X,Y);x.scale(s,s);x.strokeStyle=col||INK;x.fillStyle=col||INK;x.lineWidth=7;x.lineCap='round';x.lineJoin='round';
 if(k=='light'){rr(-30,-70,60,140,16);x.stroke();circle(0,-40,14,null,0,RED);circle(0,0,14,null,0,SAF);circle(0,40,14,null,0,'#5E8C4E')}
 if(k=='bus'){rr(-60,-40,120,75,14);x.stroke();x.fillRect(-48,-28,96,26);circle(-32,40,11,null,0,col||INK);circle(32,40,11,null,0,col||INK)}
 if(k=='metro'){rr(-45,-60,90,105,26);x.stroke();x.fillRect(-32,-42,64,30);circle(-20,20,8,null,0,col||INK);circle(20,20,8,null,0,col||INK);x.beginPath();x.moveTo(-30,48);x.lineTo(-45,68);x.moveTo(30,48);x.lineTo(45,68);x.stroke()}
 if(k=='cone'){x.beginPath();x.moveTo(-15,-60);x.lineTo(15,-60);x.lineTo(42,50);x.lineTo(-42,50);x.closePath();x.fillStyle=SAF;x.fill();x.stroke();x.fillStyle='#fff';x.fillRect(-26,-5,52,14);x.fillRect(-55,50,110,12)}
 if(k=='cloud'){x.beginPath();x.arc(-25,0,28,Math.PI*0.5,Math.PI*1.5);x.arc(5,-22,34,Math.PI,Math.PI*2);x.arc(35,4,24,Math.PI*1.5,Math.PI*0.5);x.closePath();x.stroke();for(let i=0;i<3;i++){x.beginPath();x.moveTo(-20+i*20,40);x.lineTo(-28+i*20,62);x.stroke()}}
 x.restore()}
const ICONS=['light','bus','metro','cone','cloud'];

S.jam=(p,lt)=>{const lanes=4,cols=['#2B2118',SAF,'#B9A88E','#C2502E','#F3DDB8'];const a=eo(lt/0.6);x.save();x.globalAlpha*=a;
 const top=CY-330;for(let l=0;l<=lanes;l++){x.strokeStyle=l%lanes?'rgba(43,33,24,.25)':INK;x.lineWidth=l%lanes?4:6;x.setLineDash(l%lanes?[30,24]:[]);x.beginPath();x.moveTo(40,top+l*110);x.lineTo(W-40,top+l*110);x.stroke()}x.setLineDash([]);
 for(let l=0;l<lanes;l++)for(let i=0;i<9;i++){const X=((i*118+l*47+lt*(6+l*2))%(W+80))-40;car(X,top+55+l*110,cols[(i*3+l)%5])}
 x.restore();const k=eo((p-0.45)/0.15);txt('168',W/2,CY+260,'170px IXB',SAF,'center',k);txt('hours a year in rush-hour traffic',W/2,CY+360,'40px ISB',INK,'center',k*0.85)};

S.week=(p,lt)=>{const d=['MON','TUE','WED','THU','FRI','SAT','SUN'];const w=128,g=12,X0=W/2-(7*w+6*g)/2;
 d.forEach((n,i)=>{const k=back((lt-0.1-i*0.12)/0.3);if(k<=0)return;const X=X0+i*(w+g);x.save();x.translate(X+w/2,CY-40);x.scale(k,k);rr(-w/2,-110,w,220,16);const f=cl((lt-0.4-i*0.18)/0.25);x.fillStyle=f>0.5?SAF:FILL;x.fill();x.strokeStyle=INK;x.lineWidth=4;x.stroke();txt(n,0,-70,'28px IXB',f>0.5?'#fff':INK);
  x.strokeStyle=f>0.5?'#fff':INK;x.lineWidth=5;circle(0,25,36,f>0.5?'#fff':INK,5);x.beginPath();x.moveTo(0,25);x.lineTo(0,2);x.moveTo(0,25);x.lineTo(16,32);x.stroke();x.restore()});
 txt('1 full week',W/2,CY+170,'86px IXB',INK,'center',eo((p-0.35)/0.2));txt('standing still',W/2,CY+250,'italic 46px IMI',SAF,'center',eo((p-0.6)/0.2))};

S.speed=(p,lt)=>{const y=CY-40,x0=110,x1=W-110;x.strokeStyle=INK;x.lineWidth=8;x.beginPath();x.moveTo(x0,y);x.lineTo(x1,y);x.stroke();
 for(let i=0;i<=10;i++){const X=x0+(x1-x0)*i/10;x.lineWidth=4;x.beginPath();x.moveTo(X,y-16);x.lineTo(X,y+16);x.stroke();if(i%5==0)txt(i+' km',X,y+60,'30px ISB',INK,'center',0.7)}
 const prog=cl(lt/3.2)*0.55;car(x0+(x1-x0)*prog,y-50,SAF);
 const k=eo((p-0.35)/0.2);x.save();x.globalAlpha*=k;x.translate(W/2,CY+290);circle(0,0,120,INK,8);x.strokeStyle=SAF;x.lineWidth=26;x.beginPath();x.arc(0,0,92,-Math.PI/2,-Math.PI/2+Math.PI*2*0.6*cl((p-0.35)/0.4));x.stroke();txt('36',0,-10,'96px IXB',INK);txt('min',0,55,'32px ISB',INK,'center',0.7);x.restore();
 txt('for just 10 km',W/2,CY+470,'italic 40px IMI',INK,'center',0.8*k)};

S.silos=(p,lt)=>{const pos=[[W/2-300,CY-250],[W/2+300,CY-250],[W/2,CY],[W/2-300,CY+250],[W/2+300,CY+250]];
 if(p<0.28){txt('not one problem',W/2,CY,'80px IXB',INK,'center',eo(lt/0.5));return}
 pos.forEach(([X,Y],i)=>{const k=back((p-0.3-i*0.1)/0.1);if(k<=0)return;x.save();x.translate(X,Y);x.scale(k,k);rr(-120,-120,240,240,26);x.fillStyle=FILL;x.fill();x.strokeStyle=INK;x.lineWidth=4;x.setLineDash([14,10]);x.stroke();x.setLineDash([]);icon(ICONS[i],0,0,1);x.restore()});
 const al=eo((p-0.85)/0.1);txt('working alone',W/2,CY+470,'italic 46px IMI',RED,'center',al)};

S.connect=(p,lt)=>{const R=320,c=[W/2,CY];const k=eio(lt/1.4);
 ICONS.forEach((n,i)=>{const an=-Math.PI/2+i*Math.PI*2/5,X=c[0]+Math.cos(an)*R,Y=c[1]+Math.sin(an)*R;
  x.strokeStyle=SAF;x.lineWidth=6;x.beginPath();x.moveTo(c[0],c[1]);x.lineTo(c[0]+(X-c[0])*k,c[1]+(Y-c[1])*k);x.stroke();
  const an2=-Math.PI/2+((i+1)%5)*Math.PI*2/5,X2=c[0]+Math.cos(an2)*R,Y2=c[1]+Math.sin(an2)*R;const k2=eio((lt-1.0)/0.8);if(k2>0){x.strokeStyle='rgba(241,150,17,.5)';x.lineWidth=4;x.beginPath();x.moveTo(X,Y);x.lineTo(X+(X2-X)*k2,Y+(Y2-Y)*k2);x.stroke()}
  circle(X,Y,95,INK,4,FILL);icon(n,X,Y,0.7)});
 x.save();glow('rgba(241,150,17,.7)',50*k);circle(c[0],c[1],40+8*Math.sin(lt*4),null,0,SAF);x.shadowBlur=0;x.restore()};
function glow(c,b){x.shadowColor=c;x.shadowBlur=b}

S.vision=(p,lt)=>{
 if(p<0.29){const a=eo(lt/0.4);x.save();x.globalAlpha*=a;icon('light',W/2,CY,2.2);for(let r=0;r<3;r++){const q=((lt*0.6+r/3)%1);circle(W/2,CY,180+q*260,`rgba(241,150,17,${0.6*(1-q)})`,6)}x.restore();txt('signals that learn',W/2,CY+420,'italic 44px IMI',INK,'center',a);return}
 if(p<0.61){const q=(p-0.29)/0.32;const a=eo(q/0.15);x.save();x.globalAlpha*=a;rr(110,CY-380,W-220,700,30);x.fillStyle=FILL;x.fill();x.strokeStyle=INK;x.lineWidth=4;x.stroke();
  const lines=[[[150,CY-250],[500,CY-250],[650,CY-50],[W-150,CY-50]],[[300,CY+280],[400,CY+50],[700,CY+50],[850,CY-300]],[[150,CY+150],[W-150,CY+150]]];const cols=[SAF,'#2B2118','#C2502E'];
  lines.forEach((L,j)=>{x.strokeStyle=cols[j];x.lineWidth=12;x.beginPath();L.forEach((pt,i)=>i?x.lineTo(pt[0],pt[1]):x.moveTo(pt[0],pt[1]));x.stroke();
   for(let d=0;d<2;d++){let t2=((lt*0.18+d*0.5+j*0.2)%1);let segs=L.length-1,s=Math.min(segs-1,Math.floor(t2*segs)),f=t2*segs-s;const A=L[s],B=L[s+1];circle(A[0]+(B[0]-A[0])*f,A[1]+(B[1]-A[1])*f,18,'#fff',5,cols[j])}});
  x.restore();txt('one live map',W/2,CY+420,'italic 44px IMI',INK,'center',a);return}
 const q=(p-0.61)/0.39;const a=eo(q/0.2);x.save();x.globalAlpha*=a;icon('cone',W/2-180,CY,1.8);
 x.translate(W/2+170,CY-20);rr(-110,-140,220,280,14);x.fillStyle='#fff';x.fill();x.strokeStyle=INK;x.lineWidth=5;x.stroke();x.fillStyle='rgba(43,33,24,.3)';for(let l=0;l<5;l++)x.fillRect(-80,-105+l*36,160-l*18,10);
 const ck=back((q-0.45)/0.2);if(ck>0){x.save();x.scale(ck,ck);circle(70,110,48,null,0,SAF);x.strokeStyle='#fff';x.lineWidth=10;x.lineCap='round';x.beginPath();x.moveTo(48,110);x.lineTo(64,126);x.lineTo(94,94);x.stroke();x.restore()}
 x.restore();txt('open for anyone to check',W/2,CY+420,'italic 44px IMI',INK,'center',a)};

S.trust=(p,lt)=>{const a=eo(lt/0.5);x.save();x.globalAlpha*=a;x.translate(W/2-230,CY-40);x.rotate(lt*0.1);x.drawImage(IMG('logo'),-150,-150,300,300);x.restore();txt('plan',W/2-230,CY+180,'52px IXB',INK,'center',a);
 const k=eo((p-0.33)/0.15);for(let i=0;i<3;i++){const kk=back((p-0.35-i*0.08)/0.1);if(kk<=0)continue;const X=W/2+150+i*0,Y=CY-160+i*120;x.save();x.translate(X+80,Y);x.scale(kk,kk);rr(-80,-48,160,96,14);x.fillStyle=FILL;x.fill();x.strokeStyle=SAF;x.lineWidth=5;x.stroke();txt('#'+(201+i),0,2,'30px ISB',INK);if(i<2){x.strokeStyle=INK;x.lineWidth=6;x.beginPath();x.moveTo(0,48);x.lineTo(0,72);x.stroke()}x.restore()}
 txt('trust',W/2+230,CY+180,'52px IXB',SAF,'center',k)};

S.alone=(p,lt)=>{
 if(p<0.39){const a=eo(lt/0.5);x.save();x.globalAlpha*=a;x.translate(W/2+120,CY);const n=10,R1=230,R2=190;x.beginPath();for(let i=0;i<n*2;i++){const an=i*Math.PI/n,r=i%2?R2:R1;x.lineTo(Math.cos(an)*r,Math.sin(an)*r)}x.closePath();x.fillStyle=FILL;x.fill();x.strokeStyle=INK;x.lineWidth=6;x.stroke();circle(0,0,60,INK,6,PAPER);x.restore();
  x.save();x.globalAlpha*=a;x.translate(W/2-260,CY+40);x.rotate(0.35);circle(0,-130,36,null,0,INK);x.strokeStyle=INK;x.lineWidth=26;x.lineCap='round';x.beginPath();x.moveTo(0,-90);x.lineTo(0,40);x.moveTo(0,-60);x.lineTo(120,-60);x.moveTo(0,40);x.lineTo(-40,140);x.moveTo(0,40);x.lineTo(50,140);x.stroke();x.restore();return}
 const items=[['company',W/2-220],['department',W/2+220]];items.forEach(([n,X],i)=>{const k=back((p-0.42-i*0.2)/0.12);if(k<=0)return;x.save();x.translate(X,CY-40);x.scale(k,k);x.globalAlpha*=0.9;
  if(i==0){rr(-90,-150,180,260,10);x.fillStyle=FILL;x.fill();x.strokeStyle=INK;x.lineWidth=5;x.stroke();for(let r=0;r<4;r++)for(let c=0;c<3;c++){x.fillStyle=INK;x.fillRect(-60+c*45,-120+r*52,26,30)}}
  else{x.fillStyle=FILL;x.strokeStyle=INK;x.lineWidth=5;x.beginPath();x.moveTo(-120,-80);x.lineTo(0,-150);x.lineTo(120,-80);x.closePath();x.fill();x.stroke();for(let c=0;c<4;c++){x.fillRect(-95+c*60,-70,30,160);x.strokeRect(-95+c*60,-70,30,160)}x.fillRect(-130,100,260,20);x.strokeRect(-130,100,260,20)}
  txt(n,0,180,'38px ISB',INK,'center',0.85);txt('alone',0,230,'italic 34px IMI',RED,'center',0.8);x.restore()})};

S.hands=(p,lt)=>{const c=[W/2,CY-40],n=8,labels=['engineers','planners','citizens','city leaders'];
 for(let i=0;i<n;i++){const k=eo((lt-0.2-i*0.25)/0.6);if(k<=0)continue;const an=i*Math.PI*2/n+0.2,R0=560,R1=150+(1-k)*300;const X0=c[0]+Math.cos(an)*R0,Y0=c[1]+Math.sin(an)*R0,X1=c[0]+Math.cos(an)*R1,Y1=c[1]+Math.sin(an)*R1;
  x.strokeStyle=i%2?'#B9A88E':'#8C6A47';x.lineWidth=40;x.lineCap='round';x.beginPath();x.moveTo(X0,Y0);x.lineTo(X1,Y1);x.stroke();
  x.save();x.translate(X1,Y1);x.rotate(an+Math.PI);circle(0,0,34,null,0,i%2?'#B9A88E':'#8C6A47');x.lineWidth=13;for(let f=-1.5;f<=1.5;f++){x.beginPath();x.moveTo(20,f*14);x.lineTo(52,f*16);x.stroke()}x.restore()}
 const g=eo((p-0.5)/0.3);x.save();glow('rgba(241,150,17,.8)',60*g);circle(c[0],c[1],50+20*g,null,0,SAF);x.shadowBlur=0;x.restore();
 labels.forEach((l,i)=>{const k=eo((p-0.1-i*0.15)/0.12);txt(l,i%2?W-200:200,CY+430+Math.floor(i/2)*60-(i%2?0:0),'36px ISB',INK,'center',k)});
 txt('the same truth',W/2,CY-470,'italic 44px IMI',SAF,'center',eo((p-0.75)/0.15))};

S.rivers=(p,lt)=>{const k=eio(lt/2.2);
 x.save();x.globalAlpha*=0.35;x.strokeStyle=INK;x.lineWidth=5;x.lineJoin='round';x.beginPath();x.moveTo(60,CY-330);x.lineTo(260,CY-520);x.lineTo(400,CY-410);x.lineTo(560,CY-600);x.lineTo(760,CY-400);x.lineTo(880,CY-480);x.lineTo(1020,CY-330);x.stroke();x.restore();
 const starts=[160,380,620,880];starts.forEach((sx,i)=>{x.strokeStyle=i%2?'#7FA6B8':'#5C8BA0';x.lineWidth=16+i*2;x.lineCap='round';x.setLineDash([40,18]);x.lineDashOffset=-lt*60;x.beginPath();const pts=40;for(let j=0;j<=pts*k;j++){const t=j/pts;const X=sx+(W/2-sx)*t*t+Math.sin(t*8+i)*40*(1-t),Y=CY-340+t*560;j?x.lineTo(X,Y):x.moveTo(X,Y)}x.stroke();x.setLineDash([])});
 const o=eo((lt-1.6)/1.0);x.save();x.globalAlpha*=o;for(let r=0;r<4;r++){x.strokeStyle=r?'rgba(92,139,160,.5)':'#5C8BA0';x.lineWidth=10-r*2;x.beginPath();for(let X=40;X<=W-40;X+=8){const Y=CY+260+r*55+Math.sin(X/60+lt*2+r)*14;X==40?x.moveTo(X,Y):x.lineTo(X,Y)}x.stroke()}x.restore();
 txt('ocean',W/2,CY+500,'italic 48px IMI',SAF,'center',o)};

S.close=(p,lt)=>{const a=eo(lt/0.6);
 const sr=eio(lt/2.5);x.save();x.globalAlpha*=a;x.translate(W/2,CY+60-230*sr);x.rotate(lt*0.1);x.drawImage(IMG('logo'),-140,-140,280,280);x.restore();
 x.fillStyle=PAPER;x.strokeStyle=INK;x.lineWidth=6;x.beginPath();x.moveTo(60,CY+300);const sky=[[60,180],[140,180],[140,90],[230,90],[230,150],[300,150],[300,40],[380,40],[380,160],[470,160],[470,120],[600,120],[600,60],[660,0],[720,60],[720,140],[820,140],[820,70],[900,70],[900,190],[1020,190]];sky.forEach(([X,h])=>x.lineTo(X,CY+300-h));x.lineTo(1020,CY+300);x.closePath();x.fill();x.stroke();
 x.drawImage(IMG('lotus'),W/2-150,CY+320,300,162);
 txt('+1 week',W/2,CY-330,'110px IXB',SAF,'center',eo((p-0.5)/0.2))};
