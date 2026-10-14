// Build Together #3 — Roads & potholes (bright theme, uses tools/brief_reel/lib.js)
function road(y,h){x.fillStyle='#8E8070';x.fillRect(0,y,W,h);x.strokeStyle='#F7EFE1';x.lineWidth=8;x.setLineDash([60,40]);line(0,y+h/2,W,y+h/2);x.setLineDash([])}
S.toll=(p,lt,d,t)=>{road(CY-420,260);ic('pothole',W/2+120,CY-290,1.2*pop(lt-0.1));const k=fin(kw(t,'two'));txt('2,385',W/2,CY+40,'190px IXB',RED,'center',k);txt('lives lost to potholes in India, 2024',W/2,CY+170,'italic 44px IMI',INK,'center',fin(kw(t,'killed')))};
S.perday=(p,lt,d,t)=>{for(let i=0;i<6;i++){const k=pop(lt-0.2-i*0.25);if(k>0)ic('person',W/2+(i-2.5)*150,CY-120,0.85*k,{fill:i%2?MAR:LF})}const k=pop(lt-1.9);if(k>0)txt('+',W/2+480,CY-120,'80px IXB',SAF,'center',k);
 txt('6+ people',W/2,CY+130,'120px IXB',SAF,'center',fin(kw(t,'six')));txt('every single day',W/2,CY+240,'italic 50px IMI',INK,'center',fin(kw(t,'every')))};
S.jolt=(p,lt,d,t)=>{const sh=kw(t,'jolt.');const j=sh>0&&sh<0.5?Math.sin(sh*60)*18*(1-sh*2):0;road(CY-80,260);ic('pothole',W/2,CY+50,1.1);x.save();x.translate(Math.sin(lt*0.6)*40+j,j*0.6);
 const sw=kw(t,'swerve.');const sx=sw>0?Math.sin(cl(sw/0.8)*Math.PI)*-160:0;x.translate(sx,0);x.translate(W/2-200,CY-30);rr(-50,-100,100,160,30);x.fillStyle=SAF;x.fill();L(5,INK);x.stroke();circle(0,-130,36,INK,5,LF);x.restore();
 ['jolt.','swerve.','breath.'].forEach((w,i)=>txt(['the jolt','the swerve','the held breath'][i],W/2,CY+330+i*70,'italic 48px IMI',i==2?RED:INK,'center',fin(kw(t,w))))};
S.silos=(p,lt,d,t)=>T.net(p,lt,t,{icons:['cone','truck','crane','calendar','person'],labels:['rain','heavy loads','rushed repairs','dug up again','crews'],connectAt:2});
S.world=(p,lt,d,t)=>T.world(p,lt,t,{lines:[["it isn't just Bengaluru",INK,52],['water · weight · time',SAF,64,'water,']]});
S.connect=(p,lt,d,t)=>{road(CY-60,260);const k=pop(kw(t,'report'));ic('pothole',W/2,CY+70,0.8);if(k>0){for(let r=0;r<3;r++){const q=((lt*0.7+r/3)%1);circle(W/2,CY+70,90+q*260,`rgba(241,150,17,${0.7*(1-q)})`,6)}ic('phone',W/2+300,CY-260,0.9*k)}txt('roads that report their own damage',W/2,CY+400,'italic 46px IMI',INK,'center',fin(kw(t,'damage,')))};
S.vision=(p,lt,d,t)=>T.list(p,lt,t,{items:[{ic:'magnifier',l:'Cracks spotted early',part:0},{ic:'calendar',l:'Repairs planned by need, not noise',part:1},{ic:'check',l:'Every job, cost and quality open to check',part:2}]});
S.stack=(p,lt,d,t)=>T.stack(p,lt,t,{parts:[0,1,2],verbs:['helps plan it','keeps it honest','heavy, risky work']});
S.hands=(p,lt,d,t)=>T.hands(p,lt,t,{n:8,center:'map',words:['engineers · contractors · citizens','and the people who run our cities']});
S.lift=(p,lt,d,t)=>{const n=24,k=eio(cl(kw(t,'thousand')/1.2));road(CY-60-k*120,140);for(let i=0;i<n;i++){const X=90+i*(W-180)/(n-1);const e=pop(kw(t,'thousand')-i*0.03);if(e>0){x.save();x.translate(X,CY+120-k*120);x.scale(0.42*e,0.42*e);ic('hand',0,0,1,{fill:['#F3D2A8','#C99B6E','#8D5A3B','#E7B98F'][i%4]});x.restore()}}
 const one=pop(lt-0.1);if(kw(t,'thousand')<0&&one>0){x.save();x.translate(W/2,CY+120);x.scale(0.6,0.6);ic('hand',0,0,1);x.restore()}txt('a thousand hands can',W/2,CY+380,'italic 52px IMI',SAF,'center',fin(kw(t,'hands')))};
S.close=(p,lt,d,t)=>{T.sunrise(p,lt,t,{});txt('6 lives a day',W/2,CY-330,'64px IXB',INK,'center',fin(lt-0.1));txt('roads that bring everyone home',W/2,CY-240,'italic 50px IMI',SAF,'center',fin(kw(t,'everyone')))};
