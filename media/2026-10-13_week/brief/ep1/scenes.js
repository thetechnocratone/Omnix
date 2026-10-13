S.vault=(p,lt,d,t)=>{const a=eo(lt/0.7);x.save();x.translate(W/2,CY);x.scale(0.85+0.15*a,0.85+0.15*a);x.globalAlpha*=a;
 x.shadowColor='rgba(60,40,20,0.25)';x.shadowBlur=40;x.shadowOffsetY=20;circle(0,0,330,null,0,'#EADCC4');x.shadowColor='transparent';
 circle(0,0,330,INK,10);circle(0,0,280,INK,4);circle(0,0,240,MUTE,2);
 const close=eio((p-0.66)/0.18);// bolts slide in
 for(let i=0;i<12;i++){const an=i*Math.PI/6;const r=300-20*close;x.save();x.rotate(an);rr(r-14,-10,46,20,6);x.fillStyle=close>0.98?SAF:INK;x.fill();x.restore()}
 const rot=lt*0.6+close*2.2;x.save();x.rotate(rot);x.lineCap='round';x.strokeStyle=INK;x.lineWidth=16;for(let i=0;i<3;i++){x.rotate(Math.PI*2/3);x.beginPath();x.moveTo(0,0);x.lineTo(0,-190);x.stroke();circle(0,-190,22,null,0,INK)}x.restore();
 circle(0,0,64,INK,0,INK);circle(0,0,34,null,0,SAF);
 x.restore();
 const s=back((p-0.84)/0.1);if(s>0){x.save();x.translate(W/2,CY+430);x.rotate(-0.06);x.scale(1.4-0.4*s,1.4-0.4*s);x.globalAlpha=cl(s*1.5);x.strokeStyle=SAF;x.lineWidth=7;rr(-270,-62,540,124,14);x.stroke();txt('BUNKER MODE',0,4,'78px IXB',SAF);x.restore()}
};
S.qa=(p,lt,d)=>{const sp=0.68;// atom phase then chip
 const a1=eo(lt/0.5)*(1-eio((p-sp)/0.12));if(a1>0.01){x.save();x.globalAlpha*=a1;x.translate(W/2,CY);x.lineWidth=7;x.strokeStyle=MUTE;for(let i=0;i<3;i++){x.save();x.rotate(i*Math.PI/3+lt*0.4);x.beginPath();x.ellipse(0,0,300,105,0,0,7);x.stroke();const e=lt*2+i*2;circle(300*Math.cos(e),105*Math.sin(e),18,null,0,INK);x.restore()}circle(0,0,46,null,0,INK);
  txt('quantum computer',0,380,'italic 44px IMI',INK,'center',0.7);
  const sk=eio((p-0.45)/0.15);if(sk>0){x.strokeStyle=RED;x.lineWidth=16;x.lineCap='round';x.beginPath();x.moveTo(-330,-260);x.lineTo(-330+660*sk,-260+520*sk);x.stroke()}x.restore()}
 const a2=eo((p-sp-0.05)/0.15);if(a2>0){x.save();x.translate(W/2,CY);x.scale(0.6+0.4*back((p-sp-0.05)/0.2),0.6+0.4*back((p-sp-0.05)/0.2));x.globalAlpha*=cl(a2);
  const pulse=0.5+0.5*Math.sin(lt*5);x.shadowColor='rgba(241,150,17,'+(0.35+0.3*pulse)+')';x.shadowBlur=80;rr(-200,-200,400,400,40);x.fillStyle=INK;x.fill();x.shadowColor='transparent';
  x.strokeStyle=SAF;x.lineWidth=8;for(let i=-3;i<=3;i++){for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){x.beginPath();const o=i*50;if(dx){x.moveTo(dx*200,o);x.lineTo(dx*270,o)}else{x.moveTo(o,dy*200);x.lineTo(o,dy*270)}x.stroke()}}
  rr(-130,-130,260,260,24);x.strokeStyle=SAF;x.lineWidth=5;x.stroke();txt('A.I.',0,8,'130px IXB',SAF);x.restore()}
};
S.lock=(p,lt)=>{const a=eo(lt/0.6);x.save();x.translate(W/2,CY);x.globalAlpha*=a;
 // elliptic curve y^2=x^3+7 faint
 x.save();x.strokeStyle='rgba(241,150,17,0.55)';x.lineWidth=5;x.beginPath();let first=true;const k=eio(lt/1.6);for(let i=0;i<=200*k;i++){const yy=-3.2+i*6.4/200;const xx=Math.cbrt(yy*yy-7)+0;const X=xx*120+60,Y=-yy*130;if(first){x.moveTo(X,Y);first=false}else x.lineTo(X,Y)}x.stroke();x.restore();
 // lock
 x.lineWidth=34;x.strokeStyle=INK;x.lineCap='butt';x.beginPath();x.arc(0,-60,110,Math.PI,0);x.lineTo(110,40);x.moveTo(-110,-60);x.lineTo(-110,40);x.stroke();
 x.shadowColor='rgba(60,40,20,0.3)';x.shadowBlur=30;x.shadowOffsetY=14;rr(-190,20,380,300,36);x.fillStyle=INK;x.fill();x.shadowColor='transparent';
 circle(0,130,34,null,0,SAF);x.fillStyle=SAF;x.fillRect(-12,140,24,90);
 const gl=['x³ + 7','∑','mod p','G · k','π','∞','∫','≡'];gl.forEach((g,i)=>{const an=i/gl.length*Math.PI*2+lt*0.35;const r=400;txt(g,Math.cos(an)*r,Math.sin(an)*r*0.8+60,(i%2?'56px IB':'italic 48px IMI'),i%3?INK:SAF,'center',0.75*eo((lt-0.2-i*0.08)/0.4))});
 x.restore()};
S.maze=(p,lt)=>{const {N,E,path}=MZ;const sz=640,c=sz/N;const a=eo(lt/0.5);x.save();x.translate(W/2-sz/2,CY-sz/2-40);x.globalAlpha*=a;
 x.strokeStyle=INK;x.lineWidth=9;x.lineCap='round';x.strokeRect(0,0,sz,sz);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const id=j*N+i;if(i<N-1&&!E.has(id+'-'+(id+1))){x.beginPath();x.moveTo((i+1)*c,j*c);x.lineTo((i+1)*c,(j+1)*c);x.stroke()}if(j<N-1&&!E.has(id+'-'+(id+N))){x.beginPath();x.moveTo(i*c,(j+1)*c);x.lineTo((i+1)*c,(j+1)*c);x.stroke()}}
 // slow walker along path
 const wk=cl(lt/6)*0.5;const n=Math.floor(wk*(path.length-1));x.strokeStyle=MUTE;x.lineWidth=12;x.beginPath();for(let q=0;q<=n;q++){const id=path[q];const X=(id%N+0.5)*c,Y=((id/N|0)+0.5)*c;q?x.lineTo(X,Y):x.moveTo(X,Y)}x.stroke();
 // shortcut
 const sc=eio((p-0.3)/0.15);if(sc>0){x.strokeStyle=SAF;x.lineWidth=18;x.shadowColor='rgba(241,150,17,.6)';x.shadowBlur=30;x.beginPath();x.moveTo(c/2,c/2);x.lineTo(c/2+(sz-c)*sc,c/2+(sz-c)*sc);x.stroke();x.shadowColor='transparent';circle(c/2+(sz-c)*sc,c/2+(sz-c)*sc,22,null,0,SAF)}
 x.restore();
 // years -> months
 const ym=eo((p-0.7)/0.08);if(ym>0){x.save();x.translate(W/2,CY+400);x.globalAlpha*=ym;txt('YEARS',-170,0,'64px IXB',MUTE);x.strokeStyle=RED;x.lineWidth=10;x.beginPath();x.moveTo(-290,0);x.lineTo(-290+240*eio((p-0.86)/0.08),0);x.stroke();txt('→',0,0,'64px IB',INK);txt('MONTHS',190,0,'64px IXB',SAF,'center',eo((p-0.76)/0.08));x.restore()}
};
S.lattice=(p,lt)=>{const a=eo(lt/0.6);x.save();x.translate(W/2,CY);x.globalAlpha*=a;
 // shield path
 const sh=()=>{x.beginPath();x.moveTo(0,-330);x.bezierCurveTo(170,-250,270,-260,290,-250);x.bezierCurveTo(300,40,200,240,0,350);x.bezierCurveTo(-200,240,-300,40,-290,-250);x.bezierCurveTo(-270,-260,-170,-250,0,-330);x.closePath()};
 sh();x.fillStyle='#EADCC4';x.fill();x.save();sh();x.clip();
 x.strokeStyle='rgba(43,33,24,.45)';x.lineWidth=3;const sp=58;for(let i=-8;i<=8;i++)for(let j=-8;j<=8;j++){const X=i*sp+j*sp*0.45,Y=j*sp*0.85;if(Math.abs(X)>340||Math.abs(Y)>380)continue;circle(X,Y,7,null,0,INK);x.beginPath();x.moveTo(X,Y);x.lineTo(X+sp,Y);x.moveTo(X,Y);x.lineTo(X+sp*0.45,Y+sp*0.85);x.stroke()}
 // cracks
 const ck=eio((p-0.6)/0.3);if(ck>0){const r=rng(9);x.strokeStyle=RED;x.lineWidth=9;x.lineCap='round';for(let b=0;b<4;b++){let X=-40+b*30,Y=-330;x.beginPath();x.moveTo(X,Y);const steps=Math.floor(14*ck);for(let s2=0;s2<steps;s2++){X+=(r()-0.5)*90+(b-1.5)*14;Y+=48;x.lineTo(X,Y)}x.stroke()}}
 x.restore();sh();x.strokeStyle=INK;x.lineWidth=12;x.stroke();
 txt('quantum-resistant',0,440,'italic 44px IMI',INK,'center',0.7);x.restore()};
S.zero=(p,lt)=>{const a=back(lt/0.5);x.save();x.translate(W/2,CY-40);x.scale(a,a);circle(0,0,280,SAF,10);x.setLineDash([2,26]);x.lineCap='round';circle(0,0,330,'rgba(43,33,24,.4)',8);x.setLineDash([]);txt('0',0,20,'380px IXB',INK);x.restore();
 txt('practical attacks shown',W/2,CY+380,'italic 50px IMI',INK,'center',eo((lt-0.3)/0.5));txt('so far',W/2,CY+445,'italic 50px IMI',INK,'center',eo((lt-0.4)/0.5))};
S.advice=(p,lt,d)=>{const sp=0.37;
 const a1=eo(lt/0.5)*(1-eio((p-sp)/0.08));if(a1>0.01){x.save();x.translate(W/2,CY);x.globalAlpha*=a1;
  // box
  const k=eio((lt-0.8)/2.4);rr(-260,40,520,300,30);x.fillStyle=INK;x.fill();
  // key moving down into box
  const ky=-300+300*k;x.save();x.beginPath();x.rect(-400,-600,800,640+0);x.clip();x.translate(0,ky);x.rotate(Math.PI/2);x.lineWidth=26;x.strokeStyle=SAF;circle(-150,0,70,SAF,26);x.beginPath();x.moveTo(-80,0);x.lineTo(170,0);x.moveTo(110,0);x.lineTo(110,50);x.moveTo(160,0);x.lineTo(160,40);x.stroke();x.restore();
  rr(-290,10,580,50,16);x.fillStyle='#3B2E22';x.fill();txt('public key',0,190,'48px ISB',PAPER,'center',0.9);txt('off-chain',0,250,'italic 40px IMI',MAR,'center',0.9);x.restore()}
 const a2=eo((p-sp-0.04)/0.1);if(a2>0){x.save();x.translate(W/2,CY-60);x.globalAlpha*=a2;
  // hourglass
  const fl=cl((p-sp)/(1-sp));x.lineWidth=12;x.strokeStyle=INK;x.lineCap='round';x.beginPath();x.moveTo(-170,-260);x.lineTo(170,-260);x.moveTo(-170,260);x.lineTo(170,260);x.stroke();
  x.beginPath();x.moveTo(-140,-250);x.bezierCurveTo(-140,-60,-20,-40,-20,0);x.bezierCurveTo(-20,40,-140,60,-140,250);x.moveTo(140,-250);x.bezierCurveTo(140,-60,20,-40,20,0);x.bezierCurveTo(20,40,140,60,140,250);x.stroke();
  x.fillStyle=SAF;const top=1-fl*0.7;x.beginPath();x.moveTo(-110*top,-200+190*(1-top));x.lineTo(110*top,-200+190*(1-top));x.lineTo(0,-10);x.closePath();x.fill();
  x.beginPath();x.moveTo(-125,245);x.lineTo(125,245);x.lineTo(0,245-160*fl*0.75);x.closePath();x.fill();x.fillRect(-3,-10,6,250);x.restore();
  const q=eo((p-0.5)/0.08);txt('“I personally have lost more money in botched',W/2,CY+330,'italic 38px IMI',INK,'center',q);txt('migrations than I have lost in all hacks combined.”',W/2,CY+380,'italic 38px IMI',INK,'center',q);txt('— Vitalik Buterin',W/2,CY+440,'34px ISB',SAF,'center',q)}
};
S.lesson=(p,lt)=>{const a=eo(lt/0.8);x.save();x.globalAlpha*=a;
 // sun rising
 const sr=eio(lt/3);x.save();x.translate(W/2,CY+120-260*sr);x.rotate(lt*0.08);x.globalAlpha*=0.9;x.drawImage(IMG('logo'),-170,-170,340,340);x.restore();
 // mountains
 x.fillStyle=PAPER;x.strokeStyle=INK;x.lineWidth=7;x.lineJoin='round';x.beginPath();x.moveTo(60,CY+420);x.lineTo(260,CY+170);x.lineTo(360,CY+270);x.lineTo(540,CY+60);x.lineTo(720,CY+260);x.lineTo(820,CY+180);x.lineTo(1020,CY+420);x.closePath();x.fill();x.stroke();
 x.strokeStyle='rgba(43,33,24,.35)';x.lineWidth=4;x.beginPath();x.moveTo(540,CY+60);x.lineTo(500,CY+200);x.lineTo(560,CY+300);x.stroke();
 // network nodes forming around
 const r=rng(3);const pts=[];for(let i=0;i<14;i++){const an=r()*Math.PI*2,rd=300+r()*170;pts.push([W/2+Math.cos(an)*rd,CY-60+Math.sin(an)*rd*0.6])}
 const nk=eo((lt-0.6)/2.5);x.strokeStyle='rgba(241,150,17,.6)';x.lineWidth=3;pts.forEach((a1,i)=>{const b=pts[(i+3)%pts.length];if(i/pts.length<nk){x.beginPath();x.moveTo(a1[0],a1[1]);x.lineTo(a1[0]+(b[0]-a1[0])*cl(nk*1.5),a1[1]+(b[1]-a1[1])*cl(nk*1.5));x.stroke()}});
 pts.forEach((pt,i)=>{if(i/pts.length<nk)circle(pt[0],pt[1],11,INK,4,PAPER)});
 // lotus foreground
 x.globalAlpha*=0.9;x.drawImage(IMG('lotus'),W/2-210,CY+300,420,226);
 x.restore()};
