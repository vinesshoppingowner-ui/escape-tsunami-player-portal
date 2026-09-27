import { rand, pick, scaleCount, TAU } from './util';

const LEAF_COLORS = [['#e8590c', '#ffa94d'], ['#c92a2a', '#ff8787'], ['#f59f00', '#ffe066'], ['#8b4513', '#d9480f'], ['#d9480f', '#fcc419']];
const PETAL_COLORS = [['#f783ac', '#ffdeeb'], ['#faa2c1', '#fff0f6'], ['#e64980', '#fcc2d7']];

function leafPath(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.9, -s * 0.5, s * 0.6, s * 0.6, 0, s);
  ctx.bezierCurveTo(-s * 0.6, s * 0.6, -s * 0.9, -s * 0.5, 0, -s);
}

function petalPath(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.bezierCurveTo(s * 0.9, s * 0.3, s * 0.6, -s * 0.8, s * 0.18, -s);
  ctx.lineTo(0, -s * 0.72);
  ctx.lineTo(-s * 0.18, -s);
  ctx.bezierCurveTo(-s * 0.6, -s * 0.8, -s * 0.9, s * 0.3, 0, s);
}

// Falling leaves / cherry petals that tumble in 3D, spin and get carried by wind gusts
export default function createFlutter(kind = 'leaves') {
  const petals = kind === 'petals';
  let W = 0, H = 0, items = [];

  const make = (y) => {
    const z = rand(0.35, 1);
    const [c1, c2] = pick(petals ? PETAL_COLORS : LEAF_COLORS);
    return {
      x: rand(-100, W), y, z, c1, c2,
      s: (petals ? rand(5, 9) : rand(9, 17)) * z + 3,
      v: (petals ? rand(30, 60) : rand(45, 90)) * z + 15,
      rot: rand(0, TAU), vr: rand(-1.8, 1.8), flip: rand(0, TAU), vf: rand(1.5, 4.5),
      phase: rand(0, TAU), amp: rand(30, 80),
    };
  };

  return {
    resize(w, h) { W = w; H = h; items = Array.from({ length: scaleCount(petals ? 75 : 50, w, h) }, () => make(rand(-50, h))).sort((a, b) => a.z - b.z); },
    draw(ctx, w, h, t, dt) {
      const amb = ctx.createLinearGradient(0, 0, 0, h);
      amb.addColorStop(0, 'rgba(0,0,0,0)');
      amb.addColorStop(1, petals ? 'rgba(255,170,210,0.08)' : 'rgba(150,60,10,0.14)');
      ctx.fillStyle = amb;
      ctx.fillRect(0, 0, w, h);

      const wind = 25 + Math.sin(t * 0.2) * 45 + Math.max(0, Math.sin(t * 0.07)) ** 8 * 240;
      for (const it of items) {
        it.y += it.v * dt;
        it.x += (wind * it.z + Math.sin(t * 0.9 + it.phase) * it.amp * 0.6) * dt;
        it.rot += it.vr * dt;
        it.flip += it.vf * dt;
        if (it.y > H + 40 || it.x > W + 80) Object.assign(it, make(rand(-80, -20)));

        const c = Math.cos(it.flip);
        ctx.save();
        ctx.translate(it.x, it.y);
        ctx.rotate(it.rot);
        ctx.scale(Math.sign(c || 1) * Math.max(0.15, Math.abs(c)), 1);
        ctx.globalAlpha = 0.55 + 0.45 * it.z;
        const g = ctx.createLinearGradient(-it.s, -it.s, it.s, it.s);
        g.addColorStop(0, c > 0 ? it.c2 : it.c1);
        g.addColorStop(1, it.c1);
        ctx.fillStyle = g;
        (petals ? petalPath : leafPath)(ctx, it.s);
        ctx.fill();
        if (!petals) {
          ctx.strokeStyle = 'rgba(60,20,0,0.35)';
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(0, -it.s * 0.9); ctx.lineTo(0, it.s * 1.3); ctx.stroke();
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    },
  };
}