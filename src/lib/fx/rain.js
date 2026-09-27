import { rand, scaleCount } from './util';

const WIND = 0.16;

// Thunderstorm: layered rain with depth, ground splashes, lightning bolts and sky flashes
export default function createRain() {
  let W = 0, H = 0, drops = [], splashes = [], bolt = null, flash = 0, nextBolt = rand(3, 7);

  const newDrop = (y) => {
    const z = rand(0.2, 1);
    return { x: rand(-150, W + 50), y, z, len: 8 + rand(14, 30) * z, v: 350 + rand(900, 1400) * z, ground: H * rand(0.8, 1.02) };
  };

  const makeBolt = () => {
    const pts = [];
    let x = rand(W * 0.15, W * 0.85), y = 0;
    const end = H * rand(0.45, 0.8);
    pts.push([x, y]);
    while (y < end) { y += rand(18, 45); x += rand(-40, 40); pts.push([x, y]); }
    const branch = pts.slice(Math.floor(pts.length / 3), Math.floor(pts.length / 3) + 5).map(([bx, by], i) => [bx + i * rand(10, 25), by + i * 12]);
    return { pts, branch, life: 1 };
  };

  const path = (ctx, pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); };

  return {
    resize(w, h) { W = w; H = h; drops = Array.from({ length: scaleCount(320, w, h) }, () => newDrop(rand(-h, h))); },
    draw(ctx, w, h, t, dt) {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, 'rgba(15,25,45,0.45)');
      sky.addColorStop(1, 'rgba(50,70,100,0.2)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      ctx.lineCap = 'round';
      for (const d of drops) {
        d.y += d.v * dt;
        d.x += d.v * WIND * dt;
        if (d.y > d.ground) {
          if (d.z > 0.55 && splashes.length < 500) {
            for (let i = 0; i < 4; i++) splashes.push({ x: d.x, y: d.ground, vx: rand(-100, 100), vy: -rand(80, 220) * d.z, life: 1, z: d.z });
          }
          Object.assign(d, newDrop(rand(-60, -10)));
          continue;
        }
        ctx.strokeStyle = `rgba(175,200,235,${0.1 + 0.45 * d.z})`;
        ctx.lineWidth = 0.5 + 1.2 * d.z;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * WIND, d.y - d.len);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(190,215,245,0.6)';
      splashes = splashes.filter((s) => {
        s.vy += 900 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt * 2.5;
        if (s.life <= 0) return false;
        ctx.globalAlpha = s.life;
        ctx.beginPath(); ctx.arc(s.x, s.y, 0.6 + 1.1 * s.z, 0, Math.PI * 2); ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;

      nextBolt -= dt;
      if (nextBolt <= 0) { bolt = makeBolt(); flash = 1; nextBolt = rand(6, 14); }
      if (flash > 0) {
        const flicker = flash > 0.6 ? 1 : Math.sin(flash * 30) > 0 ? 0.6 : 0.2;
        ctx.fillStyle = `rgba(200,215,255,${flash * 0.28 * flicker})`;
        ctx.fillRect(0, 0, w, h);
        flash -= dt * 1.3;
      }
      if (bolt) {
        ctx.strokeStyle = `rgba(235,242,255,${bolt.life})`;
        ctx.shadowColor = 'rgba(160,190,255,1)';
        ctx.shadowBlur = 25;
        ctx.lineWidth = 2.5; path(ctx, bolt.pts);
        ctx.lineWidth = 1.2; path(ctx, bolt.branch);
        ctx.shadowBlur = 0;
        bolt.life -= dt * 2.2;
        if (bolt.life <= 0) bolt = null;
      }
    },
  };
}