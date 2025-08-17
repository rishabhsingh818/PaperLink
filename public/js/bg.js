// Animated gradient blobs (liquid glass vibe)
const c = document.getElementById('bg');
if (c) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const ctx = c.getContext('2d');
  let w, h, t = 0;
  const blobs = new Array(6).fill(0).map((_,i)=>({ r: 120+Math.random()*120, x: Math.random(), y: Math.random(), s: 0.4+Math.random()*0.8, hue: 200 + i*30 }));
  function resize(){ w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr; c.style.width = innerWidth+'px'; c.style.height = innerHeight+'px'; ctx.scale(dpr,dpr); }
  addEventListener('resize', resize); resize();
  (function loop(){ t+=0.003; ctx.clearRect(0,0,w,h);
    blobs.forEach((b,i)=>{
      const x = (0.5+0.45*Math.sin(t*(0.6+i*0.1)+i))*innerWidth;
      const y = (0.5+0.45*Math.cos(t*(0.5+i*0.12)+i))*innerHeight;
      const grd = ctx.createRadialGradient(x,y,0,x,y,b.r);
      grd.addColorStop(0, `hsla(${b.hue}, 90%, 60%, .35)`);
      grd.addColorStop(1, 'hsla(0,0%,0%,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(x,y,b.r,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(loop);
  })();
}
