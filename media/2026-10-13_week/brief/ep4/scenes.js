// The Brief #4 — AI that remembers (Meta Muse Wonder)
function bubble(X,Y,w,h,s,a,col){x.save();x.globalAlpha*=a;x.translate(X,Y);rr(-w/2,-h/2,w,h,28);x.fillStyle=col||'#FBF6EC';x.fill();L(4,INK);x.stroke();x.beginPath();x.moveTo(-w/2+50,h/2);x.lineTo(-w/2+40,h/2+34);x.lineTo(-w/2+90,h/2);x.fillStyle=col||'#FBF6EC';x.fill();txt(s,0,2,'38px ISB',INK);x.restore()}
S.recall=(p,lt,d,t)=>{const k=pop(lt);ic('calendar',W/2-250,CY-200,1.3*k);txt('3 months ago',W/2-250,CY-30,'italic 40px IMI',INK,'center',k);
 bubble(W/2+150,CY-310,460,110,'"I’m allergic to peanuts"',fin(lt-0.4));
 const r=kw(t,'remembered');const e=eio(cl(r/1.2));if(r>0){L(6,SAF);x.setLineDash([14,12]);x.beginPath();x.moveTo(W/2+150,CY-250);x.quadraticCurveTo(W/2+330,CY,W/2+150*1-0,CY+230*e);x.stroke();x.setLineDash([]);
  const pulse=0.5+0.5*Math.sin(lt*4);x.save();x.shadowColor='rgba(241,150,17,'+(0.3+0.4*pulse)+')';x.shadowBlur=60;ic('brain',W/2+80,CY+280,1.4*pop(r-0.3));x.restore()}};
S.release=(p,lt,d,t)=>{const cards=[['Muse Wonder','frontier model',0],['Muse Wonder Full','bigger version',1]];
 cards.forEach(([n,s,i])=>{const st=since(t,i)-(i?0:0.1);const k=pop(st);if(k<=0)return;const Y=CY-170+i*360;x.save();x.translate(W/2,Y);x.scale(k,k);shadow(1);rr(-400,-130,800,260,36);x.fillStyle=i?'#FFF3DC':'#FBF6EC';x.fill();shadow(0);L(5,i?SAF:INK);x.stroke();x.restore();
  ic('chip',W/2-280,Y,0.9*k);txt(n,W/2-150,Y-25,'56px IXB',INK,'left',k);txt(s,W/2-150,Y+40,'italic 38px IMI',SAF,'left',k)});
 txt('released Monday, 12 Oct',W/2,CY+420,'34px ISB',INK,'center',0.6*fin(lt-1))};
S.memory=(p,lt,d,t)=>{const lab=['days','weeks','months'];const y=CY+260;const st=since(t,1);L(8,INK);const e=eio(cl(st/2.6));line(160,y,160+760*Math.max(0.03,e),y);
 lab.forEach((l,i)=>{const X=240+i*300;const k2=pop(st-0.3-i*0.7);if(k2<=0)return;circle(X,y,26*k2,INK,5,SAF);label(l,X,y+75,40,INK,k2);
  const f=eio(cl((st-0.9-i*0.7)/1));if(f>0&&f<1)circle(X+(W/2-X)*f,y-(y-(CY-170))*f,16,null,0,SAF)});
 const k=pop(lt);x.save();x.shadowColor='rgba(241,150,17,.5)';x.shadowBlur=50;ic('brain',W/2,CY-170,1.8*k);x.restore();
 const a=fin(kw(t,'active'));if(a>0){x.save();x.translate(W/2,CY-440);x.globalAlpha*=a;rr(-230,-46,460,92,46);x.fillStyle=INK;x.fill();txt('ACTIVE MEMORY',0,2,'38px IXB',SAF);x.restore()}};
S.agents=(p,lt,d,t)=>{const k1=pop(since(t,1)),k2=pop(since(t,2));
 if(k1>0){ic('brain',W/2-240,CY-150,1.3*k1,{fill:'#F1E7D6'});const r=rng(4);for(let i=0;i<8;i++){const f=cl(lt*0.4-i*0.1);circle(W/2-240+(r()-0.5)*160,CY-150+f*400,10*(1-f),null,0,MUTE)}label('forgets',W/2-240,CY+90,40,INK,k1);txt('small tasks',W/2-240,CY+150,'italic 36px IMI',MUTE,'center',k1)}
 if(k2>0){x.save();x.shadowColor='rgba(241,150,17,.55)';x.shadowBlur=50;ic('brain',W/2+240,CY-150,1.3*k2);x.restore();for(let i=0;i<6;i++){const a=lt*1.2+i;circle(W/2+240+Math.cos(a)*140,CY-150+Math.sin(a)*120,10,null,0,SAF)}label('remembers',W/2+240,CY+90,40,SAF,k2);txt('long-running work',W/2+240,CY+150,'italic 36px IMI',INK,'center',k2)}
 const a=fin(lt-0.1);txt('the missing piece for agents',W/2,CY-470,'44px IXB',INK,'center',a*(1-fin(since(t,1))*0.5));
 if(k2>0){L(6,MUTE);x.globalAlpha*=k2;line(W/2-60,CY-150,W/2+60,CY-150);x.fillStyle=MUTE;x.beginPath();x.moveTo(W/2+70,CY-150);x.lineTo(W/2+45,CY-165);x.lineTo(W/2+45,CY-135);x.fill()}};
S.access=(p,lt,d,t)=>T.list(p,lt,t,{gap:290,items:[{ic:'chip',l:'Muse Wonder: developers, via a paid API',part:0},{ic:'lock',l:'Wonder Full: coding-tool subscribers only',part:1}]});
S.caveat=(p,lt,d,t)=>{const a=since(t,0),b=since(t,1);
 if(b<0.2){T.bars(p,lt,t,{bars:[{v:0.8,top:'',l:'their test',col:SAF},{v:0.78,top:'',l:'their test',col:MAR},{v:0.82,top:'',l:'their test',col:SAF}]});const k=pop(kw(t,'own')+0.1);if(k>0){x.save();x.translate(W/2,CY-420);x.scale(k,k);x.rotate(-0.05);rr(-300,-55,600,110,20);x.fillStyle=INK;x.fill();txt('self-reported scores',0,3,'40px IXB',SAF);x.restore()}}
 else{const k=pop(b);ic('brain',W/2,CY-60,1.5*k,{fill:'#F1E7D6'});const kk=pop(kw(t,'controls'));if(kk>0){ic('key',W/2+220,CY-280,0.9*kk,{acc:SAF});txt('?',W/2-220,CY-260,'180px IXB',SAF,'center',kk)}txt('who holds the key?',W/2,CY+250,'italic 46px IMI',INK,'center',fin(b-0.6))}};
S.takeaway=(p,lt,d,t)=>T.say(p,lt,t,{dy:60,icon:'brain',lines:[['Memory makes',INK,84,'Memory'],['agents useful.',INK,84,'useful.'],['Ownership earns',SAF,84,'owns'],['trust.',SAF,84,'trusted.']]});
S.close=(p,lt,d,t)=>{const k=pop(lt);ic('calendar',W/2,CY-280,1.2*k);
 const rows=[['your preferences',1],['your health notes',0],['your work projects',1]];const st=since(t,1);
 rows.forEach(([l,on],i)=>{const kk=pop(st-0.15-i*0.25);if(kk<=0)return;const Y=CY+(i*120);x.save();x.translate(W/2,Y);x.scale(kk,kk);rr(-380,-48,760,96,48);x.fillStyle='#FBF6EC';x.fill();L(3,INK);x.stroke();txt(l,-340,2,'38px ISB',INK,'left');
  const sw=on?eio(cl((st-0.6-i*0.25)/0.3)):0;rr(220,-30,120,60,30);x.fillStyle=sw>0.5?SAF:LIGHT;x.fill();circle(250+60*sw,0,24,null,0,'#fff');txt(sw>0.5?'keep':'forget',140,2,'30px IMI',INK,'center',0.6);x.restore()})};
