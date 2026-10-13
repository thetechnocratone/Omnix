// Omnix Explains #1 — Tokenization (night theme)
function chrome(x0,y0,x1,y1){const g=x.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'#5a5048');g.addColorStop(0.45,'#2a241f');g.addColorStop(0.55,'#3b332c');g.addColorStop(1,'#1c1814');return g}
function glow(c,b){x.shadowColor=c;x.shadowBlur=b}
function noGlow(){x.shadowColor='transparent';x.shadowBlur=0}
// generic tower: centre cx, base y, width w, height h; returns cell geometry
function tower(cx,by,w,h,a,hl){const cols=5,rows=11,cw=w/cols,ch=h/rows;x.save();x.globalAlpha*=a;
 x.fillStyle=chrome(cx-w/2,by-h,cx+w/2,by);rr(cx-w/2,by-h*a,w,h*a,10);x.fill();x.strokeStyle=INK;x.lineWidth=4;x.stroke();
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const X=cx-w/2+c*cw+cw*0.18,Y=by-h+r*ch+ch*0.2;if(Y<by-h*a)continue;rr(X,Y,cw*0.64,ch*0.6,4);
  x.fillStyle=(hl&&hl.r===r&&hl.c===c)?'rgba(0,0,0,0.6)':'rgba(242,232,214,0.13)';x.fill()}
 x.restore();return {cw,ch,cols,rows,cell:(r,c)=>[cx-w/2+c*cw+cw*0.18,by-h+r*ch+ch*0.2,cw*0.64,ch*0.6]}}
function coin(X,Y,r,label,a=1){x.save();x.globalAlpha*=a;glow('rgba(241,150,17,.55)',30);circle(X,Y,r,null,0,SAF);noGlow();circle(X,Y,r*0.78,'#1a140e',3);if(label)txt(label,X,Y+2,`${Math.round(r*0.7)}px IXB`,'#1a140e');x.restore()}
function person(X,Y,s,label,col){x.save();x.translate(X,Y);x.scale(s,s);circle(0,-70,30,null,0,col||INK);x.beginPath();x.arc(0,30,60,Math.PI,0);x.closePath();x.fillStyle=col||INK;x.fill();x.restore();if(label)txt(label,X,Y+70*s,'34px ISB',INK,'center',0.8)}

S.slice=(p,lt)=>{const a=eo(lt/1.2);const t=tower(W/2-60,CY+330,330,640,a,{r:4,c:3});
 const k=eio((p-0.56)/0.2);if(k>0){const [X,Y,w,h]=t.cell(4,3);const dx=260*k,s=1+1.6*k;x.save();glow('rgba(241,150,17,.7)',40);x.translate(X+w/2+dx,Y+h/2);x.scale(s,s);rr(-w/2,-h/2,w,h,4);x.fillStyle=SAF;x.fill();noGlow();x.restore();
  x.strokeStyle='rgba(241,150,17,.5)';x.setLineDash([6,10]);x.lineWidth=3;x.beginPath();x.moveTo(X+w,Y+h/2);x.lineTo(X+w/2+dx-30*s,Y+h/2);x.stroke();x.setLineDash([]);
  txt('₹500',X+w/2+dx,Y+h/2+90,'64px IXB',SAF,'center',eo((p-0.75)/0.12))}
 txt('a tiny slice',W/2-60,CY+400,'italic 40px IMI',INK,'center',0.6*eo((lt-0.6)/0.6))};

S.old=(p,lt)=>{const a=eo(lt/0.6);
 if(p<0.3){const k=eo(lt/0.6);x.save();x.globalAlpha*=k;x.fillStyle=chrome(W/2-260,CY-260,W/2+260,CY+260);rr(W/2-230,CY-260,460,520,24);x.fill();x.strokeStyle=INK;x.lineWidth=5;x.stroke();
  txt('1 asset',W/2,CY-20,'64px IXB',INK);txt('one big piece',W/2,CY+50,'italic 40px IMI',INK,'center',0.6);x.restore();return}
 const q=(p-0.3)/0.7;
 person(130,CY+40,1,'You',INK);
 x.save();x.fillStyle=chrome(W-300,CY-120,W-60,CY+200);rr(W-290,CY-130,230,300,18);x.fill();x.strokeStyle=INK;x.lineWidth=4;x.stroke();txt('asset',W-175,CY+20,'40px IXB',INK);x.restore();
 const mids=['broker','bank','registrar'];x.strokeStyle='rgba(242,232,214,.35)';x.setLineDash([8,12]);x.lineWidth=4;x.beginPath();x.moveTo(210,CY+20);x.lineTo(W-300,CY+20);x.stroke();x.setLineDash([]);
 mids.forEach((m,i)=>{const k=back((q-0.25-i*0.08)/0.12);if(k<=0)return;const X=330+i*170;x.save();x.translate(X,CY+20);x.scale(k,k);circle(0,0,52,INK,4,'#2a231c');txt(m,0,90,'28px ISB',INK,'center',0.8);x.restore();txt('%',X,CY+22,'40px IXB',SAF,'center',cl(k))});
 // paperwork stack
 const pk=eo((q-0.2)/0.15);for(let i=0;i<6;i++){const k=eo((q-0.15-i*0.03)/0.08);if(k<=0)continue;x.save();x.translate(W/2-40+(i%2)*14,CY-260-i*22-40*(1-k));x.rotate((i%3-1)*0.05);x.globalAlpha*=k;rr(-120,-60,240,120,6);x.fillStyle='#E9DFCD';x.fill();x.fillStyle='rgba(30,25,20,.35)';for(let l=0;l<4;l++)x.fillRect(-90,-35+l*22,180-l*25,6);x.restore()}
 const ck=eo((q-0.65)/0.15);if(ck>0){x.save();x.globalAlpha*=ck;x.translate(W/2,CY+330);circle(0,0,80,INK,6);x.strokeStyle=SAF;x.lineWidth=8;x.lineCap='round';x.beginPath();x.moveTo(0,0);x.lineTo(0,-55);x.stroke();x.save();x.rotate(lt*3);x.beginPath();x.moveTo(0,0);x.lineTo(42,0);x.stroke();x.restore();txt('T + days',0,130,'40px IXB',INK);x.restore()}};

S.tokens=(p,lt)=>{const cols=6,rows=10,s=52,g=10,W0=cols*(s+g),H0=rows*(s+g),X0=W/2-W0/2,Y0=CY-H0/2-80;
 const d=eio(lt/1.4);// dissolve: from tower block to grid
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const i=r*cols+c;const tx=X0+c*(s+g),ty=Y0+r*(s+g);const bx=W/2-160+c*(320/cols),by=Y0+60+r*(H0-60)/rows;const k=eio((d*1.4)-(i/(rows*cols))*0.4);
  const X=bx+(tx-bx)*k+Math.sin(lt*1.5+i)*3*k,Y=by+(ty-by)*k;x.save();x.globalAlpha*=0.4+0.6*eo(lt/0.5);rr(X,Y,s*(0.85+0.15*k),s*(0.85+0.15*k),8);x.fillStyle=k>0.9?'#2b231b':'#3a3129';x.fill();x.strokeStyle=k>0.9?SAF:INK;x.lineWidth=2.5;x.stroke();x.restore()}
 // chain of blocks
 const ch=eo((p-0.38)/0.25);if(ch>0){const by=CY+420;for(let i=0;i<5;i++){const k=eo((p-0.38-i*0.06)/0.12);if(k<=0)continue;const X=150+i*195;x.save();x.globalAlpha*=k;x.fillStyle=chrome(X,by-60,X+130,by+60);rr(X,by-60,130,120,16);x.fill();x.strokeStyle=SAF;x.lineWidth=4;x.stroke();txt('#'+(1041+i),X+65,by+2,'30px ISB',INK,'center',0.8);
   if(i<4){x.strokeStyle=INK;x.lineWidth=6;x.beginPath();x.moveTo(X+130,by);x.lineTo(X+195,by);x.stroke();circle(X+162,by,10,INK,4,PAPER)}x.restore()}
  txt('blockchain ledger',W/2,by+110,'italic 36px IMI',INK,'center',0.6*ch)}};

S.assets=(p,lt)=>{
 if(p<0.44){const k=back(lt/0.6);coin(W/2,CY-60,150*k,'1');txt('1 token = 1 share',W/2,CY+170,'52px IXB',INK,'center',eo((lt-0.5)/0.5));
  txt('of the real thing',W/2,CY+235,'italic 40px IMI',INK,'center',0.7*eo((lt-0.7)/0.5));return}
 const pos=[[W/2-210,CY-220],[W/2+210,CY-220],[W/2-210,CY+220],[W/2+210,CY+220]],lab=['building','bond','gold','art'];
 pos.forEach(([X,Y],i)=>{const k=back((p-0.47-i*0.11)/0.1);if(k<=0)return;x.save();x.translate(X,Y);x.scale(k,k);rr(-170,-170,340,340,30);x.fillStyle='#211b16';x.fill();x.strokeStyle='rgba(242,232,214,.25)';x.lineWidth=3;x.stroke();
  x.strokeStyle=INK;x.lineWidth=6;x.lineJoin='round';
  if(i==0){x.fillStyle=chrome(-60,-110,60,70);x.fillRect(-55,-110,110,180);x.strokeRect(-55,-110,110,180);for(let r=0;r<5;r++)for(let c=0;c<3;c++){x.fillStyle='rgba(242,232,214,.2)';x.fillRect(-42+c*32,-96+r*32,20,20)}}
  if(i==1){rr(-75,-105,150,190,8);x.fillStyle='#E9DFCD';x.fill();x.fillStyle='rgba(30,25,20,.4)';for(let l=0;l<5;l++)x.fillRect(-50,-80+l*24,100-l*8,7);circle(35,55,22,null,0,SAF)}
  if(i==2){x.beginPath();x.moveTo(-90,50);x.lineTo(90,50);x.lineTo(55,-30);x.lineTo(-55,-30);x.closePath();const gg=x.createLinearGradient(-90,-30,90,50);gg.addColorStop(0,'#FCC25F');gg.addColorStop(.5,'#F19611');gg.addColorStop(1,'#9a5b07');x.fillStyle=gg;glow('rgba(241,150,17,.5)',30);x.fill();noGlow()}
  if(i==3){x.strokeRect(-95,-95,190,150);x.save();x.beginPath();x.rect(-95,-95,190,150);x.clip();circle(30,-35,26,null,0,SAF);x.fillStyle='#3a3129';x.beginPath();x.moveTo(-95,55);x.lineTo(-30,-20);x.lineTo(10,25);x.lineTo(50,-5);x.lineTo(95,55);x.closePath();x.fill();x.restore()}
  txt(lab[i],0,125,'34px ISB',INK,'center',0.8);coin(120,-120,34,'',1);x.restore()})};

S.benefits=(p,lt)=>{const rows=[CY-330,CY,CY+330],th=[0.0,0.52,0.72];
 rows.forEach((Y,i)=>{const k=eo((p-th[i]-0.02)/0.1);if(k<=0)return;x.save();x.globalAlpha*=k;x.translate(0,(1-k)*30);
  rr(90,Y-140,W-180,280,30);x.fillStyle='rgba(242,232,214,.05)';x.fill();x.strokeStyle='rgba(242,232,214,.18)';x.lineWidth=2;x.stroke();
  if(i==0){const n=8,cx=260;for(let s=0;s<n;s++){const a0=s/n*Math.PI*2-Math.PI/2,a1=(s+1)/n*Math.PI*2-Math.PI/2,o=s==1?22*eo((p-0.15)/0.15):0,am=(a0+a1)/2;x.beginPath();x.moveTo(cx+Math.cos(am)*o,Y+Math.sin(am)*o);x.arc(cx+Math.cos(am)*o,Y+Math.sin(am)*o,95,a0,a1);x.closePath();x.fillStyle=s==1?SAF:'#3a3129';x.fill();x.strokeStyle=PAPER;x.lineWidth=4;x.stroke()}
   txt('split into',560,Y-30,'40px IM',INK,'left',0.7);txt('small pieces',560,Y+30,'52px IXB',SAF,'left')}
  if(i==1){const cx=260;circle(cx,Y,95,INK,6);for(let h=0;h<12;h++){const an=h/12*Math.PI*2;x.fillStyle=INK;x.fillRect(cx+Math.cos(an)*78-3,Y+Math.sin(an)*78-3,6,6)}x.strokeStyle=SAF;x.lineWidth=8;x.lineCap='round';x.save();x.translate(cx,Y);x.rotate(lt*2.5);x.beginPath();x.moveTo(0,0);x.lineTo(0,-70);x.stroke();x.restore();
   txt('traded',560,Y-30,'40px IM',INK,'left',0.7);txt('24 / 7',560,Y+30,'52px IXB',SAF,'left')}
  if(i==2){const cx=260;const c2=eo((p-0.82)/0.1);circle(cx,Y,95,null,0,c2>0.5?SAF:'#3a3129');x.strokeStyle=c2>0.5?'#1a140e':INK;x.lineWidth=14;x.lineCap='round';x.beginPath();x.moveTo(cx-42,Y+2);x.lineTo(cx-10,Y+34);x.lineTo(cx+46,Y-30);x.stroke();
   txt('settled in',560,Y-30,'40px IM',INK,'left',0.7);txt('days',560,Y+30,'52px IXB',MUTE,'left',1-c2);x.save();x.globalAlpha*=1-c2;x.strokeStyle=RED;x.lineWidth=6;x.beginPath();x.moveTo(555,Y+30);x.lineTo(555+130*eo((p-0.78)/0.06),Y+30);x.stroke();x.restore();txt('minutes',560,Y+30,'52px IXB',SAF,'left',c2)}
  x.restore()})};

S.now=(p,lt)=>{const k=eo((p-0.32)/0.4);const n=Math.round(10*k);
 for(let i=0;i<14;i++){const kk=eo((p-0.3-i*0.025)/0.08);if(kk<=0)continue;const Y=CY+300-i*30;x.save();x.globalAlpha*=kk;x.beginPath();x.ellipse(W/2,Y-(1-kk)*60,150,34,0,0,7);x.fillStyle=i%2?'#c9780c':SAF;glow('rgba(241,150,17,.35)',20);x.fill();noGlow();x.strokeStyle='#1a140e';x.lineWidth=3;x.stroke();x.restore()}
 if(p<0.32){txt('already',W/2,CY-40,'110px IXB',INK,'center',eo(lt/0.5));txt('happening',W/2,CY+80,'110px IXB',SAF,'center',eo((lt-0.3)/0.5));return}
 txt('$'+n+'B+',W/2,CY-380,'170px IXB',SAF);txt('of US Treasury bonds',W/2,CY-250,'44px ISB',INK,'center',eo((p-0.6)/0.12));txt('now tokenized',W/2,CY-190,'italic 40px IMI',INK,'center',0.7*eo((p-0.68)/0.12))};

S.caveat=(p,lt)=>{const a=eo(lt/0.6);x.save();x.globalAlpha*=a;
 const tx=250,ty=CY-120,vx=W-290,vy=CY-120;coin(tx,ty,90,'T');txt('token',tx,ty+140,'36px ISB',INK,'center',0.8);
 // tether
 const pulse=0.5+0.5*Math.sin(lt*4);x.strokeStyle=`rgba(241,150,17,${0.4+0.5*pulse})`;x.lineWidth=6;x.setLineDash([16,12]);x.lineDashOffset=-lt*40;x.beginPath();x.moveTo(tx+95,ty);x.bezierCurveTo(tx+250,ty-120,vx-250,vy-120,vx-120,vy);x.stroke();x.setLineDash([]);
 x.fillStyle=chrome(vx-120,vy-140,vx+120,vy+140);rr(vx-120,vy-140,240,280,24);x.fill();x.strokeStyle=INK;x.lineWidth=5;x.stroke();circle(vx,vy,60,INK,6);x.save();x.translate(vx,vy);x.rotate(lt*0.8);for(let i=0;i<3;i++){x.rotate(Math.PI*2/3);x.beginPath();x.moveTo(0,0);x.lineTo(0,-50);x.stroke()}x.restore();
 txt('the real asset',vx,vy+190,'36px ISB',INK,'center',0.8);txt('the promise',W/2,CY-330,'italic 44px IMI',SAF,'center',eo((p-0.05)/0.2));
 // scales of law
 const sk=eo((p-0.6)/0.15);if(sk>0){x.save();x.globalAlpha*=sk;x.translate(W/2,CY+300);x.strokeStyle=INK;x.lineWidth=7;x.lineCap='round';const tilt=Math.sin(lt*1.5)*0.06;x.beginPath();x.moveTo(0,-110);x.lineTo(0,110);x.moveTo(-90,110);x.lineTo(90,110);x.stroke();x.save();x.translate(0,-100);x.rotate(tilt);x.beginPath();x.moveTo(-170,0);x.lineTo(170,0);x.stroke();
  for(const sx of [-170,170]){x.beginPath();x.moveTo(sx,0);x.lineTo(sx-50,90);x.moveTo(sx,0);x.lineTo(sx+50,90);x.stroke();x.beginPath();x.arc(sx,90,55,0,Math.PI);x.fillStyle=SAF;x.fill()}x.restore();txt('the law',0,180,'36px ISB',INK,'center',0.8);x.restore()}
 x.restore()};

S.lesson=(p,lt)=>{
 if(p<0.45){const a=eo(lt/0.5);x.save();x.globalAlpha*=a;x.translate(W/2,CY-40);x.rotate(-0.12);rr(-230,-110,460,220,26);x.fillStyle='#2a231c';x.fill();x.strokeStyle=INK;x.lineWidth=5;x.stroke();circle(-170,0,22,INK,5);txt('value',30,-20,'64px IXB',INK);txt('unchanged',30,50,'italic 40px IMI',SAF);x.restore();return}
 const items=[['divide',0.7],['move',0.79],['verify',0.87]];
 items.forEach(([w,t0],i)=>{const k=back((p-t0)/0.08);if(k<=0)return;const Y=CY-330+i*330;x.save();x.translate(250,Y);x.scale(k,k);circle(0,0,100,null,0,'#2a231c');x.strokeStyle=SAF;x.lineWidth=10;x.lineCap='round';x.lineJoin='round';
  if(i==0){x.strokeRect(-50,-50,100,100);x.beginPath();x.moveTo(0,-50);x.lineTo(0,50);x.moveTo(-50,0);x.lineTo(50,0);x.stroke()}
  if(i==1){x.beginPath();x.moveTo(-55,0);x.lineTo(50,0);x.moveTo(20,-30);x.lineTo(55,0);x.lineTo(20,30);x.stroke()}
  if(i==2){x.beginPath();x.moveTo(-40,2);x.lineTo(-10,32);x.lineTo(45,-30);x.stroke()}
  x.restore();txt(w.toUpperCase(),420,Y,'90px IXB',i==2?SAF:INK,'left',cl(k))})};

S.callback=(p,lt)=>{const a=eo(lt/0.8);
 // sun rising behind
 const sr=eio(lt/4);x.save();x.globalAlpha*=0.85*a;x.translate(W/2+170,CY-120-120*sr);x.rotate(lt*0.08);x.drawImage(IMG('logo'),-150,-150,300,300);x.restore();
 const t=tower(W/2-150,CY+360,300,600,a,{r:4,c:3});
 // phone
 const k=back((lt-0.4)/0.6);x.save();x.translate(W/2+200,CY+170);x.scale(k,k);rr(-130,-250,260,500,40);x.fillStyle='#0d0a08';x.fill();x.strokeStyle=INK;x.lineWidth=6;x.stroke();
 rr(-105,-215,210,430,20);x.fillStyle='#211b16';x.fill();txt('slice #4·3',0,-150,'26px ISB',INK,'center',0.7);
 const tap=cl((p-0.55)/0.25);rr(-60,-90,120,90,10);x.fillStyle=tap>0?SAF:'#3a3129';glow('rgba(241,150,17,.6)',tap>0?40:0);x.fill();noGlow();txt('₹500',0,60,'52px IXB',SAF);
 if(tap>0&&tap<1){for(let r=0;r<3;r++){const rr2=(tap*3+r*0.3)%1;circle(0,-45,30+rr2*120,`rgba(241,150,17,${(1-rr2)*0.8})`,5)}}
 txt(tap>=1?'owned':'tap to own',0,150,'30px ISB',tap>=1?SAF:INK,'center',0.8);x.restore();
 x.save();x.globalAlpha*=0.8*a;x.drawImage(IMG('lotus'),W/2-160,CY+420,320,172);x.restore()};
