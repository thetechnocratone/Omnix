// The Brief #5 — digital dollars inside phone wallets
function phoneGrid(lt,n,glow){for(let i=0;i<n;i++){const c=i%8,r=(i/8)|0;const X=150+c*112,Y=CY-420+r*170;const k=pop(lt-0.02*i);if(k<=0)continue;ic('phone',X,Y,0.42*k,{fill:(glow&&((i*7)%5==0))?MAR:LF})}}
S.phones=(p,lt,d,t)=>{phoneGrid(lt,40,kw(t,'dollar.')>0);const k=fin(kw(t,'million')-0.2);if(k>0){x.save();x.globalAlpha*=k;rr(W/2-330,CY+430,660,230,40);x.fillStyle='rgba(247,239,225,.96)';x.fill();x.restore();txt('82M',W/2,CY+520,'150px IXB',SAF,'center',k);txt('US Galaxy devices',W/2,CY+610,'italic 40px IMI',INK,'center',k)}};
S.wallet=(p,lt,d,t)=>{const k=pop(lt);ic('phone',W/2-280,CY-60,1.7*k);ic('wallet',W/2-280,CY-90,0.55*k);
 ic('globe',W/2+260,CY-60,1.5*pop(lt-0.4),{fill:'#FFF8EC'});
 const f=eio(cl((kw(t,'borders,')+0.4)/1.4));if(f>0){const X=W/2-280+(540)*f,Y=CY-60-Math.sin(f*Math.PI)*300;ic('coin',X,Y,0.7,{sym:'$'});}
 txt('USDC',W/2,CY+250,'90px IXB',SAF,'center',fin(kw(t,'USDC,')));txt('a dollar stablecoin',W/2,CY+330,'italic 42px IMI',INK,'center',fin(kw(t,'stablecoin,')));
 const s=since(t,1);if(s>0){const kk=pop(s);x.save();x.translate(W/2,CY+470);x.scale(kk,kk);rr(-300,-50,600,100,50);x.fillStyle=INK;x.fill();txt('from late October',0,2,'38px IXB','#fff');x.restore()}};
S.hidden=(p,lt,d,t)=>{const peel=eio(cl((kw(t,'Solana')+0.2)/1));// app layer lifts to reveal chain underneath
 for(let i=0;i<5;i++){const X=W/2-320+i*160;const k=pop(lt-0.1-i*0.1);if(k<=0)continue;ic('block',X,CY+80,0.8*k);if(i)line(X-160+60,CY+80,X-60,CY+80)}
 L(6,INK);x.save();x.translate(0,-380*peel);shadow(1);rr(W/2-300,CY-170,600,500,40);x.fillStyle='#FBF6EC';x.fill();shadow(0);x.stroke();ic('wallet',W/2,CY+40,1.1);txt('Pay',W/2,CY+190,'44px IXB',INK);x.restore();
 if(peel>0.5)txt('blockchain, out of sight',W/2,CY+260,'italic 42px IMI',SAF,'center',fin(kw(t,'won’t')+0.2)+fin(lt-2)*0.2);
 const r=since(t,1);if(r>0){const k=pop(r);x.save();x.translate(W/2,CY+470);x.scale(k,k);ic('note',-250,0,0.8);L(8,SAF);line(-120,-15,110,-15);line(-110,15,120,15);x.fillStyle=SAF;x.beginPath();x.moveTo(130,-15);x.lineTo(105,-30);x.lineTo(105,0);x.fill();x.beginPath();x.moveTo(-130,15);x.lineTo(-105,0);x.lineTo(-105,30);x.fill();ic('coin',250,0,0.7);x.restore()}};
S.shift=(p,lt,d,t)=>T.vs(p,lt,t,{l:{ic:'phone',t:'an app you already use'},r:{ic:'box',t:'a new app to learn'},at:'not',good:'l',goodAt:'already',bad:'r',badAt:'learn.'});
S.caveat=(p,lt,d,t)=>T.list(p,lt,t,{gap:250,items:[{ic:'coin',l:'Transfer fees: not disclosed',at:'cost,'},{ic:'key',l:'Who holds the keys: not disclosed',at:'keys.'},{ic:'globe',l:'Other countries: only where rules allow',part:1}]});
S.takeaway=(p,lt,d,t)=>{const k=pop(lt);ic('phone',W/2,CY-120,2.2*k);const a=fin(kw(t,'never'));if(a>0){x.save();x.globalAlpha*=a*0.9;ic('block',W/2,CY-130,0.55);x.restore();txt('?',W/2+130,CY-330,'110px IXB',SAF,'center',a)}
 txt('users who never',W/2,CY+300,'64px IXB',INK,'center',fin(kw(t,'never')+0.1));txt('see the chain',W/2,CY+385,'64px IXB',SAF,'center',fin(kw(t,'know')))};
S.close=(p,lt,d,t)=>{const a=fin(lt);txt('82M',W/2,CY-200,'210px IXB',SAF,'center',a);txt('phones',W/2,CY-60,'italic 54px IMI',INK,'center',a);
 const b=fin(kw(t,'Zero')+0.1);txt('0',W/2,CY+170,'210px IXB',INK,'center',b);txt('new apps',W/2,CY+310,'italic 54px IMI',INK,'center',b)};
