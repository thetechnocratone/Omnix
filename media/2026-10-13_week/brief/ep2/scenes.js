// The Brief ep2: Korea clears 20 humanoids for factory-floor trials
// ---------- helpers ----------
const LIMB=(a,b,c,d,w,col)=>{x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()};
// simple person (rounded, warm)
function person(X,Y,s,a=1,ph=0){x.save();x.globalAlpha*=a;x.translate(X,Y);const sw=Math.sin(ph)*0.35;
 LIMB(-s*0.12,s*0.35,-s*0.12-s*0.25*sw,s*0.85,s*0.13,INK);LIMB(s*0.12,s*0.35,s*0.12+s*0.25*sw,s*0.85,s*0.13,INK);
 rr(-s*0.27,-s*0.25,s*0.54,s*0.68,s*0.22);x.fillStyle=SAF;x.fill();x.strokeStyle=INK;x.lineWidth=s*0.05;x.stroke();
 circle(0,-s*0.48,s*0.19,INK,s*0.05,'#EADCC4');x.restore()}
// humanoid robot: boxy head with saffron visor, segmented limbs
function bot(X,Y,s,a=1,ph=0,lit=true){x.save();x.globalAlpha*=a;x.translate(X,Y);const sw=Math.sin(ph)*0.35;
 LIMB(-s*0.12,s*0.35,-s*0.12-s*0.25*sw,s*0.85,s*0.12,INK);LIMB(s*0.12,s*0.35,s*0.12+s*0.25*sw,s*0.85,s*0.12,INK);
 LIMB(-s*0.3,-s*0.12,-s*0.38+s*0.2*sw,s*0.32,s*0.09,INK);LIMB(s*0.3,-s*0.12,s*0.38-s*0.2*sw,s*0.32,s*0.09,INK);
 rr(-s*0.3,-s*0.24,s*0.6,s*0.64,s*0.1);x.fillStyle='#EADCC4';x.fill();x.strokeStyle=INK;x.lineWidth=s*0.05;x.stroke();
 circle(0,s*0.06,s*0.07,null,0,lit?SAF:MUTE);
 rr(-s*0.2,-s*0.66,s*0.4,s*0.34,s*0.08);x.fillStyle=INK;x.fill();rr(-s*0.14,-s*0.55,s*0.28,s*0.09,s*0.04);x.fillStyle=lit?SAF:MUTE;x.fill();x.restore()}
// fixed industrial arm on a base
function arm(X,Y,s,t){x.save();x.translate(X,Y);rr(-s*0.35,-s*0.12,s*0.7,s*0.24,s*0.06);x.fillStyle=INK;x.fill();
 const a1=-1.9+0.35*Math.sin(t*1.3),a2=1.1+0.4*Math.sin(t*1.3+1);const L1=s*0.75,L2=s*0.6;
 const ex=Math.cos(a1)*L1,ey=-s*0.12+Math.sin(a1)*L1;const hx=ex+Math.cos(a1+a2)*L2,hy=ey+Math.sin(a1+a2)*L2;
 LIMB(0,-s*0.12,ex,ey,s*0.16,INK);LIMB(ex,ey,hx,hy,s*0.12,INK);circle(0,-s*0.12,s*0.12,null,0,SAF);circle(ex,ey,s*0.09,null,0,SAF);
 x.save();x.translate(hx,hy);x.rotate(a1+a2);LIMB(0,-s*0.1,s*0.14,-s*0.12,s*0.06,INK);LIMB(0,s*0.1,s*0.14,s*0.12,s*0.06,INK);x.restore();x.restore()}
// a chain-link fence panel standing on the floor, seen side-on as a divider. k = how much is built
function fence(X,y0,y1,k){if(k<=0)return;const h=(y1-y0)*eo(k),top=y1-h,w=70;x.save();
 x.beginPath();x.rect(X-w/2,top,w,h);x.clip();x.strokeStyle='rgba(43,33,24,.55)';x.lineWidth=3;
 for(let d=-800;d<800;d+=34){x.beginPath();x.moveTo(X-w/2,y1+d);x.lineTo(X+w/2,y1+d-w);x.stroke();x.beginPath();x.moveTo(X-w/2,y1+d-w);x.lineTo(X+w/2,y1+d);x.stroke()}x.restore();
 x.fillStyle=INK;rr(X-w/2-12,top-10,16,h+10,6);x.fill();rr(X+w/2-4,top-10,16,h+10,6);x.fill();x.fillRect(X-w/2-12,top-10,w+24,12)}
// lotus sprout
function sprout(X,Y,s,k){if(k<=0)return;x.save();x.translate(X,Y);x.strokeStyle='#6E8B3D';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(-6,-s*0.5*k,0,-s*k);x.stroke();
 if(k>0.5){const l=eo((k-0.5)*2);x.fillStyle='#8FAE52';x.beginPath();x.ellipse(-s*0.22*l,-s*0.55,s*0.22*l,s*0.08*l,-0.5,0,7);x.fill();x.beginPath();x.ellipse(s*0.22*l,-s*0.7,s*0.2*l,s*0.07*l,0.5,0,7);x.fill()}x.restore()}

// ---------- 1. the fence ----------
S.fence=(p,lt)=>{const a=eo(lt/0.6);x.save();x.globalAlpha*=a;
 // floor line
 x.strokeStyle=RULE;x.lineWidth=4;x.beginPath();x.moveTo(90,CY+300);x.lineTo(W-90,CY+300);x.stroke();
 fence(W/2,CY-330,CY+300,eio((lt-0.3)/2.6));
 // people (left) and machines (right)
 const ph=lt*2.2;person(250,CY+80,190,eo((lt-0.4)/0.6),0);person(330,CY+200,130,eo((lt-0.6)/0.6),0);
 arm(800,CY+220,260,lt);arm(760,CY-120,170,lt+1.7);
 // labels timed to "People on one side. Machines on the other."
 txt('PEOPLE',270,CY+430,'52px IXB',INK,'center',eo((lt-4.4)/0.4));
 txt('MACHINES',810,CY+430,'52px IXB',SAF,'center',eo((lt-5.6)/0.4));
 x.restore()};

// ---------- 2. twenty humanoids ----------
S.twenty=(p,lt)=>{const cols=5,rows=4,gx=170,gy=200,ox=W/2-(cols-1)*gx/2,oy=CY-420;
 const n=Math.round(20*eio((lt-0.3)/3.2));
 for(let i=0;i<20;i++){const c=i%cols,r=(i/cols)|0;const k=cl((20*eio((lt-0.3)/3.2))-i);if(k<=0)continue;const s=back(k)*80;bot(ox+c*gx,oy+r*gy,s/80*80,1,lt*3+i,true)}
 // hero number
 const h=eo((lt-0.3)/0.5);x.save();x.globalAlpha*=h;txt(String(n),W/2-60,CY+400,'250px IXB',INK,'right');txt('humanoids',W/2-20,CY+400,'italic 70px IMI',SAF,'left');
 txt('cleared to work beside people',W/2,CY+540,'italic 40px IMI',INK,'center',0.75*eo((lt-3.6)/0.5));x.restore()};

// ---------- 3. four jobs ----------
const JOB=[
 {t:'chip packaging',d:(s)=>{rr(-s*0.3,-s*0.3,s*0.6,s*0.6,s*0.06);x.fillStyle=INK;x.fill();rr(-s*0.16,-s*0.16,s*0.32,s*0.32,s*0.04);x.fillStyle=SAF;x.fill();for(let i=-2;i<=2;i++){LIMB(i*s*0.11,-s*0.3,i*s*0.11,-s*0.42,s*0.04,INK);LIMB(i*s*0.11,s*0.3,i*s*0.11,s*0.42,s*0.04,INK);LIMB(-s*0.3,i*s*0.11,-s*0.42,i*s*0.11,s*0.04,INK);LIMB(s*0.3,i*s*0.11,s*0.42,i*s*0.11,s*0.04,INK)}}},
 {t:'car body parts',d:(s)=>{x.beginPath();x.moveTo(-s*0.5,s*0.12);x.lineTo(-s*0.46,-s*0.06);x.lineTo(-s*0.22,-s*0.1);x.lineTo(-s*0.08,-s*0.3);x.lineTo(s*0.26,-s*0.3);x.lineTo(s*0.4,-s*0.08);x.lineTo(s*0.5,-s*0.04);x.lineTo(s*0.5,s*0.12);x.closePath();x.fillStyle='#EADCC4';x.fill();x.strokeStyle=INK;x.lineWidth=s*0.05;x.stroke();circle(-s*0.27,s*0.14,s*0.1,INK,s*0.04,SAF);circle(s*0.28,s*0.14,s*0.1,INK,s*0.04,SAF)}},
 {t:'shipyard brackets',d:(s)=>{x.beginPath();x.moveTo(-s*0.5,-s*0.05);x.lineTo(s*0.5,-s*0.05);x.lineTo(s*0.34,s*0.25);x.lineTo(-s*0.38,s*0.25);x.closePath();x.fillStyle=INK;x.fill();for(let i=0;i<3;i++){rr(-s*0.3+i*s*0.2,-s*0.32+i*0,s*0.14,s*0.27,s*0.02);x.fillStyle=i==1?SAF:'#EADCC4';x.fill();x.strokeStyle=INK;x.lineWidth=s*0.03;x.stroke()}
  x.strokeStyle='rgba(43,33,24,.4)';x.lineWidth=s*0.03;for(let i=0;i<3;i++){x.beginPath();x.arc(-s*0.1+i*s*0.25,s*0.38,s*0.08,Math.PI,0);x.stroke()}}},
 {t:'cold-chain boxes',d:(s)=>{rr(-s*0.36,-s*0.28,s*0.72,s*0.56,s*0.05);x.fillStyle='#EADCC4';x.fill();x.strokeStyle=INK;x.lineWidth=s*0.05;x.stroke();LIMB(-s*0.36,-s*0.1,s*0.36,-s*0.1,s*0.03,INK);
  x.save();x.translate(0,s*0.09);x.strokeStyle=SAF;for(let i=0;i<3;i++){x.rotate(Math.PI/3);LIMB(0,-s*0.14,0,s*0.14,s*0.04,SAF)}x.restore()}}];
S.jobs=(p,lt)=>{const T=[0.15,2.69,4.93,7.57];const pos=[[W/2-235,CY-300],[W/2+235,CY-300],[W/2-235,CY+190],[W/2+235,CY+190]];
 JOB.forEach((j,i)=>{const k=back((lt-T[i]+0.1)/0.45);if(k<=0)return;const on=lt>=T[i]-0.1&&(i==3||lt<T[i+1]-0.1);
  x.save();x.translate(pos[i][0],pos[i][1]);x.scale(0.6+0.4*k,0.6+0.4*k);x.globalAlpha*=cl(k)*(on?1:0.55);
  x.shadowColor='rgba(60,40,20,0.2)';x.shadowBlur=on?40:15;x.shadowOffsetY=12;rr(-200,-200,400,400,36);x.fillStyle=PAPER;x.fill();x.shadowColor='transparent';
  rr(-200,-200,400,400,36);x.strokeStyle=on?SAF:INK;x.lineWidth=on?9:5;x.stroke();
  x.save();x.translate(0,-30);j.d(230);x.restore();txt(j.t,0,140,'38px ISB',INK,'center');
  if(on){bot(150,-140,46,1,lt*4,true)}x.restore()});
 txt('4 sites  ·  chips · cars · ships · logistics',W/2,CY+470,'italic 34px IMI',INK,'center',0.6*eo((lt-8.2)/0.6))};

// ---------- 4. old rules vs walking robots ----------
S.rules=(p,lt)=>{const a=eo(lt/0.5);x.save();x.globalAlpha*=a;const bx=W/2,by=CY-110;
 // rule page
 x.shadowColor='rgba(60,40,20,0.2)';x.shadowBlur=30;x.shadowOffsetY=14;rr(bx-330,by-340,660,600,24);x.fillStyle=PAPER;x.fill();x.shadowColor='transparent';rr(bx-330,by-340,660,600,24);x.strokeStyle=INK;x.lineWidth=6;x.stroke();
 txt('SAFETY RULE',bx,by-280,'40px IXB',INK,'center');
 // fenced square with fixed arm
 x.setLineDash([16,12]);x.strokeStyle=INK;x.lineWidth=6;x.strokeRect(bx-200,by-200,400,320);x.setLineDash([]);
 arm(bx,by+80,200,lt*0.6);
 txt('robot stays in one place',bx,by+200,'italic 38px IMI',INK,'center',eo((lt-1.2)/0.5));
 // humanoid walks out across the bottom
 const w=eio((lt-4.4)/1.9);if(lt>4.3){const X=bx-260+560*w;
  x.setLineDash([4,22]);x.lineCap='round';x.strokeStyle=SAF;x.lineWidth=10;x.beginPath();x.moveTo(bx-260,CY+460);x.lineTo(X,CY+460);x.stroke();x.setLineDash([]);
  bot(X,CY+360,120,eo((lt-4.3)/0.3),lt*7,true);
  txt('walks',X,CY+560,'italic 40px IMI',SAF,'center',eo((lt-4.6)/0.3))}
 x.restore()};

// ---------- 5. rewrite the rules (palm-leaf manuscript) ----------
S.rewrite=(p,lt)=>{const a=eo(lt/0.5);x.save();x.globalAlpha*=a;const cx=W/2,cy=CY-40;
 // data bars feeding in
 const bk=eo((lt-0.2)/1.2);for(let i=0;i<5;i++){const hh=[90,150,120,200,170][i]*bk;rr(cx-250+i*110,cy-260-hh,70,hh,10);x.fillStyle=i==3?SAF:INK;x.fill()}
 txt('trial data',cx,cy-210,'italic 36px IMI',INK,'center',0.7*bk);
 // leaf
 x.save();x.translate(cx,cy+120);x.beginPath();x.moveTo(-420,0);x.bezierCurveTo(-400,-95,400,-95,420,0);x.bezierCurveTo(400,95,-400,95,-420,0);x.closePath();
 x.fillStyle='#E9D3A3';x.fill();x.strokeStyle=INK;x.lineWidth=6;x.stroke();circle(-250,0,10,INK,4,PAPER);circle(250,0,10,INK,4,PAPER);
 // old lines struck, new lines written
 for(let r=0;r<3;r++){const y=-42+r*42;const len=r==1?440:520;x.strokeStyle='rgba(43,33,24,.45)';x.lineWidth=7;x.beginPath();x.moveTo(-len/2,y);x.lineTo(len/2,y);x.stroke();
  const st=eio((lt-1.0-r*0.3)/0.5);if(st>0){x.strokeStyle=RED;x.lineWidth=5;x.beginPath();x.moveTo(-len/2-10,y);x.lineTo(-len/2-10+(len+20)*st,y);x.stroke()}}
 x.restore();
 const wr=eio((lt-2.2)/1.4);x.save();x.translate(cx,cy+330);for(let r=0;r<2;r++){const len=[500,380][r];const k=cl(wr*2-r);if(k<=0)continue;x.strokeStyle=SAF;x.lineWidth=9;x.lineCap='round';x.beginPath();x.moveTo(-len/2,r*46);x.lineTo(-len/2+len*k,r*46);x.stroke();
  if(k<1){x.save();x.translate(-len/2+len*k,r*46);x.rotate(-0.7);x.fillStyle=INK;x.beginPath();x.moveTo(0,0);x.lineTo(14,-90);x.lineTo(-6,-92);x.closePath();x.fill();x.restore()}}x.restore();
 txt('new safety standards',cx,cy+470,'italic 38px IMI',INK,'center',0.8*eo((lt-3.0)/0.5));
 x.restore()};

// ---------- 6. caveat: permission is not proof ----------
S.caveat=(p,lt)=>{const sp=5.2;const a1=eo(lt/0.5)*(1-eio((lt-sp)/0.35));
 if(a1>0.01){x.save();x.globalAlpha*=a1;x.translate(W/2,CY-40);
  const s1=back((lt-0.1)/0.4);if(s1>0){x.save();x.translate(-220,0);x.rotate(-0.08);x.scale(s1,s1);x.strokeStyle=SAF;x.lineWidth=8;rr(-190,-70,380,140,16);x.stroke();txt('PERMISSION',0,4,'54px IXB',SAF);x.restore()}
  txt('≠',0,0,'120px IXB',INK,'center',eo((lt-2.6)/0.3));
  const s2=back((lt-3.2)/0.4);if(s2>0){x.save();x.translate(230,0);x.rotate(0.06);x.scale(s2,s2);x.strokeStyle=INK;x.lineWidth=8;x.setLineDash([18,12]);rr(-150,-70,300,140,16);x.stroke();x.setLineDash([]);txt('PROOF',0,4,'54px IXB',INK);x.restore()}
  txt('a trial, not results',0,230,'italic 42px IMI',INK,'center',0.7*eo((lt-3.8)/0.5));x.restore()}
 const a2=eo((lt-sp-0.1)/0.4);if(a2>0){x.save();x.globalAlpha*=a2;
  // robot at a workbench, a person nearby ready to step in
  x.fillStyle=INK;rr(W/2-60,CY+40,420,26,8);x.fill();LIMB(W/2,CY+66,W/2,CY+220,14,INK);LIMB(W/2+300,CY+66,W/2+300,CY+220,14,INK);
  rr(W/2+40,CY-40,110,80,10);x.fillStyle='#EADCC4';x.fill();x.strokeStyle=INK;x.lineWidth=5;x.stroke();
  bot(W/2-150,CY-20,190,1,0,true);
  const step=eio((lt-sp-1.6)/0.8);person(150+50*step,CY+20,170,1,lt*5*(step>0&&step<1));
  // tally of interventions
  const tk=Math.floor(cl((lt-sp-0.6)/2.6)*7);x.save();x.translate(W/2-170,CY-420);x.strokeStyle=SAF;x.lineWidth=12;x.lineCap='round';
  for(let i=0;i<Math.min(tk,5);i++){if(i<4){x.beginPath();x.moveTo(i*44,0);x.lineTo(i*44,110);x.stroke()}else{x.beginPath();x.moveTo(-20,95);x.lineTo(150,15);x.stroke()}}
  for(let i=5;i<tk;i++){x.beginPath();x.moveTo(230+(i-5)*44,0);x.lineTo(230+(i-5)*44,110);x.stroke()}x.restore();
  txt('?',W/2+320,CY-365,'140px IXB',INK,'center',eo((lt-sp-2.9)/0.3));
  txt('how often do people step in?',W/2,CY+340,'italic 42px IMI',INK,'center',0.8*eo((lt-sp-1.0)/0.5));x.restore()}
};

// ---------- 7. lesson: the fence comes down ----------
S.lesson=(p,lt)=>{const a=eo(lt/0.6);x.save();x.globalAlpha*=a;
 // sun rising behind
 const sr=eio(lt/4);x.save();x.translate(W/2,CY+180-300*sr);x.rotate(lt*0.08);x.globalAlpha*=0.9;x.drawImage(IMG('logo'),-150,-150,300,300);x.restore();
 // hills
 x.fillStyle=PAPER;x.strokeStyle=INK;x.lineWidth=7;x.lineJoin='round';x.beginPath();x.moveTo(60,CY+300);x.quadraticCurveTo(300,CY+120,540,CY+220);x.quadraticCurveTo(780,CY+120,1020,CY+300);x.closePath();x.fill();x.stroke();
 x.strokeStyle=RULE;x.lineWidth=4;x.beginPath();x.moveTo(90,CY+300);x.lineTo(W-90,CY+300);x.stroke();
 // fence along the floor sinks; sprouts grow where posts were (from "That's how the fence comes down")
 const drop=eio((lt-5.5)/1.6);x.save();x.translate(0,0);
 const n=7;for(let i=0;i<n;i++){const X=180+i*120;const dd=cl(drop*n*1.2-i*0.9);const ph=150*(1-dd);x.fillStyle=INK;rr(X-9,CY+300-ph,18,ph,6);if(ph>1)x.fill();
  if(i>0&&dd<0.6){x.strokeStyle='rgba(43,33,24,'+(0.45*(1-dd))+')';x.lineWidth=3;for(let j=1;j<4;j++){x.beginPath();x.moveTo(X-120,CY+300-150*(1-cl(drop*n*1.2-(i-1)*0.9))*j/4);x.lineTo(X,CY+300-ph*j/4);x.stroke()}}
  sprout(X,CY+300,90,cl((dd-0.6)/0.4))}
 x.restore();
 // person and humanoid side by side, stepping closer
 const k=eio((lt-0.8)/3.5);person(W/2-200+70*k,CY+170,170,1,0);bot(W/2+200-70*k,CY+170,170,1,0,true);
 // small trials: three little check boxes
 for(let i=0;i<3;i++){const c=eo((lt-1.6-i*0.9)/0.4);if(c<=0)continue;const X=W/2-130+i*130,Y=CY+470;rr(X-38,Y-38,76,76,14);x.strokeStyle=INK;x.lineWidth=5;x.stroke();
  x.strokeStyle=SAF;x.lineWidth=10;x.lineCap='round';x.beginPath();x.moveTo(X-18,Y);x.lineTo(X-4,Y+16*c);x.lineTo(X-4+26*c,Y-18*c);x.stroke()}
 x.restore()};
