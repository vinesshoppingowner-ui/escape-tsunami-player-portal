import { rand, scaleCount, TAU } from './util';

// Deep ocean: swaying light shafts from the surface, glassy wobbling bubbles that pop
export default function createBubbles() {
  let W = 0, H = 0, bubbles = [], pops = [];

  const make = (y) => {
    const r = rand(3, 22);
    return { x: rand(0, W), y, r, v: rand(30, 70) * (0.5 + r / 22), phase: rand(0, TAU), wob: rand(8, 26), popAt: rand(-0.1, 0.35) * H };
  };

  return {
    resize(w, h) { W = w; H = h; bubbles = Array.from({ length: scaleCount(60, w, h) }, () => make(rand(0, h + 100))); },
    draw(ctx, w, h, t, dt) {
      const water = ctx.createLinearGradient(0, 0, 0, h);
      water.addColorStop(0, 'rgba(10,70,120,0.3)');
      water.addColorStop(1, 'rgba(2,10,30,0.35)');
      ctx.fillStyle = water;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const x = (w * (i + 0.5)) / 6 + Math.sin(t * 0.25 + i * 1.7) * 70;
        const shaft = ctx.createLinearGradient(0, 0, 0, h);
        shaft.addColorStop(0, `rgba(140,210,255,${0.07 + 0.03 * Math.sin(t * 0.6 + i)})`);
        shaft.addColorStop(1, 'rgba(140,210,255,0)');
        ctx.fillStyle = shaft;
        ctx.beginPath(); ctx.moveTo(x - 25, 0); ctx.lineTo(x + 25, 0); ctx.lineTo(x + 140, h); ctx.lineTo(x - 60, h); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      for (const b of bubbles) {
        b.y -= b.v * dt;
        b.x += Math.cos(t * 1.5 + b.phase) * b.wob * dt;
        if (b.y < b.popAt) { pops.push({ x: b.x, y: b.y, r: b.r, life: 1 }); Object.assign(b, make(H + rand(20, 120))); continue; }
        const body = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r);
        body.addColorStop(0, 'rgba(255,255,255,0.22)');
        body.addColorStop(0.65, 'rgba(150,210,255,0.05)');
        body.addColorStop(1, 'rgba(180,230,255,0.28)');
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(200,235,255,0.45)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = Math.max(1, b.r * 0.12);
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.62, -2.5, -1.6); ctx.stroke();
      }

      pops = pops.filter((p) => {
        p.life -= dt * 3;
        if (p.life <= 0) return false;
        const rr = p.r * (1 + (1 - p.life) * 1.3);
        ctx.strokeStyle = `rgba(210,240,255,${p.life * 0.55})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, TAU); ctx.stroke();
        ctx.fillStyle = `rgba(230,248,255,${p.life * 0.7})`;
        for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * rr * 1.3, p.y + Math.sin(a) * rr * 1.3, 1.1, 0, TAU); ctx.fill(); }
        return true;
      });
    },
  };
}