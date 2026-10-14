// Omnix Explains #2 — What is a blockchain? (bright theme, uses tools/brief_reel/lib.js)
const P6=['person','person','person','person','person','person'];
function chainRow(lt,t,o){o=o||{};const n=4,sp=230,y=o.y||CY-60,X0=W/2-(n-1)*sp/2;
 for(let i=0;i<n;i++){const st=o.instant?1:lt-0.2-i*0.45;const k=pop(st);if(k<=0)continue;const X=X0+i*sp;
  const bad=o.bad!=null&&i>=o.bad&&o.badK>0;const red=o.bad===i&&o.badK>0;
  if(i>0&&o.links){const a=o.links(i);if(a>0){L(10,bad?RED:SAF);if(bad)x.setLineDash([12,12]);line(X-sp+85,y,X-sp+85+(sp-170)*a,y);x.setLineDash([])}}
  x.save();x.translate(X,y);x.scale(k,k);shadow(1);rr(-85,-110,170,220,22);x.fillStyle=red?'#F6D3C7':(bad?'#F1E7D6':'#FBF6EC');x.fill();shadow(0);L(5,bad?RED:INK);x.stroke();
  for(let l=0;l<3;l++){x.fillStyle='rgba(43,33,24,.25)';x.fillRect(-55,-70+l*30,110-l*20,10)}
  txt(o.fp?o.fp[i]:['#a1f','#7c2','#e09','#4b8'][i],0,60,'30px ISB',bad?RED:SAF);x.restore();
  if(bad&&!red){const kk=pop(o.badK*3-1-i*0.3);if(kk>0)ic('cross',X+70,y-120,0.4*kk)}}}

S.notebook=(p,lt,d,t)=>T.net(p,lt,t,{icons:P6,center:'book',connectAt:0.35});
S.keeper=(p,lt,d,t)=>{const k=pop(lt-0.1);if(k>0){ic('bank',W/2,CY-120,1.8*k);label('one keeper',W/2,CY+110,44,INK,k)}
 const s=since(t,1);if(s>0){['wrong','lost','changed'].forEach((w,i)=>{const kk=pop(kw(t,w));const X=W/2+(i-1)*290;if(kk>0){ic(i==1?'doc':'warn',X,CY+300,0.7*kk,i==1?{}:{acc:RED});label(w,X,CY+420,36,RED,kk)}})}};
S.shared=(p,lt,d,t)=>T.net(p,lt,t,{icons:['chip','chip','chip','chip','chip','chip'],center:'book',connectAt:0.45});
S.blocks=(p,lt,d,t)=>{chainRow(lt,t,{links:i=>eio(cl((since(t,1)-0.6-i*0.4)/0.5))});
 const k=fin(kw(t,'fingerprint'));txt('each page holds a fingerprint',W/2,CY+200,'italic 44px IMI',INK,'center',k);txt('of the one before',W/2,CY+260,'italic 44px IMI',SAF,'center',k)};
S.tamper=(p,lt,d,t)=>{const bk=cl(kw(t,'changes.')/0.4),br=cl(kw(t,'breaks,')/0.5);
 chainRow(9,t,{instant:true,links:()=>1,bad:1,badK:Math.max(bk>0?0.34:0,br),fp:['#a1f',bk>0?'#Z9?':'#7c2','#e09','#4b8']});
 if(bk>0){ic('warn',W/2-115,CY-250,0.6*pop(kw(t,'changes.')),{acc:RED})}
 const dk=pop(kw(t,'disagrees.')+0.3);if(dk>0){[[-300,'#a1f'],[0,'#a1f'],[300,'#a1f']].forEach(([dx],i)=>{const X=W/2+dx,Y=CY+300;x.save();x.translate(X,Y);x.scale(dk,dk);rr(-110,-70,220,140,18);x.fillStyle='#FBF6EC';x.fill();L(4,INK);x.stroke();ic('book',0,0,0.45);x.restore();ic('cross',X+90,Y-60,0.32*dk)});label('every other copy disagrees',W/2,CY+440,40,RED,dk)}};
S.agree=(p,lt,d,t)=>{T.net(p,lt,t,{icons:['chip','chip','chip','chip','chip'],center:'check',connectAt:0.12});
 const k=fin(kw(t,'No'));txt('no single keeper decides',W/2,CY+520,'italic 46px IMI',SAF,'center',k)};
S.number=(p,lt,d,t)=>{const k=pop(lt-0.05);if(k>0)ic('clock',W/2,CY-260,1.5*k);const k2=fin(kw(t,'ten'));txt('~10 min',W/2,CY+10,'170px IXB',SAF,'center',k2);txt('a new block, since',W/2,CY+140,'italic 52px IMI',INK,'center',fin(kw(t,'since')));txt('January 2009',W/2,CY+220,'64px IXB',INK,'center',fin(kw(t,'two')));
 txt('no central keeper',W/2,CY+330,'40px ISB',INK,'center',0.8*fin(since(t,1)))};
S.catch=(p,lt,d,t)=>{const k=pop(lt-0.1);if(k>0)ic('doc',W/2,CY-230,1.4*k);txt('THE CATCH',W/2,CY+0,'64px IXB',SAF,'center',fin(lt-0.2));txt('it proves what was written,',W/2,CY+100,'44px ISB',INK,'center',fin(kw(t,'proves')));txt('not that it was true',W/2,CY+160,'44px ISB',INK,'center',fin(kw(t,'written.')+0.4));
 const k3=fin(kw(t,'lie,'));txt('a lie stays a lie',W/2,CY+300,'italic 56px IMI',RED,'center',k3);txt('(just well recorded)',W/2,CY+370,'italic 38px IMI',MUTE,'center',k3)};
S.takeaway=(p,lt,d,t)=>T.vs(p,lt,t,{l:{ic:'person',t:'makes people honest'},r:{ic:'lock',t:'hard to quietly change'},at:'makes',bad:'l',badAt:'honest.',good:'r',goodAt:'change.'});
S.close=(p,lt,d,t)=>T.net(p,lt,t,{icons:P6,center:'book',connectAt:0.1});
