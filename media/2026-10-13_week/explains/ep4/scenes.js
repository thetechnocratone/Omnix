// Omnix Explains #4 — Stablecoins (bright theme, uses tools/brief_reel/lib.js)
function moon(X,Y,r){circle(X,Y,r,null,0,'#F3E6C8');x.save();x.beginPath();x.arc(X+r*0.45,Y-r*0.2,r*0.9,0,7);x.fillStyle=PAPER;x.fill();x.restore()}
S.hook=(p,lt,d,t)=>{moon(W-180,CY-470,60);const k=pop(lt-0.1);if(k>0){ic('phone',W/2-300,CY-40,1.1*k);label('you',W/2-300,CY+150,36,INK,k)}
 const f=pop(lt-0.6);if(f>0){ic('globe',W/2+300,CY-60,0.8*f);ic('person',W/2+300,CY+80,0.55*f,{fill:MAR});label('family abroad',W/2+300,CY+190,36,INK,f)}
 const m=cl((lt-1.2)/2);if(m>0){const X=W/2-180+360*eio(m);ic('coin',X,CY-40-Math.sin(m*Math.PI)*160,0.55);}
 const k2=fin(kw(t,'minutes,'));txt('minutes',W/2,CY+330,'110px IXB',SAF,'center',k2);txt('on a Sunday night',W/2,CY+430,'italic 46px IMI',INK,'center',fin(kw(t,'Sunday')))};
S.swing=(p,lt,d,t)=>{const k=eio(cl((lt-0.2)/2.2));L(10,RED);x.beginPath();for(let i=0;i<=60*k;i++){const u=i/60;const X=120+u*(W-240);const Y=CY-120+Math.sin(u*15)*130*Math.sin(u*3+1)+u*30;i?x.lineTo(X,Y):x.moveTo(X,Y)}x.stroke();
 label('crypto prices',W/2,CY-380,40,INK,fin(lt-0.2));const r=pop(kw(t,'ten'));if(r>0){ic('building',W/2-120,CY+300,0.8*r);txt('−10%',W/2+130,CY+300,'100px IXB',RED,'center',r);label('rent money, overnight',W/2,CY+440,36,INK,r)}};
S.concept=(p,lt,d,t)=>{const k=pop(kw(t,'stablecoin'));if(k>0)ic('coin',W/2,CY-180,2.3*k);
 const l=eio(cl(kw(t,'one')/0.6));L(10,SAF);line(120,CY+160,120+(W-240)*l,CY+160);label('price stays put',W/2,CY+220,36,INK,fin(kw(t,'fixed')));
 txt('1 token ≈ $1',W/2,CY+360,'90px IXB',INK,'center',fin(kw(t,'dollar.')))};
S.reserves=(p,lt,d,t)=>{const k=pop(lt-0.1);if(k>0){ic('coin',W/2-230,CY-160,1.3*k);label('1 token',W/2-230,CY+0,38,INK,k)}
 const v=pop(kw(t,'reserves:'));if(v>0){x.save();x.translate(W/2+230,CY-150);x.scale(v,v);ic('bank',0,0,1.3);x.restore();label('reserves',W/2+230,CY+0,38,INK,v)}
 txt('=',W/2,CY-150,'90px IXB',SAF,'center',v);
 const c=pop(kw(t,'cash'));if(c>0){x.save();x.translate(W/2-170,CY+260);x.scale(c,c);rr(-120,-65,240,130,14);x.fillStyle='#E6EFD9';x.fill();L(5,INK);x.stroke();txt('$1',0,0,'60px IXB',INK);x.restore();label('cash',W/2-170,CY+380,34,INK,c)}
 const b=pop(kw(t,'bonds.'));if(b>0){ic('doc',W/2+170,CY+260,0.9*b);label('short-term govt bonds',W/2+170,CY+380,34,INK,b)}
 txt('(the issuer says)',W/2,CY+470,'italic 34px IMI',MUTE,'center',fin(kw(t,'says')))};
S.move=(p,lt,d,t)=>{T.world(p,lt,t,{lines:[['any hour, any border',INK,58,'borders'],['settles in minutes',SAF,72,'minutes.']]})};
S.number=(p,lt,d,t)=>T.big(p,lt,t,{num:'$300B+',unit:'worth of stablecoins in circulation',sub:'Source: DefiLlama, 2026',icon:'coin',at:'three',size:200});
S.catch=(p,lt,d,t)=>{txt('THE CATCH',W/2,CY-380,'64px IXB',SAF,'center',fin(lt-0.1));
 const k=pop(kw(t,'reserves'));if(k>0){ic('coin',W/2-330,CY-140,1*k);txt('only as good as',W/2,CY-140,'italic 44px IMI',INK,'center',k);ic('bank',W/2+330,CY-140,0.9*k)}
 const pg=cl(kw(t,'peg.')/1.2);if(pg>0){L(5,MUTE);x.setLineDash([12,10]);line(140,CY+120,W-140,CY+120);x.setLineDash([]);L(10,RED);x.beginPath();for(let i=0;i<=40*pg;i++){const u=i/40;const X=140+u*(W-280);const Y=CY+120+(u>0.5?Math.pow((u-0.5)*2,2)*170:0);i?x.lineTo(X,Y):x.moveTo(X,Y)}x.stroke();label('lost the peg',W/2+250,CY+50,34,RED,1)}
 const r=pop(kw(t,'rules'));if(r>0){['🇮🇳','🇺🇸','🇪🇺'].forEach((f,i)=>{ic('doc',W/2+(i-1)*200,CY+380,0.55*r)});label('rules differ by country',W/2,CY+500,36,INK,r)}};
S.takeaway=(p,lt,d,t)=>T.vs(p,lt,t,{l:{ic:'building',t:'an investment'},r:{ic:'coin',t:'a digital dollar'},at:'digital',bad:'l',badAt:"isn't",good:'r',goodAt:'fast.'});
S.close=(p,lt,d,t)=>{moon(W-180,CY-470,60);const k=pop(lt-0.05);if(k>0)ic('clock',W/2,CY-150,1.5*k);txt('Minutes,',W/2,CY+130,'110px IXB',SAF,'center',fin(kw(t,'Minutes,')));txt('not days.',W/2,CY+260,'italic 80px IMI',INK,'center',fin(kw(t,'days.')))};
