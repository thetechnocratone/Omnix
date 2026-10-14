// Build Together #2 — Waste (bright theme, uses tools/brief_reel/lib.js)
function pile(X,Y,s,k){x.save();x.translate(X,Y);x.scale(s*k,s*k);const r=rng(3);for(let i=0;i<26;i++){const a=r()*Math.PI,rad=r()*150;const px=Math.cos(a)*rad,py=-Math.sin(a)*rad*0.55;const c=[SAF,'#B9A88E','#6FA3B8',MAR,'#8E8070',LF][i%6];rr(px-28,py-22,56,44,10);x.fillStyle=c;x.fill();L(4,INK);x.stroke()}x.restore()}
S.pile=(p,lt,d,t)=>{pile(W/2,CY-60,2.2,pop(lt-0.1));const k=fin(kw(t,'six'));txt('6,000+',W/2,CY+200,'170px IXB',SAF,'center',k);txt('tonnes of waste, every day',W/2,CY+320,'italic 50px IMI',INK,'center',fin(kw(t,'tonnes')))};
S.elephants=(p,lt,d,t)=>{const n=40;for(let i=0;i<n;i++){const c=i%8,r=(i/8)|0;const k=pop(lt-0.1-i*0.05);if(k<=0)continue;ic('elephant',W/2+(c-3.5)*120,CY-330+r*130,0.5*k)}
 txt('heavier than 1,000 elephants',W/2,CY+380,'52px IXB',INK,'center',fin(kw(t,'elephants.')));txt('every single day',W/2,CY+460,'italic 44px IMI',SAF,'center',fin(kw(t,'Every')))};
S.footpath=(p,lt,d,t)=>{x.fillStyle='#DCCDB2';x.fillRect(0,CY+60,W,90);L(5,INK);line(0,CY+60,W,CY+60);for(let i=0;i<10;i++)line(i*120,CY+60,i*120,CY+150);
 ic('tree',W/2-330,CY-120,1.3);ic('person',W/2+330,CY-60,0.9);['footpaths','corners','plots'].forEach((w,i)=>{const k=pop(kw(t,w)+0.1);if(k>0)pile(W/2-200+i*200,CY+55,0.6,k)});
 txt('where we walk',W/2,CY+330,'italic 56px IMI',RED,'center',fin(kw(t,'walk:')))};
S.silos=(p,lt,d,t)=>T.net(p,lt,t,{icons:['building','person','truck','box','bin'],labels:['homes','collectors','trucks','sorting','recyclers'],connectAt:2});
S.world=(p,lt,d,t)=>{T.bars(p,lt,t,{bars:[{v:2.01,top:'2.0B t',l:'today, per year',at:'two'},{v:3.4,top:'3.4B t',l:'by 2050',at:'three',col:RED}]});txt("this isn't just Bengaluru",W/2,CY-420,'italic 48px IMI',INK,'center',fin(lt-0.2));txt('World Bank estimate',W/2,CY+420,'30px ISB',MUTE,'center',fin(kw(t,'fifty.')))};
S.connect=(p,lt,d,t)=>T.net(p,lt,t,{icons:['building','person','truck','box','bin'],labels:['homes','collectors','trucks','sorting','recyclers'],connectAt:0.15,center:'eye'});
S.vision=(p,lt,d,t)=>T.list(p,lt,t,{items:[{ic:'map',l:'Pickups planned around each street',part:0},{ic:'truck',l:'Every load tracked, doorstep to recycler',part:1},{ic:'hand',l:'Collectors paid fairly, on time',part:2}]});
S.stack=(p,lt,d,t)=>T.stack(p,lt,t,{parts:[0,1,2],verbs:['plans it','keeps the record','dirty, risky work']});
S.hands=(p,lt,d,t)=>T.hands(p,lt,t,{n:8,center:'leaf',words:['residents · workers · recyclers','and the people who run our cities']});
S.cycle=(p,lt,d,t)=>{const k=eo(lt/1);x.save();x.translate(W/2,CY-60);x.rotate(lt*0.4);for(let i=0;i<3;i++){x.save();x.rotate(i*2.094);L(16,i==1?SAF:'#5E8C4E');x.globalAlpha*=k;x.beginPath();x.arc(0,0,230,-0.2,1.6);x.stroke();x.fillStyle=i==1?SAF:'#5E8C4E';x.beginPath();x.moveTo(230*Math.cos(1.75),230*Math.sin(1.75));x.lineTo(200*Math.cos(1.5),200*Math.sin(1.5));x.lineTo(262*Math.cos(1.5),262*Math.sin(1.5));x.fill();x.restore()}x.restore();
 ic('leaf',W/2,CY-60,1.1*pop(lt-0.3));txt('in nature, there is no waste',W/2,CY+300,'italic 52px IMI',INK,'center',fin(kw(t,'nature,')))};
S.close=(p,lt,d,t)=>{T.sunrise(p,lt,t,{});txt('6,000 tonnes a day',W/2,CY-330,'64px IXB',INK,'center',fin(lt-0.1));txt('back into a cycle',W/2,CY-240,'italic 54px IMI',SAF,'center',fin(kw(t,'cycle.')))};
