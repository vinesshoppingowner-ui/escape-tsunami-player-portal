import { rand, pick, scaleCount, glowSprite, TAU } from './util';

const TINTS = ['255,255,255', '200,220,255', '255,230,200', '215,200,255'];
const NEBULA = ['124,58,237', '37,99,235', '219,39,119', '14,165,233'];

// Galaxy: drifting nebula clouds, twinkling colored stars with parallax and shooting stars
export default function createStars() {
  const sprites = Object.fromEntries(TINTS.map((c) => [c, glowSprite(c, 32)]));
  let W = 0, H = 0, stars = [], clouds = [], shooters = [], next = rand(1.5, 4);

  return {
    resize(w, h) {
      W = w; H = h;
      const R = Math.max(w, h);
      stars = Array.from({ length: scaleCount(340, w, h) }, () => ({ x: rand(0, w), y: rand(0, h), z: rand(0.15, 1), tw: rand(0.5, 3), ph: rand(0, TAU), tint: pick(TINTS) }));
      clouds = Array.from({ length: 4 }, (_, i) => ({ x: rand(0, w), y: rand(0, h), r: rand(0.3, 0.55) * R, c: NEBULA[i], vx: rand(-5, 5), vy: rand(-3, 3) }));
    },
    draw(ctx, w, h, t, dt) {
      ctx.globalCompositeOperation = 'lighter';
      for (const c of clouds) {
        c.x += c.vx * dt; c.y += c.vy * dt;
        if (c.x < -c.r || c.x > W + c.r) c.vx *= -1;
        if (c.y < -c.r || c.y > H + c.r) c.vy *= -1;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        g.addColorStop(0, `rgba(${c.c},0.13)`);
        g.addColorStop(1, `rgba(${c.c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      for (const s of stars) {
        s.x += 4 * s.z * dt;
        if (s.x > W + 5) s.x = -5;
        ctx.globalAlpha = (0.25 + 0.75 * s.z) * (0.45 + 0.55 * Math.sin(t * s.tw + s.ph));
        const size = (1 + 2.6 * s.z) * 4;
        ctx.drawImage(sprites[s.tint], s.x - size / 2, s.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      next -= dt;
      if (next <= 0) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        shooters.push({ x: rand(W * 0.1, W * 0.9), y: rand(0, H * 0.4), vx: dir * rand(600, 950), vy: rand(220, 380), life: 1 });
        next = rand(2, 5);
      }
      shooters = shooters.filter((s) => {
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt * 0.9;
        if (s.life <= 0) return false;
        const tx = s.x - s.vx * 0.18, ty = s.y - s.vy * 0.18;
        const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
        g.addColorStop(0, `rgba(255,255,255,${s.life})`);
        g.addColorStop(1, 'rgba(160,190,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.drawImage(sprites[TINTS[0]], s.x - 8, s.y - 8, 16, 16);
        return true;
      });
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}