// Omnix Explains #3 — Wallets & private keys (bright theme, uses tools/brief_reel/lib.js)
function words24(k,hl){const cols=4,rows=6,w=200,h=78,X0=W/2-(cols-1)*w/2*1.08,Y0=CY-260;
 for(let i=0;i<24;i++){const r=(i/cols)|0,c=i%cols;const e=pop(k*24-i*0.9);if(e<=0)continue;const X=X0+c*w*1.08,Y=Y0+r*(h+20);
  x.save();x.translate(X,Y);x.scale(e,e);rr(-w/2+8,-h/2,w-16,h,16);x.fillStyle=hl&&i<12?'#FFF3DC':'#FBF6EC';x.fill();L(3,i<12&&hl?SAF:INK);x.stroke();
  txt((i+1)+'',-w/2+34,0,'22px ISB',SAF,'center');x.fillStyle='rgba(43,33,24,.3)';x.fillRect(-35,-6,90-(i*7)%40,12);x.restore()}}
S.hook=(p,lt,d,t)=>{const k=pop(lt-0.05);if(k>0)ic('wallet',W/2,CY-60,2.2*k);const c=pop(kw(t,"isn't"));if(c>0){ic('coin',W/2+230,CY-250,0.8*c);ic('cross',W/2+300,CY-320,0.45*c)}
 txt('?',W/2,CY+250,'italic 120px IMI',SAF,'center',fin(kw(t,'wallet')))};
S.keyring=(p,lt,d,t)=>{const k=pop(lt-0.1);if(k>0){x.save();x.translate(W/2-210,CY-40);x.scale(k,k);circle(0,-120,60,INK,10);ic('key',20,0,1.1,{rot:1.2});ic('key',-40,10,1.0,{rot:1.9,acc:SAF});x.restore();label('wallet = keyring',W/2-210,CY+190,38,INK,k)}
 const c=pop(kw(t,'coins'));if(c>0){ic('block',W/2+230,CY-60,1.2*c);for(let i=0;i<3;i++)ic('coin',W/2+170+i*60,CY-220-i*20,0.5*c);label('coins live on-chain',W/2+230,CY+190,38,INK,c)}
 const pr=eio(cl(kw(t,'prove')/0.6));if(pr>0){L(6,SAF);x.setLineDash([14,12]);line(W/2-90,CY-40,W/2-90+200*pr,CY-40);x.setLineDash([])}};
S.public=(p,lt,d,t)=>{const k=pop(kw(t,'public'));if(k>0){x.save();x.translate(W/2,CY-130);x.scale(k,k);shadow(1);rr(-380,-110,760,220,30);x.fillStyle='#FBF6EC';x.fill();shadow(0);L(5,SAF);x.stroke();x.restore();
  txt('PUBLIC ADDRESS',W/2,CY-180,'36px IXB',SAF,'center',k);txt('0x7f3a…c91e',W/2,CY-110,'60px ISB',INK,'center',k)}
 const u=pop(kw(t,'UPI'));if(u>0){txt('≈ your UPI ID',W/2,CY+60,'italic 56px IMI',INK,'center',u)}
 const s=pop(since(t,1));if(s>0){ic('person',W/2-200,CY+300,0.8*s);ic('coin',W/2,CY+300,0.6*s);ic('person',W/2+200,CY+300,0.8*s,{fill:MAR});L(6,SAF);line(W/2-110,CY+300,W/2-70,CY+300);line(W/2+70,CY+300,W/2+110,CY+300);label('share it, get paid',W/2,CY+440,38,INK,s)}};
S.private=(p,lt,d,t)=>{const k=pop(kw(t,'private'));if(k>0){ic('key',W/2,CY-230,1.8*k,{acc:RED});txt('PRIVATE KEY',W/2,CY-50,'52px IXB',RED,'center',k)}
 const a=pop(kw(t,'PIN'));if(a>0){x.save();x.translate(W/2-200,CY+150);x.scale(a,a);rr(-130,-70,260,140,20);x.fillStyle='#FBF6EC';x.fill();L(4,INK);x.stroke();txt('• • • •',0,0,'56px IXB',INK);x.restore();label('PIN',W/2-200,CY+260,36,INK,a)}
 const b=pop(kw(t,'signature'));if(b>0){x.save();x.translate(W/2+200,CY+150);x.scale(b,b);rr(-130,-70,260,140,20);x.fillStyle='#FBF6EC';x.fill();L(4,INK);x.stroke();L(5,SAF);x.beginPath();x.moveTo(-90,20);x.bezierCurveTo(-60,-50,-30,50,0,0);x.bezierCurveTo(30,-40,50,40,90,-10);x.stroke();x.restore();label('signature',W/2+200,CY+260,36,INK,b)}
 txt('+',W/2,CY+150,'80px IXB',SAF,'center',b);const c=pop(since(t,1));if(c>0)ic('check',W/2,CY+420,0.7*c)};
S.phrase=(p,lt,d,t)=>{words24(cl(kw(t,'twelve')/3),kw(t,'twelve')>0&&kw(t,'twenty-four')<0);
 const k=fin(kw(t,'recovery'));txt('recovery phrase',W/2,CY+420,'italic 60px IMI',SAF,'center',k)};
S.number=(p,lt,d,t)=>{const k=fin(kw(t,'seventy-eight'));txt('2²⁵⁶',W/2,CY-280,'90px IXB',INK,'center',fin(lt-0.3));
 txt('115,792,089,237,316,195,423,',W/2,CY-130,'46px ISB',INK,'center',k*0.85);txt('570,985,008,687,907,853,269,',W/2,CY-70,'46px ISB',INK,'center',k*0.85);txt('984,665,640,564,039,457,584,',W/2,CY-10,'46px ISB',INK,'center',k*0.85);txt('007,913,129,639,936',W/2,CY+50,'46px ISB',INK,'center',k*0.85);
 txt('78 digits',W/2,CY+200,'120px IXB',SAF,'center',fin(kw(t,'digits.')));const n=pop(since(t,1));if(n>0){ic('chip',W/2-290,CY+380,0.6*n);txt('no computer comes close',W/2+60,CY+380,'italic 40px IMI',INK,'center',n)}};
S.catch=(p,lt,d,t)=>{const k=pop(lt-0.1);if(k>0){x.save();x.translate(W/2,CY-180);x.scale(k,k);shadow(1);rr(-330,-70,660,140,70);x.fillStyle='#FBF6EC';x.fill();shadow(0);L(5,INK);x.stroke();txt('Forgot password?',0,0,'48px ISB',MUTE);x.restore();
  const c=pop(kw(t,'forgot-password')+0.3);if(c>0){L(12,RED);line(W/2-330*c,CY-180,W/2+330*c,CY-180)}}
 const g=pop(kw(t,'gone.'));if(g>0){ic('wallet',W/2-200,CY+170,1*g);txt('lose it → gone',W/2-200,CY+320,'38px ISB',RED,'center',g)}
 const s=pop(kw(t,'Share'));if(s>0){ic('unlock',W/2+200,CY+170,0.9*s);txt('share it → gone',W/2+200,CY+320,'38px ISB',RED,'center',s)}};
S.rules=(p,lt,d,t)=>T.list(p,lt,t,{items:[{ic:'phone',l:'Never type it into a website',at:'type'},{ic:'camera',l:'Never photograph it',at:'photograph'},{ic:'person',l:'Never give it to anyone',at:'give'},{ic:'shield',l:'Real support never asks',at:'Real'}],gap:240});
S.takeaway=(p,lt,d,t)=>{const k=pop(kw(t,'keys,'));if(k>0)ic('key',W/2-270,CY-60,1.4*k,{acc:SAF});txt('=',W/2+10,CY-60,'110px IXB',SAF,'center',fin(kw(t,'holds')));const c=pop(kw(t,'coins.'));if(c>0){ic('coin',W/2+230,CY-100,1.1*c);ic('coin',W/2+280,CY-10,1.1*c)}};
S.close=(p,lt,d,t)=>{const k=pop(lt-0.05);if(k>0)ic('wallet',W/2,CY-40,1.8*k);const c=pop(kw(t,'keys'));if(c>0){x.save();x.translate(W/2,CY-100);x.scale(c,c);ic('key',0,-180,1.2,{acc:SAF,rot:-0.3});x.restore()}
 txt('your keys are',W/2,CY+260,'italic 64px IMI',SAF,'center',fin(kw(t,'are.')))};
