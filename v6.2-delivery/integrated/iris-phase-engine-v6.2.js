/* ═══════════════════════════════════════════════════════════════════════════
   IrisPhaseEngine — V6.2
   One connected material surface (an annulus with stable material coordinates)
   rendered on its own Canvas2D canvas. Pure function of the plan it is given:
   nothing in here reads the page, scrolls, or keeps its own clock.

   States: 0 AWARE · 1 DNA · 2 BLOOD · 3 SKIN · 4 WORK APERTURE · 5 REVEAL(=AWARE)
   The body is described by two radial fields on a fixed spoke set:
     Ro(θ) outer boundary, Ri(θ) inner boundary (pupil → seam → aperture),
   plus a lobe displacement field. Interpolating the fields keeps the surface
   connected and the material adjacency constant (spoke i is always spoke i).
   ═══════════════════════════════════════════════════════════════════════════ */
(function(root){
'use strict';
var NS=180;                 /* contour spokes */
var NF=96;                  /* fibre spokes (material columns) */
var TAU=6.283185307;
function clamp(v,a,b){ return v<a?a:v>b?b:v; }
function lerp(a,b,t){ return a+(b-a)*t; }
function sstep(a,b,x){ var t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); }
function smootherstep01(t){ t=clamp(t,0,1); return t*t*t*(t*(t*6-15)+10); }
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function wrap(d){ return ((d+Math.PI*3)%TAU)-Math.PI; }
function smax(a,b,k){ var m=Math.max(a,b); return m + Math.log(Math.exp((a-m)*k)+Math.exp((b-m)*k))/k; }

var E={
  cv:null, ctx:null, W:0, H:0, PX:1, rm:false, ok:false,
  seed:0xB10DB0D1, scarAngle:4.1, lobeAxis:0, trib:null, noise:null, fib:null,
  Ro:new Float32Array(NS), Ri:new Float32Array(NS), RoA:new Float32Array(NS), RoB:new Float32Array(NS), RiA:new Float32Array(NS), RiB:new Float32Array(NS),
  OX:new Float32Array(NS), OY:new Float32Array(NS), OXA:new Float32Array(NS), OYA:new Float32Array(NS), OXB:new Float32Array(NS), OYB:new Float32Array(NS),
  ptsX:new Float32Array(NS), ptsY:new Float32Array(NS), inX:new Float32Array(NS), inY:new Float32Array(NS),
  plan:null, diag:{state:'',from:0,to:0,morph:0,renderMs:0,frames:0,contourMinR:0,contourMaxR:0,landmarks:[]},
  lm:[0,15,30,45,60,75,90,105,120,135,150,165], lmBuf:new Float32Array(24), lmOut:[],
  fibreLines:[], lastPlanHash:''
};
for(var i=0;i<12;i++) E.lmOut.push({i:E.lm[i],x:0,y:0,a:0});

function seedAll(){
  var r=mulberry32(E.seed);
  E.noise=new Float32Array(NS); E.noise2=new Float32Array(NS);
  /* two low-frequency harmonics → soft organic boundary, never jagged */
  var p1=r()*TAU,p2=r()*TAU,p3=r()*TAU,p4=r()*TAU;
  for(var i=0;i<NS;i++){ var a=i/NS*TAU; E.noise[i]=Math.sin(a*2+p1)*.020+Math.sin(a*3+p2)*.014+Math.sin(a*5+p3)*.008; E.noise2[i]=Math.sin(a*3+p4)*.03+Math.sin(a*7+p1)*.012; }
  E.lobeAxis=E.scarAngle;
  /* five tributaries: angles from the scar, seeded widths/lengths (mass-compensated) */
  E.trib=[]; var base=E.scarAngle;
  for(var k=0;k<5;k++){ var ang=base + k*TAU/5 + (r()-.5)*.5; E.trib.push({a:ang, L:1.35+r()*.55, w:.22+r()*.08, ph:r()}); }
  /* material columns: stable ids, seeds, thickness */
  E.fib=[]; for(var f=0;f<NF;f++) E.fib.push({ id:f, th:f/NF*TAU+(r()-.5)*.02, seed:r(), thick:.6+r()*.9, shade:.22+r()*.22 });
}

/* ── state fields: fill Ro/Ri/OX/OY arrays for a state, in units of R ── */
function fieldAware(Ro,Ri,OX,OY){ for(var i=0;i<NS;i++){ Ro[i]=1+E.noise[i]*.8; Ri[i]=.21; OX[i]=0; OY[i]=0; } }
function fieldDNA(Ro,Ri,OX,OY,sep){  /* two organic lobes from one tissue, 58/42, wet bridge */
  var a=E.lobeAxis, ca=Math.cos(a), sa=Math.sin(a), s=sep;      /* sep in R: 0 = one disc */
  var cA=[ca*s*.42, sa*s*.42], rA=.84, cB=[-ca*s*.58, -sa*s*.58], rB=.70;
  for(var i=0;i<NS;i++){ var th=i/NS*TAU, dx=Math.cos(th), dy=Math.sin(th);
    /* ray from the origin: farthest hit on each lobe circle, soft-maxed = wet bridge */
    function hit(c,rr){ var b=dx*c[0]+dy*c[1], cc=c[0]*c[0]+c[1]*c[1]-rr*rr, disc=b*b-cc; if(disc<0) return 0; return b+Math.sqrt(disc); }
    var hA=hit(cA,rA), hB=hit(cB,rB);
    var neck=.18*(1-s*.55); var ro=smax(hA,hB,6/Math.max(.12,neck)); if(ro<.25) ro=.25+neck*.6;
    Ro[i]=ro*(1+E.noise[i]*.6);
    var side = (dx*ca+dy*sa)>0 ? 1 : -1;
    /* core stretches along the division axis */
    var along=Math.abs(dx*ca+dy*sa); Ri[i]=.21*Math.sqrt(1+s*1.4*along*along);   /* one core, stretched into a spindle — never two */
    OX[i]=0; OY[i]=0; }
}
function fieldBlood(Ro,Ri,OX,OY,t){ /* fluid body: reservoir + 5 rounded tributaries, t = tributary extension 0..1 */
  for(var i=0;i<NS;i++){ var th=i/NS*TAU; var ro=.58;
    for(var k=0;k<5;k++){ var tr=E.trib[k], d=wrap(th-tr.a)/tr.w; var bump=Math.exp(-d*d*1.2); ro+=tr.L*t*bump; }
    Ro[i]=ro*(1+E.noise2[i]*.35); Ri[i]=.12+.02*Math.sin(th*2); OX[i]=0; OY[i]=0; }
}
function fieldSkin(Ro,Ri,OX,OY){ /* tributaries lie side by side and zipper into one membrane */
  for(var i=0;i<NS;i++){ var th=i/NS*TAU; var ro=.95;
    for(var k=0;k<5;k++){ var tr=E.trib[k], d=wrap(th-tr.a)/(tr.w*2.6); ro+=.28*Math.exp(-d*d); }
    Ro[i]=ro*(1+E.noise[i]*.5); Ri[i]=.05; OX[i]=0; OY[i]=0; }
}
function fieldAperture(Ro,Ri,OX,OY,open){ /* annulus opening from the centre; open = inner radius in R */
  for(var i=0;i<NS;i++){ var n=1+E.noise2[i]*(.9-open*.05); Ri[i]=open*n; Ro[i]=(open+.55+open*.25)*n; OX[i]=0; OY[i]=0; }
}

/* ── public API ── */
var API={
  init:function(o){
    o=o||{}; E.cv=o.canvas; if(!E.cv) throw new Error('IrisPhaseEngine: canvas required');
    E.ctx=E.cv.getContext('2d',{alpha:true}); if(!E.ctx) throw new Error('IrisPhaseEngine: 2d context unavailable');
    if(o.seed) E.seed=o.seed; if(o.scarAngle!=null) E.scarAngle=o.scarAngle; E.rm=!!o.reducedMotion;
    seedAll(); E.ok=true; return API;
  },
  resize:function(v){ E.W=v.width; E.H=v.height; E.PX=v.pixelRatio||1; E.cv.width=Math.round(E.W*E.PX); E.cv.height=Math.round(E.H*E.PX); if(v.cssHeight) E.cv.style.height=v.cssHeight+'px'; },
  setReducedMotion:function(v){ E.rm=!!v; },
  destroy:function(){ E.ok=false; E.plan=null; if(E.ctx) E.ctx.clearRect(0,0,E.cv.width,E.cv.height); },
  getDiagnostics:function(){ return E.diag; },
  /* update(plan): evaluate the fields for this plan. Pure: same plan → same fields. */
  update:function(plan){
    if(!E.ok) return; E.plan=plan;
    var from=plan.fromState|0, to=plan.toState|0, m=E.rm ? (plan.morph>=.5?1:0) : plan.morph;
    var dyeA=0, dyeB=0, apA=0, apB=0;
    /* morph sub-clocks inside one morph value (serial, never parallel) */
    function fill(st, Ro,Ri,OX,OY, mm, isTo){
      switch(st){
        case 0: case 5: fieldAware(Ro,Ri,OX,OY); break;
        case 1: fieldDNA(Ro,Ri,OX,OY, 1.0); break;
        case 2: fieldBlood(Ro,Ri,OX,OY, 1.0); break;
        case 3: fieldSkin(Ro,Ri,OX,OY); break;
        case 4: fieldAperture(Ro,Ri,OX,OY, 3.2); break;
      } }
    fill(from,E.RoA,E.RiA,E.OXA,E.OYA,m,false); fill(to,E.RoB,E.RiB,E.OXB,E.OYB,m,true);
    /* special handling: DNA separation grows with the morph (wet bridge first) */
    if(to===1 && from===0) fieldDNA(E.RoB,E.RiB,E.OXB,E.OYB, smootherstep01(m));
    if(from===1 && to===2) fieldDNA(E.RoA,E.RiA,E.OXA,E.OYA, 1-smootherstep01(m)*.25);
    /* tributaries extend as the lobes liquefy; when entering SKIN they shorten and widen */
    if(to===2) fieldBlood(E.RoB,E.RiB,E.OXB,E.OYB, smootherstep01(m));
    if(from===2 && to===3) fieldBlood(E.RoA,E.RiA,E.OXA,E.OYA, 1-smootherstep01(m)*.5);
    /* aperture: the membrane spreads from the centre; the inner boundary opens past the screen */
    var screenR = Math.hypot(E.W,E.H)*.5/Math.max(1,plan.bodyRadius||1);   /* screen half-diagonal in R */
    if(to===4) fieldAperture(E.RoB,E.RiB,E.OXB,E.OYB, lerp(.05, screenR*1.08, Math.pow(smootherstep01(m),1.35)));
    if(from===4 && to===5) fieldAperture(E.RoA,E.RiA,E.OXA,E.OYA, lerp(screenR*1.08, .21, Math.pow(smootherstep01(m),.8)));
    if(from===4 && to===4) fieldAperture(E.RoA,E.RiA,E.OXA,E.OYA, screenR*1.08);
    var e=smootherstep01(m);
    /* aperture corridors: the field itself carries the progression; blend factor stays 1 toward B */
    if(to===4 || (from===4&&to===5)) e = (from===4&&to===5) ? 1 : 1;
    if(to===4){ for(var i=0;i<NS;i++){ E.Ro[i]=lerp(E.RoA[i],E.RoB[i],Math.min(1,e*1.0)); E.Ri[i]=lerp(E.RiA[i],E.RiB[i],e); } }
    else if(from===4&&to===5){ var e2=smootherstep01(m); for(var i2=0;i2<NS;i2++){ E.Ro[i2]=lerp(E.RoA[i2],E.RoB[i2],sstep(.55,1,e2)); E.Ri[i2]=lerp(E.RiA[i2],E.RiB[i2],sstep(.0,.7,e2)); } }
    else { for(var i3=0;i3<NS;i3++){ E.Ro[i3]=lerp(E.RoA[i3],E.RoB[i3],e); E.Ri[i3]=lerp(E.RiA[i3],E.RiB[i3],e); } }
    /* ruby dye progress inside BLOOD: enters with the morph, drains before SKIN */
    E.dye = (to===2) ? sstep(.35,.9,m) : (from===2&&to===3) ? 1-sstep(0,.55,m) : (from===2&&to===2?1:0);
    E.dyeHeat = (to===2) ? sstep(.35,.9,m)*(1-sstep(.9,1,m)) : (from===2&&to===3) ? (1-sstep(0,.45,m)) : (from===2&&to===2?.85:0);
    E.lobeSep = (to===1)? smootherstep01(m) : (from===1&&to===2 ? 1-smootherstep01(m)*.25 : (from===1&&to===1?1:0));
    /* ordered reconstruction inside WORK→REVEAL: stroma .45–.72, pupil .60–.80, limbus .74–.90, glint .88–1 */
    E.rec = (from===4&&to===5) ? m : -1;
    E.diag.from=from; E.diag.to=to; E.diag.morph=m; E.diag.state=from+'→'+to;
    /* contour in pixels */
    var R=plan.bodyRadius*E.PX, cx=plan.bodyX*E.PX, cy=plan.bodyY*E.PX, mn=9e9, mx=0;
    for(var j=0;j<NS;j++){ var th=j/NS*TAU, ro=E.Ro[j]*R, ri=Math.min(E.Ri[j]*R, ro*.98);
      E.ptsX[j]=cx+Math.cos(th)*ro; E.ptsY[j]=cy+Math.sin(th)*ro; E.inX[j]=cx+Math.cos(th)*ri; E.inY[j]=cy+Math.sin(th)*ri;
      if(ro<mn) mn=ro; if(ro>mx) mx=ro; }
    E.diag.contourMinR=mn/E.PX; E.diag.contourMaxR=mx/E.PX;
    for(var L=0;L<12;L++){ var k=E.lm[L]; E.lmOut[L].x=+(E.ptsX[k]/E.PX).toFixed(2); E.lmOut[L].y=+(E.ptsY[k]/E.PX).toFixed(2); E.lmOut[L].a=plan.phaseAlpha; }
    E.diag.landmarks=E.lmOut;
  },
  /* the inner contour as a path on any context (the adapter cuts the world ground with it) */
  aperturePath:function(c, scale){ scale=scale||1; c.beginPath(); for(var i=0;i<NS;i++){ var x=E.inX[i]/E.PX*scale, y=E.inY[i]/E.PX*scale; i?c.lineTo(x,y):c.moveTo(x,y); } c.closePath(); },
  outerPath:function(c, scale){ scale=scale||1; c.beginPath(); for(var i=0;i<NS;i++){ var x=E.ptsX[i]/E.PX*scale, y=E.ptsY[i]/E.PX*scale; i?c.lineTo(x,y):c.moveTo(x,y); } c.closePath(); },
  render:function(){
    if(!E.ok||!E.plan) return; var t0=performance.now(); var c=E.ctx, p=E.plan, a=clamp(p.phaseAlpha,0,1);
    c.clearRect(0,0,E.cv.width,E.cv.height); if(a<.003) { E.diag.renderMs=performance.now()-t0; return; }
    var R=p.bodyRadius*E.PX, cx=p.bodyX*E.PX, cy=p.bodyY*E.PX, sil=!!p.silhouette, PX=E.PX;
    var from=p.fromState|0, to=p.toState|0, rec=E.rec;
    c.save(); c.globalAlpha=a;
    /* 1 — the body: outer contour minus inner contour (evenodd) */
    c.beginPath(); for(var i=0;i<NS;i++){ i?c.lineTo(E.ptsX[i],E.ptsY[i]):c.moveTo(E.ptsX[i],E.ptsY[i]); } c.closePath();
    for(var j=NS-1;j>=0;j--){ j===NS-1?c.moveTo(E.inX[j],E.inY[j]):c.lineTo(E.inX[j],E.inY[j]); } c.closePath();
    if(sil){ c.fillStyle='#fff'; c.fill('evenodd'); c.restore(); E.diag.renderMs=performance.now()-t0; return; }
    var g=c.createRadialGradient(cx-R*.15,cy-R*.2,R*.1,cx,cy,Math.max(R*1.3,E.diag.contourMaxR*PX));
    var stromaGain = rec>=0 ? sstep(.45,.72,rec) : 1;
    g.addColorStop(0,'rgba(48,48,53,1)'); g.addColorStop(.55,'rgba('+Math.round(34*stromaGain+18*(1-stromaGain))+','+Math.round(34*stromaGain+18*(1-stromaGain))+','+Math.round(40*stromaGain+22*(1-stromaGain))+',1)'); g.addColorStop(1,'rgba(14,14,17,1)');
    c.fillStyle=g; c.fill('evenodd');
    /* 2 — material texture inside the surface only */
    c.save(); c.beginPath(); for(var i2=0;i2<NS;i2++){ i2?c.lineTo(E.ptsX[i2],E.ptsY[i2]):c.moveTo(E.ptsX[i2],E.ptsY[i2]); } c.closePath();
    for(var j2=NS-1;j2>=0;j2--){ j2===NS-1?c.moveTo(E.inX[j2],E.inY[j2]):c.lineTo(E.inX[j2],E.inY[j2]); } c.closePath(); c.clip('evenodd');
    var fibA = .55*stromaGain*(1-(to===4?sstep(.3,.9,E.plan.morph):0));
    if(fibA>.01){ c.lineWidth=1*PX; c.lineCap='round';
      for(var f=0;f<NF;f++){ var fb=E.fib[f], th=fb.th, k=Math.floor(th/TAU*NS)%NS, ro=Math.hypot(E.ptsX[k]-cx,E.ptsY[k]-cy), ri=Math.hypot(E.inX[k]-cx,E.inY[k]-cy);
        var bend=(fb.seed-.5)*.12*(from===2||to===2?2.2:1); c.strokeStyle='rgba(176,176,182,'+(fibA*fb.shade*1.6)+')'; c.lineWidth=fb.thick*PX;
        c.beginPath(); c.moveTo(cx+Math.cos(th)*ri*1.04, cy+Math.sin(th)*ri*1.04);
        c.quadraticCurveTo(cx+Math.cos(th+bend)*(ri+ro)*.5, cy+Math.sin(th+bend)*(ri+ro)*.5, cx+Math.cos(th)*ro*.985, cy+Math.sin(th)*ro*.985); c.stroke(); } }
    /* seams (SKIN) along the tributary angles, inside the material */
    var seam = (to===3)? sstep(.5,1,p.morph) : (from===3&&to!==4 ? 1-sstep(0,.5,p.morph) : (from===3&&to===3?1:(from===3&&to===4?1-sstep(0,.4,p.morph):0)));
    if(seam>.01){ c.lineWidth=1.2*PX; for(var s=0;s<5;s++){ var tr=E.trib[s], k2=Math.floor(((tr.a%TAU)+TAU)%TAU/TAU*NS)%NS, ro2=Math.hypot(E.ptsX[k2]-cx,E.ptsY[k2]-cy);
      c.strokeStyle='rgba(5,5,6,'+(.55*seam)+')'; c.beginPath(); c.moveTo(cx+Math.cos(tr.a)*R*.1, cy+Math.sin(tr.a)*R*.1); c.lineTo(cx+Math.cos(tr.a)*ro2, cy+Math.sin(tr.a)*ro2); c.stroke();
      c.strokeStyle='rgba(242,242,239,'+(.10*seam)+')'; c.beginPath(); c.moveTo(cx+Math.cos(tr.a)*R*.1+1.2*PX, cy+Math.sin(tr.a)*R*.1); c.lineTo(cx+Math.cos(tr.a)*ro2+1.2*PX, cy+Math.sin(tr.a)*ro2); c.stroke(); } }
    /* ruby dye: inside the fluid body only, a front travelling outward along each tributary */
    if(E.dyeHeat>.01){ var head=E.dye; for(var d=0;d<5;d++){ var tr2=E.trib[d], k3=Math.floor(((tr2.a%TAU)+TAU)%TAU/TAU*NS)%NS, ro3=Math.hypot(E.ptsX[k3]-cx,E.ptsY[k3]-cy);
        var hx=cx+Math.cos(tr2.a)*ro3*head*.92, hy=cy+Math.sin(tr2.a)*ro3*head*.92, dg=c.createRadialGradient(hx,hy,0,hx,hy,R*.28);
        dg.addColorStop(0,'rgba(150,14,34,'+(.62*E.dyeHeat)+')'); dg.addColorStop(.55,'rgba(120,12,30,'+(.30*E.dyeHeat)+')'); dg.addColorStop(1,'rgba(100,10,26,0)');
        c.fillStyle=dg; c.beginPath(); c.arc(hx,hy,R*.28,0,TAU); c.fill();
        /* the trail behind the head */
        var tg=c.createLinearGradient(cx,cy,hx,hy); tg.addColorStop(0,'rgba(120,12,30,'+(.28*E.dyeHeat)+')'); tg.addColorStop(1,'rgba(140,14,32,'+(.40*E.dyeHeat)+')');
        c.strokeStyle=tg; c.lineWidth=R*.12; c.lineCap='round'; c.beginPath(); c.moveTo(cx+Math.cos(tr2.a)*R*.2, cy+Math.sin(tr2.a)*R*.2); c.lineTo(hx,hy); c.stroke(); } }
    /* grain — small, stable */
    c.restore();
    /* 3 — the pupil / core: deep, never media; part of the material (inner contour) */
    var pupA = rec>=0 ? sstep(.60,.80,rec) : (to===4 ? 1-sstep(.05,.3,p.morph) : 1);
    if(pupA>.01){ c.save(); c.globalAlpha=a*pupA; c.beginPath(); for(var q=0;q<NS;q++){ q?c.lineTo(E.inX[q],E.inY[q]):c.moveTo(E.inX[q],E.inY[q]); } c.closePath();
      var pg=c.createRadialGradient(cx,cy,0,cx,cy,Math.max(2,E.Ri[0]*R*1.2)); pg.addColorStop(0,'#000'); pg.addColorStop(.8,'#000'); pg.addColorStop(1,'#07070a'); c.fillStyle=pg; c.fill();
      c.strokeStyle='rgba(0,0,0,.9)'; c.lineWidth=1.4*PX; c.stroke(); c.restore(); }
    /* 4 — limbus: a dark, soft rim on the outer contour (closes last in REVEAL) */
    var limA = rec>=0 ? sstep(.74,.90,rec) : (to===4 ? 1-sstep(.05,.35,p.morph) : (from===4&&to===4?0:1));
    if(limA>.01){ c.save(); c.globalAlpha=a*limA; c.beginPath(); for(var q2=0;q2<NS;q2++){ q2?c.lineTo(E.ptsX[q2],E.ptsY[q2]):c.moveTo(E.ptsX[q2],E.ptsY[q2]); } c.closePath();
      c.strokeStyle='rgba(5,5,6,.85)'; c.lineWidth=R*.06; c.stroke();
      /* wet edge: 1–2px refraction line just inside the rim */
      c.strokeStyle='rgba(242,242,239,.10)'; c.lineWidth=1.2*PX; c.stroke(); c.restore(); }
    /* 4b — the aperture boundary carries a 1px wet edge while the media shows through it */
    var apE = (to===4) ? sstep(.05,.3,p.morph) : (from===4&&to===5 ? 1-sstep(.7,1,p.morph) : (from===4&&to===4?1:0));
    if(apE>.01){ c.save(); c.globalAlpha=a*apE; c.beginPath(); for(var q3=0;q3<NS;q3++){ q3?c.lineTo(E.inX[q3],E.inY[q3]):c.moveTo(E.inX[q3],E.inY[q3]); } c.closePath();
      c.strokeStyle='rgba(5,5,6,.75)'; c.lineWidth=3*PX; c.stroke(); c.strokeStyle='rgba(242,242,239,.16)'; c.lineWidth=1.2*PX; c.stroke(); c.restore(); }
    /* 5 — glint: on the surface, at a local radius/normal, attached to the body that owns it */
    var glA = rec>=0 ? sstep(.88,1,rec) : (to===4 ? 1-sstep(0,.25,p.morph) : (from===4&&to===4?0:1));
    if(glA>.01 && p.glint!==false){ var ga=-2.3, gk=Math.floor(((ga%TAU)+TAU)%TAU/TAU*NS)%NS, gro=Math.hypot(E.ptsX[gk]-cx,E.ptsY[gk]-cy), gri=Math.hypot(E.inX[gk]-cx,E.inY[gk]-cy);
      var gr=gri+(gro-gri)*.42; var gx=cx+Math.cos(ga)*gr, gy=cy+Math.sin(ga)*gr;
      c.save(); c.globalAlpha=a*glA*.55; c.beginPath(); c.ellipse(gx,gy,R*.05,R*.028,-.7,0,TAU); c.fillStyle='#F2F2EF'; c.fill(); c.restore(); }
    c.restore();
    E.diag.renderMs=performance.now()-t0; E.diag.frames++;
  }
};
root.IrisPhaseEngine=API;
})(typeof window!=='undefined'?window:this);
