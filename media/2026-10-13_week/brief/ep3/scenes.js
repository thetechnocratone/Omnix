// The Brief #3 — hardware wallet implant (bright theme)
S.box=(p,lt,d,t)=>{const k=pop(lt);x.save();x.translate(W/2,CY);x.scale(1.9*k,1.9*k);ic('box',0,0,1);x.restore();
 // tape seal
 const s=fin(kw(t,'sealed.'));if(s>0){x.save();x.translate(W/2,CY-70);x.rotate(-0.42);x.globalAlpha*=s;rr(-120,-22,240,44,6);x.fillStyle=SAF;x.fill();txt('SEALED',0,2,'28px IXB','#fff');x.restore()}
 const n=fin(kw(t,'new.'));if(n>0){x.save();x.translate(W/2+230,CY-250);x.rotate(0.15);x.globalAlpha*=n;rr(-80,-34,160,68,34);x.fillStyle=INK;x.fill();txt('NEW',0,2,'34px IXB','#fff');x.restore()}
 const kk=kw(t,'keys.');if(kk>-0.3){const e=eo(cl((kk+0.3)/0.8));const pulse=0.5+0.5*Math.sin(lt*6);x.save();x.shadowColor='rgba(194,80,46,'+(0.4+0.4*pulse)+')';x.shadowBlur=60;ic('key',W/2+260*e,CY-360*e,1.1*e,{fill:'#F4C7B4',acc:RED,col:RED});x.restore();
  txt('someone else has a copy',W/2,CY+420,'italic 44px IMI',RED,'center',fin(kk-0.2))}};
S.implant=(p,lt,d,t)=>{const k=pop(lt);x.save();x.translate(W/2,CY);x.scale(k,k);shadow(1);rr(-330,-200,660,400,50);x.fillStyle='#FBF6EC';x.fill();shadow(0);L(8,INK);x.stroke();
 // device screen + buttons
 rr(-250,-120,330,240,20);x.fillStyle=INK;x.fill();txt('••••••',-85,0,'50px IXB',SAF);circle(210,-60,34,INK,6,LIGHT);circle(210,60,34,INK,6,LIGHT);x.restore();
 const r=fin(kw(t,'implant'));if(r>0){// x-ray reveal
  x.save();x.globalAlpha*=r;x.beginPath();x.arc(W/2-60,CY+40,170,0,7);x.clip();x.fillStyle='rgba(43,33,24,.92)';x.fillRect(0,0,W,H);L(3,'rgba(241,150,17,.5)');for(let i=-8;i<8;i++)line(W/2-260,CY+40+i*24,W/2+140,CY+40+i*24+60);
  const pulse=0.5+0.5*Math.sin(lt*7);x.shadowColor='rgba(194,80,46,'+(0.5+0.4*pulse)+')';x.shadowBlur=50;ic('chip',W/2-60,CY+40,0.8,{col:RED,acc:'#FFB49C'});x.restore();
  L(10,INK);circle(W/2-60,CY+40,170,INK,10);x.lineWidth=26;line(W/2+60,CY+160,W/2+170,CY+270)}
 if(since(t,1)>0){const a=fin(since(t,1));txt('bought through an authorised reseller',W/2,CY+420,'40px ISB',INK,'center',a);txt('Southeast Asia',W/2,CY+480,'italic 40px IMI',SAF,'center',a)}};
S.losses=(p,lt,d,t)=>{T.big(p,lt,t,{num:'$93M',unit:'drained, by researchers’ estimate',at:'ninety-three',icon:'wallet',size:210});
 const k=since(t,1);if(k>0){const r=rng(3);for(let i=0;i<60;i++){const e=pop(k-i*0.02);if(e<=0)continue;const X=180+(i%12)*65,Y=CY+250+((i/12)|0)*58;x.save();x.translate(X,Y);x.scale(e*0.22,e*0.22);ic('wallet',0,0,1,{acc:i%7==0?RED:SAF});x.restore()}txt('300+ wallets',W/2,CY+560,'44px IXB',RED,'center',fin(k-0.6))}};
S.caveat=(p,lt,d,t)=>{T.flow(p,lt,t,{y:CY-60,sp:330,nodes:[{ic:'building',l:'the maker',part:1},{ic:'box',l:'one reseller',part:2},{ic:'person',l:'the buyer',part:2}]});
 const a=since(t,1);if(a>0){const k=pop(a-0.4);if(k>0)ic('check',W/2-330+70,CY-200,0.42*k)}
 const b=kw(t,'one');if(b>0){const k=pop(b);if(k>0)ic('warn',W/2+70,CY-210,0.45*k)}
 const c=fin(lt-0.2);x.save();x.translate(W/2,CY+330);x.globalAlpha*=c;rr(-360,-58,720,116,58);x.fillStyle=INK;x.fill();txt('Loss figure not confirmed by Ledger',0,2,'36px ISB','#fff');x.restore()};
S.advice=(p,lt,d,t)=>T.list(p,lt,t,{gap:280,items:[{ic:'box',l:'Bought there recently? Don’t set it up.',part:0},{ic:'key',l:'Already set up? Fresh recovery phrase, device from the maker.',part:1}]});
S.words=(p,lt,d,t)=>{const r=rng(9);const ws=['river','lotus','amber','orbit','cedar','metro','ocean','tiger','spice','glass','mango','north','pearl','ember','solar','delta','quiet','honey','stone','prism','raven','monsoon','sky','chai'];
 for(let i=0;i<24;i++){const c=i%4,rw=(i/4)|0;const X=W/2-330+c*220,Y=CY-330+rw*105;const k=pop(lt-0.05*i);if(k<=0)continue;x.save();x.translate(X,Y);x.scale(k,k);rr(-95,-38,190,76,14);x.fillStyle='#FBF6EC';x.fill();L(3,INK);x.stroke();txt((i+1)+'',-70,0,'22px ISB',MUTE);txt('•••••',15,2,'32px IXB',INK);x.restore()}
 const k=pop(kw(t,'never')-0.2);if(k>0){x.save();x.translate(W/2,CY+420);x.scale(k,k);rr(-320,-70,640,140,70);x.fillStyle=RED;x.fill();txt('NEVER SHARE THESE',0,3,'46px IXB','#fff');x.restore()}};
S.path=(p,lt,d,t)=>{const pts=[[W/2-330,CY-260,'building','maker'],[W/2+330,CY-120,'truck','shipping'],[W/2-330,CY+40,'box','seller'],[W/2+330,CY+200,'person','you']];const e=eio(cl(lt/2.8));
 L(10,SAF);x.setLineDash([22,16]);x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const f=cl(e*3-(i-1));if(f<=0)break;const a=pts[i-1],b=pts[i];x.lineTo(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f)}x.stroke();x.setLineDash([]);
 pts.forEach(([X,Y,ic0,l],i)=>{const k=pop(lt-i*0.6);if(k<=0)return;x.save();x.translate(X,Y);x.scale(k,k);circle(0,0,110,INK,5,'#FBF6EC');x.restore();ic(ic0,X,Y,0.6*k);label(l,X,Y+150,32,INK,k)});
 const s=pop(kw(t,'path')-0.1);if(s>0)ic('shield',W/2,CY-20,0.9*s)};
S.close=(p,lt,d,t)=>T.say(p,lt,t,{icon:'box',lines:[['Check the seal.',INK,86,'seal.'],['Then check where',SAF,86,'came'],['it came from.',SAF,86,'came']]});
