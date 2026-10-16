// The Brief #7 — AI agents now spend 18 minutes after their wallets are funded (Chainalysis, x402)
// --- custom drawings (ours; generic shapes, no real logos or brands)
function stopwatch(X,Y,s,e,col){// dial with a saffron sweep (e = 0..1 of the dial filled)
 x.save();x.translate(X,Y);x.scale(s,s);L(10,INK);rr(-26,-178,52,34,10);x.fillStyle=INK;x.fill();line(0,-150,0,-138);
 circle(0,0,140,INK,10,'#FBF6EC');if(e>0){x.beginPath();x.moveTo(0,0);x.arc(0,0,118,-Math.PI/2,-Math.PI/2+e*2*Math.PI);x.closePath();x.fillStyle=col||MAR;x.fill()}
 L(6,INK);for(let i=0;i<12;i++){const a=i*Math.PI/6;line(Math.cos(a)*112,Math.sin(a)*112,Math.cos(a)*128,Math.sin(a)*128)}
 const a=-Math.PI/2+e*2*Math.PI;L(9,INK);line(0,0,Math.cos(a)*100,Math.sin(a)*100);circle(0,0,12,null,0,SAF);x.restore()}
function coinS(X,Y,s,a){if(s<=0)return;x.save();x.globalAlpha*=a==null?1:a;x.translate(X,Y);x.scale(s,s);circle(0,0,30,INK,6,SAF);circle(0,0,19,MAR,4,null);txt('$',0,2,'bold 28px IXB',INK);x.restore()}
function agent(X,Y,s,arm){// our own small robot "agent" (generic)
 x.save();x.translate(X,Y);x.scale(s,s);L(8,INK);rr(-62,-150,124,96,30);x.fillStyle='#FBF6EC';x.fill();x.stroke();
 rr(-42,-128,84,40,14);x.fillStyle=INK;x.fill();circle(-18,-108,8,null,0,SAF);circle(18,-108,8,null,0,SAF);line(0,-150,0,-172);circle(0,-180,9,INK,6,SAF);
 rr(-70,-40,140,130,30);x.fillStyle=LF;x.fill();x.stroke();circle(0,20,16,null,0,SAF);
 line(-70,-20,-104,50);const a=-0.6-arm*0.9;const ex=70+Math.cos(a)*90,ey=-20+Math.sin(a)*90;line(70,-20,ex,ey);circle(ex,ey,11,INK,6,LF);x.restore()}
function walletW(X,Y,s,open){x.save();x.translate(X,Y);x.scale(s,s);L(8,INK);rr(-110,-70,220,150,22);x.fillStyle=LF;x.fill();x.stroke();
 rr(30,-30,95,62,14);x.fillStyle=SAF;x.fill();x.stroke();circle(62,1,10,null,0,'#fff');
 x.beginPath();x.moveTo(-95,-70);x.lineTo(40,-112-12*(open||0));x.lineTo(70,-70);x.stroke();x.restore()}
function stall(X,Y,s,a){// a small market stall with a saffron awning and a mango-leaf toran
 x.save();x.globalAlpha*=a==null?1:a;x.translate(X,Y);x.scale(s,s);L(8,INK);
 rr(-200,-40,400,230,14);x.fillStyle='#FBF6EC';x.fill();x.stroke();rr(-170,-10,340,70,10);x.fillStyle=LF;x.fill();x.stroke();
 for(let i=0;i<6;i++){x.beginPath();x.moveTo(-230+i*76.6,-150);x.lineTo(-230+(i+1)*76.6,-150);x.lineTo(-230+(i+1)*76.6,-80);x.quadraticCurveTo(-230+(i+0.5)*76.6,-40,-230+i*76.6,-80);x.closePath();x.fillStyle=i%2?'#FBF6EC':SAF;x.fill();x.stroke()}
 line(-230,-150,230,-150);line(-200,-80,-200,-40);line(200,-80,200,-40);
 for(let i=0;i<7;i++){const lx=-150+i*50;x.save();x.translate(lx,-135);x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(14,22,0,44);x.quadraticCurveTo(-14,22,0,0);x.fillStyle=GREEN;x.fill();x.lineWidth=3;x.stroke();x.restore()}
 x.restore()}
function sunRays(X,Y,r,g,rot){if(g<=0)return;x.save();x.translate(X,Y);x.globalAlpha*=0.5*g;L(10,MAR);for(let i=0;i<16;i++){const a=i*Math.PI/8+rot;line(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*(r+60*g),Math.sin(a)*(r+60*g))}x.restore()}

// 1. hook: "18 minutes" — the dial sweeps; a funded wallet hands a coin to an agent
S.hook=(p,lt,d,t)=>{const k=pop(lt);sunRays(W/2,CY-330,190,fin(lt-0.2),lt*0.1);
 stopwatch(W/2,CY-330,1.15*k,cl(lt/1.3)*0.3);
 txt('18',W/2-60,CY-10+40,'200px IXB',SAF,'center',fin(kw(t,'Eighteen')));txt('minutes',W/2+190,CY+70,'italic 60px IMI',INK,'center',fin(kw(t,'minutes.')));
 const w=since(t,1);const kw2=pop(w);if(kw2>0){walletW(W/2-250,CY+330,0.95*kw2,0);label('funded',W/2-250,CY+470,36,INK,kw2)}
 const ka=pop(kw(t,'agent'));if(ka>0){agent(W/2+260,CY+390,0.9*ka,0.5)}
 const sp=kw(t,'spends');const u=cl(sp/0.9);if(u>0&&u<1){coinS(W/2-170+(420)*eio(u),CY+300-90*Math.sin(Math.PI*u),1.1)}
 if(u>=1){coinS(W/2+330,CY+330,1.1);label('first payment',W/2+260,CY+520,36,SAF,fin(sp-0.9))}
 if(sp>0&&sp<99){L(6,MUTE);x.setLineDash([12,12]);x.beginPath();x.moveTo(W/2-150,CY+300);x.quadraticCurveTo(W/2+40,CY+130,W/2+230,CY+300);x.stroke();x.setLineDash([])}};

// 2. count: 138 million payments, a field of tiny coins filling up
S.count=(p,lt,d,t)=>{const r=rng(5);const n=Math.floor(200*eo(cl(lt/4)));
 for(let i=0;i<200;i++){const c=i%20,rw=(i/20)|0;if(i>=n)break;const X=W/2-475+c*50,Y=CY+110+rw*40;circle(X,Y,15,INK,4,(r()<0.12)?SAF:MAR)}
 const k=fin(kw(t,'138'));const v=Math.round(138*eo(cl((kw(t,'138'))/1.4)));txt((k>0?v:0)+'',W/2,CY-330,'210px IXB',SAF,'center',k);
 txt('million',W/2,CY-185,'italic 64px IMI',INK,'center',fin(kw(t,'million')));
 label('payments made by AI agents',W/2,CY-95,40,INK,fin(kw(t,'AI-agent')));
 const kx=pop(kw(t,'x402,'));if(kx>0){x.save();x.translate(W/2,CY+20);x.scale(kx,kx);rr(-340,-46,680,92,46);x.fillStyle=INK;x.fill();txt('on x402 · a Coinbase-started standard',0,2,'32px IXB','#fff');x.restore()}
 txt('Chainalysis',W/2,CY-520,'48px ISB',INK,'center',0.85*fin(lt-0.1))};

// 3. wallet: a developer loads stablecoins; the agent pays with no human sign-off
S.wallet=(p,lt,d,t)=>{const k=pop(lt);ic('person',W/2-330,CY-330,1.05*k);label('developer',W/2-330,CY-200,34,INK,k);
 walletW(W/2+120,CY-300,0.9*k,0);
 const s=kw(t,'stablecoins,');for(let i=0;i<3;i++){const u=cl((s-i*0.25)/0.6);if(u>0&&u<1)coinS(W/2-230+350*eio(u),CY-420+60*u,0.9);}
 label('stablecoins (usually USDC)',W/2+120,CY-160,36,SAF,fin(s));
 const q=since(t,1);const ka=pop(q);if(ka>0){agent(W/2-200,CY+420,1*ka,0.5+0.3*Math.sin(q*3));}
 for(let i=0;i<3;i++){const u=cl((q-0.4-i*0.5)/0.7);if(u>0&&u<1)coinS(W/2-110+380*eio(u),CY+330-90*Math.sin(Math.PI*u),0.85)}
 const kc=pop(q-0.3);if(kc>0){ic('box',W/2+310,CY+340,0.9*kc)}
 const kh=pop(kw(t,'human'));if(kh>0){x.save();x.globalAlpha*=0.55;ic('hand',W/2+250,CY+70,0.75*kh,{fill:'#E7B98F'});x.restore();L(12,RED);x.save();x.globalAlpha*=kh;line(W/2+175,CY+150,W/2+325,CY-10);x.restore();label('no human sign-off',W/2+250,CY+180,34,INK,kh)}};

// 4. buys: three things agents pay for
S.buys=(p,lt,d,t)=>{txt('What agents buy',W/2,CY-420,'54px IXB',INK,'center',fin(lt-0.1));
 T.grid(p,lt,t,{tile:true,cols:3,gx:320,s:0.75,items:[{ic:'chip',l:'computing',at:'computing'},{ic:'globe',l:'live web data',at:'web'},{ic:'magnifier',l:'code checks',at:'code'}]});
 x.save();x.globalAlpha*=0.35*fin(lt-0.6);ic('leaf',W/2-420,CY+420,0.45);ic('leaf',W/2+420,CY+420,0.45,{rot:1.6});x.restore()};

// 5. small: over 87% of payments are under 10 cents
S.small=(p,lt,d,t)=>{const k=fin(kw(t,'87'));txt('87%',W/2,CY-300,'220px IXB',SAF,'center',k);txt('of payments',W/2,CY-150,'italic 56px IMI',INK,'center',k);
 const kc=pop(kw(t,'ten'));if(kc>0){x.save();x.translate(W/2,CY+170);x.scale(kc,kc);circle(0,0,170,INK,10,'#FBF6EC');circle(0,0,135,MAR,6,null);txt('under',0,-55,'44px ISB',INK);txt('10¢',0,25,'120px IXB',INK);x.restore()}
 for(let i=0;i<10;i++){const kk=pop(kw(t,'cents.')-i*0.08);if(kk>0)coinS(W/2-405+i*90,CY+470,0.75*kk)}
 txt('tiny, frequent payments',W/2,CY+580,'italic 42px IMI',INK,'center',0.8*fin(kw(t,'cents.')+0.6))};

// 6. caveat
S.caveat=(p,lt,d,t)=>{txt('The catch',W/2,CY-370,'60px IXB',RED,'center',fin(lt));
 T.list(p,lt,t,{gap:260,dy:60,items:[{ic:'coin',l:'Dollar amounts are still tiny',at:'tiny,'},{ic:'magnifier',l:'Counting payments ≠ proving real demand',at:'count'}]})};

// 7. takeaway: a machine at the counter, paying a few cents
S.takeaway=(p,lt,d,t)=>{const k=fin(lt);stall(W/2+120,CY-150,1.05,k);txt('For builders',W/2,CY-520,'48px ISB',INK,'center',fin(lt-0.1));
 const ka=pop(kw(t,'machine'));if(ka>0)agent(W/2-300,CY+230,1.1*ka,0.6+0.3*Math.sin(lt*3));
 const c=kw(t,'cents,');const u=cl(c/0.7);if(u>0){coinS(W/2-170+200*eio(u),CY+40-90*Math.sin(Math.PI*u),1);label('a few cents',W/2-300,CY+420,40,SAF,fin(c))}
 const kc=pop(kw(t,'customer.'));if(kc>0){x.save();x.translate(W/2+210,CY+330);x.scale(kc,kc);rr(-200,-48,400,96,48);x.fillStyle=INK;x.fill();txt('= your customer',0,2,'36px IXB','#fff');x.restore()}};

// 8. close: callback 73 days -> 18 minutes
S.close=(p,lt,d,t)=>{const a=fin(lt);ic('calendar',W/2-260,CY-330,1.0*pop(lt));txt('73',W/2+90,CY-350,'170px IXB',MUTE,'center',a);txt('days',W/2+90,CY-240,'italic 52px IMI',INK,'center',a);
 const st=fin(kw(t,'days.'));if(st>0){L(12,RED);x.save();x.globalAlpha*=st;line(W/2-30,CY-300,W/2-30+260*st,CY-400);x.restore()}
 const b=fin(kw(t,'eighteen'));stopwatch(W/2-260,CY+70,0.62*pop(kw(t,'Now:')),0.3);txt('18',W/2+90,CY+60,'210px IXB',SAF,'center',b);txt('minutes',W/2+90,CY+190,'italic 56px IMI',INK,'center',fin(kw(t,'minutes.')));
 x.save();x.globalAlpha*=0.9*b;x.drawImage(IMG('lotus'),W/2-170,CY+330,340,183);x.restore()};
