// Build Together #4 — Metro & infrastructure delays (bright theme, uses tools/brief_reel/lib.js)
function track(y){L(8,INK);line(60,y,W-60,y);line(60,y+40,W-60,y+40);for(let i=0;i<16;i++){L(6,'#8E8070');line(80+i*60,y-10,80+i*60,y+50)}}
S.promise=(p,lt,d,t)=>{track(CY-80);const k=pop(lt-0.1);if(k>0)ic('train',W/2-260,CY-200,1.1*k);
 const a=fin(kw(t,'twenty.'));x.save();x.globalAlpha*=a;rr(W/2+40,CY-360,340,160,20);x.fillStyle='#FBF6EC';x.fill();L(4,INK);x.stroke();x.restore();txt('promised',W/2+210,CY-320,'30px ISB',INK,'center',a);txt('2020',W/2+210,CY-255,'70px IXB',SAF,'center',a);
 const b=pop(kw(t,'twenty-six,'));if(b>0){L(10,RED);line(W/2+60,CY-280,W/2+360,CY-280)}txt('2026',W/2,CY+170,'170px IXB',INK,'center',fin(kw(t,'twenty-six,')));txt('still no passengers',W/2,CY+300,'italic 52px IMI',RED,'center',fin(kw(t,'still')))};
S.barricade=(p,lt,d,t)=>{for(let i=0;i<7;i++){const k=pop(lt-0.1-i*0.12);if(k<=0)continue;x.save();x.translate(110+i*143,CY-40);x.scale(k,k);rr(-60,-90,120,180,8);x.fillStyle='#FBF6EC';x.fill();L(5,INK);x.stroke();for(let s=0;s<3;s++){x.fillStyle=SAF;x.fillRect(-60,-70+s*55,120,22)}x.restore()}
 const r=rng(2);for(let i=0;i<30;i++){const q=(lt*0.25+r())%1;circle(r()*W,CY+200-q*300,6+r()*10,null,0,`rgba(185,168,142,${0.6*(1-q)})`)}
 ic('cone',W/2-250,CY+260,0.9);ic('cone',W/2+250,CY+260,0.9);txt('for years',W/2,CY+300,'italic 56px IMI',RED,'center',fin(kw(t,'years.')))};
S.silos=(p,lt,d,t)=>T.net(p,lt,t,{icons:['map','doc','crane','chip','coin','train'],labels:['land','permits','contractors','utilities','funding','trains'],connectAt:2});
S.world=(p,lt,d,t)=>{T.world(p,lt,t,{lines:[['9 in 10',SAF,130,'nine'],['big projects run over budget or time',INK,40,'budget,']]});txt("it isn't just Bengaluru",W/2,CY-470,'italic 46px IMI',INK,'center',fin(lt-0.2))};
S.connect=(p,lt,d,t)=>T.net(p,lt,t,{icons:['map','doc','crane','chip','coin','train'],labels:['land','permits','contractors','utilities','funding','trains'],connectAt:0.15,center:'calendar'});
S.vision=(p,lt,d,t)=>T.list(p,lt,t,{items:[{ic:'calendar',l:'One live schedule every contractor updates',part:0},{ic:'warn',l:'Delays flagged the day they start',part:1},{ic:'eye',l:'Progress and spending open to check',part:2}]});
S.stack=(p,lt,d,t)=>T.stack(p,lt,t,{which:[0,1],parts:[1,1],verbs:['plans ahead','an honest record']});
S.hands=(p,lt,d,t)=>T.hands(p,lt,t,{n:8,center:'train',words:['engineers · workers · planners · citizens','and the people who run our cities']});
S.orbits=(p,lt,d,t)=>{T.orbits(p,lt,t,{});txt('each one moves in step',W/2,CY+560,'italic 46px IMI',INK,'center',fin(kw(t,'step')))};
S.close=(p,lt,d,t)=>{T.sunrise(p,lt,t,{});txt('promised for 2020',W/2,CY-330,'60px IXB',INK,'center',fin(lt-0.1));txt('a promise we can all watch being kept',W/2,CY-240,'italic 46px IMI',SAF,'center',fin(kw(t,'watch')))};
