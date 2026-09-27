import { rand, scaleCount, glowSprite, TAU } from './util';

// Golden summer evening: glowing sun with rotating light rays, drifting pollen and pulsing fireflies
export default function createSummer() {
  const glow = glowSprite('255,214,102', 64);
  const dust = glowSprite('255,240,200', 32);
  let W = 0, H = 0, flies = [], motes = [];

  return {
    resize(w, h) {
      W = w; H = h;
      flies = Array.from({ length: scaleCount(55, w, h) }, () => ({ x: rand(0, w), y: rand(h * 0.2, h), vx: 0, vy: 0, phase: rand(0, TAU), speed: rand(0.5, 1.6), size: rand(12, 26) }));
      motes = Array.from({ length: scaleCount(90, w, h) }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(1, 2.5), v: rand(4, 14), phase: rand(0, TAU) }));
    },
    draw(ctx, w, h, t, dt) {
      const sx = w * 0.85, sy = h * 0.06, R = Math.max(w, h);
      const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 0.75);
      sun.addColorStop(0, 'rgba(255,205,120,0.32)');
      sun.addColorStop(0.3, 'rgba(255,150,70,0.12)');
      sun.addColorStop(1, 'rgba(255,120,50,0)');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(sx, sy);
      ctx.rotate(t * 0.02);
      for (let i = 0; i < 12; i++) {
        ctx.rotate(TAU / 12);
        ctx.fillStyle = `rgba(255,210,140,${0.02 + 0.018 * Math.sin(t * 0.5 + i)})`;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * 1.3, -50); ctx.lineTo(R * 1.3, 50); ctx.fill();
      }
      ctx.restore();

      ctx.globalCompositeOperation = 'lighter';
      for (const m of motes) {
        m.y -= m.v * dt;
        m.x += Math.sin(t * 0.5 + m.phase) * 10 * dt;
        if (m.y < -10) { m.y = H + 10; m.x = rand(0, W); }
        ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t + m.phase);
        const s = m.r * 6;
        ctx.drawImage(dust, m.x - s / 2, m.y - s / 2, s, s);
      }

      for (const f of flies) {
        f.vx += rand(-1, 1) * 80 * dt;
        f.vy += rand(-1, 1) * 80 * dt;
        const max = 35 * f.speed, sp = Math.hypot(f.vx, f.vy);
        if (sp > max) { f.vx *= max / sp; f.vy *= max / sp; }
        f.x += f.vx * dt; f.y += f.vy * dt;
        if (f.x < -20) f.x = W + 20; else if (f.x > W + 20) f.x = -20;
        if (f.y < H * 0.15) f.vy += 30 * dt; else if (f.y > H + 10) f.y = H * 0.3;
        const pulse = Math.max(0, Math.sin(t * f.speed * 2 + f.phase)) ** 2;
        ctx.globalAlpha = 0.12 + 0.88 * pulse;
        const s = f.size * (0.6 + 0.7 * pulse);
        ctx.drawImage(glow, f.x - s / 2, f.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}