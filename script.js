(function(){
  const IS_MOBILE = matchMedia('(max-width: 420px)').matches;
  const IS_ULTRA_SMALL = matchMedia('(max-width: 360px)').matches;
  const MAX_DPR = IS_MOBILE ? 1.25 : 2;
  const dpr = Math.min(MAX_DPR, Math.max(1, window.devicePixelRatio||1));
  const PARTICLE_COUNT = IS_ULTRA_SMALL ? 40 : (IS_MOBILE ? 60 : 140);
  const RING_POINTS = IS_ULTRA_SMALL ? 40 : (IS_MOBILE ? 60 : 90);
  const GRID_STEP = IS_MOBILE ? 44 : 40;
  const TWO = Math.PI*2;

  const bg   = document.getElementById('bg');
  const orb  = document.getElementById('orb');
  const grid = document.getElementById('grid');

  function resizeCanvas(c){
    const w = innerWidth, h = innerHeight;
    c.width = Math.round(w*dpr); c.height = Math.round(h*dpr);
    c.style.width = w+'px'; c.style.height = h+'px';
    const ctx = c.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
    return ctx;
  }
  let bctx, octx, gctx;
  function resizeAll(){
    if(bg)  bctx = resizeCanvas(bg);
    if(orb) octx = resizeCanvas(orb);
    if(grid)gctx = resizeCanvas(grid);
  }
  addEventListener('resize', resizeAll, {passive:true}); resizeAll();

  const particles = Array.from({length: PARTICLE_COUNT}, ()=> ({
    x: Math.random()*innerWidth, y: Math.random()*innerHeight,
    vx: (Math.random()*1.1-0.55), vy: (Math.random()*1.1-0.55),
    r: Math.random()*1.2+0.6
  }));

  let t=0, rafId=null, hidden=false;
  function draw(){
    if(hidden) return;
    t += 0.016;

    if(bctx){
      bctx.clearRect(0,0,innerWidth,innerHeight);
      for(const p of particles){
        p.x += p.vx; p.y += p.vy;
        if(p.x<0||p.x>innerWidth) p.vx*=-1;
        if(p.y<0||p.y>innerHeight) p.vy*=-1;
        bctx.beginPath(); bctx.arc(p.x,p.y,p.r,0,TWO);
        const g=bctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6);
        g.addColorStop(0,'rgba(125,211,252,.8)'); g.addColorStop(1,'rgba(167,139,250,0)');
        bctx.fillStyle=g; bctx.fill();
      }
    }

    if(octx){
      octx.clearRect(0,0,innerWidth,innerHeight);
      const cx=innerWidth/2, cy=innerHeight*0.28;
      const R1=Math.min(innerWidth,innerHeight)*0.14; const R2=R1*1.25;
      octx.globalCompositeOperation='lighter';
      for(let k=0;k<RING_POINTS;k++){
        const a=t*0.8+k*0.07; const r=R1+Math.sin(a*1.7)*6;
        const x=cx+Math.cos(a)*r*1.1; const y=cy+Math.sin(a)*r*0.7;
        const g=octx.createRadialGradient(x,y,0,x,y,10);
        g.addColorStop(0,'rgba(167,139,250,.9)'); g.addColorStop(1,'rgba(167,139,250,0)');
        octx.fillStyle=g; octx.beginPath(); octx.arc(x,y,3,0,TWO); octx.fill();
      }
      for(let k=0;k<RING_POINTS;k++){
        const a=-t*0.9+k*0.07; const r=R2+Math.cos(a*1.3)*6;
        const x=cx+Math.cos(a)*r*1.15; const y=cy+Math.sin(a)*r*0.75;
        const g=octx.createRadialGradient(x,y,0,x,y,10);
        g.addColorStop(0,'rgba(125,211,252,.9)'); g.addColorStop(1,'rgba(125,211,252,0)');
        octx.fillStyle=g; octx.beginPath(); octx.arc(x,y,2.6,0,TWO); octx.fill();
      }
      octx.globalCompositeOperation='source-over';
    }

    if(gctx){
      gctx.clearRect(0,0,innerWidth,innerHeight);
      gctx.strokeStyle='rgba(255,255,255,.06)';
      for(let x=0;x<innerWidth;x+=GRID_STEP){ gctx.beginPath(); gctx.moveTo(x,0); gctx.lineTo(x,innerHeight); gctx.stroke(); }
      for(let y=0;y<innerHeight;y+=GRID_STEP){ gctx.beginPath(); gctx.moveTo(0,y); gctx.lineTo(innerWidth,y); gctx.stroke(); }
      const cx=innerWidth/2, cy=innerHeight*0.28;
      const r=(Math.sin(t*1.7)*0.5+0.5)*72+56;
      gctx.beginPath(); gctx.arc(cx,cy,r,0,TWO);
      gctx.strokeStyle='rgba(255,255,255,.12)'; gctx.lineWidth=1.4; gctx.stroke();
    }

    rafId = requestAnimationFrame(draw);
  }
  function start(){ if(!rafId){ rafId = requestAnimationFrame(draw); } }
  function stop(){ if(rafId){ cancelAnimationFrame(rafId); rafId=null; } }
  document.addEventListener('visibilitychange', () => { hidden = document.hidden; if(hidden) stop(); else start(); });
  start();

  const io = new IntersectionObserver(ents=>{ for(const e of ents){ if(e.isIntersecting) e.target.classList.add('_on'); } },{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  const rc = document.getElementById('radar');
  if(rc){
    const ctx = rc.getContext('2d'); const inputs = Array.from(document.querySelectorAll('input[name^="c"]'));
    const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)); const TWO=Math.PI*2;
    function vals(){ return inputs.map(i=> clamp((+i.value||0)/100,0,1)); }
    function drawRadar(v){
      const W=rc.width, H=rc.height, cx=W/2, cy=H/2, R=Math.min(W,H)*.38, N=8;
      ctx.clearRect(0,0,W,H);
      for(let ring=1; ring<=5; ring++){ const r=R*ring/5; ctx.beginPath();
        for(let i=0;i<N;i++){ const a=-Math.PI/2+i*(TWO/N); const x=cx+Math.cos(a)*r; const y=cy+Math.sin(a)*r; i?ctx.lineTo(x,y):ctx.moveTo(x,y); }
        ctx.closePath(); ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.stroke(); }
      for(let i=0;i<N;i++){ const a=-Math.PI/2+i*(TWO/N); const x=cx+Math.cos(a)*R; const y=cy+Math.sin(a)*R;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y); ctx.strokeStyle='rgba(255,255,255,.1)'; ctx.stroke(); }
      ctx.beginPath();
      for(let i=0;i<N;i++){ const a=-Math.PI/2+i*(TWO/N); const r=R*v[i]; const x=cx+Math.cos(a)*r; const y=cy+Math.sin(a)*r;
        i?ctx.lineTo(x,y):ctx.moveTo(x,y); }
      ctx.closePath();
      const grad=ctx.createLinearGradient(0,0,W,H);
      grad.addColorStop(0,'rgba(125,211,252,.35)'); grad.addColorStop(1,'rgba(167,139,250,.35)');
      ctx.fillStyle=grad; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle='rgba(167,139,250,.85)'; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy,3,0,TWO); ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fill();
    }
    inputs.forEach(i=> i.addEventListener('input', ()=> drawRadar(vals())));
    const rnd=document.getElementById('rnd'); const exp=document.getElementById('exp');
    if(rnd) rnd.addEventListener('click', ()=>{ inputs.forEach(i=> i.value = Math.round(Math.random()*35+55)); drawRadar(vals()); });
    if(exp) exp.addEventListener('click', ()=>{
      const names=['Cognitive','Emotional','Creative','Strategic','Ethical','Systemic','SelfInsight','Resilience'];
      const v = vals(); const data = Object.fromEntries(names.map((n,i)=>[n, Number(v[i].toFixed(3))]));
      data['LQ_comp']= Number((Object.values(data).reduce((a,b)=>a+b,0)/8).toFixed(3));
      const blob = new Blob([JSON.stringify({timestamp:new Date().toISOString(), data}, null, 2)], {type:'application/json'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ethrion_lq_quick_assess.json'; a.click(); URL.revokeObjectURL(a.href);
    });
    drawRadar(vals());
  }
})();