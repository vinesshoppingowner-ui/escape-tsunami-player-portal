import { rand, scaleCount, glowSprite, TAU } from './util';

// Blizzard-lite: glowing flakes in 3 depths, swirling wind gusts and blurry foreground bokeh flakes
export default function createSnow() {
  const sprite = glowSprite('255,255,255', 64);
  let W = 0, H = 0, flakes = [];

  const newFlake = (y) => {
    const z = rand(0.2, 1);
    const bokeh = Math.random() < 0.05;
    return {
      x: rand(0, W), y, z, bokeh,
      r: bokeh ? rand(16, 30) : 0.8 + z * 3.4,
      v: bokeh ? rand(45, 75) : 15 + 60 * z,
      phase: rand(0, TAU), amp: rand(10, 45) * z, freq: rand(0.4, 1.3),
    };
  };

  return {
    resize(w, h) { W = w; H = h; flakes = Array.from({ length: scaleCount(260, w, h) }, () => newFlake(rand(-20, h))).sort((a, b) => a.z - b.z); },
    draw(ctx, w, h, t, dt) {
      const fog = ctx.createLinearGradient(0, h * 0.5, 0, h);
      fog.addColorStop(0, 'rgba(200,225,255,0)');
      fog.addColorStop(1, 'rgba(200,225,255,0.08)');
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, w, h);

      const wind = Math.sin(t * 0.15) * 45 + Math.sin(t * 0.53) * 18 + Math.max(0, Math.sin(t * 0.09)) ** 10 * 160;
      for (const f of flakes) {
        f.y += f.v * dt;
        f.x += (wind * (f.bokeh ? 1.2 : f.z) + Math.cos(t * f.freq + f.phase) * f.amp) * dt;
        if (f.x > W + 40) f.x = -40; else if (f.x < -40) f.x = W + 40;
        if (f.y > H + 40) Object.assign(f, newFlake(-30));
        const s = f.r * 4;
        ctx.globalAlpha = f.bokeh ? 0.1 : 0.3 + 0.65 * f.z;
        ctx.drawImage(sprite, f.x - s / 2, f.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    },
  };
}